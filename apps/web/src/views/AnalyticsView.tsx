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
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Users
} from "lucide-react";
import { api } from "../api";
import type { ConversionAnalytics, DashboardData, Lead } from "../types";

export interface AnalyticsViewProps {
  leads?: Lead[];
  dashboard?: DashboardData | null;
}

export function AnalyticsView({ leads, dashboard }: AnalyticsViewProps = {}) {
  const [data, setData] = useState<ConversionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    api.conversionAnalytics()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Erro ao carregar analytics"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="view-container analytics-page-view">
      <div className="view-header">
        <div>
          <span className="eyebrow">Inteligência Comercial & Fechamento</span>
          <h1 className="view-title">Analytics de Conversão & Win Rate</h1>
          <p className="view-subtitle">Métricas em tempo real da Baixada Santista: saiba exatamente onde o seu esforço vira contrato.</p>
        </div>
        <button
          type="button"
          className="btn-secondary-subtle"
          onClick={loadData}
          disabled={loading}
          title="Recarregar dados"
        >
          <RefreshCw size={14} className={loading ? "spin" : ""} />
          <span>Atualizar</span>
        </button>
      </div>

      {loading ? (
        <div className="view-loading-box">
          <RefreshCw size={24} className="spin text-mint" />
          <p>Carregando métricas de fechamento...</p>
        </div>
      ) : error ? (
        <div className="error-banner">{error}</div>
      ) : data ? (
        <div className="analytics-view-grid">
          {/* Top KPI Cards Double-Bezel */}
          <div className="analytics-kpi-grid">
            <div className="kpi-card highlight double-bezel-inner">
              <span className="kpi-label">Win Rate Geral (Fechamento)</span>
              <strong className="kpi-value">{data.overallWinRate}%</strong>
              <small className="kpi-sub">{data.wonCount} contratos fechados de {data.totalLeads} leads mapeados</small>
            </div>

            <div className="kpi-card double-bezel-inner">
              <span className="kpi-label">Taxa de Resposta (Contato → Resposta)</span>
              <strong className="kpi-value">{data.contactToReplyRate}%</strong>
              <small className="kpi-sub">{data.repliesCount} respostas de {data.contactedLeads} abordados</small>
            </div>

            <div className="kpi-card double-bezel-inner">
              <span className="kpi-label">Eficácia de Proposta (Proposta → Fechamento)</span>
              <strong className="kpi-value">{data.proposalToWonRate}%</strong>
              <small className="kpi-sub">{data.wonCount} fechados de {data.proposalsCount} propostas enviadas</small>
            </div>
          </div>

          {/* Performance por Segmento */}
          <div className="analytics-section-card double-bezel-inner">
            <div className="analytics-section-header">
              <div className="section-header-icon">
                <Target size={18} className="text-mint" />
              </div>
              <div>
                <h3>Desempenho por Segmento / Nicho</h3>
                <small>Compare quais ramos comerciais geram mais reuniões e contratos</small>
              </div>
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
                      <td><strong className="text-mint">{s.winRate}%</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Performance por Cidade */}
          <div className="analytics-section-card double-bezel-inner">
            <div className="analytics-section-header">
              <div className="section-header-icon">
                <MapPin size={18} className="text-teal" />
              </div>
              <div>
                <h3>Distribuição por Município da Baixada Santista</h3>
                <small>Resultados regionais em Santos, São Vicente, Praia Grande e Guarujá</small>
              </div>
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
                      <td><strong className="text-mint">{c.winRate}%</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
