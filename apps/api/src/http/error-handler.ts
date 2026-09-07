import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';

import { AppError, notFound } from './errors.js';
import { sendFailure } from './response.js';

/** Rute yang tidak cocok tetap dijawab dengan envelope, bukan halaman HTML Express. */
export const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(notFound('Endpoint tidak ditemukan'));
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    sendFailure(res, error.code, error.message, error.details);
    return;
  }

  if (error instanceof ZodError) {
    sendFailure(
      res,
      'VALIDATION_ERROR',
      'Data yang dikirim tidak valid',
      error.issues.map((issue) => ({
        path: issue.path.map(String).join('.'),
        message: issue.message,
      })),
    );
    return;
  }

  // Error tak terduga dicatat di server, tapi isinya tidak pernah dikirim ke
  // client -- stack trace bisa membocorkan struktur internal.
  console.error('[api] unhandled error', error);
  sendFailure(res, 'INTERNAL', 'Terjadi kesalahan di server');
};
