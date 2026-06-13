/**
 * NL BIG-register verification.
 *
 * Uses the official public search API (https://zoeken.bigregister.nl/api),
 * exactly as intended: per-person lookup, not bulk enumeration (the API caps
 * broad queries with "tooManyFound" on purpose). We use it to confirm that a
 * community-recommended Dutch practitioner holds a real, active BIG
 * registration, and to stamp their official BIG number.
 *
 * Data is CC-0 (public domain). The public record exposes name, BIG number,
 * profession and specialism — no address/contact (privacy).
 */

const BASE = "https://zoeken.bigregister.nl/api";

const PROFESSION: Record<string, string> = {
  "01": "Doctor (Arts)",
  "02": "Dentist",
  "03": "Midwife (Verloskundige)",
  "04": "Physiotherapist",
  "16": "Psychotherapist",
  "17": "Pharmacist",
  "25": "Healthcare Psychologist",
  "30": "Nurse",
  "81": "Physician Assistant",
  "89": "Dietician",
};

export type BigMatch = {
  bigNumber: string;
  profession: string;
  mailingName: string;
};

type HcpResult = {
  mailingName?: string;
  lastName?: string;
  registrations?: {
    registrationNumber: string | number;
    professionalGroupCode: string;
    strikedOut?: boolean;
    registrationEnded?: boolean;
  }[];
};

async function searchBySurname(surname: string): Promise<HcpResult[]> {
  if (surname.length < 2) return [];
  try {
    const res = await fetch(
      `${BASE}/search/criteria?name=${encodeURIComponent(surname)}`,
      { headers: { accept: "application/json" } },
    );
    if (!res.ok) return []; // 404 = none, 400 "tooManyFound" = too broad
    const data = await res.json();
    return Array.isArray(data?.hcps) ? data.hcps : [];
  } catch {
    return [];
  }
}

/**
 * Verify a recommended practitioner against the BIG register by name.
 * Matches on surname + first-initial, requires an active (not struck-out)
 * registration. Returns null if not found / ambiguous.
 */
export async function verifyPractitioner(
  fullName: string,
): Promise<BigMatch | null> {
  const clean = fullName.replace(/^(dr|drs|prof|mr|mw|ir)\.?\s+/i, "").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length < 2) return null;
  const firstInitial = parts[0][0]?.toUpperCase();
  const surname = parts[parts.length - 1];

  const hcps = await searchBySurname(surname);
  if (hcps.length === 0) return null;

  // Prefer a record whose initials match the recommended first name.
  const initialMatch = hcps.find((h) =>
    (h.mailingName ?? "").trim().toUpperCase().startsWith(firstInitial ?? ""),
  );
  const candidate = initialMatch ?? hcps[0];

  const reg = (candidate.registrations ?? []).find(
    (r) => !r.strikedOut && !r.registrationEnded,
  );
  if (!reg) return null;

  return {
    bigNumber: String(reg.registrationNumber),
    profession: PROFESSION[reg.professionalGroupCode] ?? "Registered professional",
    mailingName: candidate.mailingName ?? clean,
  };
}

/** True when a free-text country looks like the Netherlands. */
export function isNetherlands(country: string): boolean {
  return /netherlands|holland|nederland|\bnl\b/i.test(country);
}
