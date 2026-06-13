import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

const statements = [
  `ALTER TABLE practitioners ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'curated'`,
  `ALTER TABLE practitioners ADD COLUMN IF NOT EXISTS npi text`,
  `ALTER TABLE practitioners ADD COLUMN IF NOT EXISTS credential text`,
  `ALTER TABLE practitioners ADD COLUMN IF NOT EXISTS phone text`,
  `DO $$ BEGIN
     IF NOT EXISTS (
       SELECT 1 FROM pg_constraint WHERE conname = 'practitioners_npi_unique'
     ) THEN
       ALTER TABLE practitioners ADD CONSTRAINT practitioners_npi_unique UNIQUE (npi);
     END IF;
   END $$`,
  `ALTER TABLE reviews ADD COLUMN IF NOT EXISTS synthetic boolean NOT NULL DEFAULT false`,
];

async function main() {
  for (const s of statements) {
    await sql.query(s);
    console.log("  ✓", s.split("\n")[0].slice(0, 70));
  }
  console.log("Migration complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
