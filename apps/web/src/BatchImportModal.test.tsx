// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { vi, describe, expect, it } from "vitest";
import { BatchImportModal } from "./BatchImportModal";

describe("BatchImportModal", () => {
  it("renderiza as abas de importação (Maps, CSV, Notion) e detecta links do Google Maps", () => {
    const onClose = vi.fn();
    const onImported = vi.fn();

    render(<BatchImportModal onClose={onClose} onImported={onImported} />);

    // Check title and tabs
    expect(screen.getByText(/Importar empresas para o Prospector/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Google Maps/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Planilha \/ CSV \/ TXT/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Banco Notion/i })).toBeInTheDocument();

    // Check Google Maps link detection
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
