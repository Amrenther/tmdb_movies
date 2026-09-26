import rateLimit from 'express-rate-limit';

export function createAuthRateLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      code: 'RATE_LIMITED',
      message: 'Too many requests, please try again later',
      errors: [],
    },
  });
}