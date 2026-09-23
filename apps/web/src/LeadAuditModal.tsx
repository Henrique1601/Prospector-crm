import { useEffect, useState } from "react";
import { Activity, AlertTriangle, Check, CheckCircle2, Copy, Gauge, Globe, Loader2, MessageCircle, ShieldCheck, Smartphone, X } from "lucide-react";
import { api } from "./api";
import type { Lead, LeadAuditResult } from "./types";

interface LeadAuditModalProps {
  lead: Lead;
  onClose: () => void;
  onLoggedInteraction?: (note: string) => void;
}

export function LeadAuditModal({
  lead,
  onClose,
  onLoggedInteraction
}: LeadAuditModalProps) {
  const [loading, setLoading] = useState(true);
  const [audit, setAudit] = useState<LeadAuditResult | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;
    api.auditLead(lead.id)
      .then((res) => {
        if (mounted) {
          setAudit(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [lead.id]);

  const cleanPhone = (lead.phone || "").replace(/\D/g, "");
  const waUrl = audit && cleanPhone
    ? `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(audit.auditMessage)}`
    : lead.whatsappUrl;

  const handleCopy = async () => {
    if (!audit) return;
    await navigator.clipboard.writeText(audit.auditMessage);
    setCopied(true);
    onLoggedInteraction?.(`Copiou diagnóstico de auditoria técnica da ${lead.name}.`);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="modal-wrap">
      <button className="drawer-scrim" onClick={onClose} aria-label="Fechar" />
      <div className="modal audit-modal" role="dialog" aria-labelledby="audit-title">
        <div className="section-title">
          <div>
            <span className="eyebrow">Diagnóstico Técnico & Performance</span>
            <h2 id="audit-title" className="audit-modal-title">
              <Activity size={20} className="text-teal" />
              Raio-X de Presença Digital & SEO
            </h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Fechar">
            <X size={16} />
          </button>
        </div>

        {loading ? (
          <div className="audit-loading-state">
            <Loader2 size={32} className="spin text-teal" />
            <p>Auditorando presença digital, velocidade no celular e SEO local da <strong>{lead.name}</strong>...</p>
          </div>
        ) : !audit ? (
          <div className="audit-empty-state">
            <AlertTriangle size={24} className="text-danger" />
            <p>Não foi possível carregar a auditoria técnica deste lead.</p>
          </div>
        ) : (
          <div className="audit-content">
            {/* Speed Gauge & Overview */}
            <div className="audit-top-grid">
              <div className={`audit-gauge-card ${audit.mobileSpeedScore < 50 ? "bad" : "good"}`}>
                <div className="gauge-icon-row">
                  <Gauge size={22} />
                  <span className="gauge-label">Score de Velocidade Mobile</span>
                </div>
                <div className="gauge-number-row">
                  <strong className="gauge-score">{audit.mobileSpeedScore}</strong>
                  <span className="gauge-total">/100</span>
                </div>
                <small className="gauge-caption">
                  {audit.mobileSpeedScore === 0
                    ? "Sem site próprio detectado"
                    : audit.mobileSpeedScore < 50
                    ? "Velocidade crítica no celular"
                    : "Velocidade aceitável"}
                </small>
              </div>

              <div className="audit-stats-grid">
                <div className="audit-stat-item">
                  <Smartphone size={16} className="text-teal" />
                  <div>
                    <span>Carregamento no Celular</span>
                    <strong>{audit.loadTimeEstimate}</strong>
                  </div>
                </div>

                <div className="audit-stat-item">
                  <MessageCircle size={16} className={audit.hasFloatingWhatsapp ? "text-success" : "text-danger"} />
                  <div>
                    <span>Botão Flutuante de WhatsApp</span>
                    <strong>{audit.hasFloatingWhatsapp ? "Detectado no site" : "Ausente / Não detectado"}</strong>
                  </div>
                </div>

                <div className="audit-stat-item">
                  <Globe size={16} className={audit.hasLocalSeo ? "text-success" : "text-danger"} />
                  <div>
                    <span>SEO Local ({lead.city})</span>
                    <strong>{audit.hasLocalSeo ? "Otimizado para buscas" : "Fraco / Sem ranqueamento"}</strong>
                  </div>
                </div>

                <div className="audit-stat-item">
                  <ShieldCheck size={16} className={audit.hasSsl ? "text-success" : "text-danger"} />
                  <div>
                    <span>Segurança SSL (HTTPS)</span>
                    <strong>{audit.hasSsl ? "Certificado ativo" : "Sem SSL ou Sem site"}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Impact Banner */}
            <div className="audit-impact-alert">
              <AlertTriangle size={18} className="text-danger flex-shrink-0" />
              <div>
                <strong>Impacto Imediato de Conversão</strong>
                <p>{audit.trafficLossEstimate}</p>
              </div>
            </div>

            {/* Critical Issues List */}
            <div className="audit-issues-section">
              <span className="issues-title">Falhas Críticas Encontradas:</span>
              <div className="issues-list">
                {audit.criticalIssues.map((issue, idx) => (
                  <div key={idx} className="issue-item">
                    <span className="issue-bullet">❌</span>
                    <span>{issue}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actionable Pitch */}
            <div className="audit-message-box">
              <div className="audit-message-header">
                <div className="message-header-title">
                  <CheckCircle2 size={15} className="text-teal" />
                  <strong>Abordagem de Raio-X Pronta para Envio</strong>
                </div>
                <span className="badge-pill">Dados Reais Auditados</span>
              </div>

              <textarea
                readOnly
                value={audit.auditMessage}
                rows={5}
                className="roi-textarea"
              />

              <div className="roi-actions-row">
                <button
                  type="button"
                  className={`primary btn-roi-action ${copied ? "copied" : ""}`}
                  onClick={handleCopy}
                >
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                  <span>{copied ? "Diagnóstico Copiado!" : "Copiar Raio-X Técnico"}</span>
                </button>

                {waUrl && (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-objection-wa btn-roi-wa"
                    onClick={() => {
                      onLoggedInteraction?.(`Enviou diagnóstico de auditoria técnica no WhatsApp.`);
                    }}
                  >
                    <MessageCircle size={15} />
                    <span>Enviar Raio-X no WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
