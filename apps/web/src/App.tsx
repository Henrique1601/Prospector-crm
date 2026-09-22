import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowRight, BarChart3, Bot, BriefcaseBusiness, CalendarClock, Check, ChevronRight, CircleGauge, ExternalLink, LayoutDashboard, ListFilter, MessageSquareText, Plus, Search, Sparkles, Target, Users, X } from "lucide-react";
import { api } from "./api";
import type { DashboardData, Lead, Stage } from "./types";

const stageLabels: Record<Stage, string> = { new: "Novo", analyzed: "Analisado", contacted: "Contatado", replied: "Respondeu", meeting: "Reunião", proposal: "Proposta", won: "Fechado", lost: "Perdido" };
const mainStages: Stage[] = ["new", "analyzed", "contacted", "replied", "meeting", "proposal", "won"];

function Score({ value }: { value: number }) {
  return <div className="score" style={{ "--score": `${value * 3.6}deg` } as React.CSSProperties}><span>{value || "–"}</span></div>;
}

function StagePill({ stage }: { stage: Stage }) { return <span className={`stage stage-${stage}`}>{stageLabels[stage]}</span>; }

function Metric({ label, value, note, icon: Icon }: { label: string; value: string | number; note: string; icon: typeof Users }) {
  return <article className="metric"><div className="metric-icon"><Icon size={18} /></div><div><span>{label}</span><strong>{value}</strong><small>{note}</small></div></article>;
}

function LeadDrawer({ lead, onClose, onChanged }: { lead: Lead; onClose: () => void; onChanged: (lead: Lead) => void }) {
  const [busy, setBusy] = useState(""); const [note, setNote] = useState("");
  const act = async (name: string, fn: () => Promise<Lead>) => { setBusy(name); try { onChanged(await fn()); } finally { setBusy(""); } };
  const copyMessage = async () => { if (lead.suggestedMessage) await navigator.clipboard.writeText(lead.suggestedMessage); };
  return <div className="drawer-wrap" role="dialog" aria-modal="true" aria-label={`Detalhes de ${lead.name}`}>
    <button className="drawer-scrim" onClick={onClose} aria-label="Fechar detalhes" />
    <aside className="drawer">
      <header><div><span className="eyebrow">Ficha do lead</span><h2>{lead.name}</h2><p>{lead.segment} · {lead.city}, {lead.state}</p></div><button className="icon-button" onClick={onClose} aria-label="Fechar"><X /></button></header>
      <div className="drawer-score"><Score value={lead.score} /><div><StagePill stage={lead.stage} /><strong>{lead.priority === "urgent" ? "Prioridade urgente" : lead.priority === "high" ? "Alta prioridade" : "Em avaliação"}</strong><small>{lead.nextAction}</small></div></div>
      <section><div className="section-title"><h3>Diagnóstico comercial</h3>{lead.mapsUrl && <a href={lead.mapsUrl} target="_blank" rel="noreferrer">Ver no Maps <ExternalLink size={13} /></a>}</div>
        <p>{lead.reason || "Este lead ainda não foi analisado. A pesquisa deve confirmar os fatos antes da abordagem."}</p>
        {lead.opportunity && <div className="callout"><Target size={17} /><div><small>Oportunidade</small><strong>{lead.opportunity}</strong></div></div>}
        <button className="secondary full" disabled={busy === "analyze"} onClick={() => act("analyze", () => api.analyze(lead.id))}><Sparkles size={16} />{busy === "analyze" ? "Analisando…" : lead.analyzedAt ? "Analisar novamente" : "Pesquisar e analisar"}</button>
      </section>
      <section><div className="section-title"><h3>Abordagem sugerida</h3>{lead.suggestedMessage && <button className="text-button" onClick={copyMessage}>Copiar</button>}</div>
        <div className="message-box">{lead.suggestedMessage || "A abordagem aparecerá aqui depois da análise."}</div>
        <label className="field"><span>Estágio do relacionamento</span><select value={lead.stage} onChange={(e) => act("stage", () => api.stage(lead.id, e.target.value as Stage))}>{mainStages.concat("lost").map((stage) => <option key={stage} value={stage}>{stageLabels[stage]}</option>)}</select></label>
      </section>
      <section><div className="section-title"><h3>Demonstração</h3></div>{lead.demoBrief ? <pre className="brief">{lead.demoBrief}</pre> : <p>Gere um briefing de landing page usando somente os dados conhecidos deste lead.</p>}
        <button className="primary full" disabled={busy === "demo"} onClick={() => act("demo", () => api.demo(lead.id))}><Bot size={16} />{busy === "demo" ? "Preparando…" : "Gerar briefing da demonstração"}</button>
      </section>
      <section><h3>Histórico</h3><div className="note-row"><input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Registrar uma observação…" /><button disabled={!note.trim()} onClick={() => act("note", async () => { const updated = await api.interaction(lead.id, note); setNote(""); return updated; })}><ArrowRight /></button></div>
        <div className="timeline">{lead.interactions.length ? lead.interactions.map((item) => <div key={item.id}><i /><p>{item.content}<small>{new Date(item.createdAt).toLocaleString("pt-BR")}</small></p></div>) : <p className="empty">Nenhuma interação registrada.</p>}</div>
      </section>
    </aside>
  </div>;
}

function AddLead({ onClose, onCreated }: { onClose: () => void; onCreated: (lead: Lead) => void }) {
  const [form, setForm] = useState({ name: "", segment: "", city: "Santos", state: "SP" }); const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => { e.preventDefault(); setBusy(true); try { onCreated(await api.add(form)); } finally { setBusy(false); } };
  return <div className="modal-wrap"><button className="drawer-scrim" onClick={onClose} aria-label="Fechar" /><form className="modal" onSubmit={submit}><div className="section-title"><div><span className="eyebrow">Nova oportunidade</span><h2>Adicionar empresa</h2></div><button type="button" className="icon-button" onClick={onClose}><X /></button></div>
    <label className="field"><span>Nome da empresa</span><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
    <label className="field"><span>Segmento</span><input required value={form.segment} onChange={(e) => setForm({ ...form, segment: e.target.value })} placeholder="Ex.: Barbearia" /></label>
    <div className="form-grid"><label className="field"><span>Cidade</span><input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></label><label className="field"><span>UF</span><input required maxLength={2} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })} /></label></div>
    <button className="primary full" disabled={busy}>{busy ? "Adicionando…" : "Adicionar ao pipeline"}</button></form></div>;
}

export function App() {
  const [leads, setLeads] = useState<Lead[]>([]); const [dashboard, setDashboard] = useState<DashboardData | null>(null); const [selected, setSelected] = useState<Lead | null>(null); const [query, setQuery] = useState(""); const [filter, setFilter] = useState<Stage | "all">("all"); const [addOpen, setAddOpen] = useState(false); const [aiMode, setAiMode] = useState("local"); const [storageMode, setStorageMode] = useState<"local-file" | "temporary" | "neon">("local-file"); const [error, setError] = useState("");
  const load = async () => { try { const [all, data, health] = await Promise.all([api.leads(), api.dashboard(), api.health()]); setLeads(all); setDashboard(data); setAiMode(health.mode); setStorageMode(health.storage); } catch (e) { setError(e instanceof Error ? e.message : "A API não respondeu"); } };
  useEffect(() => { void load(); }, []);
  const visible = useMemo(() => leads.filter((lead) => (filter === "all" || lead.stage === filter) && `${lead.name} ${lead.segment} ${lead.city}`.toLowerCase().includes(query.toLowerCase())), [leads, filter, query]);
  const followUps = useMemo(() => leads.filter((lead) => lead.nextFollowUp).sort((a, b) => new Date(a.nextFollowUp!).getTime() - new Date(b.nextFollowUp!).getTime()), [leads]);
  const changed = (lead: Lead) => { setLeads((items) => items.map((item) => item.id === lead.id ? lead : item)); setSelected(lead); void load(); };
  const analyzeNext = async () => { const lead = leads.find((item) => item.stage === "new"); if (!lead) return; setSelected(lead); changed(await api.analyze(lead.id)); };
  const today = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).format(new Date());
  return <div className="shell">
    <aside className="sidebar"><a className="brand" href="#top" aria-label="Prospector"><span><CircleGauge /></span><div><strong>prospector</strong><small>por Henrique</small></div></a><nav><a className="active" href="#top"><LayoutDashboard />Visão geral</a><a href="#pipeline"><Users />Leads</a><a href="#followups"><CalendarClock />Follow-ups</a><a href="#analytics"><BarChart3 />Analytics</a></nav><div className="agent-card"><div><Bot /><span className="live-dot" /></div><strong>Agente em modo {aiMode === "aisa" ? "AIsa" : "local"}</strong><p>{aiMode === "aisa" ? "Pronto para gerar análises com IA." : "Simulação segura, sem consumo de créditos."}</p></div><div className="profile"><span>HB</span><div><strong>Henrique Bezerra</strong><small>Desenvolvedor Full-Stack</small></div></div></aside>
    <main id="top"><header className="topbar"><div><span className="eyebrow">{today}</span><h1>Seu radar comercial</h1><p>Veja os sinais mais promissores e decida o próximo movimento.</p></div><button className="primary" onClick={() => setAddOpen(true)}><Plus />Adicionar empresa</button></header>
      {error && <div className="error-banner">{error}. Execute <code>npm run dev</code> na raiz do projeto.</div>}
      <section className="metrics" aria-label="Resumo do funil"><Metric label="Leads mapeados" value={dashboard?.total ?? "–"} note="base ativa" icon={Users} /><Metric label="Alta prioridade" value={dashboard?.highPriority ?? "–"} note="merecem atenção" icon={Target} /><Metric label="Taxa de resposta" value={`${dashboard?.responseRate ?? 0}%`} note={`${dashboard?.replies ?? 0} respostas registradas`} icon={MessageSquareText} /><Metric label="Negócios fechados" value={dashboard?.won ?? "–"} note="neste ciclo" icon={BriefcaseBusiness} /></section>
      <section className="command"><div className="command-copy"><span className="eyebrow">Próxima melhor ação</span><h2>{leads.some((lead) => lead.stage === "new") ? `${leads.filter((lead) => lead.stage === "new").length} empresas aguardam análise` : "Fila de análise concluída"}</h2><p>O agente organiza os fatos e sugere uma abordagem. Você revisa antes de qualquer contato.</p><button className="signal-button" onClick={analyzeNext} disabled={!leads.some((lead) => lead.stage === "new")}><Sparkles />Analisar próximo lead <ChevronRight /></button></div><div className="radar" aria-hidden="true"><span /><span /><span /><i /></div><div className="attention"><span>Em foco agora</span>{leads.filter((lead) => lead.score > 0).slice(0, 3).map((lead) => <button key={lead.id} onClick={() => setSelected(lead)}><Score value={lead.score} /><div><strong>{lead.name}</strong><small>{lead.nextAction}</small></div><ChevronRight /></button>)}</div></section>
      <section className="followups" id="followups"><div className="section-heading"><div><span className="eyebrow">Agenda comercial</span><h2>Próximos follow-ups</h2></div><span>{followUps.length} agendado{followUps.length === 1 ? "" : "s"}</span></div><div className="followup-list">{followUps.length ? followUps.slice(0, 4).map((lead) => <button key={lead.id} onClick={() => setSelected(lead)}><span className="followup-date"><strong>{new Date(lead.nextFollowUp!).toLocaleDateString("pt-BR", { day: "2-digit" })}</strong><small>{new Date(lead.nextFollowUp!).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}</small></span><span><strong>{lead.name}</strong><small>{lead.nextAction || "Retomar contato"}</small></span><ChevronRight /></button>) : <div className="followup-empty"><Check /><span><strong>Agenda em dia</strong><small>Defina a próxima data de contato na ficha de um lead.</small></span></div>}</div></section>
      <section className="funnel" id="analytics"><div className="section-heading"><div><span className="eyebrow">Funil em movimento</span><h2>Da descoberta ao contrato</h2></div><span>{dashboard?.contacted ?? 0} contatos iniciados</span></div><div className="funnel-row">{mainStages.map((stage, index) => <button key={stage} onClick={() => setFilter(stage)}><small>{String(index + 1).padStart(2, "0")}</small><strong>{dashboard?.stages?.[stage] ?? 0}</strong><span>{stageLabels[stage]}</span></button>)}</div></section>
      <section className="pipeline" id="pipeline"><div className="section-heading"><div><span className="eyebrow">Base comercial</span><h2>Leads e oportunidades</h2></div><div className="tools"><label><Search /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar empresa, cidade…" /></label><button className="filter-button" onClick={() => setFilter(filter === "all" ? "new" : "all")}><ListFilter />{filter === "all" ? "Todos" : stageLabels[filter]}</button></div></div>
        <div className="table-wrap"><table><thead><tr><th>Empresa</th><th>Sinal</th><th>Estágio</th><th>Próxima ação</th><th /></tr></thead><tbody>{visible.map((lead) => <tr key={lead.id} onClick={() => setSelected(lead)}><td><div className="company"><span>{lead.name.slice(0, 2).toUpperCase()}</span><div><strong>{lead.name}</strong><small>{lead.segment} · {lead.city}</small></div></div></td><td><div className="score-cell"><Score value={lead.score} /><span className={`priority priority-${lead.priority}`}>{lead.priority === "urgent" ? "Urgente" : lead.priority === "high" ? "Alta" : lead.score ? "Média" : "A avaliar"}</span></div></td><td><StagePill stage={lead.stage} /></td><td><span className="next-action">{lead.nextAction || "Pesquisar presença digital"}</span></td><td><button className="icon-button" aria-label={`Abrir ${lead.name}`}><ChevronRight /></button></td></tr>)}</tbody></table>{!visible.length && <div className="empty-state"><Search /><h3>Nenhum lead encontrado</h3><p>Ajuste a busca ou volte a exibir todos os estágios.</p></div>}</div>
      </section>
      <footer><span>Prospector CRM · decisões humanas, inteligência assistida</span><span><Activity size={14} /> {storageMode === "neon" ? "Dados persistidos com Neon" : storageMode === "temporary" ? "Dados temporários nesta demonstração" : "Dados salvos localmente"}</span></footer>
    </main>
    <nav className="mobile-nav" aria-label="Navegação principal"><a href="#top"><LayoutDashboard /><span>Visão geral</span></a><a href="#pipeline"><Users /><span>Leads</span></a><a href="#followups"><CalendarClock /><span>Follow-ups</span>{followUps.length > 0 && <b>{followUps.length}</b>}</a><a href="#analytics"><BarChart3 /><span>Analytics</span></a></nav>
    {selected && <LeadDrawer lead={selected} onClose={() => setSelected(null)} onChanged={changed} />}{addOpen && <AddLead onClose={() => setAddOpen(false)} onCreated={(lead) => { setLeads((items) => [lead, ...items]); setAddOpen(false); setSelected(lead); void load(); }} />}
  </div>;
}
