import OpenAI from "openai";
import type { Lead } from "./types.js";

const key = process.env.AISA_API_KEY;
const client = key ? new OpenAI({ apiKey: key, baseURL: "https://api.aisa.one/v1" }) : null;

export async function analyzeWithAi(lead: Lead) {
  if (!client) return null;
  const response = await client.chat.completions.create({
    model: process.env.AISA_MODEL || "gpt-4.1",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: "Você qualifica leads B2B para Henrique Bezerra, desenvolvedor Full-Stack. Use somente os dados fornecidos; não invente site, contato, endereço ou fatos. Retorne JSON com score (0-100), priority (low|medium|high|urgent), siteStatus (unknown|none|weak|good), digitalPresence (unknown|low|medium|high), opportunity, reason, suggestedMessage e nextAction. A mensagem deve ser curta, natural, em português e pedir permissão para mostrar uma ideia." },
      { role: "user", content: JSON.stringify(lead) }
    ]
  });
  return JSON.parse(response.choices[0]?.message.content || "{}") as Partial<Lead>;
}

export function localAnalysis(lead: Lead): Partial<Lead> {
  const score = 68 + ((lead.name.length + lead.segment.length) % 24);
  return {
    score,
    priority: score >= 86 ? "urgent" : score >= 72 ? "high" : "medium",
    siteStatus: lead.website ? "weak" : "unknown",
    digitalPresence: lead.website ? "medium" : "unknown",
    opportunity: lead.website ? "Modernização do site e melhoria da conversão" : "Confirmar presença digital e avaliar um site institucional",
    reason: lead.website ? "Existe um endereço digital informado; a qualidade precisa de revisão humana." : "O cadastro ainda não possui site confirmado. Pesquise antes de afirmar que a empresa não tem site.",
    suggestedMessage: `Olá! Tudo bem? Sou o Henrique, desenvolvedor Full-Stack. Conheci a ${lead.name} e pensei em algumas possibilidades para melhorar a apresentação da empresa na internet e facilitar o contato de novos clientes. Posso te mostrar uma ideia sem compromisso?`,
    nextAction: "Revisar os dados e a abordagem antes do contato"
  };
}

export function demoBrief(lead: Lead) {
  return `DEMONSTRAÇÃO — ${lead.name}\n\nObjetivo: apresentar ${lead.segment.toLowerCase()} com clareza e levar visitantes ao contato pelo WhatsApp.\nPúblico: clientes de ${lead.city} e região.\nHeadline sugerida: ${lead.name}: atendimento confiável perto de você.\nSeções: proposta principal, serviços, diferenciais, localização, prova social e contato.\nCTA: Falar com a equipe.\nDireção visual: linguagem local, fotografias reais do negócio e leitura rápida no celular.\nObservação: confirmar serviços, telefone, horário e diferenciais com a empresa antes de publicar.`;
}
