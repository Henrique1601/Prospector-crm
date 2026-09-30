import { describe, expect, it } from "vitest";
import { findDuplicateLead, isValidIntegrationToken } from "./integration.js";
import type { Lead } from "./types.js";

const baseLead: Lead = {
  id: "lead-1",
  name: "Clínica São José",
  segment: "Clínica",
  city: "Santos",
  state: "SP",
  address: "Rua das Flores, 10",
  mapsUrl: "https://maps.google.com/place/clinica-sao-jose",
  phone: "(13) 99999-0000",
  stage: "new",
  score: 0,
  priority: "low",
  siteStatus: "unknown",
  digitalPresence: "unknown",
  sources: [],
  interactions: [],
  createdAt: "2026-09-30T12:00:00.000Z",
  updatedAt: "2026-09-30T12:00:00.000Z"
};

describe("autenticação da integração", () => {
  it("aceita apenas o Bearer token configurado", () => {
    expect(isValidIntegrationToken("Bearer segredo-forte", "segredo-forte")).toBe(true);
    expect(isValidIntegrationToken("Bearer token-errado", "segredo-forte")).toBe(false);
    expect(isValidIntegrationToken(undefined, "segredo-forte")).toBe(false);
    expect(isValidIntegrationToken("Bearer segredo-forte", undefined)).toBe(false);
  });
});

describe("deduplicação da integração", () => {
  it("detecta Maps, telefone e nome/cidade normalizados", () => {
    expect(findDuplicateLead([baseLead], { mapsUrl: `${baseLead.mapsUrl}/` })?.reason).toBe("mapsUrl");
    expect(findDuplicateLead([baseLead], { phone: "+55 13 99999-0000" })?.reason).toBe("phone");
    expect(findDuplicateLead([baseLead], { name: "Clinica Sao Jose", city: "SANTOS" })?.reason).toBe("name_city");
  });

  it("não confunde empresas diferentes", () => {
    expect(findDuplicateLead([baseLead], {
      name: "Clínica São José",
      city: "São Vicente",
      phone: "(13) 98888-0000"
    })).toBeUndefined();
  });
});
