/** Shared API / domain types for LibFind (Phase 0 foundation). */

export type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR';

export interface ApiErrorBody {
  code: ApiErrorCode;
  message: string;
  details?: unknown;
  requestId: string;
}

export interface ApiErrorResponse {
  error: ApiErrorBody;
}

export interface HealthResponse {
  status: 'ok';
  service: 'libfind-api';
  timestamp: string;
  requestId: string;
}

/** Opaque public identifiers are UUID strings; never expose sequential DB IDs. */
export type PublicId = string;

/** Money amounts are decimal strings with an explicit ISO currency code. */
export interface Money {
  amount: string;
  currency: 'LRD' | 'USD';
}
