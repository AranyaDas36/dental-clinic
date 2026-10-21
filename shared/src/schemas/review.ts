import { z } from 'zod';

export const REVIEW_STATUSES = ['pending', 'approved', 'rejected', 'hidden'] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export const publicReviewCreateSchema = z.object({
  displayName: z.string().min(1).max(80),
  rating: z.number().int().min(1).max(5),
  message: z.string().min(10).max(1000),
});

export const adminReviewUpdateSchema = z.object({
  status: z.enum(REVIEW_STATUSES).optional(),
  adminResponse: z.string().max(1000).nullable().optional(),
});

export type PublicReviewCreate = z.infer<typeof publicReviewCreateSchema>;
