---
type: integration
status: proposed
tags:
  - notion
  - integration
---

# Notion Integration Plan

## Papel proposto

Usar o Notion para informação estruturada que precise ser compartilhada, apresentada ou acompanhada fora do código. O Obsidian continua como espaço pessoal de raciocínio e conexão de ideias.

## Candidatos para a primeira implementação

1. **Roadmap do produto:** iniciativas, estado, prioridade e vínculo com decisões.
2. **Pesquisa com clientes:** entrevistas, hipóteses e evidências.
3. **Biblioteca de demonstrações:** briefing, status, URL e resultado comercial.
4. **Revisões semanais:** resumo, métricas, decisões e foco da próxima semana.

## Não sincronizar inicialmente

- Chaves, prompts internos sensíveis ou arquivos `.env`.
- Histórico completo de contatos.
- Dados pessoais que não sejam necessários.
- O mesmo campo com edição livre em CRM, Obsidian e Notion.

## Contrato de fonte de verdade

| Objeto | Fonte | Destino | Direção inicial |
|---|---|---|---|
| Lead operacional | CRM | Notion, se aprovado | CRM → Notion |
| Roadmap | Notion | Obsidian | Notion → snapshot |
| Decisões técnicas | Obsidian/Git | Notion | Obsidian → Notion |
| Revisão semanal | Obsidian | Notion | Obsidian → Notion |

## Decisões necessárias antes de conectar

- Quais bancos de dados serão criados.
- Se o Notion será pessoal ou compartilhado.
- Quais propriedades são obrigatórias.
- Qual é a direção de sincronização para cada objeto.
- Como conflitos e exclusões serão tratados.

Relacionadas: [[Architecture Map]] · [[Decision Log]] · [[Roadmap]]
