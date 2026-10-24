import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { createDefaultWebsiteSnapshot, DEFAULT_CLINIC } from '@dental/shared';
import { getEnv, loadEnv } from './config/env.js';
import { MediaAssetModel } from './models/MediaAsset.js';
import { authedAgent, createTestApp, getCsrf } from './test/helpers.js';

const cloudinaryMock = vi.hoisted(() => ({
  config: vi.fn(),
  uploadStream: vi.fn(),
  destroy: vi.fn(),
}));

vi.mock('cloudinary', () => ({
  v2: {
    config: cloudinaryMock.config,
    uploader: {
      upload_stream: cloudinaryMock.uploadStream,
      destroy: cloudinaryMock.destroy,
    },
  },
}));

describe('production media workflow', () => {
  beforeEach(() => {
    const env = getEnv();
    loadEnv({
      ...process.env,
      NODE_ENV: 'test',
      MONGODB_URI: env.MONGODB_URI,
      CORS_ORIGIN: env.CORS_ORIGIN,
      CLOUDINARY_CLOUD_NAME: 'test-cloud',
      CLOUDINARY_API_KEY: 'test-key',
      CLOUDINARY_API_SECRET: 'test-secret',
    });

    cloudinaryMock.uploadStream.mockImplementation((_options, callback) => ({
      end: () =>
        callback(null, {
          asset_id: 'test-asset-id',
          public_id: 'dental-clinic/test-image',
          secure_url: 'https://res.cloudinary.com/test-cloud/image/upload/test-image.png',
          format: 'png',
          width: 100,
          height: 100,
          bytes: 68,
        }),
    }));
  });

  it('persists an uploaded image and renders it through the published public API', async () => {
    const app = createTestApp();
    const { agent } = await authedAgent(app);
    const csrf = await getCsrf(agent);
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      'base64',
    );

    const uploaded = await agent
      .post('/api/v1/admin/media/upload')
      .set('x-csrf-token', csrf)
      .field('altText', 'Clinic reception')
      .attach('file', png, { filename: 'clinic.png', contentType: 'image/png' });

    expect(uploaded.status).toBe(201);
    const media = uploaded.body.data.media as { id: string; secureUrl: string };
    expect(media.secureUrl).toBe(
      'https://res.cloudinary.com/test-cloud/image/upload/test-image.png',
    );
    expect(
      await MediaAssetModel.exists({ _id: media.id, publicId: 'dental-clinic/test-image' }),
    ).toBeTruthy();

    const draftResponse = await agent.get('/api/v1/admin/website/draft');
    const clinic = {
      ...DEFAULT_CLINIC,
      name: 'Test Dental Clinic',
      dentist: { ...DEFAULT_CLINIC.dentist, portraitMediaId: media.id },
      contact: {
        ...DEFAULT_CLINIC.contact,
        phone: '+91 98765 43210',
        email: 'clinic@example.in',
        postalCode: '741223',
      },
    };
    const draft = createDefaultWebsiteSnapshot();

    const saved = await agent.put('/api/v1/admin/website/draft').set('x-csrf-token', csrf).send({
      expectedDraftVersion: draftResponse.body.data.draftVersion,
      clinic,
      draft,
    });
    expect(saved.status).toBe(200);

    const published = await agent
      .post('/api/v1/admin/website/publish')
      .set('x-csrf-token', csrf)
      .send({ expectedDraftVersion: saved.body.data.draftVersion });
    expect(published.status, JSON.stringify(published.body)).toBe(200);

    const publicWebsite = await request(app).get('/api/v1/public/website');
    expect(publicWebsite.status).toBe(200);
    expect(publicWebsite.body.data.media[media.id]).toEqual({
      url: media.secureUrl,
      altText: 'Clinic reception',
      caption: '',
    });
    expect(publicWebsite.body.data.clinic.dentist.portraitMediaId).toBe(media.id);

    const currentDraft = await agent.get('/api/v1/admin/website/draft');
    const unreferenced = await agent
      .put('/api/v1/admin/website/draft')
      .set('x-csrf-token', csrf)
      .send({
        expectedDraftVersion: currentDraft.body.data.draftVersion,
        clinic: { ...clinic, dentist: { ...clinic.dentist, portraitMediaId: null } },
        draft: createDefaultWebsiteSnapshot(),
      });
    expect(unreferenced.status).toBe(200);

    const deletion = await agent
      .delete(`/api/v1/admin/media/${media.id}`)
      .set('x-csrf-token', csrf);
    expect(deletion.status).toBe(409);
    expect(deletion.body.error.code).toBe('MEDIA_IN_USE');
  });
});
