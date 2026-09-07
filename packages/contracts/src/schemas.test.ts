import { describe, expect, test } from 'vitest';

import { loginSchema, paginationQuerySchema, registerSchema } from './schemas.js';

describe('registerSchema', () => {
  const valid = {
    name: 'Aryo',
    email: 'Aryo@Example.com',
    password: 'rahasia123',
    role: 'INTERN',
  };

  test('menerima pendaftaran intern yang sah dan menormalkan email', () => {
    const parsed = registerSchema.parse(valid);
    expect(parsed.email).toBe('aryo@example.com');
  });

  test('menolak pendaftaran sebagai ADMIN', () => {
    // ADMIN dibuat lewat seed, bukan lewat form publik.
    expect(registerSchema.safeParse({ ...valid, role: 'ADMIN' }).success).toBe(
      false,
    );
  });

  test('menolak password di bawah 8 karakter', () => {
    expect(
      registerSchema.safeParse({ ...valid, password: 'pendek1' }).success,
    ).toBe(false);
  });

  test('menolak email yang tidak berbentuk email', () => {
    expect(registerSchema.safeParse({ ...valid, email: 'aryo' }).success).toBe(
      false,
    );
  });
});

describe('loginSchema', () => {
  test('hanya butuh email dan password', () => {
    const parsed = loginSchema.parse({
      email: 'aryo@example.com',
      password: 'rahasia123',
    });
    expect(parsed.password).toBe('rahasia123');
  });
});

describe('paginationQuerySchema', () => {
  test('memberi nilai bawaan saat query kosong', () => {
    expect(paginationQuerySchema.parse({})).toEqual({ page: 1, limit: 20 });
  });

  test('mengubah angka berbentuk string dari query string', () => {
    expect(paginationQuerySchema.parse({ page: '3', limit: '50' })).toEqual({
      page: 3,
      limit: 50,
    });
  });

  test('menolak limit di atas batas maksimum', () => {
    // Tanpa batas ini, limit bisa dipakai menarik seluruh tabel sekaligus.
    expect(paginationQuerySchema.safeParse({ limit: '5000' }).success).toBe(
      false,
    );
  });
});
