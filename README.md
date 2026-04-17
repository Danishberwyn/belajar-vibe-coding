# Belajar Vibe Coding - User Authentication API

Aplikasi ini adalah RESTful API untuk Authentication User (Registrasi, Login, Profile, dan Logout) yang dibangun menggunakan Bun, Elysia.js, dan Drizzle ORM dengan database MySQL. Aplikasi ini difokuskan pada performa yang tinggi dan tipe data yang aman (type-safe) secara end-to-end.

## 🏗️ Arsitektur Aplikasi (Struktur Folder & File)

Proyek ini menggunakan struktur yang modular untuk memisahkan antara entri point, route (endpoint), logika bisnis, dan konfigurasi database.

```text
belajar-vibe-coding/
├── src/
│   ├── db/            # Konfigurasi database dan definisi skema Drizzle ORM
│   │   ├── index.ts   # Koneksi ke database
│   │   └── schema.ts  # Definisi tabel database (users, sessions)
│   ├── routes/        # Definisi endpoint (API routes)
│   │   └── user-route.ts # Route untuk user (register, login, dll)
│   ├── services/      # Logika bisnis (Business Logic)
│   │   └── user-services.ts # Logika untuk autentikasi dan manajemen user
│   ├── app.ts         # Inisialisasi Elysia app, global error handling, & registrasi route
│   └── index.ts       # Entry point untuk menjalankan server
├── tests/             # Folder untuk unit/integration tests
│   └── user.test.ts
├── package.json       # Daftar dependencies & scripts
├── bun.lock           # Lockfile dependency Bun
├── drizzle.config.ts  # Konfigurasi Drizzle Kit untuk migrasi
└── tsconfig.json      # Konfigurasi TypeScript
```

## 🛠️ Technology Stack & Libraries

**Kumpulan Teknologi Utama:**
- **Runtime:** [Bun.js](https://bun.sh/)
- **Bahasa Pemrograman:** TypeScript
- **Framework Web:** [Elysia.js](https://elysiajs.com/)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Database:** MySQL

**Libraries Tambahan:**
- `bcryptjs`: Digunakan untuk melakukan *hashing* password.
- `mysql2`: Driver untuk koneksi ke database MySQL.
- `drizzle-kit`: CLI/Tooling untuk mengatur migrasi database Drizzle.

## 🗄️ Database Schema

Aplikasi ini menggunakan 2 tabel utama relasional, yaitu:

### 1. Tabel `users`
Menyimpan informasi data pengguna.
- `id` (Serial/PK)
- `name` (Varchar 255, Not Null)
- `email` (Varchar 255, Unique, Not Null)
- `password` (Varchar 255, Not Null) - *Disimpan dalam bentuk hash*
- `created_at` (Timestamp, Default Now)

### 2. Tabel `sessions`
Menyimpan token sesi pengguna yang sedang login.
- `id` (Serial/PK)
- `token` (Varchar 255, Not Null)
- `user_id` (BigInt, Not Null, FK to `users.id`)
- `created_at` (Timestamp, Default Now)

## 📡 API Endpoints

### Public Routes

- **`GET /`**
  - **Deskripsi:** Health check endpoint untuk memastikan server berjalan.
  - **Response:** `200 OK`

- **`POST /api/users`**
  - **Deskripsi:** Registrasi pengguna baru.
  - **Body Payload (JSON):**
    ```json
    {
      "name": "User Name",
      "email": "user@example.com",
      "password": "secretpassword"
    }
    ```
  - **Response:** `201 Created`

- **`POST /api/users/login`**
  - **Deskripsi:** Proses otentikasi login pengguna.
  - **Body Payload (JSON):**
    ```json
    {
      "email": "user@example.com",
      "password": "secretpassword"
    }
    ```
  - **Response:** `200 OK` dengan mengembalikan `token`.

### Protected Routes (Membutuhkan Header `Authorization: Bearer <token>`)

- **`GET /api/users/current`**
  - **Deskripsi:** Mengambil data profil dari pengguna yang sedang login berdasarkan token.
  - **Response:** `200 OK` dengan data user.

- **`POST /api/users/logout`**
  - **Deskripsi:** Melakukan logout dengan cara menghapus token sesi dari database.
  - **Response:** `200 OK`

## 🚀 Cara Setup Project

Ikuti langkah-langkah berikut untuk mengatur proyek di komputer Anda:

1. **Clone repositori ini:**
   ```bash
   git clone <url-repo>
   cd belajar-vibe-coding
   ```

2. **Install semua dependencies menggunakan Bun:**
   ```bash
   bun install
   ```

3. **Konfigurasi Environment Database:**
   Buat atau modifikasi file `.env` di root project. Setup connection string database MySQL, contoh:
   ```env
   DATABASE_URL="mysql://user:password@localhost:3306/nama_database"
   ```

4. **Migrasi / Push Database Schema:**
   Kirim skema Drizzle ke database menggunakan perintah:
   ```bash
   bun run db:push
   ```

## ▶️ Cara Run Aplikasi

Untuk menjalankan server dalam mode pengembangan (development), jalankan perintah:

```bash
bun run dev
```

Ini akan menjalankan aplikasi dengan fitur watch (auto-restart apabila ada perubahan file). Secara default server akan berjalan di alamat http://localhost:3000.

## 🧪 Cara Test Aplikasi

Proyek ini telah dikonfigurasi menggunakan internal test runner bawaan Bun. Untuk menjalankan barisan tes, gunakan:

```bash
bun run test
```
