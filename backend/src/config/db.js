import mongoose from 'mongoose';
import { config } from './env.js';

/**
 * Connect to MongoDB for chat history persistence
 */
export async function connectDB() {
  const mongoURI = config.mongodbUri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusai';

  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`🍃 MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Non-fatal fallback for development if local MongoDB is not running yet
    console.warn(`⚠️ Chat history persistence will be disabled until MongoDB is available.`);
    return null;
  }
}
