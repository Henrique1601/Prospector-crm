import { useEffect, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  ChevronRight,
  CircleGauge,
  HelpCircle,
  Layers,
  MapPin,
  MessageSquare,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Users,
  X
} from "lucide-react";
import { api } from "./api";
import type { ConversionAnalytics } from "./types";

interface AnalyticsModalProps {
  onClose: () => void;
}

export function AnalyticsModal({ onClose }: AnalyticsModalProps) {
  const [data, setData] = useState<ConversionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.conversionAnalytics()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Erro ao carregar analytics"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="modal-wrap">
      <button className="drawer-scrim" onClick={onClose} aria-label="Fechar" />
      <div className="modal analytics-modal" role="dialog" aria-labelledby="analytics-modal-title">
        <div className="section-title">
          <div>
            <span className="eyebrow">Inteligência Comercial</span>
            <h2 id="analytics-modal-title">Analytics de Conversão & Win Rate</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Fechar">
            <X />
          </button>
        </div>

        {loading ? (
          <div className="analytics-loading">Carregando métricas de fechamento...</div>
        ) : error ? (
          <div className="error-banner">{error}</div>
        ) : data ? (
          <div className="analytics-body">
            {/* Top KPI Cards */}
            <div className="analytics-kpi-grid">
              <div className="kpi-card highlight">
                <span className="kpi-label">Win Rate Geral (Fechamento)</span>
                <strong className="kpi-value">{data.overallWinRate}%</strong>
                <small className="kpi-sub">{data.wonCount} contratos fechados de {data.totalLeads} leads</small>
              </div>

              <div className="kpi-card">
                <span className="kpi-label">Taxa de Resposta (Contato → Resposta)</span>
                <strong className="kpi-value">{data.contactToReplyRate}%</strong>
                <small className="kpi-sub">{data.repliesCount} respostas de {data.contactedLeads} abordados</small>
              </div>

              <div className="kpi-card">
                <span className="kpi-label">Eficácia de Proposta (Proposta → Fechamento)</span>
                <strong className="kpi-value">{data.proposalToWonRate}%</strong>
                <small className="kpi-sub">{data.wonCount} fechados de {data.proposalsCount} propostas</small>
              </div>
            </div>

            {/* Performance by Segment */}
            <div className="analytics-section">
              <div className="analytics-section-header">
                <Target size={16} />
                <h3>Desempenho por Segmento / Nicho</h3>
              </div>
              <div className="analytics-table-wrap">
                <table className="analytics-table">
                  <thead>
                    <tr>
                      <th>Segmento</th>
                      <th>Total</th>
                      <th>Contatados</th>
                      <th>Respostas</th>
                      <th>Fechados</th>
                      <th>Taxa de Resposta</th>
                      <th>Win Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.segments.map((s) => (
                      <tr key={s.segment}>
                        <td><strong>{s.segment}</strong></td>
                        <td>{s.total}</td>
                        <td>{s.contacted}</td>
                        <td>{s.replies}</td>
                        <td><span className="badge-won">{s.won}</span></td>
                        <td>{s.responseRate}%</td>
                        <td><strong>{s.winRate}%</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Performance by City */}
            <div className="analytics-section">
              <div className="analytics-section-header">
                <MapPin size={16} />
                <h3>Distribuição por Município da Baixada Santista</h3>
              </div>
              <div className="analytics-table-wrap">
                <table className="analytics-table">
                  <thead>
                    <tr>
                      <th>Cidade</th>
                      <th>Total</th>
                      <th>Contatados</th>
                      <th>Respostas</th>
                      <th>Fechados</th>
                      <th>Taxa Resposta</th>
                      <th>Win Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.cities.map((c) => (
                      <tr key={c.city}>
                        <td><strong>{c.city}</strong></td>
                        <td>{c.total}</td>
                        <td>{c.contacted}</td>
                        <td>{c.replies}</td>
                        <td><span className="badge-won">{c.won}</span></td>
                        <td>{c.responseRate}%</td>
                        <td><strong>{c.winRate}%</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
