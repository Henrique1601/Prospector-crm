import { describe, expect, it } from "vitest";
import { localAnalysis } from "./ai.js";
import { classifyWebsite, detectWhatsappAndPhone } from "./maps.js";

describe("Webhook Lead Processing", () => {
  it("deve normalizar e qualificar payload de formulário externo via webhook", () => {
    const payload = {
      empresa: "Clínica Odonto Santos",
      segmento: "Odontologia",
      cidade: "Santos",
      telefone: "13991234567",
      mensagem: "Gostaria de saber mais sobre criação de site"
    };

    const phoneDetection = detectWhatsappAndPhone(payload.telefone, undefined);
    const siteInfo = classifyWebsite(undefined);

    expect(phoneDetection.hasWhatsapp).toBe(true);
    expect(phoneDetection.whatsappUrl).toBe("https://wa.me/5513991234567");
    expect(siteInfo.siteStatus).toBe("none");

    const lead = {
      id: "test-webhook-lead",
      name: payload.empresa,
      segment: payload.segmento,
      city: payload.cidade,
      state: "SP",
      phone: payload.telefone,
      whatsappUrl: phoneDetection.whatsappUrl,
      hasWhatsapp: phoneDetection.hasWhatsapp,
      stage: "new" as const,
      score: 75,
      priority: "high" as const,
      siteStatus: siteInfo.siteStatus,
      digitalPresence: "low" as const,
      sources: ["Webhook Externo"],
      interactions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const analysis = localAnalysis(lead);
    expect(analysis.suggestedMessages?.curiosity).toBeDefined();
    expect(analysis.suggestedMessages?.invisible_loss).toBeDefined();
    expect(analysis.suggestedMessages?.ready_question).toBeDefined();

    expect(analysis.suggestedMessages?.curiosity).toContain("Posso te fazer uma pergunta rápida?");
    expect(analysis.suggestedMessages?.invisible_loss).toContain("E se o próximo cliente da sua empresa estiver procurando exatamente");
    expect(analysis.suggestedMessages?.ready_question).toContain("já está pronta para ser encontrada por novos clientes na internet?");
  });
});
