import { promises as fs } from "node:fs";
import path from "node:path";

import { createPostgresPool } from "./index";

async function getMigrationFiles(migrationsDir: string): Promise<string[]> {
  const entries = await fs.readdir(migrationsDir);

  return entries.filter((entry) => entry.endsWith(".sql")).sort((a, b) => a.localeCompare(b));
}

async function runMigrations(): Promise<void> {
  const migrationsDir = path.resolve(process.cwd(), "src/db/migrations");
  const pool = createPostgresPool();

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename text PRIMARY KEY,
        executed_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    const migrationFiles = await getMigrationFiles(migrationsDir);
    const appliedResult = await pool.query<{ filename: string }>(
      "SELECT filename FROM schema_migrations"
    );
    const appliedMigrations = new Set(appliedResult.rows.map((row) => row.filename));

    for (const migrationFile of migrationFiles) {
      if (appliedMigrations.has(migrationFile)) {
        continue;
      }

      const migrationPath = path.join(migrationsDir, migrationFile);
      const migrationSql = await fs.readFile(migrationPath, "utf8");

      await pool.query("BEGIN");

      try {
        await pool.query(migrationSql);
        await pool.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [migrationFile]);
        await pool.query("COMMIT");
        process.stdout.write(`Applied migration: ${migrationFile}\n`);
      } catch (error) {
        await pool.query("ROLLBACK");
        throw error;
      }
    }
  } finally {
    await pool.end();
  }
}

runMigrations().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
