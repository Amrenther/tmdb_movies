import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface TokenPayload extends jwt.JwtPayload {
  sub: string;
}

export const JWT_OPTIONS = {
  issuer: 'movieverse-api',
  audience: 'movieverse-web',
  algorithm: 'HS256' as const,
  expiresIn: '7d' as const,
};

export async function signToken(payload: { sub: string }): Promise<string> {
  return new Promise((resolve, reject) => {
    jwt.sign(
      { sub: payload.sub },
      env.JWT_SECRET,
      {
        issuer: JWT_OPTIONS.issuer,
        audience: JWT_OPTIONS.audience,
        algorithm: JWT_OPTIONS.algorithm,
        expiresIn: JWT_OPTIONS.expiresIn,
      },
      (err, token) => {
        if (err) return reject(err);
        if (!token) return reject(new Error('Failed to generate token'));
        resolve(token);
      }
    );
  });
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      env.JWT_SECRET,
      {
        issuer: JWT_OPTIONS.issuer,
        audience: JWT_OPTIONS.audience,
        algorithms: [JWT_OPTIONS.algorithm],
      },
      (err, decoded) => {
        if (err) return reject(err);
        if (
  !decoded ||
  typeof decoded === 'string' ||
  typeof decoded.sub !== 'string' ||
  decoded.sub.length === 0
) {
  return reject(new Error('Invalid token payload'));
}
        resolve(decoded as TokenPayload);
      }
    );
  });
}

export function getCookieOptions(): Record<string, unknown> {
  const isProduction = env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    path: '/',
    sameSite: 'lax' as const,
    secure: isProduction,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

export function getClearCookieOptions(): Record<string, unknown> {
  const isProduction = env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    path: '/',
    sameSite: 'lax' as const,
    secure: isProduction,
    maxAge: 0,
  };
}

export const COOKIE_NAME = env.COOKIE_NAME;