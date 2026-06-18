# Design Tokens & Figma Source of Truth

## Why this matters

Most "this doesn't match the design" feedback traces back to one thing:
spacing or color values that were eyeballed instead of read from a source of
truth. Treat every numeric value as either "verified against a token/spec"
or "flagged for follow-up" — never silently invented.

## Reading order for spacing values

Wait, I should copy the exact content from the file:
Designs live in `/designs`:

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

Priority order, highest first:

1. `spacing.json` (and `colors.json` / `typography.json`) from the Figma
   Tokens plugin — ground truth, use exactly.
2. Figma Dev Mode CSS snippet, if the user pastes one — read pixel-exact
   values directly from it, don't re-estimate.
3. An annotated `*-spec.png` with measurement lines — read the labeled
   values.
4. A plain screenshot — last resort only.

**If none of the above exist:** use the nearest 4pt-grid token to your
visual estimate, and mark it `/* SPACING UNVERIFIED — confirm in Figma */`.
Before calling a task done, search for `SPACING UNVERIFIED` and resolve or
explicitly hand off every instance — see `qa-and-conversations.md`.

Never infer spacing from an unannotated image as if it were exact. An
estimate is fine as a starting point; an unflagged estimate is not.

## Token System

Extract the design system into CSS custom properties before touching
JSX/HTML. If a project already has a token system, extend it rather than
introducing a parallel one (see "Token Debt" below).

```css
:root {
  /* Spacing — 4pt grid. Every value should be a multiple of 4. */
  --space-1: 4px;   --space-2: 8px;   --space-3: 12px;
  --space-4: 16px;  --space-6: 24px;  --space-8: 32px;
  --space-12: 48px; --space-16: 64px; --space-24: 96px;

  /* Type scale — fluid with clamp(), never hardcoded px */
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

  /* Semantic aliases — components reference ONLY these */
  --bg-surface:    var(--color-neutral-50);
  --bg-elevated:   #ffffff;
  --text-primary:  var(--color-neutral-900);
  --text-muted:    #6b7280;
  --border-subtle: rgba(0, 0, 0, 0.08);
  --accent:        var(--color-brand-500);

  /* Shadow scale — 4 levels max */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04);
  --shadow-lg: 0 12px 32px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.04);
  --shadow-xl: 0 24px 64px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.04);

  /* Radius */
  --radius-sm: 4px;   --radius-md: 8px;
  --radius-lg: 12px;  --radius-xl: 16px;  --radius-full: 9999px;

  /* Motion — see motion-and-accessibility.md for usage */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-expo:  cubic-bezier(0.7, 0, 0.84, 0);
  --ease-spring:   cubic-bezier(0.34, 1.56, 0.64, 1);
  --duration-fast:  150ms;
  --duration-base:  250ms;
  --duration-slow:  400ms;
  --duration-enter: 500ms;
}
```

**Rule of thumb:** if a value doesn't map to a token, give it a
`SPACING UNVERIFIED` comment rather than a bare number. Comments are
greppable; bare numbers aren't.

## Token Debt in Existing Codebases

When editing an existing project rather than starting greenfield:

1. **Audit first** — scan the file(s) in scope for hardcoded hex values,
   magic spacing numbers, or inline styles.
2. **Don't rewrite the world** — fix only the component(s) in scope for this
   task. For everything else you notice, leave `/* TOKEN DEBT: replace with
   var(--...) */` rather than fixing it inline — that's a separate,
   reviewable change.
3. **Match the existing paradigm** — if the project uses Tailwind, use
   Tailwind classes; if CSS Modules, use CSS Modules. Introducing a second
   styling system mid-project creates more debt than it resolves.
4. **Log every deviation** — any existing value you can't map to a token
   gets flagged inline, not silently adopted as-is.

Before calling a task done, `Ctrl+F` for both `SPACING UNVERIFIED` and
`TOKEN DEBT` — the first should be zero or explicitly resolved, the second
should be a short, reviewable list (see `qa-and-conversations.md`).
