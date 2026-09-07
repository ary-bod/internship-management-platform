/**
 * Bentuk response API. Satu bentuk untuk semua endpoint supaya frontend tidak
 * perlu menebak. Rinciannya di docs/prd.md §6.1-§6.2.
 */

export const ERROR_CODES = [
  'VALIDATION_ERROR',
  'UNAUTHENTICATED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'INTERNAL',
] as const;
export type ErrorCode = (typeof ERROR_CODES)[number];

/** Pemetaan kode error ke status HTTP, supaya tidak ditentukan ulang per handler. */
export const ERROR_HTTP_STATUS: Readonly<Record<ErrorCode, number>> = {
  VALIDATION_ERROR: 400,
  UNAUTHENTICATED: 401,
  // FORBIDDEN dipakai untuk pelanggaran kepemilikan resource, bukan NOT_FOUND.
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL: 500,
};

export type ApiFieldError = {
  readonly path: string;
  readonly message: string;
};

export type PaginationMeta = {
  readonly page: number;
  readonly limit: number;
  readonly total: number;
  readonly totalPages: number;
};

export type ApiSuccess<T> = {
  readonly success: true;
  readonly data: T;
};

export type ApiListSuccess<T> = {
  readonly success: true;
  readonly data: readonly T[];
  readonly meta: PaginationMeta;
};

export type ApiFailure = {
  readonly success: false;
  readonly error: {
    readonly code: ErrorCode;
    readonly message: string;
    readonly details?: readonly ApiFieldError[];
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiListSuccess<T> | ApiFailure;
