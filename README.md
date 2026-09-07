# internship-management-platform

Platform manajemen magang end-to-end: perusahaan membuka posisi, kandidat melamar,
lamaran diproses sampai diterima, lalu berjalan sebagai penugasan magang dengan
laporan mingguan dan evaluasi akhir.

## Dokumen

| Dokumen | Isi |
|---|---|
| [`docs/prd.md`](docs/prd.md) | Requirement MVP: peran, model data, enum & transisi status, kontrak API, aturan bisnis, DoD |
| [`docs/roadmap-4-minggu.md`](docs/roadmap-4-minggu.md) | Rencana kerja per minggu untuk 1 bulan, DoD per minggu, urutan potong kalau jadwal tertekan |

Backlog MRV ada di `docs/prd.md` §14 — tidak dikerjakan sebelum MVP terbukti jalan.

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

Repo ini **tidak punya branch `main`**. Hanya dua branch tetap:

| Branch | Peran |
|---|---|
| `development` | branch kerja harian, sekaligus staging |
| `production` | rilis produksi — hanya diisi lewat merge PR |

Alur rilis:

```text
feature/<nama>  →  PR ke development  →  merge
development     →  PR ke production   →  CI jalan di PR  →  merge = rilis
```

Aturannya:

- Jangan pernah commit langsung ke `production`.
- Jangan pernah force-push ke `production`.
- Setiap perubahan masuk `production` lewat PR, supaya CI jadi gate sebelum
  merge — bukan pemberitahuan setelah rilis.

## Status

Tahap 0 — repo baru, belum ada aplikasi. Struktur yang direncanakan: monorepo
pnpm dengan `apps/web` (Next.js), `apps/api` (Express), dan `packages/contracts`
berisi schema Zod + enum status yang dipakai kedua sisi.

Urutan pengerjaan mengikuti [`docs/roadmap-4-minggu.md`](docs/roadmap-4-minggu.md):
Fondasi & Auth → Perusahaan & Lowongan → Lamaran, Penugasan, Laporan → Evaluasi,
Admin, Produksi.

Prinsip utama: **MVP dulu sampai jalan end-to-end, MRV belakangan.**
