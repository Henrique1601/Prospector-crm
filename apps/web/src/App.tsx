import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  BriefcaseBusiness,
  Calculator,
  CalendarClock,
  CalendarPlus,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CircleGauge,
  Command,
  Compass,
  Copy,
  Download,
  Edit3,
  ExternalLink,
  FileText,
  Flame,
  Globe,
  HelpCircle,
  Layers,
  LayoutDashboard,
  ListFilter,
  Loader2,
  MapPin,
  MessageCircle,
  MessageSquareText,
  Mic,
  MicOff,
  Phone,
  Plug,
  Plus,
  Save,
  Search,
  Send,
  Share2,
  SlidersHorizontal,
  Sparkles,
  Table as TableIcon,
  Target,
  TrendingUp,
  Users,
  X
} from "lucide-react";
import { api } from "./api";
import { BatchImportModal } from "./BatchImportModal";
import { ProposalModal } from "./ProposalModal";
import { ObjectionsAssistant } from "./ObjectionsAssistant";
import { ApproachPlaybookModal } from "./ApproachPlaybookModal";
import { DailyProspectingModal } from "./DailyProspectingModal";
import { WebhookDocModal } from "./WebhookDocModal";
import { AnalyticsModal } from "./AnalyticsModal";
import { CommandPalette } from "./CommandPalette";
import { KanbanBoard } from "./KanbanBoard";
import { RoiCalculatorModal } from "./RoiCalculatorModal";
import { LeadAuditModal } from "./LeadAuditModal";
import { ColdAudioScriptModal } from "./ColdAudioScriptModal";
import { BeforeAfterCardModal } from "./BeforeAfterCardModal";
import { PublicProposalView } from "./PublicProposalView";
import { triggerConfetti } from "./Confetti";
import type { DashboardData, Lead, Stage } from "./types";

const stageLabels: Record<Stage, string> = {
  new: "Novo",
  analyzed: "Analisado",
  contacted: "Contatado",
  replied: "Respondeu",
  meeting: "Reunião",
  proposal: "Proposta",
  won: "Fechado",
  lost: "Perdido"
};
const mainStages: Stage[] = ["new", "analyzed", "contacted", "replied", "meeting", "proposal", "won"];

function Score({ value }: { value: number }) {
  return (
    <div className="score" style={{ "--score": `${value * 3.6}deg` } as React.CSSProperties}>
      <span>{value || "–"}</span>
    </div>
  );
}

function StagePill({ stage }: { stage: Stage }) {
  return <span className={`stage stage-${stage}`}>{stageLabels[stage]}</span>;
}

function Metric({
  label,
  value,
  note,
  icon: Icon
}: {
  label: string;
  value: string | number;
  note: string;
  icon: typeof Users;
}) {
  return (
    <article className="metric">
      <div className="metric-icon">
        <Icon size={18} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </article>
  );
}

type ApproachType = "portfolio" | "curiosity" | "invisible_loss" | "ready_question" | "short" | "direct";

function LeadDrawer({
  lead,
  onClose,
  onChanged,
  onOpenProposal,
  onOpenPlaybook,
  onOpenRoi,
  onOpenAudit,
  onOpenAudio,
  onOpenBeforeAfter,
  onOpenPublicProposal
}: {
  lead: Lead;
  onClose: () => void;
  onChanged: (lead: Lead) => void;
  onOpenProposal: (lead: Lead) => void;
  onOpenPlaybook: (lead: Lead) => void;
  onOpenRoi: (lead: Lead) => void;
  onOpenAudit: (lead: Lead) => void;
  onOpenAudio: (lead: Lead) => void;
  onOpenBeforeAfter: (lead: Lead) => void;
  onOpenPublicProposal: (lead: Lead) => void;
}) {
  const [busy, setBusy] = useState("");
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedApproach, setSelectedApproach] = useState<ApproachType>("curiosity");
  const [demoUrlInput, setDemoUrlInput] = useState(lead.demoUrl || "");

  const handleToggleVoice = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Seu navegador não suporta reconhecimento de voz direto. Recomendamos Google Chrome ou Edge.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setNote((prev) => (prev ? `${prev} ${transcript}` : transcript));
      setIsListening(false);
    };

    recognition.start();
  };

  const googleCalendarUrl = useMemo(() => {
    if (!lead.nextFollowUp) return null;
    const d = new Date(lead.nextFollowUp);
    const startStr = d.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const endDate = new Date(d.getTime() + 30 * 60 * 1000);
    const endStr = endDate.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const title = encodeURIComponent(`Follow-up Prospector CRM: ${lead.name}`);
    const details = encodeURIComponent(`Contato de prospecção comercial da ${lead.name} (${lead.segment} em ${lead.city}).
Telefone: ${lead.phone || "Não informado"}
WhatsApp: ${lead.whatsappUrl || "Não informado"}
Próxima ação: ${lead.nextAction || "Retornar contato"}`);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}`;
  }, [lead.nextFollowUp, lead.name, lead.segment, lead.city, lead.phone, lead.whatsappUrl, lead.nextAction]);

  const [editForm, setEditForm] = useState({
    name: lead.name,
    segment: lead.segment,
    city: lead.city,
    state: lead.state,
    website: lead.website || "",
    phone: lead.phone || "",
    address: lead.address || ""
  });

  useEffect(() => {
    setEditForm({
      name: lead.name,
      segment: lead.segment,
      city: lead.city,
      state: lead.state,
      website: lead.website || "",
      phone: lead.phone || "",
      address: lead.address || ""
    });
    setDemoUrlInput(lead.demoUrl || "");
    setIsEditing(false);
  }, [lead.id, lead.updatedAt, lead.demoUrl]);

  const act = async (name: string, fn: () => Promise<Lead>) => {
    setBusy(name);
    try {
      onChanged(await fn());
    } finally {
      setBusy("");
    }
  };

  const currentMessage = useMemo(() => {
    if (lead.suggestedMessages) {
      if (selectedApproach === "curiosity" && lead.suggestedMessages.curiosity) return lead.suggestedMessages.curiosity;
      if (selectedApproach === "invisible_loss" && lead.suggestedMessages.invisible_loss) return lead.suggestedMessages.invisible_loss;
      if (selectedApproach === "ready_question" && lead.suggestedMessages.ready_question) return lead.suggestedMessages.ready_question;
      if (selectedApproach === "portfolio" && lead.suggestedMessages.portfolio) return lead.suggestedMessages.portfolio;
      if (selectedApproach === "short" && lead.suggestedMessages.short) return lead.suggestedMessages.short;
      if (selectedApproach === "direct" && lead.suggestedMessages.direct) return lead.suggestedMessages.direct;
    }
    return lead.suggestedMessage || "";
  }, [lead.suggestedMessages, lead.suggestedMessage, selectedApproach]);

  const copyMessage = async () => {
    if (currentMessage) {
      await navigator.clipboard.writeText(currentMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const cleanPhone = (lead.phone || "").replace(/\D/g, "");
  const waDirectUrl = cleanPhone
    ? `https://wa.me/55${cleanPhone}${currentMessage ? `?text=${encodeURIComponent(currentMessage)}` : ""}`
    : lead.whatsappUrl
    ? `${lead.whatsappUrl}${currentMessage ? `?text=${encodeURIComponent(currentMessage)}` : ""}`
    : undefined;

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    await act("edit", () => api.update(lead.id, editForm));
    setIsEditing(false);
  };

  const handleSaveDemoUrl = async () => {
    await act("save-demo-url", () => api.update(lead.id, { demoUrl: demoUrlInput }));
  };

  const approachNames: Record<ApproachType, string> = {
    curiosity: "Pergunta Concorrência ⭐",
    invisible_loss: "Perda Invisível 🔥",
    ready_question: "Prontidão 🚀",
    portfolio: "Portfólio Completo",
    short: "Curta WhatsApp",
    direct: "Demonstração"
  };

  return (
    <div className="drawer-wrap">
      <button className="drawer-scrim" onClick={onClose} aria-label="Fechar ficha do lead" />
      <aside className="drawer">
        <div className="drawer-header">
          <div className="drawer-header-top-row">
            <span className="eyebrow">
              {lead.segment} · {lead.city}/{lead.state}
            </span>
            <div className="drawer-header-actions">
              <button
                type="button"
                className="secondary btn-sm"
                onClick={() => onOpenRoi(lead)}
                title="Calculadora de Perda Invisível & ROI"
              >
                <Calculator size={13} />
                <span>ROI</span>
              </button>
              <button
                type="button"
                className="secondary btn-sm"
                onClick={() => onOpenAudit(lead)}
                title="Raio-X Técnico de Performance e SEO Local"
              >
                <Activity size={13} />
                <span>Raio-X</span>
              </button>
              <button
                type="button"
                className="secondary btn-sm"
                onClick={() => onOpenBeforeAfter(lead)}
                title="Card Antes vs Depois da Presença Digital"
              >
                <Layers size={13} />
                <span>Antes/Depois</span>
              </button>
              <button
                type="button"
                className="secondary btn-sm"
                onClick={() => onOpenAudio(lead)}
                title="Roteiro de Áudio para WhatsApp (30s)"
              >
                <Mic size={13} />
                <span>Áudio</span>
              </button>
              <button
                type="button"
                className="secondary btn-sm"
                onClick={() => onOpenPublicProposal(lead)}
                title="Abrir Proposta Online do Cliente"
              >
                <Share2 size={13} />
                <span>Link Web</span>
              </button>
              <button
                type="button"
                className="secondary btn-sm"
                onClick={() => onOpenProposal(lead)}
                title="Gerar proposta comercial personalizada em PDF"
              >
                <FileText size={13} />
                <span>PDF</span>
              </button>
              <button
                type="button"
                className="secondary btn-sm"
                onClick={() => onOpenPlaybook(lead)}
                title="Ver todas as opções de abordagem"
              >
                <BookOpen size={13} />
                <span>Playbook</span>
              </button>
              <button className="icon-button" onClick={onClose} aria-label="Fechar ficha">
                <X size={16} />
              </button>
            </div>
          </div>
          <div className="drawer-header-title-row">
            <h2>{lead.name}</h2>
            <div className="drawer-header-badges">
              <span className="drawer-badge score">Score {lead.score}</span>
              <span className={`drawer-badge priority priority-${lead.priority}`}>
                {lead.priority === "urgent" ? "Urgente" : lead.priority === "high" ? "Alta" : "Média"}
              </span>
              {lead.hasWhatsapp && (
                <span className="drawer-badge wa">
                  <MessageCircle size={11} /> WhatsApp
                </span>
              )}
              {lead.website ? (
                <a href={lead.website} target="_blank" rel="noreferrer" className="drawer-badge site">
                  <Globe size={11} /> Site ativo
                </a>
              ) : (
                <span className="drawer-badge nosite">Sem site</span>
              )}
            </div>
          </div>
        </div>

      <div className="drawer-body">
        {/* Card de Dados da Empresa */}
        <section className="drawer-card">
          <div className="section-title">
            <h3>Dados do estabelecimento</h3>
            <button
              type="button"
              className="copy-action-btn"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit3 size={13} />
              <span>{isEditing ? "Cancelar" : "Editar"}</span>
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveEdit} className="drawer-edit-form">
              <label className="field">
                <span>Nome</span>
                <input
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </label>
              <div className="form-grid">
                <label className="field">
                  <span>Segmento</span>
                  <input
                    required
                    value={editForm.segment}
                    onChange={(e) => setEditForm({ ...editForm, segment: e.target.value })}
                  />
                </label>
                <label className="field">
                  <span>Cidade</span>
                  <input
                    required
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  />
                </label>
              </div>
              <div className="form-grid">
                <label className="field">
                  <span>Telefone / WhatsApp</span>
                  <input
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </label>
                <label className="field">
                  <span>Website</span>
                  <input
                    value={editForm.website}
                    onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                  />
                </label>
              </div>
              <label className="field">
                <span>Endereço</span>
                <input
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                />
              </label>
              <button className="primary full" disabled={busy === "edit"}>
                <Save size={14} />
                {busy === "edit" ? "Salvando..." : "Salvar alterações"}
              </button>
            </form>
          ) : (
            <div className="drawer-meta-grid">
              <div>
                <span>Status do site:</span>
                <strong>
                  {lead.siteStatus === "good"
                    ? "Site ativo"
                    : lead.siteStatus === "weak"
                    ? "Site precisa de melhorias"
                    : lead.siteStatus === "none"
                    ? "Sem site institucional"
                    : "A avaliar"}
                </strong>
              </div>
              <div>
                <span>Presença digital:</span>
                <strong>{lead.digitalPresence}</strong>
              </div>
              {lead.phone && (
                <div>
                  <span>Telefone:</span>
                  <strong>{lead.phone}</strong>
                </div>
              )}
              {lead.website && (
                <div>
                  <span>Website:</span>
                  <a href={lead.website} target="_blank" rel="noreferrer" className="site-link">
                    {lead.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
              {lead.address && (
                <div className="full-width">
                  <span>Endereço:</span>
                  <p>{lead.address}</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Diagnóstico e Análise do Agente */}
        <section className="drawer-card">
          <div className="section-title">
            <h3>Diagnóstico do agente</h3>
            <Score value={lead.score} />
          </div>
          {lead.opportunity && (
            <div className="callout">
              <Sparkles size={16} />
              <div>
                <strong>Oportunidade identificada</strong>
                <p>{lead.opportunity}</p>
              </div>
            </div>
          )}
          {lead.reason && (
            <div className="callout subtle">
              <Target size={16} />
              <div>
                <strong>Justificativa</strong>
                <p>{lead.reason}</p>
              </div>
            </div>
          )}
          <button
            className="secondary full"
            disabled={busy === "analyze"}
            onClick={() => act("analyze", () => api.analyze(lead.id))}
          >
            <Sparkles size={16} />
            {busy === "analyze" ? "Analisando…" : lead.analyzedAt ? "Analisar novamente" : "Pesquisar e analisar"}
          </button>
        </section>

        {/* Abordagens Sugeridas */}
        <section className="drawer-card">
          <div className="section-title">
            <h3>Abordagem sugerida</h3>
            <div className="section-actions-row">
              <button type="button" className="secondary-subtle-btn" onClick={() => onOpenPlaybook(lead)}>
                <BookOpen size={13} />
                <span>Ver Playbook</span>
              </button>
              {currentMessage && (
                <button className="copy-action-btn" onClick={copyMessage}>
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copied ? "Copiado!" : "Copiar"}</span>
                </button>
              )}
            </div>
          </div>

          <div className="approach-tabs" role="tablist" aria-label="Variações de abordagem">
            <button
              type="button"
              role="tab"
              aria-selected={selectedApproach === "curiosity"}
              className={`approach-tab ${selectedApproach === "curiosity" ? "active" : ""}`}
              onClick={() => setSelectedApproach("curiosity")}
            >
              1. Concorrência ⭐
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={selectedApproach === "invisible_loss"}
              className={`approach-tab ${selectedApproach === "invisible_loss" ? "active" : ""}`}
              onClick={() => setSelectedApproach("invisible_loss")}
            >
              2. Perda Invisível 🔥
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={selectedApproach === "ready_question"}
              className={`approach-tab ${selectedApproach === "ready_question" ? "active" : ""}`}
              onClick={() => setSelectedApproach("ready_question")}
            >
              3. Prontidão 🚀
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={selectedApproach === "portfolio"}
              className={`approach-tab ${selectedApproach === "portfolio" ? "active" : ""}`}
              onClick={() => setSelectedApproach("portfolio")}
            >
              Portfólio
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={selectedApproach === "short"}
              className={`approach-tab ${selectedApproach === "short" ? "active" : ""}`}
              onClick={() => setSelectedApproach("short")}
            >
              Curta WhatsApp
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={selectedApproach === "direct"}
              className={`approach-tab ${selectedApproach === "direct" ? "active" : ""}`}
              onClick={() => setSelectedApproach("direct")}
            >
              Demonstração
            </button>
          </div>

          <div className="message-box">
            {currentMessage || "A abordagem personalizada aparecerá aqui depois da análise."}
          </div>

          {currentMessage && waDirectUrl && (
            <a
              href={waDirectUrl}
              target="_blank"
              rel="noreferrer"
              className="whatsapp-send-ready-btn"
              onClick={() => {
                api.interaction(lead.id, `Iniciou contato no WhatsApp com abordagem: ${approachNames[selectedApproach]}`).then(onChanged).catch(() => {});
              }}
            >
              <MessageCircle size={15} />
              <span>Conversar no WhatsApp com texto pronto</span>
              <ExternalLink size={12} />
            </a>
          )}

          <label className="field">
            <span>Estágio do relacionamento</span>
            <select
              value={lead.stage}
              onChange={(e) => {
                const nextStage = e.target.value as Stage;
                if (nextStage === "won") {
                  triggerConfetti();
                }
                act("stage", () => api.stage(lead.id, nextStage));
              }}
            >
              {mainStages.concat("lost").map((stage) => (
                <option key={stage} value={stage}>
                  {stageLabels[stage]}
                </option>
              ))}
            </select>
          </label>

          <ObjectionsAssistant
            lead={lead}
            onLoggedInteraction={(noteText) => {
              api.interaction(lead.id, noteText).then(onChanged).catch(() => {});
            }}
          />
        </section>

        {/* Demonstração & Protótipo Lovable */}
        <section className="drawer-card drawer-demo-card">
          <div className="section-title">
            <h3>Demonstração & Landing Page</h3>
            {lead.demoUrl && (
              <a href={lead.demoUrl} target="_blank" rel="noreferrer" className="demo-live-badge">
                <ExternalLink size={12} /> Ver Online
              </a>
            )}
          </div>
          {lead.demoBrief ? (
            <div className="demo-brief-container">
              <span className="demo-brief-eyebrow">Briefing do Projeto</span>
              <pre className="brief">{lead.demoBrief}</pre>
            </div>
          ) : (
            <p className="drawer-empty-text">Gere um briefing de landing page sob medida ou vincule um protótipo construído no Lovable.</p>
          )}
          <button
            className="primary full demo-action-btn"
            disabled={busy === "demo"}
            onClick={() => act("demo", () => api.demo(lead.id))}
          >
            <Bot size={16} />
            {busy === "demo" ? "Preparando…" : "Gerar briefing da demonstração"}
          </button>

          {/* Templates Setoriais Lovable */}
          <div className="demo-templates-box">
            <span className="demo-templates-label">Templates Prontos por Nicho:</span>
            <div className="demo-templates-grid">
              {[
                { label: "🦷 Odonto", url: "https://preview--odonto-santos.lovable.app" },
                { label: "🍔 Gastronomia", url: "https://preview--burger-santos.lovable.app" },
                { label: "🏠 Imobiliária", url: "https://preview--imob-santos.lovable.app" },
                { label: "💅 Estética", url: "https://preview--beleza-santos.lovable.app" },
                { label: "🚗 Auto Center", url: "https://preview--auto-santos.lovable.app" }
              ].map((tpl) => (
                <button
                  key={tpl.label}
                  type="button"
                  className="demo-tpl-pill"
                  onClick={() => {
                    setDemoUrlInput(tpl.url);
                    act("save-demo-url", () => api.update(lead.id, { demoUrl: tpl.url }));
                  }}
                  title={`Vincular modelo de ${tpl.label}`}
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          <div className="drawer-demo-url-box">
            <span className="demo-url-label">Link do Protótipo / Demonstração (ex: Lovable)</span>
            <div className="input-action-row">
              <input
                type="url"
                placeholder="https://preview--lead.lovable.app"
                value={demoUrlInput}
                onChange={(e) => setDemoUrlInput(e.target.value)}
              />
              <button
                type="button"
                className="secondary"
                disabled={busy === "save-demo-url"}
                onClick={handleSaveDemoUrl}
              >
                {busy === "save-demo-url" ? "Salvando..." : "Salvar Link"}
              </button>
            </div>
            {lead.demoUrl && (
              <a
                href={lead.demoUrl}
                target="_blank"
                rel="noreferrer"
                className="demo-direct-link"
              >
                <ExternalLink size={13} /> Abrir protótipo Lovable em nova aba
              </a>
            )}
          </div>
        </section>

        {/* Agendamento de Follow-up */}
        <section className="drawer-card">
          <div className="section-title">
            <h3>Próximo contato</h3>
            {lead.nextFollowUp && (
              <span className="badge">
                {new Date(lead.nextFollowUp).toLocaleDateString("pt-BR")}
              </span>
            )}
          </div>
          <label className="field">
            <span>Próxima ação</span>
            <input
              value={lead.nextAction || ""}
              onChange={(e) => act("action", () => api.update(lead.id, { nextAction: e.target.value }))}
              placeholder="Ex.: Enviar rascunho de proposta"
            />
          </label>
          <label className="field">
            <span>Data do próximo contato</span>
            <input
              type="date"
              value={lead.nextFollowUp ? lead.nextFollowUp.slice(0, 10) : ""}
              onChange={(e) =>
                act("followup", () =>
                  api.update(lead.id, {
                    nextFollowUp: e.target.value ? new Date(e.target.value).toISOString() : undefined
                  })
                )
              }
            />
          </label>

          {googleCalendarUrl && (
            <a
              href={googleCalendarUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-google-calendar"
              title="Criar evento oficial no Google Agenda com lembrete"
            >
              <CalendarPlus size={14} />
              <span>Adicionar ao Google Agenda</span>
            </a>
          )}
        </section>

        {/* Histórico de Interações */}
        <section className="drawer-card drawer-history-card">
          <div className="section-title">
            <h3>Histórico de contatos</h3>
            <span className="drawer-record-badge">{lead.interactions.length} registros</span>
          </div>

          {/* Quick Action Chips */}
          <div className="quick-interaction-section">
            <span className="quick-interaction-label">Anotações Rápidas em 1 Clique:</span>
            <div className="quick-interaction-chips">
              {[
                { label: "📞 Ligou s/ atender", text: "Ligou para a empresa, porém ninguém atendeu." },
                { label: "🎙️ Mandou áudio WA", text: "Enviou mensagem de áudio personalizada pelo WhatsApp." },
                { label: "📋 Pediu proposta", text: "Cliente demonstrou interesse e solicitou o envio da proposta comercial." },
                { label: "💻 Demonstração apresentada", text: "Apresentou demonstração / protótipo do site." },
                { label: "💰 Negociando valores", text: "Em negociação de condições de pagamento e fechamento." }
              ].map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  className="quick-chip-btn"
                  disabled={Boolean(busy)}
                  onClick={() => {
                    act("quick-note", () => api.interaction(lead.id, chip.text));
                  }}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          <form
            className="drawer-history-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!note.trim()) return;
              act("note", () => api.interaction(lead.id, note)).then(() => setNote(""));
            }}
          >
            <div className="field history-field">
              <div className="field-header-row">
                <span>Registrar nova anotação</span>
                <button
                  type="button"
                  className={`btn-speech-mic ${isListening ? "listening" : ""}`}
                  onClick={handleToggleVoice}
                  title={isListening ? "Ouvindo... Clique para parar" : "Ditar anotação por voz"}
                >
                  {isListening ? <MicOff size={13} /> : <Mic size={13} />}
                  <span>{isListening ? "Ouvindo microfone..." : "Ditar por voz"}</span>
                </button>
              </div>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ex.: Falou com o gerente pelo WhatsApp, pediu demonstração na quinta."
              />
            </div>
            <button className="primary full history-submit-btn" disabled={busy === "note" || !note.trim()}>
              <MessageSquareText size={16} />
              {busy === "note" ? "Salvando…" : "Salvar no histórico"}
            </button>
          </form>

          <div className="timeline">
            {lead.interactions.length === 0 ? (
              <div className="timeline-empty-state">
                <CalendarClock size={18} className="timeline-empty-icon" />
                <span>Nenhuma interação registrada ainda. Use os botões de abordagem ou anote acima.</span>
              </div>
            ) : (
              lead.interactions.map((interaction) => {
                const lower = interaction.content.toLowerCase();
                const isWa = lower.includes("whatsapp");
                const isProposal = lower.includes("proposta");
                const isMaps = lower.includes("maps");
                const isFollowup = lower.includes("follow-up") || lower.includes("contato");
                return (
                  <div key={interaction.id} className="timeline-item">
                    <div className={`timeline-icon-badge ${isWa ? "wa" : isProposal ? "proposal" : isMaps ? "maps" : isFollowup ? "followup" : ""}`}>
                      {isWa ? (
                        <MessageCircle size={12} />
                      ) : isProposal ? (
                        <FileText size={12} />
                      ) : isMaps ? (
                        <MapPin size={12} />
                      ) : (
                        <CalendarClock size={12} />
                      )}
                    </div>
                    <div className="timeline-content">
                      <small className="timeline-date">
                        {new Date(interaction.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </small>
                      <p className="timeline-text">{interaction.content}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </aside>
  </div>
  );
}

function AddLead({
  onClose,
  onCreated
}: {
  onClose: () => void;
  onCreated: (lead: Lead) => void;
}) {
  const [form, setForm] = useState<Partial<Lead>>({ city: "Santos", state: "SP" });
  const [mapsLink, setMapsLink] = useState("");
  const [resolving, setResolving] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleResolveMaps = async () => {
    if (!mapsLink.trim()) return;
    setResolving(true);
    try {
      const results = await api.resolveMaps([mapsLink.trim()]);
      if (results && results[0] && !results[0].error) {
        const found = results[0];
        const rawDigits = (found.phone || "").replace(/\D/g, "");
        let cleanDigits = rawDigits.startsWith("55") && rawDigits.length >= 12 ? rawDigits.slice(2) : rawDigits;
        if (cleanDigits.length === 8 || cleanDigits.length === 9) {
          cleanDigits = `13${cleanDigits}`;
        }
        const hasWaUrl = Boolean(
          found.whatsappUrl ||
          (found.website || "").includes("wa.me") ||
          (found.website || "").includes("whatsapp")
        );
        const hasWhatsapp = found.hasWhatsapp || Boolean(found.phone && cleanDigits.length >= 10) || hasWaUrl;
        const whatsappUrl = found.whatsappUrl || (hasWhatsapp && cleanDigits.length >= 10 ? `https://wa.me/55${cleanDigits}` : undefined);

        setForm((prev) => ({
          ...prev,
          name: found.name || prev.name,
          segment: found.segment || prev.segment,
          city: found.city || prev.city,
          state: found.state || prev.state,
          address: found.address || prev.address,
          mapsUrl: found.mapsUrl || mapsLink.trim(),
          website: found.website || prev.website,
          phone: found.phone || prev.phone,
          whatsappUrl,
          hasWhatsapp,
          siteStatus: found.siteStatus,
          digitalPresence: found.digitalPresence
        }));
      }
    } finally {
      setResolving(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const rawDigits = (form.phone || "").replace(/\D/g, "");
      let cleanDigits = rawDigits.startsWith("55") && rawDigits.length >= 12 ? rawDigits.slice(2) : rawDigits;
      if (cleanDigits.length === 8 || cleanDigits.length === 9) {
        cleanDigits = `13${cleanDigits}`;
      }
      const hasWaUrl = Boolean(
        form.whatsappUrl ||
        (form.website || "").includes("wa.me") ||
        (form.website || "").includes("whatsapp") ||
        (form.phone || "").includes("wa.me") ||
        (form.phone || "").includes("whatsapp")
      );
      const hasWhatsapp = Boolean(form.hasWhatsapp || hasWaUrl || cleanDigits.length >= 10);
      const whatsappUrl = form.whatsappUrl || (hasWhatsapp && cleanDigits.length >= 10 ? `https://wa.me/55${cleanDigits}` : undefined);

      const created = await api.add({
        ...form,
        hasWhatsapp,
        whatsappUrl
      });
      onCreated(created);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-wrap">
      <button className="drawer-scrim" onClick={onClose} aria-label="Fechar" />
      <form className="modal" onSubmit={submit}>
        <div className="section-title">
          <div>
            <span className="eyebrow">Nova oportunidade</span>
            <h2>Adicionar empresa</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="maps-autofill-box">
          <label className="field">
            <span>Link do Google Maps (opcional — preenche sozinho)</span>
            <div className="input-action-row">
              <input
                type="url"
                value={mapsLink}
                onChange={(e) => setMapsLink(e.target.value)}
                placeholder="Cole o link do Google Maps aqui…"
              />
              <button
                type="button"
                className="secondary"
                disabled={resolving || !mapsLink.trim()}
                onClick={handleResolveMaps}
              >
                {resolving ? <Loader2 size={15} className="spin" /> : <MapPin size={15} />}
                Preencher
              </button>
            </div>
          </label>
        </div>

        <label className="field">
          <span>Nome da empresa</span>
          <input
            required
            value={form.name || ""}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ex.: Oficina Mecânica Silva"
          />
        </label>
        <label className="field">
          <span>Segmento</span>
          <input
            required
            value={form.segment || ""}
            onChange={(e) => setForm({ ...form, segment: e.target.value })}
            placeholder="Ex.: Oficina mecânica"
          />
        </label>
        <div className="form-grid">
          <label className="field">
            <span>Cidade</span>
            <input
              required
              value={form.city || ""}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </label>
          <label className="field">
            <span>UF</span>
            <input
              required
              maxLength={2}
              value={form.state || ""}
              onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })}
            />
          </label>
        </div>
        <div className="form-grid">
          <label className="field">
            <span>Telefone / WhatsApp</span>
            <input
              value={form.phone || ""}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="(13) 99999-9999"
            />
          </label>
          <label className="field">
            <span>Website</span>
            <input
              value={form.website || ""}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              placeholder="https://exemplo.com.br"
            />
          </label>
        </div>
        <button className="primary full" disabled={busy}>
          {busy ? "Adicionando…" : "Adicionar ao pipeline"}
        </button>
      </form>
    </div>
  );
}

export function App() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [proposalModalLead, setProposalModalLead] = useState<Lead | null>(null);
  const [playbookModalLead, setPlaybookModalLead] = useState<Lead | null>(null);
  const [approachPlaybookOpen, setApproachPlaybookOpen] = useState(false);
  const [prospectingOpen, setProspectingOpen] = useState(false);
  const [webhookDocOpen, setWebhookDocOpen] = useState(false);
  const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);

  // Commercial Suite Modals (ROI, Raio-X Audit, Audio WhatsApp, Before/After, Public Proposal)
  const [roiModalLead, setRoiModalLead] = useState<Lead | null>(null);
  const [auditModalLead, setAuditModalLead] = useState<Lead | null>(null);
  const [audioModalLead, setAudioModalLead] = useState<Lead | null>(null);
  const [beforeAfterModalLead, setBeforeAfterModalLead] = useState<Lead | null>(null);
  const [publicProposalLeadId, setPublicProposalLeadId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("proposta");
    }
    return null;
  });

  // New navigation & productivity states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem("prospector_sidebar_collapsed") === "true";
  });
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "kanban">(() => {
    return (localStorage.getItem("prospector_view_mode") as "table" | "kanban") || "table";
  });
  const [followupDropdownOpen, setFollowupDropdownOpen] = useState(false);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Stage | "all">("all");
  type QuickFilter = "all" | "no-site" | "with-whatsapp" | "today-followup" | "high-priority";
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [addOpen, setAddOpen] = useState(false);
  const [batchOpen, setBatchOpen] = useState(false);
  const [aiMode, setAiMode] = useState("local");
  const [storageMode, setStorageMode] = useState<"local-file" | "temporary" | "neon">("local-file");
  const [error, setError] = useState("");

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("prospector_sidebar_collapsed", String(next));
      return next;
    });
  };

  const handleViewModeChange = (mode: "table" | "kanban") => {
    setViewMode(mode);
    localStorage.setItem("prospector_view_mode", mode);
  };

  const load = async () => {
    try {
      const [all, data, health] = await Promise.all([api.leads(), api.dashboard(), api.health()]);
      setLeads(all);
      setDashboard(data);
      setAiMode(health.mode);
      setStorageMode(health.storage);
    } catch (e) {
      setError(e instanceof Error ? e.message : "A API não respondeu");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  // Global Keyboard Shortcuts (Ctrl+K = Command Palette, Ctrl+B = Sidebar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const todayIsoStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const todayFollowUps = useMemo(() => {
    return leads.filter((lead) => Boolean(lead.nextFollowUp && lead.nextFollowUp.slice(0, 10) <= todayIsoStr));
  }, [leads, todayIsoStr]);

  const cities = useMemo(() => {
    const set = new Set(leads.map((l) => l.city).filter(Boolean));
    return Array.from(set).sort();
  }, [leads]);

  const quickCounts = useMemo(() => {
    return {
      all: leads.length,
      noSite: leads.filter((l) => l.siteStatus === "none" || !l.website || l.website.includes("wa.me")).length,
      withWhatsapp: leads.filter((l) => Boolean(l.hasWhatsapp)).length,
      todayFollowup: todayFollowUps.length,
      highPriority: leads.filter((l) => ["high", "urgent"].includes(l.priority)).length
    };
  }, [leads, todayFollowUps]);

  const normalizeSearchText = (str: string) =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const visible = useMemo(
    () =>
      leads.filter((lead) => {
        if (filter !== "all" && lead.stage !== filter) return false;
        if (cityFilter !== "all" && lead.city !== cityFilter) return false;

        if (quickFilter === "no-site") {
          const hasNoSite = lead.siteStatus === "none" || !lead.website || lead.website.includes("wa.me");
          if (!hasNoSite) return false;
        } else if (quickFilter === "with-whatsapp") {
          if (!lead.hasWhatsapp) return false;
        } else if (quickFilter === "today-followup") {
          if (!lead.nextFollowUp || lead.nextFollowUp.slice(0, 10) > todayIsoStr) return false;
        } else if (quickFilter === "high-priority") {
          if (!["high", "urgent"].includes(lead.priority)) return false;
        }

        if (query.trim()) {
          const normQuery = normalizeSearchText(query);
          const rawText = `${lead.name} ${lead.segment} ${lead.city} ${lead.address || ""} ${lead.phone || ""}`;
          const normText = normalizeSearchText(rawText);
          const cleanPhoneDigits = (lead.phone || "").replace(/\D/g, "");
          const queryDigits = query.replace(/\D/g, "");
          const phoneMatch = queryDigits.length >= 3 && cleanPhoneDigits.includes(queryDigits);

          if (!normText.includes(normQuery) && !phoneMatch) return false;
        }

        return true;
      }),
    [leads, filter, cityFilter, quickFilter, query, todayIsoStr]
  );

  const followUps = useMemo(
    () =>
      leads
        .filter((lead) => lead.nextFollowUp)
        .sort((a, b) => new Date(a.nextFollowUp!).getTime() - new Date(b.nextFollowUp!).getTime()),
    [leads]
  );

  const changed = (lead: Lead) => {
    setLeads((items) => items.map((item) => (item.id === lead.id ? lead : item)));
    setSelected(lead);
    void load();
  };

  const handleUpdateStage = async (leadId: string, newStage: Stage) => {
    try {
      const updated = await api.stage(leadId, newStage);
      changed(updated);
    } catch (err) {
      console.error("Falha ao atualizar estágio:", err);
    }
  };

  const analyzeNext = async () => {
    const lead = leads.find((item) => item.stage === "new");
    if (!lead) return;
    setSelected(lead);
    changed(await api.analyze(lead.id));
  };

  const today = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long"
  }).format(new Date());

  // Daily target calculation
  const dailyTargetCount = 10;
  const contactedTodayCount = Math.min(quickCounts.withWhatsapp, dailyTargetCount);
  const dailyProgressPercent = Math.min(100, Math.round((contactedTodayCount / dailyTargetCount) * 100));

  if (publicProposalLeadId) {
    return (
      <PublicProposalView
        leadId={publicProposalLeadId}
        onBackToCrm={() => {
          if (typeof window !== "undefined") {
            window.history.pushState({}, "", window.location.pathname);
          }
          setPublicProposalLeadId(null);
        }}
      />
    );
  }

  return (
    <div className={`shell ${sidebarCollapsed ? "shell-sidebar-collapsed" : ""}`}>
      <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-top-row">
          <a className="brand" href="#top" aria-label="Prospector">
            <span>
              <CircleGauge />
            </span>
            {!sidebarCollapsed && (
              <div>
                <strong>prospector</strong>
                <small>por Henrique</small>
              </div>
            )}
          </a>
          <button
            type="button"
            className="sidebar-collapse-toggle-btn"
            onClick={toggleSidebar}
            title={sidebarCollapsed ? "Expandir sidebar (Ctrl+B)" : "Recolher sidebar (Ctrl+B)"}
            aria-label={sidebarCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
          >
            {sidebarCollapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          </button>
        </div>

        <nav aria-label="Menu lateral">
          <div className="sidebar-section">
            {!sidebarCollapsed && <span className="sidebar-section-title">Comercial</span>}
            <a className="active" href="#top" title="Visão geral">
              <LayoutDashboard size={18} />
              {!sidebarCollapsed && <span>Visão geral</span>}
            </a>
            <a href="#pipeline" title="Leads">
              <Users size={18} />
              {!sidebarCollapsed && <span>Leads</span>}
            </a>
            <a href="#followups" title="Follow-ups">
              <CalendarClock size={18} />
              {!sidebarCollapsed && <span>Follow-ups</span>}
            </a>
          </div>

          <div className="sidebar-section">
            {!sidebarCollapsed && <span className="sidebar-section-title">Inteligência</span>}
            <button
              type="button"
              className="sidebar-nav-btn"
              onClick={() => setApproachPlaybookOpen(true)}
              title="Playbook de Abordagens"
            >
              <BookOpen size={18} />
              {!sidebarCollapsed && <span>Playbook</span>}
            </button>
            <button
              type="button"
              className="sidebar-nav-btn"
              onClick={() => setProspectingOpen(true)}
              title="Radar & Rotina Diária"
            >
              <Compass size={18} />
              {!sidebarCollapsed && <span>Rotina Diária</span>}
            </button>
            <button
              type="button"
              className="sidebar-nav-btn"
              onClick={() => setAnalyticsModalOpen(true)}
              title="Analytics Detalhado"
            >
              <BarChart3 size={18} />
              {!sidebarCollapsed && <span>Analytics</span>}
            </button>
          </div>

          <div className="sidebar-section">
            {!sidebarCollapsed && <span className="sidebar-section-title">Automação</span>}
            <button
              type="button"
              className="sidebar-nav-btn"
              onClick={() => setWebhookDocOpen(true)}
              title="Webhook Leads"
            >
              <Plug size={18} />
              {!sidebarCollapsed && <span>Webhook</span>}
            </button>
          </div>
        </nav>

        {!sidebarCollapsed ? (
          <div className="sidebar-footer">
            <div className="sidebar-health-badges">
              <div className="health-badge-row" title="Banco de dados Serverless Postgres">
                <span className="live-dot" />
                <small>Neon DB: {storageMode === "neon" ? "Conectado" : "Local"}</small>
              </div>
              <div className="health-badge-row" title="Módulo de Inteligência Artificial">
                <span className="live-dot ai" />
                <small>Gemini AI: {aiMode === "aisa" ? "Online" : "Local"}</small>
              </div>
            </div>

            <div className="profile" title="Henrique Bezerra - Desenvolvedor Web Full-Stack">
              <span>HB</span>
              <div className="profile-text">
                <strong>Henrique Bezerra</strong>
                <small>Desenvolvedor Full-Stack</small>
              </div>
            </div>
          </div>
        ) : (
          <div className="sidebar-collapsed-footer">
            <button
              type="button"
              className="sidebar-avatar-btn"
              title="Henrique Bezerra - Desenvolvedor Full-Stack"
            >
              HB
            </button>
          </div>
        )}
      </aside>

      <main id="top">
        <header className="topbar">
          <div>
            <span className="eyebrow">{today}</span>
            <h1>Seu radar comercial</h1>
            <p>Veja os sinais mais promissores e decida o próximo movimento.</p>
          </div>

          <div className="topbar-actions">
            {/* Command Palette Trigger */}
            <button
              type="button"
              className="topbar-command-trigger"
              onClick={() => setIsCommandPaletteOpen(true)}
              title="Abrir busca rápida e comandos (Ctrl+K)"
            >
              <Search size={14} />
              <span>Buscar ou comando…</span>
              <kbd>Ctrl K</kbd>
            </button>

            {/* Gamified Daily Target Pill */}
            <div
              className="topbar-gamified-goal"
              onClick={() => setProspectingOpen(true)}
              title="Meta diária de prospecção. Clique para abrir rotina completa."
            >
              <div className="goal-icon">
                <Target size={14} />
              </div>
              <div className="goal-info">
                <span>Meta Hoje</span>
                <strong>{contactedTodayCount}/{dailyTargetCount} contatos</strong>
              </div>
              <div className="goal-progress-bar">
                <div className="goal-progress-fill" style={{ width: `${dailyProgressPercent}%` }} />
              </div>
            </div>

            {/* Notification Bell with Floating Dropdown */}
            <div className="followup-bell-container">
              <button
                type="button"
                className={`topbar-alert-badge ${todayFollowUps.length > 0 ? "has-alert" : ""}`}
                onClick={() => setFollowupDropdownOpen(!followupDropdownOpen)}
                title="Ver follow-ups agendados para hoje"
              >
                <Bell size={15} />
                <span>{todayFollowUps.length} follow-up{todayFollowUps.length === 1 ? "" : "s"}</span>
              </button>

              {followupDropdownOpen && (
                <div className="followup-dropdown-popover">
                  <div className="popover-header">
                    <strong>Follow-ups para hoje ({todayFollowUps.length})</strong>
                    <button
                      type="button"
                      className="close-popover-btn"
                      onClick={() => setFollowupDropdownOpen(false)}
                      aria-label="Fechar"
                    >
                      <X size={13} />
                    </button>
                  </div>
                  <div className="popover-list">
                    {todayFollowUps.length > 0 ? (
                      todayFollowUps.map((lead) => (
                        <div
                          key={lead.id}
                          className="popover-lead-item"
                          onClick={() => {
                            setSelected(lead);
                            setFollowupDropdownOpen(false);
                          }}
                        >
                          <div className="popover-lead-info">
                            <strong>{lead.name}</strong>
                            <small>{lead.nextAction || `${lead.segment} · ${lead.city}`}</small>
                          </div>
                          {lead.hasWhatsapp && lead.whatsappUrl && (
                            <a
                              href={lead.whatsappUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="popover-wa-btn"
                              onClick={(e) => e.stopPropagation()}
                              title="Abrir WhatsApp"
                            >
                              <MessageCircle size={13} />
                            </a>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="popover-empty">Nenhum retorno agendado pendente para hoje! 🎉</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              className="secondary playbook-quick-btn"
              onClick={() => setApproachPlaybookOpen(true)}
              title="Abrir Central de Abordagens com as 3 perguntas de impacto e roteiros de WhatsApp"
            >
              <BookOpen size={16} />
              <span>Abordagens</span>
            </button>

            <button
              type="button"
              className="secondary"
              onClick={() => setProspectingOpen(true)}
              title="Abrir radar de nichos da Baixada Santista e rotina de busca no Google Maps"
            >
              <Compass size={16} />
              <span>Rotina Diária</span>
            </button>

            <button
              type="button"
              className="secondary"
              onClick={() => setWebhookDocOpen(true)}
              title="Conectar formulários de sites externos ao CRM via Webhook"
            >
              <Plug size={16} />
              <span>Webhook</span>
            </button>

            <button className="secondary batch-button" onClick={() => setBatchOpen(true)}>
              <Layers size={16} />
              Importar em massa
            </button>
            <button className="primary" onClick={() => setAddOpen(true)}>
              <Plus size={16} />
              Adicionar empresa
            </button>
          </div>
        </header>

        {error && (
          <div className="error-banner">
            {error}. Execute <code>npm run dev</code> na raiz do projeto.
          </div>
        )}

        <section className="metrics" aria-label="Resumo do funil">
          <Metric
            label="Leads mapeados"
            value={dashboard?.total ?? "–"}
            note="base ativa"
            icon={Users}
          />
          <Metric
            label="Alta prioridade"
            value={dashboard?.highPriority ?? "–"}
            note="merecem atenção"
            icon={Target}
          />
          <Metric
            label="Taxa de resposta"
            value={`${dashboard?.responseRate ?? 0}%`}
            note={`${dashboard?.replies ?? 0} respostas registradas`}
            icon={MessageSquareText}
          />
          <Metric
            label="Negócios fechados"
            value={dashboard?.won ?? "–"}
            note="neste ciclo"
            icon={BriefcaseBusiness}
          />
        </section>

        <section className="pipeline" id="pipeline">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Base comercial</span>
              <h2>Leads e oportunidades</h2>
            </div>
            <div className="tools">
              <label className="search-field-label">
                <Search size={15} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar empresa, nicho, cidade, telefone…"
                />
                {query && (
                  <button
                    type="button"
                    className="clear-search-btn"
                    onClick={() => setQuery("")}
                    title="Limpar busca"
                    aria-label="Limpar busca"
                  >
                    <X size={13} />
                  </button>
                )}
              </label>
              <button
                className="filter-button"
                onClick={() => setFilter(filter === "all" ? "new" : "all")}
              >
                <ListFilter size={15} />
                {filter === "all" ? "Todos" : stageLabels[filter]}
              </button>
            </div>
          </div>

          <div className="smart-chips-bar">
            <div className="smart-chips-list">
              <button
                type="button"
                className={`smart-chip ${quickFilter === "all" ? "active" : ""}`}
                onClick={() => setQuickFilter("all")}
              >
                <span>Todos</span>
                <span className="chip-count">{quickCounts.all}</span>
              </button>
              <button
                type="button"
                className={`smart-chip ${quickFilter === "no-site" ? "active" : ""}`}
                onClick={() => setQuickFilter("no-site")}
              >
                <span>Sem Site</span>
                <span className="chip-count highlight">{quickCounts.noSite}</span>
              </button>
              <button
                type="button"
                className={`smart-chip ${quickFilter === "with-whatsapp" ? "active" : ""}`}
                onClick={() => setQuickFilter("with-whatsapp")}
              >
                <span>Com WhatsApp</span>
                <span className="chip-count">{quickCounts.withWhatsapp}</span>
              </button>
              <button
                type="button"
                className={`smart-chip ${quickFilter === "today-followup" ? "active" : ""}`}
                onClick={() => setQuickFilter("today-followup")}
              >
                <span>Follow-up Hoje</span>
                <span className={`chip-count ${quickCounts.todayFollowup > 0 ? "warning" : ""}`}>{quickCounts.todayFollowup}</span>
              </button>
              <button
                type="button"
                className={`smart-chip ${quickFilter === "high-priority" ? "active" : ""}`}
                onClick={() => setQuickFilter("high-priority")}
              >
                <span>Alta Prioridade</span>
                <span className="chip-count">{quickCounts.highPriority}</span>
              </button>
            </div>

            <div className="smart-chips-secondary">
              <div className="view-mode-pill-toggle">
                <button
                  type="button"
                  className={`view-mode-btn ${viewMode === "table" ? "active" : ""}`}
                  onClick={() => handleViewModeChange("table")}
                  title="Visualização Tabela"
                >
                  <TableIcon size={13} />
                  <span>Tabela</span>
                </button>
                <button
                  type="button"
                  className={`view-mode-btn ${viewMode === "kanban" ? "active" : ""}`}
                  onClick={() => handleViewModeChange("kanban")}
                  title="Visualização Pipeline Kanban"
                >
                  <LayoutDashboard size={13} />
                  <span>Kanban</span>
                </button>
              </div>

              {cities.length > 1 && (
                <select
                  className="city-filter-select"
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                >
                  <option value="all">Todas as cidades ({cities.length})</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              )}

              <a
                href={api.exportCsvUrl()}
                download="prospector-leads.csv"
                className="btn-export-csv"
                title="Exportar base de leads em CSV compatível com Excel"
              >
                <Download size={14} />
                <span>Exportar CSV</span>
              </a>
            </div>
          </div>

          {viewMode === "kanban" ? (
            <KanbanBoard
              leads={visible}
              onSelectLead={setSelected}
              onUpdateStage={handleUpdateStage}
            />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Empresa</th>
                    <th>Contato</th>
                    <th>Sinal</th>
                    <th>Estágio</th>
                    <th>Próxima ação</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {visible.map((lead) => (
                    <tr key={lead.id} onClick={() => setSelected(lead)}>
                      <td>
                        <div className="company">
                          <span>{lead.name.slice(0, 2).toUpperCase()}</span>
                          <div>
                            <strong>
                              {lead.name}
                              {lead.demoUrl && (
                                <span className="demo-live-badge" style={{ marginLeft: "6px", fontSize: "9px", padding: "1px 5px" }}>
                                  Demo
                                </span>
                              )}
                            </strong>
                            <small>
                              {lead.segment} · {lead.city} {lead.website ? "· com site" : "· sem site"}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="table-contact-cell">
                          {lead.hasWhatsapp && lead.whatsappUrl ? (
                            <a
                              href={lead.whatsappUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="table-wa-link"
                              onClick={(e) => e.stopPropagation()}
                              title="Conversar no WhatsApp"
                            >
                              <MessageCircle size={14} /> WhatsApp
                            </a>
                          ) : lead.phone ? (
                            <span className="table-phone-text">{lead.phone}</span>
                          ) : (
                            <span className="muted">–</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="score-cell">
                          <Score value={lead.score} />
                          <span className={`priority priority-${lead.priority}`}>
                            {lead.priority === "urgent"
                              ? "Urgente"
                              : lead.priority === "high"
                              ? "Alta"
                              : lead.score
                              ? "Média"
                              : "A avaliar"}
                          </span>
                        </div>
                      </td>
                      <td>
                        <StagePill stage={lead.stage} />
                      </td>
                      <td>
                        <span className="next-action">
                          {lead.nextAction || "Pesquisar presença digital"}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <div className="row-hover-actions">
                          {lead.hasWhatsapp && lead.whatsappUrl && (
                            <a
                              href={lead.whatsappUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="row-action-btn wa"
                              onClick={(e) => e.stopPropagation()}
                              title="Conversar no WhatsApp"
                            >
                              <MessageCircle size={14} />
                            </a>
                          )}
                          <button
                            type="button"
                            className="row-action-btn proposal"
                            onClick={(e) => {
                              e.stopPropagation();
                              setProposalModalLead(lead);
                            }}
                            title="Gerar Proposta Comercial"
                          >
                            <FileText size={14} />
                          </button>
                          <button
                            type="button"
                            className="icon-button"
                            aria-label={`Abrir ${lead.name}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelected(lead);
                            }}
                          >
                            <ChevronRight />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!visible.length && (
                <div className="empty-state">
                  <Search />
                  <h3>Nenhum lead encontrado</h3>
                  <p>Ajuste a busca ou volte a exibir todos os estágios.</p>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="command">
          <div className="command-copy">
            <span className="eyebrow">Próxima melhor ação</span>
            <h2>
              {leads.some((lead) => lead.stage === "new")
                ? `${leads.filter((lead) => lead.stage === "new").length} empresas aguardam análise`
                : "Fila de análise concluída"}
            </h2>
            <p>
              O agente organiza os fatos e sugere uma abordagem. Você revisa antes de qualquer contato.
            </p>
            <button
              className="signal-button"
              onClick={analyzeNext}
              disabled={!leads.some((lead) => lead.stage === "new")}
            >
              <Sparkles />
              Analisar próximo lead <ChevronRight />
            </button>
          </div>
          <div className="radar" aria-hidden="true">
            <span />
            <span />
            <span />
            <i />
          </div>
          <div className="attention">
            <span>Em foco agora</span>
            {leads
              .filter((lead) => lead.score > 0)
              .slice(0, 3)
              .map((lead) => (
                <button key={lead.id} onClick={() => setSelected(lead)}>
                  <Score value={lead.score} />
                  <div>
                    <strong>{lead.name}</strong>
                    <small>{lead.nextAction}</small>
                  </div>
                  <ChevronRight />
                </button>
              ))}
          </div>
        </section>

        <section className="followups" id="followups">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Agenda comercial</span>
              <h2>Próximos follow-ups</h2>
            </div>
            <span>
              {followUps.length} agendado{followUps.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="followup-list">
            {followUps.length ? (
              followUps.slice(0, 4).map((lead) => (
                <button key={lead.id} onClick={() => setSelected(lead)}>
                  <span className="followup-date">
                    <strong>
                      {new Date(lead.nextFollowUp!).toLocaleDateString("pt-BR", { day: "2-digit" })}
                    </strong>
                    <small>
                      {new Date(lead.nextFollowUp!)
                        .toLocaleDateString("pt-BR", { month: "short" })
                        .replace(".", "")}
                    </small>
                  </span>
                  <span>
                    <strong>{lead.name}</strong>
                    <small>{lead.nextAction || "Retomar contato"}</small>
                  </span>
                  <ChevronRight />
                </button>
              ))
            ) : (
              <div className="followup-empty">
                <Check />
                <span>
                  <strong>Agenda em dia</strong>
                  <small>Defina a próxima data de contato na ficha de um lead.</small>
                </span>
              </div>
            )}
          </div>
        </section>

        <section className="funnel" id="analytics">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Funil em movimento</span>
              <h2>Da descoberta ao contrato</h2>
            </div>
            <div className="funnel-heading-actions">
              <span>{dashboard?.contacted ?? 0} contatos iniciados</span>
              <button
                type="button"
                className="secondary btn-sm"
                onClick={() => setAnalyticsModalOpen(true)}
              >
                <BarChart3 size={14} />
                <span>Ver Analytics de Conversão</span>
              </button>
            </div>
          </div>
          <div className="funnel-row">
            {mainStages.map((stage, index) => (
              <button key={stage} onClick={() => setFilter(stage)}>
                <small>{String(index + 1).padStart(2, "0")}</small>
                <strong>{dashboard?.stages?.[stage] ?? 0}</strong>
                <span>{stageLabels[stage]}</span>
              </button>
            ))}
          </div>
        </section>

        <footer>
          <span>Prospector CRM · decisões humanas, inteligência assistida</span>
          <span>
            <Activity size={14} />{" "}
            {storageMode === "neon"
              ? "Dados persistidos com Neon"
              : storageMode === "temporary"
              ? "Dados temporários nesta demonstração"
              : "Dados salvos localmente"}
          </span>
        </footer>
      </main>

      <nav className="mobile-nav" aria-label="Navegação principal">
        <a href="#top">
          <LayoutDashboard />
          <span>Visão geral</span>
        </a>
        <a href="#pipeline">
          <Users />
          <span>Leads</span>
        </a>
        <a href="#followups">
          <CalendarClock />
          <span>Follow-ups</span>
          {followUps.length > 0 && <b>{followUps.length}</b>}
        </a>
        <button type="button" onClick={() => setApproachPlaybookOpen(true)}>
          <BookOpen />
          <span>Abordagens</span>
        </button>
        <button type="button" onClick={() => setAnalyticsModalOpen(true)}>
          <BarChart3 />
          <span>Analytics</span>
        </button>
      </nav>

      {selected && (
        <LeadDrawer
          lead={selected}
          onClose={() => setSelected(null)}
          onChanged={changed}
          onOpenProposal={(leadToPropose) => setProposalModalLead(leadToPropose)}
          onOpenPlaybook={(leadForPlaybook) => {
            setPlaybookModalLead(leadForPlaybook);
            setApproachPlaybookOpen(true);
          }}
          onOpenRoi={(l) => setRoiModalLead(l)}
          onOpenAudit={(l) => setAuditModalLead(l)}
          onOpenAudio={(l) => setAudioModalLead(l)}
          onOpenBeforeAfter={(l) => setBeforeAfterModalLead(l)}
          onOpenPublicProposal={(l) => {
            if (typeof window !== "undefined") {
              window.history.pushState({}, "", `?proposta=${l.id}`);
            }
            setPublicProposalLeadId(l.id);
          }}
        />
      )}

      {roiModalLead && (
        <RoiCalculatorModal
          lead={roiModalLead}
          onClose={() => setRoiModalLead(null)}
          onLoggedInteraction={(note) => {
            api.interaction(roiModalLead.id, note).then(changed).catch(() => {});
          }}
        />
      )}

      {auditModalLead && (
        <LeadAuditModal
          lead={auditModalLead}
          onClose={() => setAuditModalLead(null)}
          onLoggedInteraction={(note) => {
            api.interaction(auditModalLead.id, note).then(changed).catch(() => {});
          }}
        />
      )}

      {audioModalLead && (
        <ColdAudioScriptModal
          lead={audioModalLead}
          onClose={() => setAudioModalLead(null)}
          onLoggedInteraction={(note) => {
            api.interaction(audioModalLead.id, note).then(changed).catch(() => {});
          }}
        />
      )}

      {beforeAfterModalLead && (
        <BeforeAfterCardModal
          lead={beforeAfterModalLead}
          onClose={() => setBeforeAfterModalLead(null)}
          onLoggedInteraction={(note) => {
            api.interaction(beforeAfterModalLead.id, note).then(changed).catch(() => {});
          }}
        />
      )}

      {proposalModalLead && (
        <ProposalModal
          lead={proposalModalLead}
          onClose={() => setProposalModalLead(null)}
          onLoggedInteraction={(note) => {
            api.interaction(proposalModalLead.id, note).then(changed).catch(() => {});
          }}
        />
      )}

      {approachPlaybookOpen && (
        <ApproachPlaybookModal
          leads={leads}
          currentLead={playbookModalLead || selected}
          onClose={() => setApproachPlaybookOpen(false)}
          onSelectLead={(l) => {
            setSelected(l);
            setPlaybookModalLead(l);
          }}
          onLoggedInteraction={(leadId, note) => {
            api.interaction(leadId, note).then(changed).catch(() => {});
          }}
        />
      )}

      {prospectingOpen && (
        <DailyProspectingModal
          onClose={() => setProspectingOpen(false)}
          onOpenBatchImport={() => setBatchOpen(true)}
          onLeadsImported={(newLeads) => {
            setLeads((items) => [...newLeads, ...items]);
            void load();
          }}
        />
      )}

      {webhookDocOpen && (
        <WebhookDocModal
          onClose={() => setWebhookDocOpen(false)}
          onLeadCreated={(newLead) => {
            setLeads((items) => [newLead, ...items]);
            setSelected(newLead);
            void load();
          }}
        />
      )}

      {analyticsModalOpen && (
        <AnalyticsModal
          onClose={() => setAnalyticsModalOpen(false)}
        />
      )}

      {addOpen && (
        <AddLead
          onClose={() => setAddOpen(false)}
          onCreated={(lead) => {
            setLeads((items) => [lead, ...items]);
            setAddOpen(false);
            setSelected(lead);
            void load();
          }}
        />
      )}

      {batchOpen && (
        <BatchImportModal
          onClose={() => setBatchOpen(false)}
          onImported={(newLeads) => {
            setLeads((items) => [...newLeads, ...items]);
            setBatchOpen(false);
            void load();
          }}
        />
      )}

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        leads={leads}
        onSelectLead={(lead) => {
          setSelected(lead);
          setIsCommandPaletteOpen(false);
        }}
        onOpenCreateModal={() => setAddOpen(true)}
        onOpenBatchModal={() => setBatchOpen(true)}
        onOpenPlaybook={() => setApproachPlaybookOpen(true)}
        onOpenDaily={() => setProspectingOpen(true)}
        onOpenAnalytics={() => setAnalyticsModalOpen(true)}
        onToggleViewMode={() => handleViewModeChange(viewMode === "table" ? "kanban" : "table")}
        viewMode={viewMode}
      />
    </div>
  );
}
