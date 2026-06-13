# The Guud Network 🌸

**Find women's health help you can actually trust.**

A trust-first, open-source platform to discover women's-health practitioners
that other women personally recommend, for a *specific* concern. Describe what
you're going through in plain language and **Claude Opus 4.8** routes you to the
right kind of help and the people women trust to give it.

Built for [Guud](https://guudwoman.com) on Claude Code Build Day.

> Not medical advice. In an emergency, contact your local emergency number.

---

## Why

Women face two broken questions in their health: *where do I find the right
help?* and *who can I trust?* Dismissal is endemic and discovery is fragmented.
The Guud Network is a warm, safe place where the signal is real
recommendations from women who were actually helped.

## What it does

- **Describe it your way** — free-text concern → Opus 4.8 interprets with
  empathy, maps to the right topic(s), flags urgent care. (`src/lib/ai.ts` →
  `interpretSymptoms`)
- **See who women trust** — practitioners ranked by a trust score blended from
  real recommendations, scoped to the concern. (`src/lib/trust.ts`)
- **Why women trust her** — Opus 4.8 summarises each practitioner's reviews,
  grounded only in real text. (`synthesiseTrust`)
- **Grow it safely** — anyone can add a practitioner or recommendation; every
  submission is moderated by Opus 4.8. (`moderateReview`)

## Stack

Next.js 16 (App Router) · React 19 · Tailwind v4 · Neon Postgres + Drizzle ·
Vercel AI SDK + Claude Opus 4.8 · Vercel.

## Run it yourself

```bash
npm install

# 1. Provision a Postgres database and set DATABASE_URL in .env.local
#    (Neon via `vercel integration add neon`, or any Postgres URL)

# 2. Power the AI with Claude Opus 4.8 — set ONE of:
#    ANTHROPIC_API_KEY=sk-ant-...        (direct Anthropic API)
#    or run on Vercel with AI Gateway    (auto-auth via OIDC)

# 3. Create schema + seed the network
npm run db:setup

# 4. Develop
npm run dev
```

The site degrades gracefully: with no AI credential it falls back to keyword
matching, so the network is always usable.

## Verify (model-checkable "done")

```bash
npm run verify https://your-deployment.vercel.app
```

Hits the live URL and asserts the full flow (landing, discover, Opus match,
profile). Exit code reflects pass/fail.

## Dynamic workflow (orchestration)

`workflows/grade.mjs` is a Claude Code dynamic workflow that re-grades a live
deployment against [`rubric.md`](./rubric.md) with a panel of independent
judges, then synthesizes a final score — no human needed. Re-run it on any URL:

```
Workflow({ scriptPath: "workflows/grade.mjs", args: { baseUrl: "https://your-deployment.vercel.app" } })
```

## Self-host for your community

It's MIT-licensed. Fork it, swap the seed data in `src/db/seed.ts` for your
region's practitioners, set your env, `npm run db:setup`, and deploy. The whole
network is yours.

## Project docs

- [`BRIEF.md`](./BRIEF.md) — the problem, who it's for, what done looks like
- [`rubric.md`](./rubric.md) — gradable success criteria
