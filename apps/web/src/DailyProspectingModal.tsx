import { useState } from "react";
import {
  Building2,
  Check,
  CheckSquare,
  Copy,
  ExternalLink,
  Flame,
  Globe,
  Layers,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Radar,
  RefreshCw,
  Search,
  Sparkles,
  Square,
  Stethoscope,
  Utensils,
  Wrench,
  X
} from "lucide-react";
import { api } from "./api";
import type { Lead, ResolvedPlacePreview } from "./types";

interface DailyProspectingModalProps {
  onClose: () => void;
  onOpenBatchImport: () => void;
  onLeadsImported?: (leads: Lead[]) => void;
}

interface NichePreset {
  id: string;
  name: string;
  icon: typeof Stethoscope;
  keyword: string;
  ticket: "Alto" | "Médio" | "Recorrente";
  demand: "Alta 🔥" | "Constante" | "Muito Alta 🚀";
  why: string;
}

const NICHES: NichePreset[] = [
  {
    id: "dentists",
    name: "Clínicas Odontológicas & Dentistas",
    icon: Stethoscope,
    keyword: "clinica odontologica",
    ticket: "Alto",
    demand: "Muito Alta 🚀",
    why: "Ticket médio elevado (implantes, alinhadores). Alta perda de clientes se não tiverem botão de WhatsApp rápido."
  },
  {
    id: "realestate",
    name: "Imobiliárias & Corretores",
    icon: Building2,
    keyword: "imobiliaria",
    ticket: "Alto",
    demand: "Alta 🔥",
    why: "Mercado imobiliário muito ativo na Baixada Santista. Precisam de catálogo rápido no celular."
  },
  {
    id: "restaurants",
    name: "Restaurantes, Gastronomia & Bares",
    icon: Utensils,
    keyword: "restaurante",
    ticket: "Recorrente",
    demand: "Muito Alta 🚀",
    why: "Muitos têm apenas cardápio em PDF ruim ou Instagram. Um site com cardápio web e WhatsApp converte muito."
  },
  {
    id: "auto",
    name: "Oficinas Mecânicas & Auto Centers",
    icon: Wrench,
    keyword: "oficina mecanica auto center",
    ticket: "Médio",
    demand: "Constante",
    why: "Quem tem problema no carro pesquisa no Google Maps com urgência. Se não acham telefone/site, vão pro concorrente."
  },
  {
    id: "beauty",
    name: "Clínicas de Estética & Harmonização",
    icon: Sparkles,
    keyword: "clinica de estetica harmonizacao facial",
    ticket: "Alto",
    demand: "Muito Alta 🚀",
    why: "Público visual. Demonstrações com protótipos modernos encantam donas de clínicas."
  }
];

const CITIES = [
  { name: "Santos - Gonzaga & Ponta da Praia", cityName: "Santos", query: "santos sp" },
  { name: "Santos - Centro & Vila Mathias", cityName: "Santos", query: "santos sp" },
  { name: "Praia Grande - Boqueirão & Forte", cityName: "Praia Grande", query: "praia grande sp" },
  { name: "São Vicente - Centro & Itararé", cityName: "São Vicente", query: "sao vicente sp" },
  { name: "Guarujá - Pitangueiras & Enseada", cityName: "Guarujá", query: "guaruja sp" },
  { name: "Cubatão - Centro", cityName: "Cubatão", query: "cubatao sp" }
];

export function DailyProspectingModal({
  onClose,
  onOpenBatchImport,
  onLeadsImported
}: DailyProspectingModalProps) {
  const [activeTab, setActiveTab] = useState<"ai" | "manual">("ai");
  const [selectedNiche, setSelectedNiche] = useState<NichePreset>(NICHES[0]);
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const [leadCount, setLeadCount] = useState<number>(5);

  // AI Discover State
  const [scanning, setScanning] = useState(false);
  const [candidates, setCandidates] = useState<ResolvedPlacePreview[]>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<Record<number, boolean>>({});
  const [importing, setImporting] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");

  const mapsSearchUrl = `https://www.google.com/maps/search/${encodeURIComponent(
    `${selectedNiche.keyword} ${selectedCity.query}`
  )}`;

  const handleStartAiDiscovery = async () => {
    setScanning(true);
    setError("");
    setCandidates([]);
    setStatusMessage("Ativando radar de inteligência local...");

    try {
      setTimeout(() => setStatusMessage(`Varrendo estabelecimentos em ${selectedCity.cityName}...`), 500);
      setTimeout(() => setStatusMessage("Verificando telefones e links de WhatsApp..."), 1200);

      const res = await api.discoverLeadsWithAi({
        segment: selectedNiche.name,
        city: selectedCity.cityName,
        count: leadCount
      });

      if (!res.leads || res.leads.length === 0) {
        setError(`Nenhuma empresa nova encontrada para este nicho em ${selectedCity.cityName}. Tente outra região ou nicho.`);
        setScanning(false);
        return;
      }

      setCandidates(res.leads);
      const initialSelection: Record<number, boolean> = {};
      res.leads.forEach((_, idx) => {
        initialSelection[idx] = true;
      });
      setSelectedCandidates(initialSelection);
      setStatusMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar empresas com IA");
    } finally {
      setScanning(false);
    }
  };

  const toggleCandidate = (index: number) => {
    setSelectedCandidates((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const toggleSelectAll = () => {
    const allSelected = candidates.every((_, i) => selectedCandidates[i]);
    const next: Record<number, boolean> = {};
    candidates.forEach((_, i) => {
      next[i] = !allSelected;
    });
    setSelectedCandidates(next);
  };

  const handleCopyMessage = (text?: string, index?: number) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (index !== undefined) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const selectedCount = Object.values(selectedCandidates).filter(Boolean).length;

  const handleImportSelected = async () => {
    const leadsToImport = candidates
      .filter((_, idx) => selectedCandidates[idx])
      .map((item) => ({
        name: item.name,
        segment: item.segment,
        city: item.city,
        state: item.state,
        address: item.address,
        mapsUrl: item.mapsUrl,
        website: item.website,
        phone: item.phone,
        whatsappUrl: item.whatsappUrl,
        hasWhatsapp: item.hasWhatsapp,
        siteStatus: item.siteStatus,
        digitalPresence: item.digitalPresence as "unknown" | "low" | "medium" | "high",
        score: item.score,
        priority: item.priority,
        opportunity: item.opportunity,
        suggestedMessage: item.suggestedMessage
      }));

    if (!leadsToImport.length) {
      setError("Selecione ao menos uma empresa para importar.");
      return;
    }

    setImporting(true);
    setError("");
    try {
      const res = await api.batchAdd(leadsToImport, true);
      if (onLeadsImported) {
        onLeadsImported(res.leads);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao importar empresas");
      setImporting(false);
    }
  };

  return (
    <div className="modal-wrap">
      <button className="drawer-scrim" onClick={onClose} aria-label="Fechar" />
      <div className="modal prospecting-modal" role="dialog" aria-labelledby="prospecting-title">
        {/* Header */}
        <div className="section-title">
          <div>
            <span className="eyebrow">Rotina Diária de Prospecção</span>
            <h2 id="prospecting-title">Radar de Nichos na Baixada Santista</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Fechar">
            <X />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="prospecting-mode-tabs">
          <button
            type="button"
            className={`mode-tab-btn ${activeTab === "ai" ? "active" : ""}`}
            onClick={() => { setActiveTab("ai"); setError(""); }}
          >
            <Sparkles size={16} />
            <span>Puxar Empresas com IA (Autônomo)</span>
            <span className="badge-ai-mode">Recomendado</span>
          </button>
          <button
            type="button"
            className={`mode-tab-btn ${activeTab === "manual" ? "active" : ""}`}
            onClick={() => { setActiveTab("manual"); setError(""); }}
          >
            <Search size={16} />
            <span>Pesquisa Manual no Google Maps</span>
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {/* TAB 1: RADAR IA AUTÔNOMO */}
        {activeTab === "ai" && (
          <div className="prospecting-ai-container">
            {/* Step Selection Controls */}
            {candidates.length === 0 && !scanning && (
              <div className="prospecting-config-block">
                <div className="niche-selection-grid">
                  <label className="field">
                    <span>1. Escolha o Nicho de Mercado</span>
                    <div className="niche-card-list">
                      {NICHES.map((niche) => {
                        const Icon = niche.icon;
                        const isSelected = selectedNiche.id === niche.id;
                        return (
                          <button
                            key={niche.id}
                            type="button"
                            className={`niche-card ${isSelected ? "selected" : ""}`}
                            onClick={() => setSelectedNiche(niche)}
                          >
                            <div className="niche-card-icon">
                              <Icon size={18} />
                            </div>
                            <div className="niche-card-info">
                              <strong>{niche.name}</strong>
                              <small>{niche.why}</small>
                              <div className="niche-card-tags">
                                <span className="tag-ticket">Ticket: {niche.ticket}</span>
                                <span className="tag-demand">Demanda: {niche.demand}</span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </label>

                  <div className="city-and-action-box">
                    <label className="field">
                      <span>2. Selecione a Cidade / Região</span>
                      <div className="city-buttons-grid">
                        {CITIES.map((c) => (
                          <button
                            key={c.name}
                            type="button"
                            className={`city-pill ${selectedCity.name === c.name ? "active" : ""}`}
                            onClick={() => setSelectedCity(c)}
                          >
                            <MapPin size={13} />
                            <span>{c.name}</span>
                          </button>
                        ))}
                      </div>
                    </label>

                    <label className="field">
                      <span>3. Meta de Empresas para Puxar Hoje</span>
                      <div className="count-selector-row">
                        {[3, 5, 8, 10].map((num) => (
                          <button
                            key={num}
                            type="button"
                            className={`count-pill ${leadCount === num ? "active" : ""}`}
                            onClick={() => setLeadCount(num)}
                          >
                            {num} empresas
                          </button>
                        ))}
                      </div>
                    </label>

                    <div className="ai-trigger-card">
                      <div className="ai-trigger-header">
                        <Sparkles size={20} className="text-mint" />
                        <div>
                          <strong>Disparar Varredura de IA</strong>
                          <p>
                            A IA busca empresas em <strong>{selectedCity.cityName}</strong>, detecta WhatsApp verificado, checa presença de site e calcula oportunidades para você.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="primary full btn-lg ai-discover-btn"
                        onClick={handleStartAiDiscovery}
                      >
                        <Sparkles size={18} />
                        <span>Puxar {leadCount} Empresas com IA</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Scanning State */}
            {scanning && (
              <div className="radar-scanning-card">
                <div className="radar-circle-pulse">
                  <div className="radar-sweep" />
                  <Radar size={44} className="radar-icon-center" />
                </div>
                <h3>Escaneando oportunidades em {selectedCity.cityName}…</h3>
                <p className="radar-status-text">{statusMessage}</p>
                <div className="radar-step-indicators">
                  <span className="step-active"><Loader2 size={13} className="spin" /> Estabelecimentos reais</span>
                  <span>·</span>
                  <span>WhatsApp direto</span>
                  <span>·</span>
                  <span>Diagnóstico de site</span>
                </div>
              </div>
            )}

            {/* Results Review List */}
            {candidates.length > 0 && !scanning && (
              <div className="ai-candidates-view">
                <div className="candidates-header-row">
                  <div>
                    <span className="eyebrow">Resultado do Radar de IA</span>
                    <h3>{candidates.length} Empresas Encontradas em {selectedCity.cityName}</h3>
                    <p>Revise os dados, teste o WhatsApp e importe as melhores para o seu pipeline.</p>
                  </div>
                  <div className="candidates-header-actions">
                    <button
                      type="button"
                      className="secondary btn-sm"
                      onClick={() => setCandidates([])}
                    >
                      <RefreshCw size={14} /> Buscar Outro Nicho
                    </button>
                    <button
                      type="button"
                      className="text-button select-all-btn"
                      onClick={toggleSelectAll}
                    >
                      {candidates.every((_, i) => selectedCandidates[i]) ? (
                        <>
                          <CheckSquare size={16} /> Desmarcar todas
                        </>
                      ) : (
                        <>
                          <Square size={16} /> Selecionar todas ({candidates.length})
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="candidates-card-list">
                  {candidates.map((lead, idx) => {
                    const isSelected = Boolean(selectedCandidates[idx]);
                    return (
                      <div
                        key={idx}
                        className={`candidate-card ${isSelected ? "selected" : "deselected"}`}
                        onClick={() => toggleCandidate(idx)}
                      >
                        <div className="candidate-card-top">
                          <button
                            type="button"
                            className="checkbox-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCandidate(idx);
                            }}
                            aria-label={isSelected ? "Desmarcar" : "Selecionar"}
                          >
                            {isSelected ? <CheckSquare size={20} className="icon-checked" /> : <Square size={20} />}
                          </button>
                          <div className="candidate-title-col">
                            <div className="candidate-name-row">
                              <strong>{lead.name}</strong>
                              <span className="candidate-score">Score {lead.score || 85}</span>
                              <span className={`drawer-badge priority priority-${lead.priority || "high"}`}>
                                {lead.priority === "urgent" ? "Urgente" : "Alta"}
                              </span>
                            </div>
                            <span className="candidate-segment-sub">
                              {lead.segment} · <MapPin size={11} className="inline-icon" /> {lead.address || `${lead.city}, ${lead.state}`}
                            </span>
                          </div>
                        </div>

                        <div className="candidate-details-row">
                          {/* WhatsApp Badge */}
                          {lead.hasWhatsapp && lead.whatsappUrl ? (
                            <a
                              href={lead.whatsappUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="candidate-wa-pill"
                              onClick={(e) => e.stopPropagation()}
                              title="Testar link no WhatsApp Web"
                            >
                              <MessageCircle size={14} />
                              <span>{lead.phone || "WhatsApp verificado"}</span>
                              <ExternalLink size={11} />
                            </a>
                          ) : lead.phone ? (
                            <span className="candidate-phone-pill">
                              <Phone size={13} /> {lead.phone}
                            </span>
                          ) : null}

                          {/* Site Badge */}
                          {lead.website ? (
                            <a
                              href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`}
                              target="_blank"
                              rel="noreferrer"
                              className="candidate-site-pill"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Globe size={13} /> Site ativo
                            </a>
                          ) : (
                            <span className="candidate-no-site-pill">
                              🔥 Sem site próprio (Oportunidade)
                            </span>
                          )}
                        </div>

                        {/* Opportunity Description */}
                        {lead.opportunity && (
                          <div className="candidate-opp-box">
                            <strong>Oportunidade para Henrique:</strong> {lead.opportunity}
                          </div>
                        )}

                        {/* Quick Message Hook */}
                        {lead.suggestedMessage && (
                          <div className="candidate-hook-row">
                            <span className="hook-preview">"{lead.suggestedMessage.slice(0, 110)}…"</span>
                            <button
                              type="button"
                              className="btn-copy-hook"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyMessage(lead.suggestedMessage, idx);
                              }}
                              title="Copiar mensagem sugerida"
                            >
                              {copiedIndex === idx ? (
                                <>
                                  <Check size={12} /> Copiado!
                                </>
                              ) : (
                                <>
                                  <Copy size={12} /> Copiar abordagem
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Confirm Import Footer */}
                <footer className="candidates-confirm-bar">
                  <div className="confirm-summary">
                    <strong>{selectedCount}</strong> de <strong>{candidates.length}</strong> empresas selecionadas para o funil
                  </div>
                  <div className="confirm-buttons">
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => setCandidates([])}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="primary btn-lg"
                      disabled={importing || selectedCount === 0}
                      onClick={handleImportSelected}
                    >
                      {importing ? (
                        <>
                          <Loader2 size={16} className="spin" /> Adicionando ao CRM…
                        </>
                      ) : (
                        <>
                          <Check size={16} /> Importar {selectedCount} Empresas para o Pipeline
                        </>
                      )}
                    </button>
                  </div>
                </footer>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MANUAL SEARCH */}
        {activeTab === "manual" && (
          <div className="tab-content manual-prospecting-view">
            <div className="niche-selection-grid">
              <label className="field">
                <span>1. Selecione o Nicho de Alto Potencial</span>
                <div className="niche-card-list">
                  {NICHES.map((niche) => {
                    const Icon = niche.icon;
                    const isSelected = selectedNiche.id === niche.id;
                    return (
                      <button
                        key={niche.id}
                        type="button"
                        className={`niche-card ${isSelected ? "selected" : ""}`}
                        onClick={() => setSelectedNiche(niche)}
                      >
                        <div className="niche-card-icon">
                          <Icon size={18} />
                        </div>
                        <div className="niche-card-info">
                          <strong>{niche.name}</strong>
                          <small>{niche.why}</small>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </label>

              <div className="city-and-action-box">
                <label className="field">
                  <span>2. Selecione a Região / Município</span>
                  <div className="city-buttons-grid">
                    {CITIES.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        className={`city-pill ${selectedCity.name === c.name ? "active" : ""}`}
                        onClick={() => setSelectedCity(c)}
                      >
                        <MapPin size={13} />
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </label>

                <div className="prospecting-launch-card">
                  <span className="launch-label">Busca pronta no Google Maps:</span>
                  <strong className="launch-query">
                    "{selectedNiche.keyword} {selectedCity.query}"
                  </strong>

                  <a
                    href={mapsSearchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="primary launch-btn"
                  >
                    <Search size={16} />
                    <span>Abrir Google Maps em Nova Aba</span>
                    <ExternalLink size={14} />
                  </a>

                  <p className="launch-subtext">
                    Copie os links dos locais no Maps e importe todos juntos com 1 clique abaixo.
                  </p>

                  <button
                    type="button"
                    className="secondary full"
                    onClick={() => {
                      onClose();
                      onOpenBatchImport();
                    }}
                  >
                    <Layers size={16} />
                    <span>Já copiei os links → Importar no CRM</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Goal Indicator Footer */}
        <div className="daily-goal-indicator">
          <Flame size={16} className="text-amber" />
          <span>
            <strong>Meta Diária de Henrique:</strong> Realizar <strong>5 novos contatos qualificados</strong> por dia utilizando as perguntas da Central de Abordagens.
          </span>
        </div>
      </div>
    </div>
  );
}
