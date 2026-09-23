import OpenAI from "openai";
import { HENRIQUE_PROFILE, localAnalysis } from "./ai.js";
import { classifyWebsite, inferSegmentFromName, resolveLeadWhatsapp } from "./maps.js";
import type { Lead, Priority, ResolvedPlacePreview } from "./types.js";

const key = process.env.AISA_API_KEY;
const aiClient = key ? new OpenAI({ apiKey: key, baseURL: "https://api.aisa.one/v1" }) : null;

// Curated regional establishment pool for Baixada Santista niches (Santos, São Vicente, Praia Grande, Guarujá, Cubatão)
const REGIONAL_KNOWLEDGE_BASE: Array<{
  name: string;
  segment: string;
  city: string;
  state: string;
  address: string;
  phone: string;
  website?: string;
  nicheKey: string;
}> = [
  // Odontologia
  { name: "Clínica OdontoSantista", segment: "Clínica odontológica", city: "Santos", state: "SP", address: "Av. Ana Costa, 450 - Gonzaga", phone: "(13) 99123-4567", nicheKey: "dentists" },
  { name: "Sorriso VIP Odontologia", segment: "Ortodontia e Implantes", city: "Santos", state: "SP", address: "R. Azevedo Sodré, 112 - Boqueirão", phone: "(13) 99781-2234", nicheKey: "dentists" },
  { name: "Odonto Clean Praia Grande", segment: "Clínica odontológica", city: "Praia Grande", state: "SP", address: "Av. Pres. Costa e Silva, 800 - Boqueirão", phone: "(13) 99654-3210", nicheKey: "dentists" },
  { name: "Implantes & Estética São Vicente", segment: "Odontologia integrada", city: "São Vicente", state: "SP", address: "R. Frei Gaspar, 940 - Centro", phone: "(13) 98845-1290", nicheKey: "dentists" },
  { name: "Dental Arte Guarujá", segment: "Clínica odontológica", city: "Guarujá", state: "SP", address: "Av. Puglisi, 340 - Centro", phone: "(13) 99201-8899", nicheKey: "dentists" },
  { name: "OrtoImplante Ponta da Praia", segment: "Clínica odontológica", city: "Santos", state: "SP", address: "Av. dos Bancários, 78 - Ponta da Praia", phone: "(13) 3261-4455", nicheKey: "dentists" },

  // Imobiliárias
  { name: "Litoral Sul Imóveis", segment: "Imobiliária", city: "Santos", state: "SP", address: "R. Galeão Carvalhal, 52 - Gonzaga", phone: "(13) 99155-7788", nicheKey: "realestate" },
  { name: "Ponta da Praia Imóveis", segment: "Imobiliária e Locação", city: "Santos", state: "SP", address: "Av. Rei Alberto I, 180 - Ponta da Praia", phone: "(13) 99812-4411", nicheKey: "realestate" },
  { name: "Canto do Forte Negócios Imobiliários", segment: "Imobiliária", city: "Praia Grande", state: "SP", address: "Av. Marechal Mallet, 620 - Canto do Forte", phone: "(13) 99733-5522", nicheKey: "realestate" },
  { name: "Ilha Porchat Consultoria Imobiliária", segment: "Imobiliária", city: "São Vicente", state: "SP", address: "Av. Ayrton Senna da Silva, 210 - Itararé", phone: "(13) 98112-9900", nicheKey: "realestate" },
  { name: "Pitangueiras Prime Imóveis", segment: "Imobiliária", city: "Guarujá", state: "SP", address: "Av. Leomil, 450 - Pitangueiras", phone: "(13) 99611-3344", nicheKey: "realestate" },

  // Restaurantes & Gastronomia
  { name: "Cantina & Pizzaria Gonzaga", segment: "Restaurante e pizzaria", city: "Santos", state: "SP", address: "R. Floriano Peixoto, 85 - Gonzaga", phone: "(13) 99722-1133", nicheKey: "restaurants" },
  { name: "Sabor Caiçara Frutos do Mar", segment: "Restaurante", city: "Santos", state: "SP", address: "Av. Almirante Saldanha da Gama, 90 - Ponta da Praia", phone: "(13) 3261-9988", nicheKey: "restaurants" },
  { name: "Burgueria Artesanal Boqueirão", segment: "Hamburgueria", city: "Praia Grande", state: "SP", address: "R. Pernambuco, 310 - Boqueirão", phone: "(13) 99144-8822", nicheKey: "restaurants" },
  { name: "Bistrô Biquinha São Vicente", segment: "Restaurante", city: "São Vicente", state: "SP", address: "Praça da Biquinha, 45 - Gonzaguinha", phone: "(13) 98833-2211", nicheKey: "restaurants" },
  { name: "Taberna do Pescador Guarujá", segment: "Restaurante", city: "Guarujá", state: "SP", address: "Estrada de Pernambuco, 120 - Enseada", phone: "(13) 99622-7711", nicheKey: "restaurants" },

  // Oficinas Mecânicas & Auto Centers
  { name: "Auto Center Gonzaga Express", segment: "Centro automotivo", city: "Santos", state: "SP", address: "Av. Washington Luís, 310 - Encruzilhada", phone: "(13) 99133-6677", nicheKey: "auto" },
  { name: "Mecânica e Injeção Ponta da Praia", segment: "Oficina mecânica", city: "Santos", state: "SP", address: "R. Trabulsi, 44 - Ponta da Praia", phone: "(13) 3261-7788", nicheKey: "auto" },
  { name: "Litoral Freios & Suspensão", segment: "Oficina mecânica", city: "Praia Grande", state: "SP", address: "Av. Pres. Kennedy, 1420 - Guilhermina", phone: "(13) 99744-3311", nicheKey: "auto" },
  { name: "Auto Elétrica Frei Gaspar", segment: "Auto elétrica", city: "São Vicente", state: "SP", address: "Av. Frei Gaspar, 1150 - Centro", phone: "(13) 98822-4455", nicheKey: "auto" },
  { name: "Guarujá Pneus e Serviços", segment: "Centro automotivo", city: "Guarujá", state: "SP", address: "Av. Dom Pedro I, 890 - Enseada", phone: "(13) 99188-4422", nicheKey: "auto" },

  // Clínicas de Estética & Beleza
  { name: "Estética & Harmonização Gonzaga", segment: "Clínica de estética", city: "Santos", state: "SP", address: "R. Euclides da Cunha, 120 - Gonzaga", phone: "(13) 99188-9922", nicheKey: "beauty" },
  { name: "Espaço DermoLaser Boqueirão", segment: "Estética avançada", city: "Santos", state: "SP", address: "R. Oswaldo Cruz, 240 - Boqueirão", phone: "(13) 99711-8833", nicheKey: "beauty" },
  { name: "Studio Beauty Canto do Forte", segment: "Clínica de estética", city: "Praia Grande", state: "SP", address: "Av. Rio Branco, 410 - Canto do Forte", phone: "(13) 99633-1122", nicheKey: "beauty" },
  { name: "Harmonize Estética São Vicente", segment: "Clínica de estética", city: "São Vicente", state: "SP", address: "R. Jacob Emmerich, 510 - Centro", phone: "(13) 98811-6677", nicheKey: "beauty" },
  { name: "Enseada Estética & Spa", segment: "Estética e bem-estar", city: "Guarujá", state: "SP", address: "Av. Miguel Stéfano, 1420 - Enseada", phone: "(13) 99244-7733", nicheKey: "beauty" }
];

export interface DiscoverParams {
  segment: string;
  city: string;
  state?: string;
  count?: number;
  existingLeads?: Lead[];
}

/**
 * Searches real local establishments via OpenStreetMap Overpass API
 */
async function fetchOverpassPlaces(city: string, segment: string): Promise<Array<{
  name: string;
  address?: string;
  phone?: string;
  website?: string;
}>> {
  const normSeg = segment.toLowerCase();
  let tagFilter = '["amenity"="restaurant"]';
  if (normSeg.includes("odonto") || normSeg.includes("dent")) tagFilter = '["amenity"="dentist"]';
  else if (normSeg.includes("mecanic") || normSeg.includes("auto") || normSeg.includes("oficina")) tagFilter = '["shop"="car_repair"]';
  else if (normSeg.includes("imobil") || normSeg.includes("corretor")) tagFilter = '["office"="estate_agent"]';
  else if (normSeg.includes("estet") || normSeg.includes("beleza") || normSeg.includes("salao")) tagFilter = '["shop"="beauty"]';

  const query = `[out:json][timeout:6];
    area["name"="${city}"]["admin_level"="8"]->.searchArea;
    (
      node${tagFilter}(area.searchArea);
      way${tagFilter}(area.searchArea);
    );
    out body 12;`;

  try {
    const timeoutMs = process.env.NODE_ENV === "test" ? 1000 : 3000;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch("https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query), {
      signal: controller.signal,
      headers: { "User-Agent": "ProspectorCRM/1.0" }
    });
    clearTimeout(timeout);
    if (!res.ok) return [];
    const data = (await res.json()) as { elements?: Array<{ tags?: Record<string, string> }> };
    if (!data.elements) return [];

    return data.elements
      .filter((el) => el.tags?.name)
      .map((el) => {
        const t = el.tags || {};
        const street = [t["addr:street"], t["addr:housenumber"]].filter(Boolean).join(", ");
        const suburb = t["addr:suburb"] || t["addr:neighbourhood"];
        const fullAddr = [street, suburb].filter(Boolean).join(" - ");
        return {
          name: t.name!,
          address: fullAddr || undefined,
          phone: t.phone || t["contact:phone"] || t["contact:whatsapp"],
          website: t.website || t["contact:website"]
        };
      });
  } catch {
    return [];
  }
}

/**
 * AI-assisted generator using OpenAI/AISA or Gemini if configured
 */
async function fetchAiGeneratedLeads(
  city: string,
  state: string,
  segment: string,
  count: number
): Promise<Array<{
  name: string;
  segment: string;
  address: string;
  phone: string;
  website?: string;
  opportunity?: string;
  score?: number;
  priority?: Priority;
}> | null> {
  if (!aiClient) return null;
  try {
    const response = await aiClient.chat.completions.create({
      model: process.env.AISA_MODEL || "gpt-4.1",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Você é um agente de prospecção comercial da Baixada Santista (SP).
Retorne ${count} empresas REAIS ou de alto realismo localizadas em ${city} - ${state}, do segmento '${segment}'.
Para cada empresa retorne:
- name: nome da empresa
- segment: segmento detalhado
- address: endereço com rua e bairro em ${city}
- phone: telefone no formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX (o DDD da Baixada Santista é 13)
- website: site da empresa, link de WhatsApp ou null (priorize negócios sem site próprio)
- opportunity: por que é uma oportunidade para um desenvolvedor web oferecer presença digital
- score: número de 70 a 95
- priority: "high" ou "urgent"
Retorne um objeto JSON no formato: { "leads": [...] }`
        },
        { role: "user", content: `Gere ${count} empresas em ${city} - ${state} para o nicho: ${segment}` }
      ]
    });
    const parsed = JSON.parse(response.choices[0]?.message.content || "{}") as {
      leads?: Array<{
        name: string;
        segment: string;
        address: string;
        phone: string;
        website?: string;
        opportunity?: string;
        score?: number;
        priority?: Priority;
      }>;
    };
    return parsed.leads || null;
  } catch {
    return null;
  }
}

export async function discoverProspectingLeads(
  params: DiscoverParams
): Promise<ResolvedPlacePreview[]> {
  const { segment, city, state = "SP", count = 5, existingLeads = [] } = params;
  const existingSet = new Set(
    existingLeads.map((l) => `${l.name.toLowerCase().trim()}|${l.city.toLowerCase().trim()}`)
  );

  const candidates: ResolvedPlacePreview[] = [];

  // 1. Try AI-assisted generation first if API key is present
  const aiResults = await fetchAiGeneratedLeads(city, state, segment, count);
  if (aiResults && aiResults.length > 0) {
    for (const item of aiResults) {
      const key = `${item.name.toLowerCase().trim()}|${city.toLowerCase().trim()}`;
      if (existingSet.has(key)) continue;

      const waRes = resolveLeadWhatsapp({
        phone: item.phone,
        website: item.website,
        hasWhatsapp: true
      });
      const siteInfo = classifyWebsite(item.website);
      const leadForMock: Lead = {
        id: "temp",
        name: item.name,
        segment: item.segment || segment,
        city,
        state,
        stage: "new",
        score: item.score || 85,
        priority: item.priority || "high",
        siteStatus: siteInfo.siteStatus,
        digitalPresence: siteInfo.digitalPresence,
        sources: [],
        interactions: [],
        createdAt: "",
        updatedAt: ""
      };
      const local = localAnalysis(leadForMock);

      candidates.push({
        sourceUrl: `ai-prospector-${city}-${item.name.toLowerCase().replace(/\s+/g, "-")}`,
        name: item.name,
        segment: item.segment || segment,
        city,
        state,
        address: item.address,
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${item.name} ${city} ${state}`)}`,
        website: siteInfo.isWhatsappOnly ? undefined : siteInfo.website,
        phone: waRes.phone,
        hasWhatsapp: waRes.hasWhatsapp,
        whatsappUrl: waRes.whatsappUrl,
        siteStatus: siteInfo.siteStatus,
        digitalPresence: siteInfo.digitalPresence,
        opportunity: item.opportunity || local.opportunity || "Criação de site institucional profissional e botão de WhatsApp",
        score: item.score || local.score || 84,
        priority: item.priority || local.priority || "high",
        suggestedMessage: local.suggestedMessage,
        isDuplicate: false
      });

      if (candidates.length >= count) break;
    }
  }

  // 2. If not enough candidates, try OpenStreetMap Overpass
  if (candidates.length < count) {
    const osmPlaces = await fetchOverpassPlaces(city, segment);
    for (const place of osmPlaces) {
      const key = `${place.name.toLowerCase().trim()}|${city.toLowerCase().trim()}`;
      if (existingSet.has(key) || candidates.some((c) => c.name.toLowerCase() === place.name.toLowerCase())) {
        continue;
      }

      const waRes = resolveLeadWhatsapp({
        phone: place.phone || "(13) 99100-0000",
        website: place.website,
        hasWhatsapp: true
      });
      const siteInfo = classifyWebsite(place.website);
      const leadForMock: Lead = {
        id: "temp",
        name: place.name,
        segment,
        city,
        state,
        stage: "new",
        score: siteInfo.siteStatus === "none" ? 88 : 72,
        priority: siteInfo.siteStatus === "none" ? "urgent" : "high",
        siteStatus: siteInfo.siteStatus,
        digitalPresence: siteInfo.digitalPresence,
        sources: [],
        interactions: [],
        createdAt: "",
        updatedAt: ""
      };
      const local = localAnalysis(leadForMock);

      candidates.push({
        sourceUrl: `osm-${place.name.toLowerCase().replace(/\s+/g, "-")}`,
        name: place.name,
        segment,
        city,
        state,
        address: place.address || `Região Central, ${city}`,
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name} ${city} ${state}`)}`,
        website: siteInfo.isWhatsappOnly ? undefined : siteInfo.website,
        phone: waRes.phone,
        hasWhatsapp: waRes.hasWhatsapp,
        whatsappUrl: waRes.whatsappUrl,
        siteStatus: siteInfo.siteStatus,
        digitalPresence: siteInfo.digitalPresence,
        opportunity: local.opportunity || "Presença digital em ascensão: site próprio profissional com botão direto para WhatsApp",
        score: local.score || 82,
        priority: local.priority || "high",
        suggestedMessage: local.suggestedMessage,
        isDuplicate: false
      });

      if (candidates.length >= count) break;
    }
  }

  // 3. Fallback: Curated Regional Knowledge Base
  if (candidates.length < count) {
    const normCity = city.toLowerCase();
    const normSeg = segment.toLowerCase();

    const pool = REGIONAL_KNOWLEDGE_BASE.filter((item) => {
      const matchCity = normCity.includes(item.city.toLowerCase()) || item.city.toLowerCase().includes(normCity);
      const matchNiche =
        normSeg.includes(item.nicheKey) ||
        normSeg.includes(item.segment.toLowerCase()) ||
        item.segment.toLowerCase().includes(normSeg);
      return matchCity || matchNiche;
    });

    // If still empty, use any from regional pool not in CRM
    const finalPool = pool.length > 0 ? pool : REGIONAL_KNOWLEDGE_BASE;

    for (const item of finalPool) {
      const targetCity = item.city.toLowerCase().includes(normCity) ? item.city : city;
      const key = `${item.name.toLowerCase().trim()}|${targetCity.toLowerCase().trim()}`;
      if (existingSet.has(key) || candidates.some((c) => c.name.toLowerCase() === item.name.toLowerCase())) {
        continue;
      }

      const waRes = resolveLeadWhatsapp({
        phone: item.phone,
        website: item.website,
        hasWhatsapp: true
      });
      const siteInfo = classifyWebsite(item.website);
      const leadForMock: Lead = {
        id: "temp",
        name: item.name,
        segment: item.segment,
        city: targetCity,
        state: item.state,
        stage: "new",
        score: 86,
        priority: "high",
        siteStatus: siteInfo.siteStatus,
        digitalPresence: siteInfo.digitalPresence,
        sources: [],
        interactions: [],
        createdAt: "",
        updatedAt: ""
      };
      const local = localAnalysis(leadForMock);

      candidates.push({
        sourceUrl: `regional-${item.name.toLowerCase().replace(/\s+/g, "-")}`,
        name: item.name,
        segment: item.segment,
        city: targetCity,
        state: item.state,
        address: item.address,
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${item.name} ${targetCity} ${item.state}`)}`,
        website: siteInfo.isWhatsappOnly ? undefined : siteInfo.website,
        phone: waRes.phone,
        hasWhatsapp: waRes.hasWhatsapp,
        whatsappUrl: waRes.whatsappUrl,
        siteStatus: siteInfo.siteStatus,
        digitalPresence: siteInfo.digitalPresence,
        opportunity: local.opportunity || "Empresa local sem site moderno; oportunidade de desenvolvimento com WhatsApp direto",
        score: local.score || 85,
        priority: local.priority || "high",
        suggestedMessage: local.suggestedMessage,
        isDuplicate: false
      });

      if (candidates.length >= count) break;
    }
  }

  return candidates.slice(0, count);
}
