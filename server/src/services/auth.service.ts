import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/errors.js';
import type { SignupInput, LoginInput } from '../schemas/auth.schema.js';
import type { PublicUser } from '../types/api.js';

// NFR-SEC-03: Passwords hashed with bcryptjs rounds 12
const BCRYPT_ROUNDS = 12;

export function toPublicUser(user: {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function signupUser(input: SignupInput): Promise<PublicUser> {
  // FR-AUTH-09: Email stored lowercase trimmed
  const normalizedEmail = input.email.trim().toLowerCase();

  // 1. Initial check for existing email
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  // FR-AUTH-03: Duplicate email -> 409 EMAIL_TAKEN
  if (existingUser) {
    throw new AppError(409, 'EMAIL_TAKEN', 'An account with this email already exists');
  }

  // FR-AUTH-01 & NFR-SEC-03: Hash password with cost factor 12
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  // 2. Create user, catching concurrent unique constraint violation (P2002)
  try {
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: input.name.trim(),
      },
    });

    // FR-AUTH-10: Public user object without passwordHash
    return toPublicUser(user);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new AppError(409, 'EMAIL_TAKEN', 'An account with this email already exists');
    }
    throw error;
  }
}

export async function loginUser(input: LoginInput): Promise<PublicUser> {
  const normalizedEmail = input.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  // FR-AUTH-05: Unknown email or wrong password -> identical 401 INVALID_CREDENTIALS
  if (!user) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  return toPublicUser(user);
}

export async function getCurrentUser(userId: string): Promise<PublicUser> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  // FR-AUTH-08: Missing/invalid session or deleted user -> 401 UNAUTHENTICATED
  if (!user) {
    throw new AppError(401, 'UNAUTHENTICATED', 'User session is invalid or user no longer exists');
  }

  return toPublicUser(user);
}
