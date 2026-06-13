export const meta = {
  name: "grade-guud-network",
  description:
    "Grade a live deployment of The Guud Network against rubric.md with a judge panel",
  whenToUse:
    "After deploying, to verify 'done' by the model: scores the live URL against the rubric, no human needed.",
  phases: [
    { title: "Judge", detail: "one independent judge per rubric section, grading the live URL + repo" },
    { title: "Synthesize", detail: "aggregate section scores into a final /100 verdict" },
  ],
};

// args may be a bare URL string or { baseUrl, repoPath }.
const baseUrl =
  (typeof args === "string" ? args : args?.baseUrl) ??
  "http://localhost:3000";
const repoPath =
  (typeof args === "object" && args?.repoPath) || "/Users/janderuyck/guud-network";

const SECTION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["section", "awarded", "max", "items", "summary"],
  properties: {
    section: { type: "string" },
    awarded: { type: "number" },
    max: { type: "number" },
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "points", "max", "note"],
        properties: {
          id: { type: "string" },
          points: { type: "number" },
          max: { type: "number" },
          note: { type: "string", description: "What you observed (cite evidence)." },
        },
      },
    },
    summary: { type: "string" },
  },
};

const SECTIONS = [
  {
    key: "A-impact",
    title: "A. Impact (35)",
    criteria: `A1 (10) problem clearly communicated on landing page; A2 (10) matching genuinely helps for a plain-language concern; A3 (8) credible/safe enough for real women, has safety net + 'not medical advice'; A4 (7) open & reusable: MIT license + README self-host path.`,
  },
  {
    key: "B-demo",
    title: "B. Demo (35)",
    criteria: `B1 (8) live URL returns 200 + renders; B2 (10) search flow live: empathetic interpretation + matched topics + ranked cards (POST ${baseUrl}/api/match with a JSON {query}); B3 (7) profile pages load with recommendations + trust score + 'why women trust her'; B4 (6) a new recommendation persists; B5 (4) polished, responsive, on-brand UI.`,
  },
  {
    key: "C-opus",
    title: "C. Opus 4.8 Use (15)",
    criteria: `C1 (6) symptom interpretation uses Opus 4.8 structured output w/ empathy (see src/lib/ai.ts interpretSymptoms); C2 (5) 'why women trust her' grounded only in real reviews (synthesiseTrust); C3 (4) submissions moderated by Opus 4.8 (moderateReview).`,
  },
  {
    key: "D-orchestration",
    title: "D. Orchestration (15)",
    criteria: `D1 (5) 'done' verifiable by model: scripts/verify.mjs hits live URL, exit code reflects pass/fail; D2 (5) this workflow re-grades a live URL via args; D3 (5) repeatable setup: npm run db:setup + README one-command path.`,
  },
];

phase("Judge");

const scores = await parallel(
  SECTIONS.map((s) => () =>
    agent(
      `You are an independent, skeptical hackathon judge grading section "${s.title}" of The Guud Network.

Live URL: ${baseUrl}
Repo (read files for code-based criteria): ${repoPath}
Rubric file: ${repoPath}/rubric.md

Section criteria:
${s.criteria}

Gather real evidence before scoring:
- Fetch ${baseUrl}/ and ${baseUrl}/discover and at least one /practitioners/<slug> page.
- For the search flow, you may POST to ${baseUrl}/api/match with JSON {"query":"painful periods for years, doctor dismisses me"} (use curl/Bash) and inspect the JSON.
- For code criteria, read the relevant files under ${repoPath}/src.

Award points per item honestly (full/partial/zero) and cite what you observed in each note. Do not invent evidence. Return the structured score.`,
      { label: `judge:${s.key}`, phase: "Judge", schema: SECTION_SCHEMA },
    ),
  ),
);

phase("Synthesize");

const valid = scores.filter(Boolean);
const total = valid.reduce((sum, s) => sum + (s.awarded || 0), 0);
const maxTotal = valid.reduce((sum, s) => sum + (s.max || 0), 0);

const verdict = await agent(
  `You are the head judge. Combine these section scores for The Guud Network into a final verdict.

Section results (JSON):
${JSON.stringify(valid, null, 2)}

Computed total: ${total}/${maxTotal}.

Write a crisp verdict: the final score out of 100, the single strongest aspect, the biggest weakness, and the top 2 concrete improvements that would raise the score most. Be specific and fair.`,
  { label: "head-judge", phase: "Synthesize" },
);

log(`Final score: ${total}/${maxTotal}`);

return { baseUrl, total, maxTotal, sections: valid, verdict };
