import { ERROR_HTTP_STATUS } from '@imp/contracts';
import type { ApiFieldError, ErrorCode } from '@imp/contracts';

/**
 * Satu kelas error untuk seluruh kegagalan yang memang diharapkan. Status HTTP
 * tidak ditentukan ulang di setiap handler, tapi diturunkan dari kode error
 * lewat ERROR_HTTP_STATUS di packages/contracts.
 */
export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details: readonly ApiFieldError[];

  constructor(
    code: ErrorCode,
    message: string,
    details: readonly ApiFieldError[] = [],
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = ERROR_HTTP_STATUS[code];
    this.details = details;
  }
}

export function validationError(
  message: string,
  details: readonly ApiFieldError[] = [],
): AppError {
  return new AppError('VALIDATION_ERROR', message, details);
}

export function unauthenticated(message = 'Autentikasi diperlukan'): AppError {
  return new AppError('UNAUTHENTICATED', message);
}

// Dipakai untuk pelanggaran kepemilikan resource. Lihat docs/prd.md §6.2:
// pelanggaran kepemilikan dijawab 403, bukan 404.
export function forbidden(
  message = 'Kamu tidak berhak mengakses resource ini',
): AppError {
  return new AppError('FORBIDDEN', message);
}

export function notFound(message = 'Resource tidak ditemukan'): AppError {
  return new AppError('NOT_FOUND', message);
}

export function conflict(message: string): AppError {
  return new AppError('CONFLICT', message);
}
