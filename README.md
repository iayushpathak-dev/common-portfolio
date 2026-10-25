# Ayush Pathak — AI Portfolio

A personal portfolio where visitors can browse my work **and chat with an AI assistant** that answers questions about my experience, projects and skills (in English or Hinglish), with optional Google Search for current tech questions.

- **Live:** https://common-portfolio-nine.vercel.app
- **Repo:** https://github.com/iayushpathak-dev/common-portfolio

---

## Contents

1. [Tech stack](#tech-stack)
2. [Run it locally](#run-it-locally)
3. [Pages](#pages)
4. [Editing content](#editing-content)
5. [Project structure](#project-structure)
6. [How the AI assistant works](#how-the-ai-assistant-works)
7. [Layout and responsiveness](#layout-and-responsiveness)
8. [Theming](#theming)
9. [Git workflow and CI/CD](#git-workflow-and-cicd)
10. [Deployment (Vercel)](#deployment-vercel)
11. [Gotchas](#gotchas)
12. [Pending work / TODO](#pending-work--todo)

---

## Tech stack

| Area | What | Notes |
|---|---|---|
| Framework | **Next.js 16.4** (App Router, Turbopack) | `cacheComponents` is on: pages are prerendered as static HTML. Read `node_modules/next/dist/docs/` before using new APIs — this version differs from older Next.js. |
| UI | **React 19.3**, **TypeScript 5** | |
| Styling | **Tailwind CSS v4** | Theme tokens live in `app/globals.css`. No `tailwind.config` file. |
| Components | **shadcn/ui** (style `base-nova`, built on **Base UI**) | Generated into `components/ui/`. Class merging uses the `cn` package. |
| Icons | **lucide-react v1** | v1 has no brand logos, so GitHub/LinkedIn/WhatsApp/X are inline SVGs in `components/brand-icons.tsx`. |
| AI | **Vercel AI SDK v7** (`ai`, `@ai-sdk/react`, `@ai-sdk/google`) | v7 renamed `system` → `instructions`, `stepCountIs` → `isStepCount`. |
| Model | **Gemma 4 26B** (`gemma-4-26b-a4b-it`) via the Gemini API | Override with `GEMINI_MODEL`. |
| Markdown | `react-markdown` + `remark-gfm` | Renders assistant replies. |
| Hosting | **Vercel** (Hobby, free) | |
| CI | **GitHub Actions** | `.github/workflows/ci.yml` |

---

## Run it locally

Requirements: **Node.js 20.9+** (the project and CI use Node 24) and npm.

```bash
npm install
cp .env.example .env.local      # then put your key in .env.local
npm run dev                     # http://localhost:3000
```

`.env.local`:

```bash
GOOGLE_GENERATIVE_AI_API_KEY=your-key   # https://aistudio.google.com/apikey
# GEMINI_MODEL=gemini-3.8-flash          # optional, default gemma-4-26b-a4b-it
```

`.env.local` is git-ignored; never commit a real key.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build (also prerenders every page) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `next typegen` + `tsc --noEmit` (typegen is needed so types like `LayoutProps` exist on a clean checkout) |
| `npm test` | Vitest unit and integration tests (no network, no API keys needed) |
| `npm run rag:reindex [-- <site-url>] [--status]` | Sync the assistant's vector index with published content (needs `RAG_ADMIN_SECRET`) |
| `npm run rag:eval` | Retrieval evaluation against the real Gemini + Upstash index (skipped without credentials) |

Before pushing, run `npm run lint && npm run typecheck && npm test && npm run build` — that's exactly what CI runs.

---

## Pages

| Route | File | What it shows |
|---|---|---|
| `/` | `app/page.tsx` → `components/home/home-view.tsx` | Home: hero, highlights, "What I Do", featured projects, latest posts, career journey, quote. Full width, no sidebar. |
| `/assistant` | `app/assistant/page.tsx` → `components/assistant/assistant.tsx` | AI chat: chat history sidebar, suggestions, chat, source modes, "Sources used" panel. |
| `/about` | `app/about/page.tsx` | Intro, My Story, What I Do, My Values, Quick Facts. |
| `/projects` | `app/projects/page.tsx` → `components/projects/project-browser.tsx` | Project cards with category filters. |
| `/projects/[slug]` | `app/projects/[slug]/page.tsx` | Case study: problem, contribution, architecture, trade-offs, related articles. |
| `/experience` | `app/experience/page.tsx` → `components/experience-timeline.tsx` | Job timeline + education. |
| `/blog` | `app/blog/page.tsx` → `components/blog/blog-list.tsx` | Articles with search, category filters and planned topics. |
| `/blog/[slug]` | `app/blog/[slug]/page.tsx` | Article with references, related projects and articles. |
| `/sitemap.xml`, `/robots.txt` | `app/sitemap.ts`, `app/robots.ts` | Published pages only. |
| `/api/rag/reindex` | `app/api/rag/reindex/route.ts` | Protected: POST syncs the vector index, GET returns the last run. |
| `/resume` | `app/resume/page.tsx` → `components/resume/resume-view.tsx` | Online resume with Download / Preview / Print; tabs on tablet & mobile. |
| `/resume.pdf` | `public/resume.pdf` | The PDF resume. Replace this file to update it. |
| `/api/chat` | `app/api/chat/route.ts` | Streaming chat endpoint (the only dynamic route). |

### Links into the assistant

Other pages can open the assistant with a query string (handled by `UrlIntent` in `assistant.tsx`):

| URL | Effect |
|---|---|
| `/assistant?ask=<question>` | New chat, sends the question immediately (used by blog "Ask AI about this" and project "View Case Study") |
| `/assistant?chat=<id>` | Opens a saved chat (sidebar on other pages) |
| `/assistant?new=1` | Starts a new chat |
| `/assistant?mode=auto\|knowledge\|web` | Switches the source mode |

Build these links with `askAssistantHref()` from `lib/nav.ts`; don't hard-code `/assistant`.

---

## Editing content

Two places, both plain data that components only render:

- **`content/`** — projects (`content/projects/*.ts`) and articles (`content/articles/index.ts` + one `.md` body each). Schemas are in `content/types.ts`; helpers (visibility, slugs, related links) in `content/index.ts`.
- **`lib/portfolio.ts`** — personal details, experience, skills and all site copy (the `PORTFOLIO` constant).

**Publication status** controls everything: `published` is public, in the sitemap and in the assistant's knowledge base; `draft` shows only in `npm run dev` (with a badge and, for projects, a TODO panel); `planned` is listed on the blog as an upcoming topic. To publish an article after reviewing it, set `publicationStatus: "published"` and update `updatedAt`, then deploy (the reindex workflow picks it up).

Each project and article also carries an evidence label (`Professional Experience`, `Hands-on Implementation`, `Experiment`, `Learning Notes`, `Planned`) so the site never presents learning as experience. Project sections you can't confirm stay `null` with an entry in `todos` — don't guess.

The `PORTFOLIO` keys:

| Key | Used for |
|---|---|
| `profile` | Name, role, tagline, intro, summary, quote, location, `contact` (email, phone, GitHub, LinkedIn, WhatsApp), avatar, resume URL |
| `highlights` | The 4 stats (6+ years, 20+ clients, …) |
| `experience` | Jobs, most recent first: company, role, period, duration, summary, highlights (`"Title: text"` renders the title bold), technologies |
| `skillGroups` | Skill groups on the resume |
| `education` | Degrees (`period` optional) |
| `aiJourney` | AI learning topics with their evidence label (Home and About) |
| `pages` | Every route (label, href, icon). Header, rail and mobile nav are built from this via `lib/nav.ts`. |
| `homePage`, `aboutPage`, `projectsPage`, `experiencePage`, `blogPage`, `resumePage`, `assistantPage` | Page-specific copy and SEO title/description |
| `hero`, `suggestions`, `sidebar`, `modes`, `composer`, `chat`, `insights` | Assistant page copy |
| `seo` | Default site title/description |

Constants at the top of the file: `WHATSAPP_NUMBER` (digits with country code), `RESUME_URL`, `CONTACT`, `PROMPTS`.

**The AI answers from published content.** `lib/rag/documents.ts` turns the profile, experience, skills, education and every *published* project and article into knowledge documents. Anything published is treated as fact, so keep it true and in sync with `public/resume.pdf`.

To add an image: put it in `public/` (e.g. `public/avatar.png`) and reference it as `/avatar.png`. Without the avatar file, the site shows "AP" initials.

---

## Project structure

```
app/
  layout.tsx            Root layout: fonts, metadata, dark-by-default theme, pre-paint theme script
  globals.css           Tailwind v4 + theme tokens (light/dark), .prose-chat, scrollbar-hide
  page.tsx              Home
  assistant/page.tsx    AI assistant
  about|projects|experience|blog|resume/page.tsx
  projects/[slug]/page.tsx, blog/[slug]/page.tsx   Case studies and articles
  sitemap.ts, robots.ts
  api/chat/route.ts     Chat API: rate limit → validate → lib/rag/pipeline (streams the answer)
  api/rag/reindex/route.ts  Protected index sync

content/                Projects, articles (Markdown) and their schemas — see "Editing content"
proxy.ts                Returns a real 404 for unknown/draft slugs under /blog and /projects
docs/                   Architecture, RAG deep dive, request lifecycle, private interview prep (not public)…

components/
  site-header.tsx       Top header: nav, theme toggle, GitHub, Resume, mobile menu sheet
  mobile-nav.tsx        Phone bottom bar + "More" sheet
  nav-rail.tsx          Tablet icon rail
  page-shell.tsx        Layout for content pages (header + rail/sidebar + main + mobile nav)
  page-ui.tsx           Shared bits: PageIntro, card, Chip, SectionTitle
  theme-toggle.tsx      Light/dark switch (saved in localStorage)
  brand-icons.tsx       GitHub, LinkedIn, WhatsApp, X SVGs
  experience-timeline.tsx  Timeline shared by /experience and /resume
  home/home-view.tsx
  assistant/
    assistant.tsx       Chat state (useChat), history, URL intents, page layout
    chat-sidebar.tsx    New chat, recent chats (search/delete), modes, Let's Connect
    linked-sidebar.tsx  Same sidebar on other pages; actions navigate to /assistant
    chat-message.tsx    Message bubbles, markdown, sources, copy/feedback
    chat-composer.tsx   Input box, mode pills, send/stop
    hero-card.tsx       "Hi, I'm Ayush" card + suggestion chips
    insights-panel.tsx  Right panel: sources used, related, quick actions, model status
  projects/project-browser.tsx  Filters, ProjectCard, FeaturedProjects (home)
  blog/blog-list.tsx    Search, FilterPills, PostCard, LatestPosts (home)
  resume/               resume-view, resume-tabs (tablet/mobile tabs), print-button
  ui/                   shadcn/ui primitives (generated)

lib/
  portfolio.ts          ← ALL CONTENT (PORTFOLIO constant)
  nav.ts                Nav lists, isActive(), askAssistantHref()
  chat-modes.ts         ChatMode type, AssistantMessage type, mode options
  chat-history.ts       Chat history in localStorage (useSyncExternalStore)
  model.ts              GEMINI_MODEL (server-only)
  analytics.ts          GA4/GTM events, debounced search tracking
  seo.ts, site.ts       Page metadata/JSON-LD helpers, canonical SITE_URL
  rate-limit.ts, redis.ts, admin-auth.ts
  rag/                  The assistant's RAG system (see below)
  utils.ts              cn(), formatDate()

tests/rag/              Vitest tests (fakes in tests/helpers)
tests/eval/             Evaluation dataset + provider-backed retrieval eval
scripts/rag-reindex.mjs Calls the reindex endpoint
public/resume.pdf       Downloadable resume
.github/workflows/ci.yml  CI pipeline (lint, typecheck, test, build)
.github/workflows/rag-reindex.yml  Reindex after each production deployment
vercel.json             Only the production branch deploys
```

---

## How the AI assistant works

The assistant answers from **published portfolio content** using retrieval-augmented generation (RAG), cites its sources, and uses Google Search only for current technical questions. Full details, diagrams and trade-offs: [`docs/RAG_DEEP_DIVE.md`](docs/RAG_DEEP_DIVE.md) and [`docs/AI_REQUEST_LIFECYCLE.md`](docs/AI_REQUEST_LIFECYCLE.md).

### Architecture

| Piece | Choice | Why |
|---|---|---|
| Chat model | Gemma/Gemini via `@ai-sdk/google` (`GEMINI_MODEL`) | Existing integration, free tier |
| Embeddings | `gemini-embedding-001`, 768 dimensions | Same API key; 768 keeps storage and queries small |
| Vector database | Upstash Vector (cosine) | REST API works from Vercel functions, metadata filters, free tier |
| Rate limiting, index status | Upstash Redis + `@upstash/ratelimit` | Serverless instances don't share memory |
| Web search | Google Search grounding (`lib/rag/models.ts`) | Already integrated; replaceable behind `ModelFactory` |

### Request lifecycle (`POST /api/chat`)

1. **Rate limit** per hashed IP (`lib/rate-limit.ts`, 10/min by default) → 429 with `Retry-After`.
2. **Validate** with Zod (`lib/rag/validation.ts`): modes, roles, ≤ 30 messages, question ≤ 2000 chars; only text parts are kept.
3. **Route in code** (`lib/rag/router.ts`): `blocked` (injection patterns) and `greeting` get fixed replies; `personal` → RAG only, **never web search**; `current` → web search (unless My Knowledge mode); `technical` → RAG, else general knowledge; `unknown` → out of scope unless retrieval finds a strong match.
4. **Retrieve** (`lib/rag/retrieve.ts`): embed the question (cached per instance), query top-K with `publicationStatus = 'published'`, keep chunks above `RAG_MIN_SCORE`, max 3 per document, within a character budget.
5. **Abstain without the model** when a personal question has no relevant chunk, or the vector store is down.
6. **Generate** (`lib/rag/pipeline.ts`): `streamText` with instructions that mark documents as untrusted data (`lib/rag/prompt.ts`), output and time limits. Search failures fall back to an answer without search, flagged in the UI.
7. **Cite** the pages of exactly the chunks the model received (`source-url` parts); the UI labels each answer *From my portfolio*, *Web search*, *General knowledge* or *No matching information*.
8. **Log** one JSON line per request (request ID, route, timings, chunk count, top score, tokens, error class) — never the question or answer. The response carries an `x-request-id` header.

### Knowledge base and indexing

- `lib/rag/documents.ts` builds documents from published content only (no drafts, TODOs or phone number).
- `lib/rag/chunk.ts` splits Markdown by `##` sections (code fences kept intact), ~1400 characters with overlap, IDs `<documentId>:<n>`, and a SHA-256 hash of text + embedding model + chunker version.
- `lib/rag/ingest.ts` compares hashes with the index: embeds only new/changed chunks, upserts, then deletes chunks that no longer exist. Re-running is a no-op. Failed batches are reported and retried next run; a failed document's old chunks aren't deleted.
- **Triggers:** `.github/workflows/rag-reindex.yml` calls `POST /api/rag/reindex` after each successful Production deployment (and on demand from the Actions tab); `npm run rag:reindex` does it manually. Publishing content only reaches the assistant after one of these has run — check with `npm run rag:reindex -- <url> --status`.
- Without Upstash configured, personal questions are answered from the core profile documents only (route `fallback`).

### Setup

1. Create an **Upstash Vector** index: **768 dimensions, COSINE** metric. Copy its REST URL and token.
2. Create an **Upstash Redis** database (same account). Copy its REST URL and token.
3. Generate an admin secret: `openssl rand -hex 32`.
4. Add to `.env.local` and to Vercel (Production): `UPSTASH_VECTOR_REST_URL`, `UPSTASH_VECTOR_REST_TOKEN`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `RAG_ADMIN_SECRET` (see `.env.example` for optional tuning variables).
5. In GitHub → Settings → Secrets and variables → Actions: secret `RAG_ADMIN_SECRET`, variable `SITE_URL`.
6. Index once: `npm run dev`, then `npm run rag:reindex`. Run `npm run rag:eval` and tune `RAG_MIN_SCORE` until the targets pass.

### Free tiers and cost (verify current limits before relying on them)

- **Upstash Vector free plan** (checked Oct 2026): 10,000 queries + updates per day, 1 GB data, up to 1536 dimensions. Each chat question that reaches retrieval = 1 query; a full first index ≈ one update per chunk; later reindexes only touch changed chunks.
- **Gemini API**: free-tier rate limits apply per model to chat, embeddings and search grounding separately; check AI Studio for current numbers. Per question: 1 embedding call (skipped on cache hit) + 1 generation (+ search on the web route).
- **Estimate**: `daily cost ≈ questions × (input tokens × input price + output tokens × output price) + search calls × search price`, with token counts taken from the `chat_request` logs.
- **Vercel Hobby**: the chat route declares `maxDuration = 60`.

### Testing

- `npm test` — 117 deterministic tests: chunking, documents (published-only, no secrets), idempotent ingestion (updates, deletions, partial failures), router table, retrieval thresholds/budgets/citations, prompt escaping, validation, rate limiting, admin auth, and the full pipeline with a mock model (fixed replies, abstention, web search fallback, timeouts, empty answers, log privacy).
- `npm run rag:eval` — real-provider retrieval evaluation over `tests/eval/rag-eval-cases.json` (hit rate, abstention, citation validity, latency p50/p95).
- **Manual checklist** (needs real credentials): ask a personal question (portfolio label + source links); a question with no answer ("What is your favourite movie?") → no-information reply; "What's new in the latest Next.js?" → web sources; an off-topic question → scope reply; an injection attempt → refusal; edit a published project, deploy, confirm the reindex workflow ran and the answer changed; unpublish it, reindex, confirm it's no longer cited.

### Known limitations

- Retrieval thresholds are defaults until tuned with `npm run rag:eval` on the real index.
- The keyword router can misclassify unusual phrasing; strong retrieval can pull questions back into scope, but not the other way round.
- Injection patterns only catch casual attempts; the real protection is that the model has no secrets, no private data and no tools beyond search.
- The model can still paraphrase beyond its documents; grounding is instructed and evaluated, not guaranteed.
- Chat history lives in the visitor's browser only.

### Source modes

| Mode | Behaviour |
|---|---|
| `auto` (default) | Router decides; web search only for current technical questions |
| `knowledge` | Never searches the web |
| `web` | Technical questions use search; personal questions still use RAG only |

---

## Layout and responsiveness

| Width | Content pages | Assistant page |
|---|---|---|
| < 768px (phone) | Header + bottom bar (Home, Projects, AI Assistant, Experience, More) | Same; mode pills in the composer |
| 768–1279px (tablet) | Icon rail on the left | Rail (768–1023px), then chat sidebar |
| ≥ 1280px (desktop) | Chat sidebar on the left | Sidebar + chat + insights panel |

Home has no rail/sidebar at any size (`<PageShell sidebar={false}>`). The resume turns its sections into tabs below 1280px, and its Print button prints just the resume (header, sidebar and buttons have `print:hidden`).

Scrollbars are hidden site-wide with the `scrollbar-hide` utility (scrolling still works).

---

## Theming

- Dark by default (`class="dark"` on `<html>`). The toggle saves `theme` in `localStorage`; an inline script in `layout.tsx` applies it before first paint to avoid a flash.
- Colours are CSS variables in `app/globals.css` (`:root` = light, `.dark` = dark), exposed to Tailwind via `@theme inline`. Extra tokens: `success`, `hero-from`, `hero-to`.
- Use Tailwind v4 class names (`bg-linear-to-br`, not `bg-gradient-to-br`).

---

## Git workflow and CI/CD

| Branch | Purpose | Runs CI? | Deploys? |
|---|---|---|---|
| `main` | Day-to-day work | No | No |
| `production` | What's live | Yes | Yes (Vercel) |

**Releasing:**

1. Work on `main`, commit, push.
2. On GitHub open a **pull request: base `production` ← compare `main`**.
3. CI runs on the PR (lint → typecheck → test → build). Merge only when it's ✅.
4. After merge, CI runs again on `production` and Vercel deploys it.

**CI** (`.github/workflows/ci.yml`): Ubuntu, Node 24, `npm ci`, `lint`, `typecheck`, `test`, `build`. A second workflow, `rag-reindex.yml`, reindexes the assistant after each successful Production deployment. Triggered by pushes to and PRs into `production`. A newer run on the same branch cancels the older one. See runs at https://github.com/iayushpathak-dev/common-portfolio/actions.

Commits use the personal email `ayushpathakhaldwani@gmail.com` (set in this repo's local git config only) and push with the `iayushpathak-dev` GitHub account.

---

## Deployment (Vercel)

- Project imported from GitHub under the `iayushpathak-dev` account (Hobby plan).
- **Production Branch must be `production`** (Settings → Environments → Production → Branch Tracking). If it's `main`, pushes to `production` only create Previews and the live site doesn't update.
- `vercel.json` disables deploys for every branch except `production`.
- **Environment variables** (Production): `GOOGLE_GENERATIVE_AI_API_KEY`, the Upstash and `RAG_ADMIN_SECRET` variables above, optional `NEXT_PUBLIC_GA_ID`/`NEXT_PUBLIC_GTM_ID`/`NEXT_PUBLIC_SITE_URL`. Pages are built once at deploy time, so after adding or changing env vars, **redeploy**.
- Each deployment gets its own unique URL; the stable link is the project domain (`common-portfolio-nine.vercel.app`, editable under Settings → Domains).
- To roll back: Deployments → pick an older deployment → ⋯ → **Promote to Production**. Promoting an older deploy replaces the live one — always check which commit you promote.

---

## Gotchas

- **New Next.js:** check `node_modules/next/dist/docs/` before using APIs from memory (see `AGENTS.md`).
- **Cache Components:** random values (`Math.random`, `generateId()`) during render break the build. That's why `useChat` gets a fixed `id` and chat IDs are created lazily.
- **Activity:** Next keeps visited pages alive in the background instead of unmounting them, so "run once on mount" effects don't re-run on return. URL intents use `useSearchParams` (inside `<Suspense>`) and react to changes instead.
- **Server → client props:** you can't pass functions (including Lucide icon components) from a server component to a client component. Content stores icons by name (`IconKey`), and server pages pass small summaries (`toProjectSummary`, `toArticleSummary`) — never article bodies — to client components. Don't import `@/content` into a client component (it would bundle every article).
- **Cache Components + dynamic routes:** `generateStaticParams` must return at least one param (hence the `_none` placeholder), and a `notFound()` after streaming starts keeps a 200 status — `proxy.ts` returns real 404s first.
- **Dev server after big refactors:** if pages suddenly 500 with stale errors, restart `npm run dev`.
- **Line endings:** files are LF; mixed CRLF breaks scripted find/replace.

---

## Pending work / TODO

**Content**
- [ ] Add `public/avatar.png` (profile photo).
- [ ] Confirm `profile.location` ("Delhi NCR, India" isn't on the resume).
- [ ] Confirm `WHATSAPP_NUMBER` (currently the resume's phone number).
- [ ] Review the 15 draft articles in `content/articles/` and publish the ones you're happy with.
- [ ] Answer the TODOs on each project (visible in `npm run dev`); 6 candidate projects stay drafts until you do.
- [ ] Add "mentor two junior developers" to `public/resume.pdf` (it's on the site but not the PDF).
- [ ] Project cards use drawn placeholders — add screenshots where public.

**Security**
- [ ] Rotate the Gemini API key (an earlier key was shared in chat). Update `.env.local` and the Vercel env var, then redeploy.

**Product ideas**
- [ ] Set up Upstash + secrets (see "Setup"), run the first reindex and tune `RAG_MIN_SCORE` with `npm run rag:eval`.
- [ ] Custom domain (canonical URLs already assume `https://ayushpathak.co.in`).
- [ ] Optional: protect the `production` branch on GitHub (require PR + passing CI).

**Cleanup**
- [ ] Unused UI components (`components/ui/badge.tsx`, `scroll-area.tsx`, `textarea.tsx`) can be removed.
