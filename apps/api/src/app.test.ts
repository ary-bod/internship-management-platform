import request from 'supertest';
import { describe, expect, test } from 'vitest';

import { createApp } from './app.js';
import type { Env } from './config/env.js';

const env: Env = {
  NODE_ENV: 'test',
  PORT: 4000,
  DATABASE_URL: 'postgresql://imp:imp@localhost:5432/imp',
  JWT_SECRET: 'a'.repeat(32),
  JWT_EXPIRES_IN: '7d',
  CORS_ORIGIN: 'http://localhost:3000',
};

describe('createApp', () => {
  test('GET /health mengembalikan envelope sukses', async () => {
    const res = await request(createApp(env)).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: { status: 'ok' } });
  });

  test('rute yang tidak ada mengembalikan envelope gagal, bukan halaman HTML Express', async () => {
    const res = await request(createApp(env)).get('/rute-yang-tidak-ada');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  test('CORS dibatasi ke origin dari konfigurasi', async () => {
    const res = await request(createApp(env))
      .get('/health')
      .set('Origin', env.CORS_ORIGIN);

    expect(res.headers['access-control-allow-origin']).toBe(env.CORS_ORIGIN);
  });
});
