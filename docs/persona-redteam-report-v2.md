# Persona Red-Team Report v2 (post-fixes) — The Guud Network

Re-run after shipping trust/location/safety/discoverability fixes. NOTE: 3 agents failed (socket errors) — 9 personas, 2 lenses; lower comparability vs v1.

| Dimension | v1 | v2 |
| --- | --- | --- |
| trust | 2.8 | 2.89 |
| usefulness | 2.5 | 2.22 |
| ease | 3.9 | 3.78 |
| matchRelevance | 2.1 | 2.11 |
| likelyToUse | 2.4 | 2.11 |
| likelyToRecommend | 2.5 | 2.11 |
| accessibilityForMe | 2.6 | 2.33 |

# The Guud Network — Persona Red-Team Synthesis & Action Report

## 1. Executive summary

Four hard truths, in order of importance:

1. **The product makes women feel seen, then cannot help them.** Across all 9 personas the empathy layer is consistently the single best-rated thing on the site, often the best they have encountered anywhere in healthcare. But it is followed by a list of practitioners none of them can actually reach. This "seen but not helped" gap is the defining failure, and emotionally it is worse than a cold site: it raises hope and then drops it. The two lowest Likert dimensions confirm it numerically — **matchRelevance (mean 2.11)** and **likelyToUse / likelyToRecommend (both 2.11)** are the floor, while **ease (3.78)** is the ceiling. The site is easy to use and accurate about *what* is wrong; it fails at connecting women to care they can use.

2. **Geography is broken at the core.** Every persona, including the European ones, was served the wrong location. US users (Maya/Chicago, Fatima, Linda/Montana, Destiny, Aisha, Grace) got an all-European list. Even Priya, who typed "near me in London," got Rotterdam, Antwerp, Amsterdam, Amsterdam, Berlin ranked first. Stated locations ("Chicago, Illinois, USA," "rural Montana") returned `location:null` and `regionNote:null` — the system neither parsed nor acknowledged where the user is. This single bug poisons usefulness, matchRelevance, likelyToUse, and likelyToRecommend simultaneously.

3. **"Trust-first" and "free and open for everyone" are partly contradicted by the live product.** The trust score (mean 2.89, the highest of the experience dimensions) is propped up entirely by the empathy and the curated reviews — but the only in-country (US) options are unvetted NPI-registry names with 0 reviews and trust score 0, shown next to curated 86-92 practitioners. And "free and open" refers to the *website*, not the *care*: there is zero cost, insurance, sliding-scale, or free-clinic data anywhere, which silently excludes the uninsured/low-income women the mission names first (Destiny, Fatima, Grace).

4. **Two populations are not just underserved but actively mis-served.** Sam (nonbinary) had an explicit affirming-care + privacy request reinterpreted as "Sexual Health / Hormones" with an empty safety note — the "women" framing told them the product is not for them. Rosa (acute hemorrhage) got the correct emergency warning *and* a non-urgent shopping list in the same breath, which is a safety risk. These are correctness failures, not polish gaps.

**accessibilityForMe (mean 2.33, min 1)** is the dimension that most directly measures "can this reach me," and it is near the floor — the equity mission is, today, aspirational.

---

## 2. Top problems (ranked)

### P1 — Location matching is non-functional (CRITICAL)
- **Who:** Every persona. Universal.
- **Evidence:** `location:null` / `regionNote:null` even when users typed "Chicago, Illinois, USA" or "rural Montana." Priya's explicit "near me in London" ranked five foreign cities above the one London provider. Homepage advertises "7 Countries" and a US NPI registry, yet US searches surface zero usable US providers.
- **Fix:** Parse location from free text and the location field; rank by geographic reachability (in-person near user → telehealth-to-user → out-of-region). When no local match exists, say so honestly in `regionNote` ("We don't yet have in-person providers near you; here are telehealth options / here's how to find local care") instead of silently serving another continent.

### P2 — Matched but unreachable: no contact, booking, cost, or next step (CRITICAL)
- **Who:** Fatima, Aisha, Grace, Destiny, Maya — anyone who found someone they'd trust.
- **Evidence:** Aisha found the right perinatal psychiatrist and hit a dead end — the profile only lets you *leave* a recommendation, no contact/book button. Equity lens confirms profiles show "Contact & Cost Information: Not provided." For a crisis user this dead end "is its own kind of cruel."
- **Fix:** Add structured contact/next-step data (how to book, phone, address, accepting-new status, expected cost range) as first-class profile fields. Even "here's how to reach this practice" beats a wall.

### P3 — Affordability and crisis signals are ignored (CRITICAL)
- **Who:** Destiny (uninsured), Fatima, Grace, Aisha (cost-anxious); Rosa (acute crisis).
- **Evidence:** Destiny led with "no insurance" and got a list of expensive specialists in other countries — "it heard my pain but not my wallet." Rosa, bleeding through a pad an hour, got the correct ER warning *immediately undercut* by a non-urgent doctor directory. No sliding-scale, FQHC, Planned Parenthood, or 988/112/911 region-specific guidance exists.
- **Fix:** Detect affordability and crisis signals in the input and branch the response. Crisis → suppress/subordinate the directory, surface a region-specific "call now" action. Affordability → surface free/low-cost/community-health-center options first and a financial-assistance block.

### P4 — Intent gets dropped or mis-mapped (HIGH)
- **Who:** Grace (birth control → fertility/menopause/thyroid), Sam (affirming care → Sexual Health/Hormones), Aisha (postpartum → IVF specialist ranked #1).
- **Evidence:** Grace typed "birth control" and not one match covered contraception. Sam's identity request was reinterpreted and no provider was tagged affirming. Aisha's results sorted by trust score, not relevance, putting a not-accepting-patients IVF doctor above the one perinatal psychiatrist who fit.
- **Fix:** Add contraception and gender-affirming-care as explicit categories with tagged providers; rank by relevance-to-query first, trust score second; never surface `acceptingNew:false` providers at the top.

### P5 — Trust integrity undercut by mixing curated and unvetted listings (HIGH)
- **Who:** Destiny, Rosa, Grace, Priya, Maya.
- **Evidence:** The only US options are NPI-registry names with 0 reviews, trust score 0, and a badge admitting "not vetted or endorsed by Guud," shown in the same list as curated 86-92 practitioners. Directly contradicts "practitioners women actually recommend." Curated providers also carry no verifiable credential/NPI/registration (Priya can't confirm HCPC/GMC).
- **Fix:** Visually and structurally separate "community-recommended" from "registry listing — not yet vetted." Add verifiable credential/registration fields and links. Explain how the trust score is computed.

### P6 — English-only excludes non-English speakers (HIGH)
- **Who:** Fatima (Arabic), and the broader Spanish-speaking US population per equity lens.
- **Evidence:** `<html lang="en">`, no switcher, category names like "Endometriosis" meaningless to low-literacy users. Cruelly, the one Arabic-speaking provider (Dr. Haddad) is in Rotterdam — a language match the user can never reach.
- **Fix:** Add a language switcher (Spanish first given US demographics, then Arabic); make the matcher language-agnostic (Claude can match a Spanish/Arabic query); add "languages spoken" as structured, filterable data.

### P7 — Identity exclusion and privacy silence for LGBTQ+ users (HIGH)
- **Who:** Sam and any trans/nonbinary user.
- **Evidence:** Empty safety note on an explicit privacy ask; no pronoun/inclusivity fields; "women"-only framing throughout; Claude review-checking disclosed only deep on the page, increasing data anxiety.
- **Fix:** Add affirming-care and inclusivity/pronoun fields to profiles; answer privacy/data-handling questions upfront in the match response; broaden framing where the mission allows ("women and people who need women's health care").

### P8 — Geographic and review-volume bias bakes in inequity (MEDIUM)
- **Who:** Rural (Linda), low-resource, underserved-community users.
- **Evidence:** All providers are in affluent metros; "No rural or small-town practitioners appear." Ranking by review volume demotes safety-net providers whose patients don't leave written reviews.
- **Fix:** Treat telehealth as the rural equalizer (never dead-end an empty local result); seed FQHCs/rural telehealth; add an equity-aware surfacing boost for sliding-scale/care-desert providers regardless of review count.

---

## 3. Discoverability & distribution strategy

**The central truth from every persona's "discoverability" answer is identical: none of them would ever find this on their own.** They find help at 2am Google searches, Reddit (r/endo, r/PCOS), Facebook/Arabic-language groups, TikTok, mosque/church/community health workers, and friend referrals. The GitHub "open source" nav link actively signals "tech project, not for me" to Maya, Linda, Aisha, and Grace. The site is built as a destination, not a distribution machine. Plays, sequenced by reach-per-effort:

| # | Play | Effort | Reach | Why now |
|---|------|--------|-------|---------|
| 1 | **JSON-LD schema** (Physician + AggregateRating + Review from real reviews only) on practitioner + topic pages | Low | High | Data is already rendered; unlocks SERP star ratings and AI-overview citations at peak intent. Do first. |
| 2 | **Promote topic pages to clean paths** (`/topics/endometriosis`) with 300-500 words plain-language editorial + FAQ + canonicals | Med | High | The only content that can rank for the condition queries women actually type. Compounding organic entry points. |
| 3 | **Branded "trust cards" + share buttons on topic pages and match results** (not just profiles) | Low | Med | Peer-to-peer sharing in Reddit/FB condition groups is literally how dismissed women find help. Capture the emotional peak moment. |
| 4 | **Embeddable widget + public read-only CORS API** ("Powered by The Guud Network") | Med-High | High | Puts the network inside fertility/period apps and nonprofit sites where women already are. |
| 5 | **Four partner landing pages** (`/for-practitioners` claim-profile, `/for-clinics` QR referral card, `/partners` for Endometriosis UK / PCOS / menopause charities, `/for-employers`) | Low-Med | Med-High | Each is a B2B2C wedge; advocacy nonprofits and clinics are the natural referral funnel. All four currently 404. |
| 6 | **Package self-hosting as a growth channel** ("Run it for your city" + Deploy button + community-instance directory) | Med | Med | The MIT/self-hostable nature is the single most underused lever; each fork is a regional acquisition surface. |
| 7 | **Privacy-respecting aggregate analytics + UTM passthrough** | Low | Low (but prerequisite) | Today every growth effort flies blind; needed to prioritize all of the above. |

---

## 4. Equity & reach

The mission names uninsured, low-income, rural, non-English, low-digital-literacy, and crisis users first — and the live product reaches them worst (`accessibilityForMe` min = 1). Concrete moves:

- **Affordability as first-class data + filter:** sliding-scale, accepts Medicaid/public insurance, free clinic / FQHC, telehealth. Seed FQHCs, Planned Parenthood, charitable clinics. At minimum, fix the "free and open for everyone" copy so it doesn't imply the *care* is free.
- **Crisis + financial branching in the match flow** (see P3): region-specific crisis resources (988/112/911) surfaced visibly, not buried in a footer.
- **Telehealth as the rural equalizer:** when no local provider exists, explicitly surface telehealth-capable / out-of-region providers labeled as such — never return nothing to a rural user.
- **Localization:** Spanish first, then Arabic; language-agnostic matching; "languages spoken" as structured, filterable data so a match is one the user can actually reach.
- **Low-literacy on-ramp:** large tappable topic tiles + simple symptom picker as a *co-equal* entry point to the free-text box; strip "Powered by Claude Opus 4.8 / falls back to keyword matching" jargon from user-facing copy.
- **Equity-aware ranking:** boost sliding-scale / FQHC / care-desert providers regardless of review count; separate "community-recommended" from "serves your area / accepts your coverage."
- **Accessibility data:** wheelchair access, interpreter/ASL availability as structured fields; run a WCAG 2.2 AA audit on the search-and-results flow.

---

## 5. Roadmap: Quick wins vs Strategic bets

### Quick wins (ship this week) — high-impact, low-effort
1. **Fix location parsing + add an honest `regionNote`.** Stop silently serving another continent. If you have no one near a user, say so. This is the single highest-leverage fix and addresses P1 for all 9 personas.
2. **Inject JSON-LD schema** on practitioner/topic pages (data already rendered). Distribution play #1.
3. **Visually separate unvetted NPI listings from curated ones** and stop showing 0-trust registry entries alongside 86-92 curated providers. Fixes the most direct contradiction of the trust promise (P5).
4. **Suppress/subordinate the directory in crisis mode** and surface a "call now" action. Removes the Rosa safety risk (P3).
5. **Stop ranking `acceptingNew:false` and off-intent providers at the top;** rank relevance before trust score. Fixes Aisha's and Grace's experience (P4).
6. **Fix the "free and open for everyone" copy** to not imply free care; strip model/tech jargon from user-facing surfaces.
7. **Add share buttons + branded trust cards to topic pages and match results.** Distribution play #3.

### Strategic bets (sequenced)
1. **Seed real US (and other in-region) curated providers, prioritizing FQHCs / sliding-scale / Planned Parenthood.** Nothing else matters until a US woman gets a usable result. This is the root cause behind the lowest Likert scores.
2. **Add contact/booking/cost/insurance as first-class profile data** (P2) — turns "matched" into "appointment."
3. **Affordability + crisis branching in the matcher** (P3, P4) and contraception + affirming-care categories with tagged providers + privacy answer upfront (P4, P7).
4. **Localization** (Spanish → Arabic) + structured "languages spoken" + low-literacy guided entry (P6).
5. **Clean topic-page paths with editorial + FAQ** (distribution #2) and **partner landing pages** (#5).
6. **Embeddable widget + public API** (#4) and **self-host-as-channel** (#6).
7. **Privacy-respecting analytics** (#7) — instrument early so you can measure all of the above.

**The throughline:** the empathy already works. Every strategic bet is about making the *result* as trustworthy and reachable as the *greeting* — and putting it where these women already are.

---

## 6. Method caveat

These are SSR-inspired synthetic personas (arxiv 2510.08338), directional signal at roughly 90% of human test-retest reliability in the source study — useful for surfacing and prioritizing friction, but not a substitute for testing with real women in each target population before shipping.