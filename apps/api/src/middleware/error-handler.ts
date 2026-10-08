import type { NextFunction, Request, Response } from 'express';
import type { ApiErrorCode, ApiErrorResponse } from '@libfind/shared-types';
import type { AppLogger } from '../infrastructure/logger.js';

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: ApiErrorCode;
  readonly details?: unknown;
  readonly expose: boolean;

  constructor(options: {
    statusCode: number;
    code: ApiErrorCode;
    message: string;
    details?: unknown;
    expose?: boolean;
  }) {
    super(options.message);
    this.name = 'AppError';
    this.statusCode = options.statusCode;
    this.code = options.code;
    this.details = options.details;
    this.expose = options.expose ?? options.statusCode < 500;
  }
}

function statusToCode(status: number): ApiErrorCode {
  switch (status) {
    case 400:
      return 'BAD_REQUEST';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    case 429:
      return 'RATE_LIMITED';
    default:
      return status >= 500 ? 'INTERNAL_ERROR' : 'BAD_REQUEST';
  }
}

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(
    new AppError({
      statusCode: 404,
      code: 'NOT_FOUND',
      message: `Route not found: ${req.method} ${req.path}`,
    }),
  );
}

export function createErrorHandler(logger: AppLogger) {
  return function errorHandler(
    err: unknown,
    req: Request,
    res: Response,
    _next: NextFunction,
  ): void {
    const requestId = req.requestId ?? 'unknown';

    if (err instanceof AppError) {
      if (err.statusCode >= 500) {
        logger.error({ err, requestId }, 'Handled application error');
      } else {
        logger.warn({ err: { code: err.code, message: err.message }, requestId }, 'Client error');
      }

      const body: ApiErrorResponse = {
        error: {
          code: err.code,
          message: err.expose ? err.message : 'An unexpected error occurred',
          requestId,
          ...(err.details !== undefined && err.expose ? { details: err.details } : {}),
        },
      };
      res.status(err.statusCode).json(body);
      return;
    }

    logger.error({ err, requestId }, 'Unhandled error');

    const body: ApiErrorResponse = {
      error: {
        code: statusToCode(500),
        message: 'An unexpected error occurred',
        requestId,
      },
    };
    res.status(500).json(body);
  };
}
