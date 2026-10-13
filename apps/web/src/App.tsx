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
import { ApproachPlaybookModal } from "./ApproachPlaybookModal";
import { DailyProspectingModal } from "./DailyProspectingModal";
import { WebhookDocModal } from "./WebhookDocModal";
import { AnalyticsModal } from "./AnalyticsModal";
import { CommandPalette } from "./CommandPalette";
import { RoiCalculatorModal } from "./RoiCalculatorModal";
import { LeadAuditModal } from "./LeadAuditModal";
import { ColdAudioScriptModal } from "./ColdAudioScriptModal";
import { BeforeAfterCardModal } from "./BeforeAfterCardModal";
import { PublicProposalView } from "./PublicProposalView";
import { McpHubModal } from "./McpHubModal";
import { LeadDrawer } from "./LeadDrawer";
import { PipelineView } from "./views/PipelineView";
import { DailyRoutineView } from "./views/DailyRoutineView";
import { AnalyticsView } from "./views/AnalyticsView";
import { PlaybookView } from "./views/PlaybookView";
import { IntegrationsView } from "./views/IntegrationsView";
import type { DashboardData, Lead, Stage } from "./types";

export type AppView = "pipeline" | "routine" | "analytics" | "playbook" | "integrations";

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
  const [activeView, setActiveView] = useState<AppView>("pipeline");

  // Commercial Suite Modals
  const [proposalModalLead, setProposalModalLead] = useState<Lead | null>(null);
  const [playbookModalLead, setPlaybookModalLead] = useState<Lead | null>(null);
  const [approachPlaybookOpen, setApproachPlaybookOpen] = useState(false);
  const [prospectingOpen, setProspectingOpen] = useState(false);
  const [webhookDocOpen, setWebhookDocOpen] = useState(false);
  const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);
  const [mcpHubOpen, setMcpHubOpen] = useState(false);

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

  // Navigation & Productivity states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem("prospector_sidebar_collapsed") === "true";
  });
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [followupDropdownOpen, setFollowupDropdownOpen] = useState(false);
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
  const contactedTodayCount = Math.min(leads.filter((l) => Boolean(l.hasWhatsapp)).length, dailyTargetCount);
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
      {/* Sidebar Executiva com Páginas Dedicadas */}
      <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-top-row">
          <button
            type="button"
            className="brand-btn"
            onClick={() => setActiveView("pipeline")}
            aria-label="Prospector Home"
          >
            <span>
              <CircleGauge />
            </span>
            {!sidebarCollapsed && (
              <div className="brand-text">
                <strong>prospector</strong>
                <small>por Henrique</small>
              </div>
            )}
          </button>
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
            <button
              type="button"
              className={`sidebar-nav-btn ${activeView === "pipeline" ? "active" : ""}`}
              onClick={() => setActiveView("pipeline")}
              title="Pipeline & Gestão de Leads"
            >
              <Users size={18} />
              {!sidebarCollapsed && <span>Pipeline & Leads</span>}
            </button>
            <button
              type="button"
              className={`sidebar-nav-btn ${activeView === "routine" ? "active" : ""}`}
              onClick={() => setActiveView("routine")}
              title="Rotina Diária & Radar de Nichos"
            >
              <Compass size={18} />
              {!sidebarCollapsed && <span>Rotina Diária</span>}
            </button>
          </div>

          <div className="sidebar-section">
            {!sidebarCollapsed && <span className="sidebar-section-title">Inteligência</span>}
            <button
              type="button"
              className={`sidebar-nav-btn ${activeView === "playbook" ? "active" : ""}`}
              onClick={() => setActiveView("playbook")}
              title="Playbook de Abordagens & Objeções"
            >
              <BookOpen size={18} />
              {!sidebarCollapsed && <span>Playbook & Roteiros</span>}
            </button>
            <button
              type="button"
              className={`sidebar-nav-btn ${activeView === "analytics" ? "active" : ""}`}
              onClick={() => setActiveView("analytics")}
              title="Analytics de Conversão & Métricas"
            >
              <BarChart3 size={18} />
              {!sidebarCollapsed && <span>Analytics</span>}
            </button>
          </div>

          <div className="sidebar-section">
            {!sidebarCollapsed && <span className="sidebar-section-title">Automação & IA</span>}
            <button
              type="button"
              className={`sidebar-nav-btn ${activeView === "integrations" ? "active" : ""}`}
              onClick={() => setActiveView("integrations")}
              title="Central de Conexões MCP & Webhooks"
            >
              <Plug size={18} />
              {!sidebarCollapsed && <span>Integrações & MCP</span>}
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

      {/* Conteúdo Principal com Topbar Limpa */}
      <main id="top">
        <header className="topbar">
          <div>
            <span className="eyebrow">{today}</span>
            <h1>
              {activeView === "pipeline" && "Seu radar comercial"}
              {activeView === "routine" && "Rotina diária de prospecção"}
              {activeView === "analytics" && "Inteligência de conversão"}
              {activeView === "playbook" && "Playbook de abordagens comerciais"}
              {activeView === "integrations" && "Central de conexões & agentes"}
            </h1>
            <p>
              {activeView === "pipeline" && "Veja os sinais mais promissores e decida o próximo movimento."}
              {activeView === "routine" && "Prospecção ativa nos 11 nichos da Baixada Santista com dados reais."}
              {activeView === "analytics" && "Acompanhe suas taxas de resposta, reuniões e fechamento por nicho."}
              {activeView === "playbook" && "Roteiros validados, perguntas de impacto e respostas a objeções no WhatsApp."}
              {activeView === "integrations" && "Conecte LLMs externos ao MCP Server e receba leads por Webhook."}
            </p>
          </div>

          <div className="topbar-actions">
            {/* Command Palette Trigger (Ctrl+K) */}
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

            {/* Meta Diária Resumida (Navega para a Rotina Diária) */}
            <div
              className="topbar-gamified-goal"
              onClick={() => setActiveView("routine")}
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

            {/* Notificações de Follow-up de Hoje */}
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

            {/* Apenas 2 Botões Essenciais de Ação na Topbar */}
            <button className="secondary batch-button" onClick={() => setBatchOpen(true)}>
              <Layers size={16} />
              <span>Importar em massa</span>
            </button>
            <button className="primary" onClick={() => setAddOpen(true)}>
              <Plus size={16} />
              <span>Adicionar empresa</span>
            </button>
          </div>
        </header>

        {error && (
          <div className="error-banner">
            {error}. Execute <code>npm run dev</code> na raiz do projeto.
          </div>
        )}

        {/* Renderização Condicional da Página Selecionada */}
        {activeView === "pipeline" && (
          <PipelineView
            leads={leads}
            dashboard={dashboard}
            onSelectLead={setSelected}
            onUpdateStage={handleUpdateStage}
            onAnalyzeNext={analyzeNext}
            onOpenAddModal={() => setAddOpen(true)}
            onOpenBatchModal={() => setBatchOpen(true)}
          />
        )}

        {activeView === "routine" && (
          <DailyRoutineView
            leads={leads}
            onSelectLead={setSelected}
            onImportBatch={() => setBatchOpen(true)}
          />
        )}

        {activeView === "analytics" && (
          <AnalyticsView
            leads={leads}
            dashboard={dashboard}
          />
        )}

        {activeView === "playbook" && (
          <PlaybookView
            selectedLead={selected}
            onSelectLead={setSelected}
          />
        )}

        {activeView === "integrations" && (
          <IntegrationsView
            onLeadSelect={(leadId) => {
              const found = leads.find((l) => l.id === leadId);
              if (found) setSelected(found);
            }}
            onLeadCreated={(newLead) => {
              setLeads((items) => [newLead, ...items]);
              setSelected(newLead);
              void load();
            }}
          />
        )}

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

      {/* Navegação Mobile com as Telas Principais */}
      <nav className="mobile-nav" aria-label="Navegação principal">
        <button
          type="button"
          className={activeView === "pipeline" ? "active" : ""}
          onClick={() => setActiveView("pipeline")}
        >
          <LayoutDashboard />
          <span>Visão geral</span>
        </button>
        <button
          type="button"
          className={activeView === "pipeline" ? "active" : ""}
          onClick={() => setActiveView("pipeline")}
        >
          <Users />
          <span>Leads</span>
        </button>
        <button
          type="button"
          className={activeView === "pipeline" ? "active" : ""}
          onClick={() => setActiveView("pipeline")}
        >
          <CalendarClock />
          <span>Follow-ups</span>
          {todayFollowUps.length > 0 && <b>{todayFollowUps.length}</b>}
        </button>
        <button
          type="button"
          className={activeView === "routine" ? "active" : ""}
          onClick={() => setActiveView("routine")}
        >
          <Compass />
          <span>Rotina</span>
        </button>
        <button
          type="button"
          className={activeView === "playbook" ? "active" : ""}
          onClick={() => setActiveView("playbook")}
        >
          <BookOpen />
          <span>Playbook</span>
        </button>
        <button
          type="button"
          className={activeView === "analytics" ? "active" : ""}
          onClick={() => setActiveView("analytics")}
        >
          <BarChart3 />
          <span>Analytics</span>
        </button>
        <button
          type="button"
          className={activeView === "integrations" ? "active" : ""}
          onClick={() => setActiveView("integrations")}
        >
          <Plug />
          <span>MCP</span>
        </button>
      </nav>

      {/* Ficha do Lead Renovada (720px, 4 Abas) */}
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

      {/* Modais de Fechamento & Ferramentas Rápidas */}
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

      {mcpHubOpen && (
        <McpHubModal
          isOpen={mcpHubOpen}
          onClose={() => setMcpHubOpen(false)}
          onLeadSelect={(leadId) => {
            const found = leads.find((l) => l.id === leadId);
            if (found) setSelected(found);
          }}
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
        onOpenPlaybook={() => setActiveView("playbook")}
        onOpenDaily={() => setActiveView("routine")}
        onOpenAnalytics={() => setActiveView("analytics")}
        onOpenMcp={() => setActiveView("integrations")}
        onToggleViewMode={() => {}}
        viewMode="table"
      />
    </div>
  );
}
