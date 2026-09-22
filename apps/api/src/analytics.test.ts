import { describe, expect, it } from "vitest";
import type { Lead, Stage } from "./types.js";

describe("Conversion Analytics Calculation", () => {
  it("deve calcular taxas de conversão e win rate corretamente", () => {
    const mockLeads: Partial<Lead>[] = [
      { id: "1", stage: "won", city: "Santos", segment: "Clínicas" },
      { id: "2", stage: "proposal", city: "Santos", segment: "Clínicas" },
      { id: "3", stage: "replied", city: "São Vicente", segment: "Restaurantes" },
      { id: "4", stage: "contacted", city: "Praia Grande", segment: "Imobiliárias" },
      { id: "5", stage: "new", city: "Santos", segment: "Clínicas" }
    ];

    const totalLeads = mockLeads.length;
    const contactedLeads = mockLeads.filter((l) => !["new", "analyzed"].includes(l.stage as Stage)).length;
    const repliesCount = mockLeads.filter((l) => ["replied", "meeting", "proposal", "won"].includes(l.stage as Stage)).length;
    const wonCount = mockLeads.filter((l) => l.stage === "won").length;

    const overallWinRate = Math.round((wonCount / totalLeads) * 100);
    const contactToReplyRate = Math.round((repliesCount / contactedLeads) * 100);

    expect(totalLeads).toBe(5);
    expect(contactedLeads).toBe(4);
    expect(repliesCount).toBe(3);
    expect(wonCount).toBe(1);
    expect(overallWinRate).toBe(20); // 1 de 5 = 20%
    expect(contactToReplyRate).toBe(75); // 3 de 4 = 75%
  });
});
