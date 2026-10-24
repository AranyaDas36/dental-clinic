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

  it.each([
    {
      name: 'Fixed price',
      slug: 'fixed-price-service',
      priceType: 'fixed' as const,
      price: 2000,
      minPrice: null,
      maxPrice: null,
    },
    {
      name: 'Range price',
      slug: 'range-price-service',
      priceType: 'range' as const,
      price: null,
      minPrice: 1000,
      maxPrice: 2000,
    },
    {
      name: 'Price on request',
      slug: 'on-request-service',
      priceType: 'quote' as const,
      price: null,
      minPrice: null,
      maxPrice: null,
    },
  ])('persists and publicly returns $priceType pricing', async (pricing) => {
    const app = createTestApp();
    const { agent } = await authedAgent(app);
    const csrf = await getCsrf(agent);

    const response = await agent
      .post('/api/v1/admin/services')
      .set('x-csrf-token', csrf)
      .send({
        ...validService,
        ...pricing,
        isPublished: true,
      });

    expect(response.status).toBe(201);
    const stored = await ServiceModel.findOne({ slug: pricing.slug }).lean();
    expect(stored?.priceType).toBe(pricing.priceType);
    expect(stored?.price).toBe(pricing.price);
    expect(stored?.minPrice).toBe(pricing.minPrice);
    expect(stored?.maxPrice).toBe(pricing.maxPrice);

    const publicResponse = await request(app).get('/api/v1/public/services');
    const publicService = publicResponse.body.data.items.find(
      (item: { slug: string }) => item.slug === pricing.slug,
    );
    expect(publicResponse.status).toBe(200);
    expect(publicService.priceType).toBe(pricing.priceType);
    expect(publicService.price).toBe(pricing.price);
    expect(publicService.minPrice).toBe(pricing.minPrice);
    expect(publicService.maxPrice).toBe(pricing.maxPrice);
    expect(publicService.imageUrl).toBeNull();
  });

  it.each([-1, '1000', 'not-a-price'])('rejects invalid fixed price %s', async (price) => {
    const app = createTestApp();
    const { agent } = await authedAgent(app);
    const csrf = await getCsrf(agent);

    const response = await agent
      .post('/api/v1/admin/services')
      .set('x-csrf-token', csrf)
      .send({
        ...validService,
        slug: `invalid-price-${String(price).replaceAll(/[^a-z0-9]/gi, '-')}`,
        price,
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
