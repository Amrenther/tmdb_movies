import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import jwt from 'jsonwebtoken';
import { createApp } from '../../server/src/app.js';
import { prisma } from '../../server/src/lib/prisma.js';
import { env } from '../../server/src/config/env.js';

describe('Auth Integration Tests', () => {
  let server: http.Server;
  let baseUrl: string;
  const approvedOrigin = 'http://localhost:5173';
  const testRunId = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;

  // Test user data
  const testUser = {
    email: `test_auth_${testRunId}@example.com`,
    password: 'password123!',
    name: 'Auth Test User',
  };

  before(async () => {
    const app = createApp();
    server = http.createServer(app);
    await new Promise<void>((resolve) => {
      server.listen(0, () => resolve());
    });
    const address = server.address();
    const port = typeof address === 'object' && address ? address.port : 0;
    baseUrl = `http://localhost:${port}`;
  });

  after(async () => {
    // Clean up created test user
    try {
      await prisma.user.deleteMany({
        where: {
          email: {
            contains: testRunId,
          },
        },
      });
    } catch {
      // Ignore cleanup error
    }
    server.close();
  });

  it('FR-AUTH-01 to 04: Signup with valid body creates user in DB, sets httpOnly cookie, returns 201 with public user', async () => {
    const res = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: approvedOrigin,
      },
      body: JSON.stringify(testUser),
    });

    assert.equal(res.status, 201);
    const json = (await res.json()) as { user: Record<string, unknown> };

    // Public user contract: id, email, name, createdAt. Never passwordHash.
    assert.ok(json.user);
    assert.equal(typeof json.user.id, 'string');
    assert.equal(json.user.email, testUser.email.toLowerCase());
    assert.equal(json.user.name, testUser.name);
    assert.equal(typeof json.user.createdAt, 'string');
    assert.equal((json.user as Record<string, unknown>).passwordHash, undefined);
    assert.equal((json.user as Record<string, unknown>).password, undefined);

    // Cookie verification: httpOnly, mv_session
    const setCookie = res.headers.get('set-cookie');
    assert.ok(setCookie, 'Expected Set-Cookie header to be set');
    assert.ok(setCookie.includes('mv_session='), 'Cookie name should be mv_session');
    assert.ok(setCookie.toLowerCase().includes('httponly'), 'Cookie must be httpOnly');
    assert.ok(setCookie.includes('Path=/'), 'Cookie path must be /');

    // DB verification: user exists and passwordHash starts with $2a$ or $2b$
    const dbUser = await prisma.user.findUnique({
      where: { email: testUser.email.toLowerCase() },
    });
    assert.ok(dbUser);
    assert.ok(
      dbUser.passwordHash.startsWith('$2a$') || dbUser.passwordHash.startsWith('$2b$'),
      'Password hash must be a bcryptjs hash'
    );
  });

  it('FR-AUTH-02: Signup with short password returns 400 VALIDATION_ERROR', async () => {
    const res = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: approvedOrigin,
      },
      body: JSON.stringify({
        email: `short_pw_${testRunId}@example.com`,
        password: 'short',
        name: 'Short Password',
      }),
    });

    assert.equal(res.status, 400);
    const json = (await res.json()) as { code: string; errors: Array<{ path: string }> };
    assert.equal(json.code, 'VALIDATION_ERROR');
    assert.ok(json.errors.some((e) => e.path === 'password'));
  });

  it('FR-AUTH-03 & FR-AUTH-09: Duplicate email (case-insensitive) returns 409 EMAIL_TAKEN', async () => {
    const res = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: approvedOrigin,
      },
      body: JSON.stringify({
        email: testUser.email.toUpperCase(), // Same email in uppercase
        password: 'password123!',
        name: 'Duplicate Email User',
      }),
    });

    assert.equal(res.status, 409);
    const json = (await res.json()) as { code: string };
    assert.equal(json.code, 'EMAIL_TAKEN');
  });

  it('FR-AUTH-05: Login with wrong password returns 401 INVALID_CREDENTIALS', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: approvedOrigin,
      },
      body: JSON.stringify({
        email: testUser.email,
        password: 'WrongPassword123!',
      }),
    });

    assert.equal(res.status, 401);
    const json = (await res.json()) as { code: string };
    assert.equal(json.code, 'INVALID_CREDENTIALS');
  });

  it('FR-AUTH-05: Login with unknown email returns identical 401 INVALID_CREDENTIALS', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: approvedOrigin,
      },
      body: JSON.stringify({
        email: `nonexistent_${testRunId}@example.com`,
        password: 'SomePassword123!',
      }),
    });

    assert.equal(res.status, 401);
    const json = (await res.json()) as { code: string };
    assert.equal(json.code, 'INVALID_CREDENTIALS');
  });

  it('FR-AUTH-06 & FR-AUTH-08: Successful login returns session cookie and GET /api/auth/me returns user', async () => {
    // Login
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: approvedOrigin,
      },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
    });

    assert.equal(loginRes.status, 200);
    const setCookie = loginRes.headers.get('set-cookie');
    assert.ok(setCookie);

    // Extract cookie value for GET /me
    const cookieMatch = setCookie.match(/mv_session=([^;]+)/);
    assert.ok(cookieMatch);
    const sessionCookie = `mv_session=${cookieMatch[1]}`;

    // Call /api/auth/me
    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        Cookie: sessionCookie,
      },
    });

    assert.equal(meRes.status, 200);
    const meJson = (await meRes.json()) as { user: { email: string; name: string } };
    assert.equal(meJson.user.email, testUser.email.toLowerCase());
    assert.equal(meJson.user.name, testUser.name);
  });

  it('FR-AUTH-07 & FR-AUTH-08: Logout clears session cookie and subsequent GET /api/auth/me returns 401', async () => {
    // Login first
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: approvedOrigin,
      },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
    });

    assert.equal(loginRes.status, 200);
    const loginCookie = loginRes.headers.get('set-cookie')!;
    const cookieMatch = loginCookie.match(/mv_session=([^;]+)/)!;
    const sessionCookie = `mv_session=${cookieMatch[1]}`;

    // Logout
    const logoutRes = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: {
        Origin: approvedOrigin,
        Cookie: sessionCookie,
      },
    });

    assert.equal(logoutRes.status, 204);
    const logoutCookie = logoutRes.headers.get('set-cookie');
    assert.ok(logoutCookie, 'Set-Cookie should be sent to clear cookie');
    assert.ok(logoutCookie.includes('Max-Age=0') || logoutCookie.includes('Expires='));

    // Verify GET /me without cookie returns 401 UNAUTHENTICATED
    const meRes = await fetch(`${baseUrl}/api/auth/me`);
    assert.equal(meRes.status, 401);
    const meJson = (await meRes.json()) as { code: string };
    assert.equal(meJson.code, 'UNAUTHENTICATED');
  });

  it('FR-AUTH-12: JWT verification rejects expired token, wrong issuer, or wrong audience', async () => {
    // 1. Expired token
    const expiredToken = jwt.sign(
      { sub: 'user_123' },
      env.JWT_SECRET,
      {
        issuer: 'movieverse-api',
        audience: 'movieverse-web',
        algorithm: 'HS256',
        expiresIn: '-10s',
      }
    );

    const expiredRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Cookie: `mv_session=${expiredToken}` },
    });
    assert.equal(expiredRes.status, 401);
    const expiredJson = (await expiredRes.json()) as { code: string };
    assert.equal(expiredJson.code, 'UNAUTHENTICATED');

    // 2. Wrong issuer
    const wrongIssuerToken = jwt.sign(
      { sub: 'user_123' },
      env.JWT_SECRET,
      {
        issuer: 'wrong-issuer',
        audience: 'movieverse-web',
        algorithm: 'HS256',
        expiresIn: '1h',
      }
    );

    const wrongIssuerRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Cookie: `mv_session=${wrongIssuerToken}` },
    });
    assert.equal(wrongIssuerRes.status, 401);
    const wrongIssuerJson = (await wrongIssuerRes.json()) as { code: string };
    assert.equal(wrongIssuerJson.code, 'UNAUTHENTICATED');

    // 3. Wrong audience
    const wrongAudienceToken = jwt.sign(
      { sub: 'user_123' },
      env.JWT_SECRET,
      {
        issuer: 'movieverse-api',
        audience: 'wrong-audience',
        algorithm: 'HS256',
        expiresIn: '1h',
      }
    );

    const wrongAudienceRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Cookie: `mv_session=${wrongAudienceToken}` },
    });
    assert.equal(wrongAudienceRes.status, 401);
    const wrongAudienceJson = (await wrongAudienceRes.json()) as { code: string };
    assert.equal(wrongAudienceJson.code, 'UNAUTHENTICATED');
  });
});
