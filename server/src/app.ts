import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env.js';
import { requestLogger } from './lib/logger.js';
import { AppError } from './lib/errors.js';
import { notFoundHandler } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import healthRoutes from './routes/health.routes.js';

export function createApp(): express.Application {
  const app = express();

  // NFR-SEC-01: Use Helmet. Disable x-powered-by.
  app.use(helmet());
  app.disable('x-powered-by');

  // NFR-SEC-02: CORS allow only exact origins in FRONTEND_ORIGIN, credentials: true
  app.use(
    cors({
      origin: (origin, callback) => {
        // Requests with no origin (e.g. host health checks, curl) are permitted
        if (!origin) {
          return callback(null, true);
        }
        if (env.FRONTEND_ORIGIN.includes(origin)) {
          return callback(null, true);
        }
        return callback(
          new AppError(403, 'CSRF_FORBIDDEN', `Origin '${origin}' is not permitted by CORS policy`)
        );
      },
      credentials: true,
    })
  );

  // Parse JSON payloads
  app.use(express.json());

  // NFR-OBS-01: Log method, path, status, duration (safe request logging)
  app.use(requestLogger);

  // Mount API routes
  app.use('/api/health', healthRoutes);

  // Centralized 404 handler for unknown routes
  app.use(notFoundHandler);

  // Centralized error handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
