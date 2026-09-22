# Diretrizes para Agentes de IA — Prospector CRM

Este documento orienta qualquer agente de IA que atue neste repositório.

## 1. Visão Geral do Projeto
O **Prospector CRM** é o sistema pessoal de prospecção comercial de **Henrique Bezerra dos Santos**, desenvolvedor Web Full-Stack. O sistema organiza empresas locais, diagnostica a presença digital (site, WhatsApp, Maps), qualifica leads, gera briefings de demonstração e prepara abordagens de venda personalizadas com o portfólio de Henrique.

## 2. Perfil do Desenvolvedor e Credenciais Oficiais
- **Nome:** Henrique Bezerra dos Santos
- **Especialidade:** Criação de presença digital para pequenos e médios negócios (sites modernos, responsivos, SEO, integrações com WhatsApp e e-commerce).
- **Portfólio Oficial:** `https://bezerraportifolio.netlify.app/`
- **LinkedIn Oficial:** `www.linkedin.com/in/henriquebezerra-dev`
- **WhatsApp Oficial:** `(13) 99138-3222`
- **E-mail Oficial:** `henriquebs1601@gmail.com`

## 3. Princípio Fundamental de Operação (Human-in-the-Loop)
**A IA prepara; o humano revisa, decide e envia.**
- Nenhuma mensagem de WhatsApp, e-mail ou proposta deve ser disparada automaticamente sem aprovação e clique explícito de Henrique.
- A IA não inventa dados, telefones ou existência de sites que não tenham sido verificados.

## 4. Skills Disponíveis no Ambiente e Como Utilizá-los
Os seguintes agent skills estão instalados no ambiente e devem ser usados estrategicamente:
1. `obsidian-vault`: Mantém o conhecimento, estratégias e playbooks sincronizados na pasta `Second Brain/` (utilizando wikilinks `[[Nota]]`).
2. `google-maps-platform`: Enriquecimento de estabelecimentos comerciais, coordenadas e Places API.
3. `neon-postgres`: Gerenciamento do banco serverless Postgres em nuvem (`DATABASE_URL`).
4. `notion-mcp-server`: Sincronização de leads e bases com o Notion.
5. `gemini-api-dev`: Qualificação inteligente de leads e geração das 3 variações de mensagens comerciais.
6. `agent-browser` / `chrome-devtools`: Auditoria visual e técnica de sites dos leads para demonstrar melhorias com métricas reais.
7. `pipeline-review` / `build-dashboard`: Auditoria e visualização da saúde do funil de vendas.

8. `ai-memory`: Memória persistente de longo prazo em disco (workspace `default`, project `prospector-crm`). Permite consultar decisões arquiteturais, regras de perfil e histórico através de `memory_query`, `memory_status` e `memory_write_page`.

Para documentação completa dos skills, consulte [[Second Brain/Agent Skills and Capabilities]].

<!-- ai-memory:start -->
## Long-term memory (ai-memory)

This project uses [ai-memory](https://github.com/akitaonrails/ai-memory) for cross-session continuity.

- **Configuração do Projeto:** Declarado no arquivo `.ai-memory.toml` (`workspace = "default"`, `project = "prospector-crm"`).
- **Consultas e Recuperação:** Use `memory_query` para recuperar decisões e lições passadas com `project: "prospector-crm"`, `workspace: "default"`.
- **Anotações Permanentes:** Use `memory_write_page` para persistir regras, lições e procedimentos duradouros do Prospector CRM.
<!-- ai-memory:end -->
