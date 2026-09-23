export type Stage = "new" | "analyzed" | "contacted" | "replied" | "meeting" | "proposal" | "won" | "lost";
export type Priority = "low" | "medium" | "high" | "urgent";

export interface Interaction {
  id: string;
  type: string;
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
  priority: "low" | "medium" | "high" | "urgent";
  siteStatus: "unknown" | "none" | "weak" | "good";
  digitalPresence: string;
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
  siteStatus: "unknown" | "none" | "weak" | "good";
  digitalPresence: string;
  isDuplicate?: boolean;
  duplicateReason?: string;
  error?: string;
  opportunity?: string;
  score?: number;
  priority?: Priority;
  suggestedMessage?: string;
}

export interface DashboardData {
  total: number;
  highPriority: number;
  contacted: number;
  replies: number;
  won: number;
  responseRate: number;
  stages: Record<Stage, number>;
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
