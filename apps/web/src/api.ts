import type { DashboardData, Lead, ResolvedPlacePreview, Stage } from "./types";

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
  health: () => request<{ ok: boolean; ai: boolean; mode: string; storage: "local-file" | "temporary" | "neon"; googleMaps?: boolean }>("/api/health"),
  analyze: (id: string) => request<Lead>(`/api/leads/${id}/analyze`, { method: "POST" }),
  demo: (id: string) => request<Lead>(`/api/leads/${id}/demo`, { method: "POST" }),
  update: (id: string, body: Partial<Lead>) => request<Lead>(`/api/leads/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  add: (body: Partial<Lead>) => request<Lead>("/api/leads", { method: "POST", body: JSON.stringify(body) }),
  resolveMaps: (urls: string[]) => request<ResolvedPlacePreview[]>("/api/leads/resolve-maps", { method: "POST", body: JSON.stringify({ urls }) }),
  previewCsv: (content: string) => request<ResolvedPlacePreview[]>("/api/leads/preview/csv", { method: "POST", body: JSON.stringify({ content }) }),
  previewNotion: (databaseId?: string, apiKey?: string) => request<ResolvedPlacePreview[]>("/api/leads/preview/notion", { method: "POST", body: JSON.stringify({ databaseId, apiKey }) }),
  notionStatus: () => request<{ configured: boolean; hasKey: boolean; hasDatabaseId: boolean }>("/api/notion/status"),
  batchAdd: (leads: Partial<Lead>[], autoAnalyze?: boolean) => request<{ created: number; leads: Lead[] }>("/api/leads/batch", { method: "POST", body: JSON.stringify({ leads, autoAnalyze }) }),
  interaction: (id: string, content: string) => request<Lead>(`/api/leads/${id}/interactions`, { method: "POST", body: JSON.stringify({ type: "note", content }) }),
  stage: (id: string, stage: Stage) => request<Lead>(`/api/leads/${id}`, { method: "PATCH", body: JSON.stringify({ stage }) })
};

