import type { Favorite, WatchlistItem } from '@prisma/client';

/**
 * Maps a Prisma Favorite or WatchlistItem row to the TMDB-style JSON shape
 * used by the API (SRS section 7.2 JSON mapping).
 *
 * The existing React SavedMovie type uses TMDB field names (poster_path, etc.),
 * so we must never leak Prisma's camelCase field names in HTTP responses.
 */
export function mapToSavedMovie(row: Favorite | WatchlistItem) {
  return {
    id: row.movieId,
    title: row.title,
    poster_path: row.posterPath ?? null,
    backdrop_path: row.backdropPath ?? null,
    release_date: row.releaseDate,
    vote_average: row.voteAverage,
    overview: row.overview ?? undefined,
    genre_ids: row.genreIds,
  };
}
