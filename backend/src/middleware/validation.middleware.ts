import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny } from 'zod';
import { AppError } from '../shared/errors/app-error';

export const validate =
  (schema: ZodTypeAny, target: 'body' | 'query' | 'params' = 'body') =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      next(
        new AppError('Validation failed', 400, 'VALIDATION_ERROR', result.error.flatten())
      );
      return;
    }

    req[target] = result.data;
    next();
  };