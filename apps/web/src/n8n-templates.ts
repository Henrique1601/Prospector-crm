export interface N8nWorkflowTemplate {
  id: string;
  filename: string;
  title: string;
  badge: string;
  trigger: string;
  description: string;
  highlights: string[];
  jsonContent: string;
}

export const n8nWorkflows: N8nWorkflowTemplate[] = [
  {
    id: "wf-1",
    filename: "workflow-1-followup-digest.json",
    title: "Resumo Matinal de Follow-ups no WhatsApp",
    badge: "Cron Diário · 08:30",
    trigger: "Schedule Trigger (Segunda a Sexta às 08:30)",
    description:
      "Consulta o endpoint GET /api/leads, filtra contatos com follow-up agendado para hoje e dispara uma mensagem executiva formatada no WhatsApp de Henrique com links diretos de cada lead.",
    highlights: [
      "Fuso horário ajustado para o Brasil (America/Sao_Paulo)",
      "Destaca leads em 'Respondeu' aguardando reunião",
      "Links diretos de 1 clique para abrir o lead no CRM",
      "Envio via Evolution API (POST /message/sendText)"
    ],
    jsonContent: JSON.stringify(
      {
        name: "Prospector CRM - 01 - Resumo Matinal de Follow-ups (WhatsApp)",
        nodes: [
          {
            parameters: {
              rule: {
                interval: [{ field: "cronExpression", expression: "30 8 * * 1-5" }]
              }
            },
            id: "node-schedule-0830",
            name: "Disparo Matinal (08:30 Seg-Sex)",
            type: "n8n-nodes-base.scheduleTrigger",
            typeVersion: 1.2,
            position: [200, 300]
          },
          {
            parameters: {
              url: "={{ $env.PROSPECTOR_API_URL || 'https://api-prospector-delta.vercel.app' }}/api/leads",
              options: { response: { response: { fullResponse: false } } }
            },
            id: "node-get-leads",
            name: "Buscar Leads no CRM",
            type: "n8n-nodes-base.httpRequest",
            typeVersion: 4.2,
            position: [440, 300]
          },
          {
            parameters: {
              jsCode: `const leads = $input.all().map(item => item.json);
const now = new Date();
const brasilDateStr = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Sao_Paulo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
}).format(now);

const todayFollowUps = leads.filter(lead => {
  if (!lead.nextFollowUp) return false;
  const fDate = lead.nextFollowUp.substring(0, 10);
  return fDate === brasilDateStr && !['won', 'lost'].includes(lead.stage);
});

const repliedPending = leads.filter(lead => lead.stage === 'replied');
const hotLeads = leads.filter(lead => lead.priority === 'urgent' && ['new', 'analyzed'].includes(lead.stage)).slice(0, 3);
const totalFollowUps = todayFollowUps.length;
const crmWebUrl = $env.PROSPECTOR_WEB_URL || 'https://prospector-crm-pessoal.vercel.app';

let messageText = \`🌅 *Bom dia, Henrique!*\\nAqui está seu radar matinal do *Prospector CRM* (\${brasilDateStr}):\\n\\n\`;

if (totalFollowUps > 0) {
  messageText += \`📅 *Follow-ups Agendados para Hoje (\${totalFollowUps}):*\\n\`;
  todayFollowUps.forEach((lead, idx) => {
    messageText += \`\${idx + 1}. *\${lead.name}* (\${lead.segment || 'Geral'} · \${lead.city || 'Santos'})\\n\`;
    messageText += \`   👉 Ação: \${lead.nextAction || 'Entrar em contato'}\\n\`;
    messageText += \`   🔗 Link: \${crmWebUrl}/?lead=\${lead.id}\\n\\n\`;
  });
} else {
  messageText += \`✅ *Nenhum follow-up específico agendado para hoje.*\\n\\n\`;
}

if (repliedPending.length > 0) {
  messageText += \`💬 *Leads que Responderam aguardando avanço (\${repliedPending.length}):*\\n\`;
  repliedPending.slice(0, 3).forEach(lead => {
    messageText += \`• *\${lead.name}* (Score: \${lead.score}/100)\\n\`;
  });
  messageText += \`\\n\`;
}

messageText += \`🎯 *Meta do Dia:* 5 novas abordagens pelo Playbook.\\n👉 Acesse o CRM: \${crmWebUrl}\\n\\nBons fechamentos! 🚀\`;

return [{
  json: {
    messageText,
    totalFollowUps,
    recipientNumber: $env.HENRIQUE_WHATSAPP_NUMBER || '5513991383222'
  }
}];`
            },
            id: "node-filter-followups",
            name: "Filtrar Follow-ups & Gerar Texto",
            type: "n8n-nodes-base.code",
            typeVersion: 2,
            position: [680, 300]
          },
          {
            parameters: {
              method: "POST",
              url: "={{ $env.EVOLUTION_API_URL }}/message/sendText/{{ $env.EVOLUTION_INSTANCE || 'principal' }}",
              sendHeaders: true,
              headerParameters: {
                parameters: [
                  { name: "apikey", value: "={{ $env.EVOLUTION_API_KEY }}" },
                  { name: "Content-Type", value: "application/json" }
                ]
              },
              sendBody: true,
              specifyBody: "json",
              jsonBody: '={\n  "number": "{{ $json.recipientNumber }}",\n  "text": {{ JSON.stringify($json.messageText) }}\n}'
            },
            id: "node-send-whatsapp",
            name: "Enviar WhatsApp (Evolution API)",
            type: "n8n-nodes-base.httpRequest",
            typeVersion: 4.2,
            position: [920, 300]
          }
        ],
        connections: {
          "Disparo Matinal (08:30 Seg-Sex)": {
            main: [[{ node: "Buscar Leads no CRM", type: "main", index: 0 }]]
          },
          "Buscar Leads no CRM": {
            main: [[{ node: "Filtrar Follow-ups & Gerar Texto", type: "main", index: 0 }]]
          },
          "Filtrar Follow-ups & Gerar Texto": {
            main: [[{ node: "Enviar WhatsApp (Evolution API)", type: "main", index: 0 }]]
          }
        }
      },
      null,
      2
    )
  },
  {
    id: "wf-2",
    filename: "workflow-2-whatsapp-replies.json",
    title: "Lead Respondeu no WhatsApp (Auto Stage & Alerta)",
    badge: "Webhook · Tempo Real",
    trigger: "Webhook Evolution API (MESSAGES_UPSERT)",
    description:
      "Ao receber uma resposta de cliente no WhatsApp comercial, busca o lead pelo telefone, atualiza o estágio para 'Respondeu', insere o texto no histórico e alerta o WhatsApp de Henrique com notificação push.",
    highlights: [
      "Filtra mensagens enviadas por Henrique (fromMe: false)",
      "Ignora mensagens de grupos (@g.us)",
      "Atualiza estágio automaticamente via PATCH /api/leads/:id/stage",
      "Registra interação com data e hora via POST /api/leads/:id/interactions",
      "Alerta instantâneo no WhatsApp com nome da empresa e texto"
    ],
    jsonContent: JSON.stringify(
      {
        name: "Prospector CRM - 02 - Lead Respondeu no WhatsApp (Auto Stage & Alerta)",
        nodes: [
          {
            parameters: { httpMethod: "POST", path: "evolution-messages-upsert" },
            id: "node-webhook-evolution",
            name: "Webhook Evolution API (MESSAGES_UPSERT)",
            type: "n8n-nodes-base.webhook",
            typeVersion: 2,
            position: [180, 300]
          },
          {
            parameters: {
              jsCode: `const body = $input.first().json.body || $input.first().json;
const data = body.data || body;
const key = data.key || {};
const message = data.message || {};

if (key.fromMe === true) return [];
const remoteJid = key.remoteJid || '';
if (remoteJid.includes('@g.us') || remoteJid.includes('status@broadcast')) return [];

const rawNumber = remoteJid.split('@')[0] || '';
const senderPhone = rawNumber.replace(/\\D/g, '');
const messageText = message.conversation || message.extendedTextMessage?.text || message.imageMessage?.caption || '';
if (!messageText || messageText.trim() === '') return [];

return [{
  json: {
    senderPhone,
    messageText: messageText.trim(),
    pushName: data.pushName || 'Contato',
    timestamp: new Date().toISOString()
  }
}];`
            },
            id: "node-filter-evolution",
            name: "Filtrar Evento Evolution",
            type: "n8n-nodes-base.code",
            typeVersion: 2,
            position: [400, 300]
          },
          {
            parameters: {
              url: "={{ $env.PROSPECTOR_API_URL || 'https://api-prospector-delta.vercel.app' }}/api/leads",
              sendQuery: true,
              queryParameters: {
                parameters: [{ name: "phone", value: "={{ $json.senderPhone }}" }]
              }
            },
            id: "node-search-lead",
            name: "Buscar Lead no CRM por Telefone",
            type: "n8n-nodes-base.httpRequest",
            typeVersion: 4.2,
            position: [620, 300]
          },
          {
            parameters: {
              conditions: {
                conditions: [
                  {
                    leftValue: "={{ Array.isArray($json) ? $json.length : ($json.id ? 1 : 0) }}",
                    rightValue: 0,
                    operator: { type: "number", operation: "gt" }
                  }
                ]
              }
            },
            id: "node-if-lead-found",
            name: "Lead Encontrado no CRM?",
            type: "n8n-nodes-base.if",
            typeVersion: 2,
            position: [840, 300]
          },
          {
            parameters: {
              method: "PATCH",
              url: "={{ $env.PROSPECTOR_API_URL || 'https://api-prospector-delta.vercel.app' }}/api/leads/{{ Array.isArray($json) ? $json[0].id : $json.id }}/stage",
              sendHeaders: true,
              headerParameters: { parameters: [{ name: "Content-Type", value: "application/json" }] },
              sendBody: true,
              specifyBody: "json",
              jsonBody: '{\n  "stage": "replied"\n}'
            },
            id: "node-update-stage",
            name: "Atualizar Estágio para 'replied'",
            type: "n8n-nodes-base.httpRequest",
            typeVersion: 4.2,
            position: [1080, 220]
          },
          {
            parameters: {
              method: "POST",
              url: "={{ $env.PROSPECTOR_API_URL || 'https://api-prospector-delta.vercel.app' }}/api/leads/{{ $json.id }}/interactions",
              sendHeaders: true,
              headerParameters: { parameters: [{ name: "Content-Type", value: "application/json" }] },
              sendBody: true,
              specifyBody: "json",
              jsonBody:
                '={\n  "type": "whatsapp",\n  "content": {{ JSON.stringify("Cliente respondeu no WhatsApp: \\"" + $(\'Filtrar Evento Evolution\').item.json.messageText + "\\"") }}\n}'
            },
            id: "node-add-interaction",
            name: "Registrar Nota no Histórico",
            type: "n8n-nodes-base.httpRequest",
            typeVersion: 4.2,
            position: [1300, 220]
          },
          {
            parameters: {
              method: "POST",
              url: "={{ $env.EVOLUTION_API_URL }}/message/sendText/{{ $env.EVOLUTION_INSTANCE || 'principal' }}",
              sendHeaders: true,
              headerParameters: {
                parameters: [
                  { name: "apikey", value: "={{ $env.EVOLUTION_API_KEY }}" },
                  { name: "Content-Type", value: "application/json" }
                ]
              },
              sendBody: true,
              specifyBody: "json",
              jsonBody:
                '={\n  "number": "{{ $env.HENRIQUE_WHATSAPP_NUMBER || \'5513991383222\' }}",\n  "text": {{ JSON.stringify("🔔 *RESPOSTA RECEBIDA NO WHATSAPP!*\\n\\n🏢 *Empresa:* " + $json.name + "\\n📍 *Cidade:* " + ($json.city || \'Santos\') + "\\n📞 *Telefone:* " + ($json.phone || \'\') + "\\n\\n💬 *Mensagem do Cliente:*\\n\\"" + $(\'Filtrar Evento Evolution\').item.json.messageText + "\\"\\n\\n⚡ *Status:* Card movido para \'Respondeu\' automaticamente!\\n👉 *Abra o CRM para ver o roteiro de objeção:*\\n" + ($env.PROSPECTOR_WEB_URL || \'https://prospector-crm-pessoal.vercel.app\') + "/?lead=" + $json.id) }}\n}'
            },
            id: "node-alert-henrique",
            name: "Alertar WhatsApp Henrique",
            type: "n8n-nodes-base.httpRequest",
            typeVersion: 4.2,
            position: [1520, 220]
          }
        ],
        connections: {
          "Webhook Evolution API (MESSAGES_UPSERT)": {
            main: [[{ node: "Filtrar Evento Evolution", type: "main", index: 0 }]]
          },
          "Filtrar Evento Evolution": {
            main: [[{ node: "Buscar Lead no CRM por Telefone", type: "main", index: 0 }]]
          },
          "Buscar Lead no CRM por Telefone": {
            main: [[{ node: "Lead Encontrado no CRM?", type: "main", index: 0 }]]
          },
          "Lead Encontrado no CRM?": {
            main: [[{ node: "Atualizar Estágio para 'replied'", type: "main", index: 0 }]]
          },
          "Atualizar Estágio para 'replied'": {
            main: [[{ node: "Registrar Nota no Histórico", type: "main", index: 0 }]]
          },
          "Registrar Nota no Histórico": {
            main: [[{ node: "Alertar WhatsApp Henrique", type: "main", index: 0 }]]
          }
        }
      },
      null,
      2
    )
  },
  {
    id: "wf-3",
    filename: "workflow-3-apify-gmaps-prospector.json",
    title: "Scraper Google Maps (Apify) com Qualificação IA",
    badge: "Cron Semanal · Segunda 08:00",
    trigger: "Schedule Trigger (Segunda-feira 08:00) ou Disparo Manual",
    description:
      "Executa o crawler do Google Maps via Apify buscando nichos comerciais na Baixada Santista e envia os resultados em lote para o Webhook do CRM, onde o Gemini AI analisa o site, calcula o score e gera os roteiros prontos.",
    highlights: [
      "Rodízio automático de nichos (Odonto, Oficinas, Gastronomia, Estética)",
      "Coleta síncrona de dataset via API da Apify",
      "Normalização de telefone com DDD 13 automático",
      "Qualificação instantânea com Gemini AI no backend",
      "Notificação com contagem de leads inseridos no WhatsApp"
    ],
    jsonContent: JSON.stringify(
      {
        name: "Prospector CRM - 03 - Scraper Google Maps (Apify) com Qualificação IA",
        nodes: [
          {
            parameters: {
              rule: {
                interval: [{ field: "cronExpression", expression: "0 8 * * 1" }]
              }
            },
            id: "node-schedule-weekly",
            name: "Disparo Semanal (Segunda 08:00)",
            type: "n8n-nodes-base.scheduleTrigger",
            typeVersion: 1.2,
            position: [180, 300]
          },
          {
            parameters: {
              jsCode: `const niches = [
  { query: 'Clínica Odontológica em Santos SP', segment: 'Odontologia', city: 'Santos' },
  { query: 'Oficina Mecânica em Santos SP', segment: 'Oficina Mecânica', city: 'Santos' },
  { query: 'Restaurante em Santos SP', segment: 'Gastronomia', city: 'Santos' },
  { query: 'Clínica de Estética em Santos SP', segment: 'Estética', city: 'Santos' }
];
const selected = niches[0];
return [{ json: { searchQuery: selected.query, segment: selected.segment, city: selected.city, maxCrawledPlacesPerSearch: 10 } }];`
            },
            id: "node-setup-query",
            name: "Definir Nicho & Parâmetros",
            type: "n8n-nodes-base.code",
            typeVersion: 2,
            position: [400, 300]
          },
          {
            parameters: {
              method: "POST",
              url: "https://api.apify.com/v2/acts/compass~crawler-google-places/run-sync-get-dataset-items",
              sendQuery: true,
              queryParameters: { parameters: [{ name: "token", value: "={{ $env.APIFY_API_TOKEN }}" }] },
              sendHeaders: true,
              headerParameters: { parameters: [{ name: "Content-Type", value: "application/json" }] },
              sendBody: true,
              specifyBody: "json",
              jsonBody:
                '={\n  "searchStringsArray": ["{{ $json.searchQuery }}"],\n  "maxCrawledPlacesPerSearch": {{ $json.maxCrawledPlacesPerSearch || 10 }},\n  "language": "pt",\n  "countryCode": "br",\n  "skipClosedPlaces": true\n}'
            },
            id: "node-apify-scraper",
            name: "Apify Google Maps Scraper",
            type: "n8n-nodes-base.httpRequest",
            typeVersion: 4.2,
            position: [620, 300]
          },
          {
            parameters: {
              method: "POST",
              url: "={{ $env.PROSPECTOR_API_URL || 'https://api-prospector-delta.vercel.app' }}/api/webhooks/lead",
              sendHeaders: true,
              headerParameters: { parameters: [{ name: "Content-Type", value: "application/json" }] },
              sendBody: true,
              specifyBody: "json",
              jsonBody:
                '={\n  "empresa": "{{ $json.title || $json.name }}",\n  "segmento": "{{ $json.categoryName || \'Geral\' }}",\n  "cidade": "{{ $json.city || \'Santos\' }}",\n  "uf": "SP",\n  "telefone": "{{ $json.phoneUnformatted || $json.phone }}",\n  "website": "{{ $json.website || \'\' }}",\n  "origem": "Apify Google Maps (n8n)"\n}'
            },
            id: "node-post-crm-webhook",
            name: "Enviar para Webhook CRM (com IA)",
            type: "n8n-nodes-base.httpRequest",
            typeVersion: 4.2,
            position: [840, 300]
          }
        ],
        connections: {
          "Disparo Semanal (Segunda 08:00)": {
            main: [[{ node: "Definir Nicho & Parâmetros", type: "main", index: 0 }]]
          },
          "Definir Nicho & Parâmetros": {
            main: [[{ node: "Apify Google Maps Scraper", type: "main", index: 0 }]]
          },
          "Apify Google Maps Scraper": {
            main: [[{ node: "Enviar para Webhook CRM (com IA)", type: "main", index: 0 }]]
          }
        }
      },
      null,
      2
    )
  }
];
