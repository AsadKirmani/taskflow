import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;

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
  console.time("PROD Database Connection Time");
  if (!MONGODB_DB_NAME) {
    throw new Error('DATABASE ERROR: MONGODB_DB_NAME is completely missing');
  }

  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }
  
  console.log('ReadyState:', mongoose.connection.readyState);
  if (mongoose.connection.readyState === 0 || mongoose.connection.readyState === 3) {
    console.log('⚠️ Stale or disconnected socket detected. Wiping connection cache...');
    cachedConnection = null;
  }
  const primaryUri = getConnectionString();

  try {
    console.log('🔄 Opening fresh database pool connection sockets...');
    
    cachedConnection = await mongoose.connect(primaryUri, {
      dbName: MONGODB_DB_NAME,
      serverSelectionTimeoutMS: 5000, 
      socketTimeoutMS: 45000,
    });

    const dbHost = mongoose.connection.host;
    console.log(`✅ MongoDB Connected securely to: [${dbHost}]`);
    console.timeEnd("PROD Database Connection Time");
    return cachedConnection;
  } catch (error) {
    cachedConnection = null;
    console.error('❌ MongoDB Connection failed during socket allocation:', error);
    throw error;
  }
}
