import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

export const connection = postgres(process.env.DATABASE_URL!, {
  max: 10,
  // ponytail: disable prepared statements for Neon pooler / serverless, keep local working
  prepare: false,
});
export const db = drizzle(connection, { schema });
export { schema };
