import { describe, expect, it } from "vitest";
import type { Lead } from "./types.js";

describe("Exportação CSV", () => {
  it("formata leads em CSV com delimitador ponto e vírgula e BOM UTF-8", () => {
    const leads: Lead[] = [
      {
        id: "1",
        name: "Restaurante Bom Sabor, Ltda",
        segment: "Restaurante",
        city: "Santos",
        state: "SP",
        phone: "(13) 99123-4567",
        whatsappUrl: "https://wa.me/5513991234567",
        hasWhatsapp: true,
        website: "https://bomsabor.com.br",
        siteStatus: "good",
        stage: "proposal",
        score: 85,
        priority: "high",
        nextAction: "Apresentar proposta",
        nextFollowUp: "2026-09-25",
        demoUrl: "https://preview--restaurante-demo.lovable.app",
        digitalPresence: "medium",
        sources: [],
        interactions: [],
        createdAt: "2026-09-20T10:00:00.000Z",
        updatedAt: "2026-09-20T10:00:00.000Z"
      }
    ];

    const escapeCsv = (val: unknown) => {
      if (val === null || val === undefined) return "";
      const str = String(val);
      if (str.includes(";") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = [
      "Nome", "Segmento", "Cidade", "UF", "Endereço", "Telefone", "WhatsApp",
      "Tem WhatsApp", "Site", "Status do Site", "Estágio", "Score", "Prioridade",
      "Próxima Ação", "Próximo Follow-up", "URL Demonstração", "Criado Em"
    ];

    const rows = leads.map((l) => [
      l.name,
      l.segment,
      l.city,
      l.state,
      l.address || "",
      l.phone || "",
      l.whatsappUrl || "",
      l.hasWhatsapp ? "Sim" : "Não",
      l.website || "",
      l.siteStatus,
      l.stage,
      l.score,
      l.priority,
      l.nextAction || "",
      l.nextFollowUp || "",
      l.demoUrl || "",
      l.createdAt ? new Date(l.createdAt).toLocaleDateString("pt-BR") : ""
    ]);

    const csvContent = "\uFEFF" + [
      headers.map(escapeCsv).join(";"),
      ...rows.map((row) => row.map(escapeCsv).join(";"))
    ].join("\r\n");

    expect(csvContent.startsWith("\uFEFF")).toBe(true);
    expect(csvContent).toContain("Nome;Segmento;Cidade;UF;Endereço;Telefone");
    expect(csvContent).toContain("URL Demonstração");
    // Escaped due to comma in name
    expect(csvContent).toContain("Restaurante Bom Sabor, Ltda");
    expect(csvContent).toContain("https://preview--restaurante-demo.lovable.app");
    expect(csvContent).toContain("https://wa.me/5513991234567");
  });
});
