import 'dotenv/config';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(import.meta.dirname, '../../../.env') });
import { changePasswordSchema } from '@dental/shared';
import { loadEnvForBoot } from '../config/env.js';
import { connectDatabase, disconnectDatabase } from '../config/db.js';
import { AdminUserModel } from '../models/AdminUser.js';
import { hashPassword } from '../utils/password.js';
import { logger } from '../utils/logger.js';
import { revokeAllSessionsForUser } from '../services/session.service.js';

async function main() {
  const env = loadEnvForBoot();

  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD before running seed:admin');
  }

  const passwordCheck = changePasswordSchema.shape.newPassword.safeParse(env.ADMIN_PASSWORD);
  if (!passwordCheck.success) {
    throw new Error(
      `ADMIN_PASSWORD does not meet policy: ${passwordCheck.error.issues.map((i) => i.message).join(', ')}`,
    );
  }

  await connectDatabase();

  const email = env.ADMIN_EMAIL.trim().toLowerCase();
  const passwordHash = await hashPassword(env.ADMIN_PASSWORD);

  const existing = await AdminUserModel.findOne({ email }).select('+passwordHash');
  if (existing) {
    existing.passwordHash = passwordHash;
    existing.isActive = true;
    existing.mustChangePassword = true;
    existing.passwordChangedAt = null;
    await existing.save();
    await revokeAllSessionsForUser(existing._id.toString());
    logger.info({ email }, 'Updated existing administrator (mustChangePassword=true)');
  } else {
    await AdminUserModel.create({
      email,
      passwordHash,
      role: 'admin',
      isActive: true,
      mustChangePassword: true,
      lastLoginAt: null,
      passwordChangedAt: null,
    });
    logger.info({ email }, 'Created administrator (mustChangePassword=true)');
  }

  await disconnectDatabase();
}

main().catch(async (error) => {
  logger.fatal({ err: error }, 'seed:admin failed');
  try {
    await disconnectDatabase();
  } catch {
    // ignore
  }
  process.exit(1);
});
