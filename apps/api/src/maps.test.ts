import { describe, expect, it } from "vitest";
import {
  classifyWebsite,
  detectWhatsappAndPhone,
  inferSegmentFromName,
  parseMapsUrl
} from "./maps.js";

describe("Detecção de WhatsApp e Telefone", () => {
  it("reconhece celular brasileiro com 11 dígitos e gera link wa.me", () => {
    const res = detectWhatsappAndPhone("(13) 99712-3456");
    expect(res.hasWhatsapp).toBe(true);
    expect(res.phone).toBe("(13) 99712-3456");
    expect(res.whatsappUrl).toBe("https://wa.me/5513997123456");
  });

  it("reconhece celular com código de país +55", () => {
    const res = detectWhatsappAndPhone("+55 13 98111-2233");
    expect(res.hasWhatsapp).toBe(true);
    expect(res.whatsappUrl).toBe("https://wa.me/5513981112233");
  });

  it("identifica telefone fixo de 10 dígitos como sem WhatsApp", () => {
    const res = detectWhatsappAndPhone("(13) 3234-5678");
    expect(res.hasWhatsapp).toBe(false);
    expect(res.phone).toBe("(13) 3234-5678");
    expect(res.whatsappUrl).toBeUndefined();
  });

  it("trata telefone nulo ou vazio com segurança", () => {
    const res = detectWhatsappAndPhone("");
    expect(res.hasWhatsapp).toBe(false);
    expect(res.phone).toBeUndefined();
  });
});

describe("Classificação de Website", () => {
  it("marca ausência de site como 'none' e presença digital 'low'", () => {
    const res = classifyWebsite("");
    expect(res.siteStatus).toBe("none");
    expect(res.digitalPresence).toBe("low");
  });

  it("marca link apenas de rede social como 'weak'", () => {
    const res = classifyWebsite("https://instagram.com/barbearia_exemplo");
    expect(res.siteStatus).toBe("weak");
    expect(res.digitalPresence).toBe("medium");
  });

  it("marca site próprio com domínio institucional como 'good'", () => {
    const res = classifyWebsite("https://mecanicasilvajardim.com.br");
    expect(res.siteStatus).toBe("good");
    expect(res.digitalPresence).toBe("high");
  });
});

describe("Parser de URLs do Google Maps", () => {
  it("extrai nome e coordenadas de uma URL /maps/place", () => {
    const url = "https://www.google.com/maps/place/Barbearia+Tradicional+Vila+Mathias/@-23.9515,-46.3312,17z/data=!3m1!4b1";
    const res = parseMapsUrl(url);
    expect(res.name).toBe("Barbearia Tradicional Vila Mathias");
    expect(res.lat).toBe(-23.9515);
    expect(res.lng).toBe(-46.3312);
  });

  it("extrai termo de busca de uma URL de search", () => {
    const url = "https://www.google.com/maps/search/?api=1&query=Mecanica+Silva+Jardim+Santos+SP";
    const res = parseMapsUrl(url);
    expect(res.name).toBe("Mecanica Silva Jardim Santos SP");
  });
});

describe("Inferência de Segmento", () => {
  it("infere oficina mecânica a partir do nome", () => {
    expect(inferSegmentFromName("Mecânica Silva Jardim")).toBe("Oficina mecânica");
  });

  it("infere barbearia a partir do nome", () => {
    expect(inferSegmentFromName("Barber Club Santos")).toBe("Barbearia");
  });

  it("infere auto elétrica", () => {
    expect(inferSegmentFromName("Auto Elétrica Comendador Martins")).toBe("Auto elétrica");
  });
});
