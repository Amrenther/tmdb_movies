import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import { AppError } from '../lib/errors.js';

const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function requireOrigin(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (!STATE_CHANGING_METHODS.has(req.method)) {
    return next();
  }

  const origin = req.headers.origin;

  if (!origin) {
    return next(new AppError(403, 'CSRF_FORBIDDEN', 'Missing Origin header'));
  }

  const allowedOrigins = new Set(env.FRONTEND_ORIGIN);

  if (!allowedOrigins.has(origin)) {
    return next(new AppError(403, 'CSRF_FORBIDDEN', 'Origin not permitted'));
  }

  next();
}