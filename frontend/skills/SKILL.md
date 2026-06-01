---
name: Full-Stack Engineering & Motion Architecture
skill_name: Full-Stack Engineering & Motion Architecture
description: >
  Principles for building performant, motion-heavy, high-fidelity web applications
  with full-stack FE/BE integration. Covers Figma-to-code translation, token systems,
  spacing fidelity, API wiring, visual QA, and surgical implementation using
  Node.js, React/Vue, and modern CSS.
stack: [Node.js, Express, React, Vue, CSS Motion, UUID, Tailwind, GSAP, Framer Motion]
author: Senior Developer / Researcher
updated: 2026-05
modes:
  interactive: Human is in the loop. Ask before deciding.
  autonomous:  Agent executes without confirmation. Flag assumptions, never guess silently.
---

# AGENT MODE — READ THIS FIRST

Before executing any task, determine which mode applies:

| Mode | When | Behavior |
|------|------|----------|
| `interactive` | Human is actively in chat | Ask when ambiguous. One question at a time. |
| `autonomous` | Running headless / agentic pipeline | Never halt to ask. Make the safest decision, log it as `/* AGENT DECISION: reason */`, continue. |

**Default to `autonomous` unless the human sends a message in the same session.**

---

# 0. Design Source — Run This Before Anything Else

## 0.1 Figma-First Protocol

Designs live in `/designs`. The agent reads specs before looking at screenshots.

```
/designs
  /tokens
    spacing.json      ← exported from Figma Tokens plugin
    colors.json
    typography.json
  /screens
    dashboard.png
    dashboard@2x.png
  /components
    card.png
    card-spec.png     ← annotated screenshot with spacing values labeled
```

**Priority order for reading spacing values:**

1. `spacing.json` from Figma Tokens plugin — ground truth, use exactly
2. Figma Dev Mode CSS snippet — paste alongside prompt, agent reads it directly
3. Annotated `*-spec.png` with red measurement lines — agent reads the labels
4. Plain screenshot — last resort only

**If none of the above exist:**
- Use the 4pt grid token nearest to the visual estimate
- Mark every inferred value: `/* SPACING UNVERIFIED — confirm in Figma */`
- After generation, do `Ctrl+F` for `SPACING UNVERIFIED` to find every gap to repair

**Never infer spacing from an unannotated image alone. Never.**

## 0.2 Figma Dev Mode — How to Use It

In Figma, select any frame → open Dev Mode panel (right side) → copy the CSS block. Paste it into your prompt. The agent reads pixel-exact values from it and does not estimate.

For the free plan: select the frame → right panel shows padding, gap, border-radius explicitly. Copy these manually before prompting.

## 0.3 Token Extraction

Before touching JSX/HTML, extract the design system into CSS custom properties:

```css
:root {
  /* Spacing — 4pt grid. Every value must be a multiple of 4 */
  --space-1: 4px;   --space-2: 8px;   --space-3: 12px;
  --space-4: 16px;  --space-6: 24px;  --space-8: 32px;
  --space-12: 48px; --space-16: 64px; --space-24: 96px;

  /* Type Scale — fluid with clamp(), never hardcoded px */
  --text-xs:   clamp(0.75rem,  0.7rem  + 0.25vw, 0.875rem);
  --text-sm:   clamp(0.875rem, 0.8rem  + 0.35vw, 1rem);
  --text-base: clamp(1rem,     0.9rem  + 0.5vw,  1.125rem);
  --text-lg:   clamp(1.125rem, 1rem    + 0.6vw,  1.25rem);
  --text-xl:   clamp(1.25rem,  1.1rem  + 0.75vw, 1.5rem);
  --text-2xl:  clamp(1.5rem,   1.2rem  + 1.5vw,  2rem);
  --text-3xl:  clamp(1.875rem, 1.4rem  + 2.5vw,  3rem);
  --text-4xl:  clamp(2.25rem,  1.6rem  + 3.5vw,  4rem);

  /* Color — primitives first, then semantic aliases */
  --color-brand-500: #your-brand;
  --color-brand-600: #darker-10%;
  --color-brand-400: #lighter-10%;
  --color-neutral-50:  #fafafa;
  --color-neutral-900: #0f0f0f;

  /* Semantic aliases — use ONLY these in components */
  --bg-surface:    var(--color-neutral-50);
  --bg-elevated:   #ffffff;
  --text-primary:  var(--color-neutral-900);
  --text-muted:    #6b7280;
  --border-subtle: rgba(0,0,0,0.08);
  --accent:        var(--color-brand-500);

  /* Shadow Scale — 4 levels max */
  --shadow-sm:  0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md:  0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04);
  --shadow-lg:  0 12px 32px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.04);
  --shadow-xl:  0 24px 64px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.04);

  /* Radius */
  --radius-sm: 4px;   --radius-md: 8px;
  --radius-lg: 12px;  --radius-xl: 16px;  --radius-full: 9999px;

  /* Motion */
  --ease-out-expo:  cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-expo:   cubic-bezier(0.7, 0, 0.84, 0);
  --ease-spring:    cubic-bezier(0.34, 1.56, 0.64, 1);
  --duration-fast:  150ms;
  --duration-base:  250ms;
  --duration-slow:  400ms;
  --duration-enter: 500ms;
}
```

**Rule:** If a value doesn't map to a token, it needs a `SPACING UNVERIFIED` comment — not a hardcoded number.

## 0.4 Existing Codebase Merge Protocol

When the agent is editing an existing project (not greenfield), follow this order:

1. **Audit first** — scan existing files for hardcoded hex, magic spacing numbers, inline styles
2. **Do not rewrite** — fix only the component in scope. Flag others with `/* TOKEN DEBT: replace with var(--...) */`
3. **Match the existing paradigm** — if the project uses Tailwind, use Tailwind classes. If CSS Modules, CSS Modules. Never introduce a second styling system.
4. **One file scope per task** — a surgical change touches at most the target component + its direct style file. No import path changes, no symbol renames, no unrelated file edits.
5. **Log every deviation** — any existing value the agent cannot map to a token gets flagged inline, not silently adopted.

## 0.5 Design Ambiguity Protocol

| Ambiguity | Resolution |
|-----------|------------|
| Spacing not in tokens.json | Use the 4pt grid nearest token. Flag `SPACING UNVERIFIED`. |
| Color hex missing | Derive from closest named token. Document it. |
| Breakpoint behavior unclear | Mobile-first. Stack vertically on < 768px. |
| Animation not designed | Default: `opacity + translateY(12px)`, `--duration-base`, `--ease-out-expo`. |
| Dark mode not specified | Build light. Add `prefers-color-scheme` hook with token swaps. |
| Font weight unclear | Body: 400. Subheadings: 500. Headings: 600–700. Never 800+ on body. |

Always state the assumption as a comment. Never silently decide.

---

# 1. Think Before Coding

- **Visual Intent First:** Identify the feeling the design communicates before identifying components. A fintech dashboard and a creative portfolio both have cards — but completely different spatial density, shadow depth, and type weight.
- **Performance vs. Polish:** Explicitly flag if an animation will cause Layout Shifts (CLS). `transform` and `opacity` stay on the compositor thread. Everything else is negotiable.
- **Memory & Asset Constraints:** Images must have explicit `width`/`height` or `aspect-ratio` before they load. No layout shift from image pop-in.
- **State Ownership:** Determine if animation state belongs in URL, Global Store, or Local Component before writing logic.
- **Async Clarity:** Does the exit animation wait for the `201 Created` or run optimistically? Decide upfront.

---

# 2. Component Anatomy — Break Design Down Correctly

## 2.1 Decomposition Order

```
Page Layout
  └── Sections (full-width regions)
        └── Containers (max-width wrappers)
              └── Blocks (logical groupings)
                    └── Components (cards, forms, navs)
                          └── Elements (buttons, inputs, text)
                                └── Tokens (colors, spacing, type)
```

Start from tokens. Build up. Never top-down.

## 2.2 Component Anatomy Rules

Each component must define:
- **Boundary:** What CSS `max-width`, `width`, or `flex`/`grid` context does it live in?
- **Spacing contract:** What padding does it own? What margin does its parent set?
- **Responsive behavior:** Does it reflow, hide, or scroll at small viewports?
- **State inventory:** default / hover / active / focus / disabled / loading / error / empty
- **Motion contract:** What animates on enter? On exit? On interaction?

## 2.3 High-Fidelity Implementation Checklist

**Typography**
- [ ] Line-height: body `1.6`, headings `1.1–1.2`, UI labels `1.3`
- [ ] Letter-spacing: headings `-0.02em`, body `0`, uppercase labels `0.08em`
- [ ] Max line length: 60–70ch on prose, uncapped on UI
- [ ] Font loaded with `display=swap` and a matching system fallback

**Color & Contrast**
- [ ] Text on bg meets WCAG AA (4.5:1 normal, 3:1 large)
- [ ] No hardcoded hex values in components — only semantic tokens
- [ ] Focus ring is `2px solid var(--accent)` with `2px offset`, visible in both modes

**Spacing**
- [ ] Every spacing value maps to a token in `spacing.json` or the 4pt grid
- [ ] Section vertical padding: minimum `var(--space-16)` desktop, `var(--space-8)` mobile
- [ ] No magic numbers. If you typed `17px`, stop and flag it.
- [ ] `Ctrl+F SPACING UNVERIFIED` returns 0 before marking done

**Interaction**
- [ ] All clickable elements: `cursor: pointer`
- [ ] Hover transitions: `var(--duration-fast)` to `var(--duration-base)`
- [ ] Hover states don't cause layout shift (no `margin`/`padding` changes on hover)
- [ ] `:focus-visible` — not `:focus` — for keyboard rings

**Responsiveness**
- [ ] Tested at 375px (iPhone SE), 768px, 1280px, 1536px
- [ ] No horizontal scroll at any breakpoint
- [ ] Touch targets ≥ 44×44px
- [ ] Font sizes never below 16px on mobile body text

---

# 3. Simplicity First

- **Native over Library:** CSS Transitions/Keyframes first. Framer Motion or GSAP only for multi-step choreography or scroll-driven sequences.
- **No Library for Spacing/Color:** Never `styled-components` just to pass a prop. CSS custom properties do this natively.
- **Lightweight Custom Graphics:** Build with `div`s, flexbox, and SVG before importing Recharts. A `200×4px` progress bar does not need a charting library.
- **No Speculative Abstractions:** Don't build an `AnimationContext` for two animated elements.
- **Component Reuse vs. Layout Pollution:** Full-screen components reused in tabs must expose `showNavigation`, `showHeader` flags. Never let a component assume its own context.

---

# 4. Surgical Changes

- **Style Heritage:** Match the existing paradigm. Introducing a second styling system mid-project is a bug, not a feature.
- **Scope Protection:** New motion or state additions must not leak re-renders up the tree. Use `React.memo`, `useMemo`, or Vue's `computed` where the profiler confirms it matters.
- **No Cosmetic Refactoring:** Don't rename variables or reorganize unrelated files while fixing a component. Separate PRs.
- **File Scope Rule:** One task = one target component + its direct style file. No more.
- **Bypass & Admin Triggers:** Debug panels via quiet multi-tap or keyboard shortcut sequences — not visible dev buttons in production UI.
- **Cleanup:** Remove every `will-change`, `console.log`, and unused import your change made redundant.

---

# 5. Motion — Intentional, Not Decorative

## 5.1 Motion Budget

Every page gets a motion budget:
- **1 entrance animation** per page load (staggered children, max 6 items, delay step `50ms`)
- **Micro-interactions** on user-triggered events only (hover, click, focus)
- **No looping animations** unless they serve real-time data feedback
- **Scroll-driven animations** only for storytelling/marketing pages — not dashboards

## 5.2 Performance-First Animation Rules

```css
/* ✅ Compositor-only — smooth at any FPS */
transform: translateY(0);
opacity: 1;
filter: blur(0);

/* ❌ Triggers layout — causes frame drops */
width, height, padding, margin, top, left
```

Always: `will-change: transform` declared before animation starts, removed after it ends.

## 5.3 Animation Defaults

| Scenario | Duration | Easing | Properties |
|----------|----------|--------|------------|
| Element enters view | `--duration-enter` | `ease-out-expo` | `opacity` + `translateY(16px→0)` |
| Hover state | `--duration-fast` | `ease-out` | `color`, `bg`, `shadow` |
| Modal/drawer open | `--duration-slow` | `ease-out-expo` | `opacity` + `translateY/X` |
| Skeleton shimmer | `1.4s` | `linear`, infinite | `background-position` |
| Page transition | `--duration-slow` | `ease-in-expo` out, `ease-out-expo` in | `opacity` |
| Spring/bounce | `--duration-slow` | `ease-spring` | `transform: scale` |

## 5.4 Reduced Motion — Non-Negotiable

```css
/* Ship this in base CSS, not per-component */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 5.5 Accessibility — Consolidated Checklist

All rules in one place. Check these together, not scattered across sections:

- [ ] `prefers-reduced-motion` base rule present in global CSS
- [ ] All text contrast meets WCAG AA (4.5:1 body, 3:1 large text)
- [ ] Focus ring: `2px solid var(--accent)` with `2px offset` on `:focus-visible`
- [ ] Touch targets ≥ 44×44px
- [ ] Tab order makes sense without a mouse
- [ ] `aria-label` on icon-only buttons
- [ ] Images have `alt` text or `alt=""` if decorative
- [ ] No content conveyed by color alone

---

# 6. FE/BE Integration

This section covers wiring the frontend to the backend. Every UI state must map to a real API state.

## 6.1 API Contract — Define Before Building

Before writing a single fetch call, agree on the contract. Create a `api-contract.md` or inline it as a comment in the service file:

```
GET  /api/users          → 200 { data: User[], total: number }
POST /api/users          → 201 { data: User } | 422 { errors: FieldError[] }
PUT  /api/users/:id      → 200 { data: User } | 404 | 422
DELETE /api/users/:id    → 204 | 404
```

**Rule:** Frontend and backend must agree on this contract before either side builds. No guessing at response shapes.

## 6.2 Data Flow Architecture

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

**Never call fetch() directly from a component.** All HTTP calls live in a `/api` or `/services` folder. Components call service functions, not URLs.

## 6.3 Loading, Error, and Empty States — All Three, Always

Every data-fetching component must handle all four states before it's considered done:

```tsx
// Required state shape for every async component
type AsyncState<T> = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string }

// Required UI for each state
idle    → nothing, or a disabled trigger
loading → skeleton (matches the success layout exactly — same height, same columns)
success → real data
error   → inline error message + retry action (never just a console.log)
empty   → empty state UI (not a blank div)
```

**Skeleton rule:** The skeleton must match the success layout's height and column structure exactly. A skeleton that shifts layout when data arrives causes CLS.

## 6.4 Optimistic Updates

For actions where the user expects instant feedback (toggle, delete, reorder):

```ts
// Pattern: update UI first, sync to server, roll back on failure
async function toggleItem(id: string) {
  // 1. Update local state immediately
  setItems(prev => prev.map(item =>
    item.id === id ? { ...item, active: !item.active } : item
  ))

  try {
    // 2. Sync to server
    await api.patch(`/items/${id}/toggle`)
  } catch (err) {
    // 3. Roll back on failure + show error
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, active: !item.active } : item
    ))
    showToast('Failed to save. Changes reverted.')
  }
}
```

**Rule:** Exit animation does not wait for the server response. The rollback triggers the re-entry animation. This is always faster and always correct.

## 6.5 Error Handling — Frontend Contract

```ts
// Centralized HTTP client with interceptors
const client = axios.create({ baseURL: '/api' })

client.interceptors.response.use(
  res => res,
  err => {
    const status = err.response?.status
    if (status === 401) redirect('/login')
    if (status === 403) showToast('You don\'t have permission for this.')
    if (status === 404) showToast('Not found.')
    if (status === 422) return Promise.reject(err) // let the form handle field errors
    if (status >= 500) showToast('Server error. Please try again.')
    return Promise.reject(err)
  }
)
```

| HTTP Status | UI Behavior |
|-------------|-------------|
| 200/201/204 | Success state or toast |
| 401 | Redirect to login |
| 403 | Inline permission error |
| 404 | Empty state or redirect |
| 422 | Field-level validation errors on the form |
| 500+ | Toast + retry option |

**Never swallow errors silently. Never show raw error objects to the user.**

## 6.6 Form Validation — Two-Layer Rule

Forms validate twice: client-side for UX, server-side for integrity. Never trust client-only validation.

```tsx
// Layer 1: Client-side (instant feedback, UX only)
const schema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().min(2, 'Name too short'),
})

// Layer 2: Server returns 422 with field errors
// Map them back onto the form — never just show a generic toast
if (err.response?.status === 422) {
  err.response.data.errors.forEach(({ field, message }) => {
    form.setError(field, { message })
  })
}
```

## 6.7 Real-Time Data

Dashboards and live feeds use WebSocket or SSE — never `setInterval` polling.

```ts
// WebSocket pattern
const ws = new WebSocket('wss://api.yourapp.com/live')
ws.onmessage = (event) => {
  const update = JSON.parse(event.data)
  setDashboardData(prev => merge(prev, update))
}
ws.onclose = () => scheduleReconnect() // always handle disconnect

// SSE pattern (simpler, one-way)
const es = new EventSource('/api/stream')
es.onmessage = (event) => updateFeed(JSON.parse(event.data))
```

**Rule:** Data changes trigger re-renders. Browser reloads are never the solution.

## 6.8 Auth Integration

```ts
// JWT: attach token in interceptor, never in component
client.interceptors.request.use(config => {
  const token = getToken() // from secure storage, not localStorage for sensitive apps
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Protected routes — middleware handles auth, not animation logic
// Never build custom fading logic that bypasses JWT/session checks
```

**Data integrity rule:** New records default to `isVerified: false` on the backend. Never trust client-sent verification flags.

## 6.9 Backend Structure (Node/Express)

```
/src
  /routes          ← HTTP routing only, no business logic
  /controllers     ← request/response handling, calls services
  /services        ← business logic, calls repositories
  /repositories    ← database queries only
  /middleware      ← auth, validation, error handling
  /types           ← shared TypeScript types (import in FE too)
```

**Shared types rule:** If the frontend and backend are in the same monorepo, the API response types live in `/types` and are imported by both sides. No duplicated interfaces.

## 6.10 Environment & Config

```
.env.local          ← never committed
.env.example        ← committed, no real values
```

```ts
// Config accessed via typed wrapper, never process.env directly in components
import { config } from '@/config'
config.apiUrl     // ✅
process.env.NEXT_PUBLIC_API_URL  // ❌ — scattered, untyped
```

---

# 7. Goal-Driven Execution

## 7.1 The Build Loop

1. **Tokens** → Read `spacing.json`, `colors.json`, `typography.json` → verify every value maps to a token
2. **API Contract** → Define request/response shapes before writing fetch calls
3. **Skeleton** → Static HTML/JSX with correct semantics → passes axe, no layout shift
4. **Style** → Apply tokens → matches design at 375/768/1280/1536 → `SPACING UNVERIFIED` count = 0
5. **State** → Wire async states (loading skeleton, error, empty, success) → all four reachable
6. **Motion** → Layer animation → 60fps in DevTools, `prefers-reduced-motion` respected
7. **Data** → Wire to API → optimistic update triggers immediately, error rolls back cleanly
8. **QA** → Run checklist below

## 7.2 Visual QA Checklist

```
□ No console errors or warnings
□ No layout shift on data arrival (CLS = 0)
□ Ctrl+F "SPACING UNVERIFIED" → 0 results
□ Ctrl+F "TOKEN DEBT" → logged and ticketed, not ignored
□ No horizontal scroll at 375px
□ Lighthouse Performance > 90
□ All text passes contrast check (axe DevTools)
□ Tab through the page — focus ring visible on every interactive element
□ Disable CSS — content still makes sense semantically
□ Throttle CPU 4x — animations still feel intentional
□ prefers-reduced-motion enabled — page fully functional
□ Light and dark mode verified
□ All 4 async states reachable (loading / error / empty / success)
□ 422 validation errors appear on the correct form fields
□ Network tab — no duplicate requests on mount
□ WebSocket/SSE reconnects after disconnect
```

## 7.3 Design Fidelity vs. Engineering Judgment

| Design Intent | Common Issue | Engineering Decision |
|---------------|-------------|----------------------|
| Custom font | FOUC on slow connections | `font-display: swap` + system fallback with matching metrics |
| Backdrop blur on mobile | Performance tank | Solid bg fallback at `< 768px` or `prefers-reduced-transparency` |
| Complex gradient mesh | WebGL not feasible | CSS `conic-gradient` + SVG `feTurbulence` approximation |
| Pixel-perfect shadows | Impossible at runtime | Closest token from shadow scale |
| Animation on every scroll | Motion-sensitive users | Scope to `@media (prefers-reduced-motion: no-preference)` |
| Real-time data via polling | Battery drain, race conditions | Replace with WebSocket or SSE |

Document every deviation in a comment. Never silently implement a workaround.

---

# 8. Framework & Stack Strictness

- **SSR Safety:** No `window`, `document`, or animation triggers in component body. Gate with `useEffect` / `onMounted` / `typeof window !== 'undefined'`.
- **Hydration Safety:** CSS-in-JS class mismatches cause FOUC. Prefer CSS Modules or Tailwind for SSR projects.
- **Standard Auth Middleware:** Never build custom fading logic that bypasses JWT/session checks. Middleware is middleware.
- **Data Integrity:** New records default to `isVerified: false`. Backend validates before changing — never trust client-sent flags.
- **Native UUIDs as Keys:** DB UUIDs as React/Vue list keys. Never array index. Critical during animated list transitions.
- **Reactive Sync:** Dashboards bind to WebSocket or SSE. Data changes trigger re-renders — not browser reloads.

---

# 9. Verifiable Conversations

Translate feeling to spec. Translate spec to token. Translate token to code.

- "This animation feels slow" → "Target: enter under 400ms on mid-range Android. Measure with Chrome DevTools Performance tab."
- "The design doesn't match" → "List the 3 specific token deviations. Fix in order of visual weight."
- "Make it more premium" → "Define: heavier shadow scale? Tighter letter-spacing on headings? More negative space?"
- "The data isn't loading right" → "Which async state is broken — loading, error, empty, or success? Check Network tab first."
- "It feels slow when I click" → "Is it an optimistic update missing, or a real network delay? Open Network tab, check TTFB."

**Engineering mastery is building the right thing precisely, not the everything thing approximately.**