import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Download,
  Flame,
  LayoutDashboard,
  ListFilter,
  MessageCircle,
  MessageSquareText,
  Search,
  Sparkles,
  Table as TableIcon,
  Target,
  Users,
  X
} from "lucide-react";
import { api } from "../api";
import { KanbanBoard } from "../KanbanBoard";
import type { DashboardData, Lead, Stage } from "../types";

export interface PipelineViewProps {
  leads: Lead[];
  dashboard: DashboardData | null;
  onSelectLead: (lead: Lead) => void;
  onUpdateStage: (leadId: string, newStage: Stage) => void;
  onAnalyzeNext: () => void;
  onOpenAddModal: () => void;
  onOpenBatchModal: () => void;
}

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

type SortField = "name" | "score" | "stage" | "priority" | "city" | "createdAt";
type SortDirection = "asc" | "desc";

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

export function PipelineView({
  leads,
  dashboard,
  onSelectLead,
  onUpdateStage,
  onAnalyzeNext,
  onOpenAddModal,
  onOpenBatchModal
}: PipelineViewProps) {
  // Filtros
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [segmentFilter, setSegmentFilter] = useState<string>("all");
  const [presenceFilter, setPresenceFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [quickFilter, setQuickFilter] = useState<"all" | "no-site" | "with-whatsapp" | "today-followup" | "high-priority">("all");

  // Ordenação
  const [sortField, setSortField] = useState<SortField>("score");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Visualização e paginação
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const todayIsoStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const todayFollowUps = useMemo(() => {
    return leads.filter((lead) => Boolean(lead.nextFollowUp && lead.nextFollowUp.slice(0, 10) <= todayIsoStr));
  }, [leads, todayIsoStr]);

  // Lista dinâmica de cidades
  const cities = useMemo(() => {
    const set = new Set(leads.map((l) => l.city).filter(Boolean));
    return Array.from(set).sort();
  }, [leads]);

  // Lista dinâmica de segmentos
  const segments = useMemo(() => {
    const set = new Set(leads.map((l) => l.segment).filter(Boolean));
    return Array.from(set).sort();
  }, [leads]);

  // Contagens dos chips rápidos
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

  // Filtragem
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (stageFilter !== "all" && lead.stage !== stageFilter) return false;
      if (segmentFilter !== "all" && lead.segment !== segmentFilter) return false;
      if (cityFilter !== "all" && lead.city !== cityFilter) return false;

      if (presenceFilter === "no-site") {
        const hasNoSite = lead.siteStatus === "none" || !lead.website || lead.website.includes("wa.me");
        if (!hasNoSite) return false;
      } else if (presenceFilter === "weak-site") {
        if (lead.siteStatus !== "weak") return false;
      } else if (presenceFilter === "has-site") {
        if (!lead.website || lead.siteStatus === "none") return false;
      }

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
    });
  }, [leads, stageFilter, segmentFilter, presenceFilter, cityFilter, quickFilter, query, todayIsoStr]);

  // Ordenação
  const sortedLeads = useMemo(() => {
    const list = [...filteredLeads];
    list.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name, "pt-BR");
          break;
        case "score":
          comparison = (a.score || 0) - (b.score || 0);
          break;
        case "stage":
          comparison = a.stage.localeCompare(b.stage);
          break;
        case "priority": {
          const priorityWeight: Record<string, number> = { urgent: 3, high: 2, medium: 1, low: 0 };
          comparison = (priorityWeight[a.priority] || 0) - (priorityWeight[b.priority] || 0);
          break;
        }
        case "city":
          comparison = (a.city || "").localeCompare(b.city || "", "pt-BR");
          break;
        case "createdAt":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        default:
          comparison = 0;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
    return list;
  }, [filteredLeads, sortField, sortDirection]);

  // Paginação
  const totalPages = Math.max(1, Math.ceil(sortedLeads.length / pageSize));
  const paginatedLeads = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedLeads.slice(start, start + pageSize);
  }, [sortedLeads, page]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection(field === "score" || field === "priority" ? "desc" : "asc");
    }
    setPage(1);
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={12} className="sort-icon inactive" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp size={12} className="sort-icon active" />
    ) : (
      <ArrowDown size={12} className="sort-icon active" />
    );
  };

  return (
    <div className="view-container">
      {/* Resumo de Métricas (Double-Bezel KPI Grid) */}
      <section className="metrics" aria-label="Resumo do funil">
        <article className="metric">
          <div className="metric-icon">
            <Users size={18} />
          </div>
          <div>
            <span>Leads Mapeados</span>
            <strong>{dashboard?.total ?? leads.length}</strong>
            <small>base ativa</small>
          </div>
        </article>

        <article className="metric">
          <div className="metric-icon">
            <Target size={18} />
          </div>
          <div>
            <span>Alta Prioridade</span>
            <strong>{dashboard?.highPriority ?? quickCounts.highPriority}</strong>
            <small>merecem atenção</small>
          </div>
        </article>

        <article className="metric">
          <div className="metric-icon">
            <MessageSquareText size={18} />
          </div>
          <div>
            <span>Taxa de Resposta</span>
            <strong>{dashboard?.responseRate ?? 0}%</strong>
            <small>{dashboard?.replies ?? 0} respostas registradas</small>
          </div>
        </article>

        <article className="metric">
          <div className="metric-icon">
            <BriefcaseBusiness size={18} />
          </div>
          <div>
            <span>Negócios Fechados</span>
            <strong>{dashboard?.won ?? 0}</strong>
            <small>neste ciclo</small>
          </div>
        </article>
      </section>

      {/* Seção Principal do Pipeline */}
      <section className="pipeline" id="pipeline">
        {/* Cabeçalho da Seção */}
        <div className="section-heading">
          <div>
            <span className="eyebrow">Funil Comercial</span>
            <h2>Gestão de Leads & Oportunidades</h2>
          </div>
          <div className="tools">
            <label className="search-field-label">
              <Search size={15} />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Buscar empresa, segmento, cidade, fone…"
              />
              {query && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setQuery("")}
                  title="Limpar busca"
                >
                  <X size={13} />
                </button>
              )}
            </label>

            <button
              type="button"
              className="filter-button"
              onClick={onAnalyzeNext}
              title="Executar análise Gemini no próximo lead pendente"
            >
              <Sparkles size={14} />
              <span>Analisar Próximo</span>
            </button>
          </div>
        </div>

        {/* Chips Inteligentes de 1 Clique */}
        <div className="smart-chips-bar">
          <div className="smart-chips-list">
            <button
              type="button"
              className={`smart-chip ${quickFilter === "all" ? "active" : ""}`}
              onClick={() => {
                setQuickFilter("all");
                setPage(1);
              }}
            >
              <span>Todos</span>
              <span className="chip-count">{quickCounts.all}</span>
            </button>
            <button
              type="button"
              className={`smart-chip ${quickFilter === "no-site" ? "active" : ""}`}
              onClick={() => {
                setQuickFilter("no-site");
                setPage(1);
              }}
            >
              <span>Sem Site</span>
              <span className="chip-count highlight">{quickCounts.noSite}</span>
            </button>
            <button
              type="button"
              className={`smart-chip ${quickFilter === "with-whatsapp" ? "active" : ""}`}
              onClick={() => {
                setQuickFilter("with-whatsapp");
                setPage(1);
              }}
            >
              <span>Com WhatsApp</span>
              <span className="chip-count">{quickCounts.withWhatsapp}</span>
            </button>
            <button
              type="button"
              className={`smart-chip ${quickFilter === "today-followup" ? "active" : ""}`}
              onClick={() => {
                setQuickFilter("today-followup");
                setPage(1);
              }}
            >
              <span>Follow-up Hoje</span>
              <span className={`chip-count ${quickCounts.todayFollowup > 0 ? "warning" : ""}`}>
                {quickCounts.todayFollowup}
              </span>
            </button>
            <button
              type="button"
              className={`smart-chip ${quickFilter === "high-priority" ? "active" : ""}`}
              onClick={() => {
                setQuickFilter("high-priority");
                setPage(1);
              }}
            >
              <span>Alta Prioridade</span>
              <span className="chip-count">{quickCounts.highPriority}</span>
            </button>
          </div>

          <div className="smart-chips-secondary">
            {/* Alternador Tabela / Kanban */}
            <div className="view-mode-pill-toggle">
              <button
                type="button"
                className={`view-mode-btn ${viewMode === "table" ? "active" : ""}`}
                onClick={() => setViewMode("table")}
                title="Visualização Tabela"
              >
                <TableIcon size={13} />
                <span>Tabela</span>
              </button>
              <button
                type="button"
                className={`view-mode-btn ${viewMode === "kanban" ? "active" : ""}`}
                onClick={() => setViewMode("kanban")}
                title="Visualização Pipeline Kanban"
              >
                <LayoutDashboard size={13} />
                <span>Kanban</span>
              </button>
            </div>

            <a
              href={api.exportCsvUrl()}
              download="prospector-leads.csv"
              className="btn-export-csv"
              title="Exportar base de leads em CSV"
            >
              <Download size={14} />
              <span>Exportar CSV</span>
            </a>
          </div>
        </div>

        {/* Barra de Filtros Avançados: Estágio, Segmento, Presença Digital, Cidade */}
        <div className="pipeline-filters-toolbar">
          <div className="filter-group-item">
            <label className="toolbar-filter-label">Estágio:</label>
            <select
              className="toolbar-select"
              value={stageFilter}
              onChange={(e) => {
                setStageFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">Todos os estágios</option>
              {Object.entries(stageLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group-item">
            <label className="toolbar-filter-label">Segmento:</label>
            <select
              className="toolbar-select"
              value={segmentFilter}
              onChange={(e) => {
                setSegmentFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">Todos os nichos ({segments.length})</option>
              {segments.map((seg) => (
                <option key={seg} value={seg}>
                  {seg}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group-item">
            <label className="toolbar-filter-label">Presença Digital:</label>
            <select
              className="toolbar-select"
              value={presenceFilter}
              onChange={(e) => {
                setPresenceFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">Toda presença</option>
              <option value="no-site">Sem site institucional</option>
              <option value="weak-site">Site precisa de melhoria</option>
              <option value="has-site">Com site ativo</option>
            </select>
          </div>

          <div className="filter-group-item">
            <label className="toolbar-filter-label">Cidade:</label>
            <select
              className="toolbar-select"
              value={cityFilter}
              onChange={(e) => {
                setCityFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">Todas as cidades ({cities.length})</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {(stageFilter !== "all" || segmentFilter !== "all" || presenceFilter !== "all" || cityFilter !== "all" || query) && (
            <button
              type="button"
              className="reset-filters-btn"
              onClick={() => {
                setStageFilter("all");
                setSegmentFilter("all");
                setPresenceFilter("all");
                setCityFilter("all");
                setQuery("");
                setPage(1);
              }}
            >
              Limpar Filtros
            </button>
          )}

          <div className="leads-results-count">
            <span>{sortedLeads.length} leads encontrados</span>
          </div>
        </div>

        {/* Renderização Tabela vs Kanban */}
        {viewMode === "kanban" ? (
          <KanbanBoard
            leads={sortedLeads}
            onSelectLead={onSelectLead}
            onUpdateStage={onUpdateStage}
          />
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th className="sortable-th" onClick={() => handleSort("name")}>
                      <div className="th-content">
                        <span>Empresa</span>
                        {renderSortIcon("name")}
                      </div>
                    </th>
                    <th>Contato</th>
                    <th className="sortable-th" onClick={() => handleSort("score")}>
                      <div className="th-content">
                        <span>Sinal / Score</span>
                        {renderSortIcon("score")}
                      </div>
                    </th>
                    <th className="sortable-th" onClick={() => handleSort("stage")}>
                      <div className="th-content">
                        <span>Estágio</span>
                        {renderSortIcon("stage")}
                      </div>
                    </th>
                    <th className="sortable-th" onClick={() => handleSort("city")}>
                      <div className="th-content">
                        <span>Localização</span>
                        {renderSortIcon("city")}
                      </div>
                    </th>
                    <th>Próxima Ação</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {paginatedLeads.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="table-empty-cell">
                        Nenhum lead encontrado com os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    paginatedLeads.map((lead) => (
                      <tr key={lead.id} onClick={() => onSelectLead(lead)} className="lead-table-row">
                        <td>
                          <div className="company">
                            <span>{lead.name.slice(0, 2).toUpperCase()}</span>
                            <div>
                              <strong>
                                {lead.name}
                                {lead.demoUrl && (
                                  <span className="demo-live-badge-inline">
                                    Demo
                                  </span>
                                )}
                              </strong>
                              <small>
                                {lead.segment} {lead.website ? "· com site" : "· sem site"}
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
                          <span className="location-cell-text">
                            {lead.city || "–"}
                          </span>
                        </td>
                        <td>
                          <span className="next-action">
                            {lead.nextAction || "Pesquisar presença digital"}
                          </span>
                        </td>
                        <td className="actions-cell">
                          <button
                            type="button"
                            className="row-open-drawer-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectLead(lead);
                            }}
                            title="Abrir ficha do lead"
                          >
                            <ArrowRight size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginação da Tabela */}
            {totalPages > 1 && (
              <div className="table-pagination-bar">
                <span className="pagination-info">
                  Página <strong>{page}</strong> de <strong>{totalPages}</strong> ({sortedLeads.length} leads)
                </span>
                <div className="pagination-controls">
                  <button
                    type="button"
                    className="pagination-btn"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft size={16} />
                    <span>Anterior</span>
                  </button>
                  <button
                    type="button"
                    className="pagination-btn"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    <span>Próxima</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* Radar de Próxima Melhor Ação & Human-in-the-Loop */}
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
            onClick={onAnalyzeNext}
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
              <button key={lead.id} onClick={() => onSelectLead(lead)}>
                <Score value={lead.score} />
                <div>
                  <strong>{lead.name}</strong>
                  <small>{lead.nextAction || `${lead.segment} · ${lead.city}`}</small>
                </div>
                <ChevronRight />
              </button>
            ))}
        </div>
      </section>
    </div>
  );
}
