import { Request, Response } from 'express';
import { CookieOptions } from 'express';
import { jwtConfig } from '../../config/jwt.config';
import { AppError } from '../../shared/errors/app-error';
import { authService } from './auth.service';

const isProduction = process.env.NODE_ENV === 'production';

const prodCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  path: '/'
};

const devCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: 'lax',
  path: '/'
};

const baseCookieOptions = isProduction ? prodCookieOptions : devCookieOptions;
console.log(`AuthController: Running in ${isProduction ? 'production' : 'development'} mode. Cookie options:`, isProduction ? prodCookieOptions : devCookieOptions);

const cookieOptions: CookieOptions = {
  ...baseCookieOptions,
  maxAge: jwtConfig.refreshTokenExpiresInDays * 24 * 60 * 60 * 1000
};
const accessTokenCookieOptions: CookieOptions = {
  ...baseCookieOptions,
  maxAge: 15 * 60 * 1000
};

export const authController = {
  async register(req: Request, res: Response) {
    const result = await authService.register(req.body, {
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.cookie(jwtConfig.refreshCookieName, result.refreshToken, cookieOptions);
    res.cookie('accessToken', result.accessToken, accessTokenCookieOptions);
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: result.user,
      }
    });
  },

  async login(req: Request, res: Response) {
    const result = await authService.login(req.body, {
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.cookie(jwtConfig.refreshCookieName, result.refreshToken, cookieOptions);
    res.cookie('accessToken', result.accessToken, accessTokenCookieOptions);
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: result.user,
      }
    });
    
  },

  async me(req: Request, res: Response) {
    if (!req.auth?.userId) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const user = await authService.getCurrentUser(req.auth.userId);

    res.json({
      success: true,
      data: { user }
    });
  },

  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies?.[jwtConfig.refreshCookieName];

    if (!refreshToken) {
      throw new AppError('Refresh token missing', 401, 'REFRESH_TOKEN_MISSING');
    }

    const result = await authService.refresh(refreshToken, {
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.cookie(jwtConfig.refreshCookieName, result.refreshToken, cookieOptions);
    res.cookie('accessToken', result.accessToken, accessTokenCookieOptions);
    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: result.accessToken
        }
    });
  },

  async logout(req: Request, res: Response) {
    const refreshToken = req.cookies?.[jwtConfig.refreshCookieName];

    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    res.clearCookie(jwtConfig.refreshCookieName, baseCookieOptions);
    res.clearCookie('accessToken', baseCookieOptions);

    res.json({
      success: true,
      message: 'Logged out successfully',
      data: null
    });
  },

  async logoutAll(req: Request, res: Response) {
    if (!req.auth?.userId) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    await authService.logoutAll(req.auth.userId);
    res.clearCookie(jwtConfig.refreshCookieName, baseCookieOptions);
    res.clearCookie('accessToken', baseCookieOptions);

    res.json({
      success: true,
      message: 'Logged out from all devices',
      data: null
    });
  }
};
