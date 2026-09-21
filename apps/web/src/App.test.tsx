// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { vi, afterEach, describe, expect, it } from "vitest";
import { App } from "./App";

vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
  const url = String(input); const body = url.includes("dashboard") ? { total: 16, highPriority: 3, contacted: 0, replies: 0, won: 0, responseRate: 0, stages: {} } : url.includes("health") ? { ok: true, ai: false, mode: "local" } : [];
  return { ok: true, json: async () => body } as Response;
}));

afterEach(cleanup);

describe("App", () => {
  it("explica que ações externas dependem de revisão", async () => { render(<App />); expect(await screen.findByText(/Você revisa antes de qualquer contato/i)).toBeInTheDocument(); });
  it("mantém todas as opções principais disponíveis na navegação móvel", async () => { render(<App />); expect(await screen.findByRole("navigation", { name: "Navegação principal" })).toBeInTheDocument(); expect(screen.getAllByText("Visão geral").length).toBeGreaterThan(0); expect(screen.getAllByText("Leads").length).toBeGreaterThan(0); expect(screen.getAllByText("Follow-ups").length).toBeGreaterThan(0); expect(screen.getAllByText("Analytics").length).toBeGreaterThan(0); });
});
