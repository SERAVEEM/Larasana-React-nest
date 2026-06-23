# LARASANA — Microservices Backend

Platform Digital Tenun Lombok — arsitektur microservices dengan NestJS monorepo.

---

## Arsitektur

```mermaid
graph TD
    %% Styling
    classDef client fill:#f9f9fb,stroke:#4f46e5,stroke-width:2px,color:#1f2937;
    classDef gateway fill:#e0e7ff,stroke:#4338ca,stroke-width:2px,color:#1f2937;
    classDef service fill:#f3f4f6,stroke:#6b7280,stroke-width:2px,color:#1f2937;
    classDef db fill:#ecfdf5,stroke:#059669,stroke-width:2px,color:#1f2937;

    FE[Frontend SPA / Port 5173]:::client
    GW[API Gateway / Port 3000]:::gateway
    
    subgraph Microservices ["Microservices (TCP Broker)"]
        US[Users Service <br> TCP: 3001 / HTTP: 4001]:::service
        CS[Commerce Service <br> TCP: 3002 / HTTP: 4002]:::service
        NS[Notification Service <br> TCP: 3003 / HTTP: 4003]:::service
    end
    
    DB[(MySQL Database)]:::db

    %% Relationships
    FE -->|HTTP / HTTPS| GW
    GW -->|TCP Proxy| US
    GW -->|TCP Proxy| CS
    
    US -->|TypeORM| DB
    CS -->|TypeORM| DB
    
    US -->|TCP OTP| NS
    CS -->|TCP Order Mail| NS
```

---

## Cara Menjalankan

### 1. Prasyarat
* Node.js & npm
* MySQL Server (misal via XAMPP atau Docker)

### 2. Konfigurasi Environment
```bash
npm install
cp .env.example .env
# Lengkapi variabel di file .env sesuai kebutuhan
```

### 3. Menjalankan Service
```bash
# Jalankan semua service sekaligus (Windows)
start-all.bat

# Atau manual dengan npm run:
npm run start:users          # terminal 1
npm run start:commerce       # terminal 2
npm run start:notification   # terminal 3
npm run start:gateway        # terminal 4 (API Gateway)
```

Swagger API Docs dapat diakses di: `http://localhost:3000/api/docs`

---

## Database

Import SQL ke phpMyAdmin atau DBMS pilihan Anda:
1. `larasana_db.sql`

---

## Testing

Jalankan pengujian unit (unit tests) Jest:
```bash
npm test
```
