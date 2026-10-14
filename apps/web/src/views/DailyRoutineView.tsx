import { useState } from "react";
import {
  Building2,
  Check,
  CheckSquare,
  Compass,
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
  Wrench
} from "lucide-react";
import { api } from "../api";
import type { Lead, ResolvedPlacePreview } from "../types";

interface DailyRoutineViewProps {
  leads?: Lead[];
  onSelectLead?: (lead: Lead) => void;
  onOpenBatchImport?: () => void;
  onImportBatch?: () => void;
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
    demand: "Muito Alta 🚀",
    why: "Imóveis de médio e alto padrão na Baixada Santista. Precisam de páginas rápidas para lançamentos e captação."
  },
  {
    id: "auto",
    name: "Auto Centers & Oficinas Mecânicas",
    icon: Wrench,
    keyword: "oficina mecanica auto center",
    ticket: "Médio",
    demand: "Constante",
    why: "Motoristas procuram por socorro e revisão rápida no Google Maps direto pelo celular."
  },
  {
    id: "beauty",
    name: "Clínicas de Estética & Harmonização",
    icon: Sparkles,
    keyword: "clinica estetica harmonizacao",
    ticket: "Alto",
    demand: "Alta 🔥",
    why: "Público exigente. Um site premium com fotos antes/depois aumenta o fechamento de procedimentos caros."
  },
  {
    id: "restaurants",
    name: "Restaurantes & Gastronomia Premium",
    icon: Utensils,
    keyword: "restaurante bistrot",
    ticket: "Recorrente",
    demand: "Muito Alta 🚀",
    why: "Turismo e moradores locais buscam cardápio, reserva e localização no Maps antes de sair de casa."
  }
];

const CITIES = [
  { name: "Santos", cityName: "Santos, SP" },
  { name: "São Vicente", cityName: "São Vicente, SP" },
  { name: "Praia Grande", cityName: "Praia Grande, SP" },
  { name: "Guarujá", cityName: "Guarujá, SP" },
  { name: "Cubatão", cityName: "Cubatão, SP" }
];

export function DailyRoutineView({ onOpenBatchImport, onLeadsImported }: DailyRoutineViewProps) {
  const [selectedNiche, setSelectedNiche] = useState<NichePreset>(NICHES[0]);
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const [leadCount, setLeadCount] = useState(5);
  const [scanning, setScanning] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [candidates, setCandidates] = useState<ResolvedPlacePreview[]>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<Record<number, boolean>>({});
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [copiedScraperQueries, setCopiedScraperQueries] = useState(false);

  const handleStartAiDiscovery = async () => {
    setScanning(true);
    setStatusMessage(`Conectando à IA e escaneando ${selectedNiche.name} em ${selectedCity.cityName}…`);
    try {
      const res = await api.discoverLeadsWithAi({
        segment: selectedNiche.keyword,
        city: selectedCity.name,
        state: "SP",
        count: leadCount
      });

      const initialSelected: Record<number, boolean> = {};
      res.leads.forEach((_, i) => {
        initialSelected[i] = true;
      });

      setCandidates(res.leads);
      setSelectedCandidates(initialSelected);
    } catch {
      setStatusMessage("Erro ao consultar a IA. Tente novamente.");
    } finally {
      setScanning(false);
    }
  };

  const handleExportScraperQueries = async () => {
    try {
      const res = await api.generateScraperQueries(selectedNiche.keyword, [selectedCity.name]);
      await navigator.clipboard.writeText(res.queriesText);
      setCopiedScraperQueries(true);
      setTimeout(() => setCopiedScraperQueries(false), 2500);
    } catch {
      // Ignora erro
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

  const handleImportSelected = async () => {
    const leadsToImport = candidates.filter((_, i) => selectedCandidates[i]);
    if (!leadsToImport.length) return;

    setImporting(true);
    try {
      const payload: Partial<Lead>[] = leadsToImport.map((c) => ({
        name: c.name,
        segment: c.segment || selectedNiche.name.split("&")[0].trim(),
        city: c.city || selectedCity.name,
        state: c.state || "SP",
        address: c.address,
        mapsUrl: c.mapsUrl,
        website: c.website,
        phone: c.phone,
        whatsappUrl: c.whatsappUrl,
        hasWhatsapp: c.hasWhatsapp,
        siteStatus: c.siteStatus,
        digitalPresence: c.digitalPresence,
        opportunity: c.opportunity,
        suggestedMessage: c.suggestedMessage
      }));

      const res = await api.batchAdd(payload, true);
      setImportSuccess(true);
      onLeadsImported?.(res.leads);
      setTimeout(() => {
        setCandidates([]);
        setImportSuccess(false);
      }, 1500);
    } finally {
      setImporting(false);
    }
  };

  const selectedCount = Object.values(selectedCandidates).filter(Boolean).length;

  return (
    <div className="view-container daily-routine-page-view">
      <div className="view-header routine-view-header">
        <div>
          <span className="eyebrow">Radar Ativo de Estabelecimentos</span>
        </div>
        <div className="view-header-actions">
          <button
            type="button"
            className="secondary"
            onClick={onOpenBatchImport}
            title="Importar arquivos do Scraper ou links manuais"
          >
            <Layers size={14} />
            <span>Importação em Massa</span>
          </button>
        </div>
      </div>

      <div className="daily-routine-grid">
        {/* Painel de Configuração */}
        <div className="routine-config-card double-bezel-inner">
          <div className="routine-config-header">
            <Compass size={20} className="text-mint" />
            <div>
              <h3>1. Escolha o Nicho de Ataque</h3>
              <small>Segmentos selecionados pelo potencial de ROI e ticket médio</small>
            </div>
          </div>

          <div className="niche-selector-grid">
            {NICHES.map((niche) => {
              const Icon = niche.icon;
              const isSelected = selectedNiche.id === niche.id;
              return (
                <button
                  key={niche.id}
                  type="button"
                  className={`niche-card-btn ${isSelected ? "selected" : ""}`}
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

          <div className="routine-city-row">
            <div>
              <span className="eyebrow-tiny">2. Selecione a Cidade</span>
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
            </div>

            <div>
              <span className="eyebrow-tiny">3. Quantidade de Leads</span>
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
            </div>
          </div>

          <div className="routine-actions-bar">
            <button
              type="button"
              className="primary btn-lg"
              onClick={handleStartAiDiscovery}
              disabled={scanning}
            >
              {scanning ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}
              <span>{scanning ? "Varrendo Oportunidades..." : `Puxar ${leadCount} Empresas com IA`}</span>
            </button>
            <button
              type="button"
              className="secondary btn-export-queries"
              onClick={handleExportScraperQueries}
              title="Gera e copia lista de queries por bairro formatada para o Google Maps Scraper"
            >
              {copiedScraperQueries ? <Check size={16} className="text-mint" /> : <Compass size={16} />}
              <span>{copiedScraperQueries ? "Queries Copiadas!" : "Exportar Queries para Scraper"}</span>
            </button>
          </div>
        </div>

        {/* Estado de Escaneamento */}
        {scanning && (
          <div className="radar-scanning-card double-bezel-inner">
            <div className="radar-circle-pulse">
              <div className="radar-sweep" />
              <Radar size={44} className="radar-icon-center" />
            </div>
            <h3>Escaneando oportunidades em {selectedCity.cityName}…</h3>
            <p className="radar-status-text">{statusMessage}</p>
          </div>
        )}

        {/* Resultados Encontrados */}
        {candidates.length > 0 && !scanning && (
          <div className="routine-results-card double-bezel-inner">
            <div className="candidates-header-row">
              <div>
                <span className="eyebrow">Resultado da Varredura</span>
                <h3>{candidates.length} Empresas Encontradas em {selectedCity.cityName}</h3>
                <small>Selecione as empresas que deseja enviar para o funil de vendas</small>
              </div>
              <div className="candidates-header-actions">
                <button
                  type="button"
                  className="btn-secondary-subtle"
                  onClick={toggleSelectAll}
                >
                  {candidates.every((_, i) => selectedCandidates[i]) ? (
                    <>
                      <CheckSquare size={14} /> <span>Desmarcar todas</span>
                    </>
                  ) : (
                    <>
                      <Square size={14} /> <span>Selecionar todas</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="primary"
                  onClick={handleImportSelected}
                  disabled={importing || selectedCount === 0}
                >
                  {importing ? <Loader2 size={14} className="spin" /> : <Check size={14} />}
                  <span>{importSuccess ? "Importado!" : `Importar ${selectedCount} Leads Selecionados`}</span>
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
                      <div className="candidate-name-group">
                        <strong>{lead.name}</strong>
                        <small>{lead.segment} · {lead.city}</small>
                      </div>
                      <div className="candidate-status-badges">
                        {lead.hasWhatsapp ? (
                          <span className="badge-wa-ok">
                            <MessageCircle size={12} /> WhatsApp Verificado
                          </span>
                        ) : (
                          <span className="badge-phone-only">
                            <Phone size={12} /> Fone
                          </span>
                        )}
                        <span className={`badge-site-${lead.siteStatus}`}>
                          {lead.siteStatus === "none" ? "Sem Site Próprio 🔥" : lead.siteStatus === "weak" ? "Apenas Rede Social" : "Possui Site"}
                        </span>
                      </div>
                    </div>
                    {lead.opportunity && (
                      <p className="candidate-opp-text">{lead.opportunity}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
