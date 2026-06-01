# LARASANA — Microservices Backend

Platform Digital Tenun Lombok — arsitektur microservices dengan NestJS monorepo.

---

## Arsitektur

```
Frontend (port 5173)
        ↓ HTTP
API Gateway (port 3000)   ← satu-satunya yang dapat request dari luar
        ↓ TCP
├── auth-service        (3001)  — register, login, JWT, OTP
├── users-service       (3002)  — profil user
├── orders-service      (3003)  — riwayat order
├── products-service    (3004)  — katalog produk
├── payments-service    (3005)  — checkout, Midtrans
├── admin-service       (3006)  — panel admin
├── notification-service(3007)  — kirim email
└── [favorites, addresses, shipping dihandle payments-service]

Semua service → MySQL (XAMPP)
```

---

## Cara Menjalankan

```bash
npm install
cp .env.example .env
# isi .env

# Jalankan semua sekaligus (Windows)
start-all.bat

# Atau manual — buka 8 terminal terpisah:
npm run start:notification   # terminal 1
npm run start:auth           # terminal 2
npm run start:users          # terminal 3
npm run start:orders         # terminal 4
npm run start:products       # terminal 5
npm run start:payments       # terminal 6
npm run start:admin          # terminal 7
npm run start:gateway        # terminal 8 — terakhir
```

Swagger: `http://localhost:3000/api/docs`

---

## Database

Import SQL berurutan ke phpMyAdmin:
1. `larasana_db.sql`

---

