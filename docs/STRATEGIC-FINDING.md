# The Guud Network: Strategic Finding

**Build Day, 13 June 2026.** What four instrumented red-team runs taught us, and what to actually do next.

---

## The finding, in one line

**The empathy and trust layer works. The constraint is supply.** The Guud Network's hard problem is not code, design, or AI. It is a two-sided-marketplace cold-start: there is not yet enough real, reviewed, in-region, multi-category practitioner supply for the product to deliver on the promise its front door makes. That is a go-to-market problem, not a Build Day engineering problem.

---

## How we know

We built an evaluation harness (a dynamic workflow) that runs a panel of 10 diverse simulated users plus 4 expert audits against the live site, grounded in the SSR method from Maier et al. (arxiv 2510.08338): each persona reacts in its own voice from real interactions with the live product, then rates the experience 1 to 5, and we aggregate the distribution rather than trusting any single verdict. The source method reaches roughly 90% of human test-retest reliability.

We ran it four times, shipping a batch of fixes between each run:

| Dimension | v1 baseline | v2 trust + discoverability | v3 location + relevance | v4 empathy-honesty | Read |
| --- | --- | --- | --- | --- | --- |
| Accessibility-for-me | 2.6 | 2.33 | 2.7 | **2.9** | Real, durable climb |
| Trust | 2.8 | 2.89 | 3.3 | 2.9 | Up, but noisy |
| Ease of use | 3.9 | 3.78 | 3.9 | 3.9 | Already at ceiling |
| Usefulness | 2.5 | 2.22 | 2.4 | 2.4 | Flat |
| Likely to use | 2.4 | 2.11 | 2.4 | 2.2 | Flat |
| Likely to recommend | 2.5 | 2.11 | 2.5 | 2.2 | Flat |
| **Match relevance** | 2.1 | 2.11 | 2.1 | **1.9** | Stuck, the binding constraint |
| Goals fully met (of 10) | 0 | 0 | 0 | 0 | Never cleared |

Across four rounds of real product changes, the dimensions that decide survival (match relevance, likely-to-use, likely-to-recommend) stayed in a tight 1.9 to 2.5 band. They did not move, because the lever that moves them is not in the codebase.

---

## What we changed, and why the score did not rise

Each batch was the right thing to ship, and the instrument confirms the levers were correct but capped:

- **Trust honesty** (scores count only real reviews; sample data is labelled and separated): trust rose 2.8 to 3.3 at its peak. The brand promise is now backed by the math.
- **Location-aware matching** (parse the user's location from their own words, rank local-first): mechanically works. A Chicago user now gets Chicago doctors. But it surfaced the deeper problem rather than solving it (see below).
- **Empathy honesty + a true no-match path** (the AI no longer promises affordability, language, or locality it cannot verify; off-topic and unservable queries now return an honest empty result instead of a padded one): this made the product more trustworthy and **lowered** the satisfaction-style scores, because honest "we don't have someone for you" reads as a failed goal even though it is the right answer. We replaced inflated-but-wrong results with honest-but-empty ones.

That trade is the whole insight: **once you stop padding, the satisfaction metric exposes the empty shelf.** No amount of ranking, copy, or feature work fills it.

---

## The real constraint: supply

Every one of the four reports converged on the same root cause:

1. **Geographic concentration.** The only real, reviewed, trusted practitioners are in the Netherlands, Belgium, the UK, and Milan. Every US persona hit a wall.
2. **US supply is hollow.** US results are unreviewed registry stubs (trust 0), and the coarse NPI specialty mapping surfaces wrong fits (a gynecologic oncologist for a birth-control query).
3. **Empty categories.** Perinatal mental health, gender-affirming care, and any affordability or insurance signal do not exist in the data model. These are the highest-need segments.
4. **Language matching is a mirage.** The AI replies fluently in Spanish or Arabic, then matches English-only providers, because the `languages` field is not used in ranking.

You cannot rank, design, or prompt your way out of an empty shelf. The product makes a woman feel deeply seen and then cannot hand her someone she can reach. For the most vulnerable users that whiplash is worse than a cold directory.

---

## What is already built and working (the assets)

This is not a failed build. It is a validated platform waiting for supply:

- An empathetic, multilingual triage layer that every persona, including hard skeptics, rated as the best part and often better than any real intake.
- A trust-honest architecture: provenance tiers (curated / registry / community), scores from real reviews only, clearly-labelled sample data.
- Location-aware matching, a working emergency safety net, and accessibility that improved every round.
- 400+ real practitioners ingested free from the public CMS NPI registry, open-source and MIT-licensed, self-hostable.
- A reusable, instrumented red-team harness that can grade any future version, or any other product, on demand.

---

## What to do next (sequenced)

The order matters. Distribution before supply burns the channel permanently.

**1. Prove one geo before expanding.** Pick the Netherlands / Belgium / UK, where real supply already exists. Make match relevance genuinely good there. Win one market's word-of-mouth loop before touching the US.

**2. Recruit the empty categories before marketing to them.** Perinatal mental health, affirming-care providers, and affordability / community-clinic supply. Marketing to new mothers or trans users today burns trust because the category is empty.

**3. Build the equity data model.** Cost, insurance, sliding-scale, and language as first-class, filterable fields. When cost or language is the stated barrier, lead with community health centres and language-matched providers, or say honestly that there is no match yet.

**4. Capture demand instead of dead-ending it.** Replace every empty / out-of-region result with one email field ("be the first to know when we have someone in your area"). This converts the largest bounce into a re-engageable audience and produces a recruiting heat-map that tells you which city and specialty to staff next. This is the single cheapest high-leverage build and the bridge between today and real supply.

**5. Move trust from tone to credentials.** Verifiable registration numbers plus a clinician "claim your profile" flow. Today the gatekeeper checks tone, not licenses.

**6. Then, and only then, distribute.** Seed patient communities (r/endo, Endometriosis UK, Postpartum Support International), make the share loop real, ship honest JSON-LD + topic-and-city SEO, and offer an embeddable match widget to period and fertility apps. Every one of these amplifies whatever the product currently does, so they are worth doing only once relevance is real per geo.

---

## If you do one thing

Pick the NL/BE/UK beachhead, get real reviewed supply deep in two or three high-need categories, and turn on demand-capture everywhere else. Relevance follows supply; distribution follows relevance. The empathy is already done.

---

## Method caveat

These are SSR-inspired synthetic personas, directional signal for prioritisation, not ground truth. Before betting the roadmap, validate the top findings (supply, location relevance, the missing categories) with real women in each target population. The harness (`workflows/persona-redteam.mjs`) and the full per-run reports (`docs/persona-redteam-report*.md`) are in this repo for that.
