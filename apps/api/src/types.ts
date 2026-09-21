export const stages = ["new", "analyzed", "contacted", "replied", "meeting", "proposal", "won", "lost"] as const;
export type Stage = (typeof stages)[number];
export type Priority = "low" | "medium" | "high" | "urgent";
export type SiteStatus = "unknown" | "none" | "weak" | "good";

export interface Interaction {
  id: string;
  type: "note" | "whatsapp" | "email" | "call" | "meeting" | "reply";
  content: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  segment: string;
  city: string;
  state: string;
  address?: string;
  mapsUrl?: string;
  website?: string;
  phone?: string;
  stage: Stage;
  score: number;
  priority: Priority;
  siteStatus: SiteStatus;
  digitalPresence: "unknown" | "low" | "medium" | "high";
  opportunity?: string;
  reason?: string;
  suggestedMessage?: string;
  nextAction?: string;
  nextFollowUp?: string;
  sources: string[];
  interactions: Interaction[];
  demoBrief?: string;
  createdAt: string;
  updatedAt: string;
  analyzedAt?: string;
}

export interface Store { leads: Lead[] }
