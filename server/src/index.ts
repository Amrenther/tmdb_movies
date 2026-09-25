import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { prisma } from './lib/prisma.js';

// Connect to database before starting server
async function startServer() {
  try {
    await prisma.$connect();
    logger.info('Connected to database');
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    process.exit(1);
  }

  const server = app.listen(env.PORT, () => {
    logger.info(`MovieVerse backend API listening on port ${env.PORT} [${env.NODE_ENV}]`);
  });

  function handleShutdown(signal: string) {
    logger.info(`${signal} signal received. Shutting down gracefully...`);
    server.close(async () => {
      logger.info('HTTP server closed.');
      await prisma.$disconnect();
      logger.info('Database connection closed.');
      process.exit(0);
    });
  }

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));

  return server;
}

export const server = startServer();
