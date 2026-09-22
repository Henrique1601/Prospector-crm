import { useState } from "react";
import {
  Check,
  Code2,
  Copy,
  ExternalLink,
  Layers,
  Loader2,
  Play,
  Plug,
  Send,
  Sparkles,
  X
} from "lucide-react";
import { api } from "./api";
import type { Lead } from "./types";

interface WebhookDocModalProps {
  onClose: () => void;
  onLeadCreated: (lead: Lead) => void;
}

export function WebhookDocModal({ onClose, onLeadCreated }: WebhookDocModalProps) {
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [testBusy, setTestBusy] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const [testPayload, setTestPayload] = useState({
    nome: "Dra. Juliana Martins - Odontologia",
    segmento: "Clínica Odontológica",
    cidade: "Santos",
    uf: "SP",
    telefone: "(13) 99765-4321",
    website: "",
    mensagem: "Quero um orçamento para criar um site moderno com agendamento no WhatsApp."
  });

  const webhookEndpoint = `${window.location.origin}/api/webhooks/lead`;

  const curlExample = `curl -X POST "${webhookEndpoint}" \\
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

  const handleCopyCurl = async () => {
    await navigator.clipboard.writeText(curlExample);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleRunTest = async () => {
    setTestBusy(true);
    setTestResult(null);
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

      setTestResult(`✅ Sucesso! Lead criado com ID: ${response.lead.id} e analisado com score ${response.lead.score}.`);
      onLeadCreated(response.lead);
    } catch (e) {
      setTestResult(`❌ Erro: ${e instanceof Error ? e.message : "Falha ao enviar webhook"}`);
    } finally {
      setTestBusy(false);
    }
  };

  return (
    <div className="modal-wrap">
      <button className="drawer-scrim" onClick={onClose} aria-label="Fechar" />
      <div className="modal webhook-modal" role="dialog" aria-labelledby="webhook-title">
        <div className="section-title">
          <div>
            <span className="eyebrow">Automação & Integração</span>
            <h2 id="webhook-title">Webhook de Captura de Leads</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Fechar">
            <X />
          </button>
        </div>

        <p className="webhook-intro">
          Receba novos contatos vindos de landing pages, formulários de contato, Typeform, WordPress ou plataformas de automação (n8n, Make, Zapier) direto no CRM com <strong>qualificação automática de IA</strong>.
        </p>

        {/* Endpoint Box */}
        <div className="webhook-endpoint-box">
          <span className="endpoint-label">Endpoint POST:</span>
          <div className="endpoint-url-row">
            <code>POST {webhookEndpoint}</code>
          </div>
        </div>

        {/* cURL Snippet */}
        <div className="webhook-code-card">
          <div className="code-card-header">
            <Code2 size={15} />
            <span>Exemplo de Chamada cURL / API</span>
            <button type="button" className="copy-action-btn" onClick={handleCopyCurl}>
              {copiedCurl ? <Check size={13} /> : <Copy size={13} />}
              <span>{copiedCurl ? "Copiado!" : "Copiar cURL"}</span>
            </button>
          </div>
          <pre className="code-block">{curlExample}</pre>
        </div>

        {/* Test Simulator */}
        <div className="webhook-simulator-card">
          <div className="simulator-header">
            <Play size={15} className="text-primary" />
            <strong>Simulador de Envio em Tempo Real</strong>
          </div>

          <div className="form-grid">
            <label className="field">
              <span>Nome / Empresa</span>
              <input
                value={testPayload.nome}
                onChange={(e) => setTestPayload({ ...testPayload, nome: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Segmento</span>
              <input
                value={testPayload.segmento}
                onChange={(e) => setTestPayload({ ...testPayload, segmento: e.target.value })}
              />
            </label>
          </div>

          <div className="form-grid">
            <label className="field">
              <span>Cidade</span>
              <input
                value={testPayload.cidade}
                onChange={(e) => setTestPayload({ ...testPayload, cidade: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Telefone / WhatsApp</span>
              <input
                value={testPayload.telefone}
                onChange={(e) => setTestPayload({ ...testPayload, telefone: e.target.value })}
              />
            </label>
          </div>

          <label className="field">
            <span>Mensagem do formulário</span>
            <textarea
              rows={2}
              value={testPayload.mensagem}
              onChange={(e) => setTestPayload({ ...testPayload, mensagem: e.target.value })}
            />
          </label>

          <button
            type="button"
            className="primary full"
            disabled={testBusy}
            onClick={handleRunTest}
          >
            {testBusy ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
            <span>{testBusy ? "Processando e Qualificando..." : "Simular Disparo de Webhook"}</span>
          </button>

          {testResult && (
            <div className={`test-feedback-banner ${testResult.startsWith("✅") ? "success" : "error"}`}>
              {testResult}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
