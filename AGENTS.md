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

## 5. Diretrizes de Frontend, Design e Motion Obrigatórias (Regra Permanente)
Para **toda e qualquer nova implementação ou ajuste visual** no frontend do Prospector CRM, o agente **DEVE obrigatoriamente** aplicar as diretrizes consolidadas destas 4 skills:

1. **`high-end-visual-design`**:
   - **Arquitetura Double-Bezel (Doppelrand):** Cards e contêineres com moldura dupla (outer shell sutil + inner core de alta legibilidade com `inset shadow`).
   - **Tipografia de Elite:** `Plus Jakarta Sans` para textos, títulos e botões; `Space Grotesk` para números, KPIs e scores.
   - **Anti-padrões Proibidos:** Proibido o uso de sombras cinzas pesadas (`shadow-md`, `rgba(0,0,0,0.3)`), bordas cinzas genéricas ou layouts rígidos de 3 colunas padrão.
   - **Espaçamento e Respiração:** Micro-rótulos (`eyebrow`) em maiúsculas com tracking largo (`0.08em` a `0.12em`), contraste nítido e áreas confortáveis de clique.

2. **`design-taste-frontend`**:
   - **Anti-Slop / Zero Genérico:** Interfaces intencionais que não pareçam geradas por template ou IA.
   - **Contraste & Profundidade:** Paleta executiva de Deep OLED (`#071719` / `#0a1f22`), Pine Teal (`#1a5658`), Mint fresco (`#a3ded2`) e Coral vivo (`#ea580c`).
   - **Adaptação Responsiva Cirúrgica:** Elementos devem quebrar com elegância sem sobrepor texto nem truncar nomes de empresas.

3. **`animate` & `find-animation-opportunities`**:
   - **Física de Emil Kowalski:** Transições aceleradas por GPU restritas a `transform` e `opacity` (nunca animar layout como `width`, `height`, `top`, `left`).
   - **Curvas e Duração:** Curva orgânica padrão `cubic-bezier(0.16, 1, 0.3, 1)` ou `cubic-bezier(0.2, 0, 0, 1)`, durações entre `150ms` e `280ms`.
   - **Nunca usar `scale(0)`:** Entradas começam em `scale(0.96-0.98)` com fade de opacidade.
   - **Gate de Ações Frequentes:** Ações de altíssima frequência (digitar busca, atalhos de teclado) têm latência 0ms e resposta instantânea.

<!-- ai-memory:start -->
## Long-term memory (ai-memory)

This project uses [ai-memory](https://github.com/akitaonrails/ai-memory) for cross-session continuity.

- **Configuração do Projeto:** Declarado no arquivo `.ai-memory.toml` (`workspace = "default"`, `project = "prospector-crm"`).
- **Consultas e Recuperação:** Use `memory_query` para recuperar decisões e lições passadas com `project: "prospector-crm"`, `workspace: "default"`.
- **Anotações Permanentes:** Use `memory_write_page` para persistir regras, lições e procedimentos duradouros do Prospector CRM.
<!-- ai-memory:end -->
