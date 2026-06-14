import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const IS_PRODUCTION =
  process.env.NODE_ENV === 'production';

const MONGODB_DB_NAME =
  process.env.MONGODB_DB_NAME;

let cachedConnection:
  Promise<typeof mongoose> | null = null;

function getConnectionString(): string {
  if (IS_PRODUCTION) {
    if (!process.env.MONGODB_URI) {
      throw new Error(
        'CRITICAL: MONGODB_URI is missing'
      );
    }

    return process.env.MONGODB_URI;
  }

  const localUri =
    process.env.MONGODB_URI_LOCAL ??
    process.env.MONGODB_URI;

  if (!localUri) {
    throw new Error(
      'DEVELOPMENT ERROR: MONGODB_URI is missing'
    );
  }

  return localUri;
}

export async function connectToDatabase() {
  if (!MONGODB_DB_NAME) {
    throw new Error(
      'DATABASE ERROR: MONGODB_DB_NAME is missing'
    );
  }

  // Already connected
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  // Connection already in progress
  if (
    mongoose.connection.readyState === 2 &&
    cachedConnection
  ) {
    return cachedConnection;
  }

  // Reuse pending promise
  if (cachedConnection) {
    return cachedConnection;
  }

  const start = Date.now();

  console.log(
    '🔄 Creating MongoDB connection...'
  );

  cachedConnection = mongoose.connect(
    getConnectionString(),
    {
      dbName: MONGODB_DB_NAME,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    }
  );

  try {
    const connection =
      await cachedConnection;

    console.log(
      '✅ Mongo Connected',
      Date.now() - start,
      'ms'
    );

    return connection;
  } catch (error) {
    cachedConnection = null;

    console.error(
      '❌ Mongo Connection Error',
      error
    );

    throw error;
  }
}