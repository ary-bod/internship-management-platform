# PRD — Internship Management Platform

| | |
|---|---|
| Versi | 1.0 |
| Status | Draft — menunggu konfirmasi §15 |
| Sumber | Spesifikasi awal MVP + MRV (lihat §16 untuk daftar perubahan) |
| Cakupan dokumen ini | **MVP**. Fitur MRV dicatat sebagai backlog di §14 |
| Rencana waktu | [`roadmap-4-minggu.md`](roadmap-4-minggu.md) |

Prinsip yang mengikat seluruh dokumen:

> **MVP dulu sampai alurnya jalan utuh dari register sampai evaluasi. Jangan mulai fitur MRV sebelum itu terbukti.**

---

## 1. Ringkasan & Tujuan

Platform yang mengelola siklus hidup magang dalam satu alur: perusahaan membuka
posisi, kandidat melamar, lamaran diproses sampai diterima, hasilnya jadi
penugasan magang berjalan dengan laporan mingguan, ditutup evaluasi akhir.

Yang dianggap berhasil: satu orang bisa menjalani alur itu dari ujung ke ujung
tanpa ada langkah yang harus diakali lewat database. Daftar buktinya di §13.

### Stack

| Lapis | Pilihan |
|---|---|
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, React Hook Form |
| Backend | Express.js, TypeScript |
| Database | PostgreSQL |
| API | REST |
| Validasi | Zod — satu schema dipakai backend dan frontend |
| Auth | JWT |

---

## 2. Peran & Hak Akses

| Role | Ringkas |
|---|---|
| `ADMIN` | Melihat & mengelola user, perusahaan, lowongan, lamaran; aktif/nonaktifkan perusahaan |
| `COMPANY` | Mengelola profil perusahaan, membuat lowongan, mereview pelamar, mereview laporan, mengevaluasi |
| `INTERN` | Mencari & melamar lowongan, mengirim laporan mingguan, melihat evaluasi |

Tiga lapis pengecekan, **berurutan**, dan lapis ketiga yang paling sering
dilupakan:

```text
Authentication   → siapa kamu (token valid?)
Authorization    → role kamu boleh akses endpoint ini?
Resource Ownership → data yang kamu sentuh memang milikmu?
```

Contoh yang wajib ditolak: user Company A dan user Company B dua-duanya
ber-role `COMPANY`, tapi A tidak boleh mengubah lowongan milik B. Role saja
tidak cukup — pengecekan ownership tetap harus jalan.

---

## 3. Alur Bisnis Inti

```text
COMPANY buat lowongan
        │
        ▼
INTERN cari lowongan  →  melamar
        │
        ▼
COMPANY review lamaran  →  terima / tolak
        │
        ▼ (diterima)
Penugasan magang dibuat
        │
        ├── INTERN kirim laporan mingguan → supervisor review
        │
        ▼
COMPANY isi evaluasi akhir
        │
        ▼
Magang selesai
```

**Lamaran dan penugasan itu dua hal berbeda.** Lamaran adalah proses rekrutmen
dan berhenti begitu diterima atau ditolak. Penugasan adalah hubungan magang yang
sebenarnya dan punya siklus hidupnya sendiri. Pemisahan ini yang menentukan
bentuk tabel status di §5 — lihat juga catatan §16.2.

---

## 4. Model Data

### 4.1 Relasi

```text
users ──1:1── companies ──1:N── internships
  │                                  │
  │                                  └──1:N── applications
  │                                              │
  └──────────────1:N── applications              │ (ACCEPTED)
                                                 ▼
                                     internship_assignments
                                                 │
                                                 ├──1:N── weekly_reports
                                                 └──1:1── evaluations

users ──1:N── notifications
```

### 4.2 Tabel

Semua tabel punya `id`, `created_at`, `updated_at`. Kolom nullable ditandai `?`.

**users**

| Kolom | Tipe | Catatan |
|---|---|---|
| `email` | text | unique, lowercase |
| `password_hash` | text | bcrypt/argon2 — **bukan** password |
| `name` | text | |
| `role` | enum | `ADMIN` \| `COMPANY` \| `INTERN` |
| `is_active` | bool | default true |

**companies**

| Kolom | Tipe | Catatan |
|---|---|---|
| `user_id` | fk users | unique — satu user COMPANY punya satu perusahaan |
| `name`, `description`, `industry`, `website?`, `location` | text | |
| `logo_url?` | text | metadata file, bukan biner (§18) |
| `is_active` | bool | diatur ADMIN |

**internships**

| Kolom | Tipe | Catatan |
|---|---|---|
| `company_id` | fk companies | |
| `title`, `description`, `requirements`, `location` | text | |
| `work_type` | enum | `ONSITE` \| `HYBRID` \| `REMOTE` |
| `start_date`, `end_date` | date | `end_date` > `start_date` |
| `quota` | int | ≥ 1 |
| `status` | enum | `DRAFT` \| `OPEN` \| `CLOSED` |

**applications**

| Kolom | Tipe | Catatan |
|---|---|---|
| `internship_id` | fk internships | **unique bersama `intern_id`** |
| `intern_id` | fk users | role harus `INTERN` |
| `status` | enum | §5.1 |
| `cover_letter?` | text | |

**internship_assignments**

| Kolom | Tipe | Catatan |
|---|---|---|
| `application_id` | fk applications | unique — satu lamaran maksimal satu penugasan |
| `internship_id`, `intern_id` | fk | disalin saat dibuat |
| `supervisor_id?` | fk users | user COMPANY dari perusahaan yang sama |
| `start_date`, `end_date` | date | default dari lowongan, boleh dioverride |
| `status` | enum | §5.3 |

**weekly_reports**

| Kolom | Tipe | Catatan |
|---|---|---|
| `assignment_id` | fk | **unique bersama `week_number`** |
| `week_number` | int | ≥ 1 |
| `what_i_did`, `challenges`, `next_week` | text | |
| `status` | enum | §5.2 |
| `feedback?` | text | diisi reviewer |
| `reviewed_by?` | fk users | |
| `reviewed_at?` | timestamp | |

**evaluations**

| Kolom | Tipe | Catatan |
|---|---|---|
| `assignment_id` | fk | unique — satu penugasan satu evaluasi |
| `technical_skill`, `communication`, `teamwork`, `problem_solving`, `discipline`, `overall` | int | 1–5, divalidasi di schema |
| `comments?` | text | |
| `evaluated_by` | fk users | |

**notifications**

| Kolom | Tipe | Catatan |
|---|---|---|
| `user_id` | fk users | penerima |
| `type` | text | mis. `APPLICATION_ACCEPTED` |
| `title`, `body` | text | |
| `resource_type?`, `resource_id?` | text/uuid | untuk deep-link |
| `read_at?` | timestamp | null = belum dibaca |

---

## 5. Enum & Aturan Transisi Status

Ini bagian yang paling sering jadi sumber bug, jadi dibikin satu sumber:
**tabel transisi**, bukan `if` yang tersebar di controller. Enum + tabel ini
tinggal di `packages/contracts` dan dipakai backend (validasi) sekaligus
frontend (menentukan tombol mana yang muncul).

### 5.1 Status lamaran (`applications.status`)

| Dari | Boleh ke |
|---|---|
| `PENDING` | `REVIEWING`, `REJECTED` |
| `REVIEWING` | `INTERVIEW`, `REJECTED` |
| `INTERVIEW` | `ACCEPTED`, `REJECTED` |
| `ACCEPTED` | — (terminal, memicu pembuatan penugasan) |
| `REJECTED` | — (terminal) |

Yang eksplisit **dilarang** dan wajib ada testnya: `ACCEPTED → PENDING`, dan
semua lompatan mundur lainnya. `REJECTED` adalah cabang dari tiap tahap review,
bukan tahap setelah `ACCEPTED` — lihat §16.1.

MRV menambah `OFFERED` antara `INTERVIEW` dan `ACCEPTED`, plus `DECLINED` kalau
kandidat menolak tawaran (§14).

### 5.2 Status laporan (`weekly_reports.status`)

| Dari | Boleh ke | Oleh |
|---|---|---|
| `DRAFT` | `SUBMITTED` | INTERN pemilik |
| `SUBMITTED` | `REVIEWED` | COMPANY pemilik |
| `SUBMITTED` | `REVISION_REQUESTED` | COMPANY pemilik |
| `REVISION_REQUESTED` | `SUBMITTED` | INTERN pemilik |
| `REVIEWED` | — (terminal) | |

Isi laporan hanya boleh diedit saat `DRAFT` atau `REVISION_REQUESTED`.
`REVISION_REQUESTED` adalah tambahan dari spec awal — alasannya di §16.3.

### 5.3 Status penugasan (`internship_assignments.status`)

| Dari | Boleh ke |
|---|---|
| `ONBOARDING` | `ACTIVE` |
| `ACTIVE` | `COMPLETED` |
| `COMPLETED` | — (terminal) |

Evaluasi akhir hanya boleh diisi saat `ACTIVE` atau `COMPLETED`.

---

## 6. Kontrak API

### 6.1 Format response

Satu bentuk untuk semua endpoint — ini yang bikin frontend tidak perlu menebak.

Sukses:

```json
{ "success": true, "data": { } }
```

Sukses berdaftar (list):

```json
{
  "success": true,
  "data": [],
  "meta": { "page": 1, "limit": 20, "total": 128, "totalPages": 7 }
}
```

Gagal:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Body tidak valid",
    "details": [{ "path": "email", "message": "Format email salah" }]
  }
}
```

### 6.2 Kode error

| `code` | HTTP | Kapan |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Body/query gagal validasi Zod |
| `UNAUTHENTICATED` | 401 | Token tidak ada / tidak valid / kedaluwarsa |
| `FORBIDDEN` | 403 | Role salah, atau resource bukan miliknya |
| `NOT_FOUND` | 404 | Resource tidak ada |
| `CONFLICT` | 409 | Melamar dua kali, kuota penuh, transisi status tidak sah |
| `INTERNAL` | 500 | Tak tertangani — jangan bocorkan stack ke client |

`403` dipakai untuk pelanggaran ownership, **bukan** `404`.

### 6.3 Daftar endpoint

Kolom "Akses" berarti: role yang diizinkan, dan `(pemilik)` berarti pengecekan
ownership tetap jalan di atas role itu.

**Auth**

| Method | Path | Akses |
|---|---|---|
| POST | `/auth/register` | publik |
| POST | `/auth/login` | publik |
| POST | `/auth/logout` | terautentikasi |
| GET | `/auth/me` | terautentikasi |

**Perusahaan**

| Method | Path | Akses |
|---|---|---|
| GET | `/companies/me` | COMPANY |
| PATCH | `/companies/me` | COMPANY |

**Lowongan**

| Method | Path | Akses |
|---|---|---|
| GET | `/internships` | publik — filter & pagination §17 |
| GET | `/internships/:id` | publik |
| POST | `/internships` | COMPANY |
| PATCH | `/internships/:id` | COMPANY (pemilik) |
| DELETE | `/internships/:id` | COMPANY (pemilik) |

**Lamaran**

| Method | Path | Akses |
|---|---|---|
| POST | `/internships/:id/apply` | INTERN |
| GET | `/applications/me` | INTERN |
| GET | `/internships/:id/applications` | COMPANY (pemilik lowongan) |
| GET | `/applications/:id` | INTERN (pemilik) \| COMPANY (pemilik lowongan) \| ADMIN |
| PATCH | `/applications/:id/status` | COMPANY (pemilik lowongan) |

**Penugasan**

| Method | Path | Akses |
|---|---|---|
| GET | `/assignments/me` | INTERN |
| GET | `/company/assignments` | COMPANY — daftar peserta magang aktif |
| GET | `/assignments/:id` | INTERN (pemilik) \| COMPANY (pemilik) \| ADMIN |

**Laporan mingguan**

| Method | Path | Akses |
|---|---|---|
| POST | `/assignments/:id/reports` | INTERN (pemilik) |
| GET | `/assignments/:id/reports` | INTERN (pemilik) \| COMPANY (pemilik) |
| GET | `/reports/:id` | INTERN (pemilik) \| COMPANY (pemilik) |
| PATCH | `/reports/:id` | INTERN (pemilik) — hanya `DRAFT`/`REVISION_REQUESTED` |
| POST | `/reports/:id/review` | COMPANY (pemilik) |

**Evaluasi**

| Method | Path | Akses |
|---|---|---|
| POST | `/assignments/:id/evaluation` | COMPANY (pemilik) |
| GET | `/assignments/:id/evaluation` | INTERN (pemilik) \| COMPANY (pemilik) \| ADMIN |
| PATCH | `/evaluations/:id` | COMPANY (pemilik) |

**Admin**

| Method | Path | Akses |
|---|---|---|
| GET | `/admin/stats` | ADMIN — angka dashboard §9 spec |
| GET | `/admin/users` | ADMIN |
| GET | `/admin/companies` | ADMIN |
| PATCH | `/admin/companies/:id/status` | ADMIN — aktif/nonaktif |
| GET | `/admin/internships` | ADMIN |
| GET | `/admin/applications` | ADMIN |

### 6.4 Query pencarian lowongan

```text
GET /internships?search=frontend&location=jakarta&work_type=HYBRID&status=OPEN&page=1&limit=20&sort=created_at:desc
```

`limit` dibatasi maksimum (mis. 100) supaya tidak bisa dipakai menarik seluruh tabel.

---

## 7. Aturan Bisnis yang Wajib Divalidasi Backend

Frontend boleh menyembunyikan tombol, tapi keputusannya tetap di backend.

1. Satu intern tidak boleh melamar lowongan yang sama dua kali → unique index `(internship_id, intern_id)` + `409 CONFLICT`.
2. Tidak boleh melamar lowongan yang statusnya bukan `OPEN`.
3. Tidak boleh melamar kalau jumlah lamaran `ACCEPTED` sudah mencapai `quota` → hitungan dan penyisipan dalam **satu transaksi**, kalau tidak dua orang bisa masuk lewat celah yang sama.
4. `COMPANY` hanya boleh menyentuh resource dengan `company_id` miliknya.
5. `INTERN` hanya boleh melihat lamaran, penugasan, laporan, dan evaluasi miliknya.
6. Perubahan status hanya sah kalau ada di tabel §5.
7. Saat lamaran jadi `ACCEPTED`, penugasan dibuat dalam transaksi yang sama, dan operasi ini idempoten — mengulang request tidak boleh menghasilkan dua penugasan.
8. Isi laporan hanya bisa diedit saat `DRAFT`/`REVISION_REQUESTED`.
9. Satu laporan per `(assignment_id, week_number)`.
10. Satu evaluasi per penugasan, semua skor integer 1–5.
11. Password disimpan sebagai hash, minimal 8 karakter, tidak pernah muncul di response mana pun.
12. `end_date` harus setelah `start_date`, di lowongan maupun penugasan.

---

## 8. Halaman Frontend

**Publik**

```text
/                     landing
/internships          daftar lowongan + filter
/internships/:id      detail + tombol lamar
/login
/register
```

**INTERN**

```text
/dashboard
/my-applications              riwayat lamaran + status
/my-internship                penugasan aktif
/my-internship/reports        daftar + form laporan mingguan
/my-internship/evaluation     hasil evaluasi (read-only)
```

**COMPANY**

```text
/company/dashboard
/company/internships
/company/internships/new
/company/internships/:id
/company/internships/:id/applications   review pelamar + ubah status
/company/interns                        peserta magang aktif
/company/interns/:id                    detail + laporan + form evaluasi
```

**ADMIN**

```text
/admin/dashboard
/admin/users
/admin/companies
/admin/internships
```

Setiap halaman wajib punya empat keadaan: loading, kosong, error, dan berisi.
Halaman yang cuma menangani keadaan "berisi" dianggap belum selesai.

---

## 9. Arsitektur

Backend berlapis. Logika bisnis tidak pernah tinggal di file route.

```text
HTTP Request
   ↓ Route            hanya memetakan path → handler
   ↓ Middleware       auth → authorization → validasi (Zod)
   ↓ Controller       baca request, panggil service, bentuk response
   ↓ Service          aturan bisnis §7, transaksi, transisi status
   ↓ Repository       satu-satunya tempat query SQL
   ↓ PostgreSQL
```

Aturan yang menahan agar tidak melenceng:

- Controller tidak menulis SQL.
- Service tidak menyentuh objek `req`/`res`.
- Repository tidak memutuskan aturan bisnis.
- Route tidak berisi logika sama sekali.

---

## 10. Non-Functional

| Aspek | MVP | MRV |
|---|---|---|
| Error handling | handler terpusat + envelope §6.1 | + kode error granular, logging terstruktur |
| Validasi | Zod di semua body & query | + sanitasi upload |
| Validasi env | Zod saat boot, gagal = proses berhenti | sama |
| Migrasi DB | wajib, versioned, jalan di CI | + rollback teruji |
| Transaksi | untuk kuota & pembuatan penugasan | + di semua operasi multi-tabel |
| Rate limiting | — | wajib di auth & apply |
| CORS / Helmet | CORS diatur eksplisit | + Helmet, CSP |
| Logging | request log sederhana | terstruktur + correlation id |
| Responsif & aksesibilitas | layout jalan di mobile | + audit a11y |

---

## 11. Lingkungan & Konfigurasi

Semua divalidasi Zod saat startup. Tidak ada `process.env.X` yang dibaca
mentah di tengah kode — variabel yang tidak diset akan jadi `undefined` dan
diam-diam masuk ke output.

**apps/api**

| Variabel | Contoh |
|---|---|
| `NODE_ENV` | `development` |
| `PORT` | `4000` |
| `DATABASE_URL` | `postgresql://user:pass@localhost:5432/imp` |
| `JWT_SECRET` | (rahasia, tidak pernah di-commit) |
| `JWT_EXPIRES_IN` | `7d` |
| `CORS_ORIGIN` | `http://localhost:3000` |

**apps/web**

| Variabel | Contoh |
|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` |

`.env` masuk `.gitignore`; yang di-commit hanya `.env.example` tanpa nilai nyata.

---

## 12. Testing

MVP: manual testing boleh, **kecuali** daftar di bawah — ini otomatis sejak awal
karena semuanya aturan yang kalau bocor merusak data.

**Auth**

- [ ] User bisa register
- [ ] User bisa login
- [ ] Kredensial salah ditolak
- [ ] Endpoint terlindungi menolak request tanpa token

**Lamaran**

- [ ] INTERN bisa melamar
- [ ] COMPANY tidak bisa melamar
- [ ] Tidak bisa melamar dua kali
- [ ] Tidak bisa melamar lowongan tertutup
- [ ] Tidak bisa melamar setelah kuota penuh
- [ ] Transisi status tidak sah ditolak

**Otorisasi**

- [ ] COMPANY hanya bisa mengubah lowongan miliknya
- [ ] INTERN hanya bisa melihat lamarannya sendiri
- [ ] COMPANY tidak bisa melihat pelamar perusahaan lain
- [ ] ADMIN bisa mengakses resource administratif

---

## 13. Definition of Done — MVP

MVP dianggap selesai kalau seluruh baris ini terbukti, bukan diperkirakan.

- [ ] Intern bisa register & login
- [ ] Company bisa membuat lowongan
- [ ] Intern bisa mencari & melihat detail lowongan
- [ ] Intern bisa melamar
- [ ] Company bisa melihat & mereview pelamar
- [ ] Company bisa menerima / menolak pelamar
- [ ] Pelamar diterima otomatis jadi penugasan magang
- [ ] Intern bisa mengirim laporan mingguan
- [ ] Supervisor bisa mereview laporan
- [ ] Company bisa mengisi evaluasi
- [ ] Admin bisa melihat & mengelola data platform
- [ ] Resource orang lain tidak bisa diakses (§12 Otorisasi ijo)
- [ ] Test kritis §12 jalan otomatis dan ijo
- [ ] Aplikasi ter-deploy dan bisa diakses
- [ ] README + akun demo tersedia

---

## 14. Di Luar Cakupan MVP (backlog MRV)

Tidak dikerjakan sebelum §13 ijo semua.

| Kelompok | Isi |
|---|---|
| Auth lanjutan | refresh token, reset password, verifikasi email, manajemen sesi |
| Workflow lanjutan | status `OFFERED`, `DECLINED`; siklus penugasan lebih rinci |
| Notifikasi | notifikasi dalam aplikasi (tabel sudah disiapkan), opsional email |
| Upload file | CV, portofolio, sertifikat, lampiran laporan — DB simpan metadata saja |
| Pencarian | filter & sorting lengkap, kategori |
| Audit log | jejak aksi penting + timeline aktivitas |
| Analitik | dashboard grafik company & admin |
| Kualitas produksi | rate limiting, Helmet, logging terstruktur, transaksi menyeluruh |
| Dokumentasi API | OpenAPI lengkap |

---

## 15. Keputusan Terbuka

Butuh jawaban sebelum minggu yang bersangkutan dimulai. Belum diputuskan — jangan
diasumsikan sendiri.

| # | Pertanyaan | Diperlukan di |
|---|---|---|
| 1 | Intern boleh membatalkan lamarannya sendiri? Kalau ya, perlu status `WITHDRAWN` | Minggu 3 |
| 2 | Penugasan bisa dihentikan di tengah jalan? Kalau ya, perlu status `TERMINATED` | Minggu 3 |
| 3 | `supervisor_id` diisi otomatis dari akun perusahaan, atau dipilih manual? | Minggu 3 |
| 4 | Kuota dihitung dari lamaran `ACCEPTED` atau dari penugasan aktif? | Minggu 3 |
| 5 | Registrasi COMPANY langsung aktif, atau menunggu verifikasi ADMIN? | Minggu 1 |
| 6 | Nomor minggu laporan diisi manual intern atau dihitung dari tanggal mulai? | Minggu 3 |
| 7 | Dokumen ini dipakai internal saja (bahasa Indonesia) atau perlu versi Inggris? | kapan saja |

---

## 16. Catatan Perbaikan dari Spec Awal

Bagian ini ada supaya perubahan bisa diperiksa, bukan diterima begitu saja.

**16.1 Alur status lamaran digambar sebagai rantai lurus.** Spec awal menulis
`PENDING → REVIEWING → INTERVIEW → ACCEPTED → REJECTED`, yang terbaca seolah
`REJECTED` datang setelah `ACCEPTED`. Diganti tabel transisi §5.1 dengan
`REJECTED` sebagai cabang dari setiap tahap review dan `ACCEPTED` sebagai
terminal.

**16.2 `ACTIVE` dan `COMPLETED` dipasang di siklus lamaran.** Spec awal §15
memasukkan keduanya ke daftar status lamaran, padahal §6 menyatakan lamaran dan
penugasan itu konsep terpisah. Kedua status dipindah ke penugasan (§5.3), tempat
mereka memang menggambarkan keadaan. Ini keputusan yang perlu dikonfirmasi.

**16.3 "Request revision" tidak punya status.** Spec awal menyebut perusahaan
bisa minta revisi laporan, tapi status laporan hanya `DRAFT`/`SUBMITTED`/`REVIEWED`
— tidak ada keadaan yang mewakili "sudah dikirim, dikembalikan, belum dikirim
ulang". Ditambah `REVISION_REQUESTED` (§5.2).

**16.4 Aturan kuota tidak pernah dinyatakan.** §22 spec awal meminta test
"tidak bisa melamar setelah kuota penuh", tapi tidak ada aturan yang
menjelaskannya. Dinyatakan di §7 nomor 3, termasuk keharusan transaksi.

**16.5 Endpoint yang hilang padahal fiturnya diminta.** Ditambahkan:
`PATCH /companies/me` (spec bilang perusahaan mengelola profil, tapi hanya ada
GET), `GET /company/assignments` (halaman `/company/interns` tidak punya sumber
data), `GET /admin/stats` (angka dashboard admin), dan endpoint admin
aktif/nonaktif perusahaan.

**16.6 Format response tidak didefinisikan.** §21 spec awal meminta "consistent
API response format" tanpa menyebut bentuknya. Ditetapkan di §6.1–§6.2.

**16.7 Daftar API tumpang tindih.** `GET /internships` muncul dua kali dengan
pemilik berbeda. Disatukan jadi satu tabel §6.3 dengan kolom akses.

**16.8 Heading tidak konsisten.** Dokumen asal mencampur `#` dan `##` untuk
bagian setingkat sehingga daftar isi tidak bisa dibentuk. Sekarang satu `#`
judul dokumen, seluruh bagian `##`.

**16.9 Deliverable yang belum ada isinya.** Spec meminta ERD dan daftar variabel
lingkungan sebagai deliverable, tapi tidak memuatnya. Ditambahkan §4.1 dan §11.
