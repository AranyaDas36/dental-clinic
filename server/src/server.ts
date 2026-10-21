import 'dotenv/config';
import { loadEnvForBoot } from './config/env.js';
import { connectDatabase } from './config/db.js';
import { createApp } from './app.js';
import { logger } from './utils/logger.js';

async function main() {
  const env = loadEnvForBoot();
  const app = createApp();

  await connectDatabase();

  app.listen(env.PORT, () => {
    logger.info({ port: env.PORT, corsOrigin: env.CORS_ORIGIN }, 'Dental API listening');
  });
}

main().catch((error) => {
  logger.fatal({ err: error }, 'Failed to start server');
  process.exit(1);
});
