---
type: integration
project: Prospector CRM
status: active
updated: 2026-10-14
tags:
  - n8n
  - automacao
  - evolution-api
  - apify
  - whatsapp
---

# Integração n8n & Automações Comerciais

Esta nota documenta a arquitetura de automação assíncrona do **Prospector CRM** conectado ao **n8n**, à **Evolution API** (WhatsApp) e ao **Apify** (Google Maps).

---

## 🧭 Princípio Operacional Central

Conforme documentado em [[Agent And AI Guardrails]], a regra fundamental da operação comercial de Henrique é:
> **A IA e os robôs coletam, estruturam, diagnosticam e notificam; o humano decide, valida e envia.**

Nenhum robô no n8n dispara mensagens frias de venda ou propostas sem que Henrique abra a ficha do lead e clique explicitamente no WhatsApp.

---

## ⚡ Os 3 Workflows Estratégicos

### 1. Resumo Matinal no WhatsApp (08:30)
- **Arquivo:** `integrations/n8n/workflow-1-followup-digest.json`
- **Gatilho:** Cron de segunda a sexta às 08:30.
- **Funcionamento:**
  1. O n8n faz `GET /api/leads`.
  2. Filtra leads que possuem `nextFollowUp` marcado para a data de hoje.
  3. Identifica leads que responderam recentemente (`stage = 'replied'`) e oportunidades quentes.
  4. Envia mensagem formatada com links diretos no WhatsApp de Henrique `(13) 99138-3222`.

### 2. Auto-Atualização de Estágio ao Receber Resposta do Lead
- **Arquivo:** `integrations/n8n/workflow-2-whatsapp-replies.json`
- **Gatilho:** Webhook da Evolution API ouvindo evento `MESSAGES_UPSERT`.
- **Funcionamento:**
  1. Filtra para processar apenas mensagens de clientes (ignora grupos `@g.us` e mensagens enviadas por Henrique `fromMe: true`).
  2. Consulta a API do CRM (`GET /api/leads?phone=...`).
  3. Ao encontrar o lead:
     - Dispara `PATCH /api/leads/:id/stage` para mover o card para o estágio **"Respondeu"** (`replied`).
     - Dispara `POST /api/leads/:id/interactions` registrando a mensagem recebida no histórico.
     - Envia um alerta push com som no WhatsApp de Henrique com o nome da empresa, a mensagem e o link de 1 clique para abrir o CRM.

### 3. Scraper Periódico de Nichos no Google Maps (Apify)
- **Arquivo:** `integrations/n8n/workflow-3-apify-gmaps-prospector.json`
- **Gatilho:** Cron semanal (Segunda-feira 08:00) ou execução manual por nicho.
- **Funcionamento:**
  1. Define a busca local (ex: *"Clínica Odontológica em Santos SP"*, *"Oficina Mecânica em Santos"*).
  2. Roda o ator `compass/crawler-google-places` da Apify.
  3. Envia os resultados via loop para o webhook do CRM (`POST /api/webhooks/lead`).
  4. O CRM roda a **Gemini AI** automaticamente para:
     - Detectar presença de site e WhatsApp.
     - Calcular o **Score de Conversão (0-100)**.
     - Gerar as 3 variações de roteiro de abordagem.
  5. Notifica Henrique no WhatsApp com o total de novos leads prontos para abordagem.

---

## 🔗 Endpoints do CRM Consumidos pelo n8n

| Ação | Método | Rota | Descrição |
| :--- | :--- | :--- | :--- |
| **Buscar Leads** | `GET` | `/api/leads?phone={numero}` ou `?q={termo}` | Busca rápida por telefone normalizado ou nome |
| **Atualizar Estágio** | `PATCH` | `/api/leads/:id/stage` | Atualiza estágio (`replied`, `meeting`, `won`, etc.) |
| **Registrar Interação** | `POST` | `/api/leads/:id/interactions` | Insere notas e mensagens no histórico com timestamp |
| **Entrada de Lead** | `POST` | `/api/webhooks/lead` | Cria o lead e dispara qualificação imediata por Gemini AI |

---

## 📚 Notas Relacionadas

- [[Prospector CRM Index]] — Índice mestre do Second Brain
- [[Guia de Uso do CRM]] — Manual de operação diária
- [[Agent And AI Guardrails]] — Limites de atuação autônoma e aprovação humana
- [[Architecture Map]] — Diagrama de serviços e componentes
