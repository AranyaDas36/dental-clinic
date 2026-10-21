import { z } from 'zod';

export const objectIdStringSchema = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid ObjectId');

export const mediaRefSchema = z.object({
  mediaId: objectIdStringSchema.nullable(),
});

export const urlPathSchema = z
  .string()
  .min(1)
  .max(500)
  .refine(
    (value) =>
      value.startsWith('/') ||
      value.startsWith('#') ||
      value.startsWith('https://') ||
      value.startsWith('mailto:') ||
      value.startsWith('tel:'),
    {
      message: 'URL must be a site path, hash, mailto, tel, or https URL',
    },
  );

export const safeHttpUrlSchema = z
  .string()
  .url()
  .refine((value) => value.startsWith('https://') || value.startsWith('http://localhost'), {
    message: 'Only http(s) URLs are allowed',
  });

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
