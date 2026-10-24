import { z } from 'zod';

const clientEnvSchema = z.object({
  VITE_API_BASE_URL: z.union([z.string().url(), z.literal('/api/v1')]).default('/api/v1'),
});

export const clientEnv = clientEnvSchema.parse({
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
});
