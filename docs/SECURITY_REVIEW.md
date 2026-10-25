# Security and Privacy Review

Reviewed 2026-10-18 by reading the code; no penetration testing or production configuration
review was possible. Severity: **High** (exploitable, real impact), **Medium**, **Low**,
**Info** (no action needed / good practice confirmed).

## Summary

| ID | Finding | Severity |
|---|---|---|
| S-1 | Secrets are server-only; client bundle receives only `NEXT_PUBLIC_*` | Info ✅ |
| S-2 | Chat request validation and size limits | Info ✅ |
| S-3 | Rate limiting is per-instance without Redis | Medium |
| S-4 | `x-forwarded-for` trust for rate-limit keys | Low |
| S-5 | Prompt injection: regex + architectural limits; web content not filtered | Medium (inherent) |
| S-6 | Search terms (incl. chat-history search) sent to GA | Low–Medium (privacy) |
| S-7 | Reindex endpoint protection | Info ✅ |
| S-8 | Reindex error `detail` returned to the (authenticated) caller | Low |
| S-9 | Draft content exposure | Info ✅ |
| S-10 | XSS: Markdown rendering, JSON-LD | Info ✅ |
| S-11 | Model output can embellish personal facts | Medium (integrity) |
| S-12 | No CSP / security headers configured | Low |
| S-13 | Earlier key exposure noted in README TODO | Medium (operational) |
| S-14 | Chat history stored in `localStorage` | Info |

## Details

### S-1 Secrets — Info ✅
**Evidence:** `GOOGLE_GENERATIVE_AI_API_KEY`, `UPSTASH_*`, `RAG_ADMIN_SECRET` are read only in
`app/api/*`, `lib/model.ts`, `lib/redis.ts`, `lib/rag/embeddings.ts`, `vector-store.ts`,
`models.ts`, `service.ts`, `lib/admin-auth.ts`; these modules import `server-only` (a client
import fails the build). The assistant page passes only `online: Boolean(key)` and the model
name to the client. **Mitigation:** none needed; keep the `NEXT_PUBLIC_` prefix only for public
IDs. `.env*` is git-ignored except `.env.example` (placeholders only).

### S-2 Validation — Info ✅
**Evidence:** `app/api/chat/route.ts` (100 KB body cap, JSON parse guard), `parseChatRequest`
(enum modes, roles user/assistant only, ≤ 30 messages, ≤ 2000-char question, text parts only).
Tests in `tests/rag/prompt-and-validation.test.ts`.

### S-3 Rate limiting without Redis — Medium
**Evidence:** `createMemoryRateLimiter` is used when `UPSTASH_REDIS_*` is missing (currently
the case locally). Serverless instances don't share memory. **Impact:** a client can exceed
10/min by hitting multiple instances → quota exhaustion ("denial of wallet"). **Mitigation:**
configure Upstash Redis in production (documented); consider a global daily budget.

### S-4 Client key from `x-forwarded-for` — Low
**Evidence:** `clientKey()` hashes the first `x-forwarded-for` entry. On Vercel this header is
set by the platform; on other hosts a client could spoof it to dodge limits. **Mitigation:** on
non-Vercel hosts, use the platform's trusted client IP.

### S-5 Prompt injection — Medium (inherent to LLM apps)
**Evidence:** `INJECTION` regex in `lib/rag/router.ts`; `escapeDocumentText()` and the
"documents are data" rules in `lib/rag/prompt.ts`; no tools besides search; no secrets or
private data in context. Web pages used for grounding are processed inside Google's API — the
app can't inspect or filter them. **Impact:** a crafted question or web page could make the
model say something off-brand or false; it cannot exfiltrate secrets (none in context) or take
actions (no tools). **Mitigation:** keep capabilities minimal; consider an output check for
URLs/claims on the web route; add injection cases to the eval set (two exist).

### S-6 Search terms in analytics — Low–Medium (privacy)
**Evidence:** `useTrackSearch(query, "chat_history", …)` in `chat-sidebar.tsx` sends what the
visitor types to search their own chat titles; blog search does the same for article search.
**Impact:** free text in GA may contain personal data; GA's policies prohibit sending PII.
**Mitigation (not applied — documentation task):** drop the chat-history tracking or send only
`result_count`/length; for the blog, keep terms but document it in a privacy notice.

### S-7 Reindex endpoint — Info ✅
**Evidence:** `isAdminRequest()` requires `Bearer <RAG_ADMIN_SECRET>`, rejects secrets under 32
characters, compares SHA-256 digests with `timingSafeEqual`, fails closed when unset. Tests in
`tests/rag/admin-auth.test.ts`. **Residual:** no rate limit on the endpoint (a valid secret is
needed anyway).

### S-8 Reindex error detail — Low
**Evidence:** on failure, `POST /api/rag/reindex` returns `detail: errorMessage(error)` (redacts
`key=`, `token=`, `secret=` patterns, max 300 chars). Only authenticated callers see it.
**Mitigation:** acceptable; keep redaction tests if the format changes.

### S-9 Draft exposure — Info ✅
**Evidence:** drafts excluded from production pages (`isVisible`), 404 via `proxy.ts`, sitemap,
knowledge documents (`buildKnowledgeDocuments`, `documentProblem`), and queries (Upstash filter
+ `selectChunks`). Verified on a production build: draft URLs return 404. **Residual:** article
bodies are imported only by server code, so draft text isn't shipped to browsers, but it is part
of the server bundle and of the Git repository. The site links to the repository
(`links.github` on the assistant project); **if that repository is public, drafts are publicly
readable there.** Treat "draft" as "not promoted", not "secret".

### S-10 XSS — Info ✅
**Evidence:** `ReactMarkdown` without `rehype-raw` (raw HTML in model output or content is not
rendered) in `chat-message.tsx` and `components/content/markdown.tsx`; external links get
`target="_blank" rel="noreferrer"`; JSON-LD via `jsonLd()` escapes `<`. Source chip URLs come
from our metadata or the search provider. **Residual:** a `javascript:` URL in model-written
Markdown — react-markdown's default `urlTransform` sanitises unsafe protocols.

### S-11 Embellished answers — Medium (integrity)
**Evidence:** local run (fallback route) where the model added generic first-person statements
beyond the documents (see [RAG_DEEP_DIVE.md](RAG_DEEP_DIVE.md) §D7). **Impact:** a visitor could
read unsupported claims about Ayush. **Mitigation:** tighten the prompt ("only state what the
documents say about me"), lower temperature, add groundedness evaluation, show citations
prominently (done).

### S-12 Security headers — Low
**Evidence:** no `headers()` in `next.config.ts`, no CSP. Third-party scripts (GA/GTM) would need
CSP allowances. **Mitigation:** add basic headers (`X-Content-Type-Options`, `Referrer-Policy`,
`frame-ancestors`) and a CSP following `node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md`.

### S-13 Key rotation — Medium (operational)
**Evidence:** README TODO "Rotate the Gemini API key (an earlier key was shared in chat)".
**Mitigation:** rotate, update `.env.local` and Vercel, redeploy.

### S-14 Chat history in the browser — Info
`lib/chat-history.ts` stores up to 20 chats in `localStorage` (`ai-assistant-chats`). Nothing is
stored server-side; anyone with access to the device can read them.

## Logs
`chat_request` lines contain no question/answer/retrieved text (tested). IP addresses are not
logged; rate-limit keys are SHA-256 hashes of the IP.
