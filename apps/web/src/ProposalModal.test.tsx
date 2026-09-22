// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProposalModal } from "./ProposalModal";
import { ObjectionsAssistant } from "./ObjectionsAssistant";
import type { Lead } from "./types";

afterEach(cleanup);

const mockLead: Lead = {
  id: "lead-1",
  name: "Auto Center Litoral",
  segment: "Oficina Mecânica",
  city: "Santos",
  state: "SP",
  phone: "(13) 99123-4567",
  whatsappUrl: "https://wa.me/5513991234567",
  hasWhatsapp: true,
  website: "https://autocenterlitoral.com.br",
  siteStatus: "good",
  digitalPresence: "medium",
  stage: "proposal",
  score: 85,
  priority: "high",
  sources: [],
  interactions: [],
  createdAt: "2026-09-20T10:00:00Z",
  updatedAt: "2026-09-20T10:00:00Z"
};

describe("ProposalModal", () => {
  it("renderiza credenciais oficiais de Henrique e dados do cliente", () => {
    render(<ProposalModal lead={mockLead} onClose={() => {}} />);

    // Official credentials check
    expect(screen.getAllByText(/Henrique Bezerra dos Santos/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/\(13\) 99138-3222/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/henriquebs1601@gmail\.com/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/bezerraportifolio\.netlify\.app/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/linkedin\.com\/in\/henriquebezerra-dev/i).length).toBeGreaterThan(0);

    // Client info
    expect(screen.getAllByText(/Auto Center Litoral/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Oficina Mecânica · Santos, SP/i).length).toBeGreaterThan(0);

    // Action buttons
    expect(screen.getByRole("button", { name: /Imprimir \/ Salvar em PDF/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Copiar Texto/i })).toBeInTheDocument();
  });
});

describe("ObjectionsAssistant", () => {
  it("renderiza lista de contornos de objeções personalizadas com nome do lead", () => {
    render(<ObjectionsAssistant lead={mockLead} />);

    expect(screen.getByText(/Assistente de Objeções/i)).toBeInTheDocument();
    expect(screen.getByText(/Achei caro \/ Tá fora do orçamento/i)).toBeInTheDocument();
    expect(screen.getByText(/Já tenho Instagram, não preciso de site/i)).toBeInTheDocument();
    expect(screen.getByText(/Não sei se site dá retorno no meu ramo/i)).toBeInTheDocument();
  });
});
