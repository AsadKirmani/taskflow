import { Request } from 'express';

declare global {
  namespace Express {
    export interface Request {
      auth?: {
        userId: string;
        email: string;
      };
    }
  }
}