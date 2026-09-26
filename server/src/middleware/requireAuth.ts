import type { Request, Response, NextFunction } from 'express';
import { parseCookie } from 'cookie';
import { verifyToken, COOKIE_NAME } from '../lib/jwt.js';
import { AppError } from '../lib/errors.js';

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const cookieHeader = req.headers.cookie;

  if (!cookieHeader) {
    return next(new AppError(401, 'UNAUTHENTICATED', 'Authentication required'));
  }

  const cookies = parseCookie(cookieHeader);
  const token = cookies[COOKIE_NAME];

  if (!token) {
    return next(new AppError(401, 'UNAUTHENTICATED', 'Authentication required'));
  }

  try {
    const payload = await verifyToken(token);
    req.user = { id: payload.sub };
    next();
  } catch {
    // Expired, malformed, wrong algorithm, issuer, or audience -> 401 UNAUTHENTICATED
    // Never leak token payload or details in the response or logs
    return next(new AppError(401, 'UNAUTHENTICATED', 'Invalid or expired session'));
  }
}