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
});
