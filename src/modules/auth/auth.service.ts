import { jwtConfig } from '../../config/jwt.config';
import { AppError } from '../../shared/errors/app-error';
import { comparePassword, hashPassword } from '../../shared/utils/password';
import { hashToken } from '../../shared/utils/token';
import { authRepository } from './auth.repository';
import {
  signAccessToken,
  signRefreshTokenJwt,
  verifyRefreshTokenJwt
} from './jwt.service';

const buildRefreshExpiryDate = (): Date => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + jwtConfig.refreshTokenExpiresInDays);
  return expiresAt;
};

const sanitizeUser = (user: any) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  avatarUrl: user.avatarUrl ?? null,
  preferences: user.preferences
});

export const authService = {
  async register(input: { name: string; email: string; password: string }, meta?: { ip?: string; userAgent?: string }) {
    const normalizedEmail = input.email.trim().toLowerCase();
    const existingUser = await authRepository.findUserByEmail(normalizedEmail);

    if (existingUser) {
      throw new AppError('Email already in use', 409, 'EMAIL_ALREADY_EXISTS');
    }

    const passwordHash = await hashPassword(input.password);

    let user;

    try {
      user = await authRepository.createUser({
        name: input.name,
        email: normalizedEmail,
        passwordHash
      });
    } catch (error: any) {
      // Guard against race conditions where two signups hit the same unique email.
      if (error?.code === 11000 && error?.keyPattern?.email) {
        throw new AppError('Email already in use', 409, 'EMAIL_ALREADY_EXISTS');
      }

      throw error;
    }

    const accessToken = signAccessToken({
      sub: user._id.toString(),
      email: user.email,
      type: 'access'
    });

    const refreshToken = signRefreshTokenJwt({
      sub: user._id.toString(),
      sessionTokenId: cryptoRandomId(),
      type: 'refresh'
    });

    await authRepository.createRefreshToken({
      userId: user._id.toString(),
      tokenHash: hashToken(refreshToken),
      expiresAt: buildRefreshExpiryDate(),
      createdByIp: meta?.ip ?? null,
      userAgent: meta?.userAgent ?? null
    });

    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken
    };
  },

  async login(input: { email: string; password: string }, meta?: { ip?: string; userAgent?: string }) {
    const user = await authRepository.findUserByEmail(input.email);
    console.time("login");
    console.timeLog("login", "findUser");

    if (!user) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    const isPasswordValid = await comparePassword(input.password, user.passwordHash);
    console.timeLog("login", "bcrypt");
    
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }
    
    const accessToken = signAccessToken({
      sub: user._id.toString(),
      email: user.email,
      type: 'access'
    });
    
    const refreshToken = signRefreshTokenJwt({
      sub: user._id.toString(),
      sessionTokenId: cryptoRandomId(),
      type: 'refresh'
    });
    
    await authRepository.createRefreshToken({
      userId: user._id.toString(),
      tokenHash: hashToken(refreshToken),
      expiresAt: buildRefreshExpiryDate(),
      createdByIp: meta?.ip ?? null,
      userAgent: meta?.userAgent ?? null
    });
    console.timeLog("login", "createRefreshToken");

    console.timeEnd("login");
    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken
    };
  },

  async getCurrentUser(userId: string) {
    const user = await authRepository.findUserById(userId);

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return sanitizeUser(user);
  },

  async refresh(refreshToken: string, meta?: { ip?: string; userAgent?: string }) {
    let payload: ReturnType<typeof verifyRefreshTokenJwt>;

    try {
      payload = verifyRefreshTokenJwt(refreshToken);
    } catch {
      throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }

    const tokenHash = hashToken(refreshToken);
    const existingToken = await authRepository.findRefreshTokenByHash(tokenHash);

    if (!existingToken || existingToken.revokedAt || existingToken.expiresAt < new Date()) {
      throw new AppError('Refresh token is invalid or expired', 401, 'REFRESH_TOKEN_EXPIRED');
    }

    const user = await authRepository.findUserById(payload.sub);

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const newAccessToken = signAccessToken({
      sub: user._id.toString(),
      email: user.email,
      type: 'access'
    });

    const newRefreshToken = signRefreshTokenJwt({
      sub: user._id.toString(),
      sessionTokenId: cryptoRandomId(),
      type: 'refresh'
    });

    const newRefreshTokenHash = hashToken(newRefreshToken);

    await authRepository.revokeRefreshToken(tokenHash, newRefreshTokenHash);

    await authRepository.createRefreshToken({
      userId: user._id.toString(),
      tokenHash: newRefreshTokenHash,
      expiresAt: buildRefreshExpiryDate(),
      createdByIp: meta?.ip ?? null,
      userAgent: meta?.userAgent ?? null
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  },

  async logout(refreshToken: string) {
    const tokenHash = hashToken(refreshToken);
    await authRepository.revokeRefreshToken(tokenHash);
  },

  async logoutAll(userId: string) {
    await authRepository.revokeAllUserRefreshTokens(userId);
  }
};

function cryptoRandomId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}