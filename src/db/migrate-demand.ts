import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  await sql.query(`
    CREATE TABLE IF NOT EXISTS demand_signups (
      id serial PRIMARY KEY,
      email text NOT NULL,
      location text,
      topics text[],
      query text,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `);
  console.log("demand_signups ready.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
