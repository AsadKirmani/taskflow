import * as express from 'express';

declare namespace Express {
  export interface Request {
    auth?: {
      userId: string;
      email: string;
    };
  }
}