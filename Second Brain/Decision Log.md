---
type: decisions
tags:
  - architecture
  - decisions
---

# Decision Log

## 2026-09-21 — Arquitetura local-first

**Decisão:** React/Vite + Express/TypeScript, persistência JSON no primeiro uso e AIsa opcional no backend.

**Motivo:** permitir valor imediato sem depender de banco ou consumo de IA.

**Revisar quando:** houver implantação pública, equipe ou concorrência de escrita.

## 2026-09-21 — Humano no controle do contato

**Decisão:** o sistema prepara, mas não envia mensagens automaticamente.

**Motivo:** proteger reputação, evitar spam e garantir revisão dos fatos.

## 2026-09-21 — Obsidian como camada de conhecimento

**Decisão:** dados operacionais ficam no CRM; decisões e aprendizados ficam no vault.

**Motivo:** impedir que notas e banco do produto disputem a fonte de verdade.

## 2026-10-16 — Manutenção da Prospecção Assistida em 1-Clique (Opção A) vs Disparo Automático

**Decisão:** Manter a **Opção A** (Prospecção Assistida em 1-Clique). A IA qualifica o lead, diagnostica o site, calcula a perda invisível, gera o prompt de demonstração e monta a mensagem personalizada; Henrique revisa em 2 segundos e clica no link direto do WhatsApp (`wa.me`) para abrir e enviar pelo WhatsApp Web ou smartphone.

**Contexto:** Consulta sobre a possibilidade de a IA enviar mensagens 100% automáticas para as empresas via Evolution API / n8n.

**Alternativas consideradas:**
- Disparo 100% automático direto: rejeitado pelo risco crítico de banimento do número oficial `(13) 99138-3222` pelos algoritmos anti-spam da Meta, risco de queimar a reputação do desenvolvedor na Baixada Santista com spam e incompatibilidade com telefones fixos.
- Fila semi-automatizada em lote com chip secundário dedicado (Opção B): viável tecnicamente, porém descartada no momento para priorizar qualidade de abordagem e fechamento de alto ticket sem custos extras de infraestrutura/chips.

**Consequências:**
- Proteção total do número oficial de WhatsApp de Henrique contra banimentos.
- Taxa de conversão elevada por manter abordagem consultiva e humana.
- Cumprimento rigoroso do Princípio Human-in-the-Loop do [[Agent And AI Guardrails]] e `AGENTS.md`.

## Modelo para novas decisões

**Data — Título**

**Decisão:**  
**Contexto:**  
**Alternativas consideradas:**  
**Consequências:**  
**Revisar quando:**

Relacionadas: [[Architecture Map]] · [[Product Vision]] · [[Sales Playbook]] · [[Agent And AI Guardrails]]

