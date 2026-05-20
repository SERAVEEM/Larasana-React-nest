# LARASANA — Backend API

Platform digital untuk memasarkan kain tenun Lombok. Dibangun pakai NestJS + TypeScript dengan database MySQL.

---

## Tentang Proyek

Larasana dibuat sebagai bentuk pemberdayaan penenun wanita di Lombok sekaligus membuka pasar tenun tradisional ke kalangan yang lebih luas. Backend ini menangani semua logika server mulai dari autentikasi user, manajemen profil, riwayat order, sampai fitur favorit produk.

---

## Tim

| Nama | Role | NIM |
|------|------|-----|
| Alfis Fathoni , Joel Abner Sandrefinata| Backend Developer | 2802495285 , 2802540736|
| Fawwaz Sidiq Nurseto| Frontend Developer | 2802538914 |
| Muhammad Paruk , Alvin Aditya Putra | UI/UX Designer | 2802499320, 2802434144 |

---

## Struktur Folder

```
larasana-backend/
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   │
│   ├── database/
│   │   └── database.module.ts          # koneksi ke MySQL
│   │
│   ├── auth/                           # login, register, JWT, OTP
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── dto/
│   │   ├── strategies/
│   │   └── guards/
│   │
│   ├── users/                          # profil user, update data
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── dto/
│   │   └── entities/
│   │
│   ├── products/                       # entity produk tenun
│   │   ├── products.module.ts
│   │   └── entities/
│   │
│   ├── orders/                         # riwayat order user
│   │   ├── orders.module.ts
│   │   ├── orders.controller.ts
│   │   ├── orders.service.ts
│   │   ├── dto/
│   │   └── entities/
│   │
│   ├── favorites/                      # produk yang di-favorit user
│   │   ├── favorites.module.ts
│   │   ├── favorites.controller.ts
│   │   ├── favorites.service.ts
│   │   ├── dto/
│   │   └── entities/
│   │
│   ├── mail/                           # kirim email OTP & reset password
│   │   ├── mail.module.ts
│   │   └── mail.service.ts
│   │
│   └── common/
│       └── decorators/
│           ├── get-user.decorator.ts
│           └── roles.decorator.ts
│
├── .env.example
├── nest-cli.json
├── tsconfig.json
└── package.json
```

---

## Cara Menjalankan

**Yang dibutuhkan:**
- Node.js v18+
- XAMPP (pastikan MySQL-nya nyala)

```bash
# clone repo
git clone https://github.com/username/larasana-backend.git
cd larasana-backend

# install package
npm install

# setup environment
cp .env.example .env
# buka .env dan isi sesuai konfigurasi lokal

# import database
# buka phpMyAdmin, import larasana_database.sql dulu
# lanjut import larasana_dashboard.sql

# jalankan
npm run start:dev
```

Kalau berhasil akan muncul:
```
🚀 LARASANA Backend  : http://localhost:3000/api/v1
📖 Swagger Docs      : http://localhost:3000/api/docs
```

---

## Environment Variables

Salin `.env.example` jadi `.env` lalu isi bagian ini:

```env
PORT=3000

# database — sesuaikan dengan XAMPP kamu
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_NAME=larasana_db

# ganti dua value ini dengan string acak yang panjang
JWT_ACCESS_SECRET=isi_random_string
JWT_REFRESH_SECRET=isi_random_string_lain

JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# kalau pakai Gmail, aktifkan App Password di Google Account
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=email_kamu@gmail.com
MAIL_PASS=app_password_gmail



---

## API Endpoints

Base URL: `http://localhost:3000/api/v1`

### Auth

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| POST | `/auth/register` | daftar akun baru (default role: buyer) |
| POST | `/auth/login` | login, dapat JWT |
| POST | `/auth/refresh` | refresh access token |
| POST | `/auth/logout` | logout perangkat ini |
| POST | `/auth/logout-all` | logout semua perangkat |
| POST | `/auth/send-otp` | kirim OTP ke email (untuk seller) |
| POST | `/auth/verify-email` | verifikasi OTP 6 digit |
| POST | `/auth/forgot-password` | kirim link reset password |
| POST | `/auth/reset-password` | ganti password baru |
| GET | `/auth/me` | cek sesi aktif |

### Users

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/users/me` | ambil data profil (nama, avatar, role) |
| PATCH | `/users/me` | update nama / nomor HP / avatar |

### Orders

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/orders/my` | riwayat order, bisa filter status & search |
| GET | `/orders/my/:id` | detail satu order |
| PATCH | `/orders/my/:id/cancel` | batalkan order (hanya status pending) |

### Favorites

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/favorites` | daftar produk favorit, bisa search |
| POST | `/favorites/:productId` | tambah ke favorit |
| DELETE | `/favorites/:productId` | hapus dari favorit |
| GET | `/favorites/check/:productId` | cek apakah sudah difavoritkan |

---

## Testing via Swagger

Buka `http://localhost:3000/api/docs` di browser.

1. Jalankan `POST /auth/register` atau `/auth/login`
2. Copy `accessToken` dari response
3. Klik tombol **Authorize** di kanan atas
4. Isi: `Bearer <token yang dicopy>`
5. Sekarang semua endpoint yang butuh login bisa dicoba langsung

---
