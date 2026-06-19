import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

let _pool: InstanceType<typeof Pool> | null = null;
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getPool(): InstanceType<typeof Pool> {
  if (!_pool) {
    const rawUrl = process.env.DATABASE_URL ?? "";

    // Strip surrounding quotes in case the value was pasted in .env format
    const url = rawUrl.replace(/^["']|["']$/g, "").trim();

    // Check if it looks like a valid postgres URL
    const isValidUrl = url.startsWith("postgres://") || url.startsWith("postgresql://");

    if (!isValidUrl && !process.env.PGHOST) {
      throw new Error(
        "DATABASE_URL must be set to a valid PostgreSQL connection string. " +
        `Got: "${url.slice(0, 30)}...". Did you forget to provision a database?`,
      );
    }

    const sslDisabled =
      url.includes("sslmode=disable") ||
      url.includes("localhost") ||
      url.includes("127.0.0.1") ||
      !!process.env.PGHOST?.match(/^(localhost|127\.0\.0\.1)$/);

    _pool = new Pool(
      isValidUrl
        ? { connectionString: url, ssl: sslDisabled ? false : { rejectUnauthorized: false } }
        : { ssl: sslDisabled ? false : { rejectUnauthorized: false } },
    );
  }
  return _pool;
}

function getDb(): ReturnType<typeof drizzle<typeof schema>> {
  if (!_db) {
    _db = drizzle(getPool(), { schema });
  }
  return _db;
}

export const pool: InstanceType<typeof Pool> = new Proxy(
  {} as InstanceType<typeof Pool>,
  {
    get(_, prop) {
      return Reflect.get(getPool(), prop, getPool());
    },
  },
);

export const db: ReturnType<typeof drizzle<typeof schema>> = new Proxy(
  {} as ReturnType<typeof drizzle<typeof schema>>,
  {
    get(_, prop) {
      return Reflect.get(getDb(), prop, getDb());
    },
  },
);

export * from "./schema";
