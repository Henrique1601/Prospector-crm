// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { vi, describe, expect, it } from "vitest";
import { BatchImportModal } from "./BatchImportModal";

describe("BatchImportModal", () => {
  it("renderiza as abas de importação incluindo Google Maps Scraper e permite navegar entre sub-modos", () => {
    const onClose = vi.fn();
    const onImported = vi.fn();

    render(<BatchImportModal onClose={onClose} onImported={onImported} />);

    // Check title and all tabs
    expect(screen.getByText(/Importar empresas para o Prospector/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Google Maps Scraper/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Links do Maps/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Planilha \/ CSV \/ TXT/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Banco Notion/i })).toBeInTheDocument();

    // Check Google Maps Scraper sub-modes
    expect(screen.getByRole("button", { name: /Importar Arquivo \(JSONL \/ CSV\)/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Busca Direta sem Docker \(Live\)/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Gerador de Queries & Docker/i })).toBeInTheDocument();

    // Switch to Busca Direta
    fireEvent.click(screen.getByRole("button", { name: /Busca Direta sem Docker \(Live\)/i }));
    expect(screen.getByRole("button", { name: /Buscar no Google Maps Agora/i })).toBeInTheDocument();

    // Switch to Links do Maps tab
    fireEvent.click(screen.getByRole("button", { name: /Links do Maps/i }));
    const textarea = screen.getByPlaceholderText(/Cole aqui os links:/i);
    fireEvent.change(textarea, {
      target: {
        value: "https://maps.app.goo.gl/test1\nhttps://www.google.com/maps/place/Oficina/@-23.95,-46.33,17z"
      }
    });
    expect(screen.getByText(/2 links detectados/i)).toBeInTheDocument();

    // Switch to CSV tab
    fireEvent.click(screen.getByRole("button", { name: /Planilha \/ CSV \/ TXT/i }));
    expect(screen.getByText(/Arraste o arquivo CSV ou TXT aqui/i)).toBeInTheDocument();

    // Switch to Notion tab
    fireEvent.click(screen.getByRole("button", { name: /Banco Notion/i }));
    expect(screen.getByText(/ID da Base de Dados do Notion/i)).toBeInTheDocument();
  });
});
