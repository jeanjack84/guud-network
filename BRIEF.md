# The Guud Network — Build Day Brief

## The problem

Women routinely struggle with two questions when something is wrong with their
health:

1. **Where do I even find the right kind of help?** Women's health is
   fragmented across gynaecology, endocrinology, pelvic physiotherapy, fertility,
   menopause, mental health and more. Most women don't know which door to knock
   on.
2. **Who can I actually trust?** Dismissal is endemic. The average endometriosis
   diagnosis takes years. Women are told their pain is "normal." When they
   finally look for someone good, they're left scrolling generic review sites
   that were never built for this.

The result: women suffer longer than they should, and the practitioners who
*do* listen are hard to find.

## Who it's for

Women looking for trustworthy women's-health care, described in their own words
and at their own moment of need. Secondarily, the practitioners who earn that
trust, and any community or clinic that wants to run this for their own region
(it's open source).

## What we built

**The Guud Network** — a trust-first, open-source platform to discover
women's-health practitioners that other women personally recommend, for a
*specific* concern.

- **Describe it your way.** A woman types what she's going through in plain
  language. **Claude Opus 4.8** interprets it with empathy, maps it to the right
  women's-health topic(s), and flags anything needing urgent care.
- **See who women trust.** Practitioners are ranked by a trust score blended
  from real recommendations, scoped to the exact concern.
- **Why women trust her.** Opus 4.8 synthesises each practitioner's
  recommendations into an honest, grounded summary.
- **Grow it, safely.** Anyone can add a practitioner or a recommendation. Every
  submission is moderated by Opus 4.8 to keep the space positive and safe.
- **Open by design.** MIT-licensed, free for anyone to use, contribute to, or
  self-host for their own community.

## What "done" looks like

- A **live, responding URL** anyone can visit.
- Core flow works end-to-end: search → matched practitioners → profile →
  submit a recommendation that persists.
- The three Opus 4.8 features (interpret, synthesise, moderate) work live.
- Verifiable without a human: `npm run verify` hits the live URL and asserts the
  flow; `rubric.md` can be graded by a model; a dynamic workflow
  (`workflows/grade.mjs`) scores the deployment against the rubric.

## Stack

Next.js 16 (App Router) · React 19 · Tailwind v4 · Neon Postgres + Drizzle ·
Vercel AI SDK + Claude Opus 4.8 · deployed on Vercel.
