// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, vi, describe, expect, it } from "vitest";
import { McpHubModal } from "./McpHubModal";
import { api } from "./api";

vi.mock("./api", () => ({
  api: {
    mcpStatus: vi.fn().mockResolvedValue({
      configured: true,
      keyPrefix: "secr...123",
      serverName: "prospector-crm",
      version: "1.0.0",
      transport: "Streamable HTTP (JSON-RPC 2.0)",
      endpoint: "/api/mcp",
      ingestionEndpoint: "/api/integrations/leads",
      tools: [
        {
          name: "list_leads",
          title: "Listar leads do CRM",
          description: "Consulta leads já cadastrados",
          readOnly: true,
          parameters: ["query", "stage", "limit"]
        },
        {
          name: "create_leads",
          title: "Cadastrar leads no CRM",
          description: "Cadastra leads com desduplicação",
          readOnly: false,
          parameters: ["leads", "autoAnalyze"]
        }
      ],
      stats: {
        totalLeads: 15,
        mcpLeadsCount: 3,
        recentMcpLeads: [
          {
            id: "lead-mcp-1",
            name: "Odonto Santos Prime",
            segment: "Odontologia",
            city: "Santos",
            stage: "new",
            createdAt: "2026-10-01T12:00:00.000Z"
          }
        ]
      }
    }),
    testMcpConnection: vi.fn().mockResolvedValue({
      ok: true,
      latencyMs: 14,
      toolsAvailable: ["list_leads", "create_leads"],
      message: "Conexão MCP operacional e autenticada com sucesso."
    })
  }
}));

describe("McpHubModal", () => {
  afterEach(() => {
    cleanup();
  });

  it("renderiza o status do servidor MCP e permite navegar entre as abas", async () => {
    const onClose = vi.fn();
    const onLeadSelect = vi.fn();

    render(<McpHubModal isOpen={true} onClose={onClose} onLeadSelect={onLeadSelect} />);

    // Header e status live
    expect(screen.getByText(/Servidor MCP & Conexões Externas/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/ONLINE • STREAMABLE HTTP/i)).toBeInTheDocument();
    });

    // Abas presentes
    expect(screen.getByRole("button", { name: /Tools Registradas/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Configuração em 1 Clique/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Leads via Agentes/i })).toBeInTheDocument();

    // Na aba tools, exibe list_leads e create_leads
    expect(screen.getByText("list_leads")).toBeInTheDocument();
    expect(screen.getByText("create_leads")).toBeInTheDocument();

    // Navega para aba Snippets
    fireEvent.click(screen.getByRole("button", { name: /Configuração em 1 Clique/i }));
    expect(screen.getByText("Claude Desktop")).toBeInTheDocument();
    expect(screen.getByText("Cursor / IDE")).toBeInTheDocument();
    expect(screen.getByText("cURL / n8n / API")).toBeInTheDocument();
    expect(screen.getAllByText(/claude_desktop_config\.json/i).length).toBeGreaterThanOrEqual(1);

    // Navega para aba Leads via Agentes
    fireEvent.click(screen.getByRole("button", { name: /Leads via Agentes/i }));
    expect(screen.getByText("Odonto Santos Prime")).toBeInTheDocument();
    expect(screen.getByText(/Odontologia • Santos/i)).toBeInTheDocument();

    // Clica no lead para selecionar
    fireEvent.click(screen.getByText("Odonto Santos Prime"));
    expect(onLeadSelect).toHaveBeenCalledWith("lead-mcp-1");
    expect(onClose).toHaveBeenCalled();
  });

  it("executa o teste de conexão ativa ao clicar no botão", async () => {
    const onClose = vi.fn();
    render(<McpHubModal isOpen={true} onClose={onClose} />);

    const testButtons = screen.getAllByRole("button", { name: /Testar Conexão/i });
    fireEvent.click(testButtons[0]);

    await waitFor(() => {
      expect(api.testMcpConnection).toHaveBeenCalled();
      expect(screen.getByText(/Conexão Verificada com Sucesso/i)).toBeInTheDocument();
      expect(screen.getByText("14ms")).toBeInTheDocument();
    });
  });
});
