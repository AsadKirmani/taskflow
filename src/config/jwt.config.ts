export const jwtConfig = {
  accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'change-me-access-secret',
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'change-me-refresh-secret',
  accessTokenExpiresIn: '1h',
  refreshTokenExpiresInDays: 7,
  refreshCookieName: 'refreshToken'
};