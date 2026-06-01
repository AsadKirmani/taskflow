import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors/app-error';
import { verifyAccessToken } from '../modules/auth/jwt.service';

export const authMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));
    return;
  }

  const token = authHeader.substring(7);

  try {
    const payload = verifyAccessToken(token);

    req.auth = {
      userId: payload.sub,
      email: payload.email
    };

    next();
  } catch {
    next(new AppError('Invalid or expired token', 401, 'INVALID_TOKEN'));
  }
};