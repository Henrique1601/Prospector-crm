import { attachDatabasePool } from "@vercel/functions";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";
import { seedLeads } from "./seed.js";
import type { Store } from "./types.js";

const root = process.env.VERCEL
  ? path.join(process.env.TMPDIR || "/tmp", "prospector-crm")
  : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../data");
const file = path.join(root, "store.json");
const storeId = "default";

let databasePool: Pool | undefined;

function getDatabasePool() {
  if (!process.env.DATABASE_URL) return undefined;
  if (!databasePool) {
    const connectionUrl = new URL(process.env.DATABASE_URL);
    if (connectionUrl.searchParams.get("sslmode") === "require") {
      connectionUrl.searchParams.set("sslmode", "verify-full");
    }
    databasePool = new Pool({
      connectionString: connectionUrl.toString(),
      max: 3,
      connectionTimeoutMillis: 5_000,
      idleTimeoutMillis: 10_000
    });
    if (process.env.VERCEL) attachDatabasePool(databasePool);
  }
  return databasePool;
}

async function readDatabaseStore(pool: Pool): Promise<Store> {
  const existing = await pool.query<{ payload: Store }>("SELECT payload FROM prospector_store WHERE id = $1", [storeId]);
  if (existing.rows[0]) return existing.rows[0].payload;

  const initial: Store = { leads: seedLeads() };
  const inserted = await pool.query<{ payload: Store }>(
    "INSERT INTO prospector_store (id, payload) VALUES ($1, $2::jsonb) ON CONFLICT (id) DO NOTHING RETURNING payload",
    [storeId, JSON.stringify(initial)]
  );
  if (inserted.rows[0]) return inserted.rows[0].payload;

  const concurrent = await pool.query<{ payload: Store }>("SELECT payload FROM prospector_store WHERE id = $1", [storeId]);
  if (!concurrent.rows[0]) throw new Error("Não foi possível inicializar o banco do CRM");
  return concurrent.rows[0].payload;
}

export async function readStore(): Promise<Store> {
  const pool = getDatabasePool();
  if (pool) return readDatabaseStore(pool);

  try { return JSON.parse(await readFile(file, "utf8")) as Store; }
  catch {
    const initial = { leads: seedLeads() };
    await writeStore(initial);
    return initial;
  }
}

export async function writeStore(store: Store) {
  const pool = getDatabasePool();
  if (pool) {
    await pool.query(
      "INSERT INTO prospector_store (id, payload, updated_at) VALUES ($1, $2::jsonb, now()) ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = now()",
      [storeId, JSON.stringify(store)]
    );
    return;
  }

  await mkdir(root, { recursive: true });
  await writeFile(file, JSON.stringify(store, null, 2), "utf8");
}
