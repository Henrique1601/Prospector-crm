import { useEffect, useState } from "react";
import { Check, Clock, Copy, Mic, Sparkles, Volume2, X } from "lucide-react";
import { api } from "./api";
import type { AudioScriptResult, Lead } from "./types";

interface ColdAudioScriptModalProps {
  lead: Lead;
  onClose: () => void;
  onLoggedInteraction?: (note: string) => void;
}

export function ColdAudioScriptModal({
  lead,
  onClose,
  onLoggedInteraction
}: ColdAudioScriptModalProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AudioScriptResult | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;
    api.getAudioScript(lead.id)
      .then((res) => {
        if (mounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [lead.id]);

  const handleCopy = async () => {
    if (!data) return;
    await navigator.clipboard.writeText(data.script);
    setCopied(true);
    onLoggedInteraction?.(`Copiou roteiro de áudio de prospecção da ${lead.name}.`);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="modal-wrap">
      <button className="drawer-scrim" onClick={onClose} aria-label="Fechar" />
      <div className="modal audio-script-modal" role="dialog" aria-labelledby="audio-title">
        <div className="section-title">
          <div>
            <span className="eyebrow">Prospecção Humanizada por Áudio</span>
            <h2 id="audio-title" className="audio-modal-title">
              <Mic size={20} className="text-teal" />
              Roteiro de Áudio para WhatsApp (30s)
            </h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Fechar">
            <X size={16} />
          </button>
        </div>

        <p className="roi-modal-desc">
          Mensagens de voz de 25 a 35 segundos têm taxa de abertura de mais de 90%. Use este roteiro sob medida para falar com <strong>{lead.name}</strong> de forma natural e sem parecer vendedor tradicional.
        </p>

        {loading ? (
          <div className="audit-loading-state">
            <Volume2 size={32} className="spin text-teal" />
            <p>Gerando roteiro de áudio natural para a {lead.name}...</p>
          </div>
        ) : !data ? (
          <div className="audit-empty-state">
            <p>Não foi possível gerar o roteiro de áudio.</p>
          </div>
        ) : (
          <div className="audio-script-content">
            {/* Header Metrics */}
            <div className="audio-metrics-row">
              <div className="audio-metric-pill">
                <Clock size={13} className="text-teal" />
                <span>Tempo de fala estimado: <strong>~{data.durationSeconds}s</strong></span>
              </div>
              <div className="audio-metric-pill">
                <Sparkles size={13} className="text-teal" />
                <span>Extensão: <strong>{data.wordsCount} palavras</strong></span>
              </div>
            </div>

            {/* Script Display */}
            <div className="audio-script-box">
              <div className="script-header">
                <strong>Roteiro Falado (com pausas e tom):</strong>
                <span className="script-badge">Tom Amigável & Direto</span>
              </div>

              <pre className="script-text">{data.script}</pre>
            </div>

            {/* Recording Tips */}
            <div className="audio-tips-box">
              <strong>💡 Dicas de ouro do Henrique para gravar:</strong>
              <ul>
                <li>Grave em ambiente silencioso e fale sorrindo (o tom de voz muda).</li>
                <li>Respeite as pausas de 1 segundo: elas passam sensação de segurança e respeito.</li>
                <li>Nunca envie áudio com mais de 45 segundos no primeiro contato.</li>
              </ul>
            </div>

            <div className="roi-actions-row">
              <button
                type="button"
                className={`primary btn-roi-action ${copied ? "copied" : ""}`}
                onClick={handleCopy}
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                <span>{copied ? "Roteiro Copiado!" : "Copiar Roteiro de Áudio"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
