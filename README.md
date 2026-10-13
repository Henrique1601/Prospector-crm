# 🎯 Prospector CRM

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg)](https://www.typescriptlang.org/)
[![React / Vite](https://img.shields.io/badge/React%20%2B%20Vite-Frontend-61dafb.svg)](https://vitejs.dev/)
[![Express / Node](https://img.shields.io/badge/Express-Backend-black.svg)](https://expressjs.com/)
[![Neon Postgres](https://img.shields.io/badge/Neon-Serverless%20Postgres-00e599.svg)](https://neon.tech/)
[![MCP Server](https://img.shields.io/badge/MCP-Model%20Context%20Protocol-8a2be2.svg)](https://modelcontextprotocol.io/)

Sistema pessoal e sob medida de prospecção comercial e qualificação de clientes de **Henrique Bezerra dos Santos** (Desenvolvedor Web Full-Stack — Santos/SP). O Prospector CRM organiza empresas locais, diagnostica a presença digital (site, WhatsApp, Google Maps, SEO), prioriza leads por score inteligente, gera briefings e prompts para protótipos de demonstração e prepara abordagens de alto impacto.

> 🛡️ **Princípio Fundamental (Human-in-the-Loop):** A IA prepara, analisa e calcula; **Henrique revisa, decide e envia.** Nenhuma mensagem de WhatsApp, e-mail ou proposta comercial é disparada sem autorização humana expressa.

---

## 🏗️ Arquitetura do Sistema

```mermaid
flowchart TD
    subgraph Frontend["🎨 apps/web (crm-pessoal)"]
        UI[Painel React + Vite + Double-Bezel Design]
        Kanban[Quadro Kanban & Funil Visual]
        ScraperModal[🗺️ Google Maps Scraper Hub]
        RoiModal[💰 Calculadora de ROI & Perda Invisível]
        AudioModal[🎙️ Teleprompter / Roteiro de Áudio 30s]
        McpModal[🔌 Central MCP / Hub de Conexão]
        DemoFlow[🤖 Fluxo de Demonstrações & IA Prompts]
    end

    subgraph Backend["⚡ apps/api (api-prospector)"]
        API[Express 4 Serverless API]
        AI[Módulo de IA & Análise Heurística]
        McpServer[Servidor MCP Streamable HTTP /api/mcp]
        IntegrationsAPI[API Segura de Leads /api/integrations/leads]
    end

    subgraph Storage["💾 Persistência de Dados"]
        Neon[(Neon Postgres Serverless)]
        LocalStore[(apps/api/data/store.json)]
    end

    subgraph Brain["🧠 Segundo Cérebro"]
        Obsidian[Vault Obsidian / Second Brain]
    end

    UI -->|HTTP / REST| API
    ScraperModal -->|Scrape & Preview| API
    RoiModal -->|Simulação & Métricas| API
    AudioModal -->|Roteiro Sob Medida| API
    McpModal -->|Health & Testes| McpServer
    DemoFlow -->|Geração de Briefing & Prompt| AI

    API -->|DATABASE_URL ativa| Neon
    API -->|Fallback Local / Dev| LocalStore
    API -.->|npm run brain:sync| Obsidian
```

---

## ✨ Funcionalidades Principais

### 1. 🗺️ Google Maps Scraper Integrado
- **Importação Direta:** Leitura de arquivos `results.json` ou `results.csv` gerados pelo `gosom/google-maps-scraper`.
- **Gerador de Queries & Docker:** Criação automática do arquivo `queries.txt` e do comando Docker pronto para execução por nicho e cidade da Baixada Santista.
- **Scraping Live:** Busca em tempo real e deduplicação inteligente por telefone, URL do Google Maps e nome/cidade.

### 2. 🔌 Central MCP (Model Context Protocol)
- **Hub Interativo no Painel:** Modal de diagnóstico com status de conexão em tempo real, latência e testador de tokens Bearer.
- **Servidor Remoto Stateless:** Endpoint `/api/mcp` compatível com o protocolo Streamable HTTP para Claude Desktop, Cursor e outros agentes de IA.
- **Ferramentas Expostas:**
  - `list_leads`: Consulta e filtragem avançada de empresas no funil comercial.
  - `create_leads`: Cadastro de novos leads com deduplicação de alta precisão.

### 3. 💰 Calculadora de ROI & Perda Invisível
- **Métricas por Segmento:** Cálculo automático com ticket médio dinâmico (Odontologia, Imobiliárias, Mecânicas, Advocacia, Estética, etc.).
- **Impacto Financeiro Real:** Apresenta a perda mensal e anual estimada que o cliente sofre por não ter presença digital otimizada.
- **Tempo de Break-Even:** Calcula exatamente quantos novos clientes e dias são necessários para pagar o investimento no site.
- **Abordagem Comercial:** Gera texto pronto e persuasivo para WhatsApp com métricas calculadas.

### 4. 🎙️ Teleprompter / Roteiro de Áudio Humanizado (30s)
- **Mensagens de Alta Abertura:** Roteiros sob medida para gravação de áudio de 25 a 35 segundos (taxa de abertura superior a 90%).
- **Ritmo e Entonação:** Inclui contagem de palavras, marcação de pausas dramáticas de 1s e tom consultivo direto.
- **Casos Reais:** Referência autorizada ao trabalho desenvolvido para a JM Motors em Santos/SP.

### 5. 🤖 Fluxo Completo de Demonstrações com IA
- **Gestão de Aceite:** Registro claro do momento em que o cliente autorizou a criação do projeto demonstrativo.
- **Pacote Estratégico com IA:** Geração de visão do negócio, público-alvo, estrutura de seções e chamadas para ação.
- **Prompt Pronto para Geradores de Site:** Prompt formatado especificamente para IAs como Lovable, Bolt, v0 e Replit.
- **Versionamento de Prévias (V1, V2, V3):** Histórico de links de prévia, feedback do lead e iterações de design.

### 6. 🧠 Segundo Cérebro no Obsidian
- Vault completo na pasta `Second Brain/` com notas de estratégia, playbooks, scripts e logs.
- Comando `npm run brain:sync` que consolida os números atuais do funil em `Second Brain/CRM Snapshot.md`.

---

## 🚀 Inicialização Rápida

### Pré-requisitos
- **Node.js:** Versão 20+ instalada
- **npm:** Versão 10+

### Instalação e Execução Local

```bash
# 1. Clonar o repositório
git clone https://github.com/Henrique1601/Prospector-crm.git
cd Prospector-crm

# 2. Instalar dependências de todos os workspaces
npm install

# 3. Iniciar ambiente de desenvolvimento (frontend + backend simultâneos)
npm run dev
```

- **Painel do CRM (Vite):** [http://localhost:5173](http://localhost:5173)
- **API Health Check (Express):** [http://localhost:3333/api/health](http://localhost:3333/api/health)

---

## ⚙️ Configuração de Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure suas variáveis conforme necessário:

```bash
cp .env.example .env
```

| Variável | Descrição | Onde Configurar |
| :--- | :--- | :--- |
| `DATABASE_URL` | String de conexão Postgres (Neon Serverless). Se ausente, usa `apps/api/data/store.json`. | Backend / Vercel API |
| `INTEGRATION_API_KEY` | Chave secreta de autenticação para o endpoint `/api/integrations/leads` e MCP Server. | Backend / Vercel API |
| `GEMINI_API_KEY` | Chave da Google Gemini API para geração de análises, roteiros e prompts com IA. | Backend (.env local) |
| `VITE_API_URL` | URL base da API consumida pelo frontend (ex: `https://api-prospector-delta.vercel.app` em prod). | Frontend (Vercel) |

> ⚠️ **Atenção:** Nunca comite arquivos `.env` ou tokens reais. Mantenha as chaves seguras nas variáveis de ambiente da plataforma de deploy.

---

## ☁️ Deploy na Vercel

O repositório é configurado como monorepo com dois projetos independentes na Vercel:

1. **`crm-pessoal` (Frontend):**
   - **Root Directory:** `apps/web`
   - **Framework Preset:** `Vite`
   - **Variável de Ambiente:** `VITE_API_URL` (apontando para o domínio da API)

2. **`api-prospector` (Backend Serverless):**
   - **Root Directory:** `apps/api`
   - **Serverless Entrypoint:** `index.ts` (exportado para Vercel Functions via `vercel.json`)
   - **Variáveis de Ambiente:** `DATABASE_URL`, `INTEGRATION_API_KEY`, `GEMINI_API_KEY`
   - **Banco de Dados:** Neon Serverless Postgres com migrações em `apps/api/migrations`

---

## 🔒 API Segura de Integração & MCP

### Ingestão Segura de Leads (`POST /api/integrations/leads`)

Automações externas ou scrapers integrados devem utilizar este endpoint protegido por cabeçalho Bearer:

```bash
curl -X POST "https://api-prospector-delta.vercel.app/api/integrations/leads" \
  -H "Authorization: Bearer $INTEGRATION_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "autoAnalyze": false,
    "leads": [
      {
        "name": "Oficina Mecânica Modelo",
        "segment": "Oficina Mecânica",
        "city": "Santos",
        "state": "SP",
        "phone": "(13) 99999-0000",
        "mapsUrl": "https://maps.google.com/..."
      }
    ]
  }'
```

### Conector MCP Remoto (`/api/mcp`)

Compatível com Claude Desktop, Cursor e outros clientes MCP modernos:

```json
{
  "mcpServers": {
    "prospector-crm": {
      "url": "https://api-prospector-delta.vercel.app/api/mcp",
      "headers": {
        "Authorization": "Bearer SUA_INTEGRATION_API_KEY_AQUI"
      }
    }
  }
}
```

---

## 📁 Estrutura do Repositório

```text
├── apps/
│   ├── api/                     # Backend Express Serverless & Servidor MCP
│   │   ├── migrations/          # Migrações SQL versionadas (Neon Postgres)
│   │   ├── src/                 # Endpoints, regras de negócio, IA e scraper
│   │   └── vercel.json          # Configuração de rotas de função Vercel
│   └── web/                     # Frontend SPA React + Vite + Double-Bezel Design
│       └── src/                 # Componentes, modais de ROI, Scraper, MCP e Áudio
├── scripts/                     # Utilitários de CLI (scrape-maps.mjs, etc.)
├── Second Brain/                # Vault Obsidian (Playbooks, Roadmap, Snapshot)
├── .gitignore                   # Regras de proteção de segredos e builds
├── LICENSE                      # Licença MIT 2026
└── README.md                    # Documentação técnica oficial
```

---

## 📜 Licença

Distribuído sob a licença **MIT**. Veja [`LICENSE`](LICENSE) para mais detalhes.

Copyright (c) 2026 **Henrique Bezerra Dos Santos**.
