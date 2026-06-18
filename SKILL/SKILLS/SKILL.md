---
name: full-stack-motion-design
description: >
  Use this skill when implementing or modifying a frontend UI from a Figma
  design, screenshot, or design spec — especially when the UI involves
  animation, transitions, scroll effects, or polished micro-interactions.
  Covers extracting design tokens (spacing, color, type) from Figma exports,
  component decomposition, responsive and accessibility checklists, motion
  choreography (GSAP, Framer Motion, Lenis, CSS), and wiring components to
  backend APIs with proper loading/error/empty states. Make sure to use this
  skill for requests like "build this dashboard from the Figma file", "match
  this design pixel-for-pixel", "add a smooth entrance animation to this
  card", "the hover state feels janky", "wire this form up to the API", or
  any task that mixes visual fidelity with interactivity. Do not use for
  backend-only tasks with no UI surface, content/copywriting edits, pure
  logic bugfixes unrelated to layout or motion, or one-line styling tweaks
  that don't warrant a design-system pass.
---

# Full-Stack Engineering & Motion Architecture

Principles for building performant, motion-aware, high-fidelity UI with
real frontend/backend wiring. This file is the router — it tells you which
reference to load for which sub-problem. Don't load everything at once;
pull in only what the current task needs.

## Mode

- **Interactive** (a human is in the chat): ask before deciding on anything
  genuinely ambiguous, one question at a time. Try to resolve what you can
  first — most spacing/color/animation ambiguity has a default in
  `references/design-tokens.md` that doesn't need a question.
- **Autonomous** (headless / agentic run): never halt. Resolve ambiguity
  using the defaults below and in the reference files, and leave a short
  `/* AGENT DECISION: ... */` comment wherever you made a judgment call so a
  human can review it later.
- **If the surrounding agent platform already has its own task-review or
  approval flow** (e.g. a plan the user has approved, or a flagged decision
  point), defer to that instead of re-deciding it here — this skill fills
  gaps the platform's own workflow doesn't cover, it doesn't override it.

## How this skill is organized

Read only what the task needs:

| Reference | Read it when... |
|---|---|
| `references/design-tokens.md` | Starting any new component, given a Figma file/spec, or you notice hardcoded spacing/color values that should be tokens. |
| `references/component-architecture.md` | Decomposing a design into components, choosing a library, or restructuring existing UI code. |
| `references/motion-and-accessibility.md` | The task involves animation, transitions, scroll effects, or an accessibility pass. |
| `references/fe-be-integration.md` | Wiring a component to an API, handling async state, auth, or working across the frontend/backend boundary. |
| `references/qa-and-conversations.md` | Before marking any UI task done, and whenever you need to turn vague feedback ("make it feel premium", "this feels slow") into something concrete. |

Most non-trivial UI tasks touch `design-tokens` + `component-architecture` +
`qa-and-conversations` at minimum. Add `motion-and-accessibility` and/or
`fe-be-integration` as the task requires.

## Design Ambiguity — Quick Defaults

When information is missing, resolve it this way rather than asking or
guessing silently (full token-related detail in `design-tokens.md`):

| Ambiguity | Default |
|---|---|
| Breakpoint behavior unclear | Mobile-first. Stack vertically below 768px. |
| Animation not specified | `opacity` + `translateY(12px)`, base duration, ease-out-expo. |
| Dark mode not specified | Build light first. Add a `prefers-color-scheme` hook with token swaps. |
| Font weight unclear | Body 400, subheadings 500, headings 600–700. Avoid 800+ on body text. |

Always leave a one-line comment stating the assumption — never decide
silently, even in autonomous mode.

## The Build Loop

1. **Tokens** — read `design-tokens.md`. Every spacing/color/type value
   should map to a token before you write a single line of JSX/HTML.
2. **Architecture** — read `component-architecture.md`. Decide the
   decomposition and library choices before building.
3. **Skeleton** — static markup with correct semantics, no layout shift.
4. **Style** — apply tokens, verify at 375 / 768 / 1280 / 1536px.
5. **State** — if there's an API involved, read `fe-be-integration.md` and
   wire all four async states (loading / error / empty / success).
6. **Motion** — if animation is involved, read `motion-and-accessibility.md`
   and layer it in last, after the static version works.
7. **QA** — read `qa-and-conversations.md` and run the checklist before
   calling the task done.

## Non-Negotiables

These apply regardless of which reference files you load:

- A `prefers-reduced-motion: reduce` rule lives in global CSS, not scattered
  per-component (see `motion-and-accessibility.md`).
- Components never call `fetch()`/`axios` directly — all HTTP calls go
  through a service layer (see `fe-be-integration.md`).
- Use stable IDs (DB UUIDs, not array indices) as list keys, especially for
  anything that animates in/out.
- Never show a raw error object to the user, and never swallow an error
  silently — surface it via the error-state UI.
