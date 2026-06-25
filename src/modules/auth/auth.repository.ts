import { UserModel } from '../../models/user.model';
import { RefreshTokenModel } from '../../models/refresh-token.model';

export const authRepository = {
  
  findUserByEmail(email: string) {
    return UserModel.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash');
  },

  findUserById(userId: string) {
    return UserModel.findById(userId).select('+passwordHash');
  },

  createUser(data: {
    name: string;
    email: string;
    passwordHash: string;
  }) {
    return UserModel.create(data);
  },
  updateUserPassword(userId: string, newPasswordHash: string) {
    return UserModel.findByIdAndUpdate(
      userId,
      { passwordHash: newPasswordHash },
      { new: true }
    ).select('+passwordHash');
  },
  updateUserProfile(userId: string, data: { name?: string; email?: string, avatarUrl?: string, preferences?: any }) {
    return UserModel.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true }
    );
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
    return RefreshTokenModel.findOne({ tokenHash }).lean();
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
  },

async cleanupExpiredTokens(userId: string) {

  return await RefreshTokenModel.deleteMany({
    userId,
    expiresAt: { $lt: new Date() }
  });
}
};