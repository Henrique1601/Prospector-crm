import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  Bot,
  BriefcaseBusiness,
  CalendarClock,
  Check,
  ChevronRight,
  CircleGauge,
  Copy,
  Download,
  Edit3,
  ExternalLink,
  FileText,
  Globe,
  Layers,
  LayoutDashboard,
  ListFilter,
  Loader2,
  MapPin,
  MessageCircle,
  MessageSquareText,
  Phone,
  Plus,
  Save,
  Search,
  Sparkles,
  Target,
  Users,
  X
} from "lucide-react";
import { api } from "./api";
import { BatchImportModal } from "./BatchImportModal";
import { ProposalModal } from "./ProposalModal";
import { ObjectionsAssistant } from "./ObjectionsAssistant";
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

function LeadDrawer({
  lead,
  onClose,
  onChanged,
  onOpenProposal
}: {
  lead: Lead;
  onClose: () => void;
  onChanged: (lead: Lead) => void;
  onOpenProposal: (lead: Lead) => void;
}) {
  const [busy, setBusy] = useState("");
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedApproach, setSelectedApproach] = useState<"portfolio" | "short" | "direct">("portfolio");
  const [demoUrlInput, setDemoUrlInput] = useState(lead.demoUrl || "");

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
    : lead.whatsappUrl;

  const handleSaveLead = async () => {
    const rawPhoneDigits = (editForm.phone || "").replace(/\D/g, "");
    const hasWhatsapp = rawPhoneDigits.length >= 10;
    const whatsappUrl = hasWhatsapp ? `https://wa.me/55${rawPhoneDigits}` : undefined;

    await act("save-lead", async () => {
      const updated = await api.update(lead.id, {
        name: editForm.name.trim(),
        segment: editForm.segment.trim(),
        city: editForm.city.trim(),
        state: editForm.state.trim().toUpperCase() || "SP",
        website: editForm.website.trim() || undefined,
        phone: editForm.phone.trim() || undefined,
        address: editForm.address.trim() || undefined,
        hasWhatsapp,
        whatsappUrl
      });
      setIsEditing(false);
      return updated;
    });
  };

  const handleSaveDemoUrl = async () => {
    await act("save-demo-url", async () => {
      const updated = await api.update(lead.id, {
        demoUrl: demoUrlInput.trim() || undefined
      });
      return updated;
    });
  };

  return (
    <div className="drawer-wrap" role="dialog" aria-modal="true" aria-label={`Detalhes de ${lead.name}`}>
      <button className="drawer-scrim" onClick={onClose} aria-label="Fechar detalhes" />
      <aside className="drawer">
        <header>
          <div>
            <span className="eyebrow">Ficha do lead</span>
            <h2>{lead.name}</h2>
            <p>
              {lead.segment} · {lead.city}, {lead.state}
            </p>
          </div>
          <div className="drawer-header-actions">
            <button
              className={`drawer-action-toggle ${isEditing ? "active" : ""}`}
              onClick={() => setIsEditing(!isEditing)}
              title={isEditing ? "Cancelar edição" : "Editar informações do lead"}
            >
              <Edit3 size={14} />
              <span>{isEditing ? "Cancelar" : "Editar"}</span>
            </button>
            <button className="icon-button" onClick={onClose} aria-label="Fechar">
              <X />
            </button>
          </div>
        </header>

        {isEditing && (
          <div className="drawer-edit-card">
            <h4>Editar dados da empresa</h4>
            <div className="field">
              <span>Nome da Empresa</span>
              <input
                value={editForm.name}
                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Nome da empresa"
              />
            </div>
            <div className="drawer-edit-row">
              <div className="field">
                <span>Segmento</span>
                <input
                  value={editForm.segment}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, segment: e.target.value }))}
                  placeholder="Ex: Restaurante"
                />
              </div>
              <div className="field">
                <span>Cidade / UF</span>
                <div style={{ display: "flex", gap: "6px" }}>
                  <input
                    value={editForm.city}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, city: e.target.value }))}
                    placeholder="Cidade"
                    style={{ flex: 1 }}
                  />
                  <input
                    value={editForm.state}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, state: e.target.value.toUpperCase() }))}
                    placeholder="UF"
                    style={{ width: "45px", textTransform: "uppercase" }}
                    maxLength={2}
                  />
                </div>
              </div>
            </div>
            <div className="drawer-edit-row">
              <div className="field">
                <span>Telefone / WhatsApp</span>
                <input
                  value={editForm.phone}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="(13) 99999-9999"
                />
              </div>
              <div className="field">
                <span>Site</span>
                <input
                  value={editForm.website}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, website: e.target.value }))}
                  placeholder="exemplo.com.br"
                />
              </div>
            </div>
            <div className="field">
              <span>Endereço</span>
              <input
                value={editForm.address}
                onChange={(e) => setEditForm((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="Rua, número, bairro..."
              />
            </div>
            <div className="drawer-edit-actions">
              <button className="secondary" onClick={() => setIsEditing(false)}>
                Cancelar
              </button>
              <button
                className="primary"
                disabled={busy === "save-lead" || !editForm.name.trim()}
                onClick={handleSaveLead}
              >
                <Save size={14} />
                {busy === "save-lead" ? "Salvando…" : "Salvar alterações"}
              </button>
            </div>
          </div>
        )}

        <div className="drawer-score">
          <Score value={lead.score} />
          <div>
            <StagePill stage={lead.stage} />
            <strong>
              {lead.priority === "urgent"
                ? "Prioridade urgente"
                : lead.priority === "high"
                ? "Alta prioridade"
                : "Em avaliação"}
            </strong>
            <small>{lead.nextAction}</small>
          </div>
        </div>

        <div className="drawer-contact-bar">
          {lead.hasWhatsapp && lead.whatsappUrl ? (
            <a
              href={lead.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="whatsapp-action-btn"
              title="Abrir WhatsApp para contato manual"
            >
              <MessageCircle size={15} /> WhatsApp ({lead.phone})
            </a>
          ) : lead.phone ? (
            <a
              href={`tel:${lead.phone.replace(/\D/g, "")}`}
              className="phone-badge"
              title="Ligar para a empresa"
            >
              <Phone size={13} /> {lead.phone}
            </a>
          ) : (
            <span className="no-phone-badge">Sem telefone</span>
          )}

          {lead.website ? (
            <a
              href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`}
              target="_blank"
              rel="noreferrer"
              className="website-link-btn"
            >
              <Globe size={13} /> {lead.website.replace(/^https?:\/\/(www\.)?/, "").slice(0, 22)} <ExternalLink size={11} />
            </a>
          ) : (
            <span className="no-site-badge">Sem site próprio</span>
          )}

          {lead.address && (
            <span className="address-badge" title={lead.address}>
              <MapPin size={12} /> {lead.address}
            </span>
          )}
        </div>

        <div className="drawer-proposal-action-box">
          <button
            type="button"
            className="btn-open-proposal"
            onClick={() => onOpenProposal(lead)}
          >
            <FileText size={16} />
            <span>Gerar Proposta Comercial (PDF / WhatsApp)</span>
          </button>
        </div>

        {lead.website && (
          <div className="drawer-website-preview-card">
            <div className="website-preview-header">
              <span><Globe size={13} /> Site atual do lead</span>
              <a
                href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`}
                target="_blank"
                rel="noreferrer"
                className="website-preview-visit-link"
              >
                Visitar site <ExternalLink size={11} />
              </a>
            </div>
            <div className="website-preview-media">
              <img
                src={`https://image.thum.io/get/width/400/crop/600/${lead.website.startsWith("http") ? lead.website : `https://${lead.website}`}`}
                alt={`Preview do site de ${lead.name}`}
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLElement).parentElement!.style.display = "none";
                }}
              />
            </div>
          </div>
        )}

        <div className="drawer-followup-card">
          <div className="followup-card-header">
            <span className="followup-card-title">
              <CalendarClock size={15} />
              <strong>Próximo Follow-up</strong>
            </span>
            {lead.nextFollowUp && (
              <button
                className="text-button"
                onClick={() => act("clear-followup", () => api.update(lead.id, { nextFollowUp: undefined }))}
              >
                Limpar data
              </button>
            )}
          </div>
          <div className="followup-card-body">
            <input
              type="date"
              className="followup-date-input"
              value={lead.nextFollowUp ? lead.nextFollowUp.slice(0, 10) : ""}
              onChange={(e) => {
                const val = e.target.value;
                act("followup", () => api.update(lead.id, { nextFollowUp: val || undefined }));
              }}
            />
            <small className="followup-status-text">
              {lead.nextFollowUp
                ? `Agendado para ${new Date(lead.nextFollowUp + "T12:00:00").toLocaleDateString("pt-BR", {
                    weekday: "short",
                    day: "2-digit",
                    month: "long"
                  })}`
                : "Nenhum follow-up agendado no radar."}
            </small>
          </div>
        </div>

        <section>
          <div className="section-title">
            <h3>Diagnóstico comercial</h3>
            {lead.mapsUrl && (
              <a href={lead.mapsUrl} target="_blank" rel="noreferrer" className="maps-link-tag">
                Ver no Maps <ExternalLink size={13} />
              </a>
            )}
          </div>
          <p>{lead.reason || "Este lead ainda não foi analisado. A pesquisa deve confirmar os fatos antes da abordagem."}</p>
          {lead.opportunity && (
            <div className="callout">
              <Target size={17} />
              <div>
                <small>Oportunidade</small>
                <strong>{lead.opportunity}</strong>
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

        <section>
          <div className="section-title">
            <h3>Abordagem sugerida</h3>
            {currentMessage && (
              <button className="copy-action-btn" onClick={copyMessage}>
                {copied ? <Check size={13} /> : <Copy size={13} />}
                <span>{copied ? "Copiado!" : "Copiar"}</span>
              </button>
            )}
          </div>

          {lead.suggestedMessages && (
            <div className="approach-tabs" role="tablist" aria-label="Variações de abordagem">
              <button
                type="button"
                role="tab"
                aria-selected={selectedApproach === "portfolio"}
                className={`approach-tab ${selectedApproach === "portfolio" ? "active" : ""}`}
                onClick={() => setSelectedApproach("portfolio")}
              >
                Completa / Portfólio
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
          )}

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
                api.interaction(lead.id, `Iniciou contato no WhatsApp com abordagem: ${
                  selectedApproach === "portfolio" ? "Completa / Portfólio" : selectedApproach === "short" ? "Curta WhatsApp" : "Demonstração"
                }`).then(onChanged).catch(() => {});
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
              onChange={(e) => act("stage", () => api.stage(lead.id, e.target.value as Stage))}
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

        <section>
          <div className="section-title">
            <h3>Demonstração & Landing Page</h3>
            {lead.demoUrl && (
              <a href={lead.demoUrl} target="_blank" rel="noreferrer" className="demo-live-badge">
                <ExternalLink size={12} /> Ver Online
              </a>
            )}
          </div>
          {lead.demoBrief ? (
            <pre className="brief">{lead.demoBrief}</pre>
          ) : (
            <p>Gere um briefing de landing page ou vincule um protótipo construído no Lovable.</p>
          )}
          <button
            className="primary full"
            disabled={busy === "demo"}
            onClick={() => act("demo", () => api.demo(lead.id))}
          >
            <Bot size={16} />
            {busy === "demo" ? "Preparando…" : "Gerar briefing da demonstração"}
          </button>

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

        <section>
          <h3>Histórico</h3>
          <div className="note-row">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Registrar uma observação…"
            />
            <button
              disabled={!note.trim()}
              onClick={() =>
                act("note", async () => {
                  const updated = await api.interaction(lead.id, note);
                  setNote("");
                  return updated;
                })
              }
            >
              <ArrowRight />
            </button>
          </div>
          <div className="timeline">
            {lead.interactions.length ? (
              lead.interactions.map((item) => (
                <div key={item.id}>
                  <i />
                  <p>
                    {item.content}
                    <small>{new Date(item.createdAt).toLocaleString("pt-BR")}</small>
                  </p>
                </div>
              ))
            ) : (
              <p className="empty">Nenhuma interação registrada.</p>
            )}
          </div>
        </section>
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
  const [mapsLink, setMapsLink] = useState("");
  const [resolving, setResolving] = useState(false);
  const [form, setForm] = useState<Partial<Lead>>({
    name: "",
    segment: "",
    city: "Santos",
    state: "SP",
    website: "",
    phone: ""
  });
  const [busy, setBusy] = useState(false);

  const handleResolveMaps = async () => {
    if (!mapsLink.trim()) return;
    setResolving(true);
    try {
      const results = await api.resolveMaps([mapsLink.trim()]);
      const found = results[0];
      if (found) {
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
          whatsappUrl: found.whatsappUrl,
          hasWhatsapp: found.hasWhatsapp,
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
      const cleanPhone = (form.phone || "").replace(/\D/g, "");
      const cleanDigits = cleanPhone.startsWith("55") && cleanPhone.length >= 12 ? cleanPhone.slice(2) : cleanPhone;
      const hasWaUrl = Boolean(form.whatsappUrl || (form.website || "").includes("wa.me") || (form.phone || "").includes("wa.me"));
      const hasWhatsapp = form.hasWhatsapp || hasWaUrl || cleanDigits.length >= 10;
      const whatsappUrl = form.whatsappUrl || (cleanDigits.length >= 10 ? `https://wa.me/55${cleanDigits}` : undefined);

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

        if (query) {
          const text = `${lead.name} ${lead.segment} ${lead.city} ${lead.address || ""}`.toLowerCase();
          if (!text.includes(query.toLowerCase())) return false;
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

  return (
    <div className="shell">
      <aside className="sidebar">
        <a className="brand" href="#top" aria-label="Prospector">
          <span>
            <CircleGauge />
          </span>
          <div>
            <strong>prospector</strong>
            <small>por Henrique</small>
          </div>
        </a>
        <nav>
          <a className="active" href="#top">
            <LayoutDashboard />
            Visão geral
          </a>
          <a href="#pipeline">
            <Users />
            Leads
          </a>
          <a href="#followups">
            <CalendarClock />
            Follow-ups
          </a>
          <a href="#analytics">
            <BarChart3 />
            Analytics
          </a>
        </nav>
        <div className="agent-card">
          <div>
            <Bot />
            <span className="live-dot" />
          </div>
          <strong>Agente em modo {aiMode === "aisa" ? "AIsa" : "local"}</strong>
          <p>
            {aiMode === "aisa"
              ? "Pronto para gerar análises com IA."
              : "Simulação segura, sem consumo de créditos."}
          </p>
        </div>
        <div className="profile">
          <span>HB</span>
          <div>
            <strong>Henrique Bezerra</strong>
            <small>Desenvolvedor Full-Stack</small>
          </div>
        </div>
      </aside>

      <main id="top">
        <header className="topbar">
          <div>
            <span className="eyebrow">{today}</span>
            <h1>Seu radar comercial</h1>
            <p>Veja os sinais mais promissores e decida o próximo movimento.</p>
          </div>
          <div className="topbar-actions">
            {todayFollowUps.length > 0 && (
              <button
                type="button"
                className="topbar-alert-badge"
                onClick={() => {
                  setQuickFilter("today-followup");
                  document.getElementById("pipeline")?.scrollIntoView({ behavior: "smooth" });
                }}
                title="Filtrar follow-ups agendados para hoje ou pendentes"
              >
                <Bell size={15} />
                <span>{todayFollowUps.length} follow-up{todayFollowUps.length === 1 ? "" : "s"} para hoje</span>
              </button>
            )}
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
            <span>{dashboard?.contacted ?? 0} contatos iniciados</span>
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

        <section className="pipeline" id="pipeline">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Base comercial</span>
              <h2>Leads e oportunidades</h2>
            </div>
            <div className="tools">
              <label>
                <Search />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar empresa, cidade…"
                />
              </label>
              <button
                className="filter-button"
                onClick={() => setFilter(filter === "all" ? "new" : "all")}
              >
                <ListFilter />
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
                    <td>
                      <button className="icon-button" aria-label={`Abrir ${lead.name}`}>
                        <ChevronRight />
                      </button>
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
        <a href="#analytics">
          <BarChart3 />
          <span>Analytics</span>
        </a>
      </nav>

      {selected && (
        <LeadDrawer
          lead={selected}
          onClose={() => setSelected(null)}
          onChanged={changed}
          onOpenProposal={(leadToPropose) => setProposalModalLead(leadToPropose)}
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
    </div>
  );
}
