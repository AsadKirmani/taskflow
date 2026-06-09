import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors/app-error';
import { verifyAccessToken } from '../modules/auth/jwt.service';

export const authMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } 
  else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }
  if (!token) {
    next(new AppError('Authentication token missing or malformed', 401, 'UNAUTHORIZED'));
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.auth = {
      userId: payload.sub,
      email: payload.email
    };

    next();
  } catch (error: any) {
    if (error?.name === 'TokenExpiredError') {
      return next(new AppError('Access token has expired', 401, 'ACCESS_TOKEN_EXPIRED'));
    } else {
      return next(new AppError('Invalid authentication token', 401, 'INVALID_TOKEN'));
    }
  }
};
