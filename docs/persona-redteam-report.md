# Persona Red-Team Report — The Guud Network

SSR-inspired (arxiv 2510.08338) persona panel + expert lenses against the live site. 10 personas, 4 lenses.

## Likert distribution (1-5, across 10 personas)

| Dimension | Mean | Min | Max |
| --- | --- | --- | --- |
| trust | 2.8 | 2 | 4 |
| usefulness | 2.5 | 2 | 3 |
| ease | 3.9 | 3 | 4 |
| matchRelevance | 2.1 | 1 | 3 |
| likelyToUse | 2.4 | 2 | 3 |
| likelyToRecommend | 2.5 | 2 | 3 |
| accessibilityForMe | 2.6 | 1 | 4 |

Goal accomplishment across personas: {'partial': 5, 'no': 5}

# The Guud Network — Persona Red-Team Synthesis & Action Report

## 1. Executive summary

Four truths dominate this red-team, and they are consistent across every persona and every expert lens.

**1. The empathy layer is the product's superpower; the matching layer is its liability.** Every single persona, without exception, was moved by the opening empathy copy. Maya ("your instinct is valid... that got me"), Aisha ("my eyes sting a little at 4am"), Rosa in crisis ("the most useful thing on the whole site"). This is rare and defensible. But the moment users scrolled to actual matches, the experience collapsed. The lowest Likert dimensions tell the story precisely: **matchRelevance 2.1** (lowest, with a floor of 1) and **likelyToUse 2.4** are the failure core. Ease scores **3.9** (the only dimension that clears the midpoint) — the site is pleasant to use; it just doesn't deliver the right people. We make women feel seen, then hand them someone they cannot reach.

**2. Location-blindness is the single highest-impact defect.** It is the only friction flagged by all 10 personas and 3 of 4 lenses, and it is rated critical 6+ times. The platform never asks where the user lives and ranks telehealth practitioners in other countries above the one local option. A US uninsured woman in pain, a rural Montanan, a London PCOS patient, and a 19-year-old wanting birth control were all shown Amsterdam/Rotterdam/Milan first. This one gap explains most of the matchRelevance 2.1 and is the cheapest big win available.

**3. The trust architecture actively contradicts the brand promise.** This is a trust-first platform whose headline trust score (86) and star rating (4.7) on real, named NPI doctors are computed 100% from reviews the system itself flags `synthetic:true`. The skeptic persona (Karen) and the clinical-safety lens converge exactly: the per-review "Sample" labeling is honest and admirable, but the aggregate number a user's eye lands on first is fabricated. **Trust scored 2.8** — and the people who looked closest (Maya, Karen) trusted least. Honest labeling at the review level + dishonest math at the headline level is worse than either alone.

**4. Nobody can find this, and it is built so it cannot be passed along.** Every persona said the same: "I would never have found this on my own." There is no robots.txt, no sitemap, no per-page metadata, no OG tags, no share button. The product's entire thesis is word-of-mouth, yet it is technically un-shareable and un-crawlable. The GitHub/"open source" framing in the header actively repels the target user (reads as "for devs, not for me").

The net: a beautifully empathetic front door opening onto a directory that doesn't know where you live, can't prove its recommendations are real, and can't be found or shared.

## 2. Top problems (ranked)

### P1 — No location awareness in matching (CRITICAL)
- **Who:** All 10 personas. Acute for US users (Maya, Fatima, Linda, Destiny, Aisha, Grace) shown European practitioners they can never reach.
- **Evidence:** No location input on the form; `/api/match` unions by topic and sorts by trust only (route.ts), never considering geography. Clinical lens confirmed a stated "rural Kenya" user got Utrecht + London + New York in-person-only providers. matchRelevance mean 2.1, min 1.
- **Fix:** Add a country/city field (or geo-infer) to the intake; pass location into match ranking; surface a local-first vs telehealth toggle. When no in-region match exists, say so plainly instead of dumping the global default list.

### P2 — Synthetic reviews inflate the headline trust score on real, named doctors (CRITICAL)
- **Who:** The closest readers (Maya, Karen, Destiny, Priya, Rosa). Erodes the exact users the brand is built for — those burned before.
- **Evidence:** Dr. Divya Ajay (real NPI 1396001053) shows "86 trust" and "4.7 · 3" derived entirely from `synthetic:true, verified:false` reviews; the "Sample" caveat is a 10px badge with explanation hidden in a hover title invisible on touch.
- **Fix:** Exclude synthetic reviews from all displayed trust scores and star averages. Directory doctors with no real reviews should read "No real recommendations yet" — not 86/4.7. Move the "illustrative sample" notice into visible body text. This is the single most important trust fix and it is low effort.

### P3 — Cross-border telehealth is presented as actionable when it legally isn't (HIGH)
- **Who:** Linda (Montana), Priya (London), Aisha (postpartum). 
- **Evidence:** Foreign-licensed practitioners flagged `telehealth:true` with no disclosure that a Belgium- or Netherlands-licensed clinician cannot prescribe or order labs for a US/UK patient. Linda: "a doctor licensed in Belgium can't write me a prescription here."
- **Fix:** Show licensing jurisdiction prominently. Only mark telehealth as usable when the practitioner can legally treat in the user's region. State the trade-off explicitly on the card.

### P4 — Ranking ignores fit: wrong specialty and not-accepting-patients ranked first (HIGH)
- **Who:** Aisha (postpartum-depression query led with a not-accepting IVF specialist; the perfect perinatal psychiatrist buried 4th), Grace (birth-control query led with a fertility endocrinologist), Linda (menopause query guessed thyroid + PMDD).
- **Evidence:** Pure trust-score sort with no fit/availability weighting; `acceptingNew:false` practitioners surface at the top. "A person in crisis will not scroll past wrong answers."
- **Fix:** Rank by fit-to-stated-need, filter out not-accepting-new, and demote loosely-adjacent categories. Stop "inventing" concerns the user never raised.

### P5 — No cost/insurance/affordability concept anywhere (CRITICAL for equity)
- **Who:** Destiny (uninsured, said it twice), Fatima (Medicaid/immigrant), Grace (broke student). The exact women the system failed elsewhere.
- **Evidence:** Schema has no cost, insurance, sliding-scale, or free-clinic field. Empathy text promises "care shouldn't depend on insurance," then results ignore it entirely.
- **Fix:** Add `costTier` (free/public, insurance-accepted, sliding-scale, private-pay), `acceptsInsurance`/`acceptsPublicCoverage`, and an affordability filter + badge. Seed public/community-health options so the "most trusted" rail is never 100% private-pay.

### P6 — English-only, despite matching multilingual practitioners (CRITICAL for equity)
- **Who:** Fatima (Arabic, limited English) — the cruelest miss: the system found her an Arabic-speaking doctor she then couldn't read about, across an ocean.
- **Evidence:** Hardcoded `lang="en"`, no switcher, no i18n. NPI imports hardcode `languages:["English"]` regardless of reality. No language filter in match.
- **Fix:** The match model is multilingual — detect input language and respond in it (low cost). Add a language switcher and a "speaks my language" filter. Stop fabricating English-only on NPI imports.

### P7 — Identity collapse for non-cis users (CRITICAL for the affected user)
- **Who:** Sam (nonbinary). "Trans and nonbinary affirming" was silently reduced to "Sexual Health" with zero affirming-care evidence; women-only copy throughout undercut the AI's inclusive promise.
- **Evidence:** matchedCategories dropped the identity term; returned practitioner had no LGBTQ+ credentials; "recommended by women" copy site-wide.
- **Fix:** Add an explicit, filterable affirming-care tag backed by real signal. Stop promising "respects your identity" in empathy copy you can't back in data — unbacked warmth erodes trust more than silence.

### P8 — Emergency handling is strong in words, weak in action (HIGH)
- **Who:** Rosa (actively hemorrhaging). Got excellent crisis copy but: no actual emergency number, no tap-to-call, and a full list of long-term practitioners (a dietitian, a coach) stacked below the "go to the ER now" message.
- **Evidence:** safetyNote says "call your local emergency number" with no number; practitioner list still renders under emergency severity; crisis lines are US/UK-only.
- **Fix:** For emergency-severity safetyNotes, suppress the practitioner list (or gate behind "I'm safe, show practitioners"), provide a region-aware number + one-tap call, and localize crisis lines (or link findahelpline.com).

### P9 — No path to act on a match (HIGH)
- **Who:** Linda, Aisha, Grace. Profiles often have null phone, no booking link, no address.
- **Fix:** Ensure every profile has at minimum a verified contact method or an honest "contact info not available" state. Don't assert `acceptingNew:true` on auto-imported NPI records.

### P10 — "Verified" and "Curated" are unexplained (MEDIUM, trust-corrosive)
- **Who:** Linda, Karen, Grace, Aisha. "Verified by the Guud team — verified how, by whom?"
- **Fix:** Reword to "Listed in public U.S. NPI registry — not vetted or endorsed by Guud." Add a one-line, inspectable explanation of the trust score and what "verified" confirms.

### P11 — AI gives definitive clinical verdicts (HIGH, safety)
- **Evidence:** "For an 8-year-old, not having started her period is completely normal — no cause for worry." That is diagnostic advice contradicting the footer disclaimer.
- **Fix:** Constrain empathy generation to validation + triage, never normal/abnormal verdicts. Surface "Not medical advice" inline with every AI response.

### P12 — Accessibility barriers for the exact audience (HIGH)
- **Evidence:** Unlabeled search textarea (the entire flow starts here); placeholder contrast 2.81:1, gold 2.26:1; copy at grade 8–22 with unglossed jargon (Urogynaecology, PMDD, IBCLC); no skip link; submit button ships disabled with no explanation.
- **Fix:** Add a real label, fix contrast tokens, lead categories with plain-language symptoms (clinical term second), add a skip link, and keep the submit button enabled with inline hints.

## 3. Discoverability & distribution strategy

This is the central question, and the honest finding is brutal: **the product cannot currently be found by search engines or passed along by users.** Every persona would only arrive via a human sending a link — yet there is no robots.txt, no sitemap, no per-page metadata, no OG tags, and no share button. Plays sequenced by reach-per-effort:

**Phase 1 — Make it crawlable and shareable (this week, LOW effort, HIGH reach)**
1. **Sitemap + robots.txt** (LOW / HIGH). Add `app/sitemap.ts` enumerating all ~412 practitioner slugs + 12 topic pages, and `app/robots.ts`. Submit to Google Search Console + Bing. Unlocks the single largest free channel: long-tail searches like "endometriosis specialist who listens [city]."
2. **Per-page metadata** (LOW-MED / HIGH). Add `generateMetadata` to practitioner and topic pages so each renders its own name/city/specialty title + description. Add Physician/MedicalBusiness JSON-LD. Turns 400+ pages into individually-ranking landing pages instead of one duplicated blurb.
3. **Share affordances** (LOW / HIGH). Add a "Share this practitioner" control (Web Share API + copy-link + prefilled WhatsApp/SMS) on every profile and on match results. After a recommendation is submitted: "Share Dr. X with someone who needs her." This converts a passive directory into the referral engine the thesis requires.
4. **OG images** (MED / HIGH). Dynamic `opengraph-image.tsx` rendering name/specialty/city on-brand, so links shared in DMs, Reddit, and support groups preview compellingly.

**Phase 2 — Meet women where they actually are (MED effort, HIGH but slower reach)**
Every persona named the same real channels: Reddit (r/endometriosis, r/PCOS, r/PPD, r/asktransgender), Facebook/Discord support groups, Nancy's Nook, TikTok creators, campus health centers, community health workers, trusted newsletters. Plays:
5. **SEO topic pages** (MED / HIGH). Expand each of 12 topics from one sentence to a 300–600 word safety-reviewed intro + FAQPage JSON-LD; give them clean URLs (`/topics/endometriosis` not `?topic=`). These capture "where do I even find the right help" searches.
6. **Embeddable widget + documented public match API** (MED / HIGH). Productize the existing `/api/match` as a copy-paste widget for period/fertility apps, endo/PCOS/menopause nonprofits, and clinic sites. This is the open-source growth multiplier — partners distribute the network for you.
7. **Community seeding** (LOW ongoing / MED). Get vouched mentions in the named communities. Discoverability is near-zero until a trusted human in those spaces links it — so earn those links deliberately.

**Phase 3 — Durable institutional channels (MED-HIGH effort, HIGH durable reach)**
8. **`/partners` page** with three plays: co-branded topic pages + widget for advocacy nonprofits; "refer a patient" shareable link/QR for GPs and clinics; an employer-benefits one-pager. Add bulk CSV import (you already ingest NPI) so partners seed their own practitioners.
9. **Practitioner "claim profile" loop** + **"notify me" email capture** on zero-result searches. Claimed practitioners share their own Guud page (free supply-side distribution); email capture recovers leaked demand and signals where to seed next.

**De-emphasize:** the "open source / GitHub" header framing for the patient-facing experience — every persona read it as "not for me." Keep it discoverable for contributors, but it should not be a primary nav item competing for a scared user's attention.

## 4. Equity & reach

The platform currently best serves women who are already best served: English-speaking, digitally fluent, urban, insured, not in crisis. To reach those who need it most:

- **Affordability as a first-class signal (P5).** Cost tier + insurance + sliding-scale fields and filter. Seed public/community/free-clinic options per topic so the trusted rail is never all private-pay. Detect affordability cues in the user's words and prefer lower-cost matches.
- **Language (P6).** Lean on the multilingual model: accept and respond in the user's language; add a switcher and a "speaks my language" filter; stop hardcoding English on NPI imports. This unlocks entire excluded populations at low cost.
- **A non-typing path (HIGH).** The sole entry point is a prose essay box assuming literacy, English, and comfort writing intimate symptoms. Add a co-primary tap-friendly symptom/topic picker (use existing emojis as visual anchors) and voice input. Lower the floor.
- **Rural + telehealth (P3).** Add location and "online available" filters; boost legitimately-licensed telehealth when no in-person match exists nearby. Make telehealth a prominent, honest, jurisdiction-aware badge.
- **Don't entrench incumbents.** Pure trust-by-volume sort buries low-review providers — likely the ones serving immigrant and marginalized communities in non-English reviews. Offer user-weighted sorts (closest / speaks my language / most affordable / accepting new) and a fair-exposure slot for new providers. Accept reviews in any language (the LLM already moderates).
- **Honest coverage expectations.** The site advertises "7 countries" but all are high-income Western. When there's no local match, the empty state should offer concrete alternatives (telehealth, public hotlines, "recommend a local provider") instead of "check back soon."
- **Always-on, localized crisis resources (P8).** Make safety guidance persistent on mental-health pages, not LLM-conditional, with region-aware helplines.

## 5. Quick wins vs strategic bets

### Quick wins — ship this week (all LOW effort, HIGH leverage)
1. **Exclude synthetic reviews from displayed trust scores and star ratings** (P2). Show "No real recommendations yet" for directory doctors. The most important trust fix, near-trivial.
2. **Add a location field to the intake and pass it into ranking** (P1). The single biggest matchRelevance lever.
3. **Sitemap.ts + robots.ts** (distribution #1). A few hours; unlocks organic search.
4. **Share button on every profile** (distribution #3). Activates the word-of-mouth thesis.
5. **Label the search textarea + fix placeholder contrast + keep submit enabled with inline hint** (P12). 
6. **Reword "Verified directory"** to "Listed in public NPI registry — not vetted by Guud" and remove unsupported `acceptingNew:true` (P10).
7. **Add a region-aware emergency number + one-tap call; suppress the practitioner list under emergency-severity notes** (P8).
8. **Constrain AI from definitive clinical verdicts; surface "Not medical advice" inline** (P11).

### Strategic bets (MED–HIGH, sequenced)
1. **Fit-aware ranking** — filter not-accepting-new, rank by need-fit not just trust, demote loose adjacencies, never lead with a fertility specialist for a postpartum or birth-control query (P4). *(MED)*
2. **Affordability data model + filter** (P5). *(MED)*
3. **Per-page metadata + OG images + SEO topic pages** (distribution #2, #4, #5). *(MED)*
4. **Multilingual intake/response + language filter** (P6). *(MED)*
5. **Cross-border licensing honesty in telehealth labeling** (P3). *(MED)*
6. **Affirming-care tagging + de-gender the universal copy where it contradicts inclusive promises** (P7). *(MED)*
7. **Embeddable widget + documented public API + `/partners` surface + claim-profile loop** (distribution #6–9). *(MED-HIGH, the durable growth engine)*

The throughline: ship the trust and location fixes first (they cost little and address the lowest Likert scores directly), make the product crawlable and shareable in the same week, then invest in fit-aware matching, affordability, language, and partner distribution as the strategic core.

## 6. Method caveat

These are SSR-inspired synthetic personas (arxiv 2510.08338), directional signal at roughly 90% of human test-retest reliability in the source study — useful for surfacing and ranking failure modes, but not ground truth; validate the top fixes (especially trust-score perception and location relevance) with real users before betting heavily.