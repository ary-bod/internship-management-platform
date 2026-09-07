import { z } from 'zod';

/**
 * Konfigurasi environment divalidasi sekali di satu tempat, dan `parseEnv`
 * sengaja menerima sumbernya sebagai argumen (bukan membaca `process.env`
 * langsung) supaya bisa diuji dan supaya tidak ada modul yang diam-diam
 * membaca variabel mentah di tengah kode.
 *
 * Variabel yang tidak diset akan bernilai undefined dan bisa lolos jadi teks
 * "undefined" di dalam URL atau token kalau tidak dijaga di sini.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DATABASE_URL: z
    .string()
    .min(1)
    .refine((value) => /^postgres(ql)?:\/\//.test(value), {
      message: 'harus URL PostgreSQL, contoh postgresql://user:pass@host:5432/db',
    }),
  JWT_SECRET: z.string().min(32, 'minimal 32 karakter'),
  JWT_EXPIRES_IN: z.string().min(1).default('7d'),
  CORS_ORIGIN: z.string().min(1).default('http://localhost:3000'),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(source: Record<string, string | undefined>): Env {
  const hasil = envSchema.safeParse(source);
  if (hasil.success) {
    return hasil.data;
  }

  // Semua variabel bermasalah dilaporkan sekaligus. Kalau hanya yang pertama,
  // orang memperbaikinya satu per satu sambil restart terus.
  const rincian = hasil.error.issues
    .map((issue) => `${issue.path.map(String).join('.')}: ${issue.message}`)
    .join('\n  - ');

  throw new Error(`Konfigurasi environment tidak valid:\n  - ${rincian}`);
}
