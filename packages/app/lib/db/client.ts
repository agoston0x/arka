import { createClient, type Client } from "@libsql/client";
import { readFileSync } from "fs";
import { join } from "path";

let _client: Client | null = null;

export function getDb(): Client {
  if (!_client) {
    _client = createClient({
      url: process.env.TURSO_DATABASE_URL ?? "file:./local.db",
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return _client;
}

let _initialized = false;

export async function initDb(): Promise<void> {
  if (_initialized) return;
  const schema = readFileSync(join(process.cwd(), "lib/db/schema.sql"), "utf8");
  const db = getDb();
  const statements = schema
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const stmt of statements) {
    await db.execute(stmt);
  }
  _initialized = true;
}
