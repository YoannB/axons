# Material UI adapter, theme & controls

## Boundary

`@mui/*` imports, MUI types, the MUI theme, `sx`, `styled`, and `.Mui*` selectors exist
ONLY inside `components/ui/material/`. Elsewhere consume the neutral API from
`components/ui` and types from `components/ui/types.ts`. The neutral API must never leak
`sx`/`classes`/`slotProps`/`MuiTheme`. Business layout must not depend on MUI-generated
class names; use application CSS classes and `--*` custom properties. ESLint
`no-restricted-imports` forbids `@mui/*` outside the adapter (it guards the import, not the
prop-leak — that is on you).

## MUI theme build & light mode

`buildTheme(mode)` takes the RESOLVED light/dark value (never a hardcoded `'dark'`);
`palette.background.default` and `paper` are `transparent` so `CssBaseline` does not paint
`<body>` and `globals.css` tokens stay authoritative (a hardcoded dark + opaque CssBaseline
background is what previously broke light mode). Light mode = a TINTED background (`--bg-0`
soft blue-grey, not white) with white shadowed cards; accent glow reduced via `--glow`.
Tokens in `:root` / `[data-theme="light"]` are the single source of truth for colors.
`defaultChannel`/`paperChannel` are explicitly `undefined` (MUI v9 cannot derive a channel
from `'transparent'`; omitting them kills the `palette.*Channel` warning while globals.css
keeps control of backgrounds).

## Disabled buttons without a painted background

MUI applies `disabledOpacity` 0.38 to `primary.main` (#7c5cff); on a light background
(`--bg-0` light #dfe5f0, or a white card) an `outlined`/`text` button collapses to ~1.5:1 —
an invisible ghost. The adapter overrides ONLY those two variants in the disabled state
(`&.MuiButton-outlined.Mui-disabled, &.MuiButton-text.Mui-disabled`) to `color: var(--muted)`

- `borderColor: var(--border-2)` + `opacity: 1`, at compound specificity 0,3,0 (wins WITHOUT
  `!important`). The `contained` (primary) variant is EXCLUDED (MUI already paints a grey
  `action.disabledBackground`). Use runtime-resolved `var()` for color/borderColor (NOT a MUI
  palette channel, which cannot derive from `var()` and re-triggers the warning); runtime
  resolution is identical server/client → no hydration mismatch, follows both themes.

## MUI-control animations (no geometry on hover)

- Buttons: NEVER translate/scale on `:hover` (moving the box changes the pointer hit-area →
  endless hover/un-hover oscillation). On hover change only non-geometric properties
  (box-shadow, filter) and disable the idle halo animation so it does not override the hover
  shadow. Keyframes live in `material/index.css` and are referenced by `sx` (sx cannot
  define `@keyframes`).
- Field border: a FULL conic gradient (accent-1 ↔ accent-2 over 360°, no transparent stops)
  animated through `@property --angle`; the MUI outline stays underneath as the fixed border
  when unfocused. An arc with hard stops projects as a variable-size blob — do not use.
- Gauge hover: a `drop-shadow` FILTER + value/track color shift, NEVER a box
  transform/scale/translate (same endless-oscillation invariant). A filter does not move the
  layout box, so the pointer stays covered.
- Dialog close icon: a DEDICATED `crossDraw` keyframe (1 → 0, `forwards`) so the X draws and
  stays; never reuse the looping icon `draw` keyframe (it ends at `dashoffset:1` = erased).

## Chips

In a CSS grid, force `justifySelf`/`alignSelf: start` so a chip does not stretch to 100% of
its cell, and give it a tinted background per color (pill style). Confine `sx` to the adapter.

## Toasts

Severity backgrounds use TWO-class specificity (`.MuiAlert-root.MuiAlert-filledXxx`) so the
global `.MuiPaper-root { background }` rule cannot wash them to the surface color (the
light-mode white-toast bug). Anchored BOTTOM-LEFT on desktop (the sticky video owns
bottom-right) with a vertical offset clearing the Netlify badge. On mobile (≤ 900px) they
move to TOP-CENTER just under the 64px header so the two fixed layers never overlap — done
in CSS inside the adapter (`@media (max-width:900px) .MuiSnackbar-root { top:76px; bottom:auto;
left:0; right:0; width:fit-content; max-width:calc(100vw - 32px); margin-inline:auto; }` with
`!important` on every layout prop, because `.MuiSnackbar-anchorOriginBottomLeft` shares
specificity 0,1,0 with `.MuiSnackbar-root` and Emotion's injection order vs the static sheet
is not guaranteed). Centering uses `margin-inline:auto` + `width:fit-content`, NOT `transform`
(so MUI's `Grow`, which animates the child, is preserved). Deliberately CSS, not a responsive
`anchorOrigin` via `useMediaQuery`: `useMediaQuery` returns `false` at SSR then the real value
at hydration, which would flip the `.MuiSnackbar-anchorOrigin*` classes between server and
client → hydration mismatch. The Snackbar portals to `body` (default `disablePortal=false`)
and `body`/`html` carry no transform/filter, so `position:fixed` stays viewport-referenced.
Long messages wrap (`max-width` + `white-space:pre-wrap`).

## Styling system / CSS file ownership

General CSS in `app/globals.css` using `--*` custom properties, themed via
`[data-theme="light"|"dark"]` on `<html>`. MUI-specific CSS ONLY in
`components/ui/material/index.css`. The MUI theme reads the same CSS variables so light/dark
has a single source of truth. `@property --angle` drives the rotating field border. Respect
`prefers-reduced-motion` (global kill-switch present).

## MUI v9 authoring rules & integration entry

The App Router integration entry point for Next 16 is `@mui/material-nextjs/v16-appRouter`
(with `@emotion/cache` + `AppRouterCacheProvider`); do NOT default to a `v15-appRouter`
import from training data. Keep `AppRouterCacheProvider` so Emotion styles are collected
during streaming, and check CSS layer order if you ever mix plain CSS / modules / Tailwind.

When authoring adapter styles, do NOT use deprecated class keys in `styleOverrides` (e.g. the
old `.MuiTypography-paragraph` form); configure by `slot` and/or `variants` driven by props.
Slot names are CASE-SENSITIVE in the public API — follow the installed type exactly
(`slotProps={{ inputLabel }}`, not `{{InputLabel }}`), and migrate `inputProps`/`inputRef` to
the dedicated `slotProps` only where the component documents it (never blanket-transform
every form API). For selectors inside the adapter, PREFER the exported class helpers
(`buttonClasses`, `alertClasses`, …) over hand-written `.Mui…` strings, which are fragile
across versions. EXCEPTION, do not regress it: the existing disabled-button fix
(`&.MuiButton-outlined.Mui-disabled, &.MuiButton-text.Mui-disabled`) is validated at
compound specificity 0,3,0 and stays as-is; the "prefer exports" rule applies to NEW
selectors only. Run MUI codemods TARGETED (e.g.
`npx @mui/codemod@latest deprecations/button-classes <path>`), read the diff, and run tests —
never codemod the whole repo without review.

A neutral wrapper must PRESERVE accessibility: do not drop ARIA attributes or native behavior
when encapsulating a MUI control behind the facade (v9 emphasizes keyboard navigation and
a11y defects; the facade is exactly where that is easiest to lose by accident).
