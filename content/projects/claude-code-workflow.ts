import type { Project } from "@/content/types"

export const claudeCodeWorkflow: Project = {
  id: "project-claude-code-workflow",
  slug: "claude-code-workflow",
  contentType: "project",
  title: "Claude Code Engineering Workflow",
  summary:
    "How I build production features with Claude Code: a living CLAUDE.md that holds every project rule and decision, plan-first ports, server-side verification against mock backends, AI-assisted security reviews and code-mapping docs. Used to rebuild the FITPASS Partner Studio on Next.js 16 and to build this portfolio.",
  publicationStatus: "published",
  evidence: "Hands-on Implementation",
  organization: "FITPASS and personal projects",
  period: "2026",
  categories: ["AI", "Architecture"],
  tags: ["Claude Code", "AI-assisted Engineering", "CLAUDE.md", "Code review", "CI"],
  stack: ["Claude Code", "CLAUDE.md / AGENTS.md", "ESLint", "Vitest", "GitHub Actions", "curl + mock backends"],
  visual: { kind: "icon", icon: "terminal" },
  updatedAt: "2026-11-24",
  sections: {
    problem:
      "AI coding agents are fast but forgetful: every session starts without the project's history, they reach for outdated framework APIs, and their changes can look right while quietly breaking behaviour. I wanted the speed without lowering the quality bar of production code.",
    challenge: `- Keep months of decisions (security model, API rules, UI rules, things the team agreed) available to the agent in every session.
- Port a large app (the FITPASS Partner Studio, from a React SPA to Next.js 16) screen by screen without losing behaviour.
- Verify work that a unit test can't easily cover: auth cookies, Server Actions, backend contracts.`,
    contribution: `**1. A living CLAUDE.md as the project's memory**

- On the Partner Studio rewrite, \`CLAUDE.md\` grew to ~350 lines covering architecture, auth, the API security model, data-loading rules, per-page notes, shared components, WebView UI rules, fonts, colours and the folder layout.
- Rules are dated and owned: "user's rule, 2026-11-20", "decided with the user, 2026-11-03". The agent knows what is a team decision and when it was made, so it doesn't undo it.
- Code stays clean: a project rule moves all explanations out of code comments and into \`CLAUDE.md\`, so the code is short and the reasoning lives in one searchable place.
- Open questions for the backend team are kept in a list at the end, so nothing the agent was unsure about is silently guessed.
- \`AGENTS.md\` points the agent at the installed framework docs (\`node_modules/next/dist/docs/\`), because Next.js 16 changed APIs that models remember differently.

**2. Plan first, then port**

- Before porting a screen, the agent writes down how the old version worked and what changes (for example, \`docs/react-query.md\` decides which data uses Server Components, Server Actions or React Query).
- Each port records what was **not** ported and why, so nothing is lost by accident.

**3. Verification the agent runs itself**

- \`npm run lint\` and \`npm run build\` must pass after every change. In this portfolio, CI runs lint, typecheck, 118 tests and the build on every PR.
- For auth and proxy changes, the app runs against a **small mock backend** and the agent checks real flows with \`curl\` and a cookie jar: login link → session cookie → pages and API calls.
- Server Actions are tested directly with \`curl\`, using the action ID from the build's server-reference manifest.

**4. AI-assisted reviews and docs**

- Security review: a written review of auth, the BFF, Server Actions, cookies and logging, with severity, owner and fix for each issue, plus a checklist for new code. Read before adding any action, cookie or backend call.
- Code maps: for the Agora integration, a doc traces every SDK call and where each key and token comes from (prop → state → env → backend API). It turned token bugs into lookups.

**5. Grounded content**

- This portfolio's case studies were written by an agent that **read the real codebases** and recorded only what the code shows. Claims it couldn't confirm (for example a Lighthouse score) were measured or removed, not guessed.`,
    architecture: `\`\`\`text
CLAUDE.md / AGENTS.md  ── rules, decisions (dated), architecture, open questions
        │ read every session
        ▼
Task ──► plan (doc or notes) ──► small change ──► agent runs checks
                                                   ├─ lint · typecheck · tests · build
                                                   ├─ mock backend + curl (auth, proxy)
                                                   └─ Server Action calls via manifest ID
        ▼
Human review of the diff ──► commit ──► CI on PR
        │
        └─ new decision? ──► written back into CLAUDE.md
\`\`\``,
    decisions: `- **Write decisions down, not in chat.** Anything agreed in a session goes into \`CLAUDE.md\` with a date, so the next session starts from it.
- Executable acceptance criteria. "Build, lint and the curl flow pass" instead of "looks good".
- Docs over memory for frameworks. The agent reads the installed version's docs before using an API it isn't sure about.
- Review every diff like a colleague's PR, especially for auth, money and data access.
- Measure or remove. Numbers in docs and case studies are measured, or they don't go in.`,
    tradeoffs: `- **A long CLAUDE.md** gives rich context but costs tokens and needs pruning, or stale notes start misleading the agent.
- Agent speed vs review time: the agent writes faster than a human can review, so changes must stay small to keep review real.
- Comments in CLAUDE.md instead of code: one place for reasoning, but a reader of a single file sees less context.`,
    limitations: null,
    impact: "Used to rebuild the FITPASS Partner Studio on Next.js 16 (auth, BFF, Server Actions and the ported screens) and to build this portfolio with its RAG assistant.",
    lessons: "Most mistakes the agent made were caught by running something (build, curl, tests), not by reading the diff once.",
  },
  relatedArticles: ["article-engineering-with-claude-code"],
  todos: [],
}
