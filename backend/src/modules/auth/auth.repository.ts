import { UserModel } from '../../models/user.model';
import { RefreshTokenModel } from '../../models/refresh-token.model';

export const authRepository = {
  findUserByEmail(email: string) {
    return UserModel.findOne({ email }).select('+passwordHash');
  },

  findUserById(userId: string) {
    return UserModel.findById(userId);
  },

  createUser(data: {
    name: string;
    email: string;
    passwordHash: string;
  }) {
    return UserModel.create(data);
  },

  createRefreshToken(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    createdByIp?: string | null;
    userAgent?: string | null;
  }) {
    return RefreshTokenModel.create(data);
  },

  findRefreshTokenByHash(tokenHash: string) {
    return RefreshTokenModel.findOne({ tokenHash });
  },

  revokeRefreshToken(tokenHash: string, replacedByTokenHash?: string) {
    return RefreshTokenModel.updateOne(
      { tokenHash, revokedAt: null },
      {
        $set: {
          revokedAt: new Date(),
          replacedByTokenHash: replacedByTokenHash ?? null
        }
      }
    );
  },

  revokeAllUserRefreshTokens(userId: string) {
    return RefreshTokenModel.updateMany(
      { userId, revokedAt: null },
      { $set: { revokedAt: new Date() } }
    );
  }
};