import { Router } from 'express';
import type { Request, Response, NextFunction, CookieOptions } from 'express';
import { signupSchema, loginSchema } from '../schemas/auth.schema.js';
import { signupUser, loginUser, getCurrentUser } from '../services/auth.service.js';
import { signToken, getCookieOptions, getClearCookieOptions, COOKIE_NAME } from '../lib/jwt.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { createAuthRateLimiter } from '../middleware/rateLimit.js';
import { requireOrigin } from '../middleware/requireOrigin.js';
import { AppError } from '../lib/errors.js';
import type { ApiErrorDetail } from '../types/api.js';

const router = Router();
const authRateLimiter = createAuthRateLimiter();

// FR-AZ-04: CSRF Origin check for all state-changing auth requests
router.use(requireOrigin);

// FR-AUTH-01 to FR-AUTH-04: User Registration
router.post(
  '/signup',
  authRateLimiter,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parseResult = signupSchema.safeParse(req.body);
      if (!parseResult.success) {
        const errorDetails: ApiErrorDetail[] = parseResult.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        }));
        return next(new AppError(400, 'VALIDATION_ERROR', 'Validation error', errorDetails));
      }

      const user = await signupUser(parseResult.data);
      const token = await signToken({ sub: user.id });

      res.cookie(COOKIE_NAME, token, getCookieOptions() as CookieOptions);
      res.status(201).json({ user });
    } catch (error) {
      next(error);
    }
  }
);

// FR-AUTH-05 & FR-AUTH-06: User Login
router.post(
  '/login',
  authRateLimiter,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parseResult = loginSchema.safeParse(req.body);
      if (!parseResult.success) {
        const errorDetails: ApiErrorDetail[] = parseResult.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        }));
        return next(new AppError(400, 'VALIDATION_ERROR', 'Validation error', errorDetails));
      }

      const user = await loginUser(parseResult.data);
      const token = await signToken({ sub: user.id });

      res.cookie(COOKIE_NAME, token, getCookieOptions() as CookieOptions);
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  }
);

// FR-AUTH-07: User Logout
router.post('/logout', (_req: Request, res: Response): void => {
  res.cookie(COOKIE_NAME, '', getClearCookieOptions() as CookieOptions);
  res.status(204).end();
});

// FR-AUTH-08: Current User Session
router.get(
  '/me',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.id) {
        return next(new AppError(401, 'UNAUTHENTICATED', 'Authentication required'));
      }

      const user = await getCurrentUser(req.user.id);
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
