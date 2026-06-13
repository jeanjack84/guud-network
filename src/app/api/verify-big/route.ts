import { verifyPractitioner } from "@/lib/big";

export const maxDuration = 20;

// Per-person BIG verification (used by the recommend flow; exposed for testing).
export async function GET(request: Request) {
  const name = new URL(request.url).searchParams.get("name")?.trim() ?? "";
  if (name.length < 3) {
    return Response.json({ error: "Pass ?name=" }, { status: 400 });
  }
  const match = await verifyPractitioner(name);
  return Response.json({ verified: !!match, match });
}
