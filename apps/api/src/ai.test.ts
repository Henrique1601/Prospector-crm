import { describe, expect, it } from "vitest";
import { demoBrief, localAnalysis } from "./ai.js";
import { seedLeads } from "./seed.js";

describe("análise local", () => {
  it("não afirma que uma empresa sem website cadastrado não tem site", () => {
    const result = localAnalysis(seedLeads()[5]!);
    expect(result.siteStatus).toBe("unknown");
    expect(result.reason).toContain("não possui site confirmado");
  });
  it("gera briefing com aviso de verificação", () => expect(demoBrief(seedLeads()[0]!)).toContain("confirmar serviços"));

  it("gera variações de abordagem com portfólio e contatos do Henrique", () => {
    const leadWithoutSite = seedLeads()[5]!;
    const analysis = localAnalysis(leadWithoutSite);

    expect(analysis.suggestedMessages).toBeDefined();
    expect(analysis.suggestedMessages?.portfolio).toContain("https://bezerraportifolio.netlify.app/");
    expect(analysis.suggestedMessages?.portfolio).toContain("vi que vocês ainda não possuem um site");
    expect(analysis.suggestedMessages?.short).toContain("https://bezerraportifolio.netlify.app/");
    expect(analysis.suggestedMessages?.direct).toContain("Henrique");

    const leadWithSite = {
      ...seedLeads()[0]!,
      website: "https://mecanicasilvajardim.com.br"
    };
    const analysisWithSite = localAnalysis(leadWithSite);
    expect(analysisWithSite.suggestedMessages?.portfolio).toContain("reparei no site de vocês");
    expect(analysisWithSite.suggestedMessages?.portfolio).toContain("https://bezerraportifolio.netlify.app/");
  });
});

