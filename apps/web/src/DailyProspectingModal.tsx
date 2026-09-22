import { useState } from "react";
import {
  Building2,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Flame,
  Layers,
  MapPin,
  Search,
  Sparkles,
  Stethoscope,
  Utensils,
  Wrench,
  X
} from "lucide-react";

interface DailyProspectingModalProps {
  onClose: () => void;
  onOpenBatchImport: () => void;
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
  { name: "Santos - Gonzaga & Ponta da Praia", query: "santos sp" },
  { name: "Santos - Centro & Embaré", query: "santos sp" },
  { name: "Praia Grande - Canto do Forte & Boqueirão", query: "praia grande sp" },
  { name: "São Vicente - Centro & Itararé", query: "sao vicente sp" },
  { name: "Guarujá - Pitangueiras & Enseada", query: "guaruja sp" },
  { name: "Cubatão & Bertioga", query: "baixada santista sp" }
];

export function DailyProspectingModal({ onClose, onOpenBatchImport }: DailyProspectingModalProps) {
  const [selectedNiche, setSelectedNiche] = useState<NichePreset>(NICHES[0]);
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);

  const mapsSearchUrl = `https://www.google.com/maps/search/${encodeURIComponent(
    `${selectedNiche.keyword} ${selectedCity.query}`
  )}`;

  return (
    <div className="modal-wrap">
      <button className="drawer-scrim" onClick={onClose} aria-label="Fechar" />
      <div className="modal prospecting-modal" role="dialog" aria-labelledby="prospecting-title">
        <div className="section-title">
          <div>
            <span className="eyebrow">Rotina Diária de Prospecção</span>
            <h2 id="prospecting-title">Radar de Nichos na Baixada Santista</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Fechar">
            <X />
          </button>
        </div>

        {/* Rotina Matinal — Os 3 Passos */}
        <div className="prospecting-steps-banner">
          <div className="step-badge">
            <span>1</span>
            <strong>Escolha o Nicho</strong>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-badge">
            <span>2</span>
            <strong>Abra no Maps</strong>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-badge">
            <span>3</span>
            <strong>Cole os Links no CRM</strong>
          </div>
        </div>

        {/* Niche Selection Grid */}
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

          {/* City Selection */}
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

            {/* Launch Search Button */}
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
                Copie o link dos locais sem site ou com nota alta e importe com 1 clique abaixo.
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

        {/* Goal Indicator */}
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
