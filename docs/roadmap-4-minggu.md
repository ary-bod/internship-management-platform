# Roadmap 4 Minggu — MVP

Rencana kerja per minggu untuk menyelesaikan **MVP** dalam satu bulan.
Acuan isi: [`prd.md`](prd.md). Fitur MRV tidak dikerjakan di periode ini.

## Asumsi

| | |
|---|---|
| Pelaksana | 1 orang, penuh waktu |
| Hari kerja | 5 hari/minggu → total 20 hari kerja |
| Review mentor | setiap Jumat, demo alur yang jalan (bukan presentasi slide) |
| Definisi "selesai" per minggu | seluruh checklist DoD minggu itu terbukti dijalankan, bukan diperkirakan |

Kalau salah satu asumsi ini berubah, rencananya ikut berubah — jangan dipaksa
masuk ke jadwal yang sama.

## Ringkasan

| Minggu | Tema | Hasil yang bisa didemokan |
|---|---|---|
| 1 | Fondasi & autentikasi | Orang bisa register, login, dan ditolak saat tidak berhak |
| 2 | Perusahaan & lowongan | Perusahaan buat lowongan, publik bisa mencarinya |
| 3 | Lamaran, penugasan, laporan | Melamar → diterima → jadi penugasan → kirim laporan |
| 4 | Evaluasi, admin, produksi | Evaluasi akhir, panel admin, ter-deploy, CI ijo |

Urutannya bukan selera: tiap minggu memakai hasil minggu sebelumnya sebagai
pondasi. Minggu 3 adalah minggu terberat karena semua aturan bisnis ada di sana —
kalau ada minggu yang perlu longgar, longgarkan minggu 2, bukan minggu 3.

---

## Minggu 1 — Fondasi & Autentikasi

**Tujuan:** repo bisa dijalankan orang lain dari nol, database punya bentuk, dan
autentikasi beserta tiga lapis pengecekan (§2 PRD) benar-benar bekerja.

| Hari | Kerjaan |
|---|---|
| 1 | Struktur monorepo (`apps/web`, `apps/api`, `packages/contracts`), TypeScript strict, ESLint, `docker-compose.yml` untuk Postgres, validasi env pakai Zod |
| 2 | ERD + migrasi untuk 8 tabel §4.2 PRD, seed akun demo (1 admin, 1 company, 1 intern) |
| 3 | `packages/contracts`: enum + tabel transisi §5 + schema Zod auth. Service register/login, hash password, terbitkan JWT |
| 4 | Middleware `auth` → `authorize(role)` → `ownership`, `GET /auth/me`, error handler terpusat + envelope response §6.1 |
| 5 | Frontend: layout dasar, `/login`, `/register`, penyimpanan sesi, redirect sesuai role. Demo + review |

**Deliverable**

- ERD (gambar atau teks di `docs/`)
- Migrasi yang bisa dijalankan dari database kosong
- 4 endpoint auth
- 2 halaman frontend
- README bagian "Local Development" yang benar-benar diikuti sekali dari nol

**Definition of Done**

- [ ] `docker compose up` + satu perintah migrasi → database siap dari kosong
- [ ] Register → login → `GET /auth/me` mengembalikan user yang benar
- [ ] Endpoint terlindungi menolak tanpa token (`401`) dan menolak role salah (`403`)
- [ ] Password tidak pernah muncul di response mana pun
- [ ] 4 test auth §12 PRD ijo
- [ ] Aplikasi gagal start (bukan jalan diam-diam) kalau `JWT_SECRET` atau `DATABASE_URL` tidak diset

**Tidak dikerjakan minggu ini:** refresh token, reset password, verifikasi email.

**Butuh jawaban sebelum mulai:** keputusan terbuka #5 (registrasi COMPANY perlu verifikasi admin atau tidak).

---

## Minggu 2 — Perusahaan & Lowongan

**Tujuan:** siklus CRUD pertama yang lengkap, sekaligus tempat pertama pengecekan
ownership diuji secara nyata.

| Hari | Kerjaan |
|---|---|
| 6 | `GET`/`PATCH /companies/me`, halaman profil perusahaan |
| 7 | CRUD lowongan + pengecekan ownership di `PATCH`/`DELETE` |
| 8 | `GET /internships` publik: search, filter lokasi & work type, pagination, sorting (§6.4 PRD) |
| 9 | Frontend company: dashboard, form create/edit pakai React Hook Form + schema dari `packages/contracts` |
| 10 | Frontend publik: daftar lowongan + filter UI, halaman detail. Demo + review |

**Deliverable**

- 7 endpoint (2 perusahaan, 5 lowongan)
- 5 halaman (profil perusahaan, dashboard, form, daftar publik, detail publik)
- Filter UI yang benar-benar memanggil query string, bukan menyaring di klien

**Definition of Done**

- [ ] Company A tidak bisa mengubah maupun menghapus lowongan Company B (`403`, ada testnya)
- [ ] Daftar publik bisa dicari, difilter, dan dipaginasi; `meta` pagination terisi benar
- [ ] `limit` di atas batas maksimum ditolak
- [ ] Form menolak input tidak valid di frontend **dan** backend memakai schema yang sama
- [ ] Lowongan berstatus `DRAFT` tidak muncul di daftar publik
- [ ] Kelima halaman menangani keadaan loading, kosong, error

**Kalau waktunya mepet, yang dipotong lebih dulu:** sorting dan halaman profil perusahaan. Jangan potong pengecekan ownership.

---

## Minggu 3 — Lamaran, Penugasan, Laporan

**Tujuan:** minggu inti. Semua aturan bisnis §7 PRD tinggal di sini, dan
kebanyakan bug produk berasal dari minggu ini kalau dikerjakan terburu-buru.

| Hari | Kerjaan |
|---|---|
| 11 | `POST /internships/:id/apply` + tiga aturan: sekali per lowongan, lowongan harus `OPEN`, kuota dihitung dalam transaksi |
| 12 | Tabel transisi §5.1 → `PATCH /applications/:id/status`; saat `ACCEPTED` penugasan dibuat dalam transaksi yang sama dan idempoten |
| 13 | Laporan mingguan: buat, edit (hanya `DRAFT`/`REVISION_REQUESTED`), kirim, review + feedback |
| 14 | Frontend intern: `/my-applications`, `/my-internship`, `/my-internship/reports` |
| 15 | Frontend company: review pelamar (ubah status), review laporan. Demo + review |

**Deliverable**

- 10 endpoint (lamaran, penugasan, laporan)
- 5 halaman
- Tabel transisi hidup di `packages/contracts` dan dipakai dua sisi: backend menolak, frontend menyembunyikan tombolnya

**Definition of Done**

- [ ] 6 test lamaran §12 PRD ijo, termasuk penolakan transisi tidak sah
- [ ] Melamar dua kali → `409`, bukan baris kedua di database
- [ ] Kuota penuh → `409`; dua request bersamaan tidak bisa keduanya lolos
- [ ] `ACCEPTED` menghasilkan **tepat satu** penugasan; request diulang tidak menambah
- [ ] Edit laporan ditolak kalau statusnya `SUBMITTED` atau `REVIEWED`
- [ ] Satu laporan per (penugasan, nomor minggu) — yang kedua ditolak
- [ ] Intern hanya melihat lamaran & laporan miliknya (`403` untuk milik orang lain)

**Butuh jawaban sebelum mulai:** keputusan terbuka #1, #2, #3, #4, #6.

**Kalau waktunya mepet:** geser halaman frontend ke minggu 4, jangan geser aturan
bisnisnya. Aturan yang bolong di minggu 3 akan muncul kembali sebagai data rusak
di minggu 4.

---

## Minggu 4 — Evaluasi, Admin, Produksi

**Tujuan:** menutup alur, menyiapkan panel admin, dan membuat aplikasi bisa
dijalankan orang lain di lingkungan nyata.

| Hari | Kerjaan |
|---|---|
| 16 | Endpoint evaluasi + aturan skor 1–5 + satu evaluasi per penugasan |
| 17 | Admin: `/admin/stats`, daftar users/companies/internships/applications, aktif/nonaktif perusahaan |
| 18 | Frontend: form evaluasi, halaman intern read-only, 4 halaman admin, penyeragaman keadaan loading/kosong/error, toast, dialog konfirmasi |
| 19 | Test integrasi §12 PRD, Dockerfile `api` + `web`, pipeline CI (lint → tsc → test → build), migrasi otomatis saat deploy |
| 20 | Deploy `development` (staging) → PR ke `production` → deploy produksi. README lengkap + akun demo. Demo akhir |

**Deliverable**

- 3 endpoint evaluasi + 6 endpoint admin
- 6 halaman
- Dockerfile + CI yang ijo
- URL staging & produksi yang hidup, dengan akun demo yang benar-benar bisa dipakai
- README sesuai §25 spec: overview, arsitektur, stack, skema DB, variabel env, cara jalan lokal, dokumentasi API, testing, deployment

**Definition of Done**

- [ ] 15 baris Definition of Done §13 PRD terbukti satu per satu
- [ ] Skor di luar 1–5 ditolak; evaluasi kedua untuk penugasan yang sama ditolak
- [ ] Semua test §12 PRD ijo di CI, bukan hanya di laptop
- [ ] CI menjalankan lint, typecheck, test, build — dan gagal kalau salah satu gagal
- [ ] Aplikasi hidup di staging dan produksi, akun demo berhasil login di keduanya
- [ ] Tidak ada rahasia yang ter-commit; hanya `.env.example` yang masuk repo

---

## Checkpoint Jumat

Format review tiap minggu — pendek, dan dijawab dengan bukti:

1. Apa yang sudah jalan? (demokan, bukan ceritakan)
2. Apa yang masuk rencana minggu ini tapi tidak selesai, dan kenapa?
3. Blocker yang butuh keputusan orang lain?
4. Apakah semua checklist DoD minggu ini benar-benar dijalankan, atau ada yang diasumsikan?

Pertanyaan nomor 4 yang paling penting. "Seharusnya jalan" bukan status.

---

## Risiko & Mitigasi

| Risiko | Tanda awal | Mitigasi |
|---|---|---|
| Minggu 1 melebar ke setup tooling | Hari 3 masih mengurus konfigurasi | Pakai konfigurasi paling sederhana yang jalan; jangan pasang Nx/Turborepo, monorepo pnpm polos cukup |
| Aturan bisnis minggu 3 dikerjakan di frontend | Backend menerima transisi tidak sah, tombolnya saja yang disembunyikan | Test transisi jalan langsung ke API, bukan lewat UI |
| Frontend menghabiskan minggu 4 | Hari 18 masih membangun halaman | Potong polish visual, jangan potong test dan deploy |
| Deploy ditinggal di hari terakhir | Hari 20 baru pertama kali menyentuh Docker | Coba deploy staging paling lambat hari 19 |
| Keputusan terbuka §15 PRD tidak terjawab | Muncul asumsi diam-diam di kode | Tanyakan di checkpoint Jumat minggu sebelumnya |

**Urutan potong kalau jadwal tertekan** — dari yang pertama dilepas:
polish visual → sorting & filter tambahan → halaman admin → notifikasi.
Yang **tidak** boleh dipotong: pengecekan ownership, tabel transisi status,
aturan kuota, dan test §12 PRD. Empat hal itu yang membedakan aplikasi jalan
dari aplikasi yang datanya rusak diam-diam.

---

## Setelah Bulan 1

Backlog MRV di §14 PRD, urutan yang disarankan:

| Minggu | Isi |
|---|---|
| 5 | Notifikasi dalam aplikasi + auth lanjutan (refresh token, reset password) |
| 6 | Upload file (CV, portofolio, lampiran laporan) + pencarian & filter lengkap |
| 7 | Audit log + dashboard analitik |
| 8 | Rate limiting, logging terstruktur, Helmet, dokumentasi API lengkap |

Ini sketsa, bukan komitmen. Disusun ulang setelah MVP terbukti jalan.
