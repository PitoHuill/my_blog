# Illustrated Theme Toggle Design

## Goal

Replace the current sun/moon text icon with a compact illustrated pill that feels native to the blog header. The control must preserve the existing theme behavior, remain usable in both languages, and keep the mobile header stable.

## Visual direction

- Use a restrained editorial style rather than the reference demo's oversized neumorphism.
- Light mode uses the existing warm paper background (`#f7f5f0`) with a muted blue sky, ivory clouds, and a honey-yellow sun.
- Dark mode shifts the page palette from neutral black to blue charcoal: background `#171b22`, surface `#20252e`, border `#343c49`, soft surface `#29313c`.
- The night track uses deep navy, four small stars, and a silver-blue moon with two or three subtle craters.
- Keep shadows soft and borders one pixel wide. The existing green accent remains reserved for links and focus rings.

## Component structure

`ThemeToggle.astro` remains a native `button`. Its decorative children form four independent visual layers:

1. track and sky/night background;
2. cloud layer;
3. star layer;
4. sliding sun/moon knob.

All artwork is CSS and inline markup, with no raster assets or external dependencies. Decorative elements are hidden from assistive technology.

## Sizing and responsive behavior

- Desktop visual track: `64px × 30px` inside a `72px × 44px` keyboard/touch target.
- Mobile visual track: `52px × 28px` inside a `60px × 44px` target; decorative detail is reduced but the sun/moon motion remains.
- The button stays on the first mobile header row next to the language control and must not cause horizontal overflow at 320px.
- The control must not change its outer dimensions while switching themes.

## Interaction and state

- Preserve the existing `data-theme` value on `<html>` and `localStorage.theme` persistence.
- Treat dark mode as the pressed state and keep `aria-pressed`, `aria-label`, and `title` synchronized after every change.
- Labels remain localized: English pages announce English actions and Chinese pages announce Chinese actions.
- Animate the knob and decorative layers for about `320ms` with a restrained ease curve.
- Respect the existing `prefers-reduced-motion` rule, reducing the transition to effectively instant.
- Preserve the visible focus ring and keyboard activation supplied by the native button.

## Palette tokens

The global theme tokens change only where needed for the approved harmony:

| Token | Light | Dark |
| --- | --- | --- |
| `--color-background` | `#f7f5f0` | `#171b22` |
| `--color-surface` | `#ffffff` | `#20252e` |
| `--color-border` | `#dedbd3` | `#343c49` |
| `--color-soft` | `#efede7` | `#29313c` |

Component-scoped variables provide the sky, cloud, sun, moon, star, and track-border colors so the artwork does not leak into other components.

## Validation

- Existing light/dark persistence tests continue to pass.
- Add or update browser tests for pressed state, localized accessible names, local storage, and visual state after clicking.
- Check desktop and 320px mobile widths for overflow and header stability.
- Run unit tests, end-to-end tests, and both repository-base and root-base production builds.

## Out of scope

- Automatic time-of-day scheduling.
- New theme choices beyond light and dark.
- External animation libraries or image assets.
- Redesigning navigation, language switching, cards, or page layout.
