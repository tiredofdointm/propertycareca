import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

declare global {
  var __pcPool: Pool | undefined;
}

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  return new Pool({ connectionString });
}

const pool = globalThis.__pcPool ?? createPool();
if (process.env.NODE_ENV !== "production") {
  globalThis.__pcPool = pool;
}

export const db = drizzle(pool, { schema });
