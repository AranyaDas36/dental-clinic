import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny } from 'zod';
import { AppError } from './error-handler.js';

type RequestPart = 'body' | 'query' | 'params';

export function validate(schema: ZodTypeAny, part: RequestPart = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req[part]);
    if (!parsed.success) {
      next(new AppError(422, 'VALIDATION_ERROR', 'Invalid request', parsed.error.flatten()));
      return;
    }
    req[part] = parsed.data;
    next();
  };
}
