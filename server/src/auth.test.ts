import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { authedAgent, createAdmin, createTestApp, getCsrf, loginAs } from './test/helpers.js';
import { getEnv } from './config/env.js';
import { AdminSessionModel } from './models/AdminSession.js';

describe('Authentication', () => {
  it('logs in with valid credentials and returns safe admin profile', async () => {
    const app = createTestApp();
    const { email, password } = await createAdmin();
    const agent = request.agent(app);
    const csrf = await getCsrf(agent);

    const response = await agent
      .post('/api/v1/auth/login')
      .set('x-csrf-token', csrf)
      .send({ email, password });

    expect(response.status).toBe(200);
    expect(response.body.data.admin.email).toBe(email);
    expect(response.body.data.admin.passwordHash).toBeUndefined();
    expect(response.headers['set-cookie']).toBeDefined();
  });

  it('rejects invalid credentials', async () => {
    const app = createTestApp();
    const { email } = await createAdmin();
    const agent = request.agent(app);
    const csrf = await getCsrf(agent);

    const response = await agent
      .post('/api/v1/auth/login')
      .set('x-csrf-token', csrf)
      .send({ email, password: 'WrongPassword1!' });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('rejects disabled administrators', async () => {
    const app = createTestApp();
    const { email, password } = await createAdmin({ isActive: false });
    const agent = request.agent(app);
    const csrf = await getCsrf(agent);

    const response = await agent
      .post('/api/v1/auth/login')
      .set('x-csrf-token', csrf)
      .send({ email, password });

    expect(response.status).toBe(401);
  });

  it('requires password change before admin access', async () => {
    const app = createTestApp();
    const { email, password } = await createAdmin({ mustChangePassword: true });
    const agent = await loginAs(app, email, password);

    const blocked = await agent.get('/api/v1/admin/dashboard');
    expect(blocked.status).toBe(403);
    expect(blocked.body.error.code).toBe('PASSWORD_CHANGE_REQUIRED');

    const csrf = await getCsrf(agent);
    const changed = await agent
      .post('/api/v1/auth/change-password')
      .set('x-csrf-token', csrf)
      .send({
        currentPassword: password,
        newPassword: 'BrandNewPass1!',
      });

    expect(changed.status).toBe(200);
    expect(changed.body.data.admin.mustChangePassword).toBe(false);

    const csrf2 = await getCsrf(agent);
    const dashboard = await agent.get('/api/v1/admin/dashboard').set('x-csrf-token', csrf2);
    expect(dashboard.status).toBe(200);
  });

  it('revokes session on logout', async () => {
    const app = createTestApp();
    const { agent } = await authedAgent(app);
    const csrf = await getCsrf(agent);

    const logout = await agent.post('/api/v1/auth/logout').set('x-csrf-token', csrf);
    expect(logout.status).toBe(200);

    const me = await agent.get('/api/v1/auth/me');
    expect(me.status).toBe(401);
  });

  it('rejects expired sessions', async () => {
    const app = createTestApp();
    const { agent } = await authedAgent(app);
    const env = getEnv();

    await AdminSessionModel.updateMany({}, { expiresAt: new Date(Date.now() - 1000) });

    const me = await agent.get('/api/v1/auth/me');
    expect(me.status).toBe(401);
    expect(me.body.error.code).toBe('SESSION_EXPIRED');

    // Ensure cookie name configuration remains available for assertions.
    expect(env.COOKIE_NAME).toBeTruthy();
  });

  it('blocks unauthorized admin endpoints', async () => {
    const app = createTestApp();
    const response = await request(app).get('/api/v1/admin/dashboard');
    expect(response.status).toBe(401);
  });

  it('blocks admin mutations without CSRF token', async () => {
    const app = createTestApp();
    const { agent } = await authedAgent(app);
    const response = await agent.post('/api/v1/admin/services').send({});
    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('CSRF_INVALID');
  });
});
