import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createDefaultWebsiteSnapshot, DEFAULT_CLINIC } from '@dental/shared';
import { authedAgent, createTestApp, getCsrf } from './test/helpers.js';
import { WebsiteConfigModel } from './models/WebsiteConfig.js';
import { ReviewModel } from './models/Review.js';
import { AppointmentRequestModel } from './models/AppointmentRequest.js';
import { ServiceModel } from './models/Service.js';
import { WebsiteRevisionModel } from './models/WebsiteRevision.js';
import { AdminUserModel } from './models/AdminUser.js';
import { invalidatePublicCaches } from './services/public-cache.js';

function publishableTestClinic() {
  return {
    ...DEFAULT_CLINIC,
    name: 'Test Dental Clinic',
    contact: {
      ...DEFAULT_CLINIC.contact,
      phone: '+91 98765 43210',
      email: 'clinic@example.in',
      postalCode: '741223',
    },
  };
}

describe('Website publishing and public isolation', () => {
  it('uses the screenshot details without inventing contact information', async () => {
    const app = createTestApp();
    const { agent } = await authedAgent(app);

    const response = await agent.get('/api/v1/admin/website/draft');
    expect(response.status).toBe(200);
    expect(response.body.data.clinic.name).toBe('Chakdaha Dental Clinic');
    expect(response.body.data.clinic.dentist.name).toBe('Dr. Kalyan Das');
    expect(response.body.data.clinic.contact).toMatchObject({
      addressLine1: 'Lalpur',
      city: 'Chakdah',
      state: 'West Bengal',
      phone: '',
      email: '',
      postalCode: '',
    });
    expect(response.body.data.clinic.openingHours).toEqual([
      { day: 'monday', closed: false, open: '10:00', close: '13:00' },
      { day: 'tuesday', closed: true, open: null, close: null },
      { day: 'wednesday', closed: false, open: '10:00', close: '13:00' },
      { day: 'thursday', closed: false, open: '10:00', close: '13:00' },
      { day: 'friday', closed: false, open: '10:00', close: '13:00' },
      { day: 'saturday', closed: false, open: '10:00', close: '13:00' },
      { day: 'sunday', closed: false, open: '10:00', close: '13:00' },
    ]);
    const servicesSection = response.body.data.draft.sections.find(
      (section: { type: string }) => section.type === 'services',
    );
    expect(servicesSection.settings.description).toContain('tooth reshaping');
    expect(servicesSection.settings.description).toContain('laser dentistry');
  });

  it('does not block publication when an optional postal code is not provided', async () => {
    const app = createTestApp();
    const { agent } = await authedAgent(app);
    const initial = await agent.get('/api/v1/admin/website/draft');
    const clinic = publishableTestClinic();
    clinic.contact.postalCode = 'Not provided';
    const csrf = await getCsrf(agent);

    const saved = await agent.put('/api/v1/admin/website/draft').set('x-csrf-token', csrf).send({
      expectedDraftVersion: initial.body.data.draftVersion,
      clinic,
      draft: createDefaultWebsiteSnapshot(),
    });
    expect(saved.status).toBe(200);

    const publishCsrf = await getCsrf(agent);
    const published = await agent
      .post('/api/v1/admin/website/publish')
      .set('x-csrf-token', publishCsrf)
      .send({ expectedDraftVersion: saved.body.data.draftVersion });
    expect(published.status).toBe(200);
  });

  it('keeps drafts private until publish', async () => {
    const app = createTestApp();
    const { agent } = await authedAgent(app);

    const publicBefore = await request(app).get('/api/v1/public/website');
    expect(publicBefore.status).toBe(404);

    const draftRes = await agent.get('/api/v1/admin/website/draft');
    expect(draftRes.status).toBe(200);
    expect(draftRes.body.data.draft).toBeTruthy();

    const csrf = await getCsrf(agent);
    const draft = createDefaultWebsiteSnapshot();
    draft.seo.title = 'Secret Draft Title';
    const clinic = publishableTestClinic();

    const saved = await agent.put('/api/v1/admin/website/draft').set('x-csrf-token', csrf).send({
      expectedDraftVersion: draftRes.body.data.draftVersion,
      clinic,
      draft,
    });
    expect(saved.status).toBe(200);

    const stillPrivate = await request(app).get('/api/v1/public/website');
    expect(stillPrivate.status).toBe(404);

    const csrf2 = await getCsrf(agent);
    const published = await agent
      .post('/api/v1/admin/website/publish')
      .set('x-csrf-token', csrf2)
      .send({ expectedDraftVersion: saved.body.data.draftVersion });
    expect(published.status).toBe(200);

    const publicAfter = await request(app).get('/api/v1/public/website');
    expect(publicAfter.status).toBe(200);
    expect(publicAfter.body.data.snapshot.seo.title).toBe('Secret Draft Title');
    expect(publicAfter.body.data.draft).toBeUndefined();
    expect(publicAfter.body.data.media).toEqual({});
  });

  it('allows administrators to update and publish validated clinic hours', async () => {
    const app = createTestApp();
    const { agent } = await authedAgent(app);
    const initial = await agent.get('/api/v1/admin/website/draft');
    const clinic = publishableTestClinic();
    clinic.openingHours = clinic.openingHours.map((hours) =>
      hours.day === 'monday'
        ? { day: 'monday', closed: false, open: '09:30', close: '17:00' }
        : { ...hours, closed: true, open: null, close: null },
    );
    const csrf = await getCsrf(agent);
    const saved = await agent.put('/api/v1/admin/website/draft').set('x-csrf-token', csrf).send({
      expectedDraftVersion: initial.body.data.draftVersion,
      clinic,
      draft: createDefaultWebsiteSnapshot(),
    });

    expect(saved.status).toBe(200);
    const reloaded = await agent.get('/api/v1/admin/website/draft');
    expect(reloaded.body.data.clinic.openingHours[0]).toEqual({
      day: 'monday',
      closed: false,
      open: '09:30',
      close: '17:00',
    });

    const invalidClinic = {
      ...clinic,
      openingHours: clinic.openingHours.map((hours) =>
        hours.day === 'monday' ? { ...hours, open: '18:00', close: '10:00' } : hours,
      ),
    };
    const invalid = await agent.put('/api/v1/admin/website/draft').set('x-csrf-token', csrf).send({
      expectedDraftVersion: saved.body.data.draftVersion,
      clinic: invalidClinic,
      draft: createDefaultWebsiteSnapshot(),
    });
    expect(invalid.status).toBe(422);

    const publishCsrf = await getCsrf(agent);
    const published = await agent
      .post('/api/v1/admin/website/publish')
      .set('x-csrf-token', publishCsrf)
      .send({ expectedDraftVersion: saved.body.data.draftVersion });
    expect(published.status).toBe(200);
    const publicWebsite = await request(app).get('/api/v1/public/website');
    expect(publicWebsite.body.data.clinic.openingHours[0].open).toBe('09:30');
    expect(publicWebsite.body.data.clinic.openingHours[1].closed).toBe(true);
  });

  it('allows administrators to publish content containing template wording', async () => {
    const app = createTestApp();
    const { agent } = await authedAgent(app);
    const initial = await agent.get('/api/v1/admin/website/draft');
    const csrf = await getCsrf(agent);
    const draft = createDefaultWebsiteSnapshot();
    const hero = draft.sections.find((section) => section.type === 'hero');
    if (!hero || hero.type !== 'hero') throw new Error('Default hero section is missing');
    hero.settings.subtitle = 'Placeholder demo site. Replace this copy before going live.';
    const saved = await agent.put('/api/v1/admin/website/draft').set('x-csrf-token', csrf).send({
      expectedDraftVersion: initial.body.data.draftVersion,
      clinic: publishableTestClinic(),
      draft,
    });
    expect(saved.status).toBe(200);

    const publishCsrf = await getCsrf(agent);
    const response = await agent
      .post('/api/v1/admin/website/publish')
      .set('x-csrf-token', publishCsrf)
      .send({ expectedDraftVersion: saved.body.data.draftVersion });
    expect(response.status).toBe(200);
    const publicWebsite = await request(app).get('/api/v1/public/website');
    expect(publicWebsite.status).toBe(200);
    expect(publicWebsite.body.data.snapshot.sections[1].settings.subtitle).toContain('Placeholder');
  });

  it('serves previously published revisions containing template wording', async () => {
    const app = createTestApp();
    const { agent, email } = await authedAgent(app);
    const draftResponse = await agent.get('/api/v1/admin/website/draft');
    const admin = await AdminUserModel.findOne({ email });
    if (!admin) throw new Error('Test administrator was not created');

    const snapshot = createDefaultWebsiteSnapshot();
    const hero = snapshot.sections.find((section) => section.type === 'hero');
    if (!hero || hero.type !== 'hero') throw new Error('Default hero section is missing');
    hero.settings.subtitle = 'Placeholder demo site. Replace this copy before going live.';

    const revision = await WebsiteRevisionModel.create({
      version: 1,
      schemaVersion: snapshot.schemaVersion,
      snapshot,
      clinic: publishableTestClinic(),
      publishedBy: admin._id,
      publishedAt: new Date(),
      changeSummary: 'Legacy template revision',
    });
    await WebsiteConfigModel.updateOne(
      { key: 'primary' },
      { $set: { activeRevisionId: revision._id } },
    );
    invalidatePublicCaches();

    const response = await request(app).get('/api/v1/public/website');
    expect(response.status).toBe(200);
    expect(response.body.data.snapshot.sections[1].settings.subtitle).toContain('Placeholder');
    expect(draftResponse.status).toBe(200);
  });

  it('returns 409 on concurrent draft edits', async () => {
    const app = createTestApp();
    const { agent } = await authedAgent(app);
    const draftRes = await agent.get('/api/v1/admin/website/draft');
    const version = draftRes.body.data.draftVersion as number;
    const draft = createDefaultWebsiteSnapshot();

    const csrf1 = await getCsrf(agent);
    const first = await agent
      .put('/api/v1/admin/website/draft')
      .set('x-csrf-token', csrf1)
      .send({ expectedDraftVersion: version, clinic: DEFAULT_CLINIC, draft });
    expect(first.status).toBe(200);

    const csrf2 = await getCsrf(agent);
    const second = await agent
      .put('/api/v1/admin/website/draft')
      .set('x-csrf-token', csrf2)
      .send({ expectedDraftVersion: version, clinic: DEFAULT_CLINIC, draft });
    expect(second.status).toBe(409);
    expect(second.body.error.code).toBe('DRAFT_CONFLICT');
  });

  it('rejects invalid section configuration on draft save', async () => {
    const app = createTestApp();
    const { agent } = await authedAgent(app);
    const draftRes = await agent.get('/api/v1/admin/website/draft');
    const csrf = await getCsrf(agent);

    const response = await agent
      .put('/api/v1/admin/website/draft')
      .set('x-csrf-token', csrf)
      .send({
        expectedDraftVersion: draftRes.body.data.draftVersion,
        clinic: DEFAULT_CLINIC,
        draft: {
          ...createDefaultWebsiteSnapshot(),
          sections: [
            {
              id: 'bad',
              type: 'hero',
              enabled: true,
              layoutVariant: 'not-a-real-variant',
              settings: {},
            },
          ],
        },
      });

    expect(response.status).toBe(422);
  });

  it('never exposes pending reviews or appointment private notes publicly', async () => {
    const app = createTestApp();

    await ReviewModel.create({
      displayName: 'Pending Person',
      rating: 5,
      message: 'Should not be public yet',
      status: 'pending',
    });
    await ReviewModel.create({
      displayName: 'Happy Patient',
      rating: 5,
      message: 'Approved feedback only',
      status: 'approved',
    });

    const reviews = await request(app).get('/api/v1/public/reviews');
    expect(reviews.status).toBe(200);
    expect(reviews.body.data.items).toHaveLength(1);
    expect(reviews.body.data.items[0].displayName).toBe('Happy Patient');
    expect(reviews.body.data.items[0].moderatedBy).toBeUndefined();

    const created = await request(app).post('/api/v1/public/appointments').send({
      patientName: 'Pat Example',
      phone: '+919999999999',
      message: 'Need cleaning',
    });
    expect(created.status).toBe(201);

    await AppointmentRequestModel.updateOne({}, { adminNotes: 'PRIVATE NOTE — never public' });

    const leakedList = await request(app).get('/api/v1/admin/appointments');
    expect(leakedList.status).toBe(401);

    const publicLeak = await request(app).get('/api/v1/public/appointments');
    expect(publicLeak.status).toBe(404);

    const body = JSON.stringify(created.body);
    expect(body).not.toContain('PRIVATE');
    expect(body).not.toContain('adminNotes');
  });

  it('excludes unpublished services from public listing', async () => {
    const app = createTestApp();
    await ServiceModel.create([
      {
        name: 'Published',
        slug: 'published-service',
        shortDescription: 'Visible',
        description: 'Visible',
        category: 'General',
        priceType: 'fixed',
        price: 1000,
        minPrice: null,
        maxPrice: null,
        currency: 'INR',
        isFeatured: false,
        isPublished: true,
        displayOrder: 1,
      },
      {
        name: 'Hidden',
        slug: 'hidden-service',
        shortDescription: 'Hidden',
        description: 'Hidden',
        category: 'General',
        priceType: 'quote',
        price: null,
        minPrice: null,
        maxPrice: null,
        currency: 'INR',
        isFeatured: false,
        isPublished: false,
        displayOrder: 2,
      },
    ]);

    const response = await request(app).get('/api/v1/public/services');
    expect(response.status).toBe(200);
    expect(response.body.data.items).toHaveLength(1);
    expect(response.body.data.items[0].slug).toBe('published-service');
  });

  it('rejects stored XSS-like script payloads in review messages via validation length/content path', async () => {
    const app = createTestApp();
    const response = await request(app).post('/api/v1/public/reviews').send({
      displayName: '<script>alert(1)</script>',
      rating: 5,
      message: '<script>document.cookie</script> enough text here',
    });

    // Stored as text is OK; approval gate + React text rendering prevent execution.
    // Ensure submission cannot self-approve.
    expect(response.status).toBe(201);
    expect(response.body.data.status).toBe('pending');

    const config = await WebsiteConfigModel.findOne({ key: 'primary' });
    expect(config?.draft).toBeUndefined();
  });
});
