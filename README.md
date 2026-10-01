# Prospector CRM

CRM pessoal de prospecção para Henrique Bezerra: organiza empresas, prioriza oportunidades digitais, prepara abordagens e briefings de demonstração e acompanha follow-ups. Nenhuma mensagem é enviada automaticamente.

## Rodar localmente

Requisitos: Node.js 20+.

```bash
npm install
npm run dev
```

- Painel: http://localhost:5173
- API: http://localhost:3333/api/health

O banco local é criado automaticamente em `apps/api/data/store.json`. Para ativar análises com AIsa, copie `.env.example` para `.env`, use uma chave nova e mantenha-a somente no seu computador.

## Segundo cérebro no Obsidian

Abra a pasta `Second Brain` como um vault no Obsidian. A nota inicial é `Prospector CRM Index.md`.

Para atualizar o retrato do funil dentro do vault:

```bash
npm run brain:sync
```

O CRM continua sendo a fonte de verdade dos leads. O Obsidian guarda estratégia, decisões, pesquisas, rotinas e aprendizados.

## Fluxo principal

`Novo → Analisado → Contatado → Respondeu → Reunião → Proposta → Fechado/Perdido`

O agente prepara pesquisa, score, abordagem e demonstração. O contato com a empresa continua dependendo da revisão do usuário.

## Publicar na Vercel

O monorepo usa dois projetos:

- `web`: Root Directory `apps/web`, Framework Preset `Vite` e variável `VITE_API_URL` apontando para a URL pública da API.
- `api-prospector`: Root Directory `apps/api`. O arquivo `index.ts` exporta o Express como Vercel Function e o `vercel.json` encaminha todas as rotas para essa função.

Em produção, a API usa Lakebase Postgres no Neon quando `DATABASE_URL` está configurada. A migração versionada está em `apps/api/migrations`. Sem essa variável, o desenvolvimento local continua usando `apps/api/data/store.json`; na Vercel, o fallback é temporário e aparece claramente na interface.

## Integração segura de leads

Automações externas devem usar exclusivamente `POST /api/integrations/leads`. O endpoint exige `Authorization: Bearer <INTEGRATION_API_KEY>`, aceita até 25 leads por chamada e ignora duplicatas por URL do Maps, telefone ou combinação de nome e cidade.

Configure `INTEGRATION_API_KEY` apenas nas variáveis protegidas da API na Vercel. O endpoint falha de forma segura com `503` quando a chave não está configurada e nunca deve receber a chave pelo frontend.

```bash
curl -X POST "$API_URL/api/integrations/leads" \
  -H "Authorization: Bearer $INTEGRATION_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"autoAnalyze":false,"leads":[{"name":"Empresa Exemplo","segment":"Oficina","city":"Santos","state":"SP","mapsUrl":"https://maps.google.com/..."}]}'
```

## Conector MCP

O CRM também disponibiliza um servidor MCP remoto em `https://api-prospector-delta.vercel.app/api/mcp`. Ele usa Streamable HTTP stateless e exige o mesmo cabeçalho `Authorization: Bearer <INTEGRATION_API_KEY>`.

Ferramentas publicadas:

- `list_leads`: consulta o funil por texto, estágio e limite;
- `create_leads`: cadastra até 25 empresas e reutiliza a deduplicação da API segura.

A chave deve ser configurada no cliente MCP como credencial Bearer e nunca incluída na URL, no frontend ou no repositório.
