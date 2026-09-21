import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { seedLeads } from "./seed.js";
import type { Store } from "./types.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../data");
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
