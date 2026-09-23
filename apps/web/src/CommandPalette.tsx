import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  BookOpen,
  CalendarClock,
  Compass,
  Download,
  FileText,
  HelpCircle,
  LayoutDashboard,
  MapPin,
  MessageCircle,
  Plus,
  Search,
  Sparkles,
  Target,
  X
} from "lucide-react";
import type { Lead } from "./types";

interface ActionItem {
  id: string;
  title: string;
  category: "action";
  icon: typeof Plus;
  hint?: string;
  run: () => void;
}

interface LeadItem {
  id: string;
  title: string;
  category: "lead";
  lead: Lead;
}

type PaletteItem = ActionItem | LeadItem;

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onOpenCreateModal: () => void;
  onOpenBatchModal: () => void;
  onOpenPlaybook: () => void;
  onOpenObjections?: () => void;
  onOpenDaily: () => void;
  onOpenAnalytics: () => void;
  onToggleViewMode: () => void;
  viewMode: "table" | "kanban";
}

export function CommandPalette({
  isOpen,
  onClose,
  leads,
  onSelectLead,
  onOpenCreateModal,
  onOpenBatchModal,
  onOpenPlaybook,
  onOpenObjections,
  onOpenDaily,
  onOpenAnalytics,
  onToggleViewMode,
  viewMode
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Build items
  const baseActions: ActionItem[] = [
    {
      id: "create-lead",
      title: "Adicionar Novo Lead",
      category: "action",
      icon: Plus,
      hint: "Adicionar manualmente ou via link Maps",
      run: () => {
        onClose();
        onOpenCreateModal();
      }
    },
    {
      id: "batch-import",
      title: "Importar Lote (Maps, CSV, Notion)",
      category: "action",
      icon: Download,
      hint: "Capturar dezenas de leads",
      run: () => {
        onClose();
        onOpenBatchModal();
      }
    },
    {
      id: "playbook",
      title: "Central de Abordagens Comerciais (Playbook)",
      category: "action",
      icon: BookOpen,
      hint: "Modelos AIDA, PAS, Direta",
      run: () => {
        onClose();
        onOpenPlaybook();
      }
    },
    {
      id: "daily-radar",
      title: "Radar & Rotina Diária de Prospecção",
      category: "action",
      icon: Target,
      hint: "Bater meta diária de contatos",
      run: () => {
        onClose();
        onOpenDaily();
      }
    },
    {
      id: "analytics",
      title: "Métricas & Relatório de Conversão",
      category: "action",
      icon: BarChart3,
      hint: "Valores no funil e taxas",
      run: () => {
        onClose();
        onOpenAnalytics();
      }
    },
    {
      id: "toggle-view",
      title: viewMode === "table" ? "Mudar para Visualização Pipeline Kanban" : "Mudar para Visualização Tabela",
      category: "action",
      icon: LayoutDashboard,
      hint: viewMode === "table" ? "Ver colunas estilo Trello" : "Ver planilha de alta densidade",
      run: () => {
        onClose();
        onToggleViewMode();
      }
    }
  ];

  const normalizeText = (str: string) =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const normQuery = normalizeText(query);
  const queryDigits = query.replace(/\D/g, "");

  const filteredActions = baseActions.filter((a) => {
    if (!normQuery) return true;
    return (
      normalizeText(a.title).includes(normQuery) ||
      (a.hint && normalizeText(a.hint).includes(normQuery))
    );
  });

  const filteredLeads: LeadItem[] = (query.trim()
    ? leads.filter((l) => {
        const leadText = normalizeText(`${l.name} ${l.segment} ${l.city} ${l.address || ""}`);
        if (leadText.includes(normQuery)) return true;
        const phoneDigits = (l.phone || "").replace(/\D/g, "");
        if (queryDigits && queryDigits.length >= 3 && phoneDigits.includes(queryDigits)) return true;
        return false;
      })
    : leads.slice(0, 8)
  ).map((l) => ({
    id: `lead-${l.id}`,
    title: l.name,
    category: "lead",
    lead: l
  }));

  const allItems: PaletteItem[] = [...filteredActions, ...filteredLeads];

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (allItems.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (allItems.length || 1)) % (allItems.length || 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const current = allItems[selectedIndex];
      if (current) {
        if (current.category === "action") {
          current.run();
        } else {
          onClose();
          onSelectLead(current.lead);
        }
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="palette-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="palette-box" onClick={(e) => e.stopPropagation()}>
        <div className="palette-input-wrap">
          <Search size={18} className="palette-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="palette-input"
            placeholder="Digite para buscar clientes ou comandos (ex: novo, proposta, pizzaria)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          <button type="button" className="palette-close-btn" onClick={onClose} aria-label="Fechar">
            <kbd>ESC</kbd>
          </button>
        </div>

        <div className="palette-results">
          {filteredActions.length > 0 && (
            <div className="palette-group">
              <span className="palette-group-title">Ações e Atalhos</span>
              {filteredActions.map((action, idx) => {
                const isSelected = selectedIndex === idx;
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    type="button"
                    className={`palette-item ${isSelected ? "selected" : ""}`}
                    onClick={() => action.run()}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <div className="palette-item-icon">
                      <Icon size={16} />
                    </div>
                    <div className="palette-item-text">
                      <strong>{action.title}</strong>
                      {action.hint && <small>{action.hint}</small>}
                    </div>
                    {isSelected && <span className="palette-enter-hint">↵ Executar</span>}
                  </button>
                );
              })}
            </div>
          )}

          {filteredLeads.length > 0 && (
            <div className="palette-group">
              <span className="palette-group-title">
                {query.trim() ? `Leads Encontrados (${filteredLeads.length})` : "Leads Recentes"}
              </span>
              {filteredLeads.map((item, idx) => {
                const actualIndex = filteredActions.length + idx;
                const isSelected = selectedIndex === actualIndex;
                const lead = item.lead;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`palette-item ${isSelected ? "selected" : ""}`}
                    onClick={() => {
                      onClose();
                      onSelectLead(lead);
                    }}
                    onMouseEnter={() => setSelectedIndex(actualIndex)}
                  >
                    <div className="palette-item-icon lead-initials">
                      {lead.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="palette-item-text">
                      <strong>{lead.name}</strong>
                      <small>
                        {lead.segment} · {lead.city}/{lead.state} · Score {lead.score}
                      </small>
                    </div>
                    <div className="palette-lead-meta">
                      {lead.hasWhatsapp && <span className="lead-wa-pill">WhatsApp</span>}
                      {isSelected && <span className="palette-enter-hint">↵ Abrir Ficha</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {allItems.length === 0 && (
            <div className="palette-empty">
              <p>Nenhum resultado encontrado para "{query}".</p>
              <small>Tente buscar por outro termo ou nome de empresa.</small>
            </div>
          )}
        </div>

        <div className="palette-footer">
          <span><kbd>↑</kbd> <kbd>↓</kbd> para navegar</span>
          <span><kbd>↵</kbd> para selecionar</span>
          <span><kbd>ESC</kbd> para fechar</span>
        </div>
      </div>
    </div>
  );
}
