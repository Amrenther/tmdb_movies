import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { AppError } from '../lib/errors.js';
import { logger } from '../lib/logger.js';
import type { ApiErrorEnvelope } from '../types/api.js';

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (res.headersSent) {
    return next(err);
  }

  // Handle known AppError
  if (err instanceof AppError) {
    const envelope: ApiErrorEnvelope = {
      code: err.code,
      message: err.message,
      errors: err.errors,
    };
    res.status(err.statusCode).json(envelope);
    return;
  }

  // Handle JSON body parser syntax errors
  if (err instanceof SyntaxError && 'status' in err && (err as { status: number }).status === 400) {
    const envelope: ApiErrorEnvelope = {
      code: 'VALIDATION_ERROR',
      message: 'Invalid JSON payload in request body',
      errors: [],
    };
    res.status(400).json(envelope);
    return;
  }

  // Handle CORS errors (e.g. from cors middleware)
  if (err instanceof Error && err.message.toLowerCase().includes('cors')) {
    const envelope: ApiErrorEnvelope = {
      code: 'CSRF_FORBIDDEN',
      message: err.message,
      errors: [],
    };
    res.status(403).json(envelope);
    return;
  }

  // Log unexpected errors safely (message and stack, no request secrets)
  const errorMessage = err instanceof Error ? err.message : String(err);
  const errorStack = err instanceof Error ? err.stack : undefined;
  logger.error(`Unhandled server error: ${errorMessage}`, {
    stack: process.env.NODE_ENV !== 'production' ? errorStack : undefined,
  });

  // Standard 500 error envelope without exposing internal details
  const envelope: ApiErrorEnvelope = {
    code: 'INTERNAL_ERROR',
    message: 'Internal server error',
    errors: [],
  };
  res.status(500).json(envelope);
};
