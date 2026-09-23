import { z } from 'zod';

// Attempt to load .env if available
try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile();
  }
} catch (err: unknown) {
  const nodeErr = err as { code?: string };
  if (nodeErr?.code !== 'ENOENT') {
    console.error('[CONFIG ERROR] Failed to load .env file:', nodeErr);
    process.exit(1);
  }
}

export const envSchema = z.object({
  PORT: z.coerce
    .number()
    .int('PORT must be an integer')
    .min(1, 'PORT must be between 1 and 65535')
    .max(65535, 'PORT must be between 1 and 65535')
    .default(4000),
  NODE_ENV: z
    .enum(['development', 'production', 'test'], {
      message: "NODE_ENV must be one of 'development', 'production', or 'test'",
    })
    .default('development'),
  FRONTEND_ORIGIN: z
    .string()
    .default('http://localhost:5173,https://tmdb-movies-tau.vercel.app')
    .transform((val) =>
      val
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    )
    .refine((arr) => arr.length > 0, {
      message: 'FRONTEND_ORIGIN must contain at least one valid origin',
    }),
  COOKIE_NAME: z.string().min(1, 'COOKIE_NAME cannot be empty').default('mv_session'),
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters long')
    .default('development-jwt-secret-must-be-at-least-32-characters-long'),
  DATABASE_URL: z.string().min(1).optional(),
  DIRECT_URL: z.string().min(1).optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(rawEnv: Record<string, unknown> = process.env): Env {
  const result = envSchema.safeParse(rawEnv);

  if (!result.success) {
    const errorDetails = result.error.issues.map(
      (issue) => `${issue.path.join('.') || 'configuration'}: ${issue.message}`
    );
    console.error(
      `[CONFIG ERROR] Invalid environment configuration:\n  - ${errorDetails.join('\n  - ')}`
    );
    process.exit(1);
  }

  // In production, ensure JWT_SECRET was explicitly provided and is not the default
  if (
    result.data.NODE_ENV === 'production' &&
    result.data.JWT_SECRET === 'development-jwt-secret-must-be-at-least-32-characters-long'
  ) {
    console.error(
      '[CONFIG ERROR] Invalid environment configuration:\n  - JWT_SECRET must be set to a secure secret in production'
    );
    process.exit(1);
  }

  return result.data;
}

export const env = validateEnv();
