# Persona Red-Team Report v3 (post matching fixes) — The Guud Network

10 personas, 4 lenses. Compares v1 (baseline) / v2 (trust+safety+discoverability) / v3 (location-from-query + relevance-first + crisis subordination).

| Dimension | v1 | v2 | v3 |
| --- | --- | --- | --- |
| trust | 2.8 | 2.89 | 3.3 |
| usefulness | 2.5 | 2.22 | 2.4 |
| ease | 3.9 | 3.78 | 3.9 |
| matchRelevance | 2.1 | 2.11 | 2.1 |
| likelyToUse | 2.4 | 2.11 | 2.4 |
| likelyToRecommend | 2.5 | 2.11 | 2.5 |
| accessibilityForMe | 2.6 | 2.33 | 2.7 |

This is a synthesis task with all data provided inline. No tools needed.

# The Guud Network: Persona Red-Team Synthesis

## 1. Executive Summary

**The product nails empathy and fails on delivery.** Across 10 personas, the AI front door is the consistent star (warm, validating, accurate symptom triage, smart crisis detection), but the directory it hands off to cannot complete the job for almost anyone. The two lowest Likert dimensions tell the whole story: **matchRelevance (mean 2.1, min 1)** and a tie at **usefulness / likelyToUse (mean 2.4)**. Ease scores highest (3.9), confirming the funnel works right up until the moment of truth, then collapses. **Goal accomplishment: 0 of 10 fully succeeded; 5 partial, 5 no.**

**The core failure is geography + thin supply, not UX.** The trusted, reviewed practitioners are almost all in Western Europe (Amsterdam, Berlin, London, Milan, Brussels). The only US results are bare NPI registry shells with zero reviews, trust score 0, and frequently wrong specialty (gynecologic oncologists surfaced for endometriosis and birth-control queries). Every US persona (Maya, Linda, Destiny, Grace, Karen) hit this wall. Location is often detected and then ignored: Priya explicitly asked for London, the site detected "London, UK," and still ranked a Rotterdam practitioner above the one London match.

**"Empathy that writes a check the directory can't cash" is an active trust risk, not just a gap.** The AI promised "free or sliding-scale support" in fluent Spanish, then returned private Brussels and New York doctors with no cost data at all. For the dismissed, uninsured, non-English, and rural women the platform explicitly exists to serve, this *re-enacts the dismissal* it positions itself against. That is the single most dangerous pattern in the data.

**The thesis problem is unsolved: the women who need this most have no way to find it.** Every persona, without exception, said they would only land here via a shared link. There is no organic distribution loop, no SEO content, no presence in the subreddits, Facebook groups, TikTok creators, clinics, or community channels where these women actually are.

---

## 2. Top Problems (Ranked)

### P1 — Location detected but not honored; matches are unreachable (CRITICAL)
- **Who:** Every US persona (Maya, Linda, Destiny, Grace, Karen) and even the in-region UK persona (Priya). 6 of 10.
- **Evidence:** Priya's "near me in London" detected `location: London, UK`, `regionNote: null`, and ranked Rotterdam above the lone London match. Grace and Maya were never asked location and got all-Europe lists. Destiny got Netherlands/UK with no US results.
- **Fix:** Make location a hard ranking/filter signal, not a detected-then-discarded field. When no in-region match exists, fire a consistent, always-on `regionNote` and lead with telehealth-eligible providers licensed in the user's state/country. Never present unreachable providers as actionable.

### P2 — US supply is empty NPI shells with the wrong specialty (CRITICAL)
- **Who:** All US personas.
- **Evidence:** US results = bare NPI listings, 0 reviews, trust score 0, often gynecologic oncologists returned for endometriosis (Maya) and birth control (Grace). Linda's telehealth request returned `telehealth: false` on every US provider.
- **Fix:** This is a supply problem, not a code problem. Short term: stop intermixing zero-signal NPI listings with curated ones in result ranking, and filter NPI by actual specialty match. Medium term: a concentrated recruiting push (see §3) to seed real reviewed US practitioners in 1-2 beachhead specialties/metros rather than thin national coverage.

### P3 — Empathy promises the directory cannot keep (CRITICAL — trust integrity)
- **Who:** Destiny (uninsured), Fatima (Arabic, immigrant), the Spanish/Kansas equity test.
- **Evidence:** AI said "Let's find practitioners who offer free or sliding-scale support" then returned private European/NY doctors with no cost field anywhere. Spanish empathy → English-only NY providers.
- **Fix:** Constrain the system prompt so it never promises affordability, language match, or locality it cannot verify against real data. When the directory lacks it, say so plainly and route to external safety-net resources (FQHC/Title X finder, Planned Parenthood, NHS, regional equivalents).

### P4 — No cost / insurance / language / affordability dimension exists (HIGH)
- **Who:** Destiny, Fatima, Grace, the equity lens broadly.
- **Evidence:** No `accepts_uninsured`, `sliding_scale`, `accepts_medicaid`, or cost field in the schema. The `languages` field exists (e.g. Dr. Haddad: English/Dutch/Arabic) but the matcher ignores it for ranking and there is no language filter.
- **Fix:** Add a cost/access dimension to the practitioner schema and surface `languages` as a first-class match signal and visible filter. These are additive, not a rebuild.

### P5 — No way to contact or book the matched practitioner (HIGH/CRITICAL per Aisha)
- **Who:** Aisha (postpartum, lowest energy to chase), Maya, Rosa, the equity lens.
- **Evidence:** Profiles show "Online available" with no phone, email, or booking link in the browse flow. Phone numbers exist in the data (e.g. NPI `646-262-4763`) but are hidden on `/discover` and most cards.
- **Fix:** Surface phone / website / booking `tel:` action prominently on every card and result where data exists. Add a "no contact on file yet" state. This is low effort and immediately unblocks the highest-intent moment.

### P6 — Match results sorted by trust score, not relevance (HIGH)
- **Who:** Aisha (perfect match buried second behind a menopause specialist), Grace, Karen.
- **Evidence:** Aisha's ideal perinatal psychiatrist ranked below an unrelated menopause specialist; all scores tied at 86, suggesting score-first ordering.
- **Fix:** Rank by relevance-to-query first, trust score as tiebreaker. Show review count next to score so n=3 doesn't read as authoritative.

### P7 — Off-topic / nonsense queries manufacture false relevance (HIGH)
- **Who:** Karen (trust question misread as bladder concern), all edge cases.
- **Evidence:** "car repair," "asdfghjkl," and Karen's literal trust question all returned 6 practitioners under default "Bladder & Urogynaecology." The "no trusted match" UI exists in code but the API never returns an empty array.
- **Fix:** Add a genuine low-confidence / no-match path: below threshold, return empty `matchedCategories` and `practitioners` so the existing honest UI fires. Kill the silent catch-all category.

### P8 — Crisis CTA hardcodes US 911/988 regardless of location (CRITICAL safety)
- **Who:** Rosa (acute bleeding), any non-US user in crisis.
- **Evidence:** API text is region-aware (mentions 988, Samaritans 116 123) but the tappable button is `tel:911` "Call 911 (US)" and links findahelpline.com, even when the user states London. Rosa got "call your local emergency number" with no number and was never asked her country.
- **Fix:** Drive the emergency CTA from declared/detected region; if unknown, label neutrally ("Call your local emergency number") and present region-aware hotlines. Also omit the practitioner payload server-side when `emergency:true` (currently only hidden client-side).

### P9 — Excludes nonbinary/trans and privacy-anxious users (HIGH)
- **Who:** Sam.
- **Evidence:** Trans-affirming need reduced to "Sexual Health / Hormones"; no affirming tags; privacy ask silently dropped (`safetyNote: null`); entire site branded "what other women recommend," signaling Sam is outside the audience.
- **Fix:** Add affirming-care tags/filter backed by real signal, and a clear, upfront data-privacy statement on the results screen.

### P10 — Accessibility & plain-language barriers (MEDIUM, several HIGH)
- **Who:** Fatima (low literacy, mobile, Arabic), low-vision users.
- **Evidence:** English-only, no language toggle, `/es` 404s. Gold stars 2.44:1 and sage trust/"online available" labels 3.03-3.5:1 fail WCAG AA. Topic emojis unlabeled to screen readers; broken heading hierarchy on /discover; no skip link; clinical topic terms (Urogynaecology, PMDD) and free-text-only entry assume literacy.
- **Fix:** Darken gold/sage to AA, `aria-hidden` the emojis, add Spanish i18n first, add a tap-first plain-language symptom picker, lower the input floor.

---

## 3. Discoverability & Distribution Strategy

**The central truth from every persona: there is no organic reason this site crosses their path.** It is built as a destination with no outbound loop. Recommendations come in; nothing engineered goes out. Sequenced plays:

**Phase 1 — Make existing surfaces rank and travel (now)**
1. **SEO topic pages (med effort, high + compounding reach).** Turn each `/discover?topic=X` into 400-800 words of plain-language, medically-cautious content + FAQPage JSON-LD, practitioner grid below. This is the cheapest acquisition engine and matches how undiagnosed women actually search ("how to find an endometriosis specialist who listens"). 12 topics, one Opus pass + human check.
2. **Branded domain (low effort, med reach).** Move off `guud-network.vercel.app` to `network.guudwoman.com`, 301 the old URLs, set `NEXT_PUBLIC_SITE_URL`. A vercel.app link shared into a support group reads as throwaway on a sensitive health topic and splits SEO equity from the parent brand.
3. **Expand ShareButton + add sharing to results/topic pages (low effort, med reach).** Explicit WhatsApp, Messenger, Reddit, X targets (share-intent URLs, no SDKs) pre-filled with the empathetic framing the AI already produces. Today sharing only exists on the least-trafficked page (individual profiles).

**Phase 2 — Build the viral unit + capture lost demand (next)**
4. **Shareable practitioner card image (low effort, high reach).** A `/practitioners/[slug]/card` PNG (reuse existing ImageResponse infra) — name, specialty, trust score, one quote, "share to story." The natural viral artifact is "here's the woman who finally helped me" dropped into a support group.
5. **Capture unmet demand on the results screen (low-med effort, high reach).** When `regionNote` fires: "We don't have someone in {loc} yet — want us to email you when we do?" One opt-in email field. This recovers lost demand AND produces a heatmap telling you exactly where to recruit next.

**Phase 3 — Distributed network (strategic)**
6. **Read-only public API + /developers page (med effort, high reach).** `GET /api/v1/topics`, `/practitioners?topic=&country=`. Pitch one period/fertility app and one endometriosis/patient-advocacy nonprofit on surfacing trusted local specialists. Partner apps already hold the exact audience the brief says can't find this.
7. **Offline / referral channel (low-med effort, med-high reach).** Printable no-login QR referral card for clinics ("Looking for an endometriosis specialist? Scan this.") + `/for-clinicians` and `/for-employers` one-pagers. Reaches women who never type a search query — often the highest-trust touchpoint.

---

## 4. Equity & Reach

The platform currently serves English-speaking, online, urban/European, able-to-pay women, while claiming to serve those most dismissed by the system. To close the gap (mostly additive):

- **Stop the empathy-promise mismatch (P3).** Highest-priority equity fix. The Spanish and uninsured tests show the AI deepening harm by promising what it can't deliver.
- **Language as a match signal.** Use the existing `languages` field for ranking + filter; detect query language and prioritize, or flag "No Spanish-speaking practitioner near you yet." Ship Spanish UI i18n first (US Latina reach); the empathy engine already proves multilingual capability exists.
- **Seed a "Low-cost & free care" layer.** Even a curated static resources page per covered region (US FQHC/Title X, Planned Parenthood, teaching clinics; NHS and EU public services) reachable from the homepage immediately serves the uninsured. Add cost/access fields to the schema for real filtering.
- **Lower the literacy floor.** Tap-first symptom picker with plain-language labels alongside the text box; accept one-word/selected entries; plain-language aliases for clinical topic names.
- **Surface contact + an offline path.** Prominent `tel:` actions (work on basic phones); printable/SMS-able match summary so a user can act without a smartphone or staying online.
- **Be honest about coverage.** State which regions are covered up front; detect out-of-coverage locations and route to "recommend a local practitioner" + regional resources instead of foreign private doctors.
- **Add an affirming-care axis and a human fallback.** Tags/filters for LGBTQ/trans-affirming care; a Help/About page with a human contact channel and accessibility statement (all of /about, /help, /cost currently 404).

---

## 5. Roadmap: Quick Wins vs Strategic Bets

### Quick wins (ship this week — low effort, high leverage)
1. **Region-aware crisis CTA + omit practitioners server-side on `emergency:true`** (P8). Safety-critical, small change.
2. **Stop ranking zero-signal NPI shells alongside curated; filter NPI by specialty** (P2 short-term).
3. **Add the genuine no-match path; remove the "Bladder & Urogynaecology" silent default** (P7).
4. **Rank by relevance, trust as tiebreaker; show "based on N recommendations"** (P6, plus calibrates n=3 scores).
5. **Surface phone/booking `tel:` on every card and result** (P5).
6. **Constrain the system prompt to never promise affordability/language/locality it can't verify** (P3 immediate mitigation).
7. **Move to `network.guudwoman.com`; expand ShareButton channels** (distribution 2 & 3).
8. **A11y: darken gold/sage to WCAG AA, `aria-hidden` topic emojis, add skip link** (P10 fast subset).

### Strategic bets (sequenced over weeks/months)
1. **Fix the supply problem (P1/P2 core).** Concentrated practitioner recruiting in 1-2 beachhead specialties + metros (e.g. endometriosis + pelvic-floor in 2-3 US cities) to reach real reviewed density. Use the §3.5 demand heatmap to target. Without this, no UX fix matters for US users.
2. **SEO topic-page content engine + FAQ schema** (distribution 1) — the compounding organic loop.
3. **Cost/access + language data dimensions and filters; Spanish i18n; low-cost/free-care resource layer** (equity core).
4. **Shareable practitioner card + results-screen demand capture** (the viral unit + prioritization signal).
5. **Tap-first plain-language symptom picker + affirming-care tagging.**
6. **Read-only public API + first partner integration** (period/fertility app or advocacy nonprofit).

---

## 6. Method Caveat

These are 10 SSR-inspired synthetic personas (arxiv 2510.08338) at ~90% of human test-retest reliability in the source study — directional signal for prioritization, not ground truth; validate the top problems with real users before betting the roadmap on them.