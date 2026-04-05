import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { DomainError } from '../domain/errors';

interface StandardErrorResponse {
  statusCode: number;
  error: {
    message: string;
    code: string;
    details?: unknown;
  };
}

/**
 * Centralized error handler middleware.
 * Must be registered as the last app.use() before app.listen().
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction // eslint-disable-line @typescript-eslint/no-unused-vars
): void {
  if (err instanceof DomainError) {
    const body: StandardErrorResponse = {
      statusCode: err.statusCode,
      error: {
        message: err.message,
        code: err.code,
        ...(err.details !== undefined ? { details: err.details } : {}),
      },
    };
    res.status(err.statusCode).json(body);
    return;
  }

  // Multer errors (e.g. file too large)
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      const body: StandardErrorResponse = {
        statusCode: 413,
        error: {
          message: 'File size exceeds maximum allowed limit',
          code: 'FILE_TOO_LARGE',
        },
      };
      res.status(413).json(body);
      return;
    }
  }

  // Unknown / unhandled error — avoid leaking internals
  console.error('Unhandled error:', err);
  const body: StandardErrorResponse = {
    statusCode: 500,
    error: {
      message: 'An unexpected error occurred. Please try again later.',
      code: 'INTERNAL_SERVER_ERROR',
    },
  };
  res.status(500).json(body);
}
