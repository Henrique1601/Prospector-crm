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
  Play,
  Plug,
  RefreshCw,
  Send,
  Server,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap
} from "lucide-react";
import { api, apiBaseUrl } from "../api";
import type { Lead, McpStatusResponse, McpTestResponse } from "../types";

interface IntegrationsViewProps {
  onLeadSelect?: (leadId: string) => void;
  onLeadCreated?: (lead: Lead) => void;
}

type TabType = "mcp" | "snippets" | "webhook";
type ClientType = "claude" | "cursor" | "curl";

export function IntegrationsView({ onLeadSelect, onLeadCreated }: IntegrationsViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("mcp");
  const [activeClient, setActiveClient] = useState<ClientType>("claude");
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<McpStatusResponse | null>(null);
  const [testResult, setTestResult] = useState<McpTestResponse | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState("");

  // Webhook state
  const [testBusy, setTestBusy] = useState(false);
  const [webhookResult, setWebhookResult] = useState<string | null>(null);
  const [testPayload, setTestPayload] = useState({
    nome: "Dra. Juliana Martins - Odontologia",
    segmento: "Clínica Odontológica",
    cidade: "Santos",
    uf: "SP",
    telefone: "(13) 99765-4321",
    website: "",
    mensagem: "Quero um orçamento para criar um site moderno com agendamento no WhatsApp."
  });

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
    void loadStatus();
  }, []);

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

  const handleRunWebhookTest = async () => {
    setTestBusy(true);
    setWebhookResult(null);
    try {
      const response = await api.sendWebhookLead({
        empresa: testPayload.nome,
        segmento: testPayload.segmento,
        cidade: testPayload.cidade,
        uf: testPayload.uf,
        telefone: testPayload.telefone,
        website: testPayload.website,
        mensagem: testPayload.mensagem,
        origem: "Simulador Webhook CRM"
      });

      setWebhookResult(`✅ Sucesso! Lead criado com ID: ${response.lead.id} e analisado com score ${response.lead.score}.`);
      if (onLeadCreated) {
        onLeadCreated(response.lead);
      }
    } catch (e) {
      setWebhookResult(`❌ Erro: ${e instanceof Error ? e.message : "Falha ao enviar webhook"}`);
    } finally {
      setTestBusy(false);
    }
  };

  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "http://localhost:5173";
  const apiEndpointUrl = apiBaseUrl ? `${apiBaseUrl}/api/mcp` : `${currentOrigin}/api/mcp`;
  const webhookEndpoint = apiBaseUrl ? `${apiBaseUrl}/api/webhooks/lead` : `${currentOrigin}/api/webhooks/lead`;

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

  const webhookCurlExample = `curl -X POST "${webhookEndpoint}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "empresa": "Clínica Exemplo",
    "segmento": "Odontologia",
    "cidade": "Santos",
    "uf": "SP",
    "telefone": "13991234567",
    "website": "https://clinicaexemplo.com.br",
    "mensagem": "Gostaria de saber mais sobre o serviço de criação de site",
    "origem": "Formulário Landing Page"
  }'`;

  return (
    <div className="view-container">
      {/* Top Header */}
      <div className="view-header integrations-view-header">
        <div>
          <span className="eyebrow">Arquitetura Aberta & Agentes IA (MCP Server + Webhooks)</span>
        </div>
        <div className="view-header-actions">
          <button
            type="button"
            className="secondary btn-sm"
            onClick={loadStatus}
            disabled={loading}
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Atualizar Status</span>
          </button>
        </div>
      </div>

      {/* KPI Cards / Health Overview */}
      <div className="view-stats-row">
        <div className="view-stat-card">
          <div className="view-stat-icon">
            <Server size={18} />
          </div>
          <div className="view-stat-content">
            <span className="stat-label">Servidor MCP</span>
            <strong className="stat-value">{status?.configured ? "Configurado" : "Online"}</strong>
            <small className="stat-sub">HTTP Transport v2024-11-05</small>
          </div>
        </div>

        <div className="view-stat-card">
          <div className="view-stat-icon">
            <Zap size={18} />
          </div>
          <div className="view-stat-content">
            <span className="stat-label">Tools Registradas</span>
            <strong className="stat-value">{status?.tools?.length || 7} ferramentas</strong>
            <small className="stat-sub">Acesso a leads, scores & ações</small>
          </div>
        </div>

        <div className="view-stat-card">
          <div className="view-stat-icon">
            <ShieldCheck size={18} />
          </div>
          <div className="view-stat-content">
            <span className="stat-label">Autenticação</span>
            <strong className="stat-value">{status?.keyPrefix ? "Protegido" : "Aberto (Dev)"}</strong>
            <small className="stat-sub">{status?.keyPrefix ? `Prefixo: ${status.keyPrefix}...` : "Bearer Token"}</small>
          </div>
        </div>

        <div className="view-stat-card">
          <div className="view-stat-icon">
            <Activity size={18} />
          </div>
          <div className="view-stat-content">
            <span className="stat-label">Latência Média</span>
            <strong className="stat-value">{testResult?.latencyMs ? `${testResult.latencyMs}ms` : "18ms"}</strong>
            <small className="stat-sub">Resposta JSON-RPC 2.0</small>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="view-nav-tabs">
        <button
          type="button"
          className={`view-tab-btn ${activeTab === "mcp" ? "active" : ""}`}
          onClick={() => setActiveTab("mcp")}
        >
          <Plug size={15} />
          <span>Servidor MCP & Diagnóstico</span>
        </button>
        <button
          type="button"
          className={`view-tab-btn ${activeTab === "snippets" ? "active" : ""}`}
          onClick={() => setActiveTab("snippets")}
        >
          <Code2 size={15} />
          <span>Configuração para Clientes (Claude/Cursor)</span>
        </button>
        <button
          type="button"
          className={`view-tab-btn ${activeTab === "webhook" ? "active" : ""}`}
          onClick={() => setActiveTab("webhook")}
        >
          <Layers size={15} />
          <span>Webhook de Leads & Simulador</span>
        </button>
      </div>

      {/* Tab 1: MCP Server & Ping Diagnostic */}
      {activeTab === "mcp" && (
        <div className="view-grid-two-cols">
          {/* Tools List */}
          <div className="view-card">
            <div className="card-title-row">
              <div>
                <span className="eyebrow">Interface Aberta</span>
                <h3>Ferramentas Expostas ao LLM</h3>
              </div>
              <span className="badge-count">{status?.tools?.length || 7} ativas</span>
            </div>
            <p className="subtle-desc">
              Qualquer agente conectado pode invocar estas funções para consultar o funil e atualizar informações com segurança.
            </p>

            <div className="mcp-tools-list-view">
              {(status?.tools || [
                { name: "list_leads", description: "Lista os leads do CRM com suporte a filtros por estágio, cidade e limites." },
                { name: "get_lead", description: "Obtém todos os detalhes técnicos e diagnósticos de um lead por ID." },
                { name: "analyze_lead", description: "Executa diagnóstico profundo com Gemini AI e pontua oportunidades." },
                { name: "update_lead_stage", description: "Atualiza o estágio do funil do lead (new, contacted, won, etc.)." },
                { name: "add_lead_interaction", description: "Registra uma anotação ou contato no histórico do lead." },
                { name: "get_pipeline_summary", description: "Retorna KPIs consolidados do funil comercial." },
                { name: "search_leads", description: "Busca textual com correspondência por segmento, cidade ou nome." }
              ]).map((tool) => (
                <div key={tool.name} className="mcp-tool-item-card">
                  <div className="tool-header">
                    <span className="tool-name">{tool.name}</span>
                    <span className="tool-pill">JSON-RPC</span>
                  </div>
                  <p className="tool-desc">{tool.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Test Ping Diagnostic */}
          <div className="view-card">
            <div className="card-title-row">
              <div>
                <span className="eyebrow">Diagnóstico em Tempo Real</span>
                <h3>Testador de Conexão MCP</h3>
              </div>
            </div>
            <p className="subtle-desc">
              Envie uma requisição ping direta ao endpoint <code>/api/mcp</code> para validar o transporte HTTP e verificar o token.
            </p>

            <div className="test-field-group">
              <label className="field-label">Token de Acesso (opcional se não configurado)</label>
              <input
                type="password"
                className="input-text"
                placeholder="Insira o Bearer Token do servidor (opcional)..."
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="primary btn-full"
              onClick={handleTestConnection}
              disabled={testing}
            >
              {testing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Testando Conexão...</span>
                </>
              ) : (
                <>
                  <Play size={15} />
                  <span>Executar Teste de Conexão</span>
                </>
              )}
            </button>

            {testResult && (
              <div className={`diagnostic-result-box ${testResult.ok ? "success" : "error"}`}>
                <div className="result-header">
                  <strong>{testResult.ok ? "✅ Conexão Bem-Sucedida!" : "❌ Falha na Conexão"}</strong>
                  {testResult.latencyMs > 0 && <span className="latency-badge">{testResult.latencyMs}ms</span>}
                </div>
                <p className="result-message">{testResult.message}</p>
              </div>
            )}

            <div className="endpoint-info-box">
              <span className="info-title">URL Oficial do Endpoint:</span>
              <div className="url-copy-row">
                <code>{apiEndpointUrl}</code>
                <button
                  type="button"
                  className="copy-btn-action"
                  onClick={() => handleCopy(apiEndpointUrl, "url")}
                >
                  {copiedKey === "url" ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedKey === "url" ? "Copiado!" : "Copiar"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Config Snippets */}
      {activeTab === "snippets" && (
        <div className="view-card">
          <div className="card-title-row">
            <div>
              <span className="eyebrow">Configuração Descomplicada</span>
              <h3>Integre seu Editor ou Agente Favorito</h3>
            </div>
            <div className="client-tabs-selector">
              <button
                type="button"
                className={`client-btn ${activeClient === "claude" ? "active" : ""}`}
                onClick={() => setActiveClient("claude")}
              >
                Claude Desktop
              </button>
              <button
                type="button"
                className={`client-btn ${activeClient === "cursor" ? "active" : ""}`}
                onClick={() => setActiveClient("cursor")}
              >
                Cursor IDE
              </button>
              <button
                type="button"
                className={`client-btn ${activeClient === "curl" ? "active" : ""}`}
                onClick={() => setActiveClient("curl")}
              >
                cURL / Terminal
              </button>
            </div>
          </div>

          <div className="snippet-container">
            <div className="snippet-header">
              <span>
                {activeClient === "claude"
                  ? "claude_desktop_config.json"
                  : activeClient === "cursor"
                  ? ".cursor/mcp.json"
                  : "terminal bash / zsh"}
              </span>
              <button
                type="button"
                className="copy-snippet-btn"
                onClick={() => {
                  const text =
                    activeClient === "claude"
                      ? claudeDesktopConfig
                      : activeClient === "cursor"
                      ? cursorConfig
                      : curlSnippet;
                  handleCopy(text, "snippet");
                }}
              >
                {copiedKey === "snippet" ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedKey === "snippet" ? "Copiado para o clipboard!" : "Copiar configuração"}</span>
              </button>
            </div>
            <pre className="code-block">
              {activeClient === "claude"
                ? claudeDesktopConfig
                : activeClient === "cursor"
                ? cursorConfig
                : curlSnippet}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 3: Webhook & Simulator */}
      {activeTab === "webhook" && (
        <div className="view-grid-two-cols">
          {/* Docs & Spec */}
          <div className="view-card">
            <div className="card-title-row">
              <div>
                <span className="eyebrow">Webhook Universal</span>
                <h3>Captura Automática de Leads</h3>
              </div>
            </div>
            <p className="subtle-desc">
              Receba leads instantâneos vindos de formulários do WordPress, Elementor, Typeform, n8n ou Zapier direto no CRM com análise IA imediata.
            </p>

            <div className="endpoint-info-box">
              <span className="info-title">Endpoint POST:</span>
              <div className="url-copy-row">
                <code>{webhookEndpoint}</code>
                <button
                  type="button"
                  className="copy-btn-action"
                  onClick={() => handleCopy(webhookEndpoint, "wh_url")}
                >
                  {copiedKey === "wh_url" ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedKey === "wh_url" ? "Copiado!" : "Copiar"}</span>
                </button>
              </div>
            </div>

            <div className="snippet-container mt-4">
              <div className="snippet-header">
                <span>Exemplo cURL</span>
                <button
                  type="button"
                  className="copy-snippet-btn"
                  onClick={() => handleCopy(webhookCurlExample, "wh_curl")}
                >
                  {copiedKey === "wh_curl" ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedKey === "wh_curl" ? "Copiado!" : "Copiar"}</span>
                </button>
              </div>
              <pre className="code-block">{webhookCurlExample}</pre>
            </div>
          </div>

          {/* Simulator */}
          <div className="view-card">
            <div className="card-title-row">
              <div>
                <span className="eyebrow">Simulador ao Vivo</span>
                <h3>Testar Envio de Lead via Webhook</h3>
              </div>
            </div>
            <p className="subtle-desc">
              Dispare um lead de teste para verificar a qualificação automática de oportunidade e pontuação com Gemini.
            </p>

            <div className="simulator-form">
              <label className="field-label">
                <span>Nome da Empresa</span>
                <input
                  type="text"
                  className="input-text"
                  value={testPayload.nome}
                  onChange={(e) => setTestPayload({ ...testPayload, nome: e.target.value })}
                />
              </label>

              <div className="form-grid-two">
                <label className="field-label">
                  <span>Segmento</span>
                  <input
                    type="text"
                    className="input-text"
                    value={testPayload.segmento}
                    onChange={(e) => setTestPayload({ ...testPayload, segmento: e.target.value })}
                  />
                </label>
                <label className="field-label">
                  <span>Cidade</span>
                  <input
                    type="text"
                    className="input-text"
                    value={testPayload.cidade}
                    onChange={(e) => setTestPayload({ ...testPayload, cidade: e.target.value })}
                  />
                </label>
              </div>

              <label className="field-label">
                <span>Telefone / WhatsApp</span>
                <input
                  type="text"
                  className="input-text"
                  value={testPayload.telefone}
                  onChange={(e) => setTestPayload({ ...testPayload, telefone: e.target.value })}
                />
              </label>

              <label className="field-label">
                <span>Mensagem do Lead</span>
                <textarea
                  rows={3}
                  className="input-textarea"
                  value={testPayload.mensagem}
                  onChange={(e) => setTestPayload({ ...testPayload, mensagem: e.target.value })}
                />
              </label>

              <button
                type="button"
                className="primary btn-full"
                onClick={handleRunWebhookTest}
                disabled={testBusy}
              >
                {testBusy ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Disparando e Analisando...</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Disparar Webhook de Teste</span>
                  </>
                )}
              </button>

              {webhookResult && (
                <div className="webhook-feedback-alert">
                  <p>{webhookResult}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
