# Illustrated Theme Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the text theme icon with an accessible illustrated day/night pill and harmonize the dark palette with its navy artwork.

**Architecture:** Keep the existing `data-theme` and `localStorage.theme` state flow. `ThemeToggle.astro` owns accessible state, decorative markup, responsive sizing, and animation; `global.css` owns the approved page-level dark tokens.

**Tech Stack:** Astro 5, TypeScript in Astro scripts, component-scoped CSS, Playwright.

## Global Constraints

- No external animation libraries or image assets.
- Desktop track is `64px × 30px`; mobile track is `52px × 28px` without overflow at 320px.
- Dark tokens are background `#171b22`, surface `#20252e`, border `#343c49`, and soft surface `#29313c`.
- English and Chinese action labels, keyboard behavior, focus visibility, persistence, and reduced-motion support remain intact.

---

### Task 1: Theme behavior and responsive regression tests

**Files:**
- Modify: `tests/e2e/home.spec.ts`

**Interfaces:**
- Consumes: `.theme-toggle`, `.theme-toggle__track`, `html[data-theme]`, `localStorage.theme`.
- Produces: regression coverage for state, labels, persistence, palette, dimensions, and 320px overflow.

- [x] **Step 1: Add a failing Playwright test**

```ts
test('illustrated theme toggle synchronizes state, labels, persistence, and palette', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('theme', 'light'));
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Switch to dark theme' });
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(toggle.locator('.theme-toggle__track')).toHaveCSS('width', '64px');
  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(toggle).toHaveAttribute('aria-label', 'Switch to light theme');
  expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('dark');
});
```

- [x] **Step 2: Run the focused test and verify it fails**

Run: `npm.cmd exec playwright test tests/e2e/home.spec.ts -g "illustrated theme toggle"`

Expected: FAIL because the existing control has no `aria-pressed` state or illustrated track.

- [x] **Step 3: Extend the existing 320px test**

Assert `.theme-toggle__track` is `52px × 28px` and retain the document overflow assertion.

- [x] **Step 4: Run the focused tests after implementation**

Run: `npm.cmd exec playwright test tests/e2e/home.spec.ts -g "theme|320px"`

Expected: PASS.

### Task 2: Illustrated toggle and harmonized palette

**Files:**
- Modify: `src/components/ThemeToggle.astro`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: `Locale`, `document.documentElement.dataset.theme`, `localStorage.theme`.
- Produces: `.theme-toggle__track`, synchronized `aria-pressed`, and stable component dimensions.

- [x] **Step 1: Replace the icon with decorative layers**

Use a native button containing track, stars, clouds, knob, and crater elements, all wrapped in an `aria-hidden="true"` visual container.

- [x] **Step 2: Synchronize accessible state**

```ts
const isDark = theme === 'dark';
button.setAttribute('aria-pressed', String(isDark));
const label = isDark ? button.dataset.lightLabel : button.dataset.darkLabel;
```

- [x] **Step 3: Add component-scoped artwork and animation**

Set exact desktop/mobile sizes, move the knob `34px` on desktop and `24px` on mobile, fade clouds/stars, and rely on the existing global reduced-motion rule.

- [x] **Step 4: Apply the approved global dark tokens**

Change only the four approved dark tokens and remove obsolete global text-icon button styling so it cannot conflict with the component.

- [x] **Step 5: Run focused tests**

Run: `npm.cmd exec playwright test tests/e2e/home.spec.ts -g "theme|320px"`

Expected: PASS.

### Task 3: Full verification and visual check

**Files:**
- Verify: all changed files

**Interfaces:**
- Consumes: completed component and tests.
- Produces: validated static site for root and GitHub Pages base paths.

- [x] **Step 1: Run unit and browser suites**

Run: `npm.cmd run test:unit`

Run: `npm.cmd run test:e2e`

Expected: all tests PASS.

- [x] **Step 2: Run both production builds**

Run: `npm.cmd run build`

Run: `$env:BASE_PATH='/my_blog'; $env:SITE_URL='https://pitohuill.github.io'; npm.cmd run build`

Expected: both builds succeed.

- [x] **Step 3: Inspect desktop light/dark and 320px screenshots**

Confirm the artwork, palette, focus target, header stability, and lack of horizontal overflow.

- [x] **Step 4: Commit the implementation**

```bash
git add docs/superpowers/plans/2026-07-18-illustrated-theme-toggle.md src/components/ThemeToggle.astro src/styles/global.css tests/e2e/home.spec.ts
git commit -m "feat: add illustrated theme toggle"
```
