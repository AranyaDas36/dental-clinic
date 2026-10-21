import mongoose from 'mongoose';
import { getEnv } from './env.js';
import { logger } from '../utils/logger.js';

export async function connectDatabase(): Promise<typeof mongoose> {
  const { MONGODB_URI, NODE_ENV } = getEnv();
  mongoose.set('strictQuery', true);

  if (NODE_ENV !== 'production') {
    mongoose.set('debug', false);
  }

  await mongoose.connect(MONGODB_URI);
  logger.info('Connected to MongoDB');
  return mongoose;
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  logger.info('Disconnected from MongoDB');
}
