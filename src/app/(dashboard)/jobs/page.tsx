import { prisma } from "@/lib/prisma";
import { Briefcase, Search, Plus, MapPin, Building, Sparkles } from "lucide-react";

export default async function JobsPage() {
  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Buscador y Ofertas de Empleo</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Explora ofertas centralizadas de múltiples plataformas o añade vacantes manualmente.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity">
          <Plus className="h-4 w-4" />
          Añadir Oferta Manual
        </button>
      </div>

      {/* Filters bar */}
      <div className="flex gap-3 bg-card p-3 rounded-lg border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por puesto, empresa o tecnología (ej. Full Stack, React, Python)..."
            className="w-full pl-9 pr-3 py-1.5 bg-secondary border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <button className="px-3 py-1.5 bg-secondary text-sm font-medium rounded-md hover:bg-secondary/80">
          Remoto
        </button>
        <button className="px-3 py-1.5 bg-secondary text-sm font-medium rounded-md hover:bg-secondary/80">
          Mayor Afinidad IA
        </button>
      </div>

      {/* Job list */}
      {jobs.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl bg-card/50">
          <Briefcase className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-base font-semibold">No hay ofertas de empleo cargadas aún</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Puedes conectar las fuentes de ofertas (Remotive, Adzuna) en Integraciones o registrar ofertas que encuentres manualmente.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-5 bg-card border border-border rounded-xl hover:border-primary/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-foreground">{job.title}</h3>
                  {job.compatibilityScore && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      <Sparkles className="h-3 w-3" />
                      {job.compatibilityScore}% match
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Building className="h-3.5 w-3.5" />
                    {job.company}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {job.location || "Remoto"}
                  </span>
                  <span className="px-2 py-0.5 bg-secondary rounded text-[11px]">
                    {job.source}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:opacity-90">
                  Postular / Adaptar CV
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
