import { describe, expect, it } from "vitest";
import {
  generateScraperQueries,
  parseGoogleMapsScraperCsv,
  parseGoogleMapsScraperInput,
  parseGoogleMapsScraperJsonl
} from "./scraper.js";
import type { Lead } from "./types.js";

describe("Parser de Resultados do Google Maps Scraper (JSON Lines)", () => {
  it("converte linhas JSONL do gosom/google-maps-scraper para leads enriquecidos", () => {
    const jsonl = `{"title":"Clínica Sorriso Gonzaga","category":"Clínica odontológica","phone":"+55 13 99712-3456","website":"https://sorrisogonzaga.com.br","address":"Av. Ana Costa, 200 - Gonzaga, Santos - SP, 11060-000","review_rating":4.9,"review_count":128,"link":"https://maps.google.com/?cid=12345","emails":["contato@sorrisogonzaga.com.br"]}
{"title":"Auto Mecânica Ponta da Praia","category":"Oficina mecânica","phone":"(13) 3261-1234","website":"","address":"R. Trabulsi, 50 - Ponta da Praia, Santos - SP","review_rating":4.6,"review_count":45,"link":"https://maps.google.com/?cid=67890"}
`;

    const previews = parseGoogleMapsScraperJsonl(jsonl);
    expect(previews.length).toBe(2);

    const lead1 = previews[0]!;
    expect(lead1.name).toBe("Clínica Sorriso Gonzaga");
    expect(lead1.segment).toBe("Clínica odontológica");
    expect(lead1.city).toBe("Santos");
    expect(lead1.state).toBe("SP");
    expect(lead1.hasWhatsapp).toBe(true);
    expect(lead1.whatsappUrl).toBe("https://wa.me/5513997123456");
    expect(lead1.siteStatus).toBe("good");

    const lead2 = previews[1]!;
    expect(lead2.name).toBe("Auto Mecânica Ponta da Praia");
    expect(lead2.city).toBe("Santos");
    expect(lead2.hasWhatsapp).toBe(true);
    expect(lead2.whatsappUrl).toBe("https://wa.me/551332611234");
    expect(lead2.siteStatus).toBe("none");
  });

  it("identifica duplicatas existentes no banco", () => {
    const existing: Lead[] = [
      {
        id: "lead-1",
        name: "Clínica Sorriso Gonzaga",
        segment: "Clínica odontológica",
        city: "Santos",
        state: "SP",
        stage: "new",
        score: 0,
        priority: "low",
        siteStatus: "unknown",
        digitalPresence: "unknown",
        sources: [],
        interactions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    const jsonl = `{"title":"Clínica Sorriso Gonzaga","city":"Santos","phone":"(13) 99123-4567"}
{"title":"Nova Clínica Boqueirão","city":"Santos","phone":"(13) 99888-7777"}
`;

    const previews = parseGoogleMapsScraperJsonl(jsonl, existing);
    expect(previews[0]?.isDuplicate).toBe(true);
    expect(previews[1]?.isDuplicate).toBe(false);
  });
});

describe("Parser de Resultados do Google Maps Scraper (CSV)", () => {
  it("mapeia colunas oficiais do scraper em CSV", () => {
    const csv = `title,category,phone,website,address,review_rating,review_count,emails,link
"Imobiliária Canto do Forte","Imobiliária","(13) 99744-1122","https://cantodoforte.com.br","Av. Mallet, 500 - Canto do Forte, Praia Grande - SP",4.8,92,"contato@cantodoforte.com.br","https://maps.google.com/?cid=111"
"Pizzaria do Gonzaga","Restaurante","(13) 3288-4455","","R. Floriano Peixoto, 40 - Gonzaga, Santos - SP",4.5,150,"","https://maps.google.com/?cid=222"
`;

    const previews = parseGoogleMapsScraperCsv(csv);
    expect(previews.length).toBe(2);

    const lead1 = previews[0]!;
    expect(lead1.name).toBe("Imobiliária Canto do Forte");
    expect(lead1.city).toBe("Praia Grande");
    expect(lead1.hasWhatsapp).toBe(true);
    expect(lead1.whatsappUrl).toBe("https://wa.me/5513997441122");
    expect(lead1.siteStatus).toBe("good");

    const lead2 = previews[1]!;
    expect(lead2.name).toBe("Pizzaria do Gonzaga");
    expect(lead2.city).toBe("Santos");
    expect(lead2.siteStatus).toBe("none");
  });
});

describe("Parser Universal (Auto-Detecção)", () => {
  it("detecta automaticamente JSON Lines", () => {
    const input = `{"title":"Empresa Teste A","phone":"(13) 99999-1111"}`;
    const previews = parseGoogleMapsScraperInput(input);
    expect(previews.length).toBe(1);
    expect(previews[0]?.name).toBe("Empresa Teste A");
  });

  it("detecta automaticamente CSV", () => {
    const input = `title,phone\nEmpresa Teste B,(13) 99999-2222`;
    const previews = parseGoogleMapsScraperInput(input);
    expect(previews.length).toBe(1);
    expect(previews[0]?.name).toBe("Empresa Teste B");
  });
});

describe("Gerador de Queries e Comandos do Scraper", () => {
  it("gera queries focadas por bairros para cidades da Baixada Santista", () => {
    const result = generateScraperQueries("clinica odontologica", ["Santos", "Praia Grande"]);

    expect(result.queries.length).toBeGreaterThan(4);
    expect(result.queriesText).toContain("clinica odontologica em Santos SP");
    expect(result.queriesText).toContain("clinica odontologica Santos Gonzaga");
    expect(result.queriesText).toContain("clinica odontologica em Praia Grande SP");
    expect(result.dockerCommand).toContain("gosom/google-maps-scraper");
    expect(result.dockerCommand).toContain("-input /queries.txt");
  });
});
