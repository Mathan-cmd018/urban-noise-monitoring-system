import mongoose from 'mongoose';
import { config } from './env';

export const connectDatabase = async (): Promise<typeof mongoose> => {
  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected to database: ${conn.connection.name} at ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('[MongoDB] Connection error:', error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  console.log('[MongoDB] Disconnected from database');
};
