import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createTestApp } from './test/helpers.js';

describe('API foundation', () => {
  it('responds on health endpoint', async () => {
    const app = createTestApp();
    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('ok');
  });

  it('returns 404 envelope for unknown routes', async () => {
    const app = createTestApp();
    const response = await request(app).get('/api/v1/does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });
});
