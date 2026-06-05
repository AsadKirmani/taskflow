import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;

// Maintain a global memory reference across serverless execution cycles
let cachedConnection: typeof mongoose | null = null;

function getConnectionString(): string {
  if (IS_PRODUCTION) {
    if (!process.env.MONGODB_URI) throw new Error('CRITICAL: MONGODB_URI is missing');
    return process.env.MONGODB_URI;
  }
  const localUri = process.env.MONGODB_URI_LOCAL || process.env.MONGODB_URI;
  if (!localUri) throw new Error('DEVELOPMENT ERROR: MONGODB_URI is missing');
  return localUri;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (!MONGODB_DB_NAME) {
    throw new Error('DATABASE ERROR: MONGODB_DB_NAME is completely missing');
  }

  // 1. If we have an existing connection in memory, verify it's ACTUALLY alive
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  // 2. If the connection state is broken, disconnected, or uninitialized, force reset our references
  if (mongoose.connection.readyState === 0 || mongoose.connection.readyState === 3) {
    console.log('⚠️ Stale or disconnected socket detected. Wiping connection cache...');
    cachedConnection = null;
  }

  const primaryUri = getConnectionString();

  try {
    console.log('🔄 Opening fresh database pool connection sockets...');
    
    // 3. Optimize connection settings explicitly for serverless/high-frequency stability
    cachedConnection = await mongoose.connect(primaryUri, {
      dbName: MONGODB_DB_NAME,
      // Sever connections quickly if the cloud infrastructure shifts out from under the runtime
      serverSelectionTimeoutMS: 5000, 
      socketTimeoutMS: 45000,
    });

    const dbHost = mongoose.connection.host;
    console.log(`✅ MongoDB Connected securely to: [${dbHost}]`);
    
    return cachedConnection;
  } catch (error) {
    cachedConnection = null; // Clear out on failure so the next invocation can retry cleanly
    console.error('❌ MongoDB Connection failed during socket allocation:', error);
    throw error;
  }
}
