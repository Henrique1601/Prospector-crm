import type { Lead } from "./types.js";

const raw = [
  ["Mecânica Silva Jardim", "Oficina mecânica", "Santos", "R. Silva Jardim, Vila Mathias", "Mecanica+Silva+Jardim+Santos+SP"],
  ["Auto Elétrica Mathias", "Auto elétrica", "Santos", "R. Comendador Martins, Vila Mathias", "Auto+Eletrica+Comendador+Martins+Santos+SP"],
  ["Litoral Peças e Serviços Automotivos", "Autopeças", "Santos", "R. Lucas Fortunato, Vila Mathias", "Litoral+Pecas+e+Servicos+Automotivos+Santos+SP"],
  ["Tel-Car Funilaria e Pintura", "Funilaria", "Santos", "R. Comendador Martins, Vila Mathias", "Tel-Car+Funilaria+Santos+SP"],
  ["Santos Eletrovel", "Auto elétrica", "Santos", "R. Joaquim Távora, Vila Mathias", "Santos+Eletrovel+Santos+SP"],
  ["Oficina Mecânica Lucas Fortunato", "Oficina mecânica", "Santos", "R. Lucas Fortunato, Vila Mathias", "Oficina+Mecanica+Rua+Lucas+Fortunato+Santos+SP"],
  ["Barbearia Tradicional Vila Mathias", "Barbearia", "Santos", "R. Joaquim Távora, Vila Mathias", "Barbearia+Rua+Joaquim+Tavora+Santos+SP"],
  ["Salão de Beleza Braz Cubas", "Beleza", "Santos", "R. Braz Cubas, Vila Mathias", "Salao+de+Beleza+Rua+Braz+Cubas+Santos+SP"],
  ["Marmitaria Silva Jardim", "Restaurante", "Santos", "R. Silva Jardim, Vila Mathias", "Restaurante+Marmitex+Rua+Silva+Jardim+Santos+SP"],
  ["Despachante Feijó", "Despachante", "Santos", "Av. Senador Feijó, Vila Mathias", "Despachante+Avenida+Senador+Feijo+Santos+SP"],
  ["Chaveiro Rangel Pestana", "Chaveiro", "Santos", "Av. Rangel Pestana, Vila Mathias", "Chaveiro+Avenida+Rangel+Pestana+Santos+SP"],
  ["Marcenaria Santos", "Móveis planejados", "Santos", "R. Lucas Fortunato, Vila Mathias", "Marcenaria+Rua+Lucas+Fortunato+Santos+SP"],
  ["Centro Automotivo Frei Gaspar", "Centro automotivo", "São Vicente", "Av. Frei Gaspar, Centro", "Centro+Automotivo+Avenida+Frei+Gaspar+Sao+Vicente+SP"],
  ["Auto Elétrica e Baterias São Vicente", "Auto elétrica", "São Vicente", "Av. Marechal Deodoro, Centro", "Auto+Eletrica+Avenida+Marechal+Deodoro+Sao+Vicente+SP"],
  ["Moto Peças São Vicente", "Motopeças", "São Vicente", "Av. Capitão-Mor Aguiar, Centro", "Moto+Pecas+Capitao+Mor+Aguiar+Sao+Vicente+SP"],
  ["Oficina Mecânica Cidade Náutica", "Oficina mecânica", "São Vicente", "Cidade Náutica", "Oficina+Mecanica+Cidade+Nautica+Sao+Vicente+SP"]
] as const;

export function seedLeads(): Lead[] {
  const now = new Date().toISOString();
  return raw.map(([name, segment, city, address, query], index) => ({
    id: `lead-${index + 1}`,
    name, segment, city, state: "SP", address,
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${query}`,
    stage: index < 3 ? "analyzed" : "new",
    score: index === 0 ? 87 : index === 1 ? 74 : index === 2 ? 81 : 0,
    priority: index === 0 ? "urgent" : index < 3 ? "high" : "low",
    siteStatus: index < 3 ? "none" : "unknown",
    digitalPresence: index < 3 ? "low" : "unknown",
    opportunity: index < 3 ? "Site institucional com contato rápido pelo WhatsApp" : undefined,
    reason: index < 3 ? "Há sinais de presença local, mas nenhum site próprio foi confirmado." : undefined,
    suggestedMessage: index < 3 ? `Olá! Tudo bem? Sou o Henrique, desenvolvedor Full-Stack. Conheci a ${name} e pensei em uma forma de melhorar a apresentação da empresa na internet e facilitar o contato de novos clientes. Posso te mostrar uma ideia sem compromisso?` : undefined,
    nextAction: index < 3 ? "Revisar abordagem e iniciar contato manual" : "Pesquisar presença digital",
    nextFollowUp: index === 1 ? new Date(Date.now() + 86400000).toISOString() : undefined,
    sources: [`https://www.google.com/maps/search/?api=1&query=${query}`],
    interactions: [], createdAt: now, updatedAt: now,
    analyzedAt: index < 3 ? now : undefined
  }));
}
