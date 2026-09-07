import { z } from 'zod';

/**
 * Schema di sini adalah satu-satunya definisi bentuk request. Backend memakainya
 * untuk memvalidasi body, frontend memakainya sebagai resolver form. Kalau
 * keduanya punya salinan sendiri, aturannya pasti melenceng.
 */

// ADMIN sengaja tidak ada di daftar ini: akun admin dibuat lewat seed, bukan
// lewat form pendaftaran publik.
const SELF_REGISTERABLE_ROLES = ['COMPANY', 'INTERN'] as const;

const emailSchema = z.email().transform((value) => value.toLowerCase());
const passwordSchema = z.string().min(8).max(128);

export const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(SELF_REGISTERABLE_ROLES),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  // Dibatasi supaya limit tidak bisa dipakai menarik seluruh tabel sekaligus.
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
