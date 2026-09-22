---
type: playbook
project: Prospector CRM
status: active
updated: 2026-09-22
tags:
  - lovable
  - mockups
  - demo
  - landing-pages
  - antigravity
  - git
  - export
---

# Playbook — Passo a Passo Completo: Lovable, Prospector CRM e Antigravity

> **Objetivo:** O fluxo exato de ponta a ponta para criar landing pages de demonstração ultra-rápidas no Lovable, vincular ao lead no CRM e, quando o cliente fechar, importar o código para o Antigravity no computador local.

---

## 1. Visão Geral da Integração

```
┌─────────────────────────────────────────────────────────────┐
│ 1. PROSPECTOR CRM                                           │
│    • Lead qualificado sem site                              │
│    • Clique em "Gerar briefing da demonstração"             │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. CRIAÇÃO NO LOVABLE (via MCP ou Web)                      │
│    • O MCP do Lovable no Antigravity cria e publica o site  │
│    • Gera a URL: https://preview--[cliente].lovable.app     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. VÍNCULO NO CRM & ABORDAGEM                               │
│    • Cole a URL no campo "Link da Demonstração" no CRM      │
│    • Surge a tag "Demo" no Pipeline                         │
│    • Envie pelo WhatsApp ou na Proposta Comercial em PDF    │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Quando o cliente fechar!)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. IMPORTAR DO LOVABLE PARA O ANTIGRAVITY (Código Local)    │
│    • Conectar ao GitHub pelo Lovable -> git clone local     │
│    • OU pedir para o Antigravity baixar via MCP             │
│    • Publicar no domínio oficial do cliente ou Netlify      │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Passo 1: Gerar o Briefing da Demonstração no CRM

1. Na tabela do **Prospector CRM**, clique na empresa desejada (preferencialmente com o filtro `Sem Site`).
2. Role até a seção **Demonstração & Landing Page**.
3. Clique em **"Gerar briefing da demonstração"**.
4. O CRM vai estruturar as cores, chamadas de ação (CTA para WhatsApp), dores do cliente e sugestões de seções ideais para aquele ramo comercial.

---

## 3. Passo 2: Criar a Landing Page no Lovable usando o Antigravity

Com o MCP do Lovable ativo no seu Antigravity, você não precisa fazer nada manual:

### Prompt que você pode enviar para o Antigravity:
> *"Use o MCP do Lovable para criar um projeto de landing page para o lead [Nome da Empresa].  
> Utilize as informações do briefing gerado pelo CRM:  
> - Cidade: [Cidade]  
> - Segmento: [Segmento]  
> - WhatsApp para botão: [Telefone]  
> Crie um design moderno, responsivo para celular, com hero marcante, seção de serviços, depoimentos e botão flutuante de WhatsApp.  
> Publique o projeto e me devolva a URL de preview pública gerada."*

O agente executará as ferramentas:
- `lovable:create_project` (ou `initiate_project`)
- `lovable:send_message` (para refinar o layout)
- `lovable:deploy_project` (para publicar na nuvem da Lovable)

---

## 4. Passo 3: Vincular a URL no Prospector CRM

Assim que você tiver o link da demonstração (ex: `https://preview--restaurante-silva.lovable.app`):

1. Abra a gaveta do lead no **Prospector CRM**.
2. Na seção **Demonstração & Landing Page**, cole o link no campo **"Link do Protótipo / Demonstração (ex: Lovable)"**.
3. Clique em **"Salvar Link"**.
4. **O que acontece automaticamente:**
   - O lead ganha um selo visual verde **`Demo`** na tabela de leads do CRM.
   - Um botão **"Abrir protótipo Lovable em nova aba"** fica disponível para consulta imediata.
   - O link da demonstração é incluído quando você clicar em **"Gerar Proposta Comercial em PDF"** ou enviar na **Abordagem de Demonstração**.

---

## 5. Passo 4: Como Importar o Projeto do Lovable para o Antigravity (Código Local)

Quando o cliente aprovar o projeto e você for dar início ao desenvolvimento final ou customizações avançadas:

### Opção A: Via GitHub (Recomendado — mais rápido e profissional)
1. No painel do Lovable (web), abra o projeto e clique no botão **"GitHub"** no topo direito -> **"Connect to GitHub"**.
2. O Lovable vai criar um repositório na sua conta GitHub com todo o código-fonte (React, Tailwind CSS, Vite, TypeScript).
3. No seu computador, abra o terminal no Antigravity e clone o repositório dentro da sua pasta de projetos:
   ```bash
   git clone https://github.com/Henrique1601/[nome-do-projeto-cliente].git
   ```
4. Agora você pode abrir essa pasta no Antigravity, rodar `npm install && npm run dev`, editar o código com o agente e fazer o deploy para a Netlify ou Vercel no domínio oficial do cliente (`www.empresa.com.br`).

### Opção B: Via Antigravity MCP (100% automatizado no chat)
Você pode pedir diretamente para o Antigravity:
> *"Baixe todos os arquivos do projeto [ID ou Nome do Projeto] do Lovable e salve em uma pasta local `demos/[nome-da-empresa]` neste repositório."*

O agente usará as ferramentas:
- `lovable:list_files` para listar os arquivos do projeto.
- `lovable:read_file` para baixar o código de cada componente e salvá-los localmente.

---

## 6. Dicas de Ouro de Conversão para Henrique

- **Nunca mande a demo de surpresa sem contexto:** Sempre pergunte primeiro se pode mostrar:
  > *"Olá [Nome], vi que a [Empresa] não tem site oficial no Google e já preparei um modelo rápido demonstrativo para você ver no celular. Posso te enviar o link por aqui?"*
- **Depois que o cliente disser "sim":** Mande o link da demo e já proponha uma chamada rápida ou envio da proposta comercial em PDF gerada pelo CRM.
- **Fechamento:** Use o botão **"📄 Gerar Proposta Comercial (PDF / WhatsApp)"** no CRM com os valores e opções de pagamento configuradas (à vista ou 3x).

---

Relacionadas: [[Agent Skills and Capabilities]] · [[Sales Playbook]] · [[Playbook - Propostas Comerciais e Fechamento]] · [[Playbook - Auditoria de Sites e Quebra de Objeções]]
