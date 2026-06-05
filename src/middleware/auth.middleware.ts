import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors/app-error';
import { verifyAccessToken } from '../modules/auth/jwt.service';

export const authMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  // 1. Check for the token in the standard Authorization Header
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } 
  // 2. Fallback: Check for the token inside your secure httpOnly cookies
  else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  // If no token is found anywhere, halt the request immediately
  if (!token) {
    next(new AppError('Authentication token missing or malformed', 401, 'UNAUTHORIZED'));
    return;
  }

  try {
    // Cryptographic validation (Strictly in-memory, zero database lookups)
    const payload = verifyAccessToken(token);

    // Attach the sanitized context directly to the request object
    req.auth = {
      userId: payload.sub,
      email: payload.email
    };

    next();
  } catch (error: any) {
    if (error?.name === 'TokenExpiredError') {
      next(new AppError('Access token has expired', 401, 'ACCESS_TOKEN_EXPIRED'));
    } else {
      next(new AppError('Invalid authentication token', 401, 'INVALID_TOKEN'));
    }
  }
};
