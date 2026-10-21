import type { Response } from 'express';
import { getEnv } from '../config/env.js';
import { generateOpaqueToken } from './crypto.js';

/** In production (HTTPS), cookies must be sameSite='none' for cross-origin requests
 *  (frontend on Vercel, backend on Render). In dev, 'lax' is fine. */
function getSameSite(secure: boolean): 'none' | 'lax' {
  return secure ? 'none' : 'lax';
}

export function setSessionCookie(res: Response, token: string, expiresAt: Date): void {
  const env = getEnv();
  res.cookie(env.COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: getSameSite(env.COOKIE_SECURE),
    expires: expiresAt,
    path: '/',
  });
}

export function clearSessionCookie(res: Response): void {
  const env = getEnv();
  res.clearCookie(env.COOKIE_NAME, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: getSameSite(env.COOKIE_SECURE),
    path: '/',
  });
}

export function setCsrfCookie(res: Response): string {
  const env = getEnv();
  const token = generateOpaqueToken(24);
  res.cookie(env.CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    secure: env.COOKIE_SECURE,
    sameSite: getSameSite(env.COOKIE_SECURE),
    path: '/',
  });
  return token;
}
