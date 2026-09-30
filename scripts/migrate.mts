import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { max: 1, prepare: false });
await migrate(drizzle(sql), { migrationsFolder: "./drizzle" });
await sql.unsafe(`CREATE INDEX IF NOT EXISTS notes_search_gin
  ON notes USING gin (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(body, '')));`);
await sql.end();
console.log("Migrations applied.");
