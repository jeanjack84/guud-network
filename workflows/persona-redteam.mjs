export const meta = {
  name: "persona-redteam-guud-network",
  description:
    "SSR-inspired persona panel + expert lenses that stress-test the live Guud Network to find where it breaks and how to make it discoverable",
  whenToUse:
    "To find real user friction, safety/equity gaps, and distribution strategy before investing further.",
  phases: [
    { title: "Personas", detail: "diverse simulated users each exercise the live site, then SSR-rate it" },
    { title: "Lenses", detail: "expert audits: accessibility, clinical safety, distribution, equity" },
    { title: "Synthesize", detail: "aggregate Likert distributions + prioritized problems + discoverability roadmap" },
  ],
};

const baseUrl =
  (typeof args === "string" ? args : args?.baseUrl) ??
  "https://guud-network.vercel.app";

// Method note shared with every persona — the SSR approach from
// arxiv 2510.08338 (Maier et al.): react in your own voice FIRST, then map to Likert.
const SSR = `Method: First write your honest, in-character reaction to what you actually experienced. THEN map each rating to an integer 1-5 grounded in that reaction (1 = strongly negative, 3 = neutral, 5 = strongly positive). Do not inflate. If you would abandon the site, say so and rate accordingly.`;

const HOWTO = (voice) => `You are using the LIVE product. Ground everything ONLY in what you actually observe — do not imagine features.
- Fetch the homepage: run Bash \`curl -s ${baseUrl}/ | head -c 4000\`
- Try the core feature in YOUR OWN WORDS: run Bash \`curl -s -X POST ${baseUrl}/api/match -H 'Content-Type: application/json' -d '{"query":"${voice}"}'\` and read the JSON (empathy, matchedCategories, safetyNote, practitioners[].name/title/city/source/trust).
- Open one matched practitioner: take a slug from the JSON and run Bash \`curl -s ${baseUrl}/practitioners/<slug> | head -c 4000\`.
- Then judge whether you actually got what you needed.`;

const PERSONA_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["persona", "goalAccomplished", "narrative", "ratings", "frictions", "discoverability", "topUnmetNeed"],
  properties: {
    persona: { type: "string" },
    goalAccomplished: { enum: ["yes", "partial", "no"] },
    narrative: { type: "string", description: "Rich first-person account of the actual experience, in character." },
    ratings: {
      type: "object",
      additionalProperties: false,
      required: ["trust", "usefulness", "ease", "matchRelevance", "likelyToUse", "likelyToRecommend", "accessibilityForMe"],
      properties: {
        trust: { type: "integer", minimum: 1, maximum: 5 },
        usefulness: { type: "integer", minimum: 1, maximum: 5 },
        ease: { type: "integer", minimum: 1, maximum: 5 },
        matchRelevance: { type: "integer", minimum: 1, maximum: 5 },
        likelyToUse: { type: "integer", minimum: 1, maximum: 5 },
        likelyToRecommend: { type: "integer", minimum: 1, maximum: 5 },
        accessibilityForMe: { type: "integer", minimum: 1, maximum: 5 },
      },
    },
    frictions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["issue", "severity", "where"],
        properties: {
          issue: { type: "string" },
          severity: { enum: ["critical", "high", "medium", "low"] },
          where: { type: "string" },
        },
      },
    },
    discoverability: { type: "string", description: "Honestly: how would someone like you have found this platform in the first place? Would you have?" },
    topUnmetNeed: { type: "string" },
  },
};

const PERSONAS = [
  { name: "Maya, 34 — endometriosis, dismissed for 7 years (US, motivated)", voice: "ive had crushing pelvic pain for years and three doctors told me its normal, i think its endometriosis and i need someone who will actually take me seriously" },
  { name: "Fatima, 41 — Arabic first language, limited English, new immigrant, mobile-only, low health literacy (US)", voice: "i have much pain when bleeding every month and feeling tired, i dont know what doctor i need please help" },
  { name: "Linda, 58 — perimenopause, rural Montana, low tech comfort, desktop", voice: "night sweats and i cant sleep or think straight and the nearest town is far, who can help with the change" },
  { name: "Priya, 29 — PCOS, lives in London UK (geographic mismatch test)", voice: "i have PCOS and irregular periods and want a good specialist near me in London" },
  { name: "Sam, 26 — nonbinary, seeking affirming gynae care, privacy-anxious", voice: "i need a gynecologist who is respectful of trans and nonbinary patients and i dont want my data shared, somewhere i feel safe" },
  { name: "Destiny, 23 — uninsured, low income, sharp pelvic pain, distrusts the medical system (US)", voice: "i have no insurance and bad pain down there, i dont trust doctors they never listen to people like me, where can i actually go" },
  { name: "Aisha, 31 — postpartum depression & anxiety, sleep-deprived new mom (mental health coverage test)", voice: "i had my baby 2 months ago and i cant stop crying and feel panicked all the time and scared to tell anyone" },
  { name: "Karen, 47 — skeptic, distrusts online reviews, vets the source (will scrutinize Sample labels)", voice: "im skeptical of review sites, how do i know these recommendations are real and not fake or paid" },
  { name: "Rosa, 39 — acute crisis: heavy bleeding with dizziness right now (safety-net test)", voice: "im bleeding very heavily soaking a pad every hour and feel dizzy and faint right now what do i do" },
  { name: "Grace, 19 — college student, TikTok-native, arrived from a shared link, mobile-first (discoverability test)", voice: "saw a link about finding a gyno you can trust, im 19 and need birth control help and someone chill who wont judge me" },
];

const LENS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["lens", "findings", "summary"],
  properties: {
    lens: { type: "string" },
    findings: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["issue", "severity", "evidence", "recommendation"],
        properties: {
          issue: { type: "string" },
          severity: { enum: ["critical", "high", "medium", "low"] },
          evidence: { type: "string", description: "What you actually observed on the live site." },
          recommendation: { type: "string" },
        },
      },
    },
    summary: { type: "string" },
  },
};

const LENSES = [
  {
    key: "accessibility",
    title: "Accessibility & plain-language",
    brief: `Audit ${baseUrl} for accessibility & literacy barriers. Consider: reading level of copy (is it understandable at a 6th-grade level?), non-English speakers, screen-reader/semantics (curl the HTML and inspect headings/alt/labels/lang), color contrast of the brand palette, mobile usability, cognitive load for someone in distress. Fetch the homepage HTML and the match JSON.`,
  },
  {
    key: "clinical-safety",
    title: "Clinical safety & trust",
    brief: `Audit ${baseUrl} for clinical-safety and trust risks. Test the emergency safety net: Bash \`curl -s -X POST ${baseUrl}/api/match -H 'Content-Type: application/json' -d '{"query":"severe chest pain and trouble breathing right now"}'\` and a self-harm phrasing. Check: is "not medical advice" clear; are the illustrative "Sample" reviews honestly labelled on real named providers (open a /practitioners/<slug> page for an npi-source provider); geographic mismatch (a non-US user getting US-only providers); risk of false trust; what happens with a concern that has no good match.`,
  },
  {
    key: "distribution",
    title: "Distribution & discoverability",
    brief: `The hardest problem: the women who need this most don't know it exists. Propose a concrete distribution strategy. Where are these women already (communities, apps, search, clinicians, advocacy orgs, social), and what is the specific integration/growth play for each (e.g. embeddable widget, public API, shareable practitioner cards, SEO topic pages, partnerships with period/fertility apps or patient-advocacy nonprofits, GP/clinic referral, employer benefits)? For each finding, 'recommendation' must be a concrete play and note rough effort (low/med/high) and reach. Look at the live site to judge what's share-ready or embeddable today.`,
  },
  {
    key: "equity",
    title: "Equity & reach-those-who-need-it-most",
    brief: `Who is structurally excluded from ${baseUrl} as it stands, and how do we reach the people who need it most (low income, uninsured, rural, non-English, low digital literacy, disabled, marginalized communities, those failed/dismissed by the system)? Identify equity gaps you can actually observe and concrete ways to close them.`,
  },
];

// ── Phase 1+2: personas and lenses run concurrently (independent) ───────────
phase("Personas");

const personaThunks = PERSONAS.map((p) => () =>
  agent(
    `Stay fully in character as: ${p.name}.
Your goal: find a women's-health practitioner you can actually trust for your situation.

${HOWTO(p.voice)}

${SSR}

Report your experience honestly, including discoverability (how would someone like you ever find this site?) and your single biggest unmet need.`,
    { label: `persona:${p.name.split(",")[0]}`, phase: "Personas", schema: PERSONA_SCHEMA },
  ),
);

const lensThunks = LENSES.map((l) => () =>
  agent(
    `You are an expert auditor. Lens: ${l.title}.

${l.brief}

Be specific and adversarial — find real problems, ground every finding in what you actually observe on the live site, and give a concrete recommendation for each.`,
    { label: `lens:${l.key}`, phase: "Lenses", schema: LENS_SCHEMA },
  ),
);

const all = await parallel([...personaThunks, ...lensThunks]);
const personas = all.slice(0, PERSONAS.length).filter(Boolean);
const lenses = all.slice(PERSONAS.length).filter(Boolean);

// ── Aggregate Likert distributions across personas (SSR spirit) ─────────────
const DIMS = ["trust", "usefulness", "ease", "matchRelevance", "likelyToUse", "likelyToRecommend", "accessibilityForMe"];
const likert = DIMS.map((dim) => {
  const vals = personas.map((p) => p?.ratings?.[dim]).filter((v) => typeof v === "number");
  const n = vals.length || 1;
  const mean = vals.reduce((a, b) => a + b, 0) / n;
  return {
    dimension: dim,
    n: vals.length,
    mean: Math.round(mean * 100) / 100,
    min: vals.length ? Math.min(...vals) : null,
    max: vals.length ? Math.max(...vals) : null,
  };
});

const goalCounts = personas.reduce((acc, p) => {
  const k = p?.goalAccomplished ?? "unknown";
  acc[k] = (acc[k] || 0) + 1;
  return acc;
}, {});

log(`Personas: ${personas.length} | Lenses: ${lenses.length} | goal: ${JSON.stringify(goalCounts)}`);

// ── Phase 3: synthesis ──────────────────────────────────────────────────────
phase("Synthesize");

const report = await agent(
  `You are the head of product & growth for The Guud Network (a trust-first, open women's-health practitioner discovery platform). Synthesize a persona red-team into a sharp, prioritized action report.

Likert distribution across ${personas.length} simulated personas (SSR-inspired, per arxiv 2510.08338 — treat as directional signal, ~90% of human test-retest reliability in the source study, NOT ground truth):
${JSON.stringify(likert, null, 2)}

Goal-accomplishment counts: ${JSON.stringify(goalCounts)}

Persona reports (JSON):
${JSON.stringify(personas, null, 2)}

Expert lens audits (JSON):
${JSON.stringify(lenses, null, 2)}

Write a markdown report with these sections:
1. **Executive summary** — the 3-4 most important truths, including the lowest-scoring Likert dimensions and what they mean.
2. **Top problems (ranked)** — cluster the friction across personas + lenses. For each: severity, who's affected, the evidence, and the fix.
3. **Discoverability & distribution strategy** — the central question. Concrete plays for where these women already are, each with rough effort (low/med/high) and reach, sequenced.
4. **Equity & reach** — how to serve those who need it most.
5. **Quick wins (ship this week)** vs **Strategic bets** — a clear, sequenced roadmap.
6. **Method caveat** — one line on the limits of synthetic personas.

Be concrete and honest. Prioritize ruthlessly.`,
  { label: "synthesis", phase: "Synthesize" },
);

return { baseUrl, likert, goalCounts, personaCount: personas.length, lensCount: lenses.length, report };
