# Static Bilingual Site Implementation Plan

**Goal:** Convert the Astro blog into a complete static English/Chinese site, with English at the existing root routes and Chinese under `/zh/`.

**Architecture:** Add a small typed i18n layer for locale-aware labels and URLs, localize profile/project data, and pair Markdown posts with `locale` and `translationKey`. Keep one set of shared page components and expose thin English and Chinese route wrappers so both language trees are statically generated and remain compatible with GitHub Pages `BASE_PATH=/my_blog`.

**Tech Stack:** Astro 5, TypeScript, Astro Content Collections, Vitest, Playwright, GitHub Pages.

## Global Constraints

- `en` is the default locale and has no URL prefix.
- `zh` uses the `/zh/` prefix.
- English routes are `/`, `/posts/`, `/posts/:slug/`, `/projects/`, `/projects/:slug/`, `/about/`, `/search/`, and `/rss.xml`.
- Chinese routes mirror them under `/zh/`, including `/zh/rss.xml`.
- The entire visible interface and authored content must be localized: header, profile, home sections, posts, projects, about, search, footer, metadata, and RSS.
- The language control sits beside the theme icon. English pages display `中`; Chinese pages display `EN`.
- A language control must link to the equivalent translated page. When no translation exists, it must render a disabled, accessible state instead of a broken link.
- Every document sets the correct `html lang`, canonical URL, `hreflang="en"`, `hreflang="zh-CN"`, and `hreflang="x-default"`; x-default points to English.
- Search and RSS contain only the active locale.
- All internal URLs and generated feeds work both at `/` and with `BASE_PATH=/my_blog`.
- No browser-language redirect and no runtime translation service.
- Implement behavior test-first and retain the existing visual design, dual-column home layout, and light/dark theme.

## Task 1: Typed locale foundation and paired content

**Files:**
- Create: `src/i18n/config.ts`
- Create: `src/i18n/ui.ts`
- Modify: `src/lib/paths.ts`
- Modify: `src/content.config.ts`
- Modify: `src/lib/post-utils.ts`
- Modify: `src/lib/posts.ts`
- Modify: `src/data/site.ts`
- Move/Create: `src/content/posts/en/*.md`, `src/content/posts/zh/*.md`
- Test: `tests/unit/i18n.test.ts`
- Test: `tests/unit/posts.test.ts`
- Test: `tests/unit/paths.test.ts`

1. Write failing unit tests for default locale, localized route generation under `/` and `/my_blog`, locale filtering, slug extraction, and translation pairing.
2. Run the focused unit tests and confirm they fail for missing locale behavior.
3. Implement `Locale`, `defaultLocale`, localized URL helpers, and a typed UI dictionary containing every shared label.
4. Add `locale` and `translationKey` to the post schema. Move the existing Chinese posts into `zh/` and create natural English translations under `en/`, retaining matching public slugs and translation keys.
5. Make post utilities filter by locale, expose stable public slugs, and locate translated counterparts by translation key.
6. Convert profile and project data to typed bilingual values, including titles, statuses, descriptions, and body paragraphs.
7. Run all unit tests and commit.

## Task 2: Shared localized UI and complete static route trees

**Files:**
- Create: `src/components/LanguageToggle.astro`
- Create: `src/components/pages/HomePage.astro`
- Create: `src/components/pages/PostsPage.astro`
- Create: `src/components/pages/PostPage.astro`
- Create: `src/components/pages/ProjectsPage.astro`
- Create: `src/components/pages/ProjectPage.astro`
- Create: `src/components/pages/AboutPage.astro`
- Modify: `src/components/Header.astro`
- Modify: `src/components/Footer.astro`
- Modify: `src/components/TableOfContents.astro`
- Modify: `src/layouts/BaseLayout.astro`
- Modify/Create: English route wrappers in `src/pages/**`
- Create: Chinese route wrappers in `src/pages/zh/**`
- Test: `tests/e2e/home.spec.ts`

1. Replace the current E2E assertions with failing tests that prove `/` is English, `/zh/` is Chinese, both theme and language controls exist, the controls preserve equivalent routes, and article/project/about pages render localized content.
2. Run the focused E2E tests and confirm the new bilingual assertions fail.
3. Build reusable localized page components and keep route files thin. Generate both locale trees statically.
4. Pass locale and counterpart URL through the layout/header/footer. Set document language, localized metadata, canonical, and alternate links.
5. For article routes, find counterparts by `translationKey`, preserve reading time/TOC/series/adjacent navigation, and disable the toggle if a counterpart is absent.
6. Keep the existing theme icon, layout, responsive styling, and GitHub Pages base-path handling.
7. Run unit tests, E2E tests, and a production build; commit.

## Task 3: Locale-specific search/RSS, regression checks, and documentation

**Files:**
- Create: `src/components/pages/SearchPage.astro`
- Modify: `src/pages/search.astro`
- Create: `src/pages/zh/search.astro`
- Modify: `src/pages/rss.xml.ts`
- Create: `src/pages/zh/rss.xml.ts`
- Modify: `tests/e2e/home.spec.ts`
- Modify/Create: unit tests where needed
- Modify: `项目.md`

1. Add failing tests proving English and Chinese search datasets/results do not mix languages and each RSS feed contains only its locale with correct base-path URLs.
2. Implement a shared localized search page and locale-specific static RSS endpoints.
3. Add regression assertions for alternate links, x-default, correct `html lang`, language-toggle accessibility, and `/my_blog` output paths.
4. Update `项目.md` with the bilingual architecture, content-authoring convention, route table, translation workflow, and next-iteration notes.
5. Run the complete unit suite, complete E2E suite, normal build, and `BASE_PATH=/my_blog` build. Inspect generated HTML/RSS for broken or double-prefixed internal links.
6. Commit and request whole-branch code review.
