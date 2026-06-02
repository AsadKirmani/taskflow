import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;

let connectionPromise: Promise<typeof mongoose> | null = null;

export async function connectToDatabase(): Promise<typeof mongoose> {
  const connectionUri = MONGODB_URI;

  if (!connectionUri) {
    throw new Error('MONGODB_URI is not set');
  }

  if (!MONGODB_DB_NAME) {
    throw new Error('MONGODB_DB_NAME is not set');
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(connectionUri, { dbName: MONGODB_DB_NAME })
      .catch((error) => {
        connectionPromise = null;
        throw error;
      });
  }

  return connectionPromise;
}