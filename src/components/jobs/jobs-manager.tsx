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
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState<Record<string, boolean>>({});
  const [actionError, setActionError] = useState<string | null>(null);

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

  // Filter jobs locally
  const filteredJobs = jobs.filter((j) => {
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
      if (!res.ok) {
        throw new Error(data.error || "Error al sincronizar");
      }

      setSyncMessage(
        `¡Sincronización completada! Añadidas: ${data.result.added} nuevas ofertas. Total obtenidas: ${data.result.totalFetched}.`
      );

      // Refresh jobs list
      const updatedRes = await fetch("/api/jobs");
      const updatedData = await updatedRes.json();
      if (updatedData.jobs) {
        setJobs(updatedData.jobs);
      }
    } catch (err: any) {
      setActionError(err.message || "Error al conectar con Remotive.");
    } finally {
      setSyncing(false);
    }
  };

  const handleApply = async (jobId: string, jobTitle: string) => {
    setActionError(null);
    try {
      const res = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "No se pudo registrar la candidatura");
      }

      setAppliedJobs((prev) => ({ ...prev, [jobId]: true }));
      setSyncMessage(`¡"${jobTitle}" añadida a tu tablero Kanban de candidaturas!`);
    } catch (err: any) {
      setActionError(err.message);
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
      if (!res.ok) {
        throw new Error(data.error || "Error al crear la oferta");
      }

      if (data.job) {
        setJobs((prev) => [data.job, ...prev]);
        setModalOpen(false);
        setSyncMessage(`Oferta "${manualTitle}" guardada con éxito.`);
        // Reset form
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
      {/* Header action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Buscador y Ofertas de Empleo</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Explora ofertas reales sincronizadas en vivo de plataformas remotas o registra vacantes manualmente.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncRemotive}
            disabled={syncing}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold rounded-lg border border-border transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin text-primary" : ""}`} />
            {syncing ? "Sincronizando..." : "Sincronizar Remotive"}
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            Añadir Manual
          </button>
        </div>
      </div>

      {/* Status Notifications */}
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
            className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
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

          {/* Source filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground mr-1 font-medium">Fuente:</span>
            {["ALL", "REMOTIVE", "MANUAL"].map((src) => (
              <button
                key={src}
                onClick={() => setSourceFilter(src)}
                className={`px-2.5 py-1 rounded-md transition-colors font-medium ${
                  sourceFilter === src
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {src === "ALL" ? "Todas" : src === "REMOTIVE" ? "Remotive API" : "Manual"}
              </button>
            ))}
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
              Pulsa el botón de <strong>Sincronizar Remotive</strong> para traer las últimas ofertas remotas reales del mercado, o añade una manualmente.
            </p>
            <button
              onClick={handleSyncRemotive}
              disabled={syncing}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
              Sincronizar ofertas ahora
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredJobs.map((job) => {
              const tags = Array.isArray(job.requirements) ? job.requirements : [];
              const isApplied = appliedJobs[job.id];

              return (
                <div
                  key={job.id}
                  className="p-5 bg-card border border-border rounded-xl hover:border-primary/40 transition-all space-y-3 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-foreground">{job.title}</h3>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-secondary text-primary border border-border">
                          {job.source}
                        </span>
                        {job.remoteType === "REMOTE" && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            Remoto
                          </span>
                        )}
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
                          <span className="flex items-center gap-1 text-emerald-500 font-semibold">
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
                          title="Ver oferta original en la web"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}

                      <button
                        onClick={() => handleApply(job.id, job.title)}
                        disabled={isApplied}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isApplied
                            ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/20 cursor-default"
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

                  {/* Summary Snippet */}
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  {/* Skills / Requirements tags */}
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
                      {tags.length > 8 && (
                        <span className="text-[11px] px-1.5 py-0.5 text-muted-foreground">
                          +{tags.length - 8}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Manual Job Modal Drawer */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/30">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                Registrar Oferta de Empleo Manual
              </h3>
              <button
                onClick={() => setModalOpen(false)}
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
                  onClick={() => setModalOpen(false)}
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
