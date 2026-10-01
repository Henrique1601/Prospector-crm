import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe("endpoint HTTP do MCP", () => {
  const previousVercel = process.env.VERCEL;
  const previousKey = process.env.INTEGRATION_API_KEY;
  let app: Awaited<typeof import("./index.js")>["default"];

  beforeAll(async () => {
    process.env.VERCEL = "1";
    process.env.INTEGRATION_API_KEY = "mcp-test-key";
    app = (await import("./index.js")).default;
  });

  afterAll(() => {
    process.env.VERCEL = previousVercel;
    process.env.INTEGRATION_API_KEY = previousKey;
  });

  it("bloqueia clientes sem Bearer token", async () => {
    const response = await request(app).post("/api/mcp").send({});

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "Bearer token inválido ou ausente" });
  });

  it("aceita a negociação MCP autenticada pelo Express", async () => {
    const response = await request(app)
      .post("/api/mcp")
      .set("Authorization", "Bearer mcp-test-key")
      .set("Accept", "application/json, text/event-stream")
      .set("Content-Type", "application/json")
      .send({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2025-11-25",
          capabilities: {},
          clientInfo: { name: "prospector-http-test", version: "1.0.0" }
        }
      });

    expect(response.status).toBe(200);
    expect(response.text).toContain("prospector-crm");
  });
});
