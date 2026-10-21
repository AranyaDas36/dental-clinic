import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  CORS_ORIGIN: z.string().url(),
  COOKIE_SECURE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  SESSION_ABSOLUTE_TTL_HOURS: z.coerce.number().int().min(1).max(168).default(12),
  SESSION_IDLE_TTL_MINUTES: z.coerce.number().int().min(5).max(1440).default(30),
  COOKIE_NAME: z.string().min(1).default('dental_session'),
  CSRF_COOKIE_NAME: z.string().min(1).default('dental_csrf'),
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),
  CLOUDINARY_FOLDER: z.string().default('dental-clinic'),
  PUBLIC_SITE_URL: z.string().url().optional(),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function loadEnv(env: NodeJS.ProcessEnv = process.env): Env {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid environment configuration: ${details}`);
  }
  cachedEnv = parsed.data;
  return parsed.data;
}

export function getEnv(): Env {
  if (!cachedEnv) {
    return loadEnv();
  }
  return cachedEnv;
}

/** Soft validation for local boot without MongoDB during foundation smoke tests. */
export function loadEnvForBoot(env: NodeJS.ProcessEnv = process.env): Env {
  const withDefaults = {
    MONGODB_URI: env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/dental',
    CORS_ORIGIN: env.CORS_ORIGIN ?? 'http://localhost:5173',
    ...env,
  };
  return loadEnv(withDefaults);
}
