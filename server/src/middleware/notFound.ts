import type { Request, Response } from 'express';
import type { ApiErrorEnvelope } from '../types/api.js';

export function notFoundHandler(req: Request, res: Response): void {
  const response: ApiErrorEnvelope = {
    code: 'NOT_FOUND',
    message: `Cannot ${req.method} ${req.originalUrl || req.url}`,
    errors: [],
  };

  res.status(404).json(response);
}
