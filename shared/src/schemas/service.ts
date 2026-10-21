import { z } from 'zod';
import { DEFAULT_CURRENCY, PRICE_TYPES } from '../constants/pricing.js';
import { objectIdStringSchema } from './common.js';

const slugSchema = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase kebab-case');

function refineServicePricing(
  value: {
    priceType: (typeof PRICE_TYPES)[number];
    price: number | null;
    minPrice: number | null;
    maxPrice: number | null;
  },
  ctx: z.RefinementCtx,
) {
  switch (value.priceType) {
    case 'fixed':
      if (value.price == null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Fixed price requires price',
          path: ['price'],
        });
      }
      break;
    case 'starting_at':
      if (value.minPrice == null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Starting price requires minPrice',
          path: ['minPrice'],
        });
      }
      break;
    case 'range':
      if (value.minPrice == null || value.maxPrice == null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Range pricing requires minPrice and maxPrice',
          path: ['minPrice'],
        });
      } else if (value.maxPrice < value.minPrice) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'maxPrice must be greater than or equal to minPrice',
          path: ['maxPrice'],
        });
      }
      break;
    case 'quote':
      break;
  }
}

export const serviceFieldsSchema = z.object({
  name: z.string().min(1).max(120),
  slug: slugSchema,
  shortDescription: z.string().min(1).max(240),
  description: z.string().max(5000),
  category: z.string().min(1).max(80),
  priceType: z.enum(PRICE_TYPES),
  price: z.number().nonnegative().nullable(),
  minPrice: z.number().nonnegative().nullable(),
  maxPrice: z.number().nonnegative().nullable(),
  currency: z.literal(DEFAULT_CURRENCY).default(DEFAULT_CURRENCY),
  imageMediaId: objectIdStringSchema.nullable(),
  isFeatured: z.boolean(),
  isPublished: z.boolean(),
  displayOrder: z.number().int().min(0).max(10_000),
  seoTitle: z.string().max(70).nullable(),
  seoDescription: z.string().max(180).nullable(),
});

export const serviceInputSchema = serviceFieldsSchema.superRefine(refineServicePricing);
export const servicePatchSchema = serviceFieldsSchema.partial();

export type ServiceInput = z.infer<typeof serviceInputSchema>;
export type ServicePatch = z.infer<typeof servicePatchSchema>;
