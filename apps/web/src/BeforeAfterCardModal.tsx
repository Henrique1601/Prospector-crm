import { useState } from "react";
import { Check, Copy, ExternalLink, Flame, Layers, MessageCircle, Printer, Sparkles, X } from "lucide-react";
import type { Lead } from "./types";

interface BeforeAfterCardModalProps {
  lead: Lead;
  onClose: () => void;
  onLoggedInteraction?: (note: string) => void;
}

export function BeforeAfterCardModal({
  lead,
  onClose,
  onLoggedInteraction
}: BeforeAfterCardModalProps) {
  const [copied, setCopied] = useState(false);

  const cleanPhone = (lead.phone || "").replace(/\D/g, "");
  const firstName = lead.name.split(" ")[0];

  const shareText = `📊 ANTES vs DEPOIS: Presença Digital da ${lead.name} em ${lead.city}

❌ COMO ESTÁ HOJE:
• Sem site institucional próprio (ou não otimizado)
• Perda de clientes que pesquisam por ${lead.segment.toLowerCase()} no Google Maps
• Sem botão direto e flutuante de WhatsApp
• Mais de 50% dos visitantes desistem antes do contato

✅ COM O NOVO PROJETO DO HENRIQUE:
• Site moderno que abre em menos de 1.5 segundo no celular
• Botão flutuante de WhatsApp para contato imediato em 1 clique
• Otimizado no Google e Google Maps para ${lead.city} e região
• Domínio próprio profissional (.com.br) e segurança SSL
• Se paga com apenas 1 a 2 novos clientes no mês!

Posso te mostrar a demonstração interativa que montei para a ${lead.name}? Leva menos de 30 segundos!`;

  const waUrl = cleanPhone
    ? `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(shareText)}`
    : lead.whatsappUrl;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    onLoggedInteraction?.(`Copiou card comparativo Antes vs Depois da ${lead.name}.`);
    setTimeout(() => setCopied(false), 2200);
  };

  const handlePrint = () => {
    window.print();
    onLoggedInteraction?.(`Imprimiu ou gerou PDF do card Antes vs Depois da ${lead.name}.`);
  };

  return (
    <div className="modal-wrap">
      <button className="drawer-scrim" onClick={onClose} aria-label="Fechar" />
      <div className="modal before-after-modal" role="dialog" aria-labelledby="ba-title">
        <div className="section-title">
          <div>
            <span className="eyebrow">Comparativo Visual de Valor</span>
            <h2 id="ba-title" className="roi-modal-title">
              <Layers size={20} className="text-teal" />
              Card Antes vs Depois: {lead.name}
            </h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Fechar">
            <X size={16} />
          </button>
        </div>

        <p className="roi-modal-desc">
          Apresente o contraste visual direto entre a situação atual da empresa e o salto de faturamento e credibilidade com o novo site.
        </p>

        {/* Printable / Visual Card Container */}
        <div className="before-after-card-box">
          <div className="ba-header-banner">
            <div>
              <span className="ba-brand-tag">Transformação Digital Estratégica</span>
              <h3 className="ba-company-title">{lead.name} · {lead.city}/{lead.state}</h3>
            </div>
            <span className="ba-segment-badge">{lead.segment}</span>
          </div>

          <div className="ba-columns-grid">
            {/* Coluna 1: Como está hoje */}
            <div className="ba-column before">
              <div className="ba-column-header">
                <span className="ba-status-pill danger">Como está hoje</span>
                <h4>Presença Invisível</h4>
              </div>

              <div className="ba-points-list">
                <div className="ba-point-item bad">
                  <span className="point-icon">❌</span>
                  <div>
                    <strong>Sem site próprio indexado</strong>
                    <small>Dependente de algoritmo de redes sociais que não entrega</small>
                  </div>
                </div>

                <div className="ba-point-item bad">
                  <span className="point-icon">❌</span>
                  <div>
                    <strong>Perda de tráfego no Maps</strong>
                    <small>Clientes buscam no celular e ligam para concorrentes</small>
                  </div>
                </div>

                <div className="ba-point-item bad">
                  <span className="point-icon">❌</span>
                  <div>
                    <strong>Falta de Botão WhatsApp</strong>
                    <small>Cliente precisa salvar número na agenda antes de chamar</small>
                  </div>
                </div>

                <div className="ba-point-item bad">
                  <span className="point-icon">❌</span>
                  <div>
                    <strong>Percepção Amadora</strong>
                    <small>Empresas consolidadas possuem página oficial de alta credibilidade</small>
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna 2: Com Henrique */}
            <div className="ba-column after">
              <div className="ba-column-header">
                <span className="ba-status-pill success">Com o Novo Projeto</span>
                <h4>Máquina de Contatos</h4>
              </div>

              <div className="ba-points-list">
                <div className="ba-point-item good">
                  <span className="point-icon">🚀</span>
                  <div>
                    <strong>Site Ultra-rápido (&lt; 1.5s)</strong>
                    <small>Otimizado para conexões 4G/5G com 0% de travamento</small>
                  </div>
                </div>

                <div className="ba-point-item good">
                  <span className="point-icon">🟢</span>
                  <div>
                    <strong>Botão Flutuante de WhatsApp</strong>
                    <small>Contato em 1 clique direto no bolso do cliente</small>
                  </div>
                </div>

                <div className="ba-point-item good">
                  <span className="point-icon">📍</span>
                  <div>
                    <strong>SEO Local Santos & Região</strong>
                    <small>Aparece quando pesquisarem por {lead.segment.toLowerCase()} perto</small>
                  </div>
                </div>

                <div className="ba-point-item good">
                  <span className="point-icon">🔒</span>
                  <div>
                    <strong>Domínio Próprio & Suporte</strong>
                    <small>Contrato oficial, segurança SSL e suporte direto com Henrique</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="ba-footer-stats">
            <div className="ba-stat-box">
              <span>Retorno do Investimento:</span>
              <strong>Se paga com 1 cliente novo</strong>
            </div>
            <div className="ba-stat-box">
              <span>Prazo de Entrega:</span>
              <strong>Até 7 dias úteis</strong>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="roi-actions-row">
          <button
            type="button"
            className={`primary btn-roi-action ${copied ? "copied" : ""}`}
            onClick={handleCopy}
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            <span>{copied ? "Texto Copiado!" : "Copiar Texto para WhatsApp"}</span>
          </button>

          <button
            type="button"
            className="secondary"
            onClick={handlePrint}
          >
            <Printer size={15} />
            <span>Imprimir / Salvar Card em PDF</span>
          </button>

          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-objection-wa btn-roi-wa"
              onClick={() => {
                onLoggedInteraction?.(`Enviou comparativo Antes vs Depois no WhatsApp.`);
              }}
            >
              <MessageCircle size={15} />
              <span>Enviar no WhatsApp</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
