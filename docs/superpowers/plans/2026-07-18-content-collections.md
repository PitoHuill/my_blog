# Astro Content Collections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate blog posts from `src/data/site.ts` to validated Markdown/MDX content entries and add publishing controls plus a richer article reading experience.

**Architecture:** Astro Content Collections owns post metadata and Markdown bodies. A focused `src/lib/posts.ts` module provides publication filtering, sorting, reading-time calculation, and adjacent-post lookup; pages consume that shared API so drafts and future posts never leak into HTML, search, or RSS. Article rendering uses Astro's content renderer and heading metadata for code highlighting, images, series information, table of contents, and previous/next navigation.

**Tech Stack:** Astro 5, TypeScript, Astro Content Collections, Markdown/MDX, Zod schemas, Vitest, Playwright.

## Global Constraints

- Keep GitHub Pages static output and the existing light/dark visual system.
- Preserve the existing desktop two-column homepage and mobile single-column layout.
- Do not restore archive or tag items to the primary navigation.
- Draft posts and posts with a future `pubDate` must be excluded from all public pages, search data, and RSS.
- Existing article slugs and public URLs must remain unchanged.

---

### Task 1: Validated content model and post utilities

**Files:**
- Create: `src/content.config.ts`
- Create: `src/lib/posts.ts`
- Create: `tests/unit/posts.test.ts`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Produces: `getPublishedPosts(now?: Date)`, `calculateReadingTime(markdown: string)`, `getAdjacentPosts(posts, id)`.
- Produces schema fields: `title`, `description`, `pubDate`, `updatedDate`, `tags`, `featured`, `draft`, `series`, `seriesOrder`, `heroImage`.

- [ ] Write Vitest tests proving drafts and future posts are filtered, posts are sorted newest-first, reading time is at least one minute, and adjacent navigation follows sorted order.
- [ ] Run `npm run test:unit` and verify it fails because the utility module does not exist.
- [ ] Add Vitest and MDX support, define the content collection schema, and implement the minimal utilities.
- [ ] Run `npm run test:unit` and verify all utility tests pass.

### Task 2: Migrate existing posts to Markdown

**Files:**
- Create: `src/content/posts/building-a-lasting-blog.md`
- Create: `src/content/posts/small-systems-long-thinking.md`
- Create: `src/content/posts/write-complex-things-clearly.md`
- Create: `src/content/posts/a-better-reading-workflow.md`
- Modify: `src/data/site.ts`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/posts/index.astro`
- Modify: `src/pages/search.astro`
- Modify: `src/pages/rss.xml.ts`

**Interfaces:**
- Consumes: `getPublishedPosts()` and collection entry fields from Task 1.
- Produces: unchanged public slugs under `/posts/<slug>/`.

- [ ] Add a failing Playwright assertion that the migrated featured post appears on the homepage and its existing URL opens.
- [ ] Run the focused Playwright test and verify the missing collection-backed output causes failure during migration.
- [ ] Move all four post bodies and metadata into Markdown frontmatter/content, leaving only profile and projects in `site.ts`.
- [ ] Update homepage, listing, search, and RSS to await the shared published-post query.
- [ ] Run unit tests and Astro build; verify four public article routes and RSS are generated.

### Task 3: Article reading experience

**Files:**
- Create: `src/components/TableOfContents.astro`
- Modify: `src/pages/posts/[slug].astro`
- Modify: `src/styles/global.css`
- Modify: `tests/e2e/home.spec.ts`

**Interfaces:**
- Consumes: Astro `render(post)` output `{ Content, headings }`, `calculateReadingTime`, and `getAdjacentPosts`.
- Produces: article metadata, optional series badge, depth 2/3 table of contents, rendered Markdown/MDX, and previous/next links.

- [ ] Add failing browser assertions for reading time, generated heading anchors, table of contents, and previous/next navigation.
- [ ] Run the focused test and verify it fails against the pre-migration article template.
- [ ] Render Markdown content, expose series metadata, and build the accessible table-of-contents component.
- [ ] Add restrained article typography for headings, lists, blockquotes, images, inline code, and Shiki code blocks in both themes.
- [ ] Run unit tests, Playwright tests, and Astro build.

### Task 4: Documentation and final verification

**Files:**
- Modify: `README.md`
- Modify: `项目.md`

**Interfaces:**
- Documents the post frontmatter contract and authoring/publishing workflow.

- [ ] Document how to create Markdown posts, add images/code, mark drafts, schedule posts, and group a series.
- [ ] Run `npm run test:unit`, `npm run test:e2e`, and `npm run build` with fresh output.
- [ ] Inspect `git diff --check`, generated routes, and repository status.
- [ ] Commit only the files belonging to this iteration.
