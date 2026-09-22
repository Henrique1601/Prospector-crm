---
type: playbook
project: Prospector CRM
status: active
updated: 2026-09-22
tags:
  - abordagens
  - copy
  - vendas
  - whatsapp
  - cold-outreach
  - playbooks
---

# Playbook — Central de Abordagens e Modelos de Conversão

> Guia prático de copies e scripts de abordagem comercial para Henrique Bezerra dos Santos aplicar na prospecção ativa de empresas na Baixada Santista e região.

---

## 🎯 As 3 Perguntas de Impacto (Perda Invisível & Concorrência)

Estas perguntas foram criadas para quebrar a indiferença do tomador de decisão no primeiro contato (WhatsApp, Direct ou Telefone) gerando curiosidade imediata:

### 1. A Pergunta da Concorrência e Perda Invisível ⭐
> *"Posso te fazer uma pergunta rápida? Você sabe quantos clientes podem estar procurando exatamente pelo que sua empresa oferece… e acabam encontrando outra empresa primeiro?"*

- **Gatilho Mental:** Medo de perda invisível + Curiosidade competitiva.
- **Quando usar:** Empresas bem avaliadas no Google Maps que ainda não têm site ou têm um site muito lento.
- **Continuação sugerida:** Apresentar que você notou essa oportunidade no segmento e preparou uma proposta de posicionamento no Google integrada ao WhatsApp.

---

### 2. O Próximo Cliente da Empresa 🔥
> *"E se o próximo cliente da sua empresa estiver procurando exatamente pelo que você oferece — mas não estiver encontrando você?"*

- **Gatilho Mental:** Urgência e imediatismo.
- **Quando usar:** Leads em nichos de alta busca local (clínicas, restaurantes, mecânicas, estética).
- **Continuação sugerida:** Explicar que a decisão de compra é tomada em segundos pelo celular e oferecer um rascunho de solução sem compromisso.

---

### 3. A Pergunta de Prontidão Digital 🚀
> *"Sua empresa já está pronta para ser encontrada por novos clientes na internet?"*

- **Gatilho Mental:** Qualificação direta e profissionalismo.
- **Quando usar:** Primeiro contato com tomadores de decisão formais ou contatos via formulário/e-mail.
- **Continuação sugerida:** Enviar o link do portfólio oficial de Henrique (`https://bezerraportifolio.netlify.app/`) e convidar para ver um protótipo visual.

---

## 📱 Modelos por Canal de Contato

### 1. WhatsApp Web (Envio Rápido)
Use a **Central de Abordagens** do Prospector CRM (`apps/web/src/ApproachPlaybookModal.tsx`) para gerar o link `https://wa.me/55...` com a mensagem já pré-preenchida e codificada.

### 2. Instagram Direct
Mantenha a mensagem em 3 linhas curtas, valorizando o trabalho do perfil antes de fazer o gancho sobre a presença no Google Maps.

### 3. Roteiro de Ligação Rápida (Cold Call de 45s)
1. **Abertura (5s):** Apresentação educada e solicitação do responsável.
2. **Gancho (15s):** Apresentação do diagnóstico local e da pergunta de concorrência.
3. **Oferta Leve (15s):** "Posso te mandar o link no WhatsApp para você dar uma olhada de 1 minuto sem compromisso?"
4. **Fechamento (10s):** Confirmação do número e agradecimento.

---

## 🔌 Integração de Leads via Webhook

O Prospector CRM agora aceita captação automática de formulários externos:
- **Endpoint:** `POST /api/webhooks/lead`
- **Campos aceitos:** `empresa`, `segmento`, `cidade`, `telefone`, `website`, `mensagem`, `origem`.
- **Qualificação automática:** O lead é pontuado e qualificado pela IA instantaneamente ao chegar.

---

Relacionadas: [[Prospector CRM Index]] · [[Playbook - Biblioteca de Prompts das Skills]] · [[Playbook - Demonstracoes e Mockups com Lovable]] · [[Playbook - Propostas Comerciais e Fechamento]]
