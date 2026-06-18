# Frontend/Backend Integration & Stack Discipline

Every UI state should map to a real API state. This file covers wiring a
component up once its static version (see `component-architecture.md`) is
working.

## API Contract — Define Before Building

Before writing a fetch call, agree on the contract — as an `api-contract.md`
or inline comment in the service file:

```
GET    /api/users      → 200 { data: User[], total: number }
POST   /api/users      → 201 { data: User } | 422 { errors: FieldError[] }
PUT    /api/users/:id  → 200 { data: User } | 404 | 422
DELETE /api/users/:id  → 204 | 404
```

Frontend and backend should agree on shapes before either side builds
against assumptions — a 422 that the frontend doesn't expect, or a `data`
wrapper one side assumes and the other doesn't, is cheap to fix now and
expensive to fix after both sides are built.

## Data Flow Architecture

```
UI Event
  └── Service Layer (api/userService.ts)
        └── HTTP Client (axios / fetch wrapper)
              └── Backend Route (Express / FastAPI)
                    └── Controller
                          └── Service (business logic)
                                └── Repository (DB query)
                                      └── Response shape → back up the chain
```

Components call service functions, not URLs — never `fetch()` directly from
a component. All HTTP calls live in an `/api` or `/services` folder. This
keeps the contract in one place and makes it possible to mock for tests.

## Loading, Error, and Empty States — All Four, Always

A data-fetching component isn't done until all four states are handled:

```tsx
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string }

// idle    → nothing, or a disabled trigger
// loading → skeleton matching the success layout's height/columns exactly
// success → real data
// error   → inline message + retry action (never just console.log)
// empty   → dedicated empty-state UI, not a blank div
```

**Skeleton rule:** the skeleton's height and column structure must match the
success layout exactly. A skeleton that shifts when real data arrives causes
CLS — the same problem the High-Fidelity Checklist in
`component-architecture.md` flags for images.

## Optimistic Updates

For actions where the user expects instant feedback (toggle, delete,
reorder): update local state immediately, sync to the server, and roll back
on failure.

```ts
async function toggleItem(id: string) {
  // 1. Update local state immediately
  setItems(prev => prev.map(item =>
    item.id === id ? { ...item, active: !item.active } : item
  ))

  try {
    // 2. Sync to server
    await api.patch(`/items/${id}/toggle`)
  } catch (err) {
    // 3. Roll back on failure and show why
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, active: !item.active } : item
    ))
    showToast('Failed to save. Changes reverted.')
  }
}
```

The exit/transition animation for the action should not wait for the server
response — only the rollback (if it happens) triggers a re-entry animation.
This keeps the UI feeling instant on the common path without lying about
what actually happened on the error path.

## Error Handling — Frontend Contract

A centralized interceptor keeps error handling out of individual
components:

```ts
const client = axios.create({ baseURL: '/api' })

client.interceptors.response.use(
  res => res,
  err => {
    const status = err.response?.status
    if (status === 401) redirect('/login')
    if (status === 403) showToast("You don't have permission for this.")
    if (status === 404) showToast('Not found.')
    if (status === 422) return Promise.reject(err) // let the form handle field errors
    if (status >= 500) showToast('Server error. Please try again.')
    return Promise.reject(err)
  }
)
```

| HTTP Status | UI Behavior |
|---|---|
| 200/201/204 | Success state or toast |
| 401 | Redirect to login |
| 403 | Inline permission error |
| 404 | Empty state or redirect |
| 422 | Field-level validation errors on the form |
| 500+ | Toast + retry option |

Never swallow an error silently, and never show a raw error object to the
user — both make debugging harder for the user and look unfinished.

## Form Validation — Two Layers

Client-side validation is for UX responsiveness; it is never the source of
truth.

```tsx
// Layer 1: client-side, instant feedback
const schema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().min(2, 'Name too short'),
})

// Layer 2: server returns 422 with field errors — map them onto the form,
// don't just show a generic toast
if (err.response?.status === 422) {
  err.response.data.errors.forEach(({ field, message }) => {
    form.setError(field, { message })
  })
}
```

## Real-Time Data

Dashboards and live feeds use WebSocket or SSE, not `setInterval` polling —
polling drains battery and can race with optimistic updates.

```ts
// WebSocket
const ws = new WebSocket('wss://api.yourapp.com/live')
ws.onmessage = (event) => {
  const update = JSON.parse(event.data)
  setDashboardData(prev => merge(prev, update))
}
ws.onclose = () => scheduleReconnect() // always handle disconnect

// SSE (simpler, one-way)
const es = new EventSource('/api/stream')
es.onmessage = (event) => updateFeed(JSON.parse(event.data))
```

Data changes should trigger re-renders directly — a full page reload is
never the fix for "the data didn't update."

## Auth Integration

```ts
client.interceptors.request.use(config => {
  const token = getToken() // secure storage, not localStorage for sensitive apps
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
```

Protected routes are handled by auth middleware, not by component-level
animation or visibility logic — don't build a "fade out if unauthorized"
pattern that bypasses the actual check.

**Data integrity:** new records default to `isVerified: false` on the
backend. The backend validates and sets this — never trust a client-sent
verification flag.

## Backend Structure (Node/Express)

```
/src
  /routes        ← HTTP routing only, no business logic
  /controllers   ← request/response handling, calls services
  /services      ← business logic, calls repositories
  /repositories  ← database queries only
  /middleware    ← auth, validation, error handling
  /types         ← shared TypeScript types (import in FE too)
```

In a monorepo, API response types live in `/types` and are imported by both
sides — duplicated interfaces drift out of sync silently.

## Environment & Config

```
.env.local    ← never committed
.env.example  ← committed, no real values
```

```ts
// Accessed via a typed wrapper, not process.env scattered through components
import { config } from '@/config'
config.apiUrl                      // do this
process.env.NEXT_PUBLIC_API_URL    // not this — untyped, hard to grep
```

## Stack Discipline

A few cross-cutting rules that keep the rest of this working:

- **SSR safety** — no `window`, `document`, or animation triggers in a
  component's render body. Gate with `useEffect`/`onMounted`, or
  `typeof window !== 'undefined'`.
- **Hydration safety** — CSS-in-JS class-name mismatches between server and
  client cause FOUC. Prefer CSS Modules or Tailwind for SSR projects.
- **Auth middleware is middleware** — don't build custom fading/loading
  logic that effectively bypasses a JWT/session check; the check has to run
  regardless of how the UI looks while it's pending.
- **Reactive sync** — dashboards bind to WebSocket/SSE (above); a manual
  refresh button is a fallback, not the primary update path.
