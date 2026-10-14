import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  Bot,
  CalendarClock,
  CalendarPlus,
  Check,
  ChevronRight,
  CircleGauge,
  Clock,
  Copy,
  Edit3,
  ExternalLink,
  FileText,
  Flame,
  Globe,
  Layers,
  MapPin,
  MessageCircle,
  MessageSquareText,
  Mic,
  MicOff,
  Phone,
  Plus,
  Save,
  Send,
  Share2,
  Sparkles,
  Target,
  Terminal,
  Wand2,
  X
} from "lucide-react";
import { api } from "./api";
import { ObjectionsAssistant } from "./ObjectionsAssistant";
import { triggerConfetti } from "./Confetti";
import type { DemoPrimaryGoal, DemoProjectType, DemoStatus, Lead, Stage } from "./types";
import { DEMO_PLATFORMS, PLATFORM_LIST, type DemoPlatform } from "./demoPlatforms";

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

type ApproachType = "curiosity" | "invisible_loss" | "ready_question" | "portfolio" | "short" | "direct";
type DrawerTab = "overview" | "arsenal" | "demos" | "history";

export interface LeadDrawerProps {
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
}

export function LeadDrawer({
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
}: LeadDrawerProps) {
  const [activeTab, setActiveTab] = useState<DrawerTab>("overview");
  const [busy, setBusy] = useState("");
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedApproach, setSelectedApproach] = useState<ApproachType>("curiosity");
  const [demoUrlInput, setDemoUrlInput] = useState(lead.demoUrl || "");
  const [selectedPlatform, setSelectedPlatform] = useState<DemoPlatform>(lead.demoPlatform || "lovable");
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const [demoForm, setDemoForm] = useState<{
    projectType: DemoProjectType;
    primaryGoal: DemoPrimaryGoal;
    informationConfirmed: boolean;
  }>({
    projectType: lead.demoProjectType || "landing_page",
    primaryGoal: lead.demoPrimaryGoal || "quotes",
    informationConfirmed: Boolean(lead.demoInformationConfirmed)
  });

  const latestDemo = lead.demos?.[0];

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
    setDemoUrlInput(lead.demos?.[0]?.previewUrl || lead.demoUrl || "");
    setSelectedPlatform(lead.demoPlatform || (lead.demos?.[0]?.platform as DemoPlatform) || "lovable");
    setDemoForm({
      projectType: lead.demoProjectType || "landing_page",
      primaryGoal: lead.demoPrimaryGoal || "quotes",
      informationConfirmed: Boolean(lead.demoInformationConfirmed)
    });
    setIsEditing(false);
  }, [lead.id, lead.updatedAt, lead.demoUrl, lead.demoPlatform, lead.demoProjectType, lead.demoPrimaryGoal, lead.demoInformationConfirmed, lead.demos]);

  const act = async (name: string, fn: () => Promise<Lead>) => {
    setBusy(name);
    try {
      onChanged(await fn());
    } finally {
      setBusy("");
    }
  };

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

  const activePlatform = DEMO_PLATFORMS[selectedPlatform] || DEMO_PLATFORMS.lovable;
  const customizedPrompt = latestDemo ? activePlatform.formatPrompt(latestDemo.prompt, lead) : "";

  const handleCopyPrompt = async () => {
    if (customizedPrompt) {
      await navigator.clipboard.writeText(customizedPrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    }
  };

  const handleSaveDemoUrl = async () => {
    await act("save-demo-url", () =>
      latestDemo
        ? api.updateDemo(lead.id, latestDemo.id, { previewUrl: demoUrlInput, platform: selectedPlatform })
        : api.update(lead.id, { demoUrl: demoUrlInput, demoPlatform: selectedPlatform })
    );
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
      <aside className="drawer drawer-expanded">
        {/* Header Amplo & Limpo */}
        <div className="drawer-header-clean">
          <div className="drawer-header-main-info">
            <div className="drawer-header-top-meta">
              <span className="eyebrow">
                {lead.segment} · {lead.city}/{lead.state}
              </span>
              <div className="drawer-header-badges">
                <span className="drawer-badge drawer-score-pill">Score {lead.score || 0}/100</span>
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
            <h2 className="drawer-lead-title">{lead.name}</h2>
          </div>

          <button className="icon-button close-drawer-btn" onClick={onClose} aria-label="Fechar ficha">
            <X size={18} />
          </button>
        </div>

        {/* Abas de Navegação Interna do Lead */}
        <div className="drawer-nav-tabs">
          <button
            type="button"
            className={`drawer-tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <CircleGauge size={14} />
            <span>Visão Geral</span>
          </button>
          <button
            type="button"
            className={`drawer-tab-btn ${activeTab === "arsenal" ? "active" : ""}`}
            onClick={() => setActiveTab("arsenal")}
          >
            <Flame size={14} />
            <span>Arsenal de Vendas</span>
          </button>
          <button
            type="button"
            className={`drawer-tab-btn ${activeTab === "demos" ? "active" : ""}`}
            onClick={() => setActiveTab("demos")}
          >
            <Bot size={14} />
            <span>Demonstrações IA & Proposta</span>
          </button>
          <button
            type="button"
            className={`drawer-tab-btn ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            <MessageSquareText size={14} />
            <span>Histórico & Follow-ups</span>
            {lead.interactions.length > 0 && <span className="tab-counter">{lead.interactions.length}</span>}
          </button>
        </div>

        {/* Corpo com Scroll Espaçoso */}
        <div className="drawer-body-expanded">
          {/* ABA 1: VISÃO GERAL */}
          {activeTab === "overview" && (
            <div className="drawer-tab-pane">
              {/* Card de Estágio do Funil */}
              <section className="drawer-card highlight-card">
                <div className="section-title">
                  <div>
                    <span className="eyebrow">Etapa Comercial</span>
                    <h3>Estágio do Relacionamento</h3>
                  </div>
                  <span className={`stage stage-${lead.stage}`}>{stageLabels[lead.stage]}</span>
                </div>
                <div className="stage-selector-row">
                  <select
                    className="stage-select-large"
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
                </div>
              </section>

              {/* Card de Diagnóstico & Inteligência */}
              <section className="drawer-card">
                <div className="section-title">
                  <div>
                    <span className="eyebrow">Inteligência Gemini</span>
                    <h3>Diagnóstico de Potencial</h3>
                  </div>
                  <div className="lead-score-executive-pill">
                    <span className="executive-score-val">{lead.score || 0}</span>
                    <span className="executive-score-denom">/100</span>
                    <span className="executive-score-label">
                      {(lead.score || 0) >= 70 ? "Alta Conversão 🔥" : (lead.score || 0) >= 40 ? "Médio Potencial" : "A Avaliar"}
                    </span>
                  </div>
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
                      <strong>Justificativa técnica</strong>
                      <p>{lead.reason}</p>
                    </div>
                  </div>
                )}

                <button
                  className="secondary full mt-2"
                  disabled={busy === "analyze"}
                  onClick={() => act("analyze", () => api.analyze(lead.id))}
                >
                  <Sparkles size={15} />
                  {busy === "analyze" ? "Analisando com Gemini…" : lead.analyzedAt ? "Reanalisar Estabelecimento" : "Pesquisar e Analisar"}
                </button>
              </section>

              {/* Dados do Estabelecimento */}
              <section className="drawer-card">
                <div className="section-title">
                  <div>
                    <span className="eyebrow">Informações do Contato</span>
                    <h3>Dados do Estabelecimento</h3>
                  </div>
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
                      <span>Nome da Empresa</span>
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
                      <span>Endereço Completo</span>
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

                {/* Ações Rápidas de Contato */}
                <div className="drawer-quick-contact-actions">
                  {waDirectUrl && (
                    <a
                      href={waDirectUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-quick-contact wa"
                    >
                      <MessageCircle size={14} />
                      <span>Conversar no WhatsApp</span>
                    </a>
                  )}
                  {lead.phone && (
                    <a href={`tel:${lead.phone}`} className="btn-quick-contact tel">
                      <Phone size={14} />
                      <span>Ligar Agora</span>
                    </a>
                  )}
                  {lead.website && (
                    <a href={lead.website} target="_blank" rel="noreferrer" className="btn-quick-contact web">
                      <Globe size={14} />
                      <span>Visitar Site</span>
                    </a>
                  )}
                  {lead.mapsUrl && (
                    <a href={lead.mapsUrl} target="_blank" rel="noreferrer" className="btn-quick-contact maps">
                      <MapPin size={14} />
                      <span>Google Maps</span>
                    </a>
                  )}
                </div>
              </section>
            </div>
          )}

          {/* ABA 2: ARSENAL DE VENDAS */}
          {activeTab === "arsenal" && (
            <div className="drawer-tab-pane">
              {/* Botões / Ferramentas Rápidas de Fechamento */}
              <div className="arsenal-tools-grid">
                <button
                  type="button"
                  className="arsenal-tool-card"
                  onClick={() => onOpenRoi(lead)}
                >
                  <div className="tool-icon-wrap roi">
                    <Flame size={20} />
                  </div>
                  <div className="tool-card-info">
                    <strong>Calculadora de ROI da Perda</strong>
                    <span>Calcule quanto o cliente perde todo mês sem site.</span>
                  </div>
                  <ChevronRight size={16} className="tool-arrow" />
                </button>

                <button
                  type="button"
                  className="arsenal-tool-card"
                  onClick={() => onOpenAudit(lead)}
                >
                  <div className="tool-icon-wrap audit">
                    <Activity size={20} />
                  </div>
                  <div className="tool-card-info">
                    <strong>Raio-X Técnico de Presença</strong>
                    <span>Auditoria de SEO local, velocidade e celular.</span>
                  </div>
                  <ChevronRight size={16} className="tool-arrow" />
                </button>

                <button
                  type="button"
                  className="arsenal-tool-card"
                  onClick={() => onOpenAudio(lead)}
                >
                  <div className="tool-icon-wrap audio">
                    <Mic size={20} />
                  </div>
                  <div className="tool-card-info">
                    <strong>Teleprompter de Áudio 30s</strong>
                    <span>Roteiro calibrado para gravar áudio no WhatsApp.</span>
                  </div>
                  <ChevronRight size={16} className="tool-arrow" />
                </button>

                <button
                  type="button"
                  className="arsenal-tool-card"
                  onClick={() => onOpenBeforeAfter(lead)}
                >
                  <div className="tool-icon-wrap before-after">
                    <Layers size={20} />
                  </div>
                  <div className="tool-card-info">
                    <strong>Card Antes vs Depois</strong>
                    <span>Contraste visual de impacto para enviar ao cliente.</span>
                  </div>
                  <ChevronRight size={16} className="tool-arrow" />
                </button>
              </div>

              {/* Seletor de Mensagens e Abordagem */}
              <section className="drawer-card">
                <div className="section-title">
                  <div>
                    <span className="eyebrow">Playbook de Abordagens</span>
                    <h3>Mensagem Personalizada de Prospecção</h3>
                  </div>
                  <div className="section-actions-row">
                    <button type="button" className="secondary-subtle-btn" onClick={() => onOpenPlaybook(lead)}>
                      Ver Playbook
                    </button>
                    {currentMessage && (
                      <button className="copy-action-btn" onClick={copyMessage}>
                        {copied ? <Check size={13} /> : <Copy size={13} />}
                        <span>{copied ? "Copiado!" : "Copiar"}</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="approach-tabs" role="tablist">
                  <button
                    type="button"
                    className={`approach-tab ${selectedApproach === "curiosity" ? "active" : ""}`}
                    onClick={() => setSelectedApproach("curiosity")}
                  >
                    1. Concorrência ⭐
                  </button>
                  <button
                    type="button"
                    className={`approach-tab ${selectedApproach === "invisible_loss" ? "active" : ""}`}
                    onClick={() => setSelectedApproach("invisible_loss")}
                  >
                    2. Perda Invisível 🔥
                  </button>
                  <button
                    type="button"
                    className={`approach-tab ${selectedApproach === "ready_question" ? "active" : ""}`}
                    onClick={() => setSelectedApproach("ready_question")}
                  >
                    3. Prontidão 🚀
                  </button>
                  <button
                    type="button"
                    className={`approach-tab ${selectedApproach === "portfolio" ? "active" : ""}`}
                    onClick={() => setSelectedApproach("portfolio")}
                  >
                    Portfólio
                  </button>
                  <button
                    type="button"
                    className={`approach-tab ${selectedApproach === "short" ? "active" : ""}`}
                    onClick={() => setSelectedApproach("short")}
                  >
                    Curta
                  </button>
                  <button
                    type="button"
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
                    <span>Abrir WhatsApp com esta mensagem</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </section>

              {/* Assistente de Objeções WhatsApp */}
              <ObjectionsAssistant
                lead={lead}
                onLoggedInteraction={(noteText) => {
                  api.interaction(lead.id, noteText).then(onChanged).catch(() => {});
                }}
              />
            </div>
          )}

          {/* ABA 3: DEMONSTRAÇÕES IA & PROPOSTA */}
          {activeTab === "demos" && (
            <div className="drawer-tab-pane">
              {/* Cartão de Propostas Públicas & PDF */}
              <section className="drawer-card">
                <div className="section-title">
                  <div>
                    <span className="eyebrow">Fechamento Formal</span>
                    <h3>Apresentação & Proposta Comercial</h3>
                  </div>
                </div>
                <p className="subtle-desc">
                  Compartilhe uma proposta web ao vivo personalizada ou gere o arquivo PDF com as credenciais de Henrique.
                </p>

                <div className="proposals-action-row">
                  <button
                    type="button"
                    className="secondary proposal-btn"
                    onClick={() => onOpenPublicProposal(lead)}
                  >
                    <Share2 size={15} />
                    <span>Abrir Proposta Web do Cliente (?proposta=)</span>
                  </button>

                  <button
                    type="button"
                    className="secondary proposal-btn"
                    onClick={() => onOpenProposal(lead)}
                  >
                    <FileText size={15} />
                    <span>Gerar Proposta em PDF</span>
                  </button>
                </div>
              </section>

              {/* Fluxo de Demonstração IA */}
              <section className="drawer-card demo-workflow-card">
                <div className="section-title">
                  <div>
                    <span className="eyebrow">Human-in-the-loop</span>
                    <h3>Demonstração com IA Construtora</h3>
                  </div>
                  {latestDemo?.previewUrl && (
                    <a href={latestDemo.previewUrl} target="_blank" rel="noreferrer" className="demo-live-badge">
                      <ExternalLink size={12} /> Ver V{latestDemo.version} Ao Vivo
                    </a>
                  )}
                </div>

                <div className="demo-workflow-status">
                  <label className="field">
                    <span>Interesse do cliente</span>
                    <select
                      value={lead.demoInterest || "not_offered"}
                      onChange={(e) =>
                        act("demo-interest", () =>
                          api.update(lead.id, { demoInterest: e.target.value as Lead["demoInterest"] })
                        )
                      }
                    >
                      <option value="not_offered">Não oferecida</option>
                      <option value="offered">Oferecida</option>
                      <option value="accepted">Aceita</option>
                      <option value="declined">Recusada</option>
                    </select>
                  </label>
                  <label className="field">
                    <span>Status</span>
                    <input value={lead.demoStatus || "Aguardando aceite"} readOnly />
                  </label>
                </div>

                {lead.demoInterest === "not_offered" || !lead.demoInterest ? (
                  <button
                    className="secondary full mt-2"
                    disabled={busy === "offer-demo"}
                    onClick={() => act("offer-demo", () => api.offerDemo(lead.id))}
                  >
                    <MessageCircle size={15} />
                    {busy === "offer-demo" ? "Preparando…" : "Preparar Oferta de Demonstração"}
                  </button>
                ) : null}

                <div className="demo-workflow-status mt-2">
                  <label className="field">
                    <span>Tipo de projeto</span>
                    <select
                      value={demoForm.projectType}
                      onChange={(e) => setDemoForm({ ...demoForm, projectType: e.target.value as DemoProjectType })}
                    >
                      <option value="landing_page">Landing page de alta conversão</option>
                      <option value="institutional_site">Site institucional completo</option>
                      <option value="catalog">Catálogo digital / Menu</option>
                      <option value="ecommerce">E-commerce / Loja virtual</option>
                    </select>
                  </label>
                  <label className="field">
                    <span>Objetivo principal</span>
                    <select
                      value={demoForm.primaryGoal}
                      onChange={(e) => setDemoForm({ ...demoForm, primaryGoal: e.target.value as DemoPrimaryGoal })}
                    >
                      <option value="quotes">Mais orçamentos no WhatsApp</option>
                      <option value="orders">Pedidos e vendas</option>
                      <option value="reservations">Reservas</option>
                      <option value="appointments">Agendamentos</option>
                    </select>
                  </label>
                </div>

                <label className="demo-confirmation-check mt-2">
                  <input
                    type="checkbox"
                    checked={demoForm.informationConfirmed}
                    onChange={(e) => setDemoForm({ ...demoForm, informationConfirmed: e.target.checked })}
                  />
                  <span>
                    <strong>Informações confirmadas</strong>
                    Telefone, endereço, serviços e identidade visual foram verificados com o cliente.
                  </span>
                </label>

                <button
                  className="primary full demo-action-btn mt-3"
                  disabled={
                    busy === "generate-demo" ||
                    lead.demoInterest !== "accepted" ||
                    !demoForm.informationConfirmed
                  }
                  onClick={() =>
                    act("generate-demo", () =>
                      api.generateDemo(lead.id, {
                        projectType: demoForm.projectType,
                        primaryGoal: demoForm.primaryGoal,
                        informationConfirmed: true
                      })
                    )
                  }
                  title={
                    lead.demoInterest !== "accepted"
                      ? "Registre o aceite do cliente primeiro"
                      : !demoForm.informationConfirmed
                      ? "Confirme os dados antes de gerar"
                      : "Gerar briefing e prompt"
                  }
                >
                  <Bot size={16} />
                  {busy === "generate-demo"
                    ? "Gerando briefing e prompt com IA…"
                    : latestDemo
                    ? "Gerar nova versão da demonstração"
                    : "Gerar Briefing e Prompt com IA"}
                </button>

                {latestDemo ? (
                  <div className="demo-version-panel mt-3">
                    <div className="demo-version-header">
                      <div>
                        <span className="demo-brief-eyebrow">Versão V{latestDemo.version}</span>
                        <strong>Status: {latestDemo.status}</strong>
                      </div>
                      <select
                        value={latestDemo.status}
                        onChange={(e) =>
                          act("demo-status", () =>
                            api.updateDemo(lead.id, latestDemo.id, {
                              status: e.target.value as DemoStatus
                            })
                          )
                        }
                      >
                        <option value="review">Em revisão</option>
                        <option value="ready">Pronta</option>
                        <option value="sent">Enviada ao cliente</option>
                        <option value="approved">Aprovada</option>
                        <option value="generating">Gerando</option>
                        <option value="briefing">Briefing</option>
                      </select>
                    </div>

                    <div className="demo-copy-block">
                      <div className="section-title">
                        <h4>Resumo Estratégico</h4>
                        <button
                          className="copy-action-btn"
                          onClick={() => navigator.clipboard.writeText(latestDemo.strategicSummary)}
                        >
                          <Copy size={13} /> Copiar
                        </button>
                      </div>
                      <p>{latestDemo.strategicSummary}</p>
                    </div>

                    {/* SELETOR DE PLATAFORMAS DE IA & FERRAMENTAS */}
                    <div className="demo-platforms-container mt-3">
                      <div className="demo-platforms-header">
                        <span className="eyebrow">Plataformas de Criação & IA</span>
                        <h4>Onde você deseja gerar a demonstração?</h4>
                      </div>

                      <div className="demo-platforms-grid">
                        {PLATFORM_LIST.map((platId) => {
                          const p = DEMO_PLATFORMS[platId];
                          const isSelected = selectedPlatform === platId;
                          return (
                            <button
                              key={platId}
                              type="button"
                              className={`demo-platform-pill ${isSelected ? "active" : ""}`}
                              onClick={() => setSelectedPlatform(platId)}
                            >
                              <span className="platform-icon">{p.iconName}</span>
                              <span className="platform-name">{p.name}</span>
                              <span className="platform-badge">{p.badge}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* CARD DETALHADO DA PLATAFORMA ATIVA */}
                      <div className="demo-active-platform-card">
                        <div className="active-platform-top">
                          <div className="active-platform-info">
                            <div className="active-platform-title-row">
                              <span className="platform-avatar">{activePlatform.iconName}</span>
                              <strong>{activePlatform.name}</strong>
                              <span className="platform-badge-tag">{activePlatform.badge}</span>
                              {activePlatform.id === "antigravity_mcp" && (
                                <span className="mcp-live-badge">MCP Ativo ⚡</span>
                              )}
                            </div>
                            <p className="platform-tagline">{activePlatform.tagline}</p>
                          </div>

                          {activePlatform.url && (
                            <a
                              href={activePlatform.url}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-open-platform"
                            >
                              <span>Abrir {activePlatform.name}</span>
                              <ExternalLink size={13} />
                            </a>
                          )}
                        </div>

                        <div className="platform-instructions-box">
                          <Sparkles size={13} />
                          <span>{activePlatform.instructions}</span>
                        </div>

                        {/* BLOCO DE PROMPT OTIMIZADO */}
                        <div className="demo-copy-block mt-2">
                          <div className="section-title">
                            <h4>Prompt Otimizado para {activePlatform.name}</h4>
                            <button
                              type="button"
                              className={`copy-action-btn ${copiedPrompt ? "copied" : ""}`}
                              onClick={handleCopyPrompt}
                            >
                              {copiedPrompt ? <Check size={13} /> : <Copy size={13} />}
                              <span>{copiedPrompt ? "Prompt Copiado! ✓" : "Copiar prompt"}</span>
                            </button>
                          </div>
                          <pre className="brief">{customizedPrompt}</pre>
                        </div>
                      </div>
                    </div>

                    {lead.demos && lead.demos.length > 1 && (
                      <div className="demo-version-history mt-2">
                        {lead.demos.slice(1).map((demo) => (
                          <span key={demo.id}>V{demo.version} · {demo.status}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="drawer-empty-text">
                    O briefing e o prompt aparecerão aqui após registrar o aceite do cliente e confirmar os dados.
                  </p>
                )}

                <div className="drawer-demo-url-box mt-3">
                  <div className="demo-url-header-row">
                    <span className="demo-url-label">
                      Link da demonstração pronta no {activePlatform.name} (ou Netlify):
                    </span>
                    {demoUrlInput && (demoUrlInput.startsWith("http://") || demoUrlInput.startsWith("https://")) && (
                      <a
                        href={demoUrlInput}
                        target="_blank"
                        rel="noreferrer"
                        className="demo-test-live-link"
                      >
                        <ExternalLink size={12} /> Testar Ao Vivo
                      </a>
                    )}
                  </div>
                  <div className="input-action-row">
                    <input
                      type="url"
                      placeholder={activePlatform.placeholderUrl}
                      value={demoUrlInput}
                      onChange={(e) => setDemoUrlInput(e.target.value)}
                    />
                    <button
                      type="button"
                      className="secondary"
                      disabled={busy === "save-demo-url" || !demoUrlInput.trim()}
                      onClick={handleSaveDemoUrl}
                    >
                      {busy === "save-demo-url" ? "Salvando…" : "Salvar link"}
                    </button>
                  </div>
                </div>

                {latestDemo && (
                  <label className="field mt-3">
                    <span>Feedback ou próximo ajuste do cliente</span>
                    <textarea
                      defaultValue={latestDemo.feedback || ""}
                      placeholder="Registre o retorno do cliente para gerar a próxima versão."
                      onBlur={(e) => {
                        const feedback = e.target.value.trim();
                        if (feedback !== (latestDemo.feedback || "")) {
                          act("demo-feedback", () =>
                            api.updateDemo(lead.id, latestDemo.id, {
                              feedback,
                              nextStep: feedback ? "Revisar feedback e preparar nova versão" : latestDemo.nextStep
                            })
                          );
                        }
                      }}
                    />
                  </label>
                )}
              </section>
            </div>
          )}

          {/* ABA 4: HISTÓRICO & FOLLOW-UPS */}
          {activeTab === "history" && (
            <div className="drawer-tab-pane">
              {/* Próximo Contato & Google Agenda */}
              <section className="drawer-card">
                <div className="section-title">
                  <div>
                    <span className="eyebrow">Compromisso</span>
                    <h3>Agendamento de Follow-up</h3>
                  </div>
                  {lead.nextFollowUp && (
                    <span className="badge">
                      {new Date(lead.nextFollowUp).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                </div>

                <div className="form-grid">
                  <label className="field">
                    <span>Próxima ação</span>
                    <input
                      value={lead.nextAction || ""}
                      onChange={(e) => act("action", () => api.update(lead.id, { nextAction: e.target.value }))}
                      placeholder="Ex.: Enviar proposta revisada"
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
                </div>

                {googleCalendarUrl && (
                  <a
                    href={googleCalendarUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-google-calendar mt-2"
                    title="Criar evento no Google Agenda com lembrete"
                  >
                    <CalendarPlus size={14} />
                    <span>Adicionar ao Google Agenda</span>
                  </a>
                )}
              </section>

              {/* Registro de Interações & Gravação por Voz */}
              <section className="drawer-card drawer-history-card">
                <div className="section-title">
                  <div>
                    <span className="eyebrow">Anotações</span>
                    <h3>Histórico de Contatos</h3>
                  </div>
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
                      placeholder="Ex.: Falou com o proprietário no WhatsApp, achou a proposta excelente."
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
          )}
        </div>
      </aside>
    </div>
  );
}
