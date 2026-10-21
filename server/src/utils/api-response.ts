import type { Response } from 'express';
import type { ApiSuccess } from '@dental/shared';

export function sendSuccess<T>(
  res: Response,
  data: T,
  status = 200,
  meta?: ApiSuccess<T>['meta'],
): void {
  const body: ApiSuccess<T> = meta ? { success: true, data, meta } : { success: true, data };
  res.status(status).json(body);
}

export function sendError(
  res: Response,
  status: number,
  code: string,
  message: string,
  details?: unknown,
): void {
  res.status(status).json({
    success: false,
    error: {
      code,
      message,
      ...(details === undefined ? {} : { details }),
    },
  });
}
