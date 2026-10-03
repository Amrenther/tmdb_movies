import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/errors.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireOrigin } from '../middleware/requireOrigin.js';
import { savedMovieSchema, movieIdParamSchema } from '../schemas/savedMovie.schema.js';
import { mapToSavedMovie } from '../mappers/savedMovie.js';
import { ZodError } from 'zod';

const router = Router();

// All favorites routes require authentication
router.use(requireAuth);

// POST, PUT, DELETE require an approved Origin (CSRF protection)
router.use(requireOrigin);

/**
 * Parses and validates the :movieId route parameter.
 * Returns the numeric movieId, or throws 400 VALIDATION_ERROR.
 */
function parseMovieId(paramValue: string): number {
  const result = movieIdParamSchema.safeParse(paramValue);
  if (!result.success) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid movieId parameter', [
      { path: 'movieId', message: 'Must be a positive integer' },
    ]);
  }
  return result.data;
}

// ─── GET /api/favorites ───────────────────────────────────────────────────────
// FR-FAV-01: Return all favorites for the authenticated user, newest first.
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const rows = await prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ items: rows.map(mapToSavedMovie) });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/favorites/:movieId ──────────────────────────────────────────────
// FR-FAV-02: Upsert a favorite movie snapshot. URL movieId must equal body.id.
// FR-FAV-05: Duplicate PUT updates the snapshot; never creates a second row.
router.put('/:movieId', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const movieId = parseMovieId(String(req.params.movieId));

    // Validate request body
    const parseResult = savedMovieSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errors = (parseResult.error as ZodError).issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      throw new AppError(400, 'VALIDATION_ERROR', 'Request body validation failed', errors);
    }

    const body = parseResult.data;

    // SRS: URL movieId must equal body.id
    if (movieId !== body.id) {
      throw new AppError(400, 'ID_MISMATCH', 'URL movieId does not match body.id');
    }

    const row = await prisma.favorite.upsert({
      where: { userId_movieId: { userId, movieId } },
      update: {
        title: body.title,
        posterPath: body.poster_path ?? null,
        backdropPath: body.backdrop_path ?? null,
        releaseDate: body.release_date,
        voteAverage: body.vote_average,
        overview: body.overview ?? null,
        genreIds: body.genre_ids ?? [],
      },
      create: {
        userId,
        movieId,
        title: body.title,
        posterPath: body.poster_path ?? null,
        backdropPath: body.backdrop_path ?? null,
        releaseDate: body.release_date,
        voteAverage: body.vote_average,
        overview: body.overview ?? null,
        genreIds: body.genre_ids ?? [],
      },
    });

    res.json({ item: mapToSavedMovie(row) });
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /api/favorites/:movieId ──────────────────────────────────────────
// FR-FAV-03: Idempotent delete — missing row still returns 204.
router.delete('/:movieId', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const movieId = parseMovieId(String(req.params.movieId));

    await prisma.favorite.deleteMany({
      where: { userId, movieId },
    });

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/favorites/toggle ───────────────────────────────────────────────
// FR-FAV-04: Atomic toggle — if exists delete and return favorited:false,
//            if not exists insert and return favorited:true.
//            Must handle duplicate-key race without returning 500.
router.post('/toggle', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Validate request body
    const parseResult = savedMovieSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errors = (parseResult.error as ZodError).issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      throw new AppError(400, 'VALIDATION_ERROR', 'Request body validation failed', errors);
    }

    const body = parseResult.data;
    const movieId = body.id;

    // Use a transaction to make the toggle atomic and safe against concurrent requests
    try {
      const result = await prisma.$transaction(async (tx) => {
        const existing = await tx.favorite.findUnique({
          where: { userId_movieId: { userId, movieId } },
        });

        if (existing) {
          await tx.favorite.delete({
            where: { userId_movieId: { userId, movieId } },
          });
          return { favorited: false, item: undefined };
        }

        const created = await tx.favorite.create({
          data: {
            userId,
            movieId,
            title: body.title,
            posterPath: body.poster_path ?? null,
            backdropPath: body.backdrop_path ?? null,
            releaseDate: body.release_date,
            voteAverage: body.vote_average,
            overview: body.overview ?? null,
            genreIds: body.genre_ids ?? [],
          },
        });

        return { favorited: true, item: mapToSavedMovie(created) };
      });

      res.json(result);
    } catch (txErr: unknown) {
      // If a concurrent insert occurred right between findUnique and create (Prisma P2002)
      if (
        txErr &&
        typeof txErr === 'object' &&
        'code' in txErr &&
        (txErr as { code: string }).code === 'P2002'
      ) {
        await prisma.favorite.deleteMany({ where: { userId, movieId } });
        res.json({ favorited: false, item: undefined });
        return;
      }
      throw txErr;
    }
  } catch (err) {
    next(err);
  }
});

export default router;
