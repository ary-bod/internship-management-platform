import cors from 'cors';
import express from 'express';
import type { Express } from 'express';

import type { Env } from './config/env.js';
import { errorHandler, notFoundHandler } from './http/error-handler.js';
import { createRouter } from './routes/index.js';

/**
 * App dibuat lewat fungsi yang menerima Env, bukan membaca konfigurasi global.
 * Itu yang membuat app bisa diuji tanpa menyiapkan environment sungguhan.
 *
 * Urutan middleware penting: notFoundHandler harus setelah semua rute, dan
 * errorHandler harus paling akhir.
 */
export function createApp(env: Env): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '1mb' }));

  app.use(createRouter());

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
