<p align="center">
  <img src="https://pub-f243a32e4dee45969b6714c325a336f8.r2.dev/brand/remove_bg-removebg-preview.png" alt="Larasana Logo" width="400" />
</p>

<p align="center">
  <a href="https://github.com/SERAVEEM/Larasana-React-nest"><img src="https://img.shields.io/badge/build-passing-brightgreen" alt="Build Status" /></a>
  <a href="https://github.com/SERAVEEM/Larasana-React-nest"><img src="https://img.shields.io/badge/tests-passing-brightgreen" alt="Tests Status" /></a>
  <a href="https://github.com/SERAVEEM/Larasana-React-nest/pulls"><img src="https://img.shields.io/badge/Review-Approved-brightgreen?logo=github" alt="Review Status" /></a>
  <a href="https://github.com/SERAVEEM/Larasana-React-nest/pulls"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" /></a>
  <a href="https://github.com/SERAVEEM/Larasana-React-nest/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.x-61DAFB?style=flat&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-6.x-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8.x-646CFF?style=flat&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/NestJS-10.x-E0234E?style=flat&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat&logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/Vercel-Deployed-000000?style=flat&logo=vercel&logoColor=white" alt="Vercel" />
  <img src="https://img.shields.io/badge/Railway-Deployed-131415?style=flat&logo=railway&logoColor=white" alt="Railway" />
</p>

---

# LARASANA — Technical Architecture & Security Manual

**LARASANA** is a premium digital e-commerce and cultural storytelling platform dedicated to traditional Lombok handwoven fabrics (Tenun Lombok). The platform serves as a modern bridge, transforming ancestral textile craftsmanship into contemporary ready-to-wear high fashion.

This document serves as the comprehensive technical manual detailing the system architecture, design patterns, security infrastructure, database mapping, and deployment guidelines for the LARASANA codebase.

---

## 1. Executive Summary & Overview

Beyond standard e-commerce features, LARASANA weaves a rich narrative layer around each garment (Artisan Storytelling) and highlights the ecological and socio-economic impact (Eco-Social Impact) of the purchase. Every thread tells a story of heritage, and every transaction directly supports the native artisan communities of Lombok, Indonesia, ensuring that their century-old craft survives and thrives in the global marketplace.

### Brand Identity & Creative Direction
The user interface is designed with a premium, high-contrast visual aesthetic utilizing high-fidelity motion graphics, immersive typography, and staggered layouts to evoke a luxury fashion house experience.

<p align="center">
  <img src="https://pub-f243a32e4dee45969b6714c325a336f8.r2.dev/About%20Us/First.png" alt="LARASANA Brand Identity and Visual Layouts" width="90%" />
</p>

---

## 2. Core Technology Stack

The platform is engineered using a decoupled, service-oriented architecture designed to handle concurrent operations, secure payment processing, and high-fidelity motion layouts.

### A. Frontend (Client-Side)
* **Core Framework**: **React 19.x** (utilizing functional component models, custom hooks, and concurrent rendering).
* **Language Platform**: **TypeScript 6.x** (ensures strict compile-time type safety across complex cart states, order payloads, and API interfaces).
* **Build Tooling**: **Vite 8.x** (leverages native ES modules for fast compilation, hot module replacement, and optimized production bundling).
* **State & Navigation Routing**: **React Router DOM 7.x** (provides client-side routing, protected admin route guards, and browser history transitions).
* **Motion & UX Engineering**:
  * **Lenis 1.x**: Overrides default browser scroll-physics with inertia-based smooth scrolling, creating a premium luxury feel.
  * **Framer Motion 11.x**: Drives micro-interactions, layout morphing, staggered element card dealing, and page entrance animations.
  * **ScrollReveal 4.x**: Controls staggered, viewport-triggered element reveal behaviors on container entry.
* **SEO & Metadata**: **React Helmet Async 2.x** (injects page titles, meta descriptions, and OpenGraph tags dynamically per route).
* **API Client**: **Axios 1.16.x** (configured as a singleton with custom interceptor hooks to coordinate gateways).

### B. Backend (Server-Side)
* **Core Framework**: **NestJS 10.x** (a progressive Node.js framework building modular, enterprise-grade server-side architectures).
* **Monorepo Architecture**: Nest CLI monorepo workspace (segregates independent applications from shared libraries).
* **Internal Microservice Broker**: **TCP Transport Protocol** (NestJS native microservice TCP communication to enable low-overhead, fast internal messaging).
* **Database & ORM**:
  * **Database Engine**: **MySQL** / MariaDB (schema constraints, foreign keys, and indexes are restored via `larasana_db.sql`).
  * **ORM**: **TypeORM 0.3.x** / `@nestjs/typeorm` (manages schema synchronization, data-mapper queries, and transaction tables).
* **Security & Reliability**:
  * HTTP security headers protection using **Helmet**.
  * Global and endpoint-specific rate limiting via **@nestjs/throttler** (default 20 req/min, Login/OTP attempts throttled strictly).
  * Global timeout interceptor (8 seconds) and idempotent request retries to handle transient failures.
  * Hashing credentials via `bcrypt` (adaptive salt-rounds hashing).
  * Double JSON Web Token (JWT) Access/Refresh Token cycle via `@nestjs/passport` and `passport-jwt` with strict validation.
* **Transactional Emailing**: **Nodemailer 6.x** (connects to SMTP engines to send secure HTML OTPs and Password Reset links).
* **Health & Reliability Monitoring**: **@nestjs/terminus** health indicator endpoints resolving DB connectivity and service liveness.

### C. Third-Party Integrations
* **Payment Gateway**: **Midtrans API** (Snap API for redirection, and Core API for direct Virtual Account integrations including BCA, BNI, BRI, Mandiri, Gopay, and ShopeePay).
* **Logistics & Rates**:
  * **EasyPost API**: Resolves shipping options and prices for international parcels.
  * **RajaOngkir API**: Resolves domestic courier costs (JNE, POS, TIKI) within Indonesia with integrated 24-hour cache caching.
  * **Biteship API**: Preferred domestic/global courier partner providing live rate lookups.
* **Identity Provider**: **Google OAuth Library** (`google-auth-library` for secure token decryption and verification on SSO login requests).


---

## 3. System Architecture & Service Layout

LARASANA utilizes a **Decoupled Single Page Application (SPA) & Microservices Backend** architecture. Below is the system blueprint representing how components interact:

```mermaid
graph TD
    %% Styling
    classDef client fill:#f9f9fb,stroke:#4f46e5,stroke-width:2px,color:#1f2937;
    classDef gateway fill:#e0e7ff,stroke:#4338ca,stroke-width:2px,color:#1f2937;
    classDef service fill:#f3f4f6,stroke:#6b7280,stroke-width:2px,color:#1f2937;
    classDef db fill:#ecfdf5,stroke:#059669,stroke-width:2px,color:#1f2937;
    classDef ext fill:#fff7ed,stroke:#ea580c,stroke-width:2px,color:#1f2937;

    subgraph Client ["Client Tier (Frontend)"]
        FE[React 19 SPA / Vite]:::client
    end

    subgraph Gateway ["Gateway Tier"]
        GW[API Gateway / Port 3000]:::gateway
    end

    subgraph Microservices ["Microservices (Internal Broker TCP)"]
        US[Users Service / Port 3001]:::service
        CS[Commerce Service / Port 3002]:::service
        NS[Notification Service / Port 3003]:::service
    end

    subgraph Storage ["Storage Tier"]
        DB[(MySQL Database)]:::db
    end

    subgraph External ["External Third-Party APIs"]
        GAuth[Google OAuth 2.0]:::ext
        EasyPost[EasyPost API]:::ext
        Midtrans[Midtrans Payment Gateway]:::ext
    end

    %% Client Interactions
    FE -->|HTTPS Request with Client Secret Key| GW
    FE -->|Authenticate Token / Login SSO| GAuth

    %% Gateway Routing
    GW -->|TCP Proxy| US
    GW -->|TCP Proxy| CS

    %% Service Database Connectivity
    US -->|TypeORM ORM Query| DB
    CS -->|TypeORM ORM Query| DB
    NS -->|Read configuration / triggers| DB

    %% Service-to-Service Async notifications
    CS -->|TCP notification call| NS
    US -->|TCP OTP call| NS

    %% External Calls
    US -->|Verify Token ID| GAuth
    CS -->|Query Live Rates| EasyPost
    CS -->|Generate Snap Payment / Charge VA| Midtrans
    Midtrans -->|Callback Webhook Notification| GW
```

### A. Frontend Architecture
The client is structured as a client-side routed SPA. The root layout is decorated with global contexts using the Provider Pattern (`HelmetProvider` -> `BrowserRouter` -> `SmoothScroll`). Logic modules are encapsulated inside container pages, which interface with presentational UI components.

### B. Backend Microservices Architecture
The backend services are partitioned into four distinct runtimes, leveraging a **Hybrid Service Architecture** to isolate internal messaging from monitoring endpoints:
1. **API Gateway (Port 3000)**: Renders the REST API endpoints (`/api/v1`) to the client. Serves as the orchestrating proxy that routes incoming HTTP requests to internal services via TCP. It maps RPC validation schemas (`ValidationPipe`), controls CORS policies, handles JWT authentication, executes rate-limiting checks, and exposes the **Swagger API Docs** (`/api/docs`). Exposes simple HTTP `/health` check.
2. **Users Service (Port 3001 & 4001)**: Resolves user accounts, manages registrations, hashes credentials, coordinates Google Login tokens, and aggregates admin control operations. Configured as a hybrid app handling internal TCP (3001) and HTTP health monitoring (4001).
3. **Commerce Service (Port 3002 & 4002)**: Powers the shop catalog, product stocks, favorites, checkout, and payment gateways. Internally refactored into modular sub-modules (`Products`, `Favorites`, `Addresses`, `Shipping`, `Orders`, `Upload`) for high maintainability. Configured as a hybrid app handling internal TCP (3002) and HTTP health monitoring (4002) with active database ping checks.
4. **Notification Service (Port 3003 & 4003)**: Operates independently to construct and email transactional OTP tokens and reset links to customers. Configured as a hybrid app handling internal TCP (3003) and HTTP health monitoring (4003).


---

## 4. Software Design Patterns

The frontend and backend codebases adopt structured design patterns to maintain separation of concerns and robust data handling:

* **Singleton Pattern**:
  * *API Connection*: The Axios instance in `client.ts` is instantiated once and shared globally.
  * *Script Loader*: The `googleScript.ts` helper caches the loading state of the Google Identity Services library to ensure only one `<script>` tag is appended to the document body.
  * *SmoothScroll Engine*: A single `Lenis` instance is cached inside a React Reference and driven by a single requestAnimationFrame loop.
* **Interceptor Pattern**:
  * Integrated directly into Axios. The *Request Interceptor* checks local storage and appends the Authorization Bearer Token. The *Response Interceptor* cleans local memory and redirects the user if a `401 Unauthorized` token expiry occurs.
* **Observer Pattern**:
  * *Scroll Viewport Observer*: The `HeroShowcase.tsx` component uses the browser's `IntersectionObserver` to trigger card-entrance transitions when the section enters 30% visibility.
  * *Event Listeners*: Active listeners monitor browser resize and scroll events to dynamically update navbar styling and recalibrate Lenis heights.
* **Provider Pattern**:
  * Employs React Context Providers at the root level to distribute routing states, SEO metadata headers, and scrolling options without manual prop drilling.
* **Container / Presentational Component Pattern**:
  * Segregates logical container files (like `ProductDetailPage.tsx` which handles database fetches and URL parameter parsing) from pure visual presentational files (like `Product.tsx` which handles rendering and local UI interactions).
* **Strategy Pattern (Shipping Providers)**:
  * Backend shipping rate resolution extracts provider-specific logic (RajaOngkir, EasyPost, Biteship) into modular strategy classes implementing a unified `ShippingProvider` interface. This allows the core `ShippingService` to act as a lightweight orchestrator, resolving rates dynamically depending on address characteristics (e.g. domestic vs international) and API configuration.


---

## 5. Security Architecture & Traffic Controls

LARASANA implements multi-layered security controls to protect the API Gateway, secure transactional channels, and isolate the microservices layer.

### A. CORS Origin Restrictions
The API Gateway enforces strict origin whitelisting. Only trusted development clients and your production Vercel subdomains can bypass the CORS preflight check:
```typescript
const allowedOrigins = [
  process.env.FRONTEND_URL ?? 'http://localhost:5173',
  'http://localhost:3000',
];

app.enableCors({
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }
    const isAllowed = allowedOrigins.includes(origin) || /^https:\/\/larasana-[a-zA-Z0-9-]+\.vercel\.app$/.test(origin);
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
});
```

### B. Global Client Secret Key Validation
To prevent scraper bots, headless scrapers, and third-party tools from making unauthorized API requests directly to the Gateway, a custom shared secret middleware is active.
* Every outgoing request from the React client automatically appends the `x-larasana-client-key` header containing a hashed secret (`VITE_FRONTEND_CLIENT_SECRET`).
* The API Gateway intercepts all incoming requests and verifies this header against the server environment's `FRONTEND_CLIENT_SECRET`.
* **Exempted Routes**: For critical public integrations and documentation, the following paths are whitelisted to bypass the key check:
  * **CORS Preflight**: All `OPTIONS` requests.
  * **API Documentation**: The Swagger documentation panel (`/api/docs` and subpaths).
  * **Payment Webhooks**: Midtrans payment callback notifications (`/checkout/webhook/midtrans`) to ensure payment states update automatically.

### C. Authentication & Token Management
* **Credentials Hashing**: Standard password logins are secured via `bcrypt` with 10 salt rounds.
* **Double JWT Token Verification Flow**: 
  * Logging in returns an **Access Token** (stored in memory, 15-minute lifespan) and a cryptographically signed **Refresh Token** (persisted in the database, 7-day lifespan).
  * When the access token expires, the client silently issues a refresh request to rotate the tokens without interrupting the user session.
* **Google SSO (OAuth 2.0)**: Google Sign-in utilizes the official `google-auth-library` to decode and verify token authenticity directly against Google's public keys. It checks:
  * Token signature validity.
  * Audience matching (`GOOGLE_CLIENT_ID`) to prevent client-side token spoofing.

### D. Asset Proxy Tunneling (Indonesian ISP DNS Bypass)
Cloudflare's default public subdomains (`*.r2.dev`) are blocked at the DNS level in Indonesia. To ensure high-quality product images, storytelling graphics, and background loops render correctly without requiring the customer to use a VPN, Vercel acts as a reverse proxy:
* The client requests assets relative to its own domain (e.g. `/assets/Story/Story_First.webp`).
* Vercel's edge server intercepts this request and proxies it securely to the R2 bucket using the rewrite rule in `vercel.json`:
  ```json
  {
    "source": "/assets/:path*",
    "destination": "https://pub-f243a32e4dee45969b6714c325a336f8.r2.dev/:path*"
  }
  ```

### E. Security Headers (Helmet)
The API Gateway integrates `helmet` middleware globally in [main.ts](file:///d:/LARASANA%20Updated/Frontend/backendV2/apps/api-gateway/src/main.ts#L13) to protect Express HTTP headers. It strips dangerous disclosure headers (e.g., `X-Powered-By`) and enforces security standards like `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and `Strict-Transport-Security`.

### F. Rate Limiting (API Throttling)
To prevent brute-force attacks and abuse of sensitive OTP endpoints, `@nestjs/throttler` is integrated.
* **Global Limit**: Exposes a default limit of `20 requests per minute` across standard API routes.
* **Sensitive Route Hardening**: Stricter throttling rules are decorated on high-risk endpoints in [auth.controller.ts](file:///d:/LARASANA%20Updated/Frontend/backendV2/apps/api-gateway/src/auth/auth.controller.ts):
  * **Login**: Restricted to `5 attempts per minute`.
  * **Send OTP**: Restricted to `3 requests per 10 minutes`.
  * **Verify OTP**: Restricted to `5 attempts per 10 minutes`.

---


## 6. Transaction & Payment Data Flow

The checkout transaction sequence coordinates third-party shipping and payment APIs. Below is the sequential process flow showing interactions:

```mermaid
sequenceDiagram
    autonumber
    actor User as Customer (Browser)
    participant FE as React Client
    participant GW as API Gateway (NestJS)
    participant CS as Commerce Service
    participant EP as EasyPost API
    participant RO as RajaOngkir API
    participant BS as Biteship API
    participant MT as Midtrans API
    participant NS as Notification Service
    participant DB as MySQL DB

    User->>FE: Select Size & Click "Buy Now"
    FE->>FE: Verify JWT Access Token & Validate Shipping Address
    FE->>GW: POST /shipping/rates (with destination address details)
    GW->>CS: TCP: resolve-shipping-rates
    alt Biteship API Configured
        CS->>BS: POST /v1/rates/couriers (BiteshipProvider)
        BS-->>CS: Return courier rates
    else Domestic Shipping (Country == ID)
        CS->>RO: POST /starter/cost (RajaOngkirProvider)
        RO-->>CS: Return courier rates
    else International Shipping
        CS->>EP: POST /v2/shipments (EasyPostProvider)
        EP-->>CS: Return carrier rates
    end
    CS-->>GW: Return rate options

    GW-->>FE: Present shipping rates to user
    User->>FE: Select rate, choose payment method, & Click "Checkout Now"
    FE->>GW: POST /checkout/order (with items, courier, & payment type)
    GW->>CS: TCP: create-order
    CS->>DB: Insert Order record (Status: PENDING)
    CS->>MT: POST /charge or /snap/token (order ID, gross amount)
    MT-->>CS: Return Snap redirect URL or VA numbers
    CS-->>GW: Return payment details & countdown (15m)
    GW-->>FE: Render payment instructions (QRIS/VA) to User
    loop Polling status (every 3 seconds)
        FE->>GW: GET /checkout/payment-status/:orderId
        GW->>CS: TCP: get-payment-status
        CS->>DB: Check Order Status in DB
        DB-->>CS: PENDING
        CS-->>FE: PENDING
    end
    User->>MT: Authorize Payment (e-wallet scan or bank transfer)
    MT-->>User: Success response
    MT->>GW: POST /checkout/webhook/midtrans (signed notification payload)
    GW->>CS: TCP: handle-midtrans-callback
    CS->>DB: Update Order Status to PAID & stock allocation
    CS->>NS: TCP: send-order-confirmation-email
    NS->>User: Send Email OTP / Confirmation notification
    loop Polling status detects payment completion
        FE->>GW: GET /checkout/payment-status/:orderId
        GW->>CS: TCP: get-payment-status
        CS->>DB: Check Order Status (PAID)
        DB-->>CS: PAID
        CS-->>FE: SUCCESS
    end
    FE->>User: Redirect to /payment-success
```

### Transaction Lifecycle Steps:
1. **User Action**: The user selects a size on the Product Detail Page and clicks **Buy Now**.
2. **Checkout Validation**: The `CheckoutPage.tsx` checks for active JWT tokens, validates local address inputs (Indonesian phone number patterns and minimum address length bounds), and retrieves user records.
3. **Logistics Rate Resolution**: Choosing or updating an address triggers a query to the `/shipping` API, handled by the [ShippingService](file:///d:/LARASANA%20Updated/Frontend/backendV2/apps/commerce-service/src/shipping.service.ts) using the **Strategy Pattern**:
   * **Biteship**: If `BITESHIP_API_KEY` is configured in the environment, the query is resolved by the [BiteshipProvider](file:///d:/LARASANA%20Updated/Frontend/backendV2/apps/commerce-service/src/shipping/providers/biteship.provider.ts) for both domestic and international shipping.
   * **Domestic (RajaOngkir)**: If the destination is Indonesia (`ID`) and Biteship is not active, the [RajaOngkirProvider](file:///d:/LARASANA%20Updated/Frontend/backendV2/apps/commerce-service/src/shipping/providers/rajaongkir.provider.ts) resolves the rates (JNE, POS, TIKI) using cached city mappings. If this fails or is down, it falls back to static domestic shipping rates.
   * **International (EasyPost)**: If the destination is international and Biteship is not active, the [EasyPostProvider](file:///d:/LARASANA%20Updated/Frontend/backendV2/apps/commerce-service/src/shipping/providers/easypost.provider.ts) resolves the rates (DHL, FedEx, EMS). If this fails, it falls back to static international shipping rates.

4. **Order Posting**: The user selects a courier and a payment type (QRIS / VA / Card) and clicks **Checkout Now**. The request is sent to the API Gateway, which proxies it to the Commerce Service via TCP.
5. **Gateway Payment Generation**: The Commerce Service records a pending order, computes total costs, and initiates a payload to **Midtrans API** (Snap endpoint for QRIS, or Core API `/charge` endpoint for Virtual Account details).
6. **Token Presentation**: Gateway responds with payment details (QRIS image URLs, VA numbers, or redirect links) which are displayed on the client.
7. **Expiry & Polling Loop**: The `PaymentPage.tsx` calculates a 15-minute countdown and spins up a polling loop (`setInterval` every 3 seconds) that queries `/checkout/payment-status/:orderId`.
8. **Confirmation Redirect**: When the user pays via their e-wallet or bank, Midtrans sends a secure signed webhook to the backend. The backend updates the order status. On the next polling cycle, the client detects the status change and redirects the user to `/payment-success`.

---

## 7. Directory Structure Mapping

### Frontend Directory Tree
```
frontend/
├── src/
│   ├── api/          # Axios client singleton & interceptors configuration
│   ├── assets/       # Promotional video, catalog images, and custom Didot fonts
│   ├── components/   # Navbar, Footer, SmoothScroll, SplashScreen, and layouts
│   ├── pages/        # Main route views (Landing, Product Detail, Checkout, Payment)
│   │   └── admin/    # Admin panel pages (dashboard metrics, product managers)
│   ├── style/        # Vanilla CSS stylesheets matched per page/component
│   └── utils/        # Dynamic script loaders, Google auth scripts, and alert helpers
├── package.json      # Dependencies (Vite 8, React 19, Framer Motion, Lenis)
└── vite.config.ts    # Bundler settings
```

### Backend Directory Tree
```
backendV2/
├── apps/
│   ├── api-gateway/  # Primary entry point (Swagger config, guards, RPC mapping)
│   ├── commerce-service/ # Products catalog, Shipping (EasyPost), and Payments (Midtrans)
│   ├── notification-service/ # Independent Nodemailer email dispatcher
│   └── users-service/    # Access controls, JWT auth strategy, Google login API
├── libs/
│   └── shared/       # Shared TypeORM schemas, DB configs, RPC TCP Constants
├── nest-cli.json     # NestJS monorepo compiler options
├── package.json      # Dependencies (NestJS 10, TypeORM, Concurrently, bcrypt)
└── larasana_db.sql   # Relational database structure and seed data
```

---

## 8. Development & Production Deployment Settings

### A. Environment Configuration (Local Development)
To run the project on your local machine, configure these files:

#### 1. Backend config (`backendV2/.env`)
```env
# Database Credentials
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=larasana_db

# Security & JWT Tokens
JWT_ACCESS_SECRET=your_long_access_secret_string
JWT_REFRESH_SECRET=your_long_refresh_secret_string

# Client Secret Key (Must match Vercel)
FRONTEND_CLIENT_SECRET=larasana_dev_secret_key

# Third-Party Keys
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxx
MIDTRANS_IS_SANDBOX=true

EASYPOST_API_KEY=your_easypost_test_key
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

#### 2. Frontend config (`frontend/.env.development`)
```env
VITE_API_BASE_URL="http://localhost:3000/api/v1"
VITE_GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
VITE_FRONTEND_CLIENT_SECRET="your_client_secret_placeholder"
```

---

### B. Production Environment Variables (Railway & Vercel)
When deploying to live servers, configure these variables directly in your cloud dashboard settings.

#### 1. Backend (Railway Service Variables)
* **`DB_HOST`** / **`DB_PORT`** / **`DB_USERNAME`** / **`DB_PASSWORD`** / **`DB_NAME`**: *(Your production database credentials, e.g. Clever Cloud)*
* **`PORT`**: `3000` *(tells Railway to expose public traffic to port 3000)*
* **`GATEWAY_PORT`**: `${{PORT}}` *(binds your API Gateway port directly to the Railway container port)*
* **`FRONTEND_CLIENT_SECRET`**: *(A secure 64-character SHA-256 hash or random string matching Vercel)*
* **`JWT_ACCESS_SECRET`** / **`JWT_REFRESH_SECRET`**: *(Your production secret strings for JWT signing)*
* **`GOOGLE_CLIENT_ID`**: *(Your Google Cloud Console Client ID)*
* **`MIDTRANS_SERVER_KEY`** / **`MIDTRANS_CLIENT_KEY`**: *(Your Production/Sandbox Midtrans Credentials)*
* **`BITESHIP_API_KEY`** / **`RAJAONGKIR_API_KEY`**: *(Your active shipping credentials)*

#### 2. Frontend (Vercel Project Variables)
* **`VITE_API_BASE_URL`**: `https://larasana-react-nest-production.up.railway.app/api/v1` *(points to your Railway URL)*
* **`VITE_FRONTEND_CLIENT_SECRET`**: *(A secure 64-character SHA-256 hash or random string matching Railway)*
* **`VITE_GOOGLE_CLIENT_ID`**: `your_google_client_id.apps.googleusercontent.com` *(must be whitelisted in Google Developer Console origins)*

---

## 9. Frontend Design Tokens System

To maintain visual consistency and pixel-perfect design alignment, LARASANA enforces a centralized CSS variables configuration in `index.css`:

### A. Spacing Scale (4pt Grid)
All element layouts, margins, gaps, and paddings must align to a strict 4px grid. Inline styles using raw values are discouraged. Use these tokens instead:
* `--space-1` (4px), `--space-2` (8px), `--space-3` (12px), `--space-4` (16px), `--space-5` (20px), `--space-6` (24px)
* `--space-8` (32px), `--space-10` (40px), `--space-12` (48px), `--space-16` (64px), `--space-24` (96px)

### B. Typography Hierarchy (Fluid Clamp)
Text elements use fluid typography to scale smoothly between mobile and desktop devices without breaking layouts:
* `--text-xs`: `clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)` (captions/labels)
* `--text-sm`: `clamp(0.875rem, 0.8rem + 0.35vw, 1rem)` (metadata)
* `--text-base`: `clamp(1rem, 0.9rem + 0.5vw, 1.125rem)` (body copy)
* `--text-lg` to `--text-4xl`: Large headings and showcase titles.

### C. Color Architecture
* **Primitives**: Brands (`--color-brand-500`, etc.), Neutrals (`--color-neutral-0` [white] to `--color-neutral-950` [rich black]).
* **Semantic Aliases**: Components reference ONLY these alias tokens:
  * `--bg-surface`: Background color (`--color-neutral-0`).
  * `--text-primary`: Primary reading text color (`--color-neutral-900`).
  * `--accent`: Primary gold brand color (`--color-brand-500`).

---

## 10. Motion Architecture & Performance Guidelines

Motion design is key to the premium experience on LARASANA. To keep scroll actions fluid (maintaining 60fps), follow these motion rules:

### A. Compositor-Only Transitions
* Avoid animating properties that trigger document reflows (e.g. `width`, `height`, `margin`, `padding`, `top`, `left`, `gap`).
* **Do transition**: `transform` (translates, scaling) and `opacity`.

### B. Resolving Transition Conflicts (GSAP & CSS)
When employing libraries like GreenSock (GSAP) to animate layout wrappers, the browser's own CSS `transition` rules will interfere with GSAP's style calculations, causing stuttering or static displays.
* **Rule**: When GSAP controls transforms on desktop/tablet, disable CSS transitions using targeted media query overrides:
  ```css
  @media (min-width: 48.01rem) {
    .your-animating-class {
      transition: none !important;
    }
  }
  ```

### C. Timeline Choreography (GSAP Contexts)
* Register all plugins globally (`gsap.registerPlugin(ScrollTrigger)`).
* Wrap animations in `@gsap/react` hooks or `gsap.context()` blocks to ensure all ScrollTriggers and event listeners revert cleanly on component unmount to prevent memory leaks.

---

## 11. Development Non-Negotiables & Async States

Ensure these rules are respected before submitting frontend pull requests:

### A. Enforce the Service Layer
* **Never call Axios or Fetch directly inside UI components**. All network calls must pass through the `/core/services` layer (using wrappers derived from `BaseService`).

### B. Native Keys for List Rendering
* When rendering collections of items (e.g. catalog cards, orders, cart lists), always use stable database UUIDs or keys. Do not use array indexes. This is critical for transitions and entrance staggers.

### C. Required Async States (Loading / Success / Error / Empty)
Every page that fetches data must handle all four states:
1. **Loading**: Render a premium shimmer skeleton layout matching the structure columns of the success layout.
2. **Success**: Populate the layout cleanly once the database returns records.
3. **Error**: Display a user-friendly error card with a retry option (never swallow errors silently or dump raw console logs).
4. **Empty**: Show an empty state card encouraging users to shop or take action.

---

## 12. Resilience, Testing & Reliability

To maintain service stability, prevent cascading failures in our microservice stack, and verify logic regressions, the following guidelines are established:

### A. API Resilience Mechanisms
1. **Global Timeout (8s)**: All REST requests going through the API Gateway are piped through a global [TimeoutInterceptor](file:///d:/LARASANA%20Updated/Frontend/backendV2/apps/api-gateway/src/common/timeout.interceptor.ts) which limits calls to a maximum of 8 seconds to prevent hanging microservice sockets.
2. **Selective GET Retries**: Idempotent read operations (`GET` requests on products, shipping, favorites, addresses, etc.) in the gateway proxy are configured with a `retry({ count: 2, delay: 300 })` filter to handle transient failures or container restarts during deployment. Do **not** apply retries to mutation methods (`POST`, `PATCH`, `DELETE`).
3. **Cities Lookup Cache (24h TTL)**: The RajaOngkir city lookup method implements a local 24-hour cache limit. The cache is refreshed from the external API only if it is empty or expired, preventing rate limit depletion.

### B. Health Monitoring
Each microservice deploys `@nestjs/terminus` health checks exposed on dedicated HTTP ports:
* **API Gateway**: HTTP `GET http://localhost:3000/api/v1/health` (liveness-only)
* **Users Service**: HTTP `GET http://localhost:4001/health` (liveness + TypeORM database connection ping)
* **Commerce Service**: HTTP `GET http://localhost:4002/health` (liveness + TypeORM database connection ping)
* **Notification Service**: HTTP `GET http://localhost:4003/health` (liveness-only)

### C. Testing Standards
All logic patches must preserve and expand the test suite coverage:
* **Backend Tests**: Run `npm test` inside `backendV2` to execute Jest unit tests covering:
  * Midtrans signature authentication ([midtrans.service.spec.ts](file:///d:/LARASANA%20Updated/Frontend/backendV2/apps/commerce-service/src/midtrans.service.spec.ts)).
  * Static fallback shipping ID resolution and Strategy Pattern delegation routing ([shipping.service.spec.ts](file:///d:/LARASANA%20Updated/Frontend/backendV2/apps/commerce-service/src/shipping.service.spec.ts)).
* **Frontend Tests**: Run `npm test` inside `frontend` to execute Vitest unit tests covering:
  * User address length and Indonesian phone format constraints ([Address.spec.ts](file:///d:/LARASANA%20Updated/Frontend/frontend/src/core/domain/models/Address.spec.ts)).

Here is a preview of the successful execution of the Jest and Vitest test suites:

<p align="center">
  <img src="./docs/assets/test result.png" alt="LARASANA Test Suite Results" width="90%" />
</p>




