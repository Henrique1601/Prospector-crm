# ADR-0001: Arquitetura local-first com API separada

**Status:** Aceito  
**Data:** 2026-09-21  
**Decisor:** Henrique Bezerra

## Contexto

O produto precisa funcionar já no computador do usuário, sem exigir MongoDB ou uma chave de IA, mas deve suportar análises pagas e persistência mais robusta depois. Ações externas e gastos precisam continuar sob aprovação humana.

## Decisão

Usar React + Vite no painel e Express no backend, ambos em TypeScript. O backend persiste em JSON local por uma interface de repositório e encapsula a AIsa. Sem `AISA_API_KEY`, análises determinísticas permitem experimentar todo o fluxo sem custo.

## Consequências

- O primeiro uso exige apenas `npm install` e `npm run dev`.
- Segredos nunca chegam ao navegador.
- A camada de persistência poderá ser trocada por MongoDB/Postgres sem reescrever a interface.
- JSON local atende uso individual; acesso concorrente será revisado antes de uso em equipe.
