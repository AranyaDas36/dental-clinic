import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(200),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z
    .string()
  // .min(12)
  // .max(200)
  // .regex(/[A-Z]/, 'Must include an uppercase letter')
  // .regex(/[a-z]/, 'Must include a lowercase letter')
  // .regex(/[0-9]/, 'Must include a number'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
