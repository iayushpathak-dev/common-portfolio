## Introduction

Claude Code is Anthropic's agentic coding tool: it reads a repository, runs commands, edits files and explains its work from the terminal or an editor. Used casually, it's a fast autocomplete. Used deliberately, it's a collaborator that can carry out multi-step changes. These notes describe how I try to move from "prompting" to **reliable agent workflows**, using this portfolio as the working example.

## Problem statement

AI-generated changes can look right and still be wrong: outdated APIs, invented functions, missed edge cases, silent behaviour changes. The challenge is to get the speed benefits while keeping the same quality bar as hand-written code.

## Learning objectives

1. Give the agent durable project context.
2. Break work into reviewable steps.
3. Use automated checks as the agent's feedback loop.
4. Review AI changes effectively.
5. Know what not to delegate.

## Core concepts

- **Project instructions file**: a Markdown file (such as `CLAUDE.md` or `AGENTS.md`) in the repository with conventions, commands and warnings the agent reads every session. This repository's `AGENTS.md` warns that the installed Next.js version differs from older versions and points to the bundled docs.
- **Verification loop**: lint, typecheck, tests and build that the agent runs after changes. CI runs the same checks.
- **Small, scoped tasks**: one concern per request, with clear acceptance criteria.
- **Human review**: the diff is reviewed like a colleague's pull request.

## Technical explanation

A workflow that works well:

```text
1. Explain the goal and constraints (what must not change)
2. Ask the agent to inspect the code and propose a plan
3. Agree the plan, then let it implement step by step
4. Agent runs lint / typecheck / tests / build and fixes failures
5. Review the diff: correctness, naming, scope, security
6. Commit in small, described commits
```

What makes it reliable:

- **Context over cleverness**: accurate instructions and docs prevent most wrong-API mistakes.
- **Executable checks**: "the build passes" is a better acceptance criterion than "looks good".
- **Version awareness**: frameworks change. Reading the installed package's docs beats relying on what the model remembers.

## Code example

A small instructions file:

```markdown
# Project notes for coding agents

- Next.js 16 App Router with cacheComponents; read node_modules/next/dist/docs before using new APIs.
- All site copy lives in lib/portfolio.ts and content/; components only render it.
- Before finishing: npm run lint && npm run typecheck && npm test && npm run build
- Never commit .env files or print secrets.
```

A CI job that enforces the same checks on every pull request:

```yaml
- run: npm ci
- run: npm run lint
- run: npm run typecheck
- run: npm test
- run: npm run build
```

## Production considerations

- **Secrets**: keep `.env` files out of the agent's output and out of commits; review any command that touches credentials.
- **Permissions**: approve destructive commands (deleting files, force pushes) explicitly.
- **Dependencies**: check that new packages are necessary, maintained and compatible.
- **Ownership**: you are responsible for merged code, regardless of who typed it.

## Trade-offs and alternatives

- **Large vs small tasks.** Large tasks save prompting time but produce diffs that are hard to review; small tasks are slower but safer.
- **Agent vs inline completion.** Inline completion suits local edits; an agent suits multi-file changes, refactors and investigation.
- **Speed vs understanding.** Delegating everything can leave gaps in your own understanding of the codebase; ask the agent to explain decisions you'd need to defend in a review.

## Common mistakes

- Accepting changes without running the checks.
- Vague requests ("make it better") with no acceptance criteria.
- Letting the agent guess APIs instead of pointing it at current docs.
- Delegating security-sensitive decisions without review.

## Key takeaways

- Treat the agent as a collaborator that needs context and review.
- Automated checks are the feedback loop that makes agent work reliable.
- Small, well-specified tasks produce reviewable, correct changes.
