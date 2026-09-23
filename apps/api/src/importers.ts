import { classifyWebsite, detectWhatsappAndPhone, inferSegmentFromName } from "./maps.js";
import type { Lead, ResolvedPlacePreview } from "./types.js";

/**
 * Parses CSV lines taking quotes, commas, semicolons and tabs into account.
 */
export function parseCsvRows(text: string): string[][] {
  const clean = text.replace(/^\uFEFF/, ""); // Remove BOM
  const lines = clean.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (!lines.length) return [];

  // Detect delimiter from sample text ignoring quotes
  const sample = lines.slice(0, 5).join("\n");
  const unquoted = sample.replace(/"(?:[^"]|"")*"/g, "");
  const commaCount = (unquoted.match(/,/g) || []).length;
  const semicolonCount = (unquoted.match(/;/g) || []).length;
  const tabCount = (unquoted.match(/\t/g) || []).length;

  let delimiter = ",";
  if (semicolonCount > commaCount && semicolonCount >= tabCount) {
    delimiter = ";";
  } else if (tabCount > commaCount && tabCount > semicolonCount) {
    delimiter = "\t";
  }


  const rows: string[][] = [];

  for (const line of lines) {
    const row: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        row.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    row.push(current.trim());
    if (row.some((cell) => cell.length > 0)) {
      rows.push(row);
    }
  }

  return rows;
}

function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Converts CSV content into normalized lead preview items.
 */
export function parseCsvToLeads(
  content: string,
  existingLeads: Lead[] = []
): ResolvedPlacePreview[] {
  const rows = parseCsvRows(content);
  if (!rows.length) return [];

  // Check if first row is header
  const firstRow = rows[0] || [];
  const normalizedHeaders = firstRow.map(normalizeHeader);

  // Field mapping
  const colIndex: {
    name?: number;
    segment?: number;
    city?: number;
    state?: number;
    address?: number;
    phone?: number;
    website?: number;
    mapsUrl?: number;
  } = {};

  normalizedHeaders.forEach((h, idx) => {
    if (["nome", "name", "empresa", "company", "razaosocial", "razao", "fantasia"].includes(h)) {
      if (colIndex.name === undefined) colIndex.name = idx;
    } else if (["segmento", "segment", "categoria", "category", "ramo", "atividade", "tipo"].includes(h)) {
      if (colIndex.segment === undefined) colIndex.segment = idx;
    } else if (["cidade", "city", "municipio"].includes(h)) {
      if (colIndex.city === undefined) colIndex.city = idx;
    } else if (["uf", "estado", "state"].includes(h)) {
      if (colIndex.state === undefined) colIndex.state = idx;
    } else if (["endereco", "address", "rua", "logradouro", "local"].includes(h)) {
      if (colIndex.address === undefined) colIndex.address = idx;
    } else if (["telefone", "phone", "whatsapp", "celular", "contato", "tel"].includes(h)) {
      if (colIndex.phone === undefined) colIndex.phone = idx;
    } else if (["site", "website", "url", "pagina", "web"].includes(h)) {
      if (colIndex.website === undefined) colIndex.website = idx;
    } else if (["maps", "googlemaps", "mapsurl", "link"].includes(h)) {
      if (colIndex.mapsUrl === undefined) colIndex.mapsUrl = idx;
    }
  });

  const hasHeader = colIndex.name !== undefined;
  const dataRows = hasHeader ? rows.slice(1) : rows;

  return dataRows.map((row, idx) => {
    let name = "";
    let segment = "";
    let city = "Santos";
    let state = "SP";
    let address: string | undefined = undefined;
    let phone: string | undefined = undefined;
    let website: string | undefined = undefined;
    let mapsUrl: string | undefined = undefined;

    if (hasHeader) {
      const rowName = colIndex.name !== undefined ? row[colIndex.name] : undefined;
      const rowSegment = colIndex.segment !== undefined ? row[colIndex.segment] : undefined;
      const rowCity = colIndex.city !== undefined ? row[colIndex.city] : undefined;
      const rowState = colIndex.state !== undefined ? row[colIndex.state] : undefined;

      name = rowName || "";
      segment = rowSegment || "";
      city = rowCity || "Santos";
      state = rowState ? rowState.slice(0, 2).toUpperCase() : "SP";
      address = colIndex.address !== undefined ? row[colIndex.address] : undefined;
      phone = colIndex.phone !== undefined ? row[colIndex.phone] : undefined;
      website = colIndex.website !== undefined ? row[colIndex.website] : undefined;
      mapsUrl = colIndex.mapsUrl !== undefined ? row[colIndex.mapsUrl] : undefined;
    } else {

      // Fallback: positional mapping or single company name per line
      name = row[0] || `Empresa ${idx + 1}`;
      segment = row[1] || "";
      city = row[2] || "Santos";
      state = row[3] || "SP";
      phone = row[4];
      website = row[5];
    }

    if (!segment && name) {
      segment = inferSegmentFromName(name);
    }

    const phoneInfo = detectWhatsappAndPhone(phone, website);
    const siteInfo = classifyWebsite(website);

    // Duplicate check
    const normName = name.toLowerCase().trim();
    const isDuplicate = existingLeads.some((lead) => {
      if (mapsUrl && lead.mapsUrl === mapsUrl) return true;
      return lead.name.toLowerCase().trim() === normName && lead.city.toLowerCase() === city.toLowerCase();
    });

    return {
      sourceUrl: mapsUrl || `csv-row-${idx + 1}`,
      name: name || `Empresa sem nome`,
      segment: segment || "Serviços locais",
      city: city || "Santos",
      state: state || "SP",
      address,
      mapsUrl: mapsUrl || "",
      website: siteInfo.isWhatsappOnly ? undefined : siteInfo.website,
      phone: phoneInfo.phone,
      hasWhatsapp: phoneInfo.hasWhatsapp,
      whatsappUrl: phoneInfo.whatsappUrl,
      siteStatus: siteInfo.siteStatus,
      digitalPresence: siteInfo.digitalPresence,
      isDuplicate,
      duplicateReason: isDuplicate ? "Já cadastrado na base" : undefined
    };
  });
}

interface NotionProperty {
  type?: string;
  title?: Array<{ plain_text?: string }>;
  rich_text?: Array<{ plain_text?: string }>;
  select?: { name?: string };
  phone_number?: string;
  url?: string;
  email?: string;
}

interface NotionPage {
  id: string;
  url?: string;
  properties: Record<string, NotionProperty>;
}

interface NotionDatabaseResponse {
  results: NotionPage[];
  has_more: boolean;
  next_cursor?: string;
}

function extractNotionText(prop?: NotionProperty): string | undefined {
  if (!prop) return undefined;
  if (prop.type === "title" && prop.title?.length) {
    return prop.title.map((t) => t.plain_text || "").join("").trim();
  }
  if (prop.type === "rich_text" && prop.rich_text?.length) {
    return prop.rich_text.map((t) => t.plain_text || "").join("").trim();
  }
  if (prop.type === "select" && prop.select?.name) {
    return prop.select.name.trim();
  }
  if (prop.type === "phone_number" && prop.phone_number) {
    return prop.phone_number.trim();
  }
  if (prop.type === "url" && prop.url) {
    return prop.url.trim();
  }
  if (prop.type === "email" && prop.email) {
    return prop.email.trim();
  }
  return undefined;
}

/**
 * Queries Notion API database and maps pages into CRM leads.
 */
export async function fetchNotionDatabase(
  apiKey?: string,
  databaseId?: string,
  existingLeads: Lead[] = []
): Promise<ResolvedPlacePreview[]> {
  const token = apiKey || process.env.NOTION_API_KEY;
  const dbId = (databaseId || process.env.NOTION_DATABASE_ID || "").replace(/-/g, "").trim();

  if (!token) throw new Error("Chave do Notion (NOTION_API_KEY) não informada.");
  if (!dbId) throw new Error("ID do Banco de Dados do Notion (NOTION_DATABASE_ID) não informado.");

  const response = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ page_size: 100 })
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    throw new Error(errJson.message || `Falha ao conectar no Notion (${response.status})`);
  }

  const data = (await response.json()) as NotionDatabaseResponse;
  const leads: ResolvedPlacePreview[] = [];

  for (const page of data.results) {
    const props = page.properties;
    let name = "";
    let segment = "";
    let city = "Santos";
    let state = "SP";
    let address: string | undefined = undefined;
    let phone: string | undefined = undefined;
    let website: string | undefined = undefined;
    let mapsUrl: string | undefined = undefined;

    // Scan all properties by name (tolerant match)
    for (const [key, val] of Object.entries(props)) {
      const normKey = normalizeHeader(key);
      const textVal = extractNotionText(val);
      if (!textVal) continue;

      if (val.type === "title" || ["nome", "name", "empresa", "company"].includes(normKey)) {
        if (!name) name = textVal;
      } else if (["segmento", "segment", "categoria", "ramo"].includes(normKey)) {
        if (!segment) segment = textVal;
      } else if (["cidade", "city", "municipio"].includes(normKey)) {
        city = textVal;
      } else if (["uf", "estado", "state"].includes(normKey)) {
        state = textVal.slice(0, 2).toUpperCase();
      } else if (["endereco", "address", "rua"].includes(normKey)) {
        address = textVal;
      } else if (["telefone", "phone", "whatsapp", "celular", "contato"].includes(normKey)) {
        phone = textVal;
      } else if (["site", "website", "url"].includes(normKey)) {
        website = textVal;
      } else if (["maps", "googlemaps", "link"].includes(normKey)) {
        mapsUrl = textVal;
      }
    }

    if (!name) continue;
    if (!segment) segment = inferSegmentFromName(name);

    const phoneInfo = detectWhatsappAndPhone(phone, website);
    const siteInfo = classifyWebsite(website);

    const normName = name.toLowerCase().trim();
    const isDuplicate = existingLeads.some((lead) => {
      if (mapsUrl && lead.mapsUrl === mapsUrl) return true;
      return lead.name.toLowerCase().trim() === normName && lead.city.toLowerCase() === city.toLowerCase();
    });

    leads.push({
      sourceUrl: mapsUrl || page.url || `notion-${page.id}`,
      name,
      segment,
      city,
      state,
      address,
      mapsUrl: mapsUrl || page.url || "",
      website: siteInfo.isWhatsappOnly ? undefined : siteInfo.website,
      phone: phoneInfo.phone,
      hasWhatsapp: phoneInfo.hasWhatsapp,
      whatsappUrl: phoneInfo.whatsappUrl,
      siteStatus: siteInfo.siteStatus,
      digitalPresence: siteInfo.digitalPresence,
      isDuplicate,
      duplicateReason: isDuplicate ? "Já existe no CRM" : undefined
    });
  }

  return leads;
}
