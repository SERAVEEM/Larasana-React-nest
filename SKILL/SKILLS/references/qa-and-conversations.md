# QA, Verification & Translating Feedback

## Visual QA Checklist

Run before calling a UI task done:

```
□ No console errors or warnings
□ No layout shift on data arrival (CLS = 0)
□ "SPACING UNVERIFIED" → 0 results, or each instance explicitly handed off
□ "TOKEN DEBT" → logged as a short, reviewable list, not silently fixed
□ No horizontal scroll at 375px
□ Lighthouse Performance > 90
□ Text passes contrast check
□ Tab through the page — focus ring visible on every interactive element
□ prefers-reduced-motion enabled — page fully functional
□ Light and dark mode verified (if applicable)
□ All 4 async states reachable (loading / error / empty / success)
□ 422 validation errors appear on the correct form fields
□ No duplicate requests on mount (check the network tab)
□ WebSocket/SSE reconnects after a disconnect (if applicable)
```

Not every item applies to every task — a static marketing page doesn't need
the async-state or WebSocket checks. Use judgment, but don't skip an item
just because checking it is inconvenient.

## Verifying Visually (Agent Workflow)

If you have browser tooling available, use it rather than relying on
reading code to predict how it'll render:

1. After implementing, open the page in the browser tool and capture
   screenshots at each of the four breakpoints (375 / 768 / 1280 / 1536px).
2. If `/designs/screens/*.png` exists, place the new screenshot next to the
   reference image (or describe the diff) rather than asserting "matches
   the design" from code alone.
3. Include these screenshots in whatever walkthrough/summary artifact you
   produce for the user — a visual diff is far more convincing than a
   checklist of claims, and it's the difference a reviewer actually needs.
4. If `prefers-reduced-motion` is testable in the browser tool, toggle it
   and confirm the page is still fully usable with motion effectively
   disabled.

This turns "I followed the checklist" into something the user can verify in
seconds rather than having to trust.

## Design Fidelity vs. Engineering Judgment

Some design intents can't be implemented literally — when that happens,
document the substitution rather than silently doing something different
from what was asked:

| Design Intent | Common Issue | Engineering Decision |
|---|---|---|
| Custom font | FOUC on slow connections | `font-display: swap` + metrically-matched system fallback |
| Backdrop blur on mobile | Performance cost | Solid background fallback below 768px, or under `prefers-reduced-transparency` |
| Complex gradient mesh | Not feasible without WebGL | CSS `conic-gradient` + SVG `feTurbulence` approximation |
| Pixel-perfect shadow | Not reproducible at runtime | Closest token from the shadow scale |
| Animation on every scroll | Motion-sensitive users | Scope to `@media (prefers-reduced-motion: no-preference)` |
| Real-time data via polling | Battery drain, race conditions | Replace with WebSocket or SSE |

A one-line comment at the substitution point is usually enough — the goal
is that a reviewer comparing against the design understands *why* it
differs, not that it doesn't differ at all.

## Translating Feedback Into Specs

Vague feedback is normal — the useful move is turning it into something
checkable, not guessing at what "better" means:

- *"This animation feels slow"* → "Target: enter transition under 400ms on
  a mid-range device. Measure with the browser's performance profiler."
- *"The design doesn't match"* → "List the specific token deviations (which
  spacing/color/type values differ) and fix in order of visual weight —
  largest deviations first."
- *"Make it feel more premium"* → ask (or infer from the design system):
  heavier shadow scale? Tighter letter-spacing on headings? More negative
  space? "Premium" isn't itself a token — it's usually one or two of these.
- *"The data isn't loading right"* → "Which of the four async states is
  actually broken — loading, error, empty, or success? Check the network
  tab before changing UI code."
- *"It feels slow when I click"* → "Is this missing an optimistic update, or
  is it a real network delay? Check TTFB in the network tab before adding
  any animation to mask it."

In general: feeling → spec → token/measurement → code. If you can't connect
a piece of feedback to something measurable, that's a sign to ask a
clarifying question (interactive mode) or to pick the closest measurable
interpretation and say so (autonomous mode) — not to guess at the aesthetic
intent silently.
