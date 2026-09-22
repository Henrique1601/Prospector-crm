import { useState } from "react";
import { Check, ChevronDown, ChevronUp, Copy, MessageCircle, ShieldAlert } from "lucide-react";
import type { Lead } from "./types";

interface ObjectionsAssistantProps {
  lead: Lead;
  onLoggedInteraction?: (note: string) => void;
}

interface ObjectionItem {
  id: string;
  title: string;
  tag: string;
  response: string;
}

export function ObjectionsAssistant({ lead, onLoggedInteraction }: ObjectionsAssistantProps) {
  const [openId, setOpenId] = useState<string | null>("caro");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const cleanPhone = (lead.phone || "").replace(/\D/g, "");

  const objections: ObjectionItem[] = [
    {
      id: "caro",
      title: "“Achei caro / Tá fora do orçamento agora”",
      tag: "ROI e Parcelamento",
      response: `Entendo perfeitamente, ${lead.name.split(" ")[0]}! Na verdade, o site não é uma despesa, e sim um vendedor trabalhando 24h por dia para a ${lead.name}. Se um único cliente novo fechar com vocês por mês vindo pelo Google ou WhatsApp, o projeto já se paga sozinho. Além disso, facilito em até 3x sem juros ou criamos uma versão essencial sob medida para o momento atual de vocês. Que tal vermos a demonstração sem compromisso?`
    },
    {
      id: "instagram",
      title: "“Já tenho Instagram, não preciso de site”",
      tag: "Posse de Canal e SEO",
      response: `O Instagram de vocês é ótimo para manter relacionamento com quem já conhece a marca, mas quem está com uma necessidade imediata de ${lead.segment.toLowerCase()} em ${lead.city} pesquisa direto no Google Maps! Sem site próprio, essas pessoas acabam indo para o concorrente. No site você tem domínio próprio, passa 10x mais credibilidade e tem um botão direto para o seu WhatsApp sem depender do algoritmo do Instagram entregar sua publicação.`
    },
    {
      id: "conhecido",
      title: "“Um conhecido / parente vai fazer para mim”",
      tag: "Profissionalismo e Suporte",
      response: `Super compreensível! É ótimo ter quem ajude. Só recomendo bastante atenção em 3 pontos críticos que costumam dar dor de cabeça depois: velocidade no celular (se passar de 3 segundos o cliente fecha), otimização no Google (para realmente aparecer nas buscas de ${lead.city}) e suporte contínuo quando o site cair ou precisar atualizar. Eu entrego projeto 100% profissional, homologado, com contrato e suporte direto comigo.`
    },
    {
      id: "agora-nao",
      title: "“Agora não / Vamos deixar para depois”",
      tag: "Urgência e Oportunidade",
      response: `Totalmente compreensível, o momento da empresa é soberano! Só chamo a atenção para o fato de que, enquanto adiamos, clientes em ${lead.city} continuam buscando por ${lead.segment.toLowerCase()} todos os dias e caindo em quem já tem presença digital. Eu já estruturei um modelo inicial pensado especialmente para a ${lead.name}. Leva menos de 3 minutos para você dar uma olhada. Posso te enviar o link da demonstração?`
    },
    {
      id: "retorno",
      title: "“Não sei se site dá retorno no meu ramo”",
      tag: "Comportamento do Consumidor",
      response: `Essa é uma dúvida muito legítima! Hoje, mais de 80% das pessoas antes de visitar ou pedir em qualquer empresa de ${lead.city} pesquisam no celular para ver fotos, credibilidade, endereço e horário. Quando a empresa não tem um site rápido com botão de WhatsApp, a percepção de confiança cai e a pessoa busca a próxima opção. O foco do meu projeto é justamente esse: transformar a busca em contato imediato no seu WhatsApp.`
    }
  ];

  const handleCopy = async (item: ObjectionItem) => {
    await navigator.clipboard.writeText(item.response);
    setCopiedId(item.id);
    onLoggedInteraction?.(`Copiou contorno de objeção: "${item.title}".`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="objections-assistant-card">
      <div className="objections-header">
        <div className="objections-title">
          <ShieldAlert size={16} />
          <strong>Assistente de Objeções (WhatsApp)</strong>
        </div>
        <small>Argumentos prontos para destravar o fechamento</small>
      </div>

      <div className="objections-list">
        {objections.map((item) => {
          const isOpen = openId === item.id;
          const isCopied = copiedId === item.id;
          const waUrl = cleanPhone
            ? `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(item.response)}`
            : lead.whatsappUrl;

          return (
            <div key={item.id} className={`objection-item ${isOpen ? "open" : ""}`}>
              <button
                type="button"
                className="objection-trigger"
                onClick={() => setOpenId(isOpen ? null : item.id)}
              >
                <div className="objection-trigger-text">
                  <span className="objection-tag">{item.tag}</span>
                  <strong>{item.title}</strong>
                </div>
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {isOpen && (
                <div className="objection-content">
                  <p className="objection-text">{item.response}</p>
                  <div className="objection-actions">
                    <button
                      type="button"
                      className="btn-objection-action"
                      onClick={() => handleCopy(item)}
                    >
                      {isCopied ? <Check size={14} /> : <Copy size={14} />}
                      <span>{isCopied ? "Copiado!" : "Copiar resposta"}</span>
                    </button>

                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-objection-wa"
                        onClick={() => {
                          onLoggedInteraction?.(`Enviou resposta de objeção (${item.tag}) no WhatsApp.`);
                        }}
                      >
                        <MessageCircle size={14} />
                        <span>Enviar no WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
