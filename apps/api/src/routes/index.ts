import { Router } from 'express';

import { sendSuccess } from '../http/response.js';

/**
 * File rute hanya memetakan path ke handler. Tidak ada logika bisnis di sini --
 * itu tinggal di service. Lihat docs/prd.md §9.
 */
export function createRouter(): Router {
  const router = Router();

  router.get('/health', (_req, res) => {
    sendSuccess(res, { status: 'ok' });
  });

  return router;
}
