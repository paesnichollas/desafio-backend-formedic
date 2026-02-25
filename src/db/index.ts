import { Pool } from "pg";

import { env } from "../config/env";

export function createPostgresPool(): Pool {
  return new Pool({
    connectionString: env.DATABASE_URL
  });
}
