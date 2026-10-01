import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";
import { toNodeHandler } from "@modelcontextprotocol/node";
import { z } from "zod";
import { ingestLeads, ingestLeadsInput } from "./lead-ingestion.js";
import { readStore } from "./store.js";

const listLeadsInput = z.object({
  query: z.string().optional().describe("Busca por nome, segmento ou cidade"),
  stage: z.enum(["new", "analyzed", "contacted", "replied", "meeting", "proposal", "won", "lost"]).optional(),
  limit: z.number().int().min(1).max(100).default(25)
});

export function buildMcpServer() {
  const server = new McpServer(
    { name: "prospector-crm", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  server.registerTool(
    "list_leads",
    {
      title: "Listar leads do CRM",
      description: "Consulta leads já cadastrados para acompanhar o funil e evitar duplicidades.",
      inputSchema: listLeadsInput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async ({ query, stage, limit }) => {
      const store = await readStore();
      const normalizedQuery = query?.trim().toLowerCase();
      const leads = store.leads
        .filter((lead) => !stage || lead.stage === stage)
        .filter((lead) => !normalizedQuery || `${lead.name} ${lead.segment} ${lead.city}`.toLowerCase().includes(normalizedQuery))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      return {
        content: [{ type: "text", text: JSON.stringify({ count: leads.length, leads }) }],
        structuredContent: { count: leads.length, leads }
      };
    }
  );

  server.registerTool(
    "create_leads",
    {
      title: "Cadastrar leads no CRM",
      description: "Cadastra de 1 a 25 leads e ignora duplicidades por Maps, telefone ou nome e cidade.",
      inputSchema: ingestLeadsInput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async (input) => {
      const result = await ingestLeads(input);
      return {
        content: [{ type: "text", text: JSON.stringify(result) }],
        structuredContent: result
      };
    }
  );

  return server;
}

const mcpHandler = createMcpHandler(buildMcpServer);
export const handleMcpRequest = toNodeHandler(mcpHandler);
