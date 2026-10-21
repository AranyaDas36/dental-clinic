import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { sendError } from '../utils/api-response.js';
import { logger } from '../utils/logger.js';
import { getEnv } from '../config/env.js';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function notFoundHandler(_req: Request, res: Response): void {
  sendError(res, 404, 'NOT_FOUND', 'Resource not found');
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.code, err.message, err.details);
    return;
  }

  if (err instanceof ZodError) {
    sendError(res, 422, 'VALIDATION_ERROR', 'Invalid request', err.flatten());
    return;
  }

  logger.error({ err }, 'Unhandled error');
  const isProd = getEnv().NODE_ENV === 'production';
  sendError(
    res,
    500,
    'INTERNAL_ERROR',
    isProd ? 'An unexpected error occurred' : err instanceof Error ? err.message : 'Unknown error',
  );
}
