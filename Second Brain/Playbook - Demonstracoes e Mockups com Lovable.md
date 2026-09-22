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
  - frontend
---

# Playbook — Demonstrações e Mockups com Lovable e Generative UI

> **Objetivo:** Criar e publicar protótipos de landing pages funcionais em menos de 10 minutos para encantar o cliente antes mesmo da primeira reunião.

---

## 1. O Poder da Demonstração Ativa

A maioria dos desenvolvedores apenas envia uma mensagem de texto dizendo *"posso fazer seu site"*.  
**O método Henrique Bezerra:** Você já chega mostrando o site planejado com o nome da empresa, o logotipo aproximado, os serviços reais que eles prestam e o botão de WhatsApp funcionando.

---

## 2. Como Usar o Servidor `lovable` MCP

O servidor `lovable` está conectado como MCP no ambiente. Ele é capaz de:
- `create_project`: Iniciar um novo projeto com um prompt em linguagem natural.
- `deploy_project`: Publicar o site imediatamente em uma URL pública compartilhável.
- `read_file` / `list_files`: Inspecionar e ajustar o código gerado.

### Prompt Padrão para o Assistente:
> *"Crie um projeto no Lovable para a empresa [Nome do Lead], que atua no segmento de [Segmento] em [Cidade].  
> O site deve ser uma One-Page moderna, responsiva, com:
> 1. Hero com título atraente para moradores de [Cidade];
> 2. Botão de WhatsApp em destaque direcionando para o telefone [Telefone];
> 3. Grade dos 4 principais serviços prestados;
> 4. Seção de localização com endereço [Endereço];
> 5. Paleta de cores condizente com o segmento.  
> Após criar, publique o projeto e me forneça a URL pública para envio."*

---

## 3. Alternativa Local: `generative_ui` & `playground`

Se você preferir rodar uma demonstração local no seu navegador ou em vídeo:
1. Peça ao agente:
   > *"Crie um artefato HTML único e moderno com Tailwind CSS simulando a landing page da [Nome da Empresa]."*
2. Abra o arquivo `.html` gerado no Google Chrome.
3. Use o `agent-browser` para tirar um screenshot mobile de alta fidelidade:
   > *"Tire uma captura de tela com resolução mobile (375x812) do arquivo HTML gerado."*
4. Envie o print no WhatsApp do cliente junto com a mensagem de demonstração!

---

## 4. Roteiro de Envio da Demonstração pelo WhatsApp

Assim que o link ou print estiver pronto, use a **Variação 3 (Demonstração)** do Prospector CRM:

> Olá equipe da [Nome da Empresa]! Aqui é o Henrique, desenvolvedor web.  
> Como prometido, montei um modelo demonstrativo de como o site de vocês ficaria no celular para atrair mais clientes aqui de [Cidade] direto no WhatsApp:  
> 🔗 [Link do Mockup no Lovable / Imagem]  
>  
> Ficou com uma navegação super rápida e os botões de contato em destaque. O que achou dessa disposição dos serviços?

---

Relacionadas: [[Agent Skills and Capabilities]] · [[Sales Playbook]] · [[Playbook - Propostas Comerciais e Fechamento]]
