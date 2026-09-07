import { ERROR_HTTP_STATUS } from '@imp/contracts';
import type {
  ApiFailure,
  ApiFieldError,
  ApiListSuccess,
  ApiSuccess,
  ErrorCode,
  PaginationMeta,
} from '@imp/contracts';
import type { Response } from 'express';

/**
 * Semua response melewati fungsi di sini supaya bentuknya tidak pernah
 * berbeda antar endpoint. Controller tidak memanggil res.json sendiri.
 */

export function sendSuccess<T>(res: Response, data: T, status = 200): void {
  const body: ApiSuccess<T> = { success: true, data };
  res.status(status).json(body);
}

export function sendList<T>(
  res: Response,
  data: readonly T[],
  meta: PaginationMeta,
): void {
  const body: ApiListSuccess<T> = { success: true, data, meta };
  res.status(200).json(body);
}

export function sendFailure(
  res: Response,
  code: ErrorCode,
  message: string,
  details: readonly ApiFieldError[] = [],
): void {
  const body: ApiFailure =
    details.length > 0
      ? { success: false, error: { code, message, details } }
      : { success: false, error: { code, message } };

  res.status(ERROR_HTTP_STATUS[code]).json(body);
}

export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  };
}
