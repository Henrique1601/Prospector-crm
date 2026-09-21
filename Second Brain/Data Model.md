---
type: reference
tags:
  - engineering
  - data
---

# Data Model

## Lead

Representa uma empresa no pipeline.

Campos centrais: identidade, segmento, localização, estágio, score, prioridade, presença digital, oportunidade, próxima ação, follow-up, fontes, interações e briefing de demonstração.

## Interaction

Evento registrado na relação com o lead: nota, WhatsApp, e-mail, ligação, reunião ou resposta. Deve guardar conteúdo e data.

## Task — planejado

Ação futura com prazo, responsável, estado e vínculo com um lead. A primeira implementação poderá derivar tarefas de `nextFollowUp`.

## Generation — planejado

Auditoria de uso de IA: tipo, prompt versionado, modelo, status, tokens, custo, hash de deduplicação, resultado e data.

## Regras de integridade

- Um lead não deve ser duplicado pela combinação normalizada de nome, cidade e contato.
- Toda afirmação pesquisada deve apontar para ao menos uma fonte.
- `siteStatus = none` exige pesquisa concluída; ausência de campo não significa ausência de site.
- Mudanças de estágio importantes devem gerar uma interação de sistema.

Relacionadas: [[Architecture Map]] · [[Agent And AI Guardrails]]
