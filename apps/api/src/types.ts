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

export interface SuggestedMessages {
  portfolio?: string;
  short?: string;
  direct?: string;
  curiosity?: string;
  invisible_loss?: string;
  ready_question?: string;
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
  whatsappUrl?: string;
  hasWhatsapp?: boolean;
  stage: Stage;
  score: number;
  priority: Priority;
  siteStatus: SiteStatus;
  digitalPresence: "unknown" | "low" | "medium" | "high";
  opportunity?: string;
  reason?: string;
  suggestedMessage?: string;
  suggestedMessages?: SuggestedMessages;
  nextAction?: string;
  nextFollowUp?: string;
  sources: string[];
  interactions: Interaction[];
  demoBrief?: string;
  demoUrl?: string;
  createdAt: string;
  updatedAt: string;
  analyzedAt?: string;
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
  demoUrl?: string;
  siteStatus: SiteStatus;
  digitalPresence: "unknown" | "low" | "medium" | "high";
  isDuplicate?: boolean;
  duplicateReason?: string;
  error?: string;
  opportunity?: string;
  score?: number;
  priority?: Priority;
  suggestedMessage?: string;
}

export interface Store {
  leads: Lead[];
}

export interface CityConversionStats {
  city: string;
  total: number;
  contacted: number;
  replies: number;
  won: number;
  responseRate: number;
  winRate: number;
}

export interface SegmentConversionStats {
  segment: string;
  total: number;
  contacted: number;
  replies: number;
  won: number;
  responseRate: number;
  winRate: number;
}

export interface ConversionAnalytics {
  totalLeads: number;
  contactedLeads: number;
  repliesCount: number;
  proposalsCount: number;
  wonCount: number;
  lostCount: number;
  overallWinRate: number;
  contactToReplyRate: number;
  replyToProposalRate: number;
  proposalToWonRate: number;
  cities: CityConversionStats[];
  segments: SegmentConversionStats[];
}
