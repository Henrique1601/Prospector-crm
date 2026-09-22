import OpenAI from "openai";
import type { Lead, SuggestedMessages } from "./types.js";

const key = process.env.AISA_API_KEY;
const client = key ? new OpenAI({ apiKey: key, baseURL: "https://api.aisa.one/v1" }) : null;

export const HENRIQUE_PROFILE = {
  name: "Henrique Bezerra dos Santos",
  role: "Desenvolvedor Web Full-Stack",
  portfolio: "https://bezerraportifolio.netlify.app/",
  linkedin: "www.linkedin.com/in/henriquebezerra-dev",
  whatsapp: "(13) 99138-3222",
  email: "henriquebs1601@gmail.com"
};

export async function analyzeWithAi(lead: Lead) {
  if (!client) return null;
  try {
    const response = await client.chat.completions.create({
      model: process.env.AISA_MODEL || "gpt-4.1",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Você qualifica leads B2B para Henrique Bezerra dos Santos, desenvolvedor Web Full-Stack especializado em criar presença digital para pequenos e médios negócios.
Links do Henrique:
- Portfólio: ${HENRIQUE_PROFILE.portfolio}
- LinkedIn: ${HENRIQUE_PROFILE.linkedin}
- WhatsApp: ${HENRIQUE_PROFILE.whatsapp}
- E-mail: ${HENRIQUE_PROFILE.email}

Use somente os dados fornecidos sobre o lead; não invente contatos, endereços ou fatos.
Retorne um JSON com:
- score: número de 0 a 100
- priority: "low" | "medium" | "high" | "urgent"
- siteStatus: "unknown" | "none" | "weak" | "good"
- digitalPresence: "unknown" | "low" | "medium" | "high"
- opportunity: resumo claro da oportunidade digital
- reason: justificativa objetiva baseada em evidências
- suggestedMessage: mensagem padrão de abordagem
- suggestedMessages: objeto contendo variações estratégicas de abordagem:
  * portfolio: texto completo e consultivo apresentando especialidades, portfólio de Henrique e contatos
  * short: mensagem curta e amigável para WhatsApp pedindo permissão para mostrar uma ideia
  * direct: mensagem focada em demonstrar a proposta que já foi pensada para o negócio
  * curiosity: "Posso te fazer uma pergunta rápida? Você sabe quantos clientes podem estar procurando exatamente pelo que sua empresa oferece… e acabam encontrando outra empresa primeiro?" adaptada para o lead
  * invisible_loss: "E se o próximo cliente da sua empresa estiver procurando exatamente pelo que você oferece — mas não estiver encontrando você?" adaptada para o lead
  * ready_question: "Sua empresa já está pronta para ser encontrada por novos clientes na internet?" adaptada para o lead
- nextAction: próxima ação recomendada`
        },
        { role: "user", content: JSON.stringify(lead) }
      ]
    });
    return JSON.parse(response.choices[0]?.message.content || "{}") as Partial<Lead>;
  } catch {
    return null;
  }
}

export function localAnalysis(lead: Lead): Partial<Lead> {
  const score = 68 + ((lead.name.length + lead.segment.length) % 24);
  const hasSite = Boolean(
    lead.website &&
      lead.website.trim() &&
      !lead.website.toLowerCase().includes("wa.me") &&
      !lead.website.toLowerCase().includes("whatsapp.com")
  );

  const portfolio = hasSite
    ? `Olá! Conheci a ${lead.name} e reparei no site de vocês. Pensei em algumas melhorias pontuais para modernizar o visual, acelerar o carregamento no celular e aumentar a conversão de novos clientes direto pelo WhatsApp.

Meu nome é Henrique, sou desenvolvedor web fullstack especializado em presença digital e sistemas para negócios.

O que eu faço:
* Desenvolvo sites modernos, responsivos e otimizados para o Google (SEO)
* Integro sistemas de gerenciamento e automação para facilitar o dia a dia
* Otimizo o contato rápido de novos clientes via WhatsApp
* Ofereço suporte e manutenção contínua

Posso mostrar meu trabalho em ${HENRIQUE_PROFILE.portfolio} .
Cada projeto é feito sob medida para o segmento de ${lead.segment.toLowerCase()} e o orçamento de vocês.
Posso demonstrar uma ideia que pensei para a ${lead.name}!

Meu LinkedIn: ${HENRIQUE_PROFILE.linkedin}
Meu WhatsApp: ${HENRIQUE_PROFILE.whatsapp}
Meu e-mail de contato: ${HENRIQUE_PROFILE.email}

Abraços,
${HENRIQUE_PROFILE.name}`
    : `Olá, vi que vocês ainda não possuem um site próprio e eu posso resolver esse problema.

Meu nome é Henrique, sou desenvolvedor web fullstack especializado em criar presença digital para pequenos e médios negócios.

O que eu faço:
* Desenvolvo sites modernos, responsivos e otimizados para buscas (SEO)
* Integro sistemas de gerenciamento para facilitar sua vida
* Crio plataformas e páginas que convertem visitantes em clientes
* Ofereço suporte e manutenção contínua

Posso mostrar meu trabalho através de ${HENRIQUE_PROFILE.portfolio} .
Cada projeto é feito sob medida para as necessidades e orçamento do seu negócio.
Posso demonstrar o rascunho de site que já planejei para a ${lead.name}!

Meu LinkedIn: ${HENRIQUE_PROFILE.linkedin}
Meu WhatsApp: ${HENRIQUE_PROFILE.whatsapp}
Meu e-mail de contato: ${HENRIQUE_PROFILE.email}

Abraços,
${HENRIQUE_PROFILE.name}`;

  const short = `Olá! Tudo bem? Sou o Henrique, desenvolvedor Full-Stack aqui da região. Conheci a ${lead.name} e notei uma excelente oportunidade para destacar a empresa no Google e facilitar o contato de clientes de ${lead.city} pelo WhatsApp. Posso te mostrar uma ideia rápida sem compromisso? (Meu portfólio: ${HENRIQUE_PROFILE.portfolio})`;

  const direct = `Olá equipe da ${lead.name}! Meu nome é Henrique, sou desenvolvedor web. Analisei a presença digital no segmento de ${lead.segment.toLowerCase()} em ${lead.city} e elaborei um briefing demonstrativo focado em atrair mais clientes para o WhatsApp de vocês. Posso te enviar o modelo sem compromisso para vocês avaliarem? Contato: ${HENRIQUE_PROFILE.whatsapp} | Portfólio: ${HENRIQUE_PROFILE.portfolio}`;

  const curiosity = `Olá, tudo bem? Posso te fazer uma pergunta rápida?

Você sabe quantos clientes podem estar procurando exatamente pelo que a ${lead.name} oferece em ${lead.city}… e acabam encontrando outra empresa primeiro?

Sou o Henrique, desenvolvedor web aqui da região. Notei essa oportunidade no segmento de ${lead.segment.toLowerCase()} e montei uma proposta prática de como posicionar a ${lead.name} no topo das buscas e direcionar esses contatos direto pro seu WhatsApp.

Posso te mandar uma prévia rápida sem compromisso? (Portfólio: ${HENRIQUE_PROFILE.portfolio})`;

  const invisible_loss = `Olá equipe da ${lead.name}! Tudo bem?

E se o próximo cliente da sua empresa estiver procurando exatamente pelo que vocês oferecem em ${lead.city} — mas não estiver encontrando vocês na internet?

Hoje quem busca por ${lead.segment.toLowerCase()} toma a decisão em segundos pelo celular. Meu nome é Henrique, sou desenvolvedor de presença digital para negócios locais. Montei uma ideia sob medida para a ${lead.name} atrair esses clientes.

Vale 2 minutinhos para você dar uma olhada?`;

  const ready_question = `Olá! A ${lead.name} já está pronta para ser encontrada por novos clientes na internet?

Notei que a demanda por ${lead.segment.toLowerCase()} em ${lead.city} está crescendo e que um site moderno e integrado ao WhatsApp colocaria vocês em grande vantagem competitiva.

Meu nome é Henrique, sou desenvolvedor web especializado na região. Preparei uma demonstração prática sem nenhum custo para vocês avaliarem. Posso compartilhar o link?`;

  const suggestedMessages: SuggestedMessages = {
    portfolio,
    short,
    direct,
    curiosity,
    invisible_loss,
    ready_question
  };

  return {
    score,
    priority: score >= 86 ? "urgent" : score >= 72 ? "high" : "medium",
    siteStatus: hasSite ? "weak" : "unknown",
    digitalPresence: hasSite ? "medium" : "unknown",
    opportunity: hasSite
      ? "Modernização do site e melhoria da conversão no WhatsApp"
      : "Criação de site institucional profissional e botão de WhatsApp",
    reason: hasSite
      ? "Existe um endereço digital informado; a qualidade visual e mobile precisa de revisão."
      : "O cadastro ainda não possui site confirmado. Oportunidade excelente de criação de primeiro site.",
    suggestedMessage: portfolio,
    suggestedMessages,
    nextAction: "Revisar os dados e iniciar o contato manual"
  };
}

export function demoBrief(lead: Lead) {
  return `DEMONSTRAÇÃO — ${lead.name}\n\nObjetivo: apresentar ${lead.segment.toLowerCase()} com clareza e levar visitantes ao contato pelo WhatsApp.\nPúblico: clientes de ${lead.city} e região.\nHeadline sugerida: ${lead.name}: atendimento confiável perto de você.\nSeções: proposta principal, serviços, diferenciais, localização, prova social e contato.\nCTA: Falar com a equipe no WhatsApp.\nDireção visual: linguagem local, fotografias reais do negócio e leitura ultra rápida no celular.\nObservação: confirmar serviços, telefone, horário e diferenciais com a empresa antes de publicar.`;
}
