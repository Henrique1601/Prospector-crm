import "dotenv/config";
import cors from "cors";
import express from "express";
import { z } from "zod";
import { analyzeWithAi, demoBrief, localAnalysis } from "./ai.js";
import { fetchNotionDatabase, parseCsvToLeads } from "./importers.js";
import { classifyWebsite, detectWhatsappAndPhone, resolveMultipleMapsLinks } from "./maps.js";
import { readStore, writeStore } from "./store.js";
import { stages, type Lead } from "./types.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.get("/api/health", (_req, res) => res.json({
  ok: true,
  ai: Boolean(process.env.AISA_API_KEY),
  mode: process.env.AISA_API_KEY ? "aisa" : "local",
  storage: process.env.DATABASE_URL ? "neon" : process.env.VERCEL ? "temporary" : "local-file",
  googleMaps: Boolean(process.env.GOOGLE_MAPS_API_KEY),
  notion: Boolean(process.env.NOTION_API_KEY && process.env.NOTION_DATABASE_ID)
}));

app.get("/api/notion/status", (_req, res) => {
  res.json({
    configured: Boolean(process.env.NOTION_API_KEY && process.env.NOTION_DATABASE_ID),
    hasKey: Boolean(process.env.NOTION_API_KEY),
    hasDatabaseId: Boolean(process.env.NOTION_DATABASE_ID)
  });
});

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

app.post("/api/leads/resolve-maps", async (req, res) => {
  const schema = z.object({
    urls: z.array(z.string()).optional(),
    url: z.string().optional()
  });
  const input = schema.parse(req.body);
  const rawUrls = input.urls || (input.url ? [input.url] : []);
  if (!rawUrls.length) return res.status(400).json({ message: "Nenhum link fornecido" });

  const store = await readStore();
  const results = await resolveMultipleMapsLinks(rawUrls, store.leads);
  res.json(results);
});

app.post("/api/leads/preview/csv", async (req, res) => {
  const schema = z.object({ content: z.string().min(1) });
  const { content } = schema.parse(req.body);
  const store = await readStore();
  const results = parseCsvToLeads(content, store.leads);
  res.json(results);
});

app.post("/api/leads/preview/notion", async (req, res) => {
  const schema = z.object({
    apiKey: z.string().optional(),
    databaseId: z.string().optional()
  });
  const { apiKey, databaseId } = schema.parse(req.body);
  const store = await readStore();
  const results = await fetchNotionDatabase(apiKey, databaseId, store.leads);
  res.json(results);
});


const leadInput = z.object({
  name: z.string().min(2),
  segment: z.string().min(2),
  city: z.string().min(2),
  state: z.string().default("SP"),
  address: z.string().optional(),
  mapsUrl: z.string().optional(),
  website: z.string().optional(),
  phone: z.string().optional(),
  whatsappUrl: z.string().optional(),
  hasWhatsapp: z.boolean().optional(),
  siteStatus: z.enum(["unknown", "none", "weak", "good"]).optional(),
  digitalPresence: z.enum(["unknown", "low", "medium", "high"]).optional()
});

app.post("/api/leads", async (req, res) => {
  const input = leadInput.parse(req.body);
  const store = await readStore();
  const now = new Date().toISOString();

  const phoneDetection = detectWhatsappAndPhone(input.phone, input.website);
  const siteInfo = classifyWebsite(input.website);

  const phone = input.phone || phoneDetection.phone;
  const whatsappUrl = input.whatsappUrl || phoneDetection.whatsappUrl;
  const hasWhatsapp = input.hasWhatsapp ?? phoneDetection.hasWhatsapp;
  const website = siteInfo.isWhatsappOnly ? undefined : input.website;

  const lead: Lead = {
    id: crypto.randomUUID(),
    name: input.name,
    segment: input.segment,
    city: input.city,
    state: input.state,
    address: input.address,
    mapsUrl: input.mapsUrl,
    website,
    phone,
    whatsappUrl,
    hasWhatsapp,
    stage: "new",
    score: 0,
    priority: "low",
    siteStatus: input.siteStatus || (website ? "good" : "unknown"),
    digitalPresence: input.digitalPresence || (website ? "medium" : "unknown"),
    nextAction: "Pesquisar presença digital",
    sources: input.mapsUrl ? [input.mapsUrl] : [],
    interactions: [],
    createdAt: now,
    updatedAt: now
  };
  store.leads.push(lead);
  await writeStore(store);
  res.status(201).json(lead);
});

app.post("/api/leads/batch", async (req, res) => {
  const schema = z.object({
    leads: z.array(leadInput.extend({ autoAnalyze: z.boolean().optional() })).min(1),
    autoAnalyze: z.boolean().optional()
  });
  const input = schema.parse(req.body);
  const store = await readStore();
  const now = new Date().toISOString();
  const createdLeads: Lead[] = [];

  for (const item of input.leads) {
    const shouldAnalyze = input.autoAnalyze !== undefined ? input.autoAnalyze : (item.autoAnalyze !== undefined ? item.autoAnalyze : true);
    const phoneDetection = detectWhatsappAndPhone(item.phone, item.website);
    const siteInfo = classifyWebsite(item.website);

    const phone = item.phone || phoneDetection.phone;
    const whatsappUrl = item.whatsappUrl || phoneDetection.whatsappUrl;
    const hasWhatsapp = item.hasWhatsapp ?? phoneDetection.hasWhatsapp;
    const website = siteInfo.isWhatsappOnly ? undefined : item.website;

    let lead: Lead = {
      id: crypto.randomUUID(),
      name: item.name,
      segment: item.segment,
      city: item.city,
      state: item.state || "SP",
      address: item.address,
      mapsUrl: item.mapsUrl,
      website,
      phone,
      whatsappUrl,
      hasWhatsapp,
      stage: "new",
      score: 0,
      priority: "low",
      siteStatus: item.siteStatus || (website ? "good" : "unknown"),
      digitalPresence: item.digitalPresence || (website ? "medium" : "unknown"),
      nextAction: "Pesquisar presença digital",
      sources: item.mapsUrl ? [item.mapsUrl] : [],
      interactions: [],
      createdAt: now,
      updatedAt: now
    };

    if (shouldAnalyze) {
      const result = (await analyzeWithAi(lead)) || localAnalysis(lead);
      lead = {
        ...lead,
        ...result,
        stage: "analyzed",
        analyzedAt: now,
        updatedAt: now
      };
    }

    store.leads.push(lead);
    createdLeads.push(lead);
  }

  await writeStore(store);
  res.status(201).json({ created: createdLeads.length, leads: createdLeads });
});

app.patch("/api/leads/:id", async (req, res) => {
  const store = await readStore();
  const lead = store.leads.find((item) => item.id === req.params.id);
  if (!lead) return res.status(404).json({ message: "Lead não encontrado" });

  const phoneToTest = req.body.phone !== undefined ? req.body.phone : lead.phone;
  const websiteToTest = req.body.website !== undefined ? req.body.website : lead.website;
  const phoneDetection = detectWhatsappAndPhone(phoneToTest, websiteToTest);

  const updates = { ...req.body };
  if (req.body.hasWhatsapp === undefined && phoneDetection.hasWhatsapp) {
    updates.hasWhatsapp = true;
  }
  if (!req.body.whatsappUrl && phoneDetection.whatsappUrl) {
    updates.whatsappUrl = phoneDetection.whatsappUrl;
  }
  if (!req.body.phone && phoneDetection.phone && !lead.phone) {
    updates.phone = phoneDetection.phone;
  }

  Object.assign(lead, updates, { id: lead.id, updatedAt: new Date().toISOString() });
  await writeStore(store);
  res.json(lead);
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
if (!process.env.VERCEL) {
  app.listen(port, () => console.log(`Prospector API em http://localhost:${port}`));
}

export default app;
