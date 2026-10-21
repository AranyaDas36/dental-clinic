import type { NextFunction, Request, Response } from 'express';
import { getEnv } from '../config/env.js';
import { AdminUserModel } from '../models/AdminUser.js';
import { hashToken } from '../utils/crypto.js';
import { touchSession } from '../services/session.service.js';
import { AppError } from './error-handler.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function readSessionToken(req: Request): string | undefined {
  const env = getEnv();
  const cookieToken = req.cookies?.[env.COOKIE_NAME];
  return typeof cookieToken === 'string' && cookieToken.length > 0 ? cookieToken : undefined;
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const token = readSessionToken(req);
    if (!token) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    const session = await touchSession(hashToken(token));
    if (!session) {
      throw new AppError(401, 'SESSION_EXPIRED', 'Session expired. Please sign in again.');
    }

    const user = await AdminUserModel.findById(session.adminUserId);
    if (!user || !user.isActive) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    req.sessionToken = token;
    req.adminUser = {
      id: user._id.toString(),
      email: user.email,
      role: 'admin',
      mustChangePassword: user.mustChangePassword,
    };
    next();
  } catch (error) {
    next(error);
  }
}

export function requirePasswordChanged(req: Request, _res: Response, next: NextFunction): void {
  if (req.adminUser?.mustChangePassword) {
    next(
      new AppError(
        403,
        'PASSWORD_CHANGE_REQUIRED',
        'Password change required before accessing admin resources',
      ),
    );
    return;
  }
  next();
}

export function requireCsrf(req: Request, _res: Response, next: NextFunction): void {
  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  const env = getEnv();
  const cookieToken = req.cookies?.[env.CSRF_COOKIE_NAME];
  const headerToken = req.get('x-csrf-token');

  if (
    typeof cookieToken !== 'string' ||
    typeof headerToken !== 'string' ||
    cookieToken.length < 16 ||
    cookieToken !== headerToken
  ) {
    next(new AppError(403, 'CSRF_INVALID', 'Invalid CSRF token'));
    return;
  }

  next();
}
