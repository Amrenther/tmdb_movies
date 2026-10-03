import { z } from 'zod';

// SRS section 7.1 — savedMovieSchema
// poster_path may be null or empty string (TMDB-derived data can contain either)
export const savedMovieSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1).max(500),
  poster_path: z.string().max(500).nullable(),
  backdrop_path: z.string().max(500).nullable().optional(),
  release_date: z.string().max(32),
  vote_average: z.number().finite().min(0).max(10),
  overview: z.string().max(4000).optional(),
  genre_ids: z.array(z.number().int()).max(32).optional(),
});

// Validates a route :movieId param as a positive safe integer
export const movieIdParamSchema = z.coerce
  .number()
  .int()
  .positive()
  .safe();

export type SavedMovieInput = z.infer<typeof savedMovieSchema>;
export type MovieIdParam = z.infer<typeof movieIdParamSchema>;
