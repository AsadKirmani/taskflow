import { jwtConfig } from "../../config/jwt.config";
import { AppError } from "../../shared/errors/app-error";
import { comparePassword, hashPassword } from "../../shared/utils/password";
import { hashToken } from "../../shared/utils/token";
import { authRepository } from "./auth.repository";
import { redisClient } from "../../config/redis";
import { uploadBufferToCloudinary } from "../../services/cloudinary.service";
import {
  signAccessToken,
  signRefreshTokenJwt,
  verifyRefreshTokenJwt,
} from "./jwt.service";
import { UserModel } from "../../models/user.model";

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
  preferences: user.preferences,
});

export const authService = {
  async register(
    input: { name: string; email: string; password: string },
    meta?: { ip?: string; userAgent?: string },
  ) {
    const normalizedEmail = input.email.trim().toLowerCase();
    const existingUser = await authRepository.findUserByEmail(normalizedEmail);

    if (existingUser) {
      throw new AppError("Email already in use", 409, "EMAIL_ALREADY_EXISTS");
    }

    const passwordHash = await hashPassword(input.password);

    let user;

    try {
      user = await authRepository.createUser({
        name: input.name,
        email: normalizedEmail,
        passwordHash,
      });
    } catch (error: any) {
      if (error?.code === 11000 && error?.keyPattern?.email) {
        throw new AppError("Email already in use", 409, "EMAIL_ALREADY_EXISTS");
      }

      throw error;
    }

    const accessToken = signAccessToken({
      sub: user._id.toString(),
      email: user.email,
      type: "access",
    });

    const refreshToken = signRefreshTokenJwt({
      sub: user._id.toString(),
      sessionTokenId: cryptoRandomId(),
      type: "refresh",
    });

    await authRepository.createRefreshToken({
      userId: user._id.toString(),
      tokenHash: hashToken(refreshToken),
      expiresAt: buildRefreshExpiryDate(),
      createdByIp: meta?.ip ?? null,
      userAgent: meta?.userAgent ?? null,
    });

    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  },

  async login(
    input: { email: string; password: string },
    meta?: { ip?: string; userAgent?: string },
  ) {
    const user = await authRepository.findUserByEmail(input.email);

    if (!user) {
      throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
    }

    const isPasswordValid = await comparePassword(
      input.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
    }

    const accessToken = signAccessToken({
      sub: user._id.toString(),
      email: user.email,
      type: "access",
    });

    const refreshToken = signRefreshTokenJwt({
      sub: user._id.toString(),
      sessionTokenId: cryptoRandomId(),
      type: "refresh",
    });

    await authRepository.createRefreshToken({
      userId: user._id.toString(),
      tokenHash: hashToken(refreshToken),
      expiresAt: buildRefreshExpiryDate(),
      createdByIp: meta?.ip ?? null,
      userAgent: meta?.userAgent ?? null,
    });
    await authRepository.cleanupExpiredTokens(user._id.toString());
    await UserModel.findByIdAndUpdate(user._id.toString(), {
      lastLoginAt: new Date(),
    });
    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  },

  async getCurrentUser(userId: string) {
    const userStart = Date.now();
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }
    return sanitizeUser(user);
  },
  async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    const isPasswordValid = await comparePassword(
      currentPassword,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new AppError(
        "Invalid current password",
        401,
        "INVALID_CURRENT_PASSWORD",
      );
    }
    if (await comparePassword(newPassword, user.passwordHash)) {
      throw new AppError(
        "New password cannot be the same as current password",
        400,
        "SAME_PASSWORD",
      );
    }
    const newPasswordHash = await hashPassword(newPassword);
    const updatedUser = await authRepository.updateUserPassword(
      userId,
      newPasswordHash,
    );
    return sanitizeUser(updatedUser);
  },
  async updateProfile(
    userId: string,
    data: {
      name?: string;
      email?: string;
      avatarUrl?: string;
      preferences?: any;
    },
  ) {
    const updatedUser = await authRepository.updateUserProfile(userId, data);
    return sanitizeUser(updatedUser);
  },
  async refresh(
    refreshToken: string,
    meta?: { ip?: string; userAgent?: string },
  ) {
    const totalStart = Date.now();

    let payload: ReturnType<typeof verifyRefreshTokenJwt>;

    try {
      payload = verifyRefreshTokenJwt(refreshToken);
    } catch {
      throw new AppError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN");
    }

    const tokenHash = hashToken(refreshToken);
    const cacheKey = `refresh_token:${tokenHash}`;

    let sessionData: any;

    const redisGetStart = Date.now();

    const cachedSession = await redisClient.get(cacheKey);

    if (cachedSession) {
      sessionData = cachedSession;
    } else {
      const dbFetchStart = Date.now();
      const [existingToken, user] = await Promise.all([
        authRepository.findRefreshTokenByHash(tokenHash),
        authRepository.findUserById(payload.sub),
      ]);
      if (
        !existingToken ||
        existingToken.revokedAt ||
        existingToken.expiresAt < new Date()
      ) {
        throw new AppError(
          "Refresh token is invalid or expired",
          401,
          "REFRESH_TOKEN_EXPIRED",
        );
      }

      if (!user) {
        throw new AppError("User not found", 404, "USER_NOT_FOUND");
      }

      sessionData = {
        sub: user._id.toString(),
        email: user.email,
        user: sanitizeUser(user),
      };
    }

    const tokenStart = Date.now();

    const newAccessToken = signAccessToken({
      sub: sessionData.sub,
      email: sessionData.email,
      type: "access",
    });

    const newRefreshToken = signRefreshTokenJwt({
      sub: sessionData.sub,
      sessionTokenId: cryptoRandomId(),
      type: "refresh",
    });

    const newRefreshTokenHash = hashToken(newRefreshToken);

    const newCacheKey = `refresh_token:${newRefreshTokenHash}`;

    const ttlSeconds = 7 * 24 * 60 * 60;

    const writeStart = Date.now();

    await Promise.all([
      redisClient.del(cacheKey),

      redisClient.set(newCacheKey, JSON.stringify(sessionData), {
        ex: ttlSeconds,
      }),

      authRepository.revokeRefreshToken(tokenHash, newRefreshTokenHash),

      authRepository.createRefreshToken({
        userId: sessionData.sub,
        tokenHash: newRefreshTokenHash,
        expiresAt: buildRefreshExpiryDate(),
        createdByIp: meta?.ip ?? null,
        userAgent: meta?.userAgent ?? null,
      }),
    ]);
    const response = {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: sessionData.user,
    };
    return response;
  },

  async logout(refreshToken: string) {
    const tokenHash = hashToken(refreshToken);
    await authRepository.revokeRefreshToken(tokenHash);
  },

  async logoutAll(userId: string) {
    await authRepository.revokeAllUserRefreshTokens(userId);
  },
  async uploadAvatar(userId: string, avatar: Express.Multer.File) {
    if (!avatar) {
      throw new AppError("No avatar file provided", 400, "NO_AVATAR_FILE");
    }
    const uploadResult = await uploadBufferToCloudinary(
      avatar.buffer,
      "avatars",
      avatar.mimetype,
    );
    const avatarUrl = uploadResult.secure_url;
    const updatedUser = await authRepository.updateUserProfile(userId, {
      avatarUrl,
    });
    return sanitizeUser(updatedUser);
  },
};

function cryptoRandomId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
