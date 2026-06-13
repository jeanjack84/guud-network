import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  await sql.query(`ALTER TABLE practitioners ADD COLUMN IF NOT EXISTS registry_id text`);
  await sql.query(`ALTER TABLE practitioners ADD COLUMN IF NOT EXISTS registry_verified boolean NOT NULL DEFAULT false`);
  console.log("registry columns ready.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
