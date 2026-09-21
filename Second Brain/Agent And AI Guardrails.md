---
type: policy
status: active
tags:
  - ai
  - safety
---

# Agent And AI Guardrails

## O agente pode

- Organizar dados fornecidos.
- Pesquisar fontes públicas quando uma integração autorizada estiver disponível.
- Sugerir score, oportunidade, abordagem e próxima ação.
- Preparar briefing de demonstração.
- Apontar inconsistências e dados ainda não confirmados.

## O agente não pode sem aprovação

- Enviar WhatsApp, e-mail ou mensagem social.
- Comprar dados, créditos ou serviços.
- Publicar uma demonstração.
- Alterar propostas ou preços enviados.
- Excluir histórico comercial.

## Padrão de evidência

Classifique cada conclusão como:

- **Confirmado:** apoiado por fonte identificada.
- **Inferência:** interpretação explícita de sinais confirmados.
- **Não confirmado:** ainda requer pesquisa.

## Segurança de credenciais

- Nunca colocar chaves no frontend, em notas ou no Git.
- Usar somente `.env` local no backend.
- Revogar qualquer chave exposta em conversa, print ou commit.
- Definir limite de gasto quando o provedor permitir.

## Linguagem de abordagem

Não afirmar “vocês não têm site” quando a pesquisa apenas não encontrou um site. Preferir “não encontrei um site próprio” ou uma formulação neutra.

Relacionadas: [[Product Vision]] · [[Sales Playbook]] · [[Decision Log]]
