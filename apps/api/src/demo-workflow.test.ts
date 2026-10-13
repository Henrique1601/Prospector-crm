import { describe, expect, it } from "vitest";
import { localDemoPackage } from "./ai.js";
import type { Lead } from "./types.js";

const lead: Lead = {
  id: "lead-demo",
  name: "Oficina Exemplo",
  segment: "Oficina mecânica",
  city: "Santos",
  state: "SP",
  phone: "(13) 99999-0000",
  website: "https://oficina.example",
  stage: "replied",
  score: 88,
  priority: "high",
  siteStatus: "weak",
  digitalPresence: "medium",
  opportunity: "Melhorar conversão no WhatsApp",
  sources: [],
  interactions: [],
  createdAt: "2026-10-13T12:00:00.000Z",
  updatedAt: "2026-10-13T12:00:00.000Z"
};

describe("pacote de demonstração", () => {
  it("gera resumo, prompt seguro e mensagem com referência local", () => {
    const result = localDemoPackage(lead, "landing_page", "quotes");

    expect(result.strategicSummary).toContain("Oficina Exemplo");
    expect(result.prompt).toContain("Não invente");
    expect(result.prompt).toContain("https://oficina.example");
    expect(result.offerMessage).toContain("JM Motors");
    expect(result.nextStep).toContain("Revisar");
  });

  it("mantém informações ausentes marcadas como não confirmadas", () => {
    const result = localDemoPackage({ ...lead, website: undefined, address: undefined }, "catalog", "orders");

    expect(result.prompt).toContain("não possui site oficial confirmado");
    expect(result.prompt).toContain("Endereço: não confirmado");
    expect(result.prompt).toContain("receber pedidos");
  });
});
