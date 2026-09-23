import { useMemo, useState } from "react";
import { Calculator, Check, Copy, DollarSign, MessageCircle, Sparkles, TrendingUp, X } from "lucide-react";
import type { Lead } from "./types";

interface RoiCalculatorModalProps {
  lead: Lead;
  onClose: () => void;
  onLoggedInteraction?: (note: string) => void;
}

export function RoiCalculatorModal({
  lead,
  onClose,
  onLoggedInteraction
}: RoiCalculatorModalProps) {
  // Define ticket médio inicial baseado no nicho do lead
  const initialTicket = useMemo(() => {
    const seg = (lead.segment || "").toLowerCase();
    if (seg.includes("odonto") || seg.includes("clínica") || seg.includes("médic")) return 650;
    if (seg.includes("imob") || seg.includes("corret")) return 1500;
    if (seg.includes("advoc") || seg.includes("contab")) return 800;
    if (seg.includes("auto") || seg.includes("mecan")) return 450;
    if (seg.includes("estét") || seg.includes("beleza")) return 200;
    return 350;
  }, [lead.segment]);

  const [ticketMedio, setTicketMedio] = useState<number>(initialTicket);
  const [lostClientsPerMonth, setLostClientsPerMonth] = useState<number>(4);
  const [investment, setInvestment] = useState<number>(1800);
  const [copied, setCopied] = useState(false);

  // Cálculos de ROI e Perda Invisível
  const monthlyLoss = ticketMedio * lostClientsPerMonth;
  const annualLoss = monthlyLoss * 12;
  const daysToBreakEven = Math.max(1, Math.round((investment / (monthlyLoss / 30))));
  const annualRoiPercentage = Math.round(((annualLoss - investment) / investment) * 100);
  const clientsToPayback = Math.max(1, Math.ceil(investment / ticketMedio));

  const cleanPhone = (lead.phone || "").replace(/\D/g, "");
  const firstName = lead.name.split(" ")[0];

  const impactMessage = useMemo(() => {
    return `Fala ${firstName}, tudo bem? Estava calculando o potencial de novos clientes para a ${lead.name} em ${lead.city} e cheguei a um dado muito interessante:

Considerando um ticket médio de R$ ${ticketMedio.toLocaleString("pt-BR")}, se apenas ${lostClientsPerMonth} clientes por mês pesquisarem por ${lead.segment.toLowerCase()} no Google Maps e acabarem caindo no concorrente porque vocês não têm site rápido com botão de WhatsApp, a empresa deixa de faturar:

🔴 R$ ${monthlyLoss.toLocaleString("pt-BR")}/mês de faturamento invisível
🔴 R$ ${annualLoss.toLocaleString("pt-BR")}/ano que vai direto para outros negócios da região

O site profissional que desenvolvo custa R$ ${investment.toLocaleString("pt-BR")} em até 3x e se paga sozinho em apenas ${daysToBreakEven} dias (ou com apenas ${clientsToPayback} cliente${clientsToPayback > 1 ? "s" : ""} novo${clientsToPayback > 1 ? "s" : ""}).

Montei uma demonstração rápida de como ficaria a presença digital de vocês no celular. Leva menos de 30 segundos para ver. Posso te enviar o link?`;
  }, [firstName, lead.name, lead.city, lead.segment, ticketMedio, lostClientsPerMonth, monthlyLoss, annualLoss, investment, daysToBreakEven, clientsToPayback]);

  const waUrl = cleanPhone
    ? `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(impactMessage)}`
    : lead.whatsappUrl;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(impactMessage);
    setCopied(true);
    onLoggedInteraction?.(`Copiou cálculo de ROI e Perda Invisível (Ticket: R$ ${ticketMedio}, Perda: R$ ${monthlyLoss}/mês).`);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="modal-wrap">
      <button className="drawer-scrim" onClick={onClose} aria-label="Fechar" />
      <div className="modal roi-modal" role="dialog" aria-labelledby="roi-title">
        <div className="section-title">
          <div>
            <span className="eyebrow">Simulador Financeiro de Conversão</span>
            <h2 id="roi-title" className="roi-modal-title">
              <Calculator size={20} className="text-teal" />
              Calculadora de Perda Invisível & ROI
            </h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Fechar">
            <X size={16} />
          </button>
        </div>

        <p className="roi-modal-desc">
          Demonstre matematicamente para <strong>{lead.name}</strong> quanto dinheiro a empresa perde todos os meses por não ter um site institucional de alta conversão.
        </p>

        {/* Sliders Grid */}
        <div className="roi-sliders-grid">
          <div className="roi-slider-box">
            <div className="slider-label-row">
              <span>Ticket Médio estimado do cliente</span>
              <strong>R$ {ticketMedio.toLocaleString("pt-BR")}</strong>
            </div>
            <input
              type="range"
              min={50}
              max={5000}
              step={50}
              value={ticketMedio}
              onChange={(e) => setTicketMedio(Number(e.target.value))}
              className="roi-slider"
            />
            <small>Valor médio que um cliente gasta na {lead.name}</small>
          </div>

          <div className="roi-slider-box">
            <div className="slider-label-row">
              <span>Clientes perdidos por mês (sem site)</span>
              <strong>{lostClientsPerMonth} clientes / mês</strong>
            </div>
            <input
              type="range"
              min={1}
              max={25}
              step={1}
              value={lostClientsPerMonth}
              onChange={(e) => setLostClientsPerMonth(Number(e.target.value))}
              className="roi-slider"
            />
            <small>Pessoas que pesquisam no Google/Maps e caem no concorrente</small>
          </div>

          <div className="roi-slider-box full-span">
            <div className="slider-label-row">
              <span>Investimento no novo site (com Henrique)</span>
              <strong>R$ {investment.toLocaleString("pt-BR")}</strong>
            </div>
            <input
              type="range"
              min={1000}
              max={4000}
              step={100}
              value={investment}
              onChange={(e) => setInvestment(Number(e.target.value))}
              className="roi-slider"
            />
            <small>Valor da proposta (parcelável em até 3x sem juros)</small>
          </div>
        </div>

        {/* Big Impact KPIs (Double-Bezel) */}
        <div className="roi-kpi-container">
          <div className="roi-kpi-card danger">
            <span className="roi-kpi-label">Faturamento Perdido Mensal</span>
            <strong className="roi-kpi-val text-danger">R$ {monthlyLoss.toLocaleString("pt-BR")}</strong>
            <small>Perda invisível a cada 30 dias</small>
          </div>

          <div className="roi-kpi-card danger-highlight">
            <span className="roi-kpi-label">Prejuízo Anual Invisível</span>
            <strong className="roi-kpi-val text-danger">R$ {annualLoss.toLocaleString("pt-BR")}</strong>
            <small>Dinheiro entregue para concorrentes</small>
          </div>

          <div className="roi-kpi-card success">
            <span className="roi-kpi-label">Ponto de Equilíbrio (Payback)</span>
            <strong className="roi-kpi-val text-success">{daysToBreakEven} dias</strong>
            <small>Basta {clientsToPayback} cliente{clientsToPayback > 1 ? "s" : ""} novo{clientsToPayback > 1 ? "s" : ""}</small>
          </div>

          <div className="roi-kpi-card success">
            <span className="roi-kpi-label">Retorno em 1 Ano (ROI)</span>
            <strong className="roi-kpi-val text-teal">+{annualRoiPercentage}%</strong>
            <small>Multiplicador de {Math.round(annualLoss / investment)}x</small>
          </div>
        </div>

        {/* Argumento Gerado */}
        <div className="roi-message-box">
          <div className="roi-message-header">
            <div className="message-header-title">
              <Sparkles size={14} className="text-teal" />
              <strong>Argumento de Fechamento Pronto para Enviar</strong>
            </div>
            <span className="badge-pill">Fórmula Matemática Validada</span>
          </div>

          <textarea
            readOnly
            value={impactMessage}
            rows={7}
            className="roi-textarea"
          />

          <div className="roi-actions-row">
            <button
              type="button"
              className={`primary btn-roi-action ${copied ? "copied" : ""}`}
              onClick={handleCopy}
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              <span>{copied ? "Cálculo Copiado!" : "Copiar Argumento de ROI"}</span>
            </button>

            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-objection-wa btn-roi-wa"
                onClick={() => {
                  onLoggedInteraction?.(`Enviou cálculo de ROI no WhatsApp (Perda: R$ ${monthlyLoss}/mês).`);
                }}
              >
                <MessageCircle size={15} />
                <span>Enviar Cálculo no WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
