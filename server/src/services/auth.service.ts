import { type changePasswordSchema, type loginSchema } from '@dental/shared';
import type { z } from 'zod';
import { AdminUserModel } from '../models/AdminUser.js';
import { AppError } from '../middleware/error-handler.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import {
  createSession,
  revokeAllSessionsForUser,
  revokeSessionByToken,
} from './session.service.js';

type LoginInput = z.infer<typeof loginSchema>;
type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

function toSafeAdmin(user: {
  _id: { toString(): string };
  email: string;
  role: string;
  isActive: boolean;
  mustChangePassword: boolean;
  lastLoginAt?: Date | null;
  passwordChangedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    mustChangePassword: user.mustChangePassword,
    lastLoginAt: user.lastLoginAt ?? null,
    passwordChangedAt: user.passwordChangedAt ?? null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function loginAdmin(input: LoginInput) {
  const email = input.email.trim().toLowerCase();
  const user = await AdminUserModel.findOne({ email }).select('+passwordHash');
  if (!user || !user.isActive) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  const valid = await verifyPassword(user.passwordHash, input.password);
  if (!valid) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  user.lastLoginAt = new Date();
  await user.save();

  const session = await createSession(user._id.toString());
  return {
    admin: toSafeAdmin(user),
    sessionToken: session.token,
    expiresAt: session.expiresAt,
  };
}

export async function logoutAdmin(sessionToken: string | undefined): Promise<void> {
  if (!sessionToken) return;
  await revokeSessionByToken(sessionToken);
}

export async function getAdminById(adminUserId: string) {
  const user = await AdminUserModel.findById(adminUserId);
  if (!user || !user.isActive) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }
  return toSafeAdmin(user);
}

export async function changeAdminPassword(
  adminUserId: string,
  input: ChangePasswordInput,
  currentSessionToken: string,
) {
  const user = await AdminUserModel.findById(adminUserId).select('+passwordHash');
  if (!user || !user.isActive) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const valid = await verifyPassword(user.passwordHash, input.currentPassword);
  if (!valid) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Current password is incorrect');
  }

  // if (input.currentPassword === input.newPassword) {
  //   throw new AppError(422, 'VALIDATION_ERROR', 'New password must be different from current');
  // }

  user.passwordHash = await hashPassword(input.newPassword);
  user.mustChangePassword = false;
  user.passwordChangedAt = new Date();
  await user.save();

  await revokeAllSessionsForUser(adminUserId);
  const session = await createSession(adminUserId);

  // Ensure the just-created session is distinct from the revoked one.
  if (session.token === currentSessionToken) {
    await revokeSessionByToken(session.token);
    const retry = await createSession(adminUserId);
    return { admin: toSafeAdmin(user), sessionToken: retry.token, expiresAt: retry.expiresAt };
  }

  return { admin: toSafeAdmin(user), sessionToken: session.token, expiresAt: session.expiresAt };
}
