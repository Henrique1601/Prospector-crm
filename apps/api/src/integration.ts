import { timingSafeEqual } from "node:crypto";
import type { Lead } from "./types.js";

function normalizeText(value?: string) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizeUrl(value?: string) {
  if (!value) return "";
  try {
    const url = new URL(value);
    url.hash = "";
    url.searchParams.sort();
    return url.toString().replace(/\/$/, "").toLowerCase();
  } catch {
    return value.trim().replace(/\/$/, "").toLowerCase();
  }
}

function normalizePhone(value?: string) {
  const digits = (value || "").replace(/\D/g, "");
  if (!digits) return "";
  return digits.startsWith("55") ? digits.slice(2) : digits;
}

export function isValidIntegrationToken(authorization: string | undefined, configuredKey: string | undefined) {
  if (!configuredKey || !authorization?.startsWith("Bearer ")) return false;
  const provided = authorization.slice("Bearer ".length).trim();
  const expectedBuffer = Buffer.from(configuredKey);
  const providedBuffer = Buffer.from(provided);
  return expectedBuffer.length === providedBuffer.length && timingSafeEqual(expectedBuffer, providedBuffer);
}

export function findDuplicateLead(existingLeads: Lead[], candidate: Partial<Lead>) {
  const candidateMaps = normalizeUrl(candidate.mapsUrl);
  const candidatePhone = normalizePhone(candidate.phone || candidate.whatsappUrl);
  const candidateName = normalizeText(candidate.name);
  const candidateCity = normalizeText(candidate.city);
  const candidateAddress = normalizeText(candidate.address);

  for (const lead of existingLeads) {
    if (candidateMaps && normalizeUrl(lead.mapsUrl) === candidateMaps) {
      return { lead, reason: "mapsUrl" as const };
    }

    const leadPhone = normalizePhone(lead.phone || lead.whatsappUrl);
    if (candidatePhone && leadPhone && leadPhone === candidatePhone) {
      return { lead, reason: "phone" as const };
    }

    const sameNameAndCity = candidateName
      && candidateCity
      && normalizeText(lead.name) === candidateName
      && normalizeText(lead.city) === candidateCity;
    if (sameNameAndCity) {
      const leadAddress = normalizeText(lead.address);
      if (!candidateAddress || !leadAddress || candidateAddress === leadAddress) {
        return { lead, reason: "name_city" as const };
      }
    }
  }

  return undefined;
}
