import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { authedAgent, createTestApp, getCsrf } from './test/helpers.js';
import { ReviewModel } from './models/Review.js';

describe('Reviews', () => {
  it('starts public submissions as pending', async () => {
    const app = createTestApp();
    const response = await request(app).post('/api/v1/public/reviews').send({
      displayName: 'Visitor',
      rating: 5,
      message: 'This is a placeholder review for automated tests.',
    });

    expect(response.status).toBe(201);
    expect(response.body.data.status).toBe('pending');

    const publicList = await request(app).get('/api/v1/public/reviews');
    expect(publicList.body.data.items).toHaveLength(0);
  });

  it('requires auth to moderate reviews', async () => {
    const app = createTestApp();
    const review = await ReviewModel.create({
      displayName: 'Visitor',
      rating: 4,
      message: 'Needs moderation before appearing publicly.',
      status: 'pending',
    });

    const unauth = await request(app)
      .patch(`/api/v1/admin/reviews/${review._id.toString()}`)
      .send({ status: 'approved' });
    expect(unauth.status).toBe(401);

    const { agent } = await authedAgent(app);
    const csrf = await getCsrf(agent);
    const approved = await agent
      .patch(`/api/v1/admin/reviews/${review._id.toString()}`)
      .set('x-csrf-token', csrf)
      .send({ status: 'approved' });

    expect(approved.status).toBe(200);
    const publicList = await request(app).get('/api/v1/public/reviews');
    expect(publicList.body.data.items).toHaveLength(1);
    expect(publicList.body.data.items[0].moderatedBy).toBeUndefined();
  });
});

describe('Appointments', () => {
  it('creates a request and rejects public listing', async () => {
    const app = createTestApp();
    const created = await request(app).post('/api/v1/public/appointments').send({
      patientName: 'Pat Example',
      phone: '+919876543210',
      message: 'Requesting a check-up',
    });

    expect(created.status).toBe(201);
    expect(created.body.data.status).toBe('pending');
    expect(JSON.stringify(created.body)).not.toContain('adminNotes');

    const publicList = await request(app).get('/api/v1/public/appointments');
    expect(publicList.status).toBe(404);

    const { agent } = await authedAgent(app);
    const list = await agent.get('/api/v1/admin/appointments');
    expect(list.status).toBe(200);
    expect(list.body.data.items).toHaveLength(1);
    expect(list.body.data.items[0].phone).toBe('+919876543210');

    const csrf = await getCsrf(agent);
    const updated = await agent
      .patch(`/api/v1/admin/appointments/${list.body.data.items[0].id}`)
      .set('x-csrf-token', csrf)
      .send({ status: 'contacted', adminNotes: 'Called patient' });

    expect(updated.status).toBe(200);
    expect(updated.body.data.appointment.adminNotes).toBe('Called patient');
  });

  it('validates appointment payload', async () => {
    const app = createTestApp();
    const response = await request(app).post('/api/v1/public/appointments').send({
      patientName: '',
      phone: '1',
    });
    expect(response.status).toBe(422);
  });
});

describe('Media authorization', () => {
  it('rejects unauthenticated uploads and invalid files', async () => {
    const app = createTestApp();
    const unauth = await request(app)
      .post('/api/v1/admin/media/upload')
      .attach('file', Buffer.from('not-an-image'), 'note.txt');
    expect(unauth.status).toBe(401);

    const { agent } = await authedAgent(app);
    const csrf = await getCsrf(agent);
    const invalid = await agent
      .post('/api/v1/admin/media/upload')
      .set('x-csrf-token', csrf)
      .attach('file', Buffer.from('not-an-image'), {
        filename: 'note.txt',
        contentType: 'text/plain',
      });
    expect([422, 400]).toContain(invalid.status);
  });
});
