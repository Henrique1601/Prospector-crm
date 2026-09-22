---
type: reference
project: Prospector CRM
status: active
updated: 2026-09-22
tags:
  - prompts
  - skills
  - cheat-sheet
  - automation
  - playbooks
---

# Biblioteca de Prompts das Skills — Prospector CRM

> Guia de comandos rápidos e prompts prontos para Henrique Bezerra copiar e colar no chat com o assistente para acionar qualquer skill instalada no PC.

---

## 🌅 1. Rotina Comercial e Planejamento Matinal

### Gerar Daily Briefing
```text
Gere meu daily briefing para hoje com base nos leads do Prospector CRM.
Mostre:
1. Follow-ups que vencem hoje;
2. Os 3 leads mais quentes para contato imediato;
3. Plano de ação para os próximos 30 minutos.
```

### Análise de Saúde do Funil (`pipeline-review`)
```text
Rode uma análise de pipeline-review no Prospector CRM.
Verifique se há leads travados há mais de 5 dias, calcule nossa taxa de conversão e recomende os próximos movimentos para destravar propostas.
```

---

## 🎨 2. Demonstrações e Criação de Sites ao Vivo

### Criar e Publicar Mockup com o Servidor `lovable` MCP
```text
Use a ferramenta lovable para criar uma landing page moderna para a empresa [Nome do Lead], segmento de [Segmento] em [Cidade].
Inclua:
- Hero com chamada convidativa para clientes locais de [Cidade];
- Botão flutuante de WhatsApp direcionado para o número [Telefone];
- Grade com 4 principais serviços do negócio;
- Mapa de localização e horário de funcionamento.
Após criar, publique o projeto e me passe o link público.
```

### Gerar Protótipo Visual Rápido em HTML (`generative_ui`)
```text
Crie um mockup visual completo em arquivo único HTML com Tailwind CSS simulando o site mobile da empresa [Nome do Lead]. Quero ver a versão mobile para tirar um print e mandar no WhatsApp.
```

### Gerar Vídeo Teaser Promocional (`hyperframes`)
```text
Use hyperframes para criar uma animação em vídeo de 10 segundos apresentando a nova identidade digital e o site da empresa [Nome do Lead].
```

---

## 🔎 3. Auditoria Técnica e Quebra de Objeções

### Auditoria de SEO Local (`seo-audit`)
```text
Execute o skill seo-audit no site [URL do Lead].
Analise as meta tags, títulos H1/H2 e me diga por que a empresa não aparece na primeira página do Google quando alguém pesquisa por "[Segmento] em [Cidade]".
```

### Auditoria de Velocidade Mobile e Print (`agent-browser` + `chrome-devtools`)
```text
Use o agent-browser para acessar o site [URL do Lead] simulando um smartphone 4G.
Meça o tempo de carregamento LCP e tire uma captura de tela do site atual para eu comparar com a nova versão.
```

### Pesquisa de Inteligência de Concorrentes (`competitive-intelligence`)
```text
Analise os 3 maiores concorrentes da empresa [Nome do Lead] no bairro [Bairro/Cidade].
Gere um comparativo destacando o que os concorrentes têm de presença digital que esse lead ainda não possui.
```

---

## 💼 4. Fechamento, Propostas e Contratos

### Proposta Comercial em PDF com `proposal-writer` e `pdf`
```text
Use os skills proposal-writer e pdf para gerar uma proposta comercial formal para [Nome do Lead]:
- Especialista: Henrique Bezerra dos Santos (https://bezerraportifolio.netlify.app/)
- Escopo: Criação de site institucional de alta conversão + botão de WhatsApp + otimização para o Google (SEO)
- Investimento: R$ 1.200 à vista (Pix) ou 3x de R$ 440 no cartão
- Manutenção mensal opcional: R$ 120/mês (hospedagem, suporte e atualizações)
- Prazo de entrega: 10 dias úteis
Gere o arquivo em PDF pronto para assinatura e envio no WhatsApp.
```

### Minuta de Contrato de Prestação de Serviços (`docx` ou `pdf`)
```text
Gere um contrato de prestação de serviços de desenvolvimento web e manutenção mensal entre Henrique Bezerra dos Santos e a empresa [Nome do Lead], especificando termos de pagamento, propriedade intelectual do site e prazos de garantia.
```

---

## 📦 5. Descobrir e Instalar Novas Ferramentas (`find-skills`)

### Buscar qualquer habilidade no ecossistema
```bash
# No terminal do projeto:
npx skills find [palavra-chave]

# Exemplos práticos:
npx skills find instagram
npx skills find whatsapp
npx skills find contract
```

### Instalar globalmente com 1 comando
```bash
npx skills add <owner/repo@skill> -g -y
```

---

Relacionadas: [[Agent Skills and Capabilities]] · [[Sales Playbook]] · [[Playbook - Demonstracoes e Mockups com Lovable]] · [[Playbook - Auditoria de Sites e Quebra de Objeções]] · [[Playbook - Propostas Comerciais e Fechamento]] · [[Playbook - Rotina Diaria e Find Skills]]
