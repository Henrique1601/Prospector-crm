import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { seedLeads } from "./seed.js";
import type { Store } from "./types.js";

// Vercel Functions can only write to /tmp. This keeps the deployed MVP usable,
// but the data is intentionally reported as temporary by /api/health.
const root = process.env.VERCEL
  ? path.join(process.env.TMPDIR || "/tmp", "prospector-crm")
  : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../data");
const file = path.join(root, "store.json");

export async function readStore(): Promise<Store> {
  try { return JSON.parse(await readFile(file, "utf8")) as Store; }
  catch {
    const initial = { leads: seedLeads() };
    await writeStore(initial);
    return initial;
  }
}

export async function writeStore(store: Store) {
  await mkdir(root, { recursive: true });
  await writeFile(file, JSON.stringify(store, null, 2), "utf8");
}
