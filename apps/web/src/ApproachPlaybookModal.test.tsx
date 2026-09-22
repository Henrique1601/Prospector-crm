// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApproachPlaybookModal } from "./ApproachPlaybookModal";
import type { Lead } from "./types";

afterEach(cleanup);

const mockLead: Lead = {
  id: "lead-1",
  name: "Clínica Santos",
  segment: "Odontologia",
  city: "Santos",
  state: "SP",
  phone: "(13) 99123-4567",
  hasWhatsapp: true,
  whatsappUrl: "https://wa.me/5513991234567",
  stage: "new",
  score: 85,
  priority: "high",
  siteStatus: "none",
  digitalPresence: "low",
  sources: [],
  interactions: [],
  createdAt: "2026-09-22T00:00:00.000Z",
  updatedAt: "2026-09-22T00:00:00.000Z"
};

describe("ApproachPlaybookModal Component", () => {
  it("deve renderizar a central de abordagens com as perguntas de impacto do usuário", () => {
    render(
      <ApproachPlaybookModal
        leads={[mockLead]}
        currentLead={mockLead}
        onClose={vi.fn()}
        onSelectLead={vi.fn()}
      />
    );

    expect(screen.getByText(/Central de Abordagens Comerciais/i)).toBeInTheDocument();
    expect(screen.getAllByText(/1. Pergunta da Concorrência & Perda Invisível/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/2. E se o próximo cliente não te encontrar\?/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/3. Prontidão para novos clientes na internet/i).length).toBeGreaterThan(0);

    // Verifica se o texto dinâmico foi renderizado com os dados do mockLead
    expect(screen.getByText(/Posso te fazer uma pergunta rápida\?/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Clínica Santos/i).length).toBeGreaterThan(0);
  });

  it("deve permitir alternar para outra pergunta e atualizar o preview", () => {
    render(
      <ApproachPlaybookModal
        leads={[mockLead]}
        currentLead={mockLead}
        onClose={vi.fn()}
        onSelectLead={vi.fn()}
      />
    );

    const buttonQ2 = screen.getAllByText(/2. E se o próximo cliente não te encontrar\?/i)[0];
    fireEvent.click(buttonQ2);

    expect(screen.getByText(/E se o próximo cliente da sua empresa estiver procurando exatamente pelo que você oferece em Santos/i)).toBeInTheDocument();
  });
});
