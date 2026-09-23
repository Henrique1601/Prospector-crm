// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ObjectionsAssistant } from "./ObjectionsAssistant";
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

describe("ObjectionsAssistant Component", () => {
  it("deve renderizar o cabeçalho e os contornos de objeções principais", () => {
    render(<ObjectionsAssistant lead={mockLead} />);

    expect(screen.getByText(/Assistente de Objeções \(WhatsApp\)/i)).toBeInTheDocument();
    expect(screen.getByText(/5 contornos/i)).toBeInTheDocument();
    expect(screen.getByText(/Achei caro \/ Tá fora do orçamento agora/i)).toBeInTheDocument();
    expect(screen.getByText(/Já tenho Instagram, não preciso de site/i)).toBeInTheDocument();
  });

  it("deve permitir copiar a resposta e disparar callback de interação", async () => {
    const onLoggedInteraction = vi.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined)
      }
    });

    render(<ObjectionsAssistant lead={mockLead} onLoggedInteraction={onLoggedInteraction} />);

    // Por padrão o primeiro contorno ("caro") está aberto
    const copyButton = screen.getByRole("button", { name: /Copiar resposta/i });
    expect(copyButton).toBeInTheDocument();

    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
      expect(onLoggedInteraction).toHaveBeenCalledWith(expect.stringContaining("Copiou contorno de objeção"));
      expect(screen.getByText(/Copiado!/i)).toBeInTheDocument();
    });
  });

  it("deve exibir botão de envio direto no WhatsApp com link wa.me formatado", () => {
    render(<ObjectionsAssistant lead={mockLead} />);

    const waLink = screen.getByRole("link", { name: /Enviar no WhatsApp/i });
    expect(waLink).toBeInTheDocument();
    expect(waLink).toHaveAttribute("href", expect.stringContaining("https://wa.me/5513991234567"));
  });
});
