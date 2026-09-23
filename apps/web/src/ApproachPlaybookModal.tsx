import { useEffect, useMemo, useRef, useState } from "react";
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
  Sparkles,
  Target,
  UserCheck,
  X
} from "lucide-react";
import type { Lead } from "./types";

interface ApproachPlaybookModalProps {
  leads: Lead[];
  currentLead: Lead | null;
  onClose: () => void;
  onSelectLead: (lead: Lead) => void;
  onLoggedInteraction?: (leadId: string, note: string) => void;
}

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
  // Categoria: Perda Invisível & Reflexão (Destaque - Frases do Usuário)
  {
    id: "user-q1-invisible-loss",
    category: "invisible_loss",
    title: "1. Pergunta da Concorrência & Perda Invisível",
    badge: "Alta Conversão ⭐",
    highlight: true,
    channel: "whatsapp",
    context: "Ideal para iniciar contato no WhatsApp gerando curiosidade imediata e reflexão comercial.",
    buildText: (company, segment, city, portfolio) =>
      `Olá, tudo bem? Posso te fazer uma pergunta rápida?

Você sabe quantos clientes podem estar procurando exatamente pelo que a ${company} oferece em ${city}… e acabam encontrando outra empresa primeiro?

Sou o Henrique, desenvolvedor web aqui da região. Notei essa oportunidade no segmento de ${segment.toLowerCase()} e montei uma proposta prática de como posicionar a ${company} no topo das buscas do Google e direcionar esses contatos direto pro seu WhatsApp.

Posso te mandar uma prévia rápida sem compromisso? (Portfólio: ${portfolio})`
  },
  {
    id: "user-q2-next-client",
    category: "invisible_loss",
    title: "2. E se o próximo cliente não te encontrar?",
    badge: "Gatilho de Urgência 🔥",
    highlight: true,
    channel: "whatsapp",
    context: "Excelente para empresas com presença fraca no Google Maps ou sem site.",
    buildText: (company, segment, city) =>
      `Olá equipe da ${company}! Tudo bem?

E se o próximo cliente da sua empresa estiver procurando exatamente pelo que você oferece em ${city} — mas não estiver encontrando você?

Hoje quem busca por ${segment.toLowerCase()} toma a decisão em segundos pelo celular. Meu nome é Henrique, sou desenvolvedor de presença digital para negócios locais. Montei uma ideia sob medida para a ${company} não perder mais esses clientes diários.

Vale 2 minutinhos para você dar uma olhada no que planejei?`
  },
  {
    id: "user-q3-ready-question",
    category: "invisible_loss",
    title: "3. Prontidão para novos clientes na internet",
    badge: "Diagnóstico Rápido 🚀",
    highlight: true,
    channel: "whatsapp",
    context: "Abordagem limpa, direta e profissional que qualifica o interesse do tomador de decisão.",
    buildText: (company, segment, city) =>
      `Olá! A ${company} já está pronta para ser encontrada por novos clientes na internet?

Notei que a demanda por ${segment.toLowerCase()} em ${city} e região tem crescido muito e que ter uma página rápida e moderna integrada ao WhatsApp colocaria vocês em grande vantagem competitiva.

Meu nome é Henrique, sou desenvolvedor web especializado na região. Preparei uma demonstração prática sem custo para vocês avaliarem. Posso compartilhar o link com você?`
  },

  // Categoria: Demonstração Imediata & Protótipo Lovable
  {
    id: "demo-lovable-ready",
    category: "demo_lovable",
    title: "Protótipo Interativo Criado",
    badge: "Impacto Visual 💡",
    channel: "whatsapp",
    context: "Quando você já gerou um protótipo rápido no Lovable e quer surpreender o cliente.",
    buildText: (company, segment, city, portfolio, _phone, demoUrl) =>
      `Olá! Tudo bem? Meu nome é Henrique, sou desenvolvedor web aqui da região.

Fiz um estudo rápido sobre o mercado de ${segment.toLowerCase()} em ${city} e montei um protótipo demonstrativo de como o site da ${company} pode dobrar o volume de contatos no WhatsApp.

${demoUrl ? `Você pode ver a demonstração online aqui: ${demoUrl}` : `Já deixei o layout quase pronto para vocês verem.`}

Fiz sem compromisso nenhum para ilustrar o potencial do negócio de vocês. Posso te enviar para você dar uma olhada rápida?`
  },

  // Categoria: Auditoria & Diagnóstico Visual
  {
    id: "audit-no-site",
    category: "audit_diagnostic",
    title: "Diagnóstico: Negócio Sem Site Próprio",
    badge: "Foco Oportunidade 🛠️",
    channel: "whatsapp",
    context: "Para empresas que hoje atendem apenas por telefone/WhatsApp ou perfil em rede social.",
    buildText: (company, segment, city, portfolio) =>
      `Olá, tudo bem? Estava pesquisando por ${segment.toLowerCase()} em ${city} e achei a ${company} muito bem avaliada!

Porém, notei que vocês ainda não possuem um site próprio no Google, o que faz muitos clientes que buscam no mapa acabarem ligando para concorrentes.

Meu nome é Henrique, desenvolvo sites rápidos, otimizados para SEO e focados em pedidos no WhatsApp (meu trabalho: ${portfolio}).

Posso te mostrar uma ideia simples e acessível de primeiro site para a ${company}?`
  },
  {
    id: "audit-slow-website",
    category: "audit_diagnostic",
    title: "Diagnóstico: Site Lento ou Desatualizado",
    badge: "Otimização Mobile 📱",
    channel: "whatsapp",
    context: "Para leads que têm site antigo, não responsivo ou que demora para abrir no celular.",
    buildText: (company, segment, _city, portfolio) =>
      `Olá equipe da ${company}! Conheci o trabalho de vocês em ${segment.toLowerCase()} e dei uma olhada no site atual.

Notei alguns pontos que podem estar fazendo visitantes desistirem antes de entrar em contato (principalmente a velocidade no celular e a facilidade do botão de WhatsApp).

Sou desenvolvedor especializado em modernização de sites para negócios locais (${portfolio}).

Posso te passar um checklist rápido de 3 melhorias que você mesmo pode avaliar?`
  },

  // Categoria: Consultoria & Portfólio Completo
  {
    id: "portfolio-complete",
    category: "portfolio_consultative",
    title: "Apresentação Consultiva Completa",
    badge: "Perfil Oficial 📄",
    channel: "whatsapp",
    context: "Abordagem formal com detalhamento de serviços, garantias e canais oficiais de Henrique.",
    buildText: (company, segment, city, portfolio, phone) =>
      `Olá! Conheci a ${company} e preparei uma proposta focada em aumentar a captação de clientes em ${city}.

Meu nome é Henrique Bezerra, sou desenvolvedor web full-stack especializado em presença digital para pequenos e médios negócios.

O que eu ofereço para a ${company}:
* Site moderno, responsivo e ultra rápido no celular
* Posicionamento estratégico no Google (SEO local para ${segment.toLowerCase()})
* Integração direta com WhatsApp para facilitar o contato imediato
* Suporte contínuo e sem dor de cabeça

Você pode conferir meu portfólio oficial aqui: ${portfolio}
WhatsApp direto: ${phone}

Posso demonstrar um rascunho de página que já pensei para a ${company}?`
  },

  // Categoria: Instagram Direct
  {
    id: "instagram-direct",
    category: "instagram_direct",
    title: "Direct no Instagram (Quebra de Gelo Curta)",
    badge: "Direct 📸",
    channel: "instagram",
    context: "Para mandar no Direct do perfil comercial do lead no Instagram.",
    buildText: (company, segment, city) =>
      `Olá pessoal da ${company}! Tudo bem? Acompanho o perfil de vocês aqui no Insta e acho o trabalho em ${segment.toLowerCase()} incrível!

Vocês já pensaram em ter uma página no Google para capturar as pessoas de ${city} que pesquisam por isso no mapa e mandar direto pro WhatsApp de vocês?

Sou desenvolvedor aqui da região e montei uma demonstração rápida. Posso mandar o link aqui no direct para darem uma olhada?`
  },

  // Categoria: Script de Cold Call
  {
    id: "cold-call-script",
    category: "cold_call",
    title: "Script de Ligação Rápida (45 Segundos)",
    badge: "Telefone 📞",
    channel: "call",
    context: "Para ligar na empresa e falar diretamente com o responsável ou dono.",
    buildText: (company, segment, city, portfolio, phone) =>
      `[ROTEIRO DE LIGAÇÃO — 45 SEGUNDOS]

1. ABERTURA:
"Olá, bom dia/boa tarde! Meu nome é Henrique, tudo bem? Por favor, eu poderia falar 30 segundos com o responsável pela parte comercial ou marketing da ${company}?"

2. GANCHO (PERDA INVISÍVEL):
"Oi [Nome do Responsável], tudo bem? Eu sou desenvolvedor aqui da região e estava analisando a busca de ${segment.toLowerCase()} no Google em ${city}. Vi que a ${company} tem ótimas avaliações, mas hoje quem pesquisa no celular muitas vezes não encontra uma página rápida com botão direto pro WhatsApp de vocês."

3. OFERTA SEM PRESSÃO:
"Eu montei uma demonstração prática sem custo nenhum mostrando como posicionar a ${company} e atrair esses clientes. Eu posso te mandar esse link no WhatsApp agora para você dar uma olhada de 1 minuto?"

4. FECHAMENTO DE CONTATO:
"Qual é o melhor WhatsApp para eu te enviar o link? Meu número é ${phone}. Muito obrigado pelo tempo!"`
  }
];

export function ApproachPlaybookModal({
  leads,
  currentLead,
  onClose,
  onSelectLead,
  onLoggedInteraction
}: ApproachPlaybookModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<ApproachCategory>("invisible_loss");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("user-q1-invisible-loss");
  const [selectedLeadId, setSelectedLeadId] = useState<string>(currentLead?.id || (leads[0]?.id ?? ""));
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Estados do Dropdown Customizado de Leads
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [leadSearchQuery, setLeadSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown se clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Dados do lead selecionado
  const activeLead = useMemo(() => {
    return leads.find((l) => l.id === selectedLeadId) || currentLead || null;
  }, [leads, selectedLeadId, currentLead]);

  // Lista filtrada para busca rápida
  const filteredLeads = useMemo(() => {
    if (!leadSearchQuery.trim()) return leads;
    const q = leadSearchQuery.toLowerCase();
    return leads.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        (l.segment || "").toLowerCase().includes(q) ||
        (l.city || "").toLowerCase().includes(q)
    );
  }, [leads, leadSearchQuery]);

  const [customForm, setCustomForm] = useState({
    company: activeLead?.name || "Empresa Exemplo",
    segment: activeLead?.segment || "Comércio Local",
    city: activeLead?.city || "Santos",
    demoUrl: activeLead?.demoUrl || ""
  });

  const handleLeadChange = (leadId: string) => {
    setSelectedLeadId(leadId);
    const found = leads.find((l) => l.id === leadId);
    if (found) {
      onSelectLead(found);
      setCustomForm({
        company: found.name,
        segment: found.segment,
        city: found.city,
        demoUrl: found.demoUrl || ""
      });
    }
  };

  const currentTemplate = useMemo(() => {
    return TEMPLATES.find((t) => t.id === selectedTemplateId) || TEMPLATES[0];
  }, [selectedTemplateId]);

  const renderedText = useMemo(() => {
    return currentTemplate.buildText(
      customForm.company,
      customForm.segment,
      customForm.city,
      HENRIQUE_PORTFOLIO,
      HENRIQUE_PHONE,
      customForm.demoUrl
    );
  }, [currentTemplate, customForm]);

  const waLink = useMemo(() => {
    if (!activeLead?.phone && !activeLead?.hasWhatsapp) {
      return `https://wa.me/?text=${encodeURIComponent(renderedText)}`;
    }
    const cleanDigits = (activeLead.phone || "").replace(/\D/g, "");
    const formatted = cleanDigits.startsWith("55") ? cleanDigits : `55${cleanDigits}`;
    return `https://wa.me/${formatted}?text=${encodeURIComponent(renderedText)}`;
  }, [activeLead, renderedText]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(renderedText);
      setCopiedId(currentTemplate.id);
      setTimeout(() => setCopiedId(null), 2500);

      if (activeLead && onLoggedInteraction) {
        onLoggedInteraction(activeLead.id, `Copiou abordagem "${currentTemplate.title}" para envio.`);
      }
    } catch {
      // fallback
    }
  };

  const handleWhatsAppSend = () => {
    if (activeLead && onLoggedInteraction) {
      onLoggedInteraction(activeLead.id, `Iniciou WhatsApp com abordagem: "${currentTemplate.title}"`);
    }
  };

  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter((t) => t.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="modal-wrap">
      <button className="drawer-scrim" onClick={onClose} aria-label="Fechar" />
      <div className="modal playbook-modal" role="dialog" aria-labelledby="playbook-title">
        <div className="section-title">
          <div>
            <span className="eyebrow">Playbook de Prospecção Ativa</span>
            <h2 id="playbook-title">Central de Abordagens Comerciais</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Fechar">
            <X />
          </button>
        </div>

        {/* Lead Context Selector */}
        <div className="playbook-lead-selector">
          <div className="lead-selector-header">
            <UserCheck size={16} className="text-primary" />
            <span>Personalizar abordagem com lead ativo:</span>
          </div>
          <div className="lead-selector-controls" ref={dropdownRef}>
            <div className="playbook-custom-select">
              <button
                type="button"
                className={`custom-select-trigger ${isDropdownOpen ? "open" : ""}`}
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
                aria-label="Selecionar empresa para personalizar abordagem"
              >
                <div className="trigger-lead-details">
                  <div className="trigger-lead-avatar">
                    {activeLead ? activeLead.name.substring(0, 2).toUpperCase() : "LD"}
                  </div>
                  <div className="trigger-lead-info">
                    <div className="trigger-lead-name-row">
                      <strong className="trigger-lead-name">
                        {activeLead ? activeLead.name : "Selecione uma empresa..."}
                      </strong>
                      {activeLead?.hasWhatsapp && (
                        <span className="trigger-wa-badge" title="Possui WhatsApp verificado">
                          <MessageCircle size={11} /> WA
                        </span>
                      )}
                      {activeLead?.score !== undefined && (
                        <span className="trigger-score-badge">Score {activeLead.score}</span>
                      )}
                    </div>
                    <span className="trigger-lead-meta">
                      {activeLead?.segment || "Geral"} · {activeLead?.city || "Santos"}
                    </span>
                  </div>
                </div>
                <ChevronDown size={16} className={`trigger-chevron ${isDropdownOpen ? "rotate" : ""}`} />
              </button>

              {isDropdownOpen && (
                <div className="custom-select-menu" role="listbox">
                  <div className="select-search-box">
                    <Search size={14} className="search-icon" />
                    <input
                      type="text"
                      className="select-search-input"
                      placeholder="Buscar por nome, nicho ou cidade..."
                      value={leadSearchQuery}
                      onChange={(e) => setLeadSearchQuery(e.target.value)}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                    {leadSearchQuery && (
                      <button
                        type="button"
                        className="clear-search-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLeadSearchQuery("");
                        }}
                        aria-label="Limpar busca"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  <div className="select-options-scroll">
                    {filteredLeads.length === 0 ? (
                      <div className="select-empty-msg">Nenhum lead encontrado para "{leadSearchQuery}"</div>
                    ) : (
                      filteredLeads.map((l) => {
                        const isSelected = l.id === selectedLeadId;
                        return (
                          <button
                            key={l.id}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            className={`custom-select-option ${isSelected ? "selected" : ""}`}
                            onClick={() => {
                              handleLeadChange(l.id);
                              setIsDropdownOpen(false);
                              setLeadSearchQuery("");
                            }}
                          >
                            <div className="option-avatar">
                              {l.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="option-body">
                              <div className="option-title-row">
                                <span className="option-name">{l.name}</span>
                                <div className="option-tags">
                                  {l.hasWhatsapp && (
                                    <span className="option-wa-pill">
                                      <MessageCircle size={10} /> WA
                                    </span>
                                  )}
                                  <span className="option-score-pill">Score {l.score}</span>
                                </div>
                              </div>
                              <span className="option-sub">
                                {l.segment} · {l.city}
                              </span>
                            </div>
                            {isSelected && <Check size={15} className="option-check-icon" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Category Navigation */}
        <div className="playbook-categories" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === "invisible_loss"}
            className={`playbook-cat-btn ${selectedCategory === "invisible_loss" ? "active" : ""}`}
            onClick={() => {
              setSelectedCategory("invisible_loss");
              setSelectedTemplateId("user-q1-invisible-loss");
            }}
          >
            <Flame size={15} />
            <span>Perda Invisível & Perguntas ⭐</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === "demo_lovable"}
            className={`playbook-cat-btn ${selectedCategory === "demo_lovable" ? "active" : ""}`}
            onClick={() => {
              setSelectedCategory("demo_lovable");
              setSelectedTemplateId("demo-lovable-ready");
            }}
          >
            <Sparkles size={15} />
            <span>Protótipo & Lovable</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === "audit_diagnostic"}
            className={`playbook-cat-btn ${selectedCategory === "audit_diagnostic" ? "active" : ""}`}
            onClick={() => {
              setSelectedCategory("audit_diagnostic");
              setSelectedTemplateId("audit-no-site");
            }}
          >
            <Target size={15} />
            <span>Diagnóstico & Auditoria</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === "portfolio_consultative"}
            className={`playbook-cat-btn ${selectedCategory === "portfolio_consultative" ? "active" : ""}`}
            onClick={() => {
              setSelectedCategory("portfolio_consultative");
              setSelectedTemplateId("portfolio-complete");
            }}
          >
            <BookOpen size={15} />
            <span>Portfólio & Consultoria</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === "instagram_direct"}
            className={`playbook-cat-btn ${selectedCategory === "instagram_direct" ? "active" : ""}`}
            onClick={() => {
              setSelectedCategory("instagram_direct");
              setSelectedTemplateId("instagram-direct");
            }}
          >
            <Instagram size={15} />
            <span>Instagram Direct</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === "cold_call"}
            className={`playbook-cat-btn ${selectedCategory === "cold_call" ? "active" : ""}`}
            onClick={() => {
              setSelectedCategory("cold_call");
              setSelectedTemplateId("cold-call-script");
            }}
          >
            <PhoneCall size={15} />
            <span>Script de Ligação (45s)</span>
          </button>
        </div>

        {/* Template List & Preview Grid */}
        <div className="playbook-content-grid">
          <div className="template-picker">
            <span className="picker-title">Variações disponíveis ({filteredTemplates.length}):</span>
            <div className="template-list">
              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  className={`template-item ${selectedTemplateId === template.id ? "selected" : ""} ${
                    template.highlight ? "highlight-item" : ""
                  }`}
                  onClick={() => setSelectedTemplateId(template.id)}
                >
                  <div className="template-item-top">
                    <strong>{template.title}</strong>
                    <span className="template-badge">{template.badge}</span>
                  </div>
                  <p>{template.context}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="template-preview-area">
            <div className="preview-header">
              <div>
                <span className="preview-eyebrow">Texto pronto para envio</span>
                <h4>{currentTemplate.title}</h4>
              </div>
              <span className="channel-indicator">
                {currentTemplate.channel === "whatsapp" && <MessageCircle size={14} />}
                {currentTemplate.channel === "instagram" && <Instagram size={14} />}
                {currentTemplate.channel === "call" && <PhoneCall size={14} />}
                {currentTemplate.channel.toUpperCase()}
              </span>
            </div>

            <div className="preview-textbox">
              <pre>{renderedText}</pre>
            </div>

            <div className="preview-actions">
              <button
                type="button"
                className="secondary"
                onClick={handleCopy}
              >
                {copiedId === currentTemplate.id ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                <span>{copiedId === currentTemplate.id ? "Mensagem Copiada!" : "Copiar Texto"}</span>
              </button>

              {currentTemplate.channel !== "call" && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noreferrer"
                  className="primary whatsapp-btn"
                  onClick={handleWhatsAppSend}
                >
                  <MessageCircle size={16} />
                  <span>Abrir no WhatsApp Web</span>
                  <ExternalLink size={13} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Tactical Playbook Footnote */}
        <div className="playbook-footer-tip">
          <HelpCircle size={15} />
          <span>
            <strong>Dica de Fechamento de Henrique:</strong> O objetivo do primeiro contato nunca é vender um site complexo, e sim <em>abrir uma conversa de curiosidade</em> mostrando que concorrentes podem estar capturando clientes que deveriam ser da empresa.
          </span>
        </div>
      </div>
    </div>
  );
}
