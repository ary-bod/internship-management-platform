# internship-management-platform

Platform manajemen magang end-to-end: perusahaan membuka posisi, kandidat melamar,
lamaran diproses sampai diterima, lalu berjalan sebagai penugasan magang dengan
laporan mingguan dan evaluasi akhir.

Spesifikasi lengkap (MVP + MRV): [`docs/spec-mvp-mrv.md`](docs/spec-mvp-mrv.md)

## Tech Stack

| Layer | Pilihan |
|---|---|
| Frontend | Next.js, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Express.js, TypeScript |
| Database | PostgreSQL |
| API | REST |
| Validasi | Zod |
| Auth | JWT / session |

## Peran

| Role | Ringkas |
|---|---|
| `ADMIN` | Kelola user, perusahaan, lowongan, data platform |
| `COMPANY` | Buat lowongan, review pelamar, supervisi peserta magang |
| `INTERN` | Cari lowongan, melamar, kirim laporan, lihat evaluasi |

## Alur Inti

```text
Lowongan → Lamaran → Review → Diterima → Penugasan → Laporan Mingguan → Evaluasi → Selesai
```

## Branch & Alur Rilis

| Branch | Peran |
|---|---|
| `development` | branch kerja harian + staging |
| `main` | production (rilis, deliberate) |

Alur: commit ke `development` → PR `development` → `main` → CI jalan di PR →
merge = rilis production.

Jangan commit langsung ke `main`.

## Status

Tahap 0 — repo baru, belum ada aplikasi. Urutan pengerjaan mengikuti
`docs/spec-mvp-mrv.md` §24: Foundation → Auth → Core CRUD → Business Logic →
Frontend → MRV → Production.

Prinsip utama dari spec: **MVP dulu sampai jalan end-to-end, MRV belakangan.**
