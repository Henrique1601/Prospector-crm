import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, ExternalLink, Globe, Loader2, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { api } from "./api";
import type { PublicProposalData } from "./types";

interface PublicProposalViewProps {
  leadId: string;
  onBackToCrm?: () => void;
}

export function PublicProposalView({ leadId, onBackToCrm }: PublicProposalViewProps) {
  const [loading, setLoading] = useState(true);
  const [proposal, setProposal] = useState<PublicProposalData | null>(null);

  useEffect(() => {
    let mounted = true;
    api.getPublicProposal(leadId)
      .then((res) => {
        if (mounted) {
          setProposal(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [leadId]);

  if (loading) {
    return (
      <div className="public-proposal-loading">
        <Loader2 size={36} className="spin text-teal" />
        <p>Carregando proposta comercial personalizada...</p>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="public-proposal-error">
        <h2>Proposta não encontrada</h2>
        <p>O link da proposta pode estar expirado ou o identificador é inválido.</p>
        {onBackToCrm && (
          <button type="button" className="secondary" onClick={onBackToCrm}>
            Voltar ao CRM
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="public-proposal-page">
      {onBackToCrm && (
        <div className="proposal-crm-nav no-print">
          <button type="button" className="btn-back-crm" onClick={onBackToCrm}>
            <ArrowLeft size={14} />
            <span>Voltar ao painel do CRM</span>
          </button>
          <span className="nav-preview-badge">Visualização do Cliente</span>
        </div>
      )}

      <main className="public-proposal-container">
        {/* Header Oficial do Desenvolvedor */}
        <header className="public-proposal-header">
          <div className="dev-brand-row">
            <div>
              <span className="dev-eyebrow">Desenvolvimento Web Profissional</span>
              <h1 className="dev-name">{proposal.developer.name}</h1>
              <p className="dev-role">{proposal.developer.role} · Baixada Santista</p>
            </div>
            <a
              href={proposal.developer.portfolio}
              target="_blank"
              rel="noreferrer"
              className="dev-portfolio-link"
            >
              <span>Ver Portfólio Oficial</span>
              <ExternalLink size={12} />
            </a>
          </div>

          <div className="proposal-meta-strip">
            <span>Proposta Comercial: <strong>{proposal.proposalId}</strong></span>
            <span>Data: <strong>{new Date(proposal.createdAt).toLocaleDateString("pt-BR")}</strong></span>
            <span>Validade: <strong>10 dias corridos</strong></span>
          </div>
        </header>

        {/* Cliente Apresentado */}
        <section className="public-client-card">
          <span className="eyebrow">Projeto Exclusivo Preparado Para</span>
          <h2 className="client-headline">{proposal.client.name}</h2>
          <p className="client-subline">
            {proposal.client.segment} · {proposal.client.city}/{proposal.client.state}
          </p>
          {proposal.client.opportunity && (
            <div className="client-opportunity-quote">
              <Sparkles size={16} className="text-teal" />
              <p>{proposal.client.opportunity}</p>
            </div>
          )}
        </section>

        {/* Escopo Técnico dos Entregáveis */}
        <section className="public-scope-card">
          <div className="scope-header">
            <h3>Escopo Técnico da Solução Digital</h3>
            <p>Tudo o que sua empresa precisa para transformar visitantes em contatos reais no WhatsApp.</p>
          </div>

          <div className="scope-items-grid">
            {proposal.scope.map((item, idx) => (
              <div key={idx} className="scope-item">
                <CheckCircle2 size={16} className="text-teal flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Investimento e Condições */}
        <section className="public-pricing-card">
          <div className="pricing-top">
            <span className="eyebrow">Investimento Transparente</span>
            <h3>Condições de Pagamento</h3>
          </div>

          <div className="pricing-highlight-box">
            <div className="price-display">
              <span className="price-currency">R$</span>
              <strong className="price-value">{proposal.pricing.oneTimePrice.toLocaleString("pt-BR")}</strong>
            </div>
            <p className="installments-tag">{proposal.pricing.installments}</p>
            <div className="delivery-badge">
              <span>Prazo de homologação: <strong>{proposal.pricing.deliveryTimeDays} dias úteis</strong> após aprovação</span>
            </div>
          </div>
        </section>

        {/* Garantias & Suporte */}
        <section className="public-guarantee-card">
          <div className="guarantee-item">
            <ShieldCheck size={20} className="text-teal" />
            <div>
              <strong>Contrato & Nota Fiscal</strong>
              <small>Segurança jurídica completa para sua empresa com suporte direto com o desenvolvedor.</small>
            </div>
          </div>
          <div className="guarantee-item">
            <Globe size={20} className="text-teal" />
            <div>
              <strong>100% de Autonomia</strong>
              <small>O site, domínio e acessos pertencem integralmente à sua empresa.</small>
            </div>
          </div>
        </section>

        {/* Floating / Direct CTA */}
        <div className="public-proposal-cta-box">
          <h3>Pronto para acelerar os contatos da sua empresa?</h3>
          <p>Clique no botão abaixo para conversar diretamente com Henrique no WhatsApp e iniciar o projeto.</p>
          <a
            href={proposal.approvalWhatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-approve-wa"
          >
            <MessageCircle size={18} />
            <span>Aprovar Proposta no WhatsApp</span>
          </a>
        </div>
      </main>
    </div>
  );
}
