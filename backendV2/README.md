# LARASANA — Microservices Backend

Platform Digital Tenun Lombok — arsitektur microservices dengan NestJS monorepo.

---

## Arsitektur

```mermaid
graph TD
    %% Styling and Palettes
    classDef client fill:#f5f3ff,stroke:#8b5cf6,stroke-width:2px,color:#1e1b4b;
    classDef gateway fill:#eff6ff,stroke:#3b82f6,stroke-width:2px,color:#172554;
    classDef broker fill:#fff7ed,stroke:#f97316,stroke-width:2px,color:#431407;
    classDef service fill:#f8fafc,stroke:#64748b,stroke-width:2px,color:#0f172a;
    classDef storage fill:#ecfdf5,stroke:#10b981,stroke-width:2px,color:#064e3b;
    classDef external fill:#fff1f2,stroke:#f43f5e,stroke-width:2px,color:#4c0519;

    %% 1. Client Tier
    subgraph ClientTier ["Client / Presentation Tier"]
        FE[React 19 SPA / Vite]:::client
        AX[Axios Client Singleton]:::client
        SEC[Client Key Interceptor]:::client
        FE --> AX
        AX --> SEC
    end

    %% 2. Gateway Tier
    subgraph GatewayTier ["Gateway / Edge Tier"]
        GW[API Gateway / NestJS]:::gateway
        HL[Helmet Headers]:::gateway
        TH[Throttler / Rate Limiter]:::gateway
        VAL[Validation Pipe]:::gateway
        SW[Swagger API Docs]:::gateway
        
        GW --- HL
        GW --- TH
        GW --- VAL
        GW --- SW
    end

    %% 3. TCP Communication / Pattern Broker
    subgraph BrokerTier ["NestJS TCP Broker / Pattern Router"]
        TCP[TCP Transport Channel]:::broker
        UP_PAT["AUTH_PATTERNS / USER_PATTERNS"]:::broker
        COM_PAT["PRODUCT_PATTERNS / ORDER_PATTERNS"]:::broker
        NOT_PAT["SEND_OTP / SEND_CONFIRMATION"]:::broker
        
        TCP --- UP_PAT
        TCP --- COM_PAT
        TCP --- NOT_PAT
    end

    %% 4. Microservices Tier
    subgraph ServicesTier ["Business Logic / Microservices Tier"]
        US[Users Service <br> TCP: 3001 / HTTP: 4001]:::service
        CS[Commerce Service <br> TCP: 3002 / HTTP: 4002]:::service
        NS[Notification Service <br> TCP: 3003 / HTTP: 4003]:::service
    end

    %% 5. Storage Tier
    subgraph StorageTier ["Data Access / Persistence Tier"]
        DB[(MySQL Database)]:::storage
        ORM[TypeORM Entities]:::storage
        DB --- ORM
    end

    %% 6. External Tiers
    subgraph ExtTier ["External Services / Integration Tier"]
        GAuth[Google OAuth SSO]:::external
        Ship[Logistics: Biteship / EasyPost / RajaOngkir]:::external
        Mid[Midtrans Payment Gateway]:::external
    end

    %% Flow Connections
    SEC -->|HTTPS Request with x-larasana-client-key| GW
    
    GW -->|Route Request| TCP
    
    UP_PAT -->|TCP Proxy| US
    COM_PAT -->|TCP Proxy| CS
    NOT_PAT -->|TCP Proxy| NS
    
    US -->|TypeORM| DB
    CS -->|TypeORM| DB
    
    %% Inter-service calls
    US -->|TCP Trigger| NS
    CS -->|TCP Trigger| NS

    %% External Integrations
    US -->|Validate SSO Token| GAuth
    CS -->|API Shipping Rates| Ship
    CS -->|API Snap Token / Charge VA| Mid
    Mid -->|Signed Webhook Callbacks| GW
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
