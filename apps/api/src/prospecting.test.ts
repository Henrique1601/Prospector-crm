import { describe, expect, it } from "vitest";
import { discoverProspectingLeads } from "./prospecting.js";
import type { Lead } from "./types.js";

describe("IA de Prospecção Autônoma (discoverProspectingLeads)", () => {
  it("descobre estabelecimentos do nicho odontológico em Santos sem duplicatas", async () => {
    const existingLeads: Lead[] = [
      {
        id: "lead-1",
        name: "Clínica OdontoSantista",
        segment: "Clínica odontológica",
        city: "Santos",
        state: "SP",
        stage: "new",
        score: 80,
        priority: "high",
        siteStatus: "none",
        digitalPresence: "low",
        sources: [],
        interactions: [],
        createdAt: "",
        updatedAt: ""
      }
    ];

    const results = await discoverProspectingLeads({
      segment: "Clínicas odontológicas",
      city: "Santos",
      count: 3,
      existingLeads
    });

    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.length).toBeLessThanOrEqual(3);

    // Garante que não inclui a duplicata
    const hasDuplicate = results.some((r) => r.name.toLowerCase() === "clínica odontosantista");
    expect(hasDuplicate).toBe(false);

    // Garante propriedades esperadas
    const first = results[0];
    expect(first.name).toBeTruthy();
    expect(first.city).toBe("Santos");
    expect(first.hasWhatsapp).toBe(true);
    expect(first.whatsappUrl).toMatch(/^https:\/\/wa\.me\/55/);
    expect(first.score).toBeGreaterThan(50);
  }, 10000);

  it("retorna empresas com whatsappUrl formatado e pronto para contato", async () => {
    const results = await discoverProspectingLeads({
      segment: "Oficinas mecânicas",
      city: "Praia Grande",
      count: 2,
      existingLeads: []
    });

    expect(results.length).toBeGreaterThanOrEqual(1);
    for (const lead of results) {
      expect(lead.hasWhatsapp).toBe(true);
      expect(lead.whatsappUrl).toContain("wa.me");
      expect(lead.suggestedMessage).toBeTruthy();
      expect(lead.opportunity).toBeTruthy();
    }
  }, 10000);
});
