# Component Architecture & Implementation Approach

## Before You Start: Read the Intent

A few minutes of thinking here saves a lot of rework later:

- **Visual intent first.** Identify the feeling the design communicates
  before identifying components. A fintech dashboard and a creative
  portfolio both have "cards" — but completely different spatial density,
  shadow depth, and type weight. Naming the feeling helps you pick the right
  defaults when something is unspecified.
- **Performance vs. polish.** If an animation will touch layout-affecting
  properties (causing CLS), flag it explicitly before building it — see
  `motion-and-accessibility.md` for the compositor-only property list.
- **Images need dimensions up front.** Every image needs explicit
  `width`/`height` or `aspect-ratio` before it loads, so there's no pop-in
  layout shift.
- **Decide where animation state lives** — URL, global store, or local
  component — before writing the logic. Retrofitting this later usually
  means a rewrite.
- **Decide async timing up front.** Does an exit animation wait for a `201
  Created`, or run optimistically? Pick one before writing either the
  animation or the API call (see `fe-be-integration.md` for the optimistic
  pattern).

## Decomposition Order

Work bottom-up from tokens, not top-down from the page:

```
Page Layout
  └── Sections (full-width regions)
        └── Containers (max-width wrappers)
              └── Blocks (logical groupings)
                    └── Components (cards, forms, navs)
                          └── Elements (buttons, inputs, text)
                                └── Tokens (colors, spacing, type)
```

Starting from tokens and building up tends to produce components that are
reusable by construction. Starting from the page and working down tends to
produce components tightly coupled to one layout.

## Component Contract

Before writing a component, be able to answer each of these — they're the
difference between a component that drops cleanly into other contexts and
one that only works in the place it was written:

- **Boundary** — what `max-width`, `width`, or flex/grid context does it
  expect to live in?
- **Spacing contract** — what padding does the component own internally,
  vs. what margin does its parent control?
- **Responsive behavior** — does it reflow, hide elements, or scroll at
  small viewports?
- **State inventory** — default / hover / active / focus / disabled /
  loading / error / empty, as applicable.
- **Motion contract** — what animates on enter? On exit? On interaction?

## High-Fidelity Checklist

Run through these before considering a component visually done.

**Typography**
- Line-height: body `1.6`, headings `1.1–1.2`, UI labels `1.3`.
- Letter-spacing: headings `-0.02em`, body `0`, uppercase labels `0.08em`.
- Max line length: 60–70ch on prose; uncapped on UI elements.
- Font loaded with `font-display: swap` and a metrically-matched system
  fallback to minimize FOUC.

**Color & Contrast**
- Text on background meets WCAG AA (4.5:1 normal text, 3:1 large text).
- No hardcoded hex values in components — only semantic tokens from
  `design-tokens.md`.
- Focus ring is `2px solid var(--accent)` with a `2px` offset, visible in
  both light and dark mode.

**Spacing**
- Every spacing value maps to a token from `spacing.json` or the 4pt grid.
- Section vertical padding: at least `var(--space-16)` on desktop,
  `var(--space-8)` on mobile.
- No magic numbers — if you typed `17px`, stop and either find the right
  token or flag `SPACING UNVERIFIED`.

**Interaction**
- All clickable elements get `cursor: pointer`.
- Hover transitions use `var(--duration-fast)` to `var(--duration-base)`.
- Hover states never change `margin`/`padding` (that causes layout shift on
  hover — animate `transform`/`opacity`/`box-shadow` instead).
- Keyboard focus styling uses `:focus-visible`, not `:focus`.

**Responsiveness**
- Tested at 375px (iPhone SE), 768px, 1280px, and 1536px.
- No horizontal scroll at any of those widths.
- Touch targets are at least 44×44px.
- Body text on mobile is never below 16px.

## Keep It Simple

- **Native over library.** Reach for CSS transitions/keyframes first.
  Framer Motion or GSAP earn their weight for multi-step choreography or
  scroll-driven sequences — not for a single hover effect.
- **One animation library per element.** React state/layout transitions →
  Framer Motion. Complex scroll-bound or non-React timelines → GSAP. Don't
  mix both on the same DOM element; their lifecycle assumptions conflict.
- **CSS custom properties over styled-components** for passing spacing or
  color — that's what the token system in `design-tokens.md` is for.
- **Build small visuals with `div`s/flexbox/SVG** before reaching for a
  charting library. A 200×4px progress bar doesn't need Recharts.
- **No speculative abstractions.** Don't build an `AnimationContext` for two
  animated elements — wait until there's a third before generalizing.
- **Full-screen components reused elsewhere** (e.g. a page used standalone
  and inside a tab) should expose flags like `showNavigation`/`showHeader`
  rather than assuming their own page-level context.

## Surgical Changes

When editing an existing project, the goal is a change a reviewer can
evaluate in isolation:

- **Match the existing paradigm.** Introducing a second styling system
  mid-project is a bug, not an improvement, even if it's "better."
- **Scope new state/motion carefully.** New additions shouldn't cause
  re-renders to propagate up the tree — use `React.memo`, `useMemo`, or
  Vue's `computed` where a profiler shows it matters (don't add these
  speculatively either).
- **No cosmetic refactoring alongside functional changes.** Renaming
  variables or reorganizing unrelated files while fixing a component buries
  the actual change in noise — do that as a separate change if it's worth
  doing at all.
- **One task = one target component + its direct style file.** No import
  path changes, no symbol renames, no unrelated file edits within the same
  task.
- **Debug/admin triggers** (if needed) go behind a quiet gesture or keyboard
  shortcut — not a visible button in production UI.
- **Clean up after yourself.** Remove any `will-change`, `console.log`, or
  now-unused import your change made redundant.
