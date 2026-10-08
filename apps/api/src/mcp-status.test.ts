import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe("endpoints de status e teste do MCP", () => {
  const previousVercel = process.env.VERCEL;
  const previousKey = process.env.INTEGRATION_API_KEY;
  let app: Awaited<typeof import("./index.js")>["default"];

  beforeAll(async () => {
    process.env.VERCEL = "1";
    process.env.INTEGRATION_API_KEY = "test-secret-key-123";
    app = (await import("./index.js")).default;
  });

  afterAll(() => {
    process.env.VERCEL = previousVercel;
    process.env.INTEGRATION_API_KEY = previousKey;
  });

  it("retorna o status completo do servidor MCP com ferramentas ativas", async () => {
    const response = await request(app).get("/api/mcp/status");

    expect(response.status).toBe(200);
    expect(response.body.configured).toBe(true);
    expect(response.body.serverName).toBe("prospector-crm");
    expect(response.body.version).toBe("1.0.0");
    expect(response.body.endpoint).toBe("/api/mcp");
    expect(response.body.tools).toHaveLength(2);
    expect(response.body.tools.map((t: { name: string }) => t.name)).toEqual(["list_leads", "create_leads"]);
    expect(response.body.stats).toBeDefined();
    expect(typeof response.body.stats.totalLeads).toBe("number");
  });

  it("valida conexão com sucesso em /api/mcp/test-connection", async () => {
    const response = await request(app)
      .post("/api/mcp/test-connection")
      .send({ token: "test-secret-key-123" });

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.toolsAvailable).toEqual(["list_leads", "create_leads"]);
    expect(response.body.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it("rejeita token inválido em /api/mcp/test-connection", async () => {
    const response = await request(app)
      .post("/api/mcp/test-connection")
      .send({ token: "wrong-token" });

    expect(response.status).toBe(401);
    expect(response.body.ok).toBe(false);
  });
});
