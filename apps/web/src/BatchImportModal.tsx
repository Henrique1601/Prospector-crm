import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckSquare,
  Database,
  ExternalLink,
  FileSpreadsheet,
  Globe,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Sparkles,
  Square,
  Trash2,
  UploadCloud,
  X
} from "lucide-react";
import { api } from "./api";
import type { Lead, ResolvedPlacePreview } from "./types";

interface BatchImportModalProps {
  onClose: () => void;
  onImported: (newLeads: Lead[]) => void;
}

type ImportTab = "maps" | "csv" | "notion";

export function BatchImportModal({ onClose, onImported }: BatchImportModalProps) {
  const [activeTab, setActiveTab] = useState<ImportTab>("maps");
  const [step, setStep] = useState<"input" | "review">("input");

  // Maps tab state
  const [mapsText, setMapsText] = useState("");

  // CSV tab state
  const [csvContent, setCsvContent] = useState("");
  const [fileName, setFileName] = useState("");

  // Notion tab state
  const [notionDbId, setNotionDbId] = useState("");
  const [notionApiKey, setNotionApiKey] = useState("");
  const [notionEnvStatus, setNotionEnvStatus] = useState<{ configured: boolean; hasKey: boolean; hasDatabaseId: boolean } | null>(null);

  // General processing state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [previews, setPreviews] = useState<ResolvedPlacePreview[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Record<number, boolean>>({});

  // Auto-analyze with AI is ENABLED BY DEFAULT as requested!
  const [autoAnalyze, setAutoAnalyze] = useState(true);

  // Check Notion status on mount
  useEffect(() => {
    api.notionStatus().then(setNotionEnvStatus).catch(() => {});
  }, []);

  // Extract all Google Maps URLs from text
  const extractUrls = (text: string): string[] => {
    const regex = /https?:\/\/(?:[a-zA-Z0-9.-]+\.)?(?:google\.com\/maps|maps\.app\.goo\.gl|goo\.gl\/maps)[^\s"'<>]+/gi;
    const matches = text.match(regex) || [];
    return [...new Set(matches.map((m) => m.trim()))];
  };

  const detectedUrls = extractUrls(mapsText);

  const handleProcessMaps = async () => {
    if (!detectedUrls.length) {
      setError("Nenhum link válido do Google Maps foi encontrado.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const results = await api.resolveMaps(detectedUrls);
      showReview(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar links do Google Maps");
    } finally {
      setLoading(false);
    }
  };

  const handleProcessCsv = async (contentToUse?: string) => {
    const text = contentToUse || csvContent;
    if (!text.trim()) {
      setError("Conteúdo CSV vazio. Cole o texto ou carregue um arquivo.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const results = await api.previewCsv(text);
      if (!results.length) {
        setError("Nenhuma linha de dados encontrada no arquivo CSV/TXT.");
        return;
      }
      showReview(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao ler dados do CSV/TXT");
    } finally {
      setLoading(false);
    }
  };

  const handleProcessNotion = async () => {
    setError("");
    setLoading(true);
    try {
      const results = await api.previewNotion(notionDbId.trim() || undefined, notionApiKey.trim() || undefined);
      if (!results.length) {
        setError("Nenhum registro encontrado no banco de dados do Notion.");
        return;
      }
      showReview(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao conectar com o Notion");
    } finally {
      setLoading(false);
    }
  };

  const showReview = (results: ResolvedPlacePreview[]) => {
    setPreviews(results);
    const initialSelection: Record<number, boolean> = {};
    results.forEach((item, index) => {
      initialSelection[index] = !item.isDuplicate && !item.error;
    });
    setSelectedIndices(initialSelection);
    setStep("review");
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) readFile(file);
  };

  const readFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = String(event.target?.result || "");
      setCsvContent(text);
    };
    reader.readAsText(file);
  };

  const toggleSelect = (index: number) => {
    setSelectedIndices((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const toggleSelectAll = () => {
    const allSelected = previews.every((_, i) => selectedIndices[i]);
    const next: Record<number, boolean> = {};
    previews.forEach((p, i) => {
      next[i] = !allSelected && !p.error;
    });
    setSelectedIndices(next);
  };

  const updatePreviewField = (index: number, field: keyof ResolvedPlacePreview, value: string) => {
    setPreviews((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, [field]: value };
        if (field === "phone") {
          const rawDigits = value.replace(/\D/g, "");
          let cleanDigits = rawDigits.startsWith("55") && rawDigits.length >= 12 ? rawDigits.slice(2) : rawDigits;
          if (cleanDigits.length === 8 || cleanDigits.length === 9) cleanDigits = `13${cleanDigits}`;
          const hasWa = cleanDigits.length >= 10 || value.includes("wa.me");
          updated.hasWhatsapp = hasWa;
          updated.whatsappUrl = hasWa && cleanDigits.length >= 10 ? `https://wa.me/55${cleanDigits}` : undefined;
        }
        return updated;
      })
    );
  };

  const togglePreviewWhatsapp = (index: number) => {
    setPreviews((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const nextWa = !item.hasWhatsapp;
        const rawDigits = (item.phone || "").replace(/\D/g, "");
        let cleanDigits = rawDigits.startsWith("55") && rawDigits.length >= 12 ? rawDigits.slice(2) : rawDigits;
        if (cleanDigits.length === 8 || cleanDigits.length === 9) cleanDigits = `13${cleanDigits}`;
        return {
          ...item,
          hasWhatsapp: nextWa,
          whatsappUrl: nextWa && cleanDigits.length >= 10 ? `https://wa.me/55${cleanDigits}` : undefined
        };
      })
    );
  };

  const removePreview = (index: number) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    const nextSel: Record<number, boolean> = {};
    Object.entries(selectedIndices).forEach(([k, v]) => {
      const num = Number(k);
      if (num < index) nextSel[num] = v;
      else if (num > index) nextSel[num - 1] = v;
    });
    setSelectedIndices(nextSel);
  };

  const selectedCount = Object.values(selectedIndices).filter(Boolean).length;

  const handleConfirmImport = async () => {
    const leadsToImport = previews
      .filter((_, index) => selectedIndices[index])
      .map((item) => {
        const rawDigits = (item.phone || "").replace(/\D/g, "");
        let cleanDigits = rawDigits.startsWith("55") && rawDigits.length >= 12 ? rawDigits.slice(2) : rawDigits;
        if (cleanDigits.length === 8 || cleanDigits.length === 9) {
          cleanDigits = `13${cleanDigits}`;
        }
        const hasWaUrl = Boolean(
          item.whatsappUrl ||
          (item.website || "").includes("wa.me") ||
          (item.website || "").includes("whatsapp") ||
          (item.phone || "").includes("wa.me") ||
          (item.phone || "").includes("whatsapp")
        );
        const hasWhatsapp = Boolean(item.hasWhatsapp || hasWaUrl || cleanDigits.length >= 10);
        const whatsappUrl = item.whatsappUrl || (hasWhatsapp && cleanDigits.length >= 10 ? `https://wa.me/55${cleanDigits}` : undefined);
        return {
          name: item.name,
          segment: item.segment,
          city: item.city,
          state: item.state,
          address: item.address,
          mapsUrl: item.mapsUrl,
          website: item.website,
          phone: item.phone,
          whatsappUrl,
          hasWhatsapp,
          siteStatus: item.siteStatus,
          digitalPresence: item.digitalPresence as "unknown" | "low" | "medium" | "high"
        };
      });

    if (!leadsToImport.length) {
      setError("Selecione ao menos uma empresa para importar.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const res = await api.batchAdd(leadsToImport, autoAnalyze);
      onImported(res.leads);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar empresas importadas");
      setSaving(false);
    }
  };

  return (
    <div className="modal-wrap" role="dialog" aria-modal="true">
      <button className="drawer-scrim" onClick={onClose} aria-label="Fechar" />
      <div className="batch-modal">
        <header className="batch-modal-header">
          <div>
            <span className="eyebrow">Central de Importação em Massa</span>
            <h2>{step === "input" ? "Importar empresas para o Prospector" : "Conferência e Validação dos Leads"}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Fechar">
            <X />
          </button>
        </header>

        {error && <div className="error-banner">{error}</div>}

        {step === "input" ? (
          <div className="batch-input-view">
            <div className="import-tabs" role="tablist">
              <button
                type="button"
                className={`tab-btn ${activeTab === "maps" ? "active" : ""}`}
                onClick={() => { setActiveTab("maps"); setError(""); }}
              >
                <MapPin size={16} /> Google Maps
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === "csv" ? "active" : ""}`}
                onClick={() => { setActiveTab("csv"); setError(""); }}
              >
                <FileSpreadsheet size={16} /> Planilha / CSV / TXT
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === "notion" ? "active" : ""}`}
                onClick={() => { setActiveTab("notion"); setError(""); }}
              >
                <Database size={16} /> Banco Notion
              </button>
            </div>

            {/* TAB 1: GOOGLE MAPS */}
            {activeTab === "maps" && (
              <div className="tab-content">
                <p className="batch-helper-text">
                  Cole um ou vários links do Google Maps (um por linha ou em texto corrido). Extrai nome, endereço,
                  telefone, detecta WhatsApp e checa se o negócio tem site próprio.
                </p>

                <label className="field">
                  <span className="field-label-row">
                    <span>Links do Google Maps</span>
                    <span className="url-counter">
                      {detectedUrls.length} link{detectedUrls.length === 1 ? "" : "s"} detectado{detectedUrls.length === 1 ? "" : "s"}
                    </span>
                  </span>
                  <textarea
                    rows={6}
                    value={mapsText}
                    onChange={(e) => setMapsText(e.target.value)}
                    placeholder="Cole aqui os links:&#10;https://maps.app.goo.gl/abc123&#10;https://www.google.com/maps/place/Oficina+Mecanica+Santos/@-23.95,-46.33,17z"
                    className="batch-textarea"
                  />
                </label>

                <footer className="batch-actions">
                  <button className="secondary" onClick={onClose}>Cancelar</button>
                  <button
                    className="primary"
                    disabled={loading || detectedUrls.length === 0}
                    onClick={handleProcessMaps}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="spin" /> Processando {detectedUrls.length} links…
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} /> Extrair dados do Maps ({detectedUrls.length})
                      </>
                    )}
                  </button>
                </footer>
              </div>
            )}

            {/* TAB 2: CSV / TXT */}
            {activeTab === "csv" && (
              <div className="tab-content">
                <p className="batch-helper-text">
                  Arraste ou selecione seu arquivo <code>.csv</code> ou <code>.txt</code> exportado do Excel, Google Sheets ou bases de empresas.
                  Detecta automaticamente delimitadores (<code>,</code> e <code>;</code>) e colunas de Empresa, Telefone, WhatsApp, Cidade e Site.
                </p>

                <div
                  className="dropzone"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                >
                  <UploadCloud size={32} className="dropzone-icon" />
                  <strong>Arraste o arquivo CSV ou TXT aqui</strong>
                  <p>ou clique para selecionar do seu computador</p>
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileInput}
                    className="dropzone-input"
                  />
                  {fileName && <span className="dropzone-file"><Check size={14} /> {fileName}</span>}
                </div>

                <div className="or-divider"><span>ou cole o texto da planilha diretamente</span></div>

                <textarea
                  rows={4}
                  value={csvContent}
                  onChange={(e) => setCsvContent(e.target.value)}
                  placeholder="Empresa;Segmento;Cidade;Telefone;Site&#10;Barbearia Santos;Barbearia;Santos;(13) 99712-3456;https://barbearia.com.br"
                  className="batch-textarea"
                />

                <footer className="batch-actions">
                  <button className="secondary" onClick={onClose}>Cancelar</button>
                  <button
                    className="primary"
                    disabled={loading || !csvContent.trim()}
                    onClick={() => handleProcessCsv()}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="spin" /> Processando planilha…
                      </>
                    ) : (
                      <>
                        <FileSpreadsheet size={16} /> Processar dados da planilha
                      </>
                    )}
                  </button>
                </footer>
              </div>
            )}

            {/* TAB 3: NOTION */}
            {activeTab === "notion" && (
              <div className="tab-content">
                <p className="batch-helper-text">
                  Conecte diretamente à sua base de dados no <strong>Notion</strong> para importar páginas de leads.
                  As colunas de Título, Seleção, Telefone e URL são mapeadas automaticamente para o pipeline.
                </p>

                <div className="notion-config-box">
                  {notionEnvStatus?.configured ? (
                    <div className="notion-connected-alert">
                      <Check size={16} />
                      <div>
                        <strong>Notion configurado no servidor (.env)</strong>
                        <small>Pronto para importar da base padrão ou informe outro Database ID abaixo.</small>
                      </div>
                    </div>
                  ) : (
                    <div className="notion-info-alert">
                      <Database size={16} />
                      <div>
                        <strong>Conectar com Token do Notion</strong>
                        <small>Informe seu Token de Integração e o Database ID da base de dados.</small>
                      </div>
                    </div>
                  )}

                  <label className="field">
                    <span>ID da Base de Dados do Notion (Database ID)</span>
                    <input
                      value={notionDbId}
                      onChange={(e) => setNotionDbId(e.target.value)}
                      placeholder={notionEnvStatus?.hasDatabaseId ? "Usando NOTION_DATABASE_ID padrão (ou digite outro)" : "Ex: 2795a0bc092843bb92..."}
                    />
                  </label>

                  {!notionEnvStatus?.hasKey && (
                    <label className="field">
                      <span>Token de Integração do Notion (secret_...)</span>
                      <input
                        type="password"
                        value={notionApiKey}
                        onChange={(e) => setNotionApiKey(e.target.value)}
                        placeholder="secret_..."
                      />
                    </label>
                  )}
                </div>

                <footer className="batch-actions">
                  <button className="secondary" onClick={onClose}>Cancelar</button>
                  <button
                    className="primary"
                    disabled={loading || (!notionEnvStatus?.configured && (!notionDbId.trim() || !notionApiKey.trim()))}
                    onClick={handleProcessNotion}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="spin" /> Consultando base do Notion…
                      </>
                    ) : (
                      <>
                        <Database size={16} /> Puxar leads do Notion
                      </>
                    )}
                  </button>
                </footer>
              </div>
            )}
          </div>
        ) : (
          /* STEP 2: UNIFIED REVIEW TABLE */
          <div className="batch-review-view">
            <div className="review-toolbar">
              <button className="text-button select-all-btn" onClick={toggleSelectAll}>
                {previews.every((_, i) => selectedIndices[i]) ? (
                  <>
                    <CheckSquare size={16} /> Desmarcar todos
                  </>
                ) : (
                  <>
                    <Square size={16} /> Selecionar todos ({previews.length})
                  </>
                )}
              </button>
              <span className="review-count">
                <strong>{selectedCount}</strong> de <strong>{previews.length}</strong> selecionadas para o pipeline
              </span>
            </div>

            <div className="review-table-wrap">
              <table className="review-table">
                <thead>
                  <tr>
                    <th style={{ width: "40px" }} />
                    <th>Empresa & Segmento</th>
                    <th>Localização</th>
                    <th>Telefone & WhatsApp</th>
                    <th>Website / Presença</th>
                    <th>Status</th>
                    <th style={{ width: "40px" }} />
                  </tr>
                </thead>
                <tbody>
                  {previews.map((item, idx) => {
                    const isSelected = Boolean(selectedIndices[idx]);
                    return (
                      <tr key={idx} className={isSelected ? "row-selected" : "row-unselected"}>
                        <td>
                          <button
                            type="button"
                            className="checkbox-button"
                            onClick={() => toggleSelect(idx)}
                            aria-label={isSelected ? "Desmarcar" : "Selecionar"}
                          >
                            {isSelected ? <CheckSquare size={18} className="icon-checked" /> : <Square size={18} />}
                          </button>
                        </td>
                        <td>
                          <div className="edit-cell">
                            <input
                              className="inline-input bold"
                              value={item.name}
                              onChange={(e) => updatePreviewField(idx, "name", e.target.value)}
                              placeholder="Nome da empresa"
                            />
                            <input
                              className="inline-input small"
                              value={item.segment}
                              onChange={(e) => updatePreviewField(idx, "segment", e.target.value)}
                              placeholder="Segmento"
                            />
                          </div>
                        </td>
                        <td>
                          <div className="location-cell">
                            <span>{item.city}, {item.state}</span>
                            {item.address && <small title={item.address}>{item.address}</small>}
                          </div>
                        </td>
                        <td>
                          <div className="phone-cell">
                            <input
                              className="inline-input small"
                              value={item.phone || ""}
                              onChange={(e) => updatePreviewField(idx, "phone", e.target.value)}
                              placeholder="(13) 99999-9999"
                            />
                            {item.phone ? (
                              <button
                                type="button"
                                className={`badge-pill-toggle ${item.hasWhatsapp ? "badge-whatsapp active" : "badge-landline"}`}
                                onClick={() => togglePreviewWhatsapp(idx)}
                                title="Clique para alternar WhatsApp verificado"
                              >
                                {item.hasWhatsapp ? (
                                  <>
                                    <MessageCircle size={12} /> WhatsApp ativo
                                  </>
                                ) : (
                                  <>
                                    <Phone size={12} /> Ativar WhatsApp
                                  </>
                                )}
                              </button>
                            ) : (
                              <small className="muted">Sem telefone</small>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="site-cell">
                            {item.website ? (
                              <a
                                href={item.website.startsWith("http") ? item.website : `https://${item.website}`}
                                target="_blank"
                                rel="noreferrer"
                                className="site-link"
                              >
                                <Globe size={13} />
                                <span className="site-text">{item.website.replace(/^https?:\/\/(www\.)?/, "").slice(0, 20)}</span>
                                <ExternalLink size={11} />
                              </a>
                            ) : (
                              <span className="badge-no-site">Sem site próprio</span>
                            )}
                          </div>
                        </td>
                        <td>
                          {item.isDuplicate ? (
                            <span className="badge-duplicate" title={item.duplicateReason}>
                              <AlertTriangle size={13} /> Já no CRM
                            </span>
                          ) : item.error ? (
                            <span className="badge-error" title={item.error}>
                              Erro
                            </span>
                          ) : (
                            <span className="badge-ready">
                              <Check size={13} /> Pronto
                            </span>
                          )}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="icon-button danger"
                            onClick={() => removePreview(idx)}
                            aria-label="Remover da lista"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="review-footer-bar">
              <label className="auto-analyze-option">
                <input
                  type="checkbox"
                  checked={autoAnalyze}
                  onChange={(e) => setAutoAnalyze(e.target.checked)}
                />
                <span>
                  <Sparkles size={15} /> <strong>Analisar e qualificar com IA automaticamente ao importar</strong>
                </span>
              </label>

              <div className="batch-actions">
                <button className="secondary" onClick={() => setStep("input")}>
                  Voltar
                </button>
                <button
                  className="primary"
                  disabled={saving || selectedCount === 0}
                  onClick={handleConfirmImport}
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="spin" />
                      Importando e analisando com IA…
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      Importar {selectedCount} empresa{selectedCount === 1 ? "" : "s"} para o Pipeline
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
