---
type: playbook
project: Prospector CRM
status: active
updated: 2026-09-22
tags:
  - seo
  - audit
  - objections
  - lighthouse
  - sales
---

# Playbook — Auditoria de Sites e Quebra de Objeções

> **Objetivo:** Transformar a principal objeção de vendas (*"nós já temos um site"*) na maior oportunidade de fechamento, usando métricas técnicas irrefutáveis de velocidade mobile e SEO local.

---

## 1. O Cenário Típico

Quando você aborda uma empresa e descobre que ela já possui um site, 90% das vezes o site:
1. Foi feito há anos no Wix ou WordPress pesado e demora mais de 6 segundos para abrir no 4G;
2. Não se adapta corretamente à tela do celular (letras miúdas, botões cortados);
3. Não possui botão flutuante de WhatsApp fácil de clicar;
4. Não está otimizado para o Google (SEO), perdendo para concorrentes em [Cidade].

---

## 2. Passo a Passo da Auditoria Técnica com os Skills

### Passo 1: Auditoria de Velocidade e Mobile com `agent-browser` + `debug-optimize-lcp`
Peça ao assistente:
> *"Use o agent-browser para acessar o site [URL do Lead]. Meça o tempo de carregamento mobile (LCP) e tire uma captura de tela mostrando como ele aparece no celular."*

O agente analisará:
- **LCP (Largest Contentful Paint):** Se for maior que 2.5 segundos, o Google penaliza o site no ranqueamento.
- **Usabilidade Mobile:** Se os links são difíceis de tocar no celular.

### Passo 2: Auditoria de SEO Local com o skill `seo-audit`
Peça ao assistente:
> *"Execute uma análise com o skill seo-audit no site [URL do Lead]. Avalie meta title, meta description, cabeçalhos H1/H2 e indexação local para a cidade de [Cidade]."*

O skill apontará:
- Falta de palavras-chave de intenção de compra local (ex: "Oficina mecânica em Santos");
- Ausência de tags Open Graph para WhatsApp (quando o cliente compartilha o link, não aparece imagem bonita nem título);
- Links quebrados ou certificados SSL vencidos.

---

## 3. Como Montar a Mensagem de Quebra de Objeção

Com os dados da auditoria em mãos, você não discute opinião; você apresenta fatos:

> "Olá [Nome do Responsável]! Entendo perfeitamente que vocês já possuem site.  
> Por curiosidade técnica, rodei um diagnóstico rápido no site atual de vocês pelo celular e notei dois pontos importantes:  
> 1. Ele está levando cerca de 6 segundos para carregar no 4G, e mais de 50% das pessoas desistem antes de abrir;  
> 2. O botão de WhatsApp não fica fixo na tela, dificultando o contato imediato de quem busca pelo celular.  
>  
> Fiz um teste rápido aplicando as diretrizes modernas do Google e consigo fazer essa mesma página abrir em menos de 1 segundo com botão de WhatsApp direto. Posso te mandar o teste comparativo sem custo para você ver a diferença?"

Nenhum concorrente entrega essa profundidade técnica em uma abordagem comercial.

---

Relacionadas: [[Agent Skills and Capabilities]] · [[Sales Playbook]] · [[Playbook - Demonstracoes e Mockups com Lovable]]
