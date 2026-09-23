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
