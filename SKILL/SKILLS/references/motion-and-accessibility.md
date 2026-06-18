# Motion & Accessibility

Motion should communicate hierarchy and feedback, not decorate. Everything
here assumes the static (no-motion) version of the UI already works —
motion is layered in last.

## Motion Budget

Per page:

- **One entrance animation** on load — staggered children, max 6 items,
  `50ms` delay step between them. Beyond ~6 items, stagger reads as lag
  rather than choreography.
- **Micro-interactions** only on user-triggered events (hover, click,
  focus) — not ambient.
- **No looping animations** unless they convey real-time data (a live
  indicator, a progress spinner tied to an actual operation).
- **Scroll-driven animation** is for storytelling/marketing pages, not
  dashboards — on a dashboard it competes with the user's task for
  attention.

## Performance-First Rules

```css
/* Compositor-only — animates smoothly regardless of main-thread load */
transform: translateY(0);
opacity: 1;
filter: blur(0);

/* Triggers layout recalculation — causes dropped frames under load */
width, height, padding, margin, top, left
```

Prefer the first group for anything that animates. If you need to animate
`height` (e.g. an accordion), consider animating to a measured `max-height`
via `transform: scaleY()` or a grid-template-rows trick instead, or accept
the layout cost consciously and say so.

Declare `will-change: transform` immediately before the animation starts and
remove it once the animation ends — leaving it on permanently keeps an
extra GPU layer alive for no benefit.

## Animation Defaults

| Scenario | Duration | Easing | Properties |
|---|---|---|---|
| Element enters view | `--duration-enter` | `ease-out-expo` | `opacity` + `translateY(16px → 0)` |
| Hover state | `--duration-fast` | `ease-out` | `color`, `background`, `shadow` |
| Modal/drawer open | `--duration-slow` | `ease-out-expo` | `opacity` + `translateY`/`translateX` |
| Skeleton shimmer | `1.4s` | `linear`, infinite | `background-position` |
| Page transition | `--duration-slow` | `ease-in-expo` out, `ease-out-expo` in | `opacity` |
| Spring/bounce | `--duration-slow` | `ease-spring` | `transform: scale` |

These are starting points, not laws — if the Figma file specifies different
timing, that wins. Use this table when the design doesn't specify (see the
Design Ambiguity defaults in `SKILL.md`).

## Smooth Scrolling: Lenis

For premium landing pages (not app dashboards), Lenis normalizes scroll
physics across browsers. Blueprint, synced with GSAP ScrollTrigger:

```ts
import Lenis from '@studio-freight/lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const initSmoothScroll = () => {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  })

  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)

  return lenis
}
```

Two things this is easy to get wrong on: make sure `overflow: hidden` on
`html`/`body` (if Lenis needs it) is managed deliberately rather than left
over from a template, and call `lenis.destroy()` when the layout unmounts —
an undestroyed instance keeps firing `raf` callbacks after the page that
needed it is gone.

## Advanced Choreography: GSAP

Use for scroll-triggered parallax, split-text effects, and multi-step
timelines.

**React memory safety is the load-bearing rule here.** An uncontrolled GSAP
instance inside a React component will keep animating (and leaking) after
the component unmounts, especially across route changes. Always scope with
`gsap.context()` (or the `@gsap/react` `useGSAP()` hook) and revert on
cleanup:

```tsx
useLayoutEffect(() => {
  const ctx = gsap.context(() => {
    // Animations/ScrollTriggers here are scoped to containerRef
    gsap.from('.element', { opacity: 0, y: 50, stagger: 0.1 })
  }, containerRef)

  return () => ctx.revert() // critical — without this, leaks accumulate
}, [])
```

Other GSAP notes:
- Chain related animations with `gsap.timeline()` rather than scattering
  raw `setTimeout`/hardcoded delays across multiple tweens — a timeline is
  one thing to reason about and retime later.
- Don't drive `height`/`top`-style properties via `ScrollTrigger`; stick to
  `transform`/`opacity` for the same reason as the performance rules above.

## Declarative Motion: Framer Motion (React)

Use primarily for UI state transitions, list reordering, and gesture
support.

- `AnimatePresence` for mount/unmount transitions (modals, dropdowns, page
  transitions).
- `layoutId` for FLIP-style shared-element transitions (e.g. a card
  expanding into a detail view).
- For larger apps, `<LazyMotion features={domAnimation}>` + `m.div` keeps
  the animation engine out of the initial bundle until it's needed.
- Don't wrap every element in `motion.div` — plain CSS `:hover`/`:focus`
  transitions are cheaper for simple cases. Reserve `motion` for
  physics-based springs and presence logic that CSS can't express.

## Other Libraries

- **Lottie / Rive** — for vector character/icon animations from After
  Effects or Rive. Keep assets under ~500kb, and pause playback via
  `IntersectionObserver` when the asset scrolls out of view.
- **CSS keyframes** — for infinite, unchanging loops (spinners, shimmer,
  marquees). No JS library needed for these.

## Reduced Motion — Non-Negotiable

Ship this in global/base CSS, not per-component:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

In GSAP, respect this globally via `gsap.matchMedia()` rather than checking
the media query ad hoc in each animation.

## Accessibility Checklist

Check these together as a pass, rather than scattered through development:

- [ ] Global `prefers-reduced-motion` rule present (CSS) and respected in JS
      animations (GSAP `matchMedia`, Framer's `useReducedMotion`, etc.).
- [ ] Text contrast meets WCAG AA (4.5:1 body, 3:1 large text).
- [ ] Focus ring `2px solid var(--accent)` with `2px` offset on
      `:focus-visible`.
- [ ] Touch targets ≥ 44×44px.
- [ ] Tab order makes sense without a mouse.
- [ ] Icon-only buttons have `aria-label`.
- [ ] Images have meaningful `alt` text, or `alt=""` if purely decorative.
- [ ] No information is conveyed by color alone.
