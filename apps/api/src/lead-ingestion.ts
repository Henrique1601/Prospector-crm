import { z } from "zod";
import { analyzeWithAi, localAnalysis } from "./ai.js";
import { findDuplicateLead } from "./integration.js";
import { classifyWebsite, resolveLeadWhatsapp } from "./maps.js";
import { readStore, writeStore } from "./store.js";
import type { Lead } from "./types.js";

export const integrationLeadInput = z.object({
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
  digitalPresence: z.enum(["unknown", "low", "medium", "high"]).optional(),
  opportunity: z.string().optional(),
  reason: z.string().optional(),
  suggestedMessage: z.string().optional(),
  nextAction: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  score: z.number().int().min(0).max(100).optional(),
  sources: z.array(z.string()).optional()
});

export const ingestLeadsInput = z.object({
  leads: z.array(integrationLeadInput).min(1).max(25),
  autoAnalyze: z.boolean().default(false)
});

export type IngestLeadsInput = z.infer<typeof ingestLeadsInput>;

export async function ingestLeads(input: IngestLeadsInput) {
  const store = await readStore();
  const createdLeads: Lead[] = [];
  const skipped: Array<{ name: string; duplicateId: string; reason: string }> = [];

  for (const item of input.leads) {
    const duplicate = findDuplicateLead([...store.leads, ...createdLeads], item);
    if (duplicate) {
      skipped.push({ name: item.name, duplicateId: duplicate.lead.id, reason: duplicate.reason });
      continue;
    }

    const waResolution = resolveLeadWhatsapp({
      phone: item.phone,
      website: item.website,
      whatsappUrl: item.whatsappUrl,
      hasWhatsapp: item.hasWhatsapp
    });
    const siteInfo = classifyWebsite(item.website);
    const website = siteInfo.isWhatsappOnly ? undefined : item.website;
    const now = new Date().toISOString();
    let lead: Lead = {
      id: crypto.randomUUID(),
      name: item.name,
      segment: item.segment,
      city: item.city,
      state: item.state,
      address: item.address,
      mapsUrl: item.mapsUrl,
      website,
      phone: waResolution.phone,
      whatsappUrl: waResolution.whatsappUrl,
      hasWhatsapp: waResolution.hasWhatsapp,
      stage: "new",
      score: item.score ?? 0,
      priority: item.priority ?? "medium",
      siteStatus: item.siteStatus || (website ? "good" : "unknown"),
      digitalPresence: item.digitalPresence || (website ? "medium" : "unknown"),
      opportunity: item.opportunity,
      reason: item.reason,
      suggestedMessage: item.suggestedMessage,
      nextAction: item.nextAction || "Revisar dados e preparar primeiro contato",
      sources: Array.from(new Set([...(item.sources || []), ...(item.mapsUrl ? [item.mapsUrl] : [])])),
      interactions: [{
        id: crypto.randomUUID(),
        type: "note",
        content: "Lead cadastrado pela integração segura de prospecção diária",
        createdAt: now
      }],
      demoUrl: item.demoUrl,
      createdAt: now,
      updatedAt: now
    };

    if (input.autoAnalyze) {
      const analysis = (await analyzeWithAi(lead)) || localAnalysis(lead);
      lead = { ...lead, ...analysis, stage: "analyzed", analyzedAt: now, updatedAt: now };
    }
    createdLeads.push(lead);
  }

  if (createdLeads.length) {
    store.leads.unshift(...createdLeads);
    await writeStore(store);
  }

  return {
    success: true as const,
    created: createdLeads.length,
    skipped: skipped.length,
    leads: createdLeads,
    duplicates: skipped
  };
}
