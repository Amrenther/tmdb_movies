import type { ApiErrorDetail } from '../types/api.js';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly errors: ApiErrorDetail[];

  constructor(statusCode: number, code: string, message: string, errors: ApiErrorDetail[] = []) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
