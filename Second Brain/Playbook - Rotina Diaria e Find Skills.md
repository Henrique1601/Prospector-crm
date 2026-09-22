---
type: playbook
project: Prospector CRM
status: active
updated: 2026-09-22
tags:
  - routine
  - daily-briefing
  - find-skills
  - pipeline-review
  - productivity
---

# Playbook — Rotina Diária e Descoberta de Skills

> **Objetivo:** Estabelecer uma rotina comercial de 30 minutos por dia com o Prospector CRM e ensinar como expandir o repertório de ferramentas usando o comando `/find-skills`.

---

## 1. A Rotina Comercial de 30 Minutos de Henrique

Para manter o funil de vendas sempre cheio e fechar contratos recorrentes, dedique 30 minutos no início da manhã:

```mermaid
flowchart LR
    A[1. Daily Briefing] --> B[2. Follow-ups do Dia]
    B --> C[3. 5 Novos Contatos]
    C --> D[4. Sync no Obsidian]
```

### 1. Iniciar o Dia com `daily-briefing`
Peça ao assistente:
> *"Gere meu daily-briefing com base nos leads do Prospector CRM. Quais follow-ups vencem hoje e quais são as 3 empresas mais quentes para contato?"*

### 2. Disparar os Follow-ups Agendados
- Abra o painel do CRM na seção **"Próximos follow-ups"**.
- Clique no lead e use o botão **"Conversar no WhatsApp com texto pronto"** para reengajar o cliente.
- Atualize o campo *Próximo Follow-up* para nova data.

### 3. Fazer 5 Novos Contatos
- Na tabela do CRM, filtre por leads com estágio **Analisado** e alta prioridade.
- Escolha a variação mais adequada (Completa, Curta ou Demonstração) e envie com 1 clique no WhatsApp.

### 4. Sincronizar o Segundo Cérebro
No final do dia, rode no terminal:
```bash
npm run brain:sync
```
Isso atualiza o retrato do seu funil comercial dentro de `Second Brain/CRM Snapshot.md`.

---

## 2. Como Usar o `/find-skills` para Achar Novas Ferramentas

O ecossistema aberto de skills possui centenas de automações prontas no [https://skills.sh](https://skills.sh). Sempre que surgir uma necessidade nova, use o comando:

### Exemplo 1: Buscar automações de Redes Sociais / LinkedIn
```bash
npx skills find linkedin
```

### Exemplo 2: Buscar automações de Contratos e Jurídico
```bash
npx skills find contract
```

### Exemplo 3: Instalar uma Skill Encontrada Globalmente
```bash
npx skills add <owner/repo@skill> -g -y
```

### Exemplo de Skills já instaladas e prontas no seu PC:
- `seo-audit` (Auditoria de SEO técnico on-page)
- `proposal-writer` (Geração de propostas comerciais de alto impacto)
- `find-skills` (Motor de busca e instalação de novos pacotes)
- `daily-briefing` (Plano de ação matinal priorizado)
- `pipeline-review` (Auditoria de gargalos no funil de vendas)

---

Relacionadas: [[Agent Skills and Capabilities]] · [[Operating System]] · [[Prospector CRM Index]] · [[Sales Playbook]]
