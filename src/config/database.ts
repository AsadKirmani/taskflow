import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;

let connectionPromise: Promise<typeof mongoose> | null = null;

/**
 * Resolves the absolute correct connection string based on strict environmental isolation
 */
function getConnectionString(): string {
  // 💡 FIXED: In production, enforce the primary cloud cluster string strictly. 
  // Never allow local machine fallback variables to leak into live cloud deployments.
  if (IS_PRODUCTION) {
    if (!process.env.MONGODB_URI) throw new Error('CRITICAL: MONGODB_URI is not configured for production');
    return process.env.MONGODB_URI;
  }

  const localUri = process.env.MONGODB_URI_LOCAL || process.env.MONGODB_URI;
  if (!localUri) throw new Error('DEVELOPMENT ERROR: Neither MONGODB_URI_LOCAL nor MONGODB_URI are configured');
  return localUri;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (!MONGODB_DB_NAME) {
    throw new Error('DATABASE INITIALIZATION ERROR: MONGODB_DB_NAME environment variable is completely missing');
  }

  // 1. Check if an active connection pool is already open and ready
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  // 2. If a connection is already actively in-flight, return the existing promise chain
  if (connectionPromise) {
    return connectionPromise;
  }

  const primaryUri = getConnectionString();

  // 3. Initialize the connection sequence cleanly using readable async/await architecture
  connectionPromise = (async () => {
    try {
      console.log('🔄 Initiating core database connection stream...');
      return await mongoose.connect(primaryUri, { dbName: MONGODB_DB_NAME });
    } catch (error: any) {
      // Look for network issues or DNS resolution problems (SRV lookups)
      const isSrvRefused =
        error?.code === 'ECONNREFUSED' &&
        error?.syscall === 'querySrv' &&
        !!process.env.MONGODB_URI_FALLBACK;

      if (isSrvRefused) {
        console.warn('⚠️ Primary MongoDB cluster lookup failed. Activating MONGODB_URI_FALLBACK channel...');
        try {
          return await mongoose.connect(process.env.MONGODB_URI_FALLBACK!, { dbName: MONGODB_DB_NAME });
        } catch (fallbackError) {
          // Clear memory reference immediately if fallback fails completely
          connectionPromise = null;
          throw fallbackError;
        }
      }

      // Clear memory reference immediately on error so subsequent requests can try fresh
      connectionPromise = null;
      throw error;
    }
  })();

  return connectionPromise;
}
