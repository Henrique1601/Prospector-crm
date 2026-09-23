import { ArrowLeft, ArrowRight, ExternalLink, Flame, MessageCircle, Phone } from "lucide-react";
import type { Lead, Stage } from "./types";
import { triggerConfetti } from "./Confetti";

interface KanbanBoardProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onUpdateStage: (leadId: string, newStage: Stage) => void;
}

const kanbanStages: Array<{ id: Stage; label: string; color: string }> = [
  { id: "new", label: "Novo", color: "#0284c7" },
  { id: "analyzed", label: "Analisado", color: "#0d9488" },
  { id: "contacted", label: "Contatado", color: "#d97706" },
  { id: "replied", label: "Respondeu", color: "#e11d48" },
  { id: "meeting", label: "Reunião", color: "#7c3aed" },
  { id: "proposal", label: "Proposta", color: "#2563eb" },
  { id: "won", label: "Fechado", color: "#16a34a" }
];

export function KanbanBoard({ leads, onSelectLead, onUpdateStage }: KanbanBoardProps) {
  const stageOrder: Stage[] = kanbanStages.map((s) => s.id);

  const moveStage = (e: React.MouseEvent, lead: Lead, direction: "prev" | "next") => {
    e.stopPropagation();
    const currentIndex = stageOrder.indexOf(lead.stage);
    if (currentIndex === -1) return;

    const newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < stageOrder.length) {
      const nextStage = stageOrder[newIndex];
      if (nextStage === "won") {
        triggerConfetti();
      }
      onUpdateStage(lead.id, nextStage);
    }
  };

  return (
    <div className="kanban-wrapper">
      <div className="kanban-board">
        {kanbanStages.map((stage) => {
          const stageLeads = leads.filter((l) => l.stage === stage.id);
          return (
            <div key={stage.id} className="kanban-column">
              <div className="kanban-column-header">
                <div className="kanban-column-title">
                  <span className="kanban-stage-dot" style={{ backgroundColor: stage.color }} />
                  <strong>{stage.label}</strong>
                  <span className="kanban-count-pill">{stageLeads.length}</span>
                </div>
              </div>

              <div className="kanban-cards-list">
                {stageLeads.map((lead) => {
                  const currentIndex = stageOrder.indexOf(lead.stage);
                  const canMovePrev = currentIndex > 0;
                  const canMoveNext = currentIndex < stageOrder.length - 1;
                  const isUrgent = lead.priority === "urgent" || lead.priority === "high";

                  return (
                    <article
                      key={lead.id}
                      className={`kanban-card ${isUrgent ? "urgent-card" : ""}`}
                      onClick={() => onSelectLead(lead)}
                    >
                      <div className="kanban-card-top">
                        <div className="kanban-company-info">
                          <span className="kanban-initials">
                            {lead.name.slice(0, 2).toUpperCase()}
                          </span>
                          <div>
                            <strong>{lead.name}</strong>
                            <small>{lead.segment} · {lead.city}</small>
                          </div>
                        </div>
                        <div className="kanban-score-badge">
                          <span>{lead.score}</span>
                        </div>
                      </div>

                      <div className="kanban-card-meta">
                        {lead.hasWhatsapp && (
                          <span className="kanban-pill wa">
                            <MessageCircle size={10} />
                            <span>WhatsApp</span>
                          </span>
                        )}
                        {!lead.website && (
                          <span className="kanban-pill nosite">
                            <span>Sem Site</span>
                          </span>
                        )}
                        {lead.demoUrl && (
                          <span className="kanban-pill demo">
                            <span>Demo Lovable</span>
                          </span>
                        )}
                        {isUrgent && (
                          <span className="kanban-pill hot">
                            <Flame size={10} />
                            <span>Prioritário</span>
                          </span>
                        )}
                      </div>

                      {lead.nextAction && (
                        <p className="kanban-next-action">
                          {lead.nextAction}
                        </p>
                      )}

                      <div className="kanban-card-footer" onClick={(e) => e.stopPropagation()}>
                        <div className="kanban-shift-btns">
                          {canMovePrev && (
                            <button
                              type="button"
                              className="kanban-shift-btn"
                              onClick={(e) => moveStage(e, lead, "prev")}
                              title="Voltar etapa"
                              aria-label="Voltar etapa"
                            >
                              <ArrowLeft size={12} />
                            </button>
                          )}
                          {canMoveNext && (
                            <button
                              type="button"
                              className="kanban-shift-btn advance"
                              onClick={(e) => moveStage(e, lead, "next")}
                              title="Avançar etapa"
                              aria-label="Avançar etapa"
                            >
                              <span>Avançar</span>
                              <ArrowRight size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}

                {stageLeads.length === 0 && (
                  <div className="kanban-empty-col">
                    <small>Nenhum lead nesta etapa</small>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
