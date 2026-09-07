import { describe, expect, test } from 'vitest';

import { parseEnv } from './env.js';

const lengkap = {
  NODE_ENV: 'development',
  PORT: '4000',
  DATABASE_URL: 'postgresql://imp:imp@localhost:5432/imp',
  JWT_SECRET: 'a'.repeat(32),
  JWT_EXPIRES_IN: '7d',
  CORS_ORIGIN: 'http://localhost:3000',
};

describe('parseEnv', () => {
  test('menerima konfigurasi lengkap dan mengubah PORT jadi angka', () => {
    const env = parseEnv(lengkap);
    expect(env.PORT).toBe(4000);
    expect(env.NODE_ENV).toBe('development');
  });

  test('gagal kalau JWT_SECRET tidak diset', () => {
    const { JWT_SECRET: _dibuang, ...tanpaSecret } = lengkap;
    expect(() => parseEnv(tanpaSecret)).toThrow(/JWT_SECRET/);
  });

  test('gagal kalau JWT_SECRET terlalu pendek', () => {
    expect(() => parseEnv({ ...lengkap, JWT_SECRET: 'pendek' })).toThrow(
      /JWT_SECRET/,
    );
  });

  test('gagal kalau DATABASE_URL tidak diset', () => {
    const { DATABASE_URL: _dibuang, ...tanpaDb } = lengkap;
    expect(() => parseEnv(tanpaDb)).toThrow(/DATABASE_URL/);
  });

  test('gagal kalau DATABASE_URL bukan URL postgres', () => {
    expect(() =>
      parseEnv({ ...lengkap, DATABASE_URL: 'mysql://localhost/imp' }),
    ).toThrow(/DATABASE_URL/);
  });

  test('menyebut SEMUA variabel yang bermasalah, bukan cuma yang pertama', () => {
    // Kalau hanya yang pertama dilaporkan, orang memperbaikinya satu per satu
    // sambil restart terus.
    const { JWT_SECRET: _a, DATABASE_URL: _b, ...kosong } = lengkap;
    let pesan = '';
    try {
      parseEnv(kosong);
    } catch (error) {
      pesan = error instanceof Error ? error.message : String(error);
    }
    expect(pesan).toMatch(/JWT_SECRET/);
    expect(pesan).toMatch(/DATABASE_URL/);
  });

  test('memberi nilai bawaan untuk PORT dan NODE_ENV', () => {
    const { PORT: _p, NODE_ENV: _n, ...tanpaKeduanya } = lengkap;
    const env = parseEnv(tanpaKeduanya);
    expect(env.PORT).toBe(4000);
    expect(env.NODE_ENV).toBe('development');
  });

  test('menolak NODE_ENV di luar daftar yang dikenal', () => {
    expect(() => parseEnv({ ...lengkap, NODE_ENV: 'staging-2' })).toThrow(
      /NODE_ENV/,
    );
  });
});
