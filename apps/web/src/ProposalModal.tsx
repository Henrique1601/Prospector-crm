import { useState } from "react";
import { Check, Copy, ExternalLink, FileText, MessageCircle, Printer, X } from "lucide-react";
import type { Lead } from "./types";

interface ProposalModalProps {
  lead: Lead;
  onClose: () => void;
  onLoggedInteraction?: (text: string) => void;
}

export function ProposalModal({ lead, onClose, onLoggedInteraction }: ProposalModalProps) {
  const [copiedText, setCopiedText] = useState(false);

  // Proposal configuration state
  const [projectTitle, setProjectTitle] = useState("Desenvolvimento de Presença Digital & Site Profissional");
  const [scopeItems, setScopeItems] = useState<string[]>([
    "Site institucional responsivo, moderno e ultra-rápido (Mobile e Desktop)",
    "Integração com WhatsApp para captação direta de clientes",
    "Otimização para busca no Google (SEO Local e Google Maps)",
    "Configuração de domínio próprio e certificado de segurança SSL",
    "Hospedagem de alta performance e suporte no lançamento"
  ]);
  const [customScopeItem, setCustomScopeItem] = useState("");
  const [priceCash, setPriceCash] = useState("R$ 1.200,00");
  const [priceInstallments, setPriceInstallments] = useState("3x de R$ 440,00 sem juros");
  const [priceMonthly, setPriceMonthly] = useState("R$ 120,00 / mês (opcional: manutenção e hospedagem)");
  const [deliveryDays, setDeliveryDays] = useState("7 a 10 dias úteis");
  const [validityDays, setValidityDays] = useState("7 dias");

  const todayStr = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });

  const toggleScopeItem = (item: string) => {
    if (scopeItems.includes(item)) {
      setScopeItems(scopeItems.filter((i) => i !== item));
    } else {
      setScopeItems([...scopeItems, item]);
    }
  };

  const addCustomItem = () => {
    if (customScopeItem.trim() && !scopeItems.includes(customScopeItem.trim())) {
      setScopeItems([...scopeItems, customScopeItem.trim()]);
      setCustomScopeItem("");
    }
  };

  const handlePrint = () => {
    onLoggedInteraction?.(`Gerou proposta em PDF/Impressão para ${lead.name} no valor de ${priceCash}.`);
    window.print();
  };

  const generatePlainText = () => {
    return `*PROPOSTA COMERCIAL — PRESENÇA DIGITAL*
*Cliente:* ${lead.name} (${lead.segment} · ${lead.city}/${lead.state})
*Data:* ${todayStr}
*Validade:* ${validityDays}

Olá! Conforme conversamos, segue a proposta para modernização da presença digital da *${lead.name}*.

*🎯 Escopo do Projeto:*
${scopeItems.map((item) => `• ${item}`).join("\n")}

*⏱️ Prazo de Entrega:*
${deliveryDays} após alinhamento do material.

*💰 Opções de Investimento:*
• À vista: ${priceCash} (via PIX na entrega)
• Parcelado: ${priceInstallments}
• Suporte Contínuo: ${priceMonthly}

*👨‍💻 Desenvolvedor:*
Henrique Bezerra dos Santos | Desenvolvedor Full-Stack
• Portfólio: https://bezerraportifolio.netlify.app/
• WhatsApp: (13) 99138-3222
• E-mail: henriquebs1601@gmail.com
• LinkedIn: www.linkedin.com/in/henriquebezerra-dev

Fico à disposição para tirar qualquer dúvida e iniciarmos!`;
  };

  const copyProposalText = async () => {
    const text = generatePlainText();
    await navigator.clipboard.writeText(text);
    setCopiedText(true);
    onLoggedInteraction?.(`Copiou texto da proposta comercial para envio manual.`);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const cleanPhone = (lead.phone || "").replace(/\D/g, "");
  const waDirectUrl = cleanPhone
    ? `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(generatePlainText())}`
    : lead.whatsappUrl;

  return (
    <div className="proposal-modal-wrap" role="dialog" aria-modal="true" aria-label="Proposta Comercial">
      <div className="proposal-modal-container">
        {/* Top bar controls (hidden in print) */}
        <div className="proposal-topbar no-print">
          <div className="proposal-topbar-title">
            <FileText size={20} />
            <div>
              <h3>Gerador de Proposta Comercial</h3>
              <small>Personalize e gere em PDF ou envie diretamente no WhatsApp</small>
            </div>
          </div>
          <div className="proposal-topbar-actions">
            <button type="button" className="btn-secondary" onClick={copyProposalText}>
              {copiedText ? <Check size={16} /> : <Copy size={16} />}
              <span>{copiedText ? "Copiado!" : "Copiar Texto"}</span>
            </button>
            {waDirectUrl && (
              <a
                href={waDirectUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-whatsapp"
                onClick={() => {
                  onLoggedInteraction?.(`Enviou proposta pelo WhatsApp para ${lead.phone}.`);
                }}
              >
                <MessageCircle size={16} />
                <span>Enviar no WhatsApp</span>
              </a>
            )}
            <button type="button" className="btn-primary" onClick={handlePrint}>
              <Printer size={16} />
              <span>Imprimir / Salvar em PDF</span>
            </button>
            <button type="button" className="icon-button" onClick={onClose} aria-label="Fechar">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="proposal-modal-body">
          {/* Settings Sidebar (hidden in print) */}
          <aside className="proposal-settings-sidebar no-print">
            <h4>Configurar Valores e Escopo</h4>

            <div className="field">
              <span>Título da Proposta</span>
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
              />
            </div>

            <div className="proposal-field-grid">
              <div className="field">
                <span>Valor à Vista (PIX)</span>
                <input
                  type="text"
                  value={priceCash}
                  onChange={(e) => setPriceCash(e.target.value)}
                />
              </div>
              <div className="field">
                <span>Parcelamento</span>
                <input
                  type="text"
                  value={priceInstallments}
                  onChange={(e) => setPriceInstallments(e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <span>Mensalidade / Suporte (opcional)</span>
              <input
                type="text"
                value={priceMonthly}
                onChange={(e) => setPriceMonthly(e.target.value)}
              />
            </div>

            <div className="proposal-field-grid">
              <div className="field">
                <span>Prazo de Entrega</span>
                <input
                  type="text"
                  value={deliveryDays}
                  onChange={(e) => setDeliveryDays(e.target.value)}
                />
              </div>
              <div className="field">
                <span>Validade da Proposta</span>
                <input
                  type="text"
                  value={validityDays}
                  onChange={(e) => setValidityDays(e.target.value)}
                />
              </div>
            </div>

            <div className="proposal-scope-config">
              <span>Itens Inclusos no Escopo</span>
              <div className="proposal-checklist">
                {[
                  "Site institucional responsivo, moderno e ultra-rápido (Mobile e Desktop)",
                  "Integração com WhatsApp para captação direta de clientes",
                  "Otimização para busca no Google (SEO Local e Google Maps)",
                  "Configuração de domínio próprio e certificado de segurança SSL",
                  "Hospedagem de alta performance e suporte no lançamento",
                  "Catálogo online de produtos ou serviços interativo",
                  "Integração com Instagram feed ou redes sociais",
                  "Painel de controle fácil para atualização de dados"
                ].map((item) => (
                  <label key={item} className="proposal-checkbox-label">
                    <input
                      type="checkbox"
                      checked={scopeItems.includes(item)}
                      onChange={() => toggleScopeItem(item)}
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>

              <div className="proposal-custom-item-row">
                <input
                  type="text"
                  placeholder="Adicionar item customizado..."
                  value={customScopeItem}
                  onChange={(e) => setCustomScopeItem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomItem();
                    }
                  }}
                />
                <button type="button" className="btn-secondary" onClick={addCustomItem}>
                  Adicionar
                </button>
              </div>
            </div>
          </aside>

          {/* Printable Proposal Document */}
          <div className="proposal-document-sheet-wrap">
            <article className="proposal-document-sheet" id="proposal-sheet">
              {/* Proposal Header */}
              <div className="proposal-doc-header">
                <div className="proposal-doc-author">
                  <h2>Henrique Bezerra dos Santos</h2>
                  <span className="proposal-subtitle">Desenvolvedor Web Full-Stack</span>
                  <div className="proposal-contact-lines">
                    <span>WhatsApp: (13) 99138-3222</span>
                    <span>E-mail: henriquebs1601@gmail.com</span>
                    <span>Portfólio: bezerraportifolio.netlify.app</span>
                    <span>LinkedIn: linkedin.com/in/henriquebezerra-dev</span>
                  </div>
                </div>
                <div className="proposal-doc-meta">
                  <span className="proposal-badge">PROPOSTA COMERCIAL</span>
                  <p><strong>Emissão:</strong> {todayStr}</p>
                  <p><strong>Validade:</strong> {validityDays}</p>
                </div>
              </div>

              <hr className="proposal-doc-divider" />

              {/* Client Info */}
              <div className="proposal-doc-client-card">
                <div>
                  <span className="proposal-eyebrow">Apresentado para:</span>
                  <h3>{lead.name}</h3>
                  <p>{lead.segment} · {lead.city}, {lead.state}</p>
                  {lead.address && <small>{lead.address}</small>}
                </div>
                {lead.phone && (
                  <div className="proposal-doc-client-contact">
                    <span>Telefone: {lead.phone}</span>
                  </div>
                )}
              </div>

              {/* Proposal Title & Objective */}
              <div className="proposal-doc-section">
                <h4>1. Objetivo do Projeto</h4>
                <p>
                  Estruturar uma presença digital sólida, profissional e de alta conversão para <strong>{lead.name}</strong>,
                  permitindo que clientes que buscam por seus serviços no Google e na região de {lead.city} encontrem a empresa
                  imediatamente e entrem em contato direto pelo WhatsApp.
                </p>
              </div>

              {/* Scope of Work */}
              <div className="proposal-doc-section">
                <h4>2. Escopo dos Serviços</h4>
                <ul className="proposal-doc-list">
                  {scopeItems.map((item, idx) => (
                    <li key={idx}>
                      <span className="check-bullet">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Delivery Timeline */}
              <div className="proposal-doc-section">
                <h4>3. Prazo de Execução</h4>
                <p>
                  O prazo estimado para desenvolvimento, homologação e publicação é de <strong>{deliveryDays}</strong>,
                  a contar a partir do envio das informações básicas da empresa.
                </p>
              </div>

              {/* Investment Table */}
              <div className="proposal-doc-section">
                <h4>4. Investimento e Condições Comerciais</h4>
                <div className="proposal-pricing-cards">
                  <div className="proposal-pricing-card highlight">
                    <span className="pricing-title">Pagamento à Vista</span>
                    <strong className="pricing-amount">{priceCash}</strong>
                    <small>via PIX (50% de entrada / 50% na aprovação final)</small>
                  </div>
                  <div className="proposal-pricing-card">
                    <span className="pricing-title">Parcelado</span>
                    <strong className="pricing-amount">{priceInstallments}</strong>
                    <small>sem juros ou cartão de crédito</small>
                  </div>
                  {priceMonthly && (
                    <div className="proposal-pricing-card">
                      <span className="pricing-title">Suporte e Manutenção</span>
                      <strong className="pricing-amount">{priceMonthly}</strong>
                      <small>garantia contínua, alterações e hospedagem rápida</small>
                    </div>
                  )}
                </div>
              </div>

              {/* Sign-off */}
              <div className="proposal-doc-footer">
                <div className="proposal-signature-block">
                  <div className="signature-line" />
                  <strong>Henrique Bezerra dos Santos</strong>
                  <span>Desenvolvedor Full-Stack · Responsável Técnico</span>
                  <small>Santos/SP · (13) 99138-3222</small>
                </div>
                <div className="proposal-signature-block">
                  <div className="signature-line" />
                  <strong>De acordo do Cliente: {lead.name}</strong>
                  <span>Data: ____ / ____ / ________</span>
                  <small>Assinatura / Autorização</small>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}
