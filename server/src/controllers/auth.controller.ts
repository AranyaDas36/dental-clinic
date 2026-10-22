import type { Request, Response } from 'express';
import { changePasswordSchema, loginSchema } from '@dental/shared';
import {
  changeAdminPassword,
  getAdminById,
  loginAdmin,
  logoutAdmin,
} from '../services/auth.service.js';
import { readSessionToken } from '../middleware/auth.js';
import { clearSessionCookie, setCsrfCookie, setSessionCookie } from '../utils/cookies.js';
import { sendSuccess } from '../utils/api-response.js';
import { AppError } from '../middleware/error-handler.js';

export async function login(req: Request, res: Response): Promise<void> {
  const input = loginSchema.parse(req.body);
  const result = await loginAdmin(input);
  setSessionCookie(res, result.sessionToken, result.expiresAt);
  const csrfToken = setCsrfCookie(res);
  sendSuccess(res, { admin: result.admin, csrfToken });
}

export async function logout(req: Request, res: Response): Promise<void> {
  await logoutAdmin(readSessionToken(req));
  clearSessionCookie(res);
  const csrfToken = setCsrfCookie(res);
  sendSuccess(res, { ok: true, csrfToken });
}

export async function me(req: Request, res: Response): Promise<void> {
  if (!req.adminUser) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }
  const admin = await getAdminById(req.adminUser.id);
  sendSuccess(res, { admin });
}

export async function changePassword(req: Request, res: Response): Promise<void> {
  if (!req.adminUser || !req.sessionToken) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }
  const input = changePasswordSchema.parse(req.body);
  const result = await changeAdminPassword(req.adminUser.id, input, req.sessionToken);
  setSessionCookie(res, result.sessionToken, result.expiresAt);
  const csrfToken = setCsrfCookie(res);
  sendSuccess(res, { admin: result.admin, csrfToken });
}

export async function csrf(_req: Request, res: Response): Promise<void> {
  const token = setCsrfCookie(res);
  sendSuccess(res, { csrfToken: token });
}
