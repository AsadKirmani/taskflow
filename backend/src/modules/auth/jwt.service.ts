import jwt from 'jsonwebtoken';
import { jwtConfig } from '../../config/jwt.config';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  type: 'access';
}

export interface RefreshTokenJwtPayload {
  sub: string;
  sessionTokenId: string;
  type: 'refresh';
}

export const signAccessToken = (payload: AccessTokenPayload): string => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return jwt.sign(payload, jwtConfig.accessTokenSecret, {
    expiresIn: jwtConfig.accessTokenExpiresIn as any
  });
};

export const signRefreshTokenJwt = (payload: RefreshTokenJwtPayload): string => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return jwt.sign(payload, jwtConfig.refreshTokenSecret, {
    expiresIn: `${jwtConfig.refreshTokenExpiresInDays}d` as any
  });
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, jwtConfig.accessTokenSecret) as AccessTokenPayload;
};

export const verifyRefreshTokenJwt = (token: string): RefreshTokenJwtPayload => {
  return jwt.verify(token, jwtConfig.refreshTokenSecret) as RefreshTokenJwtPayload;
};