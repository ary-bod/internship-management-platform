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

## Struktur

```text
apps/
  api/                 Express + TypeScript (routes → controllers → services → repositories)
  web/                 Next.js App Router + Tailwind CSS
packages/
  contracts/           enum, tabel transisi status, schema Zod — dipakai api DAN web
docker-compose.yml     PostgreSQL untuk pengembangan lokal
```

`packages/contracts` adalah alasan utama repo ini digabung: aturan transisi
status dan schema validasi hidup di satu tempat, lalu backend memakainya untuk
menolak dan frontend memakainya untuk menentukan tombol mana yang muncul. Dua
sisi tidak bisa berbeda pendapat soal status.

## Menjalankan di lokal

Butuh Node ≥ 22, pnpm 11, dan Docker.

```bash
pnpm install

cp .env.example .env                      # kredensial Postgres lokal
cp apps/api/.env.example apps/api/.env    # isi JWT_SECRET (min 32 karakter)
cp apps/web/.env.example apps/web/.env.local

pnpm db:up                                # Postgres di 127.0.0.1:5432
pnpm dev                                  # api :4000, web :3000
```

API sengaja **gagal start** kalau `JWT_SECRET` atau `DATABASE_URL` kosong,
dengan pesan yang menyebut semua variabel bermasalah sekaligus — bukan jalan
setengah lalu error di request pertama.

## Perintah

| Perintah | Isi |
|---|---|
| `pnpm dev` | build contracts, lalu jalankan api + web bersamaan |
| `pnpm lint` | ESLint seluruh repo (`eslint-disable` dimatikan, jadi lint tidak bisa dibungkam) |
| `pnpm typecheck` | `tsc --noEmit` di semua paket |
| `pnpm test` | Vitest di semua paket yang punya test |
| `pnpm build` | contracts → api → web |
| `pnpm verify` | keempatnya berurutan — sama dengan yang dijalankan CI |
| `pnpm db:up` / `pnpm db:down` | Postgres lokal |

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

Minggu 1 hari 1 selesai: monorepo pnpm berjalan, TypeScript strict, ESLint,
Postgres lewat Docker, validasi environment yang gagal-cepat, kerangka Express
berlapis dengan envelope response, dan halaman Next pertama yang membaca enum
dari `@imp/contracts`. Gate `pnpm verify` hijau (32 test).

Belum ada: database schema, migrasi, autentikasi, dan seluruh fitur produk.
Urutan berikutnya ada di [`docs/roadmap-4-minggu.md`](docs/roadmap-4-minggu.md):
Fondasi & Auth → Perusahaan & Lowongan → Lamaran, Penugasan, Laporan →
Evaluasi, Admin, Produksi.

Prinsip utama: **MVP dulu sampai jalan end-to-end, MRV belakangan.**
