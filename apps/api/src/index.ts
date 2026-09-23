import "dotenv/config";
import cors from "cors";
import express from "express";
import { z } from "zod";
import { analyzeWithAi, demoBrief, localAnalysis } from "./ai.js";
import { fetchNotionDatabase, parseCsvToLeads } from "./importers.js";
import { classifyWebsite, detectWhatsappAndPhone, resolveLeadWhatsapp, resolveMultipleMapsLinks } from "./maps.js";
import { discoverProspectingLeads } from "./prospecting.js";
import { readStore, writeStore } from "./store.js";
import { stages, type CityConversionStats, type ConversionAnalytics, type Lead, type SegmentConversionStats } from "./types.js";

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

app.get("/api/leads/export/csv", async (_req, res) => {
  const store = await readStore();
  const headers = [
    "Nome",
    "Segmento",
    "Cidade",
    "UF",
    "Endereço",
    "Telefone",
    "WhatsApp",
    "Tem WhatsApp",
    "Site",
    "Status do Site",
    "Estágio",
    "Score",
    "Prioridade",
    "Próxima Ação",
    "Próximo Follow-up",
    "URL Demonstração",
    "Criado Em"
  ];

  const escapeCsv = (val: unknown) => {
    if (val === null || val === undefined) return "";
    const str = String(val);
    if (str.includes(";") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = store.leads.map((l) => [
    l.name,
    l.segment,
    l.city,
    l.state,
    l.address || "",
    l.phone || "",
    l.whatsappUrl || "",
    l.hasWhatsapp ? "Sim" : "Não",
    l.website || "",
    l.siteStatus,
    l.stage,
    l.score,
    l.priority,
    l.nextAction || "",
    l.nextFollowUp || "",
    l.demoUrl || "",
    l.createdAt ? new Date(l.createdAt).toLocaleDateString("pt-BR") : ""
  ]);

  const csvContent = "\uFEFF" + [
    headers.map(escapeCsv).join(";"),
    ...rows.map((row) => row.map(escapeCsv).join(";"))
  ].join("\r\n");

  res.setHeader("Content-Disposition", 'attachment; filename="prospector-leads.csv"');
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.send(csvContent);
});

app.get("/api/dashboard", async (_req, res) => {
  const { leads } = await readStore();
  const count = (stage: Lead["stage"]) => leads.filter((lead) => lead.stage === stage).length;
  const contacted = leads.filter((lead) => !["new", "analyzed"].includes(lead.stage)).length;
  const replies = leads.filter((lead) => ["replied", "meeting", "proposal", "won"].includes(lead.stage)).length;
  res.json({ total: leads.length, highPriority: leads.filter((lead) => ["high", "urgent"].includes(lead.priority)).length, contacted, replies, won: count("won"), responseRate: contacted ? Math.round((replies / contacted) * 100) : 0, stages: Object.fromEntries(stages.map((item) => [item, count(item)])) });
});

app.get("/api/analytics/conversion", async (_req, res) => {
  const { leads } = await readStore();
  const totalLeads = leads.length;
  const contactedLeads = leads.filter((l) => !["new", "analyzed"].includes(l.stage)).length;
  const repliesCount = leads.filter((l) => ["replied", "meeting", "proposal", "won"].includes(l.stage)).length;
  const proposalsCount = leads.filter((l) => ["proposal", "won"].includes(l.stage)).length;
  const wonCount = leads.filter((l) => l.stage === "won").length;
  const lostCount = leads.filter((l) => l.stage === "lost").length;

  const overallWinRate = totalLeads > 0 ? Math.round((wonCount / totalLeads) * 100) : 0;
  const contactToReplyRate = contactedLeads > 0 ? Math.round((repliesCount / contactedLeads) * 100) : 0;
  const replyToProposalRate = repliesCount > 0 ? Math.round((proposalsCount / repliesCount) * 100) : 0;
  const proposalToWonRate = proposalsCount > 0 ? Math.round((wonCount / proposalsCount) * 100) : 0;

  // Breakdown por Cidade
  const cityMap = new Map<string, Lead[]>();
  for (const lead of leads) {
    const city = lead.city || "Outra";
    if (!cityMap.has(city)) cityMap.set(city, []);
    cityMap.get(city)!.push(lead);
  }

  const cities: CityConversionStats[] = Array.from(cityMap.entries()).map(([city, list]) => {
    const total = list.length;
    const contacted = list.filter((l) => !["new", "analyzed"].includes(l.stage)).length;
    const replies = list.filter((l) => ["replied", "meeting", "proposal", "won"].includes(l.stage)).length;
    const won = list.filter((l) => l.stage === "won").length;
    return {
      city,
      total,
      contacted,
      replies,
      won,
      responseRate: contacted > 0 ? Math.round((replies / contacted) * 100) : 0,
      winRate: total > 0 ? Math.round((won / total) * 100) : 0
    };
  }).sort((a, b) => b.total - a.total);

  // Breakdown por Segmento
  const segmentMap = new Map<string, Lead[]>();
  for (const lead of leads) {
    const segment = lead.segment || "Geral";
    if (!segmentMap.has(segment)) segmentMap.set(segment, []);
    segmentMap.get(segment)!.push(lead);
  }

  const segments: SegmentConversionStats[] = Array.from(segmentMap.entries()).map(([segment, list]) => {
    const total = list.length;
    const contacted = list.filter((l) => !["new", "analyzed"].includes(l.stage)).length;
    const replies = list.filter((l) => ["replied", "meeting", "proposal", "won"].includes(l.stage)).length;
    const won = list.filter((l) => l.stage === "won").length;
    return {
      segment,
      total,
      contacted,
      replies,
      won,
      responseRate: contacted > 0 ? Math.round((replies / contacted) * 100) : 0,
      winRate: total > 0 ? Math.round((won / total) * 100) : 0
    };
  }).sort((a, b) => b.total - a.total);

  const analytics: ConversionAnalytics = {
    totalLeads,
    contactedLeads,
    repliesCount,
    proposalsCount,
    wonCount,
    lostCount,
    overallWinRate,
    contactToReplyRate,
    replyToProposalRate,
    proposalToWonRate,
    cities,
    segments
  };

  res.json(analytics);
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

app.post("/api/prospecting/ai-discover", async (req, res) => {
  const schema = z.object({
    segment: z.string().min(2),
    city: z.string().min(2),
    state: z.string().default("SP"),
    count: z.number().int().min(1).max(20).default(5)
  });
  const { segment, city, state, count } = schema.parse(req.body);
  const store = await readStore();
  const leads = await discoverProspectingLeads({
    segment,
    city,
    state,
    count,
    existingLeads: store.leads
  });
  res.json({ leads });
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
  demoUrl: z.string().optional(),
  siteStatus: z.enum(["unknown", "none", "weak", "good"]).optional(),
  digitalPresence: z.enum(["unknown", "low", "medium", "high"]).optional()
});

app.post("/api/leads", async (req, res) => {
  const input = leadInput.parse(req.body);
  const store = await readStore();
  const now = new Date().toISOString();

  const waResolution = resolveLeadWhatsapp({
    phone: input.phone,
    website: input.website,
    whatsappUrl: input.whatsappUrl,
    hasWhatsapp: input.hasWhatsapp
  });
  const siteInfo = classifyWebsite(input.website);

  const phone = waResolution.phone;
  const whatsappUrl = waResolution.whatsappUrl;
  const hasWhatsapp = waResolution.hasWhatsapp;
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
    demoUrl: input.demoUrl,
    createdAt: now,
    updatedAt: now
  };
  store.leads.push(lead);
  await writeStore(store);
  res.status(201).json(lead);
});

const webhookInput = z.object({
  name: z.string().min(1).optional(),
  empresa: z.string().min(1).optional(),
  nome: z.string().min(1).optional(),
  segment: z.string().optional(),
  segmento: z.string().optional(),
  city: z.string().optional(),
  cidade: z.string().optional(),
  state: z.string().optional(),
  uf: z.string().optional(),
  phone: z.string().optional(),
  telefone: z.string().optional(),
  whatsapp: z.string().optional(),
  website: z.string().optional(),
  site: z.string().optional(),
  message: z.string().optional(),
  mensagem: z.string().optional(),
  source: z.string().optional(),
  origem: z.string().optional()
});

app.post("/api/webhooks/lead", async (req, res) => {
  const configuredToken = process.env.WEBHOOK_TOKEN;
  if (configuredToken) {
    const providedToken = req.headers["x-webhook-token"] || req.query.token;
    if (providedToken !== configuredToken) {
      return res.status(401).json({ message: "Token de webhook inválido ou ausente" });
    }
  }

  const parsed = webhookInput.parse(req.body);
  const name = parsed.name || parsed.empresa || parsed.nome || "Novo Lead Web";
  const segment = parsed.segment || parsed.segmento || "Interessado Geral";
  const city = parsed.city || parsed.cidade || "Santos";
  const state = parsed.state || parsed.uf || "SP";
  const rawPhone = parsed.phone || parsed.telefone || parsed.whatsapp;
  const rawWebsite = parsed.website || parsed.site;
  const message = parsed.message || parsed.mensagem;
  const source = parsed.source || parsed.origem || "Webhook Externo";

  const phoneDetection = detectWhatsappAndPhone(rawPhone, rawWebsite);
  const siteInfo = classifyWebsite(rawWebsite);

  const phone = rawPhone || phoneDetection.phone;
  const whatsappUrl = phoneDetection.whatsappUrl;
  const hasWhatsapp = phoneDetection.hasWhatsapp;
  const website = siteInfo.isWhatsappOnly ? undefined : rawWebsite;

  const now = new Date().toISOString();
  let lead: Lead = {
    id: crypto.randomUUID(),
    name,
    segment,
    city,
    state,
    website,
    phone,
    whatsappUrl,
    hasWhatsapp,
    stage: "new",
    score: 75,
    priority: "high",
    siteStatus: website ? "good" : "none",
    digitalPresence: website ? "medium" : "low",
    nextAction: "Responder lead recebido via webhook",
    sources: [source],
    interactions: message
      ? [{ id: crypto.randomUUID(), type: "note", content: `Mensagem recebida via webhook (${source}): "${message}"`, createdAt: now }]
      : [{ id: crypto.randomUUID(), type: "note", content: `Lead capturado automaticamente via webhook (${source})`, createdAt: now }],
    createdAt: now,
    updatedAt: now
  };

  const aiResult = (await analyzeWithAi(lead)) || localAnalysis(lead);
  lead = {
    ...lead,
    ...aiResult,
    stage: "analyzed",
    analyzedAt: now,
    updatedAt: now
  };

  const store = await readStore();
  store.leads.unshift(lead);
  await writeStore(store);

  res.status(201).json({
    success: true,
    message: "Lead recebido e qualificado com sucesso",
    lead
  });
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
    const waResolution = resolveLeadWhatsapp({
      phone: item.phone,
      website: item.website,
      whatsappUrl: item.whatsappUrl,
      hasWhatsapp: item.hasWhatsapp
    });
    const siteInfo = classifyWebsite(item.website);

    const phone = waResolution.phone;
    const whatsappUrl = waResolution.whatsappUrl;
    const hasWhatsapp = waResolution.hasWhatsapp;
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
      demoUrl: item.demoUrl,
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
  const store = await readStore();
  const lead = store.leads.find((item) => item.id === req.params.id);
  if (!lead) return res.status(404).json({ message: "Lead não encontrado" });
  const result = (await analyzeWithAi(lead)) || localAnalysis(lead);
  Object.assign(lead, result, { stage: "analyzed", analyzedAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  await writeStore(store);
  res.json(lead);
});

app.post("/api/leads/:id/demo", async (req, res) => {
  const store = await readStore();
  const lead = store.leads.find((item) => item.id === req.params.id);
  if (!lead) return res.status(404).json({ message: "Lead não encontrado" });
  lead.demoBrief = demoBrief(lead);
  lead.updatedAt = new Date().toISOString();
  await writeStore(store);
  res.json(lead);
});

app.post("/api/leads/:id/interactions", async (req, res) => {
  const schema = z.object({ type: z.enum(["note", "whatsapp", "email", "call", "meeting", "reply"]), content: z.string().min(1) });
  const input = schema.parse(req.body);
  const store = await readStore();
  const lead = store.leads.find((item) => item.id === req.params.id);
  if (!lead) return res.status(404).json({ message: "Lead não encontrado" });
  lead.interactions.unshift({ id: crypto.randomUUID(), ...input, createdAt: new Date().toISOString() });
  lead.updatedAt = new Date().toISOString();
  await writeStore(store);
  res.status(201).json(lead);
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : "Erro inesperado";
  res.status(400).json({ message });
});

const port = Number(process.env.PORT || 3333);
if (!process.env.VERCEL) {
  app.listen(port, () => console.log(`Prospector API em http://localhost:${port}`));
}

export default app;
