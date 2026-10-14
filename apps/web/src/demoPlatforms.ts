import type { DemoPlatform, Lead } from "./types";
export type { DemoPlatform } from "./types";

export interface DemoPlatformConfig {
  id: DemoPlatform;
  name: string;
  badge: string;
  category: "mcp" | "web_ai" | "code_editor";
  tagline: string;
  url?: string;
  placeholderUrl: string;
  iconName: string; // for rendering indicator or emoji
  instructions: string;
  formatPrompt: (basePrompt: string, lead: Lead) => string;
}

export const DEMO_PLATFORMS: Record<DemoPlatform, DemoPlatformConfig> = {
  lovable: {
    id: "lovable",
    name: "Lovable",
    badge: "React & Vite",
    category: "web_ai",
    tagline: "Criação full-stack com React 18, Tailwind CSS, shadcn/ui e exportação limpa para GitHub.",
    url: "https://lovable.dev",
    placeholderUrl: "https://preview--cliente.lovable.app",
    iconName: "💜",
    instructions: "Abra o Lovable, crie um novo projeto, cole o prompt abaixo e gere o protótipo interativo.",
    formatPrompt: (basePrompt, lead) => {
      return `Crie uma landing page moderna, ultra-rápida e orientada a conversão para ${lead.name}, empresa local do segmento de ${lead.segment} em ${lead.city}/${lead.state}.

STACK E DIRETRIZES TÉCNICAS:
- Framework: React com TypeScript e Vite
- Estilização: Tailwind CSS com classes semânticas
- Ícones: Lucide React (Phone, MessageCircle, MapPin, CheckCircle, Star, Clock)
- Componentes: Estilo shadcn/ui com botões de alto contraste e bordas sutis (Double-Bezel)
- Mobile-First: Leitura ágil no 4G/5G, botões confortáveis de toque (min 48px)

INFORMAÇÕES DO NEGÓCIO:
- Nome: ${lead.name}
- Segmento: ${lead.segment}
- Localização: ${lead.address || `${lead.city}/${lead.state}`}
- WhatsApp Oficial: ${lead.phone || "(13) 99123-4567"}
- Link direto de atendimento: ${lead.whatsappUrl || "https://wa.me/5513991234567"}

ESTRUTURA DA PÁGINA:
1. Header fixo com logotipo e botão de ação rápido para WhatsApp
2. Hero Section com headline chamativa para clientes de ${lead.city} e CTA de agendamento/orçamento imediato
3. Seção com os 4 principais serviços/tratamentos em cards elegantes
4. Bloco "Por que escolher a ${lead.name}": credibilidade local e diferenciais de atendimento
5. Avaliações 5 estrelas do Google e prova social da região
6. Localização com endereço completo e botão flutuante permanente de WhatsApp`;
    }
  },

  v0: {
    id: "v0",
    name: "v0 (Vercel)",
    badge: "Next.js / Radix",
    category: "web_ai",
    tagline: "Gerador de componentes e páginas Next.js com Radix UI e Tailwind da Vercel.",
    url: "https://v0.dev",
    placeholderUrl: "https://v0.dev/t/..." ,
    iconName: "▲",
    instructions: "Abra o v0.dev, cole este prompt na caixa de mensagem e refine as seções interativamente.",
    formatPrompt: (basePrompt, lead) => {
      return `Build a responsive, modern Next.js landing page component with Tailwind CSS and Radix UI primitives for "${lead.name}", a business specializing in ${lead.segment} in ${lead.city}, SP.

Requirements:
1. Executive, dark-teal or high-contrast modern aesthetic with subtle borders and shadows.
2. Sticky navigation with contact button.
3. Engaging Hero with high-converting copy tailored for customers in ${lead.city}.
4. 4 service feature cards with clean typography and icons.
5. Trust badge section ("Atendimento de Excelência em ${lead.city}").
6. Direct WhatsApp call-to-action button linking to ${lead.whatsappUrl || "https://wa.me/5513991234567"}.
7. Footer with business address: ${lead.address || `${lead.city}, SP`}.

Make it completely responsive, accessible (WCAG AA), and optimized for instant mobile rendering.`;
    }
  },

  codex: {
    id: "codex",
    name: "Codex / Cursor",
    badge: "TypeScript / Código",
    category: "code_editor",
    tagline: "Gere o código-fonte puro em TypeScript/React para colar no seu editor, Cursor ou OpenAI Codex.",
    url: undefined,
    placeholderUrl: "https://meu-deploy.netlify.app ou demos/...",
    iconName: "⚡",
    instructions: "Copie o prompt estruturado e cole no Cursor (Ctrl+K / Chat) ou no OpenAI Codex para codificar localmente.",
    formatPrompt: (basePrompt, lead) => {
      const slug = lead.name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
      return `// ============================================================================
// PROMPT PARA OPENAI CODEX / CURSOR / VS CODE
// Projeto: Landing Page Comercial - ${lead.name}
// Local: ${lead.city}/${lead.state} · Segmento: ${lead.segment}
// ============================================================================

Gere um componente React modular completo em TypeScript na pasta "demos/${slug}/LandingPage.tsx":

Requisitos:
- Stack: React 18, TypeScript, Tailwind CSS, Lucide React
- Estado: Modal de agendamento rápido e botão flutuante de WhatsApp
- Dados da empresa:
  * Nome: "${lead.name}"
  * Segmento: "${lead.segment}"
  * Endereço: "${lead.address || `${lead.city}, SP`}"
  * Telefone: "${lead.phone || ""}"
  * WhatsApp URL: "${lead.whatsappUrl || "https://wa.me/5513991234567"}"

Design e Performance:
- Design System: Double-Bezel (bordas duplas sutis, tracking largo em micro-rótulos)
- Paleta: Deep Teal (#1a5658), Mint Fresco (#a3ded2), Branco puro e Coral de ação (#ea580c)
- Exportar componente padrão pronto para ser montado em uma rota do Vite ou Next.js.`;
    }
  },

  antigravity_mcp: {
    id: "antigravity_mcp",
    name: "Antigravity (MCP Ativo)",
    badge: "Aqui com Você 🤖",
    category: "mcp",
    tagline: "Execute a criação diretamente aqui comigo no chat! Temos servidores MCP do Lovable e Netlify ativos.",
    url: undefined,
    placeholderUrl: "https://preview--cliente.lovable.app ou local",
    iconName: "🤖",
    instructions: "Você pode me pedir diretamente no chat! Basta copiar a instrução abaixo ou me enviar o comando.",
    formatPrompt: (_basePrompt, lead) => {
      const slug = lead.name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
      return `Comando para o Agente Antigravity:

"Por favor, crie uma landing page de demonstração para o lead '${lead.name}', empresa de ${lead.segment} em ${lead.city}/${lead.state}.

Opções de execução:
1. Usar a ferramenta MCP 'lovable:create_project' ou 'lovable:initiate_project' para criar e publicar na nuvem da Lovable.
OU
2. Gerar o código React completo na pasta local 'demos/${slug}/' deste repositório e preparar para deploy no Netlify via MCP.

Dados do Lead:
- Nome: ${lead.name}
- Segmento: ${lead.segment}
- Endereço: ${lead.address || "Santos, SP"}
- Telefone/WhatsApp: ${lead.phone || "A confirmar"}
- WhatsApp Link: ${lead.whatsappUrl || "https://wa.me/5513991234567"}
- Foco Comercial: Aumentar o volume de orçamentos e agendamentos pelo celular."`;
    }
  },

  anima: {
    id: "anima",
    name: "Anima App",
    badge: "Design to Code",
    category: "web_ai",
    tagline: "Geração de código React com foco em alta fidelidade estética e conversão visual no Anima.",
    url: "https://dev.animaapp.com/",
    placeholderUrl: "https://dev.animaapp.com/projects/...",
    iconName: "🎨",
    instructions: "Acesse o Anima App (dev.animaapp.com), crie um novo projeto com IA e cole este prompt de design.",
    formatPrompt: (basePrompt, lead) => {
      return `Generate an aesthetic, high-converting responsive web interface and clean React code for "${lead.name}", a premier ${lead.segment} based in ${lead.city}/${lead.state}.

Visual & Design System Specifications:
- Style: Modern, clean, trustworthy visual hierarchy with crisp contrast
- Colors: Deep OLED background accents, Pine Teal (#1a5658), Fresh Mint (#a3ded2), White (#ffffff)
- Typography: Plus Jakarta Sans for titles/subtitles; Space Grotesk for stats and ratings
- Micro-labels: Uppercase with letter-spacing 0.1em

Page Sections:
1. Navigation Bar with brand logo and fast WhatsApp action button
2. Hero Banner featuring a high-impact local proposition for residents of ${lead.city}
3. 4 Featured Service Cards with hover micro-interactions
4. "Why Choose Us" trust grid highlighting local presence and verified care
5. Google Maps address card: ${lead.address || `${lead.city}, SP`}
6. Floating sticky WhatsApp button linked to: ${lead.whatsappUrl || "https://wa.me/5513991234567"}

Ensure clean JSX output, modular components, and fluid responsive behavior across all mobile viewports.`;
    }
  },

  webild: {
    id: "webild",
    name: "Webild",
    badge: "AI Website Builder",
    category: "web_ai",
    tagline: "Construtor de sites com IA de alta velocidade para empresas e profissionais autônomos.",
    url: "https://www.webild.io/",
    placeholderUrl: "https://cliente.webild.io",
    iconName: "🌐",
    instructions: "Abra o Webild.io, inicie um novo site comercial com IA e utilize este prompt formatado.",
    formatPrompt: (basePrompt, lead) => {
      return `Crie um site comercial profissional, veloz e otimizado para o Google para ${lead.name}, empresa do ramo de ${lead.segment} em ${lead.city}/${lead.state}.

Estrutura recomendada no Webild:
1. Hero de Alto Impacto:
   - Título: ${lead.name} — Referência em ${lead.segment} em ${lead.city}
   - Subtítulo: Atendimento ágil, tratamentos modernos e agendamento direto pelo WhatsApp.
   - Botão Principal: "Solicitar Orçamento no WhatsApp" (${lead.whatsappUrl || "wa.me"})

2. Nossos Diferenciais:
   - Atendimento personalizado no bairro ${lead.address ? lead.address.split("-")[1] || lead.city : lead.city}
   - Equipamentos modernos e profissionais qualificados
   - Horários flexíveis e facilidade de pagamento

3. Catálogo de Serviços:
   - 4 serviços essenciais com descrição concisa orientada a benefícios

4. Prova Social e Avaliações:
   - Destaque para avaliação 5 estrelas e depoimentos de clientes da Baixada Santista

5. Contato e Localização:
   - Endereço: ${lead.address || `${lead.city}, SP`}
   - Botão de WhatsApp fixo no canto inferior direito para acesso imediato no smartphone`;
    }
  },

  emergent: {
    id: "emergent",
    name: "Emergent",
    badge: "Full App & Web",
    category: "web_ai",
    tagline: "Criação de web apps e páginas funcionais interativas com fluxo de agendamento no Emergent.",
    url: "https://app.emergent.sh/home",
    placeholderUrl: "https://app.emergent.sh/...",
    iconName: "🚀",
    instructions: "Acesse o app.emergent.sh/home, crie uma nova aplicação e cole este prompt para estruturar o fluxo.",
    formatPrompt: (basePrompt, lead) => {
      return `Build a modern, interactive single-page conversion application for "${lead.name}", specializing in ${lead.segment} located in ${lead.city}/${lead.state}.

Application Core Architecture:
1. Interactive Hero: Showcase the value proposition with an instant "Schedule / Contact" modal trigger.
2. Service Showcase: Dynamic list of treatments/services with estimated durations and direct WhatsApp inquiry buttons.
3. Appointment Request Flow: A simple 3-step interactive widget (Select Service -> Choose Day -> Send to WhatsApp: ${lead.phone || "(13) 99123-4567"}).
4. Local Reputation: Verified customer testimonials from ${lead.city} and Google rating badge.
5. Interactive Map & Hours: Full location card (${lead.address || `${lead.city}, SP`}) with opening hours and click-to-directions link.

Visual Style: Clean executive palette (Deep Teal & Mint), responsive layout, zero clutter, instant mobile loading.`;
    }
  }
};

export const PLATFORM_LIST: DemoPlatform[] = [
  "lovable",
  "v0",
  "codex",
  "antigravity_mcp",
  "anima",
  "webild",
  "emergent"
];
