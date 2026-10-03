import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createApp } from '../../server/src/app.js';
import { signToken } from '../../server/src/lib/jwt.js';

describe('Security & Middleware Integration Tests', () => {
  let server: http.Server;
  let baseUrl: string;
  const approvedOrigin = 'http://localhost:5173';
  const unapprovedOrigin = 'http://malicious-site.example.com';
  let authCookie: string;

  before(async () => {
    const app = createApp();
    server = http.createServer(app);
    await new Promise<void>((resolve) => {
      server.listen(0, () => resolve());
    });
    const address = server.address();
    const port = typeof address === 'object' && address ? address.port : 0;
    baseUrl = `http://localhost:${port}`;

    const token = await signToken({ sub: 'security_test_user' });
    authCookie = `mv_session=${token}`;
  });

  after(() => {
    server.close();
  });

  it('FR-AZ-04: State-changing POST without Origin header returns 403 CSRF_FORBIDDEN', async () => {
    const res = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Omit Origin header
      },
      body: JSON.stringify({
        email: 'csrf_test@example.com',
        password: 'password123',
        name: 'CSRF Test',
      }),
    });

    assert.equal(res.status, 403);
    const json = (await res.json()) as { code: string };
    assert.equal(json.code, 'CSRF_FORBIDDEN');
  });

  it('FR-AZ-04: State-changing POST with unapproved Origin returns 403 CSRF_FORBIDDEN', async () => {
    const res = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: unapprovedOrigin,
      },
      body: JSON.stringify({
        email: 'csrf_test@example.com',
        password: 'password123',
        name: 'CSRF Test',
      }),
    });

    assert.equal(res.status, 403);
    const json = (await res.json()) as { code: string };
    assert.equal(json.code, 'CSRF_FORBIDDEN');
  });

  it('FR-AZ-04: State-changing PUT without Origin header returns 403 CSRF_FORBIDDEN', async () => {
    const res = await fetch(`${baseUrl}/api/favorites/550`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookie,
        // Omit Origin header
      },
      body: JSON.stringify({ id: 550, title: 'Movie' }),
    });

    assert.equal(res.status, 403);
    const json = (await res.json()) as { code: string };
    assert.equal(json.code, 'CSRF_FORBIDDEN');
  });

  it('FR-AZ-04: State-changing DELETE without Origin header returns 403 CSRF_FORBIDDEN', async () => {
    const res = await fetch(`${baseUrl}/api/favorites/550`, {
      method: 'DELETE',
      headers: {
        Cookie: authCookie,
        // Omit Origin header
      },
    });

    assert.equal(res.status, 403);
    const json = (await res.json()) as { code: string };
    assert.equal(json.code, 'CSRF_FORBIDDEN');
  });

  it('NFR-SEC-01: Helmet headers present and X-Powered-By is disabled', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.headers.get('x-powered-by'), null, 'X-Powered-By must be disabled');
    assert.ok(
      res.headers.get('x-content-type-options'),
      'X-Content-Type-Options header should be present'
    );
  });

  it('Error Envelope: Malformed JSON body returns 400 VALIDATION_ERROR envelope', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: approvedOrigin,
      },
      body: '{"invalidJson',
    });

    assert.equal(res.status, 400);
    const json = (await res.json()) as { code: string; message: string; errors: unknown[] };
    assert.equal(json.code, 'VALIDATION_ERROR');
    assert.ok(Array.isArray(json.errors));
  });
});
