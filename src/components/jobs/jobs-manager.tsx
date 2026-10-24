"use client";

import React, { useState } from "react";
import {
  Briefcase,
  Search,
  Plus,
  RefreshCw,
  ExternalLink,
  MapPin,
  Building,
  CheckCircle2,
  DollarSign,
  Send,
  X,
  AlertCircle,
  Sparkles,
  Link as LinkIcon,
  HelpCircle,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

interface JobItem {
  id: string;
  title: string;
  company: string;
  location?: string | null;
  remoteType?: string | null;
  jobType?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string | null;
  description: string;
  requirements?: any;
  url?: string | null;
  source: string;
  compatibilityScore?: number | null;
  compatibilityData?: any;
  createdAt: string | Date;
}

interface JobsManagerProps {
  initialJobs: JobItem[];
}

export function JobsManager({ initialJobs }: JobsManagerProps) {
  const [jobs, setJobs] = useState<JobItem[]>(initialJobs);
  const [search, setSearch] = useState("");
  const [remoteFilter, setRemoteFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState<"NEWEST" | "MATCH">("MATCH");
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<Record<string, boolean>>({});

  // Modals
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const [selectedReportJob, setSelectedReportJob] = useState<JobItem | null>(null);
  const [calculatingScoreId, setCalculatingScoreId] = useState<string | null>(null);

  // URL / Paste form
  const [importUrl, setImportUrl] = useState("");
  const [importText, setImportText] = useState("");
  const [importingUrl, setImportingUrl] = useState(false);

  // Manual job form states
  const [manualTitle, setManualTitle] = useState("");
  const [manualCompany, setManualCompany] = useState("");
  const [manualLocation, setManualLocation] = useState("Remoto");
  const [manualRemoteType, setManualRemoteType] = useState("REMOTE");
  const [manualSalary, setManualSalary] = useState("");
  const [manualUrl, setManualUrl] = useState("");
  const [manualTags, setManualTags] = useState("");
  const [manualDescription, setManualDescription] = useState("");
  const [savingManual, setSavingManual] = useState(false);

  // Filter & Sort
  const filteredJobs = jobs
    .filter((j) => {
      const query = search.toLowerCase();
      const matchSearch =
        !search ||
        j.title.toLowerCase().includes(query) ||
        j.company.toLowerCase().includes(query) ||
        (Array.isArray(j.requirements) && j.requirements.some((r: string) => r.toLowerCase().includes(query))) ||
        j.description.toLowerCase().includes(query);

      const matchRemote = remoteFilter === "ALL" || j.remoteType === remoteFilter;
      const matchSource = sourceFilter === "ALL" || j.source === sourceFilter;

      return matchSearch && matchRemote && matchSource;
    })
    .sort((a, b) => {
      if (sortBy === "MATCH") {
        return (b.compatibilityScore || 0) - (a.compatibilityScore || 0);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handleSyncRemotive = async () => {
    setSyncing(true);
    setSyncMessage(null);
    setActionError(null);

    try {
      const res = await fetch("/api/jobs/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "REMOTIVE", limit: 30 }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al sincronizar");

      setSyncMessage(
        `¡Sincronización completada! Añadidas: ${data.result.added} nuevas ofertas. Total obtenidas: ${data.result.totalFetched}.`
      );

      // Refresh jobs list
      const updatedRes = await fetch("/api/jobs");
      const updatedData = await updatedRes.json();
      if (updatedData.jobs) setJobs(updatedData.jobs);
    } catch (err: any) {
      setActionError(err.message || "Error al conectar con Remotive.");
    } finally {
      setSyncing(false);
    }
  };

  const handleCalculateScore = async (jobId: string) => {
    setCalculatingScoreId(jobId);
    setActionError(null);

    try {
      const res = await fetch(`/api/jobs/${jobId}/compatibility`, { method: "POST" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "No se pudo calcular la afinidad");

      // Update in state
      setJobs((prev) =>
        prev.map((j) =>
          j.id === jobId
            ? { ...j, compatibilityScore: data.report.score, compatibilityData: data.report }
            : j
        )
      );

      // Auto-open modal report
      setSelectedReportJob({
        ...jobs.find((j) => j.id === jobId)!,
        compatibilityScore: data.report.score,
        compatibilityData: data.report,
      });
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setCalculatingScoreId(null);
    }
  };

  const handleApply = async (jobId: string, jobTitle: string) => {
    setActionError(null);
    try {
      const res = await fetch(`/api/jobs/${jobId}/apply`, { method: "POST" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "No se pudo registrar la candidatura");

      setAppliedJobs((prev) => ({ ...prev, [jobId]: true }));
      setSyncMessage(`¡"${jobTitle}" añadida a tu tablero Kanban de candidaturas!`);
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleImportUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportingUrl(true);
    setActionError(null);

    try {
      const res = await fetch("/api/jobs/import-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: importUrl, rawText: importText }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al importar oferta");

      if (data.job) {
        setJobs((prev) => [data.job, ...prev]);
        setUrlModalOpen(false);
        setImportUrl("");
        setImportText("");
        setSyncMessage(`Oferta "${data.job.title}" importada y evaluada con éxito.`);
      }
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setImportingUrl(false);
    }
  };

  const handleCreateManualJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingManual(true);
    setActionError(null);

    try {
      const tagsArray = manualTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: manualTitle,
          company: manualCompany,
          location: manualLocation,
          remoteType: manualRemoteType,
          salaryMin: manualSalary ? parseFloat(manualSalary) : undefined,
          url: manualUrl || undefined,
          requirements: tagsArray,
          description: manualDescription,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear la oferta");

      if (data.job) {
        setJobs((prev) => [data.job, ...prev]);
        setManualModalOpen(false);
        setSyncMessage(`Oferta "${manualTitle}" guardada con éxito.`);
        setManualTitle("");
        setManualCompany("");
        setManualUrl("");
        setManualTags("");
        setManualDescription("");
        setManualSalary("");
      }
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setSavingManual(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Buscador y Rastreador de Ofertas</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Rastrea vacantes desde cualquier web, sincroniza fuentes remotas y analiza tu afinidad con IA.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setUrlModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold rounded-lg border border-border transition-colors"
          >
            <LinkIcon className="h-3.5 w-3.5 text-primary" />
            Importar URL / Texto
          </button>

          <button
            onClick={handleSyncRemotive}
            disabled={syncing}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold rounded-lg border border-border transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin text-primary" : ""}`} />
            {syncing ? "Sincronizando..." : "Sincronizar Remotive"}
          </button>

          <button
            onClick={() => setManualModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            Añadir Manual
          </button>
        </div>
      </div>

      {/* Notifications */}
      {syncMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{syncMessage}</span>
          </div>
          <button onClick={() => setSyncMessage(null)} className="text-emerald-500 hover:opacity-75">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-destructive hover:opacity-75">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 bg-card rounded-xl border border-border space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por puesto, empresa o tecnología (ej. TypeScript, React, Python, Remote)..."
            className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
          {/* Remote filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-muted-foreground mr-1 font-medium">Modalidad:</span>
            {["ALL", "REMOTE", "HYBRID", "ONSITE"].map((type) => (
              <button
                key={type}
                onClick={() => setRemoteFilter(type)}
                className={`px-2.5 py-1 rounded-md transition-colors font-medium ${
                  remoteFilter === type
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {type === "ALL" ? "Todas" : type === "REMOTE" ? "100% Remoto" : type === "HYBRID" ? "Híbrido" : "Presencial"}
              </button>
            ))}
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-medium">Ordenar por:</span>
            <button
              onClick={() => setSortBy("MATCH")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
                sortBy === "MATCH"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="h-3 w-3" /> Mayor Afinidad IA
            </button>
            <button
              onClick={() => setSortBy("NEWEST")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                sortBy === "NEWEST"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              Más Recientes
            </button>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-3">
        <div className="text-xs text-muted-foreground flex justify-between items-center px-1">
          <span>Mostrando {filteredJobs.length} ofertas disponibles</span>
          <Link href="/applications" className="text-primary hover:underline font-medium">
            Ver mi tablero Kanban →
          </Link>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="p-12 text-center bg-card border border-dashed border-border rounded-xl space-y-3">
            <Briefcase className="h-10 w-10 text-muted-foreground mx-auto" />
            <h3 className="text-base font-semibold">No se encontraron ofertas</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Pulsa en <strong>Importar URL / Texto</strong> para pegar cualquier oferta de LinkedIn/InfoJobs o pulsa <strong>Sincronizar Remotive</strong>.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredJobs.map((job) => {
              const tags = Array.isArray(job.requirements) ? job.requirements : [];
              const isApplied = appliedJobs[job.id];
              const score = job.compatibilityScore;
              const isCalculating = calculatingScoreId === job.id;

              return (
                <div
                  key={job.id}
                  className="p-5 bg-card border border-border rounded-xl hover:border-primary/50 transition-all space-y-3 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-foreground">{job.title}</h3>

                        {/* Compatibility Badge / Button */}
                        {score !== null && score !== undefined ? (
                          <button
                            onClick={() => setSelectedReportJob(job)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border transition-transform hover:scale-105 ${
                              score >= 75
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : score >= 55
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                            }`}
                            title="Haz clic para ver el informe detallado de compatibilidad IA"
                          >
                            <Sparkles className="h-3 w-3" />
                            {score}% Afinidad IA
                          </button>
                        ) : (
                          <button
                            onClick={() => handleCalculateScore(job.id)}
                            disabled={isCalculating}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-secondary text-primary hover:bg-secondary/80 border border-border transition-colors disabled:opacity-50"
                          >
                            <Sparkles className={`h-3 w-3 ${isCalculating ? "animate-spin" : ""}`} />
                            {isCalculating ? "Analizando..." : "Calcular Match IA"}
                          </button>
                        )}

                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
                          {job.source}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 font-medium text-foreground">
                          <Building className="h-3.5 w-3.5 text-muted-foreground" />
                          {job.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {job.location || "Remoto"}
                        </span>
                        {job.salaryMin && (
                          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                            <DollarSign className="h-3.5 w-3.5" />
                            {job.salaryMin.toLocaleString()}{" "}
                            {job.salaryMax ? `- ${job.salaryMax.toLocaleString()}` : ""} {job.currency || "USD"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {job.url && (
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 text-muted-foreground hover:text-foreground bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                          title="Abrir oferta original"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}

                      <button
                        onClick={() => handleApply(job.id, job.title)}
                        disabled={isApplied}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isApplied
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 cursor-default"
                            : "bg-primary text-primary-foreground hover:opacity-90"
                        }`}
                      >
                        {isApplied ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" /> En tu Kanban
                          </>
                        ) : (
                          <>
                            <Send className="h-3.5 w-3.5" /> Postular / Kanban
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {tags.slice(0, 8).map((tag: string, idx: number) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2 py-0.5 bg-secondary text-muted-foreground rounded-md font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* COMPATIBILITY REPORT MODAL */}
      {selectedReportJob && selectedReportJob.compatibilityData && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/30">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold">Informe de Compatibilidad IA</h3>
                  <p className="text-[11px] text-muted-foreground">
                    {selectedReportJob.title} · {selectedReportJob.company}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReportJob(null)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto text-xs">
              {/* Score header */}
              <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl border border-border">
                <div className="h-16 w-16 rounded-full bg-primary/10 border-2 border-primary flex flex-col items-center justify-center shrink-0">
                  <span className="text-xl font-black text-primary leading-none">
                    {selectedReportJob.compatibilityScore}%
                  </span>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase mt-0.5">Match</span>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary/20 text-primary">
                    Afinidad: {selectedReportJob.compatibilityData.fitLevel || "ALTA"}
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                    {selectedReportJob.compatibilityData.summary}
                  </p>
                </div>
              </div>

              {/* Matching Skills */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Habilidades y Requisitos que Cumples
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedReportJob.compatibilityData.matchingSkills || []).map((s: string, idx: number) => (
                    <span key={idx} className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                      {s}
                    </span>
                  ))}
                  {(!selectedReportJob.compatibilityData.matchingSkills || selectedReportJob.compatibilityData.matchingSkills.length === 0) && (
                    <span className="text-muted-foreground text-xs">Requisitos cubiertos por experiencia general.</span>
                  )}
                </div>
              </div>

              {/* Missing Skills */}
              {(selectedReportJob.compatibilityData.missingSkills || []).length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4" /> Requisitos a Reforzar o Justificar
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedReportJob.compatibilityData.missingSkills.map((s: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-primary" /> Recomendaciones Tácticas para Postular
                </h4>
                <ul className="space-y-1.5 list-disc list-inside text-muted-foreground leading-relaxed pl-1">
                  {(selectedReportJob.compatibilityData.recommendations || []).map((rec: string, idx: number) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-4 border-t border-border bg-secondary/20 flex justify-end gap-2">
              <button
                onClick={() => setSelectedReportJob(null)}
                className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground font-semibold rounded-lg text-xs"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  handleApply(selectedReportJob.id, selectedReportJob.title);
                  setSelectedReportJob(null);
                }}
                className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg text-xs flex items-center gap-1.5"
              >
                <Send className="h-3.5 w-3.5" /> Enviar a Kanban
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMPORT URL / TEXT MODAL */}
      {urlModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/30">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-primary" />
                Importar Oferta desde URL o Texto
              </h3>
              <button onClick={() => setUrlModalOpen(false)} className="text-muted-foreground hover:text-foreground p-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleImportUrl} className="p-5 space-y-4 text-xs">
              <p className="text-muted-foreground">
                Pega el enlace de una vacante (LinkedIn, InfoJobs, Indeed, portales de empleo) o pega directamente el texto de la descripción para que la IA lo estruture y calcule tu afinidad.
              </p>

              <div>
                <label className="font-semibold text-muted-foreground">URL de la Oferta (Opcional si pegas texto)</label>
                <input
                  type="url"
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  placeholder="https://www.linkedin.com/jobs/view/..."
                  className="mt-1 w-full p-2.5 bg-secondary border border-border rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="font-semibold text-muted-foreground">O Pega la Descripción / Texto de la Vacante</label>
                <textarea
                  rows={6}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Pega aquí el contenido de la oferta (Título, requisitos, funciones)..."
                  className="mt-1 w-full p-2.5 bg-secondary border border-border rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setUrlModalOpen(false)}
                  className="px-3 py-1.5 bg-secondary text-foreground rounded text-xs font-semibold hover:bg-secondary/80"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={importingUrl || (!importUrl && !importText)}
                  className="px-4 py-1.5 bg-primary text-primary-foreground rounded text-xs font-semibold hover:opacity-90 disabled:opacity-50"
                >
                  {importingUrl ? "Importando y analizando..." : "Importar y Analizar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Job Modal Drawer */}
      {manualModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/30">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                Registrar Oferta de Empleo Manual
              </h3>
              <button
                onClick={() => setManualModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateManualJob} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-muted-foreground">Puesto / Título *</label>
                  <input
                    type="text"
                    required
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="Ej. Full Stack Engineer"
                    className="mt-1 w-full p-2 bg-secondary border border-border rounded text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground">Empresa *</label>
                  <input
                    type="text"
                    required
                    value={manualCompany}
                    onChange={(e) => setManualCompany(e.target.value)}
                    placeholder="Ej. Acme Corp"
                    className="mt-1 w-full p-2 bg-secondary border border-border rounded text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-muted-foreground">Ubicación</label>
                  <input
                    type="text"
                    value={manualLocation}
                    onChange={(e) => setManualLocation(e.target.value)}
                    className="mt-1 w-full p-2 bg-secondary border border-border rounded text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground">Modalidad</label>
                  <select
                    value={manualRemoteType}
                    onChange={(e) => setManualRemoteType(e.target.value)}
                    className="mt-1 w-full p-2 bg-secondary border border-border rounded text-xs"
                  >
                    <option value="REMOTE">100% Remoto</option>
                    <option value="HYBRID">Híbrido</option>
                    <option value="ONSITE">Presencial</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground">Salario Anual (€ / $)</label>
                  <input
                    type="number"
                    value={manualSalary}
                    onChange={(e) => setManualSalary(e.target.value)}
                    placeholder="50000"
                    className="mt-1 w-full p-2 bg-secondary border border-border rounded text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-muted-foreground">URL de la Oferta / Portal</label>
                <input
                  type="url"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  placeholder="https://linkedin.com/jobs/..."
                  className="mt-1 w-full p-2 bg-secondary border border-border rounded text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-muted-foreground">Tecnologías / Etiquetas (separadas por coma)</label>
                <input
                  type="text"
                  value={manualTags}
                  onChange={(e) => setManualTags(e.target.value)}
                  placeholder="TypeScript, React, Node.js, Docker"
                  className="mt-1 w-full p-2 bg-secondary border border-border rounded text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-muted-foreground">Descripción / Requisitos *</label>
                <textarea
                  rows={4}
                  required
                  value={manualDescription}
                  onChange={(e) => setManualDescription(e.target.value)}
                  placeholder="Pega la descripción completa del puesto de trabajo..."
                  className="mt-1 w-full p-2 bg-secondary border border-border rounded text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setManualModalOpen(false)}
                  className="px-3 py-1.5 bg-secondary text-foreground rounded text-xs font-semibold hover:bg-secondary/80"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingManual}
                  className="px-4 py-1.5 bg-primary text-primary-foreground rounded text-xs font-semibold hover:opacity-90 disabled:opacity-50"
                >
                  {savingManual ? "Guardando..." : "Guardar Oferta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
