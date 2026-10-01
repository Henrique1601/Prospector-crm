import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { createMcpHandler } from "@modelcontextprotocol/server";
import { afterEach, describe, expect, it } from "vitest";
import { buildMcpServer } from "./mcp.js";

describe("Prospector CRM MCP", () => {
  let client: Client | undefined;

  afterEach(async () => {
    await client?.close();
  });

  it("negocia o protocolo e publica as ferramentas do CRM", async () => {
    const handler = createMcpHandler(buildMcpServer);
    const transport = new StreamableHTTPClientTransport(new URL("http://test.local/api/mcp"), {
      fetch: (url, init) => handler.fetch(new Request(url, init))
    });
    client = new Client(
      { name: "prospector-mcp-test", version: "1.0.0" },
      { versionNegotiation: { mode: "auto" } }
    );

    await client.connect(transport);
    const tools = await client.listTools();

    expect(tools.tools.map((tool) => tool.name)).toEqual(["list_leads", "create_leads"]);
    expect(tools.tools.find((tool) => tool.name === "create_leads")?.inputSchema).toBeDefined();
  });

  it("consulta leads sem modificar o armazenamento", async () => {
    const handler = createMcpHandler(buildMcpServer);
    const transport = new StreamableHTTPClientTransport(new URL("http://test.local/api/mcp"), {
      fetch: (url, init) => handler.fetch(new Request(url, init))
    });
    client = new Client({ name: "prospector-mcp-test", version: "1.0.0" });

    await client.connect(transport);
    const result = await client.callTool({ name: "list_leads", arguments: { limit: 1 } });

    expect(result.isError).not.toBe(true);
    expect(result.structuredContent).toMatchObject({ count: 1 });
  });
});
