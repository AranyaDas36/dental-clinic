import { getEnv } from '../config/env.js';
import { AdminSessionModel } from '../models/AdminSession.js';
import { generateOpaqueToken, hashToken } from '../utils/crypto.js';

export async function createSession(adminUserId: string): Promise<{
  token: string;
  expiresAt: Date;
}> {
  const env = getEnv();
  const now = new Date();
  const absoluteExpiresAt = new Date(
    now.getTime() + env.SESSION_ABSOLUTE_TTL_HOURS * 60 * 60 * 1000,
  );
  const idleExpiresAt = new Date(now.getTime() + env.SESSION_IDLE_TTL_MINUTES * 60 * 1000);
  const expiresAt = idleExpiresAt < absoluteExpiresAt ? idleExpiresAt : absoluteExpiresAt;

  const token = generateOpaqueToken(32);
  await AdminSessionModel.create({
    tokenHash: hashToken(token),
    adminUserId,
    expiresAt,
    absoluteExpiresAt,
    lastSeenAt: now,
  });

  return { token, expiresAt };
}

export async function touchSession(tokenHash: string): Promise<{
  adminUserId: string;
  expiresAt: Date;
} | null> {
  const env = getEnv();
  const session = await AdminSessionModel.findOne({ tokenHash });
  if (!session) return null;

  const now = new Date();
  if (session.absoluteExpiresAt.getTime() <= now.getTime()) {
    await AdminSessionModel.deleteOne({ _id: session._id });
    return null;
  }
  if (session.expiresAt.getTime() <= now.getTime()) {
    await AdminSessionModel.deleteOne({ _id: session._id });
    return null;
  }

  const nextIdle = new Date(now.getTime() + env.SESSION_IDLE_TTL_MINUTES * 60 * 1000);
  const expiresAt =
    nextIdle.getTime() < session.absoluteExpiresAt.getTime() ? nextIdle : session.absoluteExpiresAt;

  session.lastSeenAt = now;
  session.expiresAt = expiresAt;
  await session.save();

  return { adminUserId: String(session.adminUserId), expiresAt };
}

export async function revokeSessionByToken(token: string): Promise<void> {
  await AdminSessionModel.deleteOne({ tokenHash: hashToken(token) });
}

export async function revokeAllSessionsForUser(adminUserId: string): Promise<void> {
  await AdminSessionModel.deleteMany({ adminUserId });
}
