import crypto from 'crypto';

export const generateSecureToken = (size = 64): string => {
  return crypto.randomBytes(size).toString('hex');
};

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};