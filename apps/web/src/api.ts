import type { ConversionAnalytics, DashboardData, DemoPrimaryGoal, DemoProjectType, DemoStatus, DemoVersion, Lead, ResolvedPlacePreview, Stage } from "./types";

const productionApiUrl = "https://api-prospector-delta.vercel.app";
const apiBaseUrl = (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "" : productionApiUrl)).replace(/\/$/, "");

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${url}`, { headers: { "Content-Type": "application/json" }, ...options });
  if (!response.ok) throw new Error((await response.json()).message || "Não foi possível concluir a ação");
  return response.json() as Promise<T>;
}

export const api = {
  leads: () => request<Lead[]>("/api/leads"),
  dashboard: () => request<DashboardData>("/api/dashboard"),
  conversionAnalytics: () => request<ConversionAnalytics>("/api/analytics/conversion"),
  health: () => request<{ ok: boolean; ai: boolean; mode: string; storage: "local-file" | "temporary" | "neon"; googleMaps?: boolean }>("/api/health"),
  analyze: (id: string) => request<Lead>(`/api/leads/${id}/analyze`, { method: "POST" }),
  demo: (id: string) => request<Lead>(`/api/leads/${id}/demo`, { method: "POST" }),
  demos: (id: string) => request<DemoVersion[]>(`/api/leads/${id}/demos`),
  offerDemo: (id: string) => request<Lead>(`/api/leads/${id}/demos/offer`, { method: "POST" }),
  generateDemo: (id: string, body: { projectType: DemoProjectType; primaryGoal: DemoPrimaryGoal; informationConfirmed: true }) =>
    request<Lead>(`/api/leads/${id}/demos/generate`, { method: "POST", body: JSON.stringify(body) }),
  updateDemo: (leadId: string, demoId: string, body: { status?: DemoStatus; previewUrl?: string; feedback?: string; nextStep?: string; followUpAt?: string }) =>
    request<Lead>(`/api/leads/${leadId}/demos/${demoId}`, { method: "PATCH", body: JSON.stringify(body) }),
  update: (id: string, body: Partial<Lead>) => request<Lead>(`/api/leads/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  add: (body: Partial<Lead>) => request<Lead>("/api/leads", { method: "POST", body: JSON.stringify(body) }),
  sendWebhookLead: (payload: Record<string, unknown>, token?: string) =>
    request<{ success: boolean; message: string; lead: Lead }>("/api/webhooks/lead", {
      method: "POST",
      headers: token ? { "Content-Type": "application/json", "x-webhook-token": token } : { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }),
  discoverLeadsWithAi: (params: { segment: string; city: string; state?: string; count?: number }) =>
    request<{ leads: ResolvedPlacePreview[] }>("/api/prospecting/ai-discover", {
      method: "POST",
      body: JSON.stringify(params)
    }),
  resolveMaps: (urls: string[]) => request<ResolvedPlacePreview[]>("/api/leads/resolve-maps", { method: "POST", body: JSON.stringify({ urls }) }),
  previewCsv: (content: string) => request<ResolvedPlacePreview[]>("/api/leads/preview/csv", { method: "POST", body: JSON.stringify({ content }) }),
  previewNotion: (databaseId?: string, apiKey?: string) => request<ResolvedPlacePreview[]>("/api/leads/preview/notion", { method: "POST", body: JSON.stringify({ databaseId, apiKey }) }),
  previewScraper: (content: string) => request<ResolvedPlacePreview[]>("/api/scraper/preview", { method: "POST", body: JSON.stringify({ content }) }),
  generateScraperQueries: (niche: string, cities?: string[]) => request<import("./types").ScraperQueryResult>("/api/scraper/generate-queries", { method: "POST", body: JSON.stringify({ niche, cities }) }),
  liveScrape: (query: string, city?: string, count?: number) => request<ResolvedPlacePreview[]>("/api/scraper/live", { method: "POST", body: JSON.stringify({ query, city, count }) }),
  notionStatus: () => request<{ configured: boolean; hasKey: boolean; hasDatabaseId: boolean }>("/api/notion/status"),
  batchAdd: (leads: Partial<Lead>[], autoAnalyze?: boolean) => request<{ created: number; leads: Lead[] }>("/api/leads/batch", { method: "POST", body: JSON.stringify({ leads, autoAnalyze }) }),
  interaction: (id: string, content: string) => request<Lead>(`/api/leads/${id}/interactions`, { method: "POST", body: JSON.stringify({ type: "note", content }) }),
  stage: (id: string, stage: Stage) => request<Lead>(`/api/leads/${id}`, { method: "PATCH", body: JSON.stringify({ stage }) }),
  auditLead: (id: string) => request<import("./types").LeadAuditResult>(`/api/leads/${id}/audit`, { method: "POST" }),
  getAudioScript: (id: string) => request<import("./types").AudioScriptResult>(`/api/leads/${id}/audio-script`, { method: "POST" }),
  getPublicProposal: (id: string) => request<import("./types").PublicProposalData>(`/api/proposals/${id}/public`),
  mcpStatus: () => request<import("./types").McpStatusResponse>("/api/mcp/status"),
  testMcpConnection: (token?: string) => request<import("./types").McpTestResponse>("/api/mcp/test-connection", { method: "POST", body: JSON.stringify({ token }) }),
  exportCsvUrl: () => `${apiBaseUrl}/api/leads/export/csv`
};
