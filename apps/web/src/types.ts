export type Stage = "new" | "analyzed" | "contacted" | "replied" | "meeting" | "proposal" | "won" | "lost";
export interface Interaction { id: string; type: string; content: string; createdAt: string }
export interface Lead {
  id: string; name: string; segment: string; city: string; state: string; address?: string; mapsUrl?: string;
  website?: string; phone?: string; whatsappUrl?: string; hasWhatsapp?: boolean; stage: Stage; score: number;
  priority: "low" | "medium" | "high" | "urgent";
  siteStatus: "unknown" | "none" | "weak" | "good"; digitalPresence: string; opportunity?: string; reason?: string;
  suggestedMessage?: string; nextAction?: string; nextFollowUp?: string; sources: string[]; interactions: Interaction[];
  demoBrief?: string; createdAt: string; updatedAt: string; analyzedAt?: string;
}
export interface ResolvedPlacePreview {
  sourceUrl: string;
  name: string;
  segment: string;
  city: string;
  state: string;
  address?: string;
  mapsUrl: string;
  website?: string;
  phone?: string;
  hasWhatsapp?: boolean;
  whatsappUrl?: string;
  siteStatus: "unknown" | "none" | "weak" | "good";
  digitalPresence: string;
  isDuplicate?: boolean;
  duplicateReason?: string;
  error?: string;
}
export interface DashboardData { total: number; highPriority: number; contacted: number; replies: number; won: number; responseRate: number; stages: Record<Stage, number> }

