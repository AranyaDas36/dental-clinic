import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { afterAll, beforeAll, beforeEach } from 'vitest';
import { loadEnvForBoot } from '../config/env.js';

let memoryServer: MongoMemoryServer;

beforeAll(async () => {
  memoryServer = await MongoMemoryServer.create();
  const uri = memoryServer.getUri();

  loadEnvForBoot({
    NODE_ENV: 'test',
    MONGODB_URI: uri,
    CORS_ORIGIN: 'http://localhost:5173',
    COOKIE_SECURE: 'false',
    SESSION_ABSOLUTE_TTL_HOURS: '12',
    SESSION_IDLE_TTL_MINUTES: '30',
    COOKIE_NAME: 'dental_session',
    CSRF_COOKIE_NAME: 'dental_csrf',
  });

  await mongoose.connect(uri);
}, 60_000);

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const collection of Object.values(collections)) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
});
