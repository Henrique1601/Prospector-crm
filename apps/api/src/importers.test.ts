import { describe, expect, it } from "vitest";
import { parseCsvRows, parseCsvToLeads } from "./importers.js";
import type { Lead } from "./types.js";

describe("Parser de Linhas CSV", () => {
  it("separa colunas por vírgula", () => {
    const csv = "Empresa,Cidade\nBarbearia Santos,Santos";
    const rows = parseCsvRows(csv);
    expect(rows).toEqual([
      ["Empresa", "Cidade"],
      ["Barbearia Santos", "Santos"]
    ]);
  });

  it("detecta e separa colunas por ponto e vírgula", () => {
    const csv = "Empresa;Segmento;Cidade\nAuto Mecânica;Oficina;Santos";
    const rows = parseCsvRows(csv);
    expect(rows).toEqual([
      ["Empresa", "Segmento", "Cidade"],
      ["Auto Mecânica", "Oficina", "Santos"]
    ]);
  });

  it("respeita valores entre aspas contendo delimitadores", () => {
    const csv = '"Mecânica Silva, Filial 1";Santos\n"Padaria & Cia; Ltda";São Vicente';
    const rows = parseCsvRows(csv);
    expect(rows.length).toBe(2);
    expect(rows[0]?.[0]).toBe("Mecânica Silva, Filial 1");
    expect(rows[1]?.[0]).toBe("Padaria & Cia; Ltda");
  });
});

describe("Conversão de CSV para Leads", () => {
  it("mapeia colunas comuns em português e detecta WhatsApp", () => {
    const csv = `Nome;Segmento;Cidade;UF;Telefone;Site
Barbearia do Porto;Barbearia;Santos;SP;(13) 99712-3456;https://barbeariadoporto.com.br
Oficina Mecânica Express;Oficina;Santos;SP;(13) 3222-1100;
`;
    const leads = parseCsvToLeads(csv);
    expect(leads.length).toBe(2);

    const lead1 = leads[0]!;
    expect(lead1.name).toBe("Barbearia do Porto");
    expect(lead1.city).toBe("Santos");
    expect(lead1.hasWhatsapp).toBe(true);
    expect(lead1.whatsappUrl).toBe("https://wa.me/5513997123456");
    expect(lead1.siteStatus).toBe("good");

    const lead2 = leads[1]!;
    expect(lead2.name).toBe("Oficina Mecânica Express");
    expect(lead2.hasWhatsapp).toBe(false);
    expect(lead2.siteStatus).toBe("none");
  });

  it("identifica duplicatas existentes no banco", () => {
    const existing: Lead[] = [
      {
        id: "lead-1",
        name: "Auto Elétrica Mathias",
        segment: "Auto elétrica",
        city: "Santos",
        state: "SP",
        stage: "new",
        score: 0,
        priority: "low",
        siteStatus: "unknown",
        digitalPresence: "unknown",
        sources: [],
        interactions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    const csv = "Empresa,Cidade\nAuto Elétrica Mathias,Santos\nNova Oficina,Santos";
    const leads = parseCsvToLeads(csv, existing);

    expect(leads[0]?.isDuplicate).toBe(true);
    expect(leads[1]?.isDuplicate).toBe(false);
  });
});
