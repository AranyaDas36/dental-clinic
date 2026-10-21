import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { authedAgent, createTestApp, getCsrf } from './test/helpers.js';
import { ServiceModel } from './models/Service.js';

const validService = {
  name: 'Root canal (placeholder)',
  slug: 'placeholder-root-canal',
  shortDescription: 'Demo service listing',
  description: 'Placeholder description for tests',
  category: 'Endodontics',
  priceType: 'fixed' as const,
  price: 8000,
  minPrice: null,
  maxPrice: null,
  currency: 'INR' as const,
  imageMediaId: null,
  isFeatured: false,
  isPublished: false,
  displayOrder: 3,
  seoTitle: null,
  seoDescription: null,
};

describe('Services', () => {
  it('creates, lists, and updates services in admin', async () => {
    const app = createTestApp();
    const { agent } = await authedAgent(app);
    const csrf = await getCsrf(agent);

    const created = await agent
      .post('/api/v1/admin/services')
      .set('x-csrf-token', csrf)
      .send(validService);

    expect(created.status).toBe(201);
    const id = created.body.data.service.id as string;

    const listed = await agent.get('/api/v1/admin/services');
    expect(listed.status).toBe(200);
    expect(listed.body.data.items.some((item: { id: string }) => item.id === id)).toBe(true);

    const csrf2 = await getCsrf(agent);
    const patched = await agent
      .patch(`/api/v1/admin/services/${id}`)
      .set('x-csrf-token', csrf2)
      .send({ isPublished: true, name: 'Root canal (placeholder)' });
    expect(patched.status).toBe(200);
    expect(patched.body.data.service.isPublished).toBe(true);
  });

  it('rejects invalid price combinations', async () => {
    const app = createTestApp();
    const { agent } = await authedAgent(app);
    const csrf = await getCsrf(agent);

    const response = await agent
      .post('/api/v1/admin/services')
      .set('x-csrf-token', csrf)
      .send({
        ...validService,
        slug: 'bad-price',
        priceType: 'range',
        price: 100,
        minPrice: 200,
        maxPrice: 50,
      });

    expect(response.status).toBe(422);
  });

  it('enforces unique slugs', async () => {
    const app = createTestApp();
    const { agent } = await authedAgent(app);
    const csrf = await getCsrf(agent);
    await agent.post('/api/v1/admin/services').set('x-csrf-token', csrf).send(validService);

    const csrf2 = await getCsrf(agent);
    const duplicate = await agent
      .post('/api/v1/admin/services')
      .set('x-csrf-token', csrf2)
      .send({ ...validService, name: 'Copy' });

    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error.code).toBe('SLUG_CONFLICT');
  });

  it('hides unpublished services from public listing', async () => {
    const app = createTestApp();
    await ServiceModel.create({
      ...validService,
      isPublished: false,
    });

    const response = await request(app).get('/api/v1/public/services');
    expect(response.status).toBe(200);
    expect(response.body.data.items).toHaveLength(0);
  });
});
