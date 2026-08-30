import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

export const connection = postgres(process.env.DATABASE_URL!, { max: 10 });
export const db = drizzle(connection, { schema });
export { schema };
