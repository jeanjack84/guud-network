#!/usr/bin/env node
/**
 * Verifies a live deployment of The Guud Network end-to-end.
 * Usage: node scripts/verify.mjs <BASE_URL>
 *        BASE_URL=https://... node scripts/verify.mjs
 * Exit code 0 = all checks passed, 1 = something failed.
 */

const BASE = (process.argv[2] || process.env.BASE_URL || "http://localhost:3000")
  .replace(/\/$/, "");

let passed = 0;
let failed = 0;

function ok(name, detail = "") {
  passed++;
  console.log(`  \x1b[32m✓\x1b[0m ${name}${detail ? ` — ${detail}` : ""}`);
}
function bad(name, detail = "") {
  failed++;
  console.log(`  \x1b[31m✗\x1b[0m ${name}${detail ? ` — ${detail}` : ""}`);
}

async function main() {
  console.log(`\nVerifying The Guud Network @ ${BASE}\n`);

  // 1. Landing page responds and is the right app.
  try {
    const res = await fetch(BASE + "/");
    const html = await res.text();
    if (res.status === 200 && /Guud Network/i.test(html)) {
      ok("Landing page responds (200) and renders");
    } else {
      bad("Landing page", `status ${res.status}`);
    }
  } catch (e) {
    bad("Landing page", e.message);
  }

  // 2. Browse page responds.
  try {
    const res = await fetch(BASE + "/discover");
    ok("Discover page responds", `status ${res.status}`);
    if (res.status !== 200) bad("Discover page not 200");
  } catch (e) {
    bad("Discover page", e.message);
  }

  // 3. The Opus-powered match endpoint returns relevant results.
  let firstSlug = null;
  try {
    const res = await fetch(BASE + "/api/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query:
          "I've had painful, heavy periods for years and my doctor keeps brushing it off.",
      }),
    });
    const data = await res.json();
    if (res.status === 200 && Array.isArray(data.practitioners) && data.practitioners.length > 0) {
      ok("Match endpoint returns practitioners", `${data.practitioners.length} matched`);
      firstSlug = data.practitioners[0]?.slug ?? null;
    } else {
      bad("Match endpoint", `status ${res.status}, ${data.practitioners?.length ?? 0} results`);
    }
    if (data.empathy && typeof data.empathy === "string") {
      ok("Match returns an empathetic interpretation");
    } else {
      bad("Match empathy missing");
    }
    if (Array.isArray(data.matchedCategories) && data.matchedCategories.length > 0) {
      ok("Match mapped to topic(s)", data.matchedCategories.map((c) => c.slug).join(", "));
    } else {
      bad("Match topics missing");
    }
  } catch (e) {
    bad("Match endpoint", e.message);
  }

  // 4. A practitioner profile page loads.
  try {
    const slug = firstSlug || "dr-amara-okonkwo";
    const res = await fetch(`${BASE}/practitioners/${slug}`);
    const html = await res.text();
    if (res.status === 200 && /Recommendations/i.test(html)) {
      ok("Practitioner profile loads", slug);
    } else {
      bad("Practitioner profile", `status ${res.status}`);
    }
  } catch (e) {
    bad("Practitioner profile", e.message);
  }

  console.log(`\n${passed} passed, ${failed} failed\n`);
  process.exit(failed === 0 ? 0 : 1);
}

main();
