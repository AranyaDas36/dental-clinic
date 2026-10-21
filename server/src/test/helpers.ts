import request from 'supertest';
import type { Express } from 'express';
import { createApp } from '../app.js';
import { AdminUserModel } from '../models/AdminUser.js';
import { hashPassword } from '../utils/password.js';
import { getEnv } from '../config/env.js';

export function createTestApp(): Express {
  return createApp();
}

export async function createAdmin(options?: {
  email?: string;
  password?: string;
  isActive?: boolean;
  mustChangePassword?: boolean;
}) {
  const email = options?.email ?? 'admin@example.com';
  const password = options?.password ?? 'ChangeMeNow1!';
  const user = await AdminUserModel.create({
    email,
    passwordHash: await hashPassword(password),
    role: 'admin',
    isActive: options?.isActive ?? true,
    mustChangePassword: options?.mustChangePassword ?? false,
    lastLoginAt: null,
    passwordChangedAt: null,
  });
  return { user, email, password };
}

type Agent = ReturnType<typeof request.agent>;

export async function getCsrf(agent: Agent) {
  const env = getEnv();
  const response = await agent.get('/api/v1/auth/csrf');
  const token = response.body.data.csrfToken as string;
  const cookieHeader = response.headers['set-cookie'];
  const cookies = Array.isArray(cookieHeader) ? cookieHeader : cookieHeader ? [cookieHeader] : [];
  const csrfCookie = cookies.find((value) => value.startsWith(`${env.CSRF_COOKIE_NAME}=`));
  if (!csrfCookie) {
    throw new Error('CSRF cookie missing');
  }
  return token;
}

export async function loginAs(app: Express, email: string, password: string): Promise<Agent> {
  const agent = request.agent(app);
  const csrf = await getCsrf(agent);
  const response = await agent
    .post('/api/v1/auth/login')
    .set('x-csrf-token', csrf)
    .send({ email, password });

  if (response.status !== 200) {
    throw new Error(`Login failed: ${response.status} ${JSON.stringify(response.body)}`);
  }
  return agent;
}

export async function authedAgent(
  app: Express,
  options?: Parameters<typeof createAdmin>[0],
): Promise<{ agent: Agent; email: string; password: string }> {
  const { email, password } = await createAdmin(options);
  const agent = await loginAs(app, email, password);
  return { agent, email, password };
}
