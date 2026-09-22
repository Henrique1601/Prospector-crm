import type { Lead, ResolvedPlacePreview, SiteStatus } from "./types.js";

interface ParsedUrl {
  name?: string;
  lat?: number;
  lng?: number;
  query?: string;
  canonicalUrl: string;
}

export function cleanDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function extractWhatsappFromUrl(url?: string): {
  isWhatsapp: boolean;
  phone?: string;
  whatsappUrl?: string;
} {
  if (!url) return { isWhatsapp: false };
  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();

  if (
    lower.includes("wa.me") ||
    lower.includes("api.whatsapp.com") ||
    lower.includes("whatsapp.com/send") ||
    lower.includes("whatsapp://send")
  ) {
    let digits = cleanDigits(trimmed);
    if (digits.startsWith("55") && digits.length >= 12) {
      digits = digits.slice(2);
    }
    if (digits.length === 11) {
      const ddd = digits.slice(0, 2);
      const part1 = digits.slice(2, 7);
      const part2 = digits.slice(7);
      return {
        isWhatsapp: true,
        phone: `(${ddd}) ${part1}-${part2}`,
        whatsappUrl: `https://wa.me/55${digits}`
      };
    }
    if (digits.length === 10) {
      const ddd = digits.slice(0, 2);
      const part1 = digits.slice(2, 6);
      const part2 = digits.slice(6);
      return {
        isWhatsapp: true,
        phone: `(${ddd}) ${part1}-${part2}`,
        whatsappUrl: `https://wa.me/55${digits}`
      };
    }
    if (digits.length > 0) {
      return {
        isWhatsapp: true,
        phone: digits,
        whatsappUrl: `https://wa.me/${digits.startsWith("55") ? digits : `55${digits}`}`
      };
    }
    return {
      isWhatsapp: true,
      whatsappUrl: trimmed
    };
  }

  return { isWhatsapp: false };
}

export function detectWhatsappAndPhone(
  rawPhone?: string,
  possibleWebsite?: string
): {
  phone?: string;
  hasWhatsapp: boolean;
  whatsappUrl?: string;
} {
  // 1. Check if rawPhone is a WhatsApp link
  const fromPhoneUrl = extractWhatsappFromUrl(rawPhone);
  if (fromPhoneUrl.isWhatsapp && fromPhoneUrl.whatsappUrl) {
    return {
      phone: fromPhoneUrl.phone || rawPhone,
      hasWhatsapp: true,
      whatsappUrl: fromPhoneUrl.whatsappUrl
    };
  }

  // 2. Check if website is a WhatsApp link
  const fromWebUrl = extractWhatsappFromUrl(possibleWebsite);

  if (!rawPhone || !rawPhone.trim()) {
    if (fromWebUrl.isWhatsapp && fromWebUrl.whatsappUrl) {
      return {
        phone: fromWebUrl.phone,
        hasWhatsapp: true,
        whatsappUrl: fromWebUrl.whatsappUrl
      };
    }
    return { hasWhatsapp: false };
  }

  let digits = cleanDigits(rawPhone);
  if (digits.startsWith("55") && digits.length >= 12) {
    digits = digits.slice(2);
  }

  // 3. Brazilian mobile (11 digits: DDD + 9xxxxxxxx)
  if (digits.length === 11 && /^[1-9]{2}9\d{8}$/.test(digits)) {
    const ddd = digits.slice(0, 2);
    const part1 = digits.slice(2, 7);
    const part2 = digits.slice(7);
    return {
      phone: `(${ddd}) ${part1}-${part2}`,
      hasWhatsapp: true,
      whatsappUrl: `https://wa.me/55${digits}`
    };
  }

  // 4. Brazilian landline or commercial phone (10 digits: DDD + xxxxxxxx)
  // In Google Maps, companies rarely label numbers as WhatsApp. In Brazil, businesses
  // frequently use WhatsApp Business on landlines. We enable WhatsApp support so Henrique can contact with 1 click.
  if (digits.length === 10 && /^[1-9]{2}\d{8}$/.test(digits)) {
    const ddd = digits.slice(0, 2);
    const part1 = digits.slice(2, 6);
    const part2 = digits.slice(6);
    return {
      phone: `(${ddd}) ${part1}-${part2}`,
      hasWhatsapp: true,
      whatsappUrl: `https://wa.me/55${digits}`
    };
  }

  // 5. Fallback for other valid digit sequences >= 8 digits
  if (digits.length >= 8) {
    return {
      phone: rawPhone.trim(),
      hasWhatsapp: true,
      whatsappUrl: `https://wa.me/55${digits}`
    };
  }

  return {
    phone: rawPhone.trim(),
    hasWhatsapp: false
  };
}

export function classifyWebsite(website?: string): {
  siteStatus: SiteStatus;
  digitalPresence: "unknown" | "low" | "medium" | "high";
  website?: string;
  isWhatsappOnly?: boolean;
} {
  if (!website || !website.trim()) {
    return {
      siteStatus: "none",
      digitalPresence: "low",
      website: undefined
    };
  }

  const clean = website.trim();
  const lower = clean.toLowerCase();

  // Direct WhatsApp link placed in website field
  if (
    lower.includes("wa.me") ||
    lower.includes("api.whatsapp.com") ||
    lower.includes("chat.whatsapp.com")
  ) {
    return {
      siteStatus: "none",
      digitalPresence: "low",
      website: clean,
      isWhatsappOnly: true
    };
  }

  // Social profile only
  if (
    lower.includes("instagram.com") ||
    lower.includes("facebook.com") ||
    lower.includes("linktr.ee")
  ) {
    return {
      siteStatus: "weak",
      digitalPresence: "medium",
      website: clean
    };
  }

  return {
    siteStatus: "good",
    digitalPresence: "high",
    website: clean
  };
}

export async function expandMapsUrl(inputUrl: string): Promise<string> {
  const trimmed = inputUrl.trim();
  if (!trimmed.includes("goo.gl")) return trimmed;

  try {
    const response = await fetch(trimmed, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    return response.url || trimmed;
  } catch {
    return trimmed;
  }
}

export function parseMapsUrl(url: string): ParsedUrl {
  try {
    const parsed = new URL(url);

    // 1. /maps/place/{Name}/@{lat},{lng}...
    const placeMatch = parsed.pathname.match(/\/maps\/place\/([^/@]+)/);
    if (placeMatch && placeMatch[1]) {
      const name = decodeURIComponent(placeMatch[1].replace(/\+/g, " ")).trim();
      const coordsMatch = parsed.pathname.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      const lat = coordsMatch?.[1] ? parseFloat(coordsMatch[1]) : undefined;
      const lng = coordsMatch?.[2] ? parseFloat(coordsMatch[2]) : undefined;
      return { name, lat, lng, canonicalUrl: url };
    }

    // 2. /maps/search/{Query} or ?query= or ?q=
    const searchMatch = parsed.pathname.match(/\/maps\/search\/([^/@]+)/);
    const queryParam = parsed.searchParams.get("query") || parsed.searchParams.get("q");
    if (searchMatch?.[1] || queryParam) {
      const raw = searchMatch?.[1] || queryParam || "";
      const query = decodeURIComponent(raw.replace(/\+/g, " ")).trim();
      return { name: query, query, canonicalUrl: url };
    }

    return { canonicalUrl: url };
  } catch {
    return { canonicalUrl: url };
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<{
  address?: string;
  suburb?: string;
  city?: string;
  state?: string;
}> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      {
        signal: controller.signal,
        headers: {
          "User-Agent": "ProspectorCRM/1.0 (prospector@local.dev)",
          "Accept-Language": "pt-BR,pt;q=0.9"
        }
      }
    );
    clearTimeout(timeout);

    if (!response.ok) return {};
    const data = (await response.json()) as {
      address?: {
        road?: string;
        house_number?: string;
        suburb?: string;
        neighbourhood?: string;
        city_district?: string;
        city?: string;
        town?: string;
        municipality?: string;
        state?: string;
        "ISO3166-2-lvl4"?: string;
      };
    };

    const addr = data.address;
    if (!addr) return {};

    const street = [addr.road, addr.house_number].filter(Boolean).join(", ");
    const suburb = addr.suburb || addr.neighbourhood || addr.city_district;
    const city = addr.city || addr.town || addr.municipality || "Santos";
    const stateRaw = addr["ISO3166-2-lvl4"]?.replace("BR-", "") || addr.state || "SP";
    const state = stateRaw.length === 2 ? stateRaw.toUpperCase() : "SP";

    const fullAddress = [street, suburb].filter(Boolean).join(" - ");

    return {
      address: fullAddress || undefined,
      suburb,
      city,
      state
    };
  } catch {
    return {};
  }
}

interface PlacesNewResponse {
  places?: Array<{
    displayName?: { text?: string };
    formattedAddress?: string;
    nationalPhoneNumber?: string;
    internationalPhoneNumber?: string;
    websiteUri?: string;
    primaryTypeDisplayName?: { text?: string };
    types?: string[];
    googleMapsUri?: string;
    businessStatus?: string;
  }>;
}

export async function fetchFromGooglePlacesApi(
  query: string,
  apiKey: string
): Promise<Partial<ResolvedPlacePreview> | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.internationalPhoneNumber,places.websiteUri,places.primaryTypeDisplayName,places.types,places.googleMapsUri,places.businessStatus"
      },
      body: JSON.stringify({
        textQuery: query,
        languageCode: "pt-BR"
      })
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const json = (await res.json()) as PlacesNewResponse;
    const place = json.places?.[0];
    if (!place) return null;

    const name = place.displayName?.text || query;
    const phoneInfo = detectWhatsappAndPhone(
      place.nationalPhoneNumber || place.internationalPhoneNumber,
      place.websiteUri
    );
    const siteInfo = classifyWebsite(place.websiteUri);
    const segment = place.primaryTypeDisplayName?.text || "Comércio local";

    // Extract city and state from formattedAddress: e.g. "R. Lucas Fortunato, 123 - Vila Mathias, Santos - SP, 11015-530"
    let city = "Santos";
    let state = "SP";
    if (place.formattedAddress) {
      const match = place.formattedAddress.match(/([^,-]+)\s*-\s*([A-Z]{2})/);
      if (match?.[1] && match[2]) {
        city = match[1].trim();
        state = match[2].trim();
      }
    }

    return {
      name,
      segment,
      city,
      state,
      address: place.formattedAddress,
      mapsUrl: place.googleMapsUri,
      website: siteInfo.isWhatsappOnly ? undefined : siteInfo.website,
      phone: phoneInfo.phone,
      hasWhatsapp: phoneInfo.hasWhatsapp,
      whatsappUrl: phoneInfo.whatsappUrl,
      siteStatus: siteInfo.siteStatus,
      digitalPresence: siteInfo.digitalPresence
    };
  } catch {
    return null;
  }
}

export function inferSegmentFromName(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("mecânica") || lower.includes("mecanica") || lower.includes("oficina")) return "Oficina mecânica";
  if (lower.includes("auto elétrica") || lower.includes("auto eletrica") || lower.includes("baterias")) return "Auto elétrica";
  if (lower.includes("barbearia") || lower.includes("barber")) return "Barbearia";
  if (lower.includes("salão") || lower.includes("salao") || lower.includes("beleza") || lower.includes("estética")) return "Beleza e estética";
  if (lower.includes("marmitaria") || lower.includes("restaurante") || lower.includes("pizzaria") || lower.includes("lanchonete")) return "Restaurante";
  if (lower.includes("despachante")) return "Despachante";
  if (lower.includes("chaveiro")) return "Chaveiro";
  if (lower.includes("marcenaria") || lower.includes("móveis") || lower.includes("planejados")) return "Móveis planejados";
  if (lower.includes("pet") || lower.includes("veterinár") || lower.includes("vet")) return "Pet shop / Veterinária";
  if (lower.includes("academia") || lower.includes("crossfit") || lower.includes("fitness")) return "Academia";
  if (lower.includes("odont") || lower.includes("dentista")) return "Odontologia";
  if (lower.includes("clínica") || lower.includes("clinica") || lower.includes("médic")) return "Saúde / Clínica";
  if (lower.includes("advoc") || lower.includes("advogado") || lower.includes("jurídic")) return "Advocacia";
  if (lower.includes("contábil") || lower.includes("contabil") || lower.includes("contabilidade")) return "Contabilidade";
  return "Serviços locais";
}

export async function resolveMapsLink(
  rawUrl: string,
  existingLeads: Lead[] = []
): Promise<ResolvedPlacePreview> {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return {
      sourceUrl: rawUrl,
      name: "",
      segment: "Serviços locais",
      city: "Santos",
      state: "SP",
      mapsUrl: rawUrl,
      siteStatus: "unknown",
      digitalPresence: "unknown",
      error: "Link vazio"
    };
  }

  // 1. Expand shortlink
  const canonicalUrl = await expandMapsUrl(trimmed);
  const parsed = parseMapsUrl(canonicalUrl);

  const fallbackName = parsed.name || "Empresa sem nome identificado";
  let placeData: Partial<ResolvedPlacePreview> | null = null;

  // 2. If Google Maps API Key is provided, use Google Places API (New)
  const gmpKey = process.env.GOOGLE_MAPS_API_KEY;
  if (gmpKey && parsed.name) {
    placeData = await fetchFromGooglePlacesApi(parsed.name, gmpKey);
  }

  // 3. Fallback: Reverse Geocoding with OpenStreetMap if coordinates exist
  let address = placeData?.address;
  let city = placeData?.city || "Santos";
  let state = placeData?.state || "SP";

  if (!placeData && parsed.lat && parsed.lng) {
    const geo = await reverseGeocode(parsed.lat, parsed.lng);
    if (geo.address) address = geo.address;
    if (geo.city) city = geo.city;
    if (geo.state) state = geo.state;
  }

  const name = placeData?.name || fallbackName;
  const segment = placeData?.segment || inferSegmentFromName(name);
  const rawWebsite = placeData?.website;
  const siteInfo = classifyWebsite(rawWebsite);
  const phoneInfo = detectWhatsappAndPhone(placeData?.phone, rawWebsite);

  // 4. Duplicate Detection
  const normName = name.toLowerCase().trim();
  const existingDuplicate = existingLeads.find((lead) => {
    if (lead.mapsUrl && (lead.mapsUrl === trimmed || lead.mapsUrl === canonicalUrl)) {
      return true;
    }
    const leadNorm = lead.name.toLowerCase().trim();
    return leadNorm === normName && lead.city.toLowerCase() === city.toLowerCase();
  });

  return {
    sourceUrl: trimmed,
    name,
    segment,
    city,
    state,
    address,
    mapsUrl: placeData?.mapsUrl || canonicalUrl,
    website: siteInfo.isWhatsappOnly ? undefined : siteInfo.website,
    phone: phoneInfo.phone,
    hasWhatsapp: phoneInfo.hasWhatsapp,
    whatsappUrl: phoneInfo.whatsappUrl,
    siteStatus: siteInfo.siteStatus,
    digitalPresence: siteInfo.digitalPresence,
    isDuplicate: Boolean(existingDuplicate),
    duplicateReason: existingDuplicate
      ? `Já cadastrado no estágio "${existingDuplicate.stage}"`
      : undefined
  };
}

export async function resolveMultipleMapsLinks(
  urls: string[],
  existingLeads: Lead[] = []
): Promise<ResolvedPlacePreview[]> {
  const uniqueUrls = [...new Set(urls.map((u) => u.trim()).filter((u) => u.length > 0))];
  const results: ResolvedPlacePreview[] = [];

  // Process in small batches of 3 to avoid overwhelming external networks/APIs
  const batchSize = 3;
  for (let i = 0; i < uniqueUrls.length; i += batchSize) {
    const slice = uniqueUrls.slice(i, i + batchSize);
    const chunkResults = await Promise.all(slice.map((url) => resolveMapsLink(url, existingLeads)));
    results.push(...chunkResults);
  }

  return results;
}
