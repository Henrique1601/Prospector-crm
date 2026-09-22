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

Na Vercel, o armazenamento da API usa `/tmp` e portanto é temporário: pode ser apagado entre execuções ou novos deploys. Antes de usar o CRM como fonte de verdade em produção, conecte um banco persistente e mantenha a URL de conexão somente nas variáveis de ambiente da Vercel.
