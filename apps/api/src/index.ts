import "dotenv/config";
import cors from "cors";
import express from "express";
import { z } from "zod";
import { analyzeWithAi, demoBrief, localAnalysis } from "./ai.js";
import { readStore, writeStore } from "./store.js";
import { stages, type Lead } from "./types.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true, ai: Boolean(process.env.AISA_API_KEY), mode: process.env.AISA_API_KEY ? "aisa" : "local" }));

app.get("/api/leads", async (req, res) => {
  const store = await readStore();
  const query = String(req.query.q || "").toLowerCase();
  const stage = String(req.query.stage || "all");
  const leads = store.leads.filter((lead) => (!query || `${lead.name} ${lead.segment} ${lead.city}`.toLowerCase().includes(query)) && (stage === "all" || lead.stage === stage));
  res.json(leads.sort((a, b) => b.score - a.score));
});

app.get("/api/dashboard", async (_req, res) => {
  const { leads } = await readStore();
  const count = (stage: Lead["stage"]) => leads.filter((lead) => lead.stage === stage).length;
  const contacted = leads.filter((lead) => !["new", "analyzed"].includes(lead.stage)).length;
  const replies = leads.filter((lead) => ["replied", "meeting", "proposal", "won"].includes(lead.stage)).length;
  res.json({ total: leads.length, highPriority: leads.filter((lead) => ["high", "urgent"].includes(lead.priority)).length, contacted, replies, won: count("won"), responseRate: contacted ? Math.round((replies / contacted) * 100) : 0, stages: Object.fromEntries(stages.map((item) => [item, count(item)])) });
});

const leadInput = z.object({ name: z.string().min(2), segment: z.string().min(2), city: z.string().min(2), state: z.string().default("SP"), website: z.string().optional(), phone: z.string().optional() });
app.post("/api/leads", async (req, res) => {
  const input = leadInput.parse(req.body); const store = await readStore(); const now = new Date().toISOString();
  const lead: Lead = { id: crypto.randomUUID(), ...input, stage: "new", score: 0, priority: "low", siteStatus: "unknown", digitalPresence: "unknown", nextAction: "Pesquisar presença digital", sources: [], interactions: [], createdAt: now, updatedAt: now };
  store.leads.push(lead); await writeStore(store); res.status(201).json(lead);
});

app.patch("/api/leads/:id", async (req, res) => {
  const store = await readStore(); const lead = store.leads.find((item) => item.id === req.params.id);
  if (!lead) return res.status(404).json({ message: "Lead não encontrado" });
  Object.assign(lead, req.body, { id: lead.id, updatedAt: new Date().toISOString() }); await writeStore(store); res.json(lead);
});

app.post("/api/leads/:id/analyze", async (req, res) => {
  const store = await readStore(); const lead = store.leads.find((item) => item.id === req.params.id);
  if (!lead) return res.status(404).json({ message: "Lead não encontrado" });
  const result = (await analyzeWithAi(lead)) || localAnalysis(lead);
  Object.assign(lead, result, { stage: "analyzed", analyzedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }); await writeStore(store); res.json(lead);
});

app.post("/api/leads/:id/demo", async (req, res) => {
  const store = await readStore(); const lead = store.leads.find((item) => item.id === req.params.id);
  if (!lead) return res.status(404).json({ message: "Lead não encontrado" });
  lead.demoBrief = demoBrief(lead); lead.updatedAt = new Date().toISOString(); await writeStore(store); res.json(lead);
});

app.post("/api/leads/:id/interactions", async (req, res) => {
  const schema = z.object({ type: z.enum(["note", "whatsapp", "email", "call", "meeting", "reply"]), content: z.string().min(1) });
  const input = schema.parse(req.body); const store = await readStore(); const lead = store.leads.find((item) => item.id === req.params.id);
  if (!lead) return res.status(404).json({ message: "Lead não encontrado" });
  lead.interactions.unshift({ id: crypto.randomUUID(), ...input, createdAt: new Date().toISOString() }); lead.updatedAt = new Date().toISOString(); await writeStore(store); res.status(201).json(lead);
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : "Erro inesperado"; res.status(400).json({ message });
});

const port = Number(process.env.PORT || 3333);
app.listen(port, () => console.log(`Prospector API em http://localhost:${port}`));
