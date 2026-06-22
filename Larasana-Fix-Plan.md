# Larasana — Detailed Fix Plan

**Source repo:** github.com/SERAVEEM/Larasana-React-nest (commit `df09180`)
**Purpose of this document:** A sequenced, file-level implementation plan an AI coding agent (Claude Code or similar) can execute directly against this repo. Each item lists the problem, the exact files involved, the fix, and how to verify it worked.

**How to use this with an AI agent:** Paste one numbered item at a time as a task (e.g. "Do item 1.1 from this plan"), or hand the agent the whole file and say "work through this in order, phase by phase, and ask before starting a new phase." Don't ask it to do all of Phase 1–4 in one shot — several items touch the same files and should land as separate, reviewable commits.

---

## Execution order

| Phase | Theme | Why this order |
|---|---|---|
| 0 | Prerequisites | Nothing else should land until env handling is sane |
| 1 | Critical — security/safety | Fixes things that fail *silently* into an insecure state |
| 2 | High — resilience | Fixes things that fail *loudly but badly* (hangs, no visibility) |
| 3 | Medium — architecture cleanup | Reduces future bug surface, no urgent risk today |
| 4 | Low — polish | Nice to have, do last |

---

## Phase 0 — Prerequisites

### 0.1 Create a `.env.example` and confirm `.env` is gitignored

**Problem:** There's no checked-in template showing which env vars are required, which makes it easy to deploy with vars missing — the exact precondition that triggers the Phase 1 JWT issue.

**Action:**
1. Check `backendV2/.gitignore` and `frontend/.gitignore` — confirm `.env` is excluded (it should be, since `larasana_db.sql` and configs are present but no `.env` is committed; verify, don't assume).
2. Create `backendV2/.env.example` listing every var currently read via `process.env.*` across `apps/` and `libs/`, with empty/placeholder values — no real secrets. Get this list by running:
   ```bash
   grep -rohE "process\.env\.[A-Z0-9_]+" backendV2/apps backendV2/libs | sort -u
   ```
3. Commit `.env.example`, do not commit `.env`.

**Definition of done:** `.env.example` exists at `backendV2/.env.example` with every variable name from the grep output, no real values.

---

## Phase 1 — Critical (security/safety)

### 1.1 Stop JWT secrets from silently falling back to hardcoded strings

**Problem:** 12 occurrences across 11 files do `process.env.JWT_ACCESS_SECRET ?? 'secret'` or `?? 'ganti_random_string_panjang_access'`. If the env var is unset in any deployed environment, every service quietly accepts a guessable, publicly-visible default — full auth bypass with no error, no log, no crash.

**Affected files (exact list, verified):**
```
backendV2/apps/users-service/src/auth.service.ts        (lines 208, 212)
backendV2/apps/api-gateway/src/common/guards.ts          (line 26)
backendV2/apps/api-gateway/src/admin/admin.module.ts     (line 9)
backendV2/apps/api-gateway/src/users/users.module.ts     (line 9)
backendV2/apps/api-gateway/src/auth/auth.module.ts       (line 9)
backendV2/apps/api-gateway/src/orders/orders.module.ts   (line 9)
backendV2/apps/api-gateway/src/upload/upload.module.ts   (line 9)
backendV2/apps/api-gateway/src/checkout/checkout.module.ts   (line 9)
backendV2/apps/api-gateway/src/shipping/shipping.module.ts   (line 9)
backendV2/apps/api-gateway/src/favorites/favorites.module.ts (line 9)
backendV2/apps/api-gateway/src/addresses/addresses.module.ts (line 9)
```

**Fix — Step 1: add a fail-fast helper to the shared lib**

Create `backendV2/libs/shared/src/config/require-env.ts`:
```ts
/**
 * Reads a required environment variable. Throws synchronously if it is
 * missing or empty, so the app refuses to boot rather than silently
 * falling back to an insecure default.
 */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
      `Set it in your .env file — see .env.example. Refusing to start with an insecure default.`,
    );
  }
  return value;
}
```
Export it from `backendV2/libs/shared/src/index.ts` alongside the other shared exports.

**Fix — Step 2: replace every fallback**

In each of the 11 files above, replace:
```ts
process.env.JWT_ACCESS_SECRET ?? 'secret'
// or
process.env.JWT_ACCESS_SECRET ?? 'ganti_random_string_panjang_access'
```
with:
```ts
requireEnv('JWT_ACCESS_SECRET')
```
and similarly `JWT_REFRESH_SECRET` in `auth.service.ts`. Import `requireEnv` from `'../../../../libs/shared/src'` (match the existing relative-import depth already used in each file for other shared imports — check the top of the file you're editing for the correct number of `../`).

**Fix — Step 3: enforce a minimum secret length (optional but recommended)**

Strengthen `requireEnv` for these two specific vars so a short/weak secret also fails fast:
```ts
export function requireSecret(name: string, minLength = 32): string {
  const value = requireEnv(name);
  if (value.length < minLength) {
    throw new Error(`${name} must be at least ${minLength} characters long.`);
  }
  return value;
}
```
Use `requireSecret('JWT_ACCESS_SECRET')` / `requireSecret('JWT_REFRESH_SECRET')` instead of the plain `requireEnv` for just those two.

**Verification:**
1. Unset `JWT_ACCESS_SECRET` locally and run `npm run start:gateway` — it must crash immediately on boot with the custom error message, not start successfully.
2. With the var set to a 32+ char value, all four services boot normally and login/checkout still work end-to-end.
3. `grep -rn "?? 'secret'" backendV2/apps` returns no results.

---

### 1.2 Add test infrastructure and the first regression tests

**Problem:** Zero `.spec.ts`/`.test.ts` files exist anywhere in the repo. `@nestjs/testing` is already a devDependency, but Jest itself, `ts-jest`, and `@types/jest` are not installed, and there is no `test` script in `package.json`. None of the fallback/transaction/signature logic this codebase relies on is regression-tested.

**Fix — Step 1: install and configure Jest**
```bash
cd backendV2
npm install --save-dev jest ts-jest @types/jest
```
Add to `backendV2/package.json`:
```json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch",
  "test:cov": "jest --coverage"
},
"jest": {
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testRegex": ".*\\.spec\\.ts$",
  "transform": { "^.+\\.(t|j)s$": "ts-jest" },
  "collectCoverageFrom": ["apps/**/*.(t|j)s", "libs/**/*.(t|j)s"],
  "testEnvironment": "node",
  "moduleNameMapper": {
    "^@app/shared(.*)$": "<rootDir>/libs/shared/src$1"
  }
}
```

**Fix — Step 2: write the first three tests** (highest-value, lowest-effort targets — pure logic, no DB/network mocking required)

**Test A — webhook signature verification** (`apps/commerce-service/src/midtrans.service.spec.ts`):
```ts
import { MidtransService } from './midtrans.service';
import * as crypto from 'crypto';

describe('MidtransService.verifySignature', () => {
  // Construct the service with a known test server key — check the
  // constructor in midtrans.service.ts for how serverKey is set
  // (likely via process.env.MIDTRANS_SERVER_KEY) and set that env var
  // in a beforeAll/beforeEach for this test file.

  it('accepts a correctly computed signature', () => {
    process.env.MIDTRANS_SERVER_KEY = 'test-server-key';
    const service = new MidtransService();
    const orderId = 'LRS-20260620-1234';
    const statusCode = '200';
    const grossAmount = '150000.00';
    const expected = crypto
      .createHash('sha512')
      .update(orderId + statusCode + grossAmount + 'test-server-key')
      .digest('hex');

    expect(service.verifySignature(orderId, statusCode, grossAmount, expected)).toBe(true);
  });

  it('rejects a tampered signature', () => {
    process.env.MIDTRANS_SERVER_KEY = 'test-server-key';
    const service = new MidtransService();
    expect(
      service.verifySignature('LRS-20260620-1234', '200', '150000.00', 'not-the-real-hash'),
    ).toBe(false);
  });
});
```
*(Before writing this, open `midtrans.service.ts` and confirm exactly how `serverKey` is read in the constructor — adjust the env var name/setup above to match.)*

**Test B — shipping fallback ID routing** (`apps/commerce-service/src/shipping.service.spec.ts`):
Test that `findById()` returns the correct mock carrier for IDs 101–103 without needing a real address or live API call (this path doesn't touch the DB):
```ts
import { ShippingService } from './shipping.service';

describe('ShippingService.findById — static fallback range', () => {
  let service: ShippingService;

  beforeEach(() => {
    // Construct with mock repos since this path never calls them
    service = new ShippingService({} as any, {} as any);
  });

  it('returns DHL for id 101', async () => {
    const result = await service.findById(101);
    expect(result.courier).toBe('DHL');
  });

  it('returns FedEx for id 102', async () => {
    const result = await service.findById(102);
    expect(result.courier).toBe('FEDEX');
  });

  it('throws NotFoundException for an id with no match in any range and no DB row', async () => {
    const mockRepo = { findOne: jest.fn().mockResolvedValue(null) };
    service = new ShippingService(mockRepo as any, {} as any);
    await expect(service.findById(99999)).rejects.toThrow('Metode pengiriman tidak ditemukan');
  });
});
```

**Test C — Address domain model validation** (`frontend/src/core/domain/models/Address.spec.ts`):
```ts
import { Address } from './Address';

describe('Address.isValidPhone', () => {
  it('accepts a valid Indonesian mobile number starting with 08', () => {
    const addr = new Address({ id: '1', label: 'Home', name: 'Test', street: 'Jl. Test No. 123', district: 'A', city: 'B', province: 'C', postalCode: '12345', phone: '081234567890' });
    expect(addr.isValidPhone()).toBe(true);
  });

  it('rejects a number that does not start with a valid prefix', () => {
    const addr = new Address({ id: '1', label: 'Home', name: 'Test', street: 'Jl. Test No. 123', district: 'A', city: 'B', province: 'C', postalCode: '12345', phone: '12345' });
    expect(addr.isValidPhone()).toBe(false);
  });
});

describe('Address.isValidStreetAddress', () => {
  it('rejects an address under 10 characters', () => {
    const addr = new Address({ id: '1', label: 'Home', name: 'Test', street: 'short', district: 'A', city: 'B', province: 'C', postalCode: '12345', phone: '081234567890' });
    expect(addr.isValidStreetAddress()).toBe(false);
  });
});
```
*(Frontend already uses Vite; add `vitest` instead of Jest there for consistency with the build tool: `npm install --save-dev vitest`, add `"test": "vitest run"` to `frontend/package.json`.)*

**Verification:** `npm test` (backend) and `npm test` (frontend) both run and pass. CI (if/when added) should block merges on test failure — see item 1.2-stretch below.

**Stretch (not required to close this item, but flag to the team):** Once these three exist, add a GitHub Actions workflow (`.github/workflows/test.yml`) that runs `npm test` on every PR.

---

### 1.3 Add rate limiting to auth/OTP endpoints

**Problem:** No `@nestjs/throttler` or equivalent exists in `backendV2/package.json`. Login, OTP send/verify, and password-reset endpoints (`apps/api-gateway/src/auth/auth.controller.ts`) have no request-rate protection — a 6-digit OTP with a 10-minute expiry is brute-forceable well within that window if requests aren't throttled.

**Fix:**
```bash
cd backendV2
npm install @nestjs/throttler
```
In `apps/api-gateway/src/app.module.ts`, import and register globally:
```ts
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 20 }]), // 20 req/min default, tune per-route below
    // ...existing imports
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    // ...existing providers
  ],
})
```
Then tighten the specific high-risk endpoints in `apps/api-gateway/src/auth/auth.controller.ts` with stricter per-route limits using the `@Throttle()` decorator, e.g.:
```ts
import { Throttle } from '@nestjs/throttler';

@Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts/min
@Post('login')
login(@Body() dto: LoginDto) { ... }

@Throttle({ default: { limit: 3, ttl: 600000 } }) // 3 OTP requests per 10 min
@Post('send-otp')
sendOtp(...) { ... }

@Throttle({ default: { limit: 5, ttl: 600000 } }) // 5 OTP verify attempts per 10 min
@Post('verify-email')
verifyEmail(...) { ... }
```
*(Confirm the exact route method names/decorators by opening `auth.controller.ts` — match the decorator to the real method signatures rather than guessing blind.)*

**Verification:** Send 6 rapid login requests with wrong credentials from a script/curl loop — the 6th should return `429 Too Many Requests` instead of reaching the auth logic.

---

## Phase 2 — High (resilience)

### 2.1 Add a global timeout to Gateway → microservice calls

**Problem:** Gateway controllers return `this.client.send(PATTERN, payload)` directly with no `.pipe(timeout(...))` anywhere (confirmed via repo-wide grep). If a downstream service (e.g. `commerce-service`) is down or wedged, the request hangs until the underlying TCP socket itself times out at the OS level — effectively unbounded from the client's perspective.

**Fix:** Add one global interceptor instead of editing every controller individually.

Create `backendV2/apps/api-gateway/src/common/timeout.interceptor.ts`:
```ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
} from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(8000), // 8s — generous enough for the slowest current call (shipping rate lookups)
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException('Upstream service did not respond in time'));
        }
        return throwError(() => err);
      }),
    );
  }
}
```
Register it globally in `apps/api-gateway/src/main.ts`, right after the existing `app.useGlobalFilters(...)` line:
```ts
import { TimeoutInterceptor } from './common/timeout.interceptor';
// ...
app.useGlobalInterceptors(new TimeoutInterceptor());
```

**Verification:** Temporarily stop `commerce-service` while the Gateway is running, hit any commerce-routed endpoint (e.g. `GET /api/v1/products`) — it should return HTTP 408 within ~8 seconds instead of hanging indefinitely.

---

### 2.2 Add retry — but only for safe (idempotent) operations

**Problem:** Beyond the hang issue fixed in 2.1, transient blips (a service restarting mid-deploy) currently surface as a hard failure to the user with no retry at all.

**Important constraint:** Do **not** blanket-retry every `client.send()` call. Retrying a `checkout` or `payments.webhook` call that already reached the server but timed out on the *response* could double-charge or double-create an order. Only apply retry to read-only/query patterns.

**Fix:** Apply `.pipe(retry({ count: 2, delay: 300 }))` selectively, at the controller level, only to GET-style read endpoints — for example in `products.controller.ts`, `shipping.controller.ts` (GET routes only), and admin dashboard reads. Do **not** add it to `checkout.controller.ts`'s `checkout()` method, `payments.controller.ts`'s webhook handler, or any `POST`/`PATCH`/`DELETE` mutation pattern.

Example for a read-only route in `apps/api-gateway/src/products/products.controller.ts`:
```ts
import { retry } from 'rxjs/operators';

@Get()
findAll(@Query() query: any) {
  return this.client.send(PRODUCTS_PATTERNS.FIND_ALL, query).pipe(retry({ count: 2, delay: 300 }));
}
```

**Stretch (Phase 2, optional):** If `commerce-service` outages become frequent enough to matter operationally, introduce a real circuit breaker (e.g. the `opossum` npm package) around the `ClientProxy` so repeated failures short-circuit to an immediate cached/fallback response instead of repeatedly trying and timing out. Treat this as a follow-up once 2.1 and 2.2 are in and you have real failure-rate data to justify the added complexity.

**Verification:** Restart `commerce-service` while issuing a loop of `GET /api/v1/products` requests — a couple of requests during the restart window should succeed via retry instead of failing outright. Confirm a `POST /api/v1/checkout` during the same window does **not** retry (check logs/network tab — only one attempt should be visible).

---

### 2.3 Add health-check endpoints

**Problem:** No `/health` route or `@nestjs/terminus` exists in any service. An orchestrator can't currently distinguish "process is up" from "process is up but its DB connection is dead."

**Fix:**
```bash
cd backendV2
npm install @nestjs/terminus
```
For each of the 4 apps (`api-gateway`, `users-service`, `commerce-service`, `notification-service`), add a `health` module. Example for `commerce-service` (`apps/commerce-service/src/health.controller.ts`):
```ts
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([() => this.db.pingCheck('database')]);
  }
}
```
Register `TerminusModule` in each service's `app.module.ts` imports and add `HealthController` to its `controllers` array. For `api-gateway` (which has no direct DB connection), a simpler liveness-only check is enough (no `TypeOrmHealthIndicator`).

**Verification:** `curl http://localhost:3002/health` (commerce-service) returns `200 {"status":"ok",...}` when MySQL is reachable, and a non-200 status when the DB is stopped.

---

## Phase 3 — Medium (architecture cleanup)

### 3.1 Centralize the IDR/USD exchange rate

**Problem:** The literal `15000` is hardcoded independently in 6 files with no shared constant:
```
frontend/src/hooks/usePayment.ts:49
frontend/src/hooks/useCheckout.ts:207
frontend/src/core/domain/models/ShippingOption.ts:24
frontend/src/core/domain/models/Order.ts:26
frontend/src/core/domain/models/Product.ts:79
backendV2/apps/commerce-service/src/payments.service.ts:82
```

**Fix:**
- **Backend:** `shipping.service.ts` already reads this from `process.env.RAJAONGKIR_USD_RATE`. Reuse the same env var in `payments.service.ts` instead of the literal `15000`:
  ```ts
  const exchangeRate = Number(process.env.RAJAONGKIR_USD_RATE ?? '15000');
  ```
- **Frontend:** Create `frontend/src/core/config/currency.ts`:
  ```ts
  export const IDR_PER_USD = 15000; // keep in sync with backend RAJAONGKIR_USD_RATE
  ```
  Replace the literal `15000` in all 5 frontend files with `IDR_PER_USD` imported from this file.
- **Better long-term fix (note for the team, not required now):** Have the frontend fetch the active rate from the backend (e.g. a small `/config` endpoint) instead of duplicating it client-side at all — this fully eliminates the drift risk rather than just centralizing it per-codebase. Flag this as a follow-up ticket rather than doing it in this pass.

**Verification:** `grep -rn "15000" frontend/src backendV2/apps` returns only the two definition sites (the `IDR_PER_USD` constant and the backend env-var default), not scattered literals.

---

### 3.2 Split `commerce-service` into feature sub-modules

**Problem:** `apps/commerce-service/src/app.module.ts` registers 7 unrelated controllers (Products, Favorites, Addresses, Shipping, Orders, Payments, Upload) and 8 providers flat in one `@Module()`, unlike the Gateway, which has a dedicated module folder per domain.

**Fix:** This is a structural refactor — do it incrementally, one domain at a time, each as its own commit/PR, starting with the most isolated one (Favorites, since nothing else depends on it) before touching Payments/Orders (which do depend on each other).

For each domain, e.g. Favorites:
1. Create `apps/commerce-service/src/favorites/` folder.
2. Move `favorites.controller.ts`, `favorites.service.ts` into it (update relative import paths — they'll need one more `../` to reach `libs/shared`).
3. Create `apps/commerce-service/src/favorites/favorites.module.ts`:
   ```ts
   import { Module } from '@nestjs/common';
   import { TypeOrmModule } from '@nestjs/typeorm';
   import { Favorite } from '../../../../libs/shared/src';
   import { FavoritesController } from './favorites.controller';
   import { FavoritesService } from './favorites.service';

   @Module({
     imports: [TypeOrmModule.forFeature([Favorite])],
     controllers: [FavoritesController],
     providers: [FavoritesService],
   })
   export class FavoritesModule {}
   ```
4. In `app.module.ts`, replace the direct `FavoritesController`/`FavoritesService` registration with `imports: [..., FavoritesModule]`, and remove them from the flat `controllers`/`providers` arrays.
5. Repeat for Addresses, then Products, then Upload, then (together, since they share a transaction) Orders+Payments+Midtrans, then Shipping last (it's the most complex — pair this with item 4.2 below rather than doing it twice).

**Verification after each domain is moved:** `npm run start:commerce` boots with no DI resolution errors, and the existing endpoints for that domain still respond correctly (use the Swagger UI at `/api/docs` to manually exercise each moved endpoint).

---

### 3.3 Add a TTL to `citiesCache` and document the scaling limitation

**Problem:** `ShippingService.citiesCache` (`commerce-service/src/shipping.service.ts:8,566-590`) is populated once and never expires or refreshes, and is process-local (not shared across instances if scaled horizontally).

**Fix (minimum — TTL):**
```ts
private citiesCache: any[] | null = null;
private citiesCacheExpiresAt = 0;
private readonly CITIES_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

// inside getCities(), replace `if (!this.citiesCache)` with:
if (!this.citiesCache || Date.now() > this.citiesCacheExpiresAt) {
  // ...existing fetch logic...
  // on success:
  this.citiesCache = results;
  this.citiesCacheExpiresAt = Date.now() + this.CITIES_CACHE_TTL_MS;
  return this.citiesCache;
}
```
**Fix (if/when scaled to >1 instance):** Replace the in-memory cache with Redis (`ioredis` or `@nestjs/cache-manager` + Redis store), keyed as `shipping:cities`, same 24h TTL. Don't do this preemptively if the service currently runs as a single instance — note it as a trigger condition ("do this when you add a second commerce-service replica"), not a task to complete now.

**Verification:** Mock `Date.now()` forward by 25 hours in a test (or temporarily set `CITIES_CACHE_TTL_MS` very low) and confirm a second call to `getCities()` re-fetches rather than reusing the stale cache.

---

## Phase 4 — Low (polish)

### 4.1 Add Helmet for security headers

**Fix:**
```bash
cd backendV2
npm install helmet
```
In `apps/api-gateway/src/main.ts`, near the top of `bootstrap()`:
```ts
import helmet from 'helmet';
// ...
app.use(helmet());
```
**Verification:** `curl -I http://localhost:3000/api/v1/products` shows `X-Content-Type-Options`, `Strict-Transport-Security`, etc. in the response headers.

---

### 4.2 Refactor `shipping.service.ts` into a strategy pattern

**Problem:** 597 lines in one class, handling RajaOngkir, EasyPost, Biteship, and city-fuzzy-matching all together. Adding a 4th provider means editing this same file again.

**Fix (do this after 3.2, as part of moving Shipping into its own module):**
1. Create `apps/commerce-service/src/shipping/providers/` folder.
2. Define a shared interface:
   ```ts
   // shipping/providers/shipping-provider.interface.ts
   export interface ShippingProvider {
     fetchRates(address: Address): Promise<ShippingMethod[]>;
   }
   ```
3. Move the RajaOngkir-specific logic (`getRajaOngkirCityId`, `fetchRajaOngkirCost`, `fetchRajaOngkirRates`, `getCities`) into `shipping/providers/rajaongkir.provider.ts` implementing `ShippingProvider`.
4. Move EasyPost logic into `shipping/providers/easypost.provider.ts`, Biteship logic into `shipping/providers/biteship.provider.ts`, each implementing the same interface.
5. `ShippingService` itself becomes a thin orchestrator: it injects all three providers, calls the right one(s) based on the ID-range logic already in place, and keeps the ID-range routing table (101–103, 200+, 300+, 400s, 500+) as its own responsibility — that routing logic is the one part of the current file that *should* stay centralized, since it's what makes the fallback system coherent across providers.

**Verification:** After the refactor, `findById()` and `getRates()` behave identically for every existing ID range — re-run the Phase 1.2 shipping tests (extend them to cover EasyPost/Biteship ranges too) and confirm no behavior change, only file organization change.

---

## Definition of done (overall)

- [x] No hardcoded secret fallbacks remain (`grep -rn "?? 'secret'" backendV2` is empty)
- [x] `npm test` passes in both `backendV2` and `frontend`, with at least the signature/fallback/validation tests above in place
- [x] Login/OTP endpoints return 429 under rapid repeated requests
- [x] A downed `commerce-service` produces an 8s timeout response, not an indefinite hang
- [x] `/health` responds correctly on each backend service
- [x] The exchange rate exists in exactly one place per codebase (frontend constant, backend env var)
- [x] `commerce-service/src/app.module.ts` no longer lists more than 2–3 controllers directly (the rest live in their own feature modules)
- [x] `shipping.service.ts` is under ~150 lines, with provider-specific logic moved out
