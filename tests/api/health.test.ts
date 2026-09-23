import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createApp } from '../../server/src/app';

describe('API Health Endpoint', () => {
  let server: http.Server;
  let baseUrl: string;

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

  after(() => {
    server.close();
  });

  it('GET /api/health should return 200 with ok status', async () => {
    const response = await fetch(`${baseUrl}/api/health`);
    assert.equal(response.status, 200);
    const json = (await response.json()) as { status: string };
    assert.equal(json.status, 'ok');
  });

  it('Unknown routes should return 404 JSON response', async () => {
    const response = await fetch(`${baseUrl}/api/nonexistent`);
    assert.equal(response.status, 404);
    const json = (await response.json()) as { code: string; message: string };
    assert.equal(json.code, 'NOT_FOUND');
    assert.ok(json.message.includes('Cannot GET'));
  });

  it('POST to unknown route should return 404 JSON response', async () => {
    const response = await fetch(`${baseUrl}/api/users`, { method: 'POST' });
    assert.equal(response.status, 404);
    const json = (await response.json()) as { code: string; message: string };
    assert.equal(json.code, 'NOT_FOUND');
    assert.ok(json.message.includes('Cannot POST'));
  });
});