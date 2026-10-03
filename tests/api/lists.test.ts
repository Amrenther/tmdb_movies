import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createApp } from '../../server/src/app.js';
import { prisma } from '../../server/src/lib/prisma.js';
import { signToken } from '../../server/src/lib/jwt.js';

describe('Favorites & Watchlist Integration Tests', () => {
  let server: http.Server;
  let baseUrl: string;
  const approvedOrigin = 'http://localhost:5173';
  const testRunId = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;

  let userA: { id: string; cookie: string };
  let userB: { id: string; cookie: string };

  const sampleMovie = {
    id: 550,
    title: 'Fight Club',
    poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    backdrop_path: '/hZkgoQYus5vegHoetLkCJzb17zJ.jpg',
    release_date: '1999-10-15',
    vote_average: 8.4,
    overview: 'A ticking-time-bomb insomniac...',
    genre_ids: [18, 53],
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

    // Create 2 test users directly in DB
    const dbUserA = await prisma.user.create({
      data: {
        email: `usera_${testRunId}@example.com`,
        passwordHash: '$2a$12$abcdefghijklmnopqrstuv',
        name: 'User A',
      },
    });
    const tokenA = await signToken({ sub: dbUserA.id });
    userA = { id: dbUserA.id, cookie: `mv_session=${tokenA}` };

    const dbUserB = await prisma.user.create({
      data: {
        email: `userb_${testRunId}@example.com`,
        passwordHash: '$2a$12$abcdefghijklmnopqrstuv',
        name: 'User B',
      },
    });
    const tokenB = await signToken({ sub: dbUserB.id });
    userB = { id: dbUserB.id, cookie: `mv_session=${tokenB}` };
  });

  after(async () => {
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

  it('FR-AZ-01: Protected list endpoints require auth (401 without cookie)', async () => {
    const favRes = await fetch(`${baseUrl}/api/favorites`);
    assert.equal(favRes.status, 401);
    const favJson = (await favRes.json()) as { code: string };
    assert.equal(favJson.code, 'UNAUTHENTICATED');

    const wlRes = await fetch(`${baseUrl}/api/watchlist`);
    assert.equal(wlRes.status, 401);
    const wlJson = (await wlRes.json()) as { code: string };
    assert.equal(wlJson.code, 'UNAUTHENTICATED');
  });

  it('FR-FAV-02: PUT /api/favorites/:movieId upserts movie snapshot with TMDB fields', async () => {
    const res = await fetch(`${baseUrl}/api/favorites/${sampleMovie.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Origin: approvedOrigin,
        Cookie: userA.cookie,
      },
      body: JSON.stringify(sampleMovie),
    });

    assert.equal(res.status, 200);
    const json = (await res.json()) as { item: Record<string, unknown> };
    assert.ok(json.item);
    assert.equal(json.item.id, sampleMovie.id);
    assert.equal(json.item.title, sampleMovie.title);
    assert.equal(json.item.poster_path, sampleMovie.poster_path);
    assert.equal(json.item.backdrop_path, sampleMovie.backdrop_path);
    assert.equal(json.item.release_date, sampleMovie.release_date);
    assert.equal(json.item.vote_average, sampleMovie.vote_average);
    assert.deepEqual(json.item.genre_ids, sampleMovie.genre_ids);
    // Prisma camelCase names must never leak in JSON
    assert.equal(json.item.posterPath, undefined);
    assert.equal(json.item.userId, undefined);
  });

  it('FR-FAV-02: PUT with ID mismatch returns 400 ID_MISMATCH', async () => {
    const res = await fetch(`${baseUrl}/api/favorites/999`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Origin: approvedOrigin,
        Cookie: userA.cookie,
      },
      body: JSON.stringify(sampleMovie), // body.id is 550, url is 999
    });

    assert.equal(res.status, 400);
    const json = (await res.json()) as { code: string };
    assert.equal(json.code, 'ID_MISMATCH');
  });

  it('FR-FAV-05: Duplicate PUT updates snapshot without creating second row', async () => {
    const updatedMovie = { ...sampleMovie, title: 'Fight Club - Remastered' };
    const res = await fetch(`${baseUrl}/api/favorites/${sampleMovie.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Origin: approvedOrigin,
        Cookie: userA.cookie,
      },
      body: JSON.stringify(updatedMovie),
    });

    assert.equal(res.status, 200);
    const json = (await res.json()) as { item: { title: string } };
    assert.equal(json.item.title, 'Fight Club - Remastered');

    // Verify exactly one row in DB
    const count = await prisma.favorite.count({
      where: { userId: userA.id, movieId: sampleMovie.id },
    });
    assert.equal(count, 1);
  });

  it('FR-FAV-04: Toggle favorite twice: first favorited=true, second favorited=false', async () => {
    const movie2 = { ...sampleMovie, id: 680, title: 'Pulp Fiction' };

    // 1st toggle -> favorited: true
    const toggle1 = await fetch(`${baseUrl}/api/favorites/toggle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: approvedOrigin,
        Cookie: userA.cookie,
      },
      body: JSON.stringify(movie2),
    });
    assert.equal(toggle1.status, 200);
    const json1 = (await toggle1.json()) as { favorited: boolean };
    assert.equal(json1.favorited, true);

    // 2nd toggle -> favorited: false
    const toggle2 = await fetch(`${baseUrl}/api/favorites/toggle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: approvedOrigin,
        Cookie: userA.cookie,
      },
      body: JSON.stringify(movie2),
    });
    assert.equal(toggle2.status, 200);
    const json2 = (await toggle2.json()) as { favorited: boolean };
    assert.equal(json2.favorited, false);
  });

  it('FR-WL-05: Same movie can be in favorites and watchlist independently', async () => {
    // Add to Watchlist
    const wlRes = await fetch(`${baseUrl}/api/watchlist/${sampleMovie.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Origin: approvedOrigin,
        Cookie: userA.cookie,
      },
      body: JSON.stringify(sampleMovie),
    });
    assert.equal(wlRes.status, 200);

    // Verify both lists contain it
    const favList = await fetch(`${baseUrl}/api/favorites`, {
      headers: { Cookie: userA.cookie },
    });
    const favJson = (await favList.json()) as { items: Array<{ id: number }> };
    assert.ok(favJson.items.some((m) => m.id === sampleMovie.id));

    const wlList = await fetch(`${baseUrl}/api/watchlist`, {
      headers: { Cookie: userA.cookie },
    });
    const wlJson = (await wlList.json()) as { items: Array<{ id: number }> };
    assert.ok(wlJson.items.some((m) => m.id === sampleMovie.id));
  });

  it('FR-AZ-02: User A cannot see or mutate User B lists', async () => {
    // User B fetches favorites -> must NOT contain User A's movies
    const resB = await fetch(`${baseUrl}/api/favorites`, {
      headers: { Cookie: userB.cookie },
    });
    assert.equal(resB.status, 200);
    const jsonB = (await resB.json()) as { items: Array<{ id: number }> };
    assert.equal(jsonB.items.length, 0);

    // User B deletes sampleMovie.id -> returns 204 (idempotent), but User A's row remains intact!
    const delRes = await fetch(`${baseUrl}/api/favorites/${sampleMovie.id}`, {
      method: 'DELETE',
      headers: {
        Origin: approvedOrigin,
        Cookie: userB.cookie,
      },
    });
    assert.equal(delRes.status, 204);

    // Check User A's favorite still exists
    const checkA = await prisma.favorite.findUnique({
      where: { userId_movieId: { userId: userA.id, movieId: sampleMovie.id } },
    });
    assert.ok(checkA, 'User A favorite movie must not be affected by User B');
  });

  it('FR-FAV-03: DELETE missing id returns 204 (idempotent)', async () => {
    const res = await fetch(`${baseUrl}/api/favorites/999999`, {
      method: 'DELETE',
      headers: {
        Origin: approvedOrigin,
        Cookie: userA.cookie,
      },
    });
    assert.equal(res.status, 204);
  });

  it('FR-FAV-04: Concurrent toggles for the same user/movie never produce a 500 error', async () => {
    const concurrentMovie = { ...sampleMovie, id: 13, title: 'Forrest Gump' };

    // Fire 2 toggle calls simultaneously
    const [res1, res2] = await Promise.all([
      fetch(`${baseUrl}/api/favorites/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: approvedOrigin,
          Cookie: userA.cookie,
        },
        body: JSON.stringify(concurrentMovie),
      }),
      fetch(`${baseUrl}/api/favorites/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: approvedOrigin,
          Cookie: userA.cookie,
        },
        body: JSON.stringify(concurrentMovie),
      }),
    ]);

    // Neither call should fail with 500
    assert.notEqual(res1.status, 500, 'Concurrent toggle 1 must not return 500');
    assert.notEqual(res2.status, 500, 'Concurrent toggle 2 must not return 500');
    assert.equal(res1.status, 200);
    assert.equal(res2.status, 200);

    // Verify row count is either 0 or 1, never duplicated
    const count = await prisma.favorite.count({
      where: { userId: userA.id, movieId: concurrentMovie.id },
    });
    assert.ok(count <= 1, 'Row count must be 0 or 1, never duplicated');
  });
});
