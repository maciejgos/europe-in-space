import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

/** The real Worker D1 migration, applied to an in-memory SQLite database. */
export const MIGRATION_SQL = readFileSync(
  new URL("../../worker/migrations/0001_orbital_datasets.sql", import.meta.url),
  "utf8",
);

/**
 * Minimal D1Database-compatible shim over node:sqlite, so integration tests
 * execute the exact migration and repository SQL that runs on Cloudflare D1
 * (SQLite) without network or provisioning.
 */
export function createLocalD1(migrations: string = MIGRATION_SQL): D1Database {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(migrations);

  return {
    prepare(query: string) {
      const stmt = sqlite.prepare(query);
      return {
        bind(...args: unknown[]) {
          const params = args.map((arg) => (arg === undefined ? null : arg)) as never[];
          return {
            async run() {
              const info = stmt.run(...params);
              return {
                success: true,
                meta: { changes: Number(info.changes), last_row_id: Number(info.lastInsertRowid) },
              };
            },
            async first<T>(columnName?: string): Promise<T | null> {
              const row = stmt.get(...params) as Record<string, unknown> | undefined;
              if (row === undefined) return null;
              return (columnName ? row[columnName] : row) as T;
            },
            async all<T>() {
              const results = stmt.all(...params) as T[];
              return { success: true, results, meta: { changes: 0 } };
            },
          };
        },
      };
    },
  } as unknown as D1Database;
}
