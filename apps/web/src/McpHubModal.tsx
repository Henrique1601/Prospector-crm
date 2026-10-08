import { useEffect, useState } from "react";
import {
  Activity,
  Bot,
  Check,
  ChevronRight,
  Code2,
  Copy,
  ExternalLink,
  Flame,
  Layers,
  Loader2,
  Plug,
  RefreshCw,
  Server,
  ShieldCheck,
  Terminal,
  Zap,
  X
} from "lucide-react";
import { api } from "./api";
import type { McpStatusResponse, McpTestResponse } from "./types";

interface McpHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadSelect?: (leadId: string) => void;
}

type TabType = "tools" | "snippets" | "logs";
type ClientType = "claude" | "cursor" | "curl";

export function McpHubModal({ isOpen, onClose, onLeadSelect }: McpHubModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("tools");
  const [activeClient, setActiveClient] = useState<ClientType>("claude");
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<McpStatusResponse | null>(null);
  const [testResult, setTestResult] = useState<McpTestResponse | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState("");

  const loadStatus = async () => {
    try {
      setLoading(true);
      const data = await api.mcpStatus();
      setStatus(data);
    } catch {
      // Ignora erro silenciosamente ou mantém fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadStatus();
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      const res = await api.testMcpConnection(tokenInput || undefined);
      setTestResult(res);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Falha na verificação";
      setTestResult({
        ok: false,
        latencyMs: 0,
        message
      });
    } finally {
      setTesting(false);
    }
  };

  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "http://localhost:5173";
  const apiEndpointUrl = `${currentOrigin}/api/mcp`;

  const claudeDesktopConfig = JSON.stringify(
    {
      mcpServers: {
        "prospector-crm": {
          url: apiEndpointUrl,
          headers: {
            Authorization: `Bearer ${status?.keyPrefix ? "SUA_CHAVE_AQUI" : "SUA_CHAVE_AQUI"}`
          }
        }
      }
    },
    null,
    2
  );

  const cursorConfig = JSON.stringify(
    {
      mcpServers: {
        "prospector-crm": {
          type: "http",
          url: apiEndpointUrl,
          headers: {
            Authorization: "Bearer SUA_CHAVE_AQUI"
          }
        }
      }
    },
    null,
    2
  );

  const curlSnippet = `curl -X POST "${apiEndpointUrl}" \\
  -H "Authorization: Bearer SUA_CHAVE_AQUI" \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "list_leads",
      "arguments": { "limit": 5 }
    }
  }'`;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="mcp-hub-modal" onClick={(e) => e.stopPropagation()}>
        {/* Moldura Externa Double-Bezel */}
        <div className="mcp-hub-shell">
          <div className="mcp-hub-header">
            <div className="mcp-hub-title-group">
              <div className="mcp-hub-icon-badge">
                <Plug size={22} className="text-mint" />
              </div>
              <div>
                <span className="eyebrow-accent">Central de Integrações & Agentes</span>
                <h2 className="mcp-hub-title">Servidor MCP & Conexões Externas</h2>
              </div>
            </div>

            <div className="mcp-hub-actions-top">
              <button
                type="button"
                className="btn-icon-subtle"
                onClick={loadStatus}
                title="Atualizar status"
                disabled={loading}
              >
                <RefreshCw size={16} className={loading ? "spin" : ""} />
              </button>
              <button
                type="button"
                className="btn-icon-subtle"
                onClick={onClose}
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Banner de Status Operacional Live */}
          <div className="mcp-status-banner">
            <div className="mcp-status-info">
              <div className="mcp-status-pill-row">
                <span className={`status-pill ${status?.configured ? "status-pill-online" : "status-pill-warning"}`}>
                  <span className="status-dot-pulse" />
                  {status?.configured ? "ONLINE • STREAMABLE HTTP" : "CONFIGURAÇÃO PENDENTE"}
                </span>
                <span className="mcp-version-badge">v{status?.version || "1.0.0"}</span>
                <span className="mcp-transport-badge">JSON-RPC 2.0</span>
              </div>
              <p className="mcp-endpoint-preview">
                <strong>Endpoint:</strong> <code>{apiEndpointUrl}</code>
                <button
                  type="button"
                  className="btn-copy-tiny"
                  onClick={() => handleCopy(apiEndpointUrl, "endpoint")}
                >
                  {copiedKey === "endpoint" ? <Check size={12} className="text-mint" /> : <Copy size={12} />}
                  <span>{copiedKey === "endpoint" ? "Copiado" : "Copiar"}</span>
                </button>
              </p>
            </div>

            <div className="mcp-test-quick">
              <button
                type="button"
                className="btn-mcp-test"
                onClick={handleTestConnection}
                disabled={testing}
              >
                {testing ? <Loader2 size={14} className="spin" /> : <Zap size={14} />}
                <span>{testing ? "Testando..." : "Testar Conexão"}</span>
              </button>
            </div>
          </div>

          {/* Resultado do Teste de Conexão */}
          {testResult && (
            <div className={`mcp-test-feedback ${testResult.ok ? "test-success" : "test-error"}`}>
              <div className="test-feedback-header">
                {testResult.ok ? <ShieldCheck size={16} className="text-mint" /> : <Activity size={16} className="text-coral" />}
                <strong>{testResult.ok ? "Conexão Verificada com Sucesso" : "Falha na Verificação"}</strong>
                {testResult.latencyMs > 0 && (
                  <span className="latency-badge">{testResult.latencyMs}ms</span>
                )}
              </div>
              <p className="test-feedback-body">{testResult.message}</p>
            </div>
          )}

          {/* Barra de Abas do Hub */}
          <div className="mcp-tabs-bar">
            <button
              type="button"
              className={`mcp-tab-btn ${activeTab === "tools" ? "active" : ""}`}
              onClick={() => setActiveTab("tools")}
            >
              <Bot size={15} />
              <span>Tools Registradas ({status?.tools.length || 2})</span>
            </button>
            <button
              type="button"
              className={`mcp-tab-btn ${activeTab === "snippets" ? "active" : ""}`}
              onClick={() => setActiveTab("snippets")}
            >
              <Code2 size={15} />
              <span>Configuração em 1 Clique</span>
            </button>
            <button
              type="button"
              className={`mcp-tab-btn ${activeTab === "logs" ? "active" : ""}`}
              onClick={() => setActiveTab("logs")}
            >
              <Layers size={15} />
              <span>Leads via Agentes ({status?.stats?.mcpLeadsCount || 0})</span>
            </button>
          </div>

          {/* Conteúdo das Abas */}
          <div className="mcp-tab-body">
            {activeTab === "tools" && (
              <div className="mcp-tools-tab">
                <p className="mcp-tools-intro">
                  O Prospector CRM expõe ferramentas padronizadas pelo <strong>Model Context Protocol (MCP)</strong> oficial.
                  Agentes de IA podem consultar e criar leads com total segurança e respeito ao princípio <em>Human-in-the-Loop</em>.
                </p>

                <div className="mcp-tools-grid">
                  {/* Tool 1: list_leads */}
                  <div className="mcp-tool-card double-bezel-inner">
                    <div className="tool-card-header">
                      <div className="tool-name-badge">
                        <code>list_leads</code>
                        <span className="badge-readonly">Leitura</span>
                      </div>
                      <span className="tool-tag">Consulta de Funil</span>
                    </div>
                    <p className="tool-card-desc">
                      Consulta leads existentes filtrando por nome, cidade ou estágio (novo, reunião, proposta) para evitar abordagens duplicadas.
                    </p>
                    <div className="tool-card-params">
                      <span className="eyebrow-tiny">Parâmetros Aceitos:</span>
                      <ul className="params-list">
                        <li><code>query</code> (string, opcional) — Busca textual por nome, segmento ou cidade</li>
                        <li><code>stage</code> (string, opcional) — Estágio atual no funil</li>
                        <li><code>limit</code> (número, padrão: 25) — Limite máximo de retornos</li>
                      </ul>
                    </div>
                  </div>

                  {/* Tool 2: create_leads */}
                  <div className="mcp-tool-card double-bezel-inner">
                    <div className="tool-card-header">
                      <div className="tool-name-badge">
                        <code>create_leads</code>
                        <span className="badge-write">Escrita Segura</span>
                      </div>
                      <span className="tool-tag">Ingestão de Oportunidades</span>
                    </div>
                    <p className="tool-card-desc">
                      Cadastra em lote até 25 leads qualificados com <strong>desduplicação automática e estrita</strong> por link do Maps, telefone/WhatsApp ou combinação de nome e cidade.
                    </p>
                    <div className="tool-card-params">
                      <span className="eyebrow-tiny">Parâmetros Aceitos:</span>
                      <ul className="params-list">
                        <li><code>leads</code> (array de 1 a 25) — Dados estruturados da empresa e contato</li>
                        <li><code>autoAnalyze</code> (booleano) — Executa diagnóstico imediato de oportunidade</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mcp-governance-note">
                  <ShieldCheck size={16} className="text-mint flex-shrink-0" />
                  <p>
                    <strong>Garantia de Controle Humano:</strong> Leads cadastrados através do MCP entram automaticamente com etiqueta de integração e aguardam a revisão de <strong>Henrique Bezerra</strong> antes de qualquer mensagem externa ser disparada.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "snippets" && (
              <div className="mcp-snippets-tab">
                <div className="client-selector-bar">
                  <button
                    type="button"
                    className={`client-btn ${activeClient === "claude" ? "active" : ""}`}
                    onClick={() => setActiveClient("claude")}
                  >
                    <span>Claude Desktop</span>
                  </button>
                  <button
                    type="button"
                    className={`client-btn ${activeClient === "cursor" ? "active" : ""}`}
                    onClick={() => setActiveClient("cursor")}
                  >
                    <span>Cursor / IDE</span>
                  </button>
                  <button
                    type="button"
                    className={`client-btn ${activeClient === "curl" ? "active" : ""}`}
                    onClick={() => setActiveClient("curl")}
                  >
                    <span>cURL / n8n / API</span>
                  </button>
                </div>

                <div className="snippet-display-box double-bezel-inner">
                  <div className="snippet-box-header">
                    <span className="snippet-file-label">
                      {activeClient === "claude" && "claude_desktop_config.json"}
                      {activeClient === "cursor" && ".cursor/mcp.json ou Windsurf settings"}
                      {activeClient === "curl" && "terminal / webhook bash"}
                    </span>
                    <button
                      type="button"
                      className="btn-copy-code"
                      onClick={() => {
                        const code =
                          activeClient === "claude"
                            ? claudeDesktopConfig
                            : activeClient === "cursor"
                            ? cursorConfig
                            : curlSnippet;
                        handleCopy(code, "snippet");
                      }}
                    >
                      {copiedKey === "snippet" ? <Check size={13} className="text-mint" /> : <Copy size={13} />}
                      <span>{copiedKey === "snippet" ? "Copiado!" : "Copiar Configuração"}</span>
                    </button>
                  </div>

                  <pre className="snippet-pre">
                    <code>
                      {activeClient === "claude" && claudeDesktopConfig}
                      {activeClient === "cursor" && cursorConfig}
                      {activeClient === "curl" && curlSnippet}
                    </code>
                  </pre>
                </div>

                <div className="client-instruction-box">
                  <span className="eyebrow-tiny">Como Ativar:</span>
                  {activeClient === "claude" && (
                    <ol className="instruction-steps">
                      <li>Abra o arquivo <code>claude_desktop_config.json</code> no seu computador.</li>
                      <li>Cole o bloco acima dentro da chave <code>"mcpServers"</code>.</li>
                      <li>Substitua <code>SUA_CHAVE_AQUI</code> pelo valor de <code>INTEGRATION_API_KEY</code> definido no seu <code>.env</code>.</li>
                      <li>Reinicie o Claude Desktop. O martelo com as ferramentas do CRM aparecerá pronto para uso!</li>
                    </ol>
                  )}
                  {activeClient === "cursor" && (
                    <ol className="instruction-steps">
                      <li>No Cursor ou IDE compatível, acesse as configurações de Features &gt; MCP.</li>
                      <li>Adicione um novo servidor do tipo <strong>HTTP</strong> apontando para <code>{apiEndpointUrl}</code>.</li>
                      <li>Inclua o cabeçalho <code>Authorization: Bearer SUA_CHAVE_AQUI</code>.</li>
                    </ol>
                  )}
                  {activeClient === "curl" && (
                    <ol className="instruction-steps">
                      <li>Dispare chamadas JSON-RPC 2.0 padrão para o endpoint <code>/api/mcp</code>.</li>
                      <li>Ou faça POST em <code>/api/integrations/leads</code> para ingestão direta em workflows automatizados (ex.: n8n, Make ou scripts Python).</li>
                    </ol>
                  )}
                </div>
              </div>
            )}

            {activeTab === "logs" && (
              <div className="mcp-logs-tab">
                <div className="logs-summary-cards">
                  <div className="log-stat-card">
                    <span className="eyebrow-tiny">Total no CRM</span>
                    <strong className="stat-number">{status?.stats?.totalLeads || 0}</strong>
                    <small>Leads cadastrados</small>
                  </div>
                  <div className="log-stat-card">
                    <span className="eyebrow-tiny">Via Agentes / MCP</span>
                    <strong className="stat-number text-mint">{status?.stats?.mcpLeadsCount || 0}</strong>
                    <small>Integrados com sucesso</small>
                  </div>
                  <div className="log-stat-card">
                    <span className="eyebrow-tiny">Proteção Ativa</span>
                    <strong className="stat-number text-teal">Anti-Dup</strong>
                    <small>Maps, Fone e Nome+Cidade</small>
                  </div>
                </div>

                <div className="recent-leads-list-container double-bezel-inner">
                  <div className="leads-list-header">
                    <span className="eyebrow-tiny">Últimos Leads Ingeridos por Agentes</span>
                  </div>

                  {status?.stats?.recentMcpLeads && status.stats.recentMcpLeads.length > 0 ? (
                    <div className="mcp-leads-table">
                      {status.stats.recentMcpLeads.map((item) => (
                        <div
                          key={item.id}
                          className="mcp-lead-row"
                          onClick={() => {
                            if (onLeadSelect) {
                              onLeadSelect(item.id);
                              onClose();
                            }
                          }}
                        >
                          <div className="lead-row-main">
                            <strong className="lead-name-text">{item.name}</strong>
                            <span className="lead-meta-text">
                              {item.segment} • {item.city}
                            </span>
                          </div>
                          <div className="lead-row-right">
                            <span className={`stage stage-${item.stage}`}>
                              {item.stage}
                            </span>
                            <span className="lead-date-text">
                              {new Date(item.createdAt).toLocaleDateString("pt-BR")}
                            </span>
                            <ChevronRight size={14} className="text-muted" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-mcp-leads">
                      <Bot size={28} className="text-muted" />
                      <p>Nenhum lead ingerido via MCP registrado ainda.</p>
                      <small>Quando seus agentes externos rodarem <code>create_leads</code>, as entradas aparecerão aqui em tempo real.</small>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Rodapé Executivo */}
          <div className="mcp-hub-footer">
            <div className="footer-credentials">
              <span className="footer-dev-name">Henrique Bezerra dos Santos</span>
              <span className="footer-dot">•</span>
              <span className="footer-spec">Arquitetura Model Context Protocol</span>
            </div>
            <button type="button" className="btn-secondary-subtle" onClick={onClose}>
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
