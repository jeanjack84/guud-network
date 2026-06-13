# Persona Red-Team v4 (post batch-1) — The Guud Network

Four-run trend: v1 baseline / v2 trust+safety+disco / v3 location+relevance+crisis / v4 empathy-honesty+no-match+phone.

| Dimension | v1 | v2 | v3 | v4 |
| --- | --- | --- | --- | --- |
| trust | 2.8 | 2.89 | 3.3 | 2.9 |
| usefulness | 2.5 | 2.22 | 2.4 | 2.4 |
| ease | 3.9 | 3.78 | 3.9 | 3.9 |
| matchRelevance | 2.1 | 2.11 | 2.1 | 1.9 |
| likelyToUse | 2.4 | 2.11 | 2.4 | 2.2 |
| likelyToRecommend | 2.5 | 2.11 | 2.5 | 2.2 |
| accessibilityForMe | 2.6 | 2.33 | 2.7 | 2.9 |

I have everything I need in the prompt. Writing the report directly as my output.

# The Guud Network — Persona Red-Team Synthesis & Action Report

## 1. Executive summary

Four truths cut through the data, and they are uncomfortable because the emotional product is excellent while the functional product fails most users.

1. **The empathy is the best thing here, and it is writing a check the directory cannot cash.** Almost every persona, including the hardened skeptics (Karen, Destiny), opened by saying the AI intake made them feel genuinely seen, often better than any real intake form. Then the practitioner list loaded and the trust collapsed. This whiplash (warm front door, empty room) is the central problem. For fragile users (Aisha postpartum, Fatima limited-English) it is *worse* than a cold directory because it raises hope and then drops it.

2. **The two lowest Likert dimensions tell the whole story: matchRelevance (mean 1.9, min 1) and likelyToUse/likelyToRecommend (both 2.2).** These are the dimensions that decide whether the product survives. People found it easy (ease 3.9, the only strong score) and trusted the *tone* (trust 2.9), but the matches were wrong (relevance 1.9) so they will not use it (2.2) and will not pass it on (2.2). A product whose word-of-mouth growth loop is its only viable distribution channel scoring 2.2 on recommendation is an existential signal, not a polish item.

3. **Geography and supply are the root cause of the relevance failure.** 6 of 10 personas failed their goal outright; the other 4 only "partial." The recurring pattern: curated, trusted, reviewed practitioners are all in NL/BE/UK/Milan, while US users get zero-review NPI registry stubs (often gynecologic oncologists tagged "endometriosis"). The directory advertises "412 practitioners / 7 countries" but real, vetted supply is thin and EU-concentrated. The platform never reliably asks location, then pads results to look complete, which the most-betrayed users (Maya, dismissed 7 years) correctly read as inflation.

4. **Entire need-categories are empty or mis-served.** Mental health does not exist (Aisha asked for a postpartum therapist and got midwives and endocrinologists). Trans/nonbinary affirming care is silently re-mapped into "painful sex / sexual health" (Sam felt erased). Cost/insurance/uninsured has no representation anywhere in the data model (Destiny stated "no insurance" three times and was handed a solo Manhattan urologist). Language matching is a mirage: the AI replies fluently in Spanish/Arabic, then matches English/Dutch-only providers.

The honest read: **trust-first as a *brand* is working; trust-first as a *supply-and-match guarantee* is not yet true.** Fixing relevance and being honest about coverage matters more than any new feature.

## 2. Top problems (ranked)

### P1 — Location is not a real filter; results are padded with unreachable/unvetted providers
- **Severity: Critical.** Appears in 9 of 10 personas and 3 of 4 lenses.
- **Who:** Every non-NL/BE/UK user (all US personas: Maya, Fatima, Linda, Destiny, Aisha, Grace), and Global-South users (Lagos, Nairobi, Mexico City all returned EU providers or nothing).
- **Evidence:** Site rarely asks location up front; when it does detect it (Linda's rural Montana), it warns cross-border telehealth won't work *and then shows the same unusable European doctors anyway*. US results are NPI stubs with trust 0, no reviews, "be the first to recommend them." Maya's US "endo specialists" were all gynecologic oncologists.
- **Fix:** (a) Make location a required, structured first input with autocomplete, not optional free text. (b) Hard-filter or clearly badge providers the user demonstrably cannot reach ("In-person, New York USA only — likely not available to you"). (c) When local vetted supply is zero, **say so honestly and stop padding** with unvetted or oncologist listings. Honesty out-converts inflation with this audience.

### P2 — Empathy/results decoupling: warm response, empty or irrelevant practitioner list
- **Severity: Critical.** Aisha, Destiny, Rosa.
- **Who:** The most vulnerable users — postpartum, in pain, uninsured, mid-emergency.
- **Evidence:** Aisha's honest first query returned zero practitioners with no prompt to add location. Destiny's emotional phrasing returned `practitioners: []` while a cold clinical rephrase returned three — the site literally rewards clinical language it claims to not require. Rosa's emergency query correctly sent her to the ER but left no bridge back to after-care.
- **Fix:** Never return a warm empathy message with an empty list and no next step. If no match: explicit "we don't have someone for this yet" + waitlist capture + (for emergencies) a "save this, here's who can help once you're safe" bridge. Decouple emotional tone quality from query phrasing — the empathetic and clinical phrasings of the same need must return the same matches.

### P3 — Missing need-categories: mental health, affirming care, cost/insurance
- **Severity: Critical.** Aisha (mental health), Sam (trans/NB), Destiny + Fatima (cost/insurance).
- **Who:** Postpartum/perinatal mental health seekers, LGBTQ+ users, uninsured/low-income users — i.e. the highest-need segments.
- **Evidence:** No mental health practitioners exist at all; PMDD queries return endocrinologists. "Trans nonbinary affirming" silently re-mapped to Sexual Health (Sam: "it heard trans nonbinary affirming and quietly rerouted me to the nearest cis-shaped box"). The data model has no cost/sliding-scale/Medicaid field anywhere; Destiny's stated #1 barrier was acknowledged emotionally and ignored practically.
- **Fix:** (a) Recruit perinatal mental health providers before marketing to new mothers. (b) Add explicit affirming-care metadata + filter, backed by reviews from people who share the identity; never silently re-map an identity need. (c) Add affordability metadata (accepts uninsured/Medicaid, sliding scale, community clinic) and, when cost concern is detected, surface Planned Parenthood / HRSA / 211 resources instead of private specialists only.

### P4 — Language matching is a mirage
- **Severity: Critical (equity).** Fatima (Arabic), plus verified Spanish test in the equity lens.
- **Evidence:** The `languages` field exists on every provider but is *not used in ranking*. Spanish query → fluent Spanish empathy → six English/Dutch/Italian-only matches. No Arabic provider anywhere; the form never asks about language.
- **Fix:** Filter/boost on `languages`; when none match, say so honestly. Add a "language you're most comfortable in" selector; surface spoken languages on every result card. Localize intake UI for at least Spanish, Arabic, Dutch, French.

### P5 — No way to verify trust or act on a match
- **Severity: High.** Priya, Karen, Grace, Linda, Fatima.
- **Evidence:** No GMC/HCPC/credential numbers, no clinic links, no external verification — "trust me from a brand-new open-source site." Reviews are 3 per provider, all dated launch day, "checked by Claude Opus 4.8" (Grace, 19 and online-native, instantly clocked this as AI-curated and trust dropped). The gatekeeper checks *tone, not licenses* (Karen). And there is no phone/book/contact button on profiles, so even a loved match is a dead end (Linda, Grace, Fatima).
- **Fix:** Add verifiable credential fields (registration number + professional-body link) and surface real provider phone numbers as click-to-call (the NPI data already has them). Explain what "verified" and the trust score actually mean. Reframe "checked by Claude" so it reads as a safety screen, not as the source of the recommendation.

### P6 — Misleading "Verified" labels and seeded-looking reviews erode the one asset that works
- **Severity: High.** Maya, Destiny, Karen, Priya.
- **Evidence:** Unvetted NPI stubs labeled "Verified directory listing" next to a real name and phone read as a Guud endorsement (clinical-safety lens). Destiny saw labeled-but-fabricated 5-star "Sample" reviews on an unvetted doctor — "fake reviews, even labeled fake, makes a person like me trust the internet less." Karen noticed a reviewer literally named "Karen."
- **Fix:** Replace "Verified" with "Public registry listing — not vetted by Guud" for NPI providers. Remove sample/illustrative reviews from real named profiles entirely (the honest labeling is good, but their presence on a real doctor's page is net-negative for trust). Visually separate the registry identity block from any Guud quality signal.

### P7 — Emergency classifier is non-deterministic; safety net depends on the model firing
- **Severity: High (safety).** Clinical-safety lens.
- **Evidence:** Identical "I broke my leg skiing" query returned a safety response on 2 of 3 calls and a null/off-topic boilerplate on the 3rd. "Not medical advice" appears only in de-emphasized footer text *after* symptom entry. No persistent 988/crisis resource on the homepage.
- **Fix:** Run classification at temperature 0 with a deterministic keyword/regex pre-filter that forces `emergency:true` *before* the LLM call, so a model wobble can never suppress the crisis banner. Add a one-line disclaimer adjacent to the symptom box and a persistent crisis link in the footer. Localize crisis numbers (an IPV query from Amsterdam returned US-only hotlines).

### P8 — Accessibility gaps for the exact audience (pain, distress, low literacy)
- **Severity: High/Medium.** Accessibility lens.
- **Evidence:** Keyboard focus indicator removed (`outline-none`, no visible replacement, no skip-link). Match results and the *life-safety note* render with no `aria-live`, so screen-reader users hear nothing — the most safety-critical content is silent. Gold brand color fails WCAG contrast; the disclaimer text is sub-AA. English-only with unglossed jargon (Urogynaecology, PMDD, IUI).
- **Fix:** Add visible `focus-visible` rings + skip-link; wrap results in `aria-live="polite"` and the safety note in `role="alert"`; darken failing colors; add plain-language one-liners under each clinical category.

## 3. Discoverability & distribution strategy

The unanimous verdict across all 10 personas: **"I would never have found this on my own."** Every realistic path is a trusted peer dropping the link in a community where these women already are. SEO and the open-source/GitHub angle do nothing for a patient in pain (and actively *reduce* trust — Linda and Destiny read "open source / .vercel.app" as "tech side project, not real medical service"). So distribution must do two things: (a) get into peer communities, and (b) stop *looking* like a side project.

**Sequenced plays, reach-per-effort:**

1. **Seed directly into patient communities — the only channel that matches the data. (Effort: Low. Reach: High, targeted.)** r/endo, r/PCOS, r/Menopause, postpartum + endo Facebook groups, Postpartum Support International, Endometriosis UK, queer-health Slacks/Discords. But **do not do this until P1–P3 are fixed for the seeded region** — seeding a US endo community today, where US results are oncologist stubs, burns the community link permanently. Seed NL/BE/UK communities first, where supply is real.

2. **Make the share loop actually work. (Effort: Low-Med. Reach: Med-High.)** Today sharing exists only on profile pages with flat clipboard copy. Add "share this result" after a match, WhatsApp/Instagram/X intents (where women's-health discovery actually spreads), and richer pre-filled text. This is the growth loop the 2.2 recommendation score is starving.

3. **Capture unserved-region demand instead of dead-ending it. (Effort: Low. Reach: Med-High.)** The "we don't have anyone in {city} yet" note currently captures nothing and only asks the user to do unpaid data entry. Replace with one email field: "Be the first to know when we have someone in {city}." This converts the single largest bounce (every US/rural/Global-South user) into a re-engageable audience *and* a recruitment heat-map telling you which city+specialty to staff next.

4. **Ship JSON-LD + path-based topic+city SEO pages. (Effort: Low-Med. Reach: High, long-tail.)** No structured data exists, so Google cannot surface providers for "endometriosis specialist near me" — the dominant search pattern. Add Physician/MedicalBusiness/AggregateRating schema (only for providers with *real* reviews, to stay honest) and generate `/[topic]/[city]` pages. Again: gate behind real supply per geo.

5. **Embeddable match widget for period/fertility apps + advocacy nonprofits. (Effort: Med. Reach: Very High.)** The `/api/match` endpoint is already public and CORS-callable. Wrap it as a themeable `/embed` iframe and pitch Guud as the "trust layer" Flo/Clue/Natural Cycles lack. This puts the product inside apps where millions of in-need women already are. Harden the endpoint first (rate limit, origin allowlist).

6. **High-trust referral surface: /for-clinics + claim-your-profile. (Effort: Med-High. Reach: Med but highest-trust.)** A GP handing a patient a QR referral card reaches women at the exact moment of need with built-in credibility. Let NPI-listed clinicians claim and verify their profile, turning them into advocates.

## 4. Equity & reach

The platform currently *structurally excludes* the women who need it most: low-income, uninsured, non-English-speaking, rural, Global-South, disabled, and LGBTQ+. The empathy layer is admirably inclusive (multilingual, no jargon, no login, IPV routing); the supply and data model are not. Priorities:

- **Affordability is the deepest equity gap.** Add cost metadata + a "show low-cost / no-insurance options" filter, and when cost concern is detected, lead with community health centers, Planned Parenthood, HRSA, and 211 — not private specialists. This single change would have flipped Destiny's and Fatima's experience.
- **Language matching must become real (see P4).** Empathy in a language you can't get care in is a cruelty, not a kindness.
- **Never return empty + generic to a disability or identity disclosure.** A deaf user's query returned zero results and boilerplate. Capture accessibility needs (interpreter/ASL, wheelchair access) and affirming-care signals as routing metadata and filters; acknowledge the need even when supply is zero.
- **Don't let review volume become a proxy for affluence.** Providers serving marginalized communities accrue fewer online reviews; the current trust score will rank them below well-reviewed private specialists and visibly downrank "not yet vetted" registry providers who may be the *only* local option. Add an access-positive signal (accepts uninsured, community clinic) that can elevate a provider independent of review count, and make the scoring methodology explicit.
- **Localize crisis resources.** The highest-stakes path on the site must never hand an Amsterdam user a US-only hotline.
- **Offer a low-literacy / low-digital path:** tappable symptom chips as a first-class entry, plain-language prompts, click-to-call on provider phone numbers, and consider SMS/WhatsApp intake.

## 5. Quick wins vs strategic bets

### Quick wins (ship this week — low effort, high trust-recovery)
1. **Stop padding.** When local vetted supply is zero, say so honestly and capture an email; never fill with oncologist stubs or unvetted NPI listings dressed as matches. (Fixes the betrayal that drove the relevance score.)
2. **Make location a required structured first field** with autocomplete. (Root cause of P1.)
3. **Never show empathy + empty list with no next step** — always give a "we don't have this yet" + waitlist. (Fixes Aisha/Destiny whiplash.)
4. **Relabel and de-risk trust signals:** "Verified" → "Public registry listing — not vetted by Guud"; remove sample/illustrative reviews from real named profiles. (P6.)
5. **Deterministic emergency pre-filter (temp 0 + keyword regex) and a persistent crisis link + disclaimer near the input.** (P7 — safety, ship immediately.)
6. **Accessibility triage:** visible focus rings, `aria-live` on results, `role="alert"` on the safety note, darken failing colors. (P8 — partly safety.)
7. **Use the `languages` field in matching** (the data already exists). (P4 — config change, high equity payoff.)
8. **Surface provider phone as click-to-call** (NPI data already has it). (P5 — makes profiles actionable.)
9. **Turn the unserved-region note into an email capture.** (Distribution play #3 — one input.)

### Strategic bets (the next quarter — these decide whether the product is real)
1. **Concentrate and prove one geo before expanding.** Pick NL/BE/UK (where real supply exists), make match relevance genuinely good there, then seed those patient communities. Win one market's word-of-mouth loop before touching the US.
2. **Recruit the missing categories before marketing to them:** perinatal mental health, affirming-care providers, and affordability/community-clinic supply. Marketing to new mothers or trans users *today* burns trust because the category is empty.
3. **Build the affordability + insurance data model and filter.** (Largest equity unlock.)
4. **Verifiable credentials + clinician claim flow.** Move trust from "AI checked the tone" to "real, registered, and the clinician verified it."
5. **Embeddable match widget for period/fertility apps + advocacy partnerships.** Highest-reach channel, but only worth it once relevance is real.
6. **Path-based topic+city SEO with honest JSON-LD,** gated on real per-geo supply.

The throughline: **fix relevance and supply honesty first, then distribute.** Every distribution play amplifies whatever the product currently does — and right now it would amplify the disappointment, not the empathy.

## 6. Method caveat
These are SSR-inspired synthetic personas (arxiv 2510.08338), directional signal at roughly 90% of human test-retest reliability in the source study — useful for surfacing and ranking friction, but not a substitute for real users; validate the top problems with live women before betting the roadmap on them.