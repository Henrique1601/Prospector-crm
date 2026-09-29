#!/usr/bin/env node
/**
 * Prospector CRM - Google Maps Scraper CLI Helper
 * Usage:
 *   node scripts/scrape-maps.mjs [niche] [city]
 *   node scripts/scrape-maps.mjs "dentista" "Santos"
 *   npm run scrape:maps
 */

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const niche = args[0] || "clinica odontologica";
const city = args[1] || "Santos";

console.log("\n============================================================");
console.log("📍 PROSPECTOR CRM — GOOGLE MAPS SCRAPER QUERY GENERATOR");
console.log("============================================================");
console.log(`🎯 Nicho: ${niche}`);
console.log(`🏙️  Cidade Base: ${city}`);

const neighborhoodMap = {
  "Santos": ["Gonzaga", "Boqueirão", "Ponta da Praia", "Embaré", "Centro", "Vila Mathias", "Aparecida"],
  "São Vicente": ["Centro", "Itararé", "Gonzaguinha", "Cidade Náutica"],
  "Praia Grande": ["Boqueirão", "Canto do Forte", "Guilhermina", "Aviação"],
  "Guarujá": ["Pitangueiras", "Enseada", "Centro", "Vicente de Carvalho"],
  "Cubatão": ["Centro", "Vila Nova"],
  "Bertioga": ["Centro", "Riviera"]
};

const citiesToUse = [city, "Santos", "São Vicente", "Praia Grande"].filter(
  (c, idx, arr) => arr.indexOf(c) === idx
);

const queries = [];
for (const c of citiesToUse) {
  queries.push(`${niche} em ${c} SP`);
  const hoods = neighborhoodMap[c] || [];
  for (const h of hoods.slice(0, 3)) {
    queries.push(`${niche} ${c} ${h}`);
  }
}

const queriesContent = queries.join("\n");
const outDir = path.resolve(process.cwd(), "scraper-out");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const queriesPath = path.join(outDir, "queries.txt");
fs.writeFileSync(queriesPath, queriesContent, "utf8");

console.log(`\n✅ ${queries.length} queries geradas e salvas em:`);
console.log(`   ${queriesPath}\n`);

console.log("📋 Prévia das Queries:");
queries.forEach((q, idx) => console.log(`   ${idx + 1}. ${q}`));

const dockerCmd = `docker run --rm -v "${queriesPath}:/queries.txt:ro" -v "${outDir}:/out" gosom/google-maps-scraper -input /queries.txt -results /out/results.json -depth 1 -lang pt -json`;

console.log("\n🐳 Comando Docker Oficial para rodar o gosom/google-maps-scraper:");
console.log(`\n   ${dockerCmd}\n`);
console.log("💡 Dica:");
console.log("   Após o término da execução do scraper, importe o arquivo 'scraper-out/results.json'");
console.log("   diretamente no Prospector CRM através da aba '🗺️ Google Maps Scraper' no modal de importação!");
console.log("============================================================\n");
