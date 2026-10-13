import { useState } from "react";
import {
  BookOpen,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  Flame,
  HelpCircle,
  Instagram,
  Layers,
  MessageCircle,
  PhoneCall,
  Search,
  ShieldAlert,
  Sparkles,
  Target,
  UserCheck
} from "lucide-react";
import type { Lead } from "../types";

export interface PlaybookViewProps {
  leads?: Lead[];
  selectedLead?: Lead | null;
  onSelectLead?: (lead: Lead | null) => void;
  onLoggedInteraction?: (leadId: string, note: string) => void;
}

type TabType = "scripts" | "objections";
type ApproachCategory = "invisible_loss" | "demo_lovable" | "audit_diagnostic" | "portfolio_consultative" | "instagram_direct" | "cold_call";

interface Template {
  id: string;
  category: ApproachCategory;
  title: string;
  badge: string;
  highlight?: boolean;
  channel: "whatsapp" | "instagram" | "call" | "any";
  context: string;
  buildText: (company: string, segment: string, city: string, portfolio: string, phone: string, demoUrl?: string) => string;
}

const HENRIQUE_PORTFOLIO = "https://bezerraportifolio.netlify.app/";
const HENRIQUE_PHONE = "(13) 99138-3222";

const TEMPLATES: Template[] = [
  {
    id: "user-q1-invisible-loss",
    category: "invisible_loss",
    title: "1. Pergunta da Concorrência & Perda Invisível",
    badge: "Alta Conversão ⭐",
    highlight: true,
    channel: "whatsapp",
    context: "Ideal para iniciar contato no WhatsApp gerando curiosidade imediata e reflexão comercial.",
    buildText: (company, segment, city, portfolio) =>
      `Olá, tudo bem? Posso te fazer uma pergunta rápida?\n\nVocê sabe quantos clientes podem estar procurando exatamente pelo que a ${company} oferece em ${city}… e acabam encontrando outra empresa primeiro?\n\nPercebi que o negócio de vocês tem uma reputação ótima, mas quem pesquisa pelo celular não encontra um site rápido com botão de WhatsApp direto.\n\nEu sou desenvolvedor web aqui da região e montei uma proposta visual rápida para vocês. Leva menos de 1 minuto para ver: ${portfolio}\n\nFaz sentido dar uma olhada sem compromisso?`
  },
  {
    id: "user-q2-demo-lovable",
    category: "demo_lovable",
    title: "2. Demonstração Pronta de Alto Impacto",
    badge: "Gera Desejo 🚀",
    highlight: true,
    channel: "whatsapp",
    context: "Envio de link interativo já personalizado com a identidade da empresa para o decisor testar.",
    buildText: (company, segment, city, portfolio, phone, demoUrl) =>
      `Olá! Tudo bem?\n\nEstava pesquisando referências de ${segment.toLowerCase()} aqui em ${city} e achei o trabalho da ${company} muito diferenciado!\n\nPor curiosidade profissional, rascunhei uma versão moderna de site pensada para celular, focada em transformar visitantes do Google em conversas diretas no seu WhatsApp.\n\nFicou bem leve e profissional. Dê uma olhada na demonstração: ${demoUrl || portfolio}\n\nSe gostar da proposta, posso te mostrar como colocar no ar essa semana!`
  },
  {
    id: "user-q3-audit-diagnostic",
    category: "audit_diagnostic",
    title: "3. Pergunta Consultiva (Site Atual Lento ou Sem WhatsApp)",
    badge: "Raio-X Técnico 🔍",
    highlight: true,
    channel: "whatsapp",
    context: "Para empresas que já têm um site antigo, lento ou sem botão flutuante de WhatsApp.",
    buildText: (company, segment, city) =>
      `Olá, tudo bem?\n\nEstava navegando no Google procurando sobre ${segment.toLowerCase()} em ${city} e cheguei no site da ${company}.\n\nNotei um detalhe técnico importante: no celular ele demora mais de 3 segundos para abrir e o cliente não encontra um botão de WhatsApp direto para pedir orçamento.\n\nHoje mais de 70% das pessoas desistem se demorar para carregar. Eu crio sites ultra-rápidos que dobram o contato direto.\n\nPosso te mandar uma análise rápida de 1 minuto em áudio ou print?`
  },
  {
    id: "cold-call-script",
    category: "cold_call",
    title: "4. Roteiro de Ligação Rápida (1 Minuto)",
    badge: "Contato Telefônico 📞",
    channel: "call",
    context: "Roteiro objetivo para recepcionista ou decisor para conseguir permissão no WhatsApp.",
    buildText: (company, segment, city) =>
      `"Olá, bom dia! Por favor, quem cuida da parte de novos clientes e presença digital da ${company}?\n\nAqui é o Henrique, desenvolvedor web aqui da Baixada. Estou ligando rápido porque notei uma oportunidade excelente no Google Maps de vocês em ${city}.\n\nEu preparei um modelo de site focado em atrair mais orçamentos para vocês no celular e gostaria de enviar o link de demonstração pelo WhatsApp. Qual é o melhor número para eu encaminhar?"`
  }
];

interface ObjectionItem {
  id: string;
  title: string;
  tag: string;
  response: string;
}

const OBJECTIONS: ObjectionItem[] = [
  {
    id: "caro",
    title: "“Achei caro / Tá fora do orçamento agora”",
    tag: "ROI e Parcelamento",
    response: "Entendo perfeitamente! Na verdade, o site não é um custo, mas um vendedor ativo 24h por dia. Se um único cliente novo fechar com vocês por mês vindo pelo Google ou WhatsApp, o projeto já se paga 100%. Além disso, facilito em até 3x sem juros ou ajustamos para o momento da empresa. Que tal vermos a demonstração sem compromisso?"
  },
  {
    id: "instagram",
    title: "“Já tenho Instagram, não preciso de site”",
    tag: "Posse de Canal e SEO",
    response: "O Instagram é excelente para quem já conhece a marca, mas quem tem uma urgência ou busca no Google Maps por esse serviço na cidade não acha o Instagram! No site você tem domínio próprio, passa 10x mais autoridade e o cliente clica direto para o seu WhatsApp sem se distrair com outras postagens."
  },
  {
    id: "conhecido",
    title: "“Um conhecido / parente vai fazer para mim”",
    tag: "Profissionalismo e Suporte",
    response: "Super compreensível! É ótimo ter quem ajude. Só recomendo bastante atenção em 3 pontos críticos que dão dor de cabeça: velocidade no celular (se passar de 3s o cliente fecha), otimização SEO no Google da região e suporte contínuo quando o site cair. Eu entrego projeto homologado, profissional e com suporte direto comigo."
  },
  {
    id: "agora-nao",
    title: "“Agora não / Vamos deixar para depois”",
    tag: "Urgência e Oportunidade",
    response: "Totalmente compreensível, o momento da empresa é soberano! Só chamo a atenção para o fato de que, enquanto adiamos, clientes continuam pesquisando no celular todos os dias e fechando com concorrentes que já têm botão direto no Maps. A prévia leva menos de 1 minuto para ver, quer dar uma olhada?"
  }
];

export function PlaybookView({
  leads = [],
  selectedLead: propSelectedLead,
  onSelectLead,
  onLoggedInteraction
}: PlaybookViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("scripts");
  const [selectedLeadId, setSelectedLeadId] = useState<string>(
    propSelectedLead?.id || leads[0]?.id || ""
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const selectedLead = propSelectedLead || leads.find((l) => l.id === selectedLeadId) || leads[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    if (selectedLead) {
      onLoggedInteraction?.(selectedLead.id, `Copiou roteiro do playbook: ${id}`);
    }
    setTimeout(() => setCopiedId(null), 2000);
  };

  const company = selectedLead?.name || "Empresa Cliente";
  const segment = selectedLead?.segment || "Comércio Local";
  const city = selectedLead?.city || "Santos";
  const demoUrl = selectedLead?.demoUrl || undefined;

  return (
    <div className="view-container playbook-page-view">
      <div className="view-header">
        <div>
          <span className="eyebrow">Arsenal Comercial de Henrique Bezerra</span>
          <h1 className="view-title">Playbook de Abordagens & Objeções</h1>
          <p className="view-subtitle">Roteiros validados, perguntas de alto impacto e contornos de objeções para WhatsApp e ligações.</p>
        </div>

        {leads.length > 0 && (
          <div className="playbook-lead-picker-box">
            <span className="eyebrow-tiny">Personalizar Roteiros para o Lead:</span>
            <select
              className="playbook-lead-select"
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
            >
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.city} · {l.segment})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="playbook-tabs-nav">
        <button
          type="button"
          className={`playbook-nav-btn ${activeTab === "scripts" ? "active" : ""}`}
          onClick={() => setActiveTab("scripts")}
        >
          <BookOpen size={16} />
          <span>Roteiros de Abordagem ({TEMPLATES.length})</span>
        </button>
        <button
          type="button"
          className={`playbook-nav-btn ${activeTab === "objections" ? "active" : ""}`}
          onClick={() => setActiveTab("objections")}
        >
          <ShieldAlert size={16} />
          <span>Contorno de Objeções WhatsApp ({OBJECTIONS.length})</span>
        </button>
      </div>

      {activeTab === "scripts" ? (
        <div className="playbook-templates-grid">
          {TEMPLATES.map((tpl) => {
            const messageText = tpl.buildText(company, segment, city, HENRIQUE_PORTFOLIO, HENRIQUE_PHONE, demoUrl);
            const waUrl = selectedLead?.whatsappUrl
              ? `${selectedLead.whatsappUrl}?text=${encodeURIComponent(messageText)}`
              : undefined;

            return (
              <div key={tpl.id} className="playbook-template-card double-bezel-inner">
                <div className="tpl-card-header">
                  <div>
                    <span className="tpl-badge">{tpl.badge}</span>
                    <h3 className="tpl-title">{tpl.title}</h3>
                  </div>
                  <div className="tpl-header-actions">
                    <button
                      type="button"
                      className="btn-copy-code"
                      onClick={() => handleCopy(messageText, tpl.id)}
                    >
                      {copiedId === tpl.id ? <Check size={13} className="text-mint" /> : <Copy size={13} />}
                      <span>{copiedId === tpl.id ? "Copiado!" : "Copiar"}</span>
                    </button>
                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-wa-direct-sm"
                        title="Abrir no WhatsApp do Lead"
                      >
                        <MessageCircle size={13} />
                        <span>Enviar WA</span>
                      </a>
                    )}
                  </div>
                </div>

                <p className="tpl-context-note">{tpl.context}</p>

                <div className="tpl-text-box">
                  <pre>{messageText}</pre>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="objections-view-grid">
          {OBJECTIONS.map((item) => (
            <div key={item.id} className="objection-card double-bezel-inner">
              <div className="objection-card-top">
                <div className="objection-title-group">
                  <span className="objection-tag-pill">{item.tag}</span>
                  <h3 className="objection-phrase">{item.title}</h3>
                </div>
                <button
                  type="button"
                  className="btn-copy-code"
                  onClick={() => handleCopy(item.response, item.id)}
                >
                  {copiedId === item.id ? <Check size={13} className="text-mint" /> : <Copy size={13} />}
                  <span>{copiedId === item.id ? "Copiado!" : "Copiar Resposta"}</span>
                </button>
              </div>
              <p className="objection-response-text">{item.response}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
