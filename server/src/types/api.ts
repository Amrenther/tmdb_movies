export interface ApiErrorDetail {
  path: string;
  message: string;
}

export interface ApiErrorEnvelope {
  code: string;
  message: string;
  errors: ApiErrorDetail[];
}

export interface HealthResponse {
  status: string;
  db?: string;
}

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

// Matches the existing React SavedMovie type (TMDB-style field names)
export interface SavedMovie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  release_date: string;
  vote_average: number;
  overview?: string;
  genre_ids?: number[];
}
