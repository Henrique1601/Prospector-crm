import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const storePath = path.join(projectRoot, "apps", "api", "data", "store.json");
const outputPath = path.join(projectRoot, "Second Brain", "CRM Snapshot.md");
const labels = { new: "Novo", analyzed: "Analisado", contacted: "Contatado", replied: "Respondeu", meeting: "Reunião", proposal: "Proposta", won: "Fechado", lost: "Perdido" };

let leads = [];
try { leads = JSON.parse(await readFile(storePath, "utf8")).leads ?? []; }
catch { console.error("O banco local ainda não existe. Execute npm run dev uma vez e tente novamente."); process.exit(1); }

const counts = Object.fromEntries(Object.keys(labels).map((stage) => [stage, leads.filter((lead) => lead.stage === stage).length]));
const focus = [...leads].filter((lead) => lead.score > 0 && !["won", "lost"].includes(lead.stage)).sort((a, b) => b.score - a.score).slice(0, 8);
const followUps = leads.filter((lead) => lead.nextFollowUp).sort((a, b) => new Date(a.nextFollowUp) - new Date(b.nextFollowUp));
const generatedAt = new Date();
const md = `---
type: generated
source: Prospector CRM
generated: ${generatedAt.toISOString()}
tags:
  - crm
  - snapshot
---

# CRM Snapshot

> Gerado automaticamente em ${generatedAt.toLocaleString("pt-BR")}. Edite os leads no CRM e execute \`npm run brain:sync\` para atualizar.

## Funil

| Estágio | Quantidade |
|---|---:|
${Object.entries(labels).map(([stage, label]) => `| ${label} | ${counts[stage]} |`).join("\n")}

## Leads em foco

${focus.length ? focus.map((lead) => `- **${lead.name}** — score ${lead.score}, ${labels[lead.stage]} — ${lead.nextAction || "Definir próxima ação"}`).join("\n") : "Nenhum lead qualificado no momento."}

## Follow-ups agendados

${followUps.length ? followUps.map((lead) => `- ${new Date(lead.nextFollowUp).toLocaleDateString("pt-BR")} — **${lead.name}**`).join("\n") : "Nenhum follow-up agendado."}

## Indicadores rápidos

- Leads totais: **${leads.length}**
- Alta prioridade: **${leads.filter((lead) => ["high", "urgent"].includes(lead.priority)).length}**
- Contatos iniciados: **${leads.filter((lead) => !["new", "analyzed"].includes(lead.stage)).length}**
- Fechados: **${counts.won}**

Relacionadas: [[Prospector CRM Index]] · [[Weekly Review]] · [[Operating System]]
`;

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, md, "utf8");
console.log(`Second Brain atualizado: ${path.relative(projectRoot, outputPath)}`);
