---
type: architecture
status: current
tags:
  - engineering
  - architecture
---

# Architecture Map

```text
React + Vite
    │
    │ /api
    ▼
Express + TypeScript
    ├── JSON local (uso individual)
    ├── AIsa opcional (servidor)
    └── Regras de score e geração local

Second Brain (Obsidian)
    ▲
    └── npm run brain:sync
```

## Componentes atuais

- `apps/web`: painel, pipeline, filtros e ficha do lead.
- `apps/api`: API, regras de análise, geração de briefing e persistência.
- `apps/api/data/store.json`: estado operacional local e ignorado pelo Git.
- `Second Brain`: conhecimento de produto, decisões, rotinas e aprendizados.
- `scripts/sync-obsidian.mjs`: snapshot unilateral do CRM para o vault.

## Fronteira de dados

| Informação | Fonte de verdade |
|---|---|
| Estágio, score, contato, follow-up | CRM |
| Estratégia, hipótese, decisão | Obsidian |
| Documentação compartilhada futura | Notion |
| Chaves de API | `.env` local |

## Próxima evolução técnica

- Extrair interface de repositório e migrar o armazenamento para um banco transacional.
- Adicionar autenticação antes de qualquer implantação pública.
- Separar geração, custo e auditoria em uma entidade própria.
- Criar sincronização explícita e idempotente com o Notion somente para os objetos aprovados.

Relacionadas: [[Data Model]] · [[Decision Log]] · [[Notion Integration Plan]]
