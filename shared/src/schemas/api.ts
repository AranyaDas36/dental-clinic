import { z } from 'zod';

export const apiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});

export const apiSuccessSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    meta: z
      .object({
        page: z.number().int().optional(),
        pageSize: z.number().int().optional(),
        total: z.number().int().optional(),
      })
      .optional(),
  });

export type ApiError = z.infer<typeof apiErrorSchema>;
export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
  };
};
export type ApiResponse<T> = ApiSuccess<T> | ApiError;
