import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Send, Plus, Calendar, Clock, CheckCircle, XCircle } from "lucide-react";

const KANBAN_COLUMNS = [
  { id: "WISHLIST", label: "Deseadas / Por preparar", icon: Clock },
  { id: "PREPARING", label: "Adaptando CV", icon: Send },
  { id: "APPLIED", label: "Enviadas", icon: Calendar },
  { id: "SCREENING", label: "En Revisión", icon: CheckCircle },
  { id: "FIRST_INTERVIEW", label: "Entrevistas", icon: CheckCircle },
  { id: "OFFER_RECEIVED", label: "Oferta Recibida", icon: CheckCircle },
  { id: "REJECTED", label: "Descartadas", icon: XCircle },
];

export default async function ApplicationsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const applications = userId
    ? await prisma.application.findMany({
        where: { userId },
        include: { job: true },
        orderBy: { updatedAt: "desc" },
      })
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Seguimiento de Candidaturas</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Tablero Kanban interactivo con el ciclo de vida de cada postulación.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity">
          <Plus className="h-4 w-4" />
          Nueva Candidatura
        </button>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map((col) => {
          const colApps = applications.filter((app) => app.status === col.id);
          return (
            <div
              key={col.id}
              className="bg-card border border-border rounded-xl flex flex-col min-w-[240px] max-h-[calc(100vh-220px)]"
            >
              <div className="p-3 border-b border-border flex items-center justify-between bg-secondary/30 rounded-t-xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold">{col.label}</span>
                </div>
                <span className="text-xs bg-secondary text-muted-foreground font-semibold px-2 py-0.5 rounded-full">
                  {colApps.length}
                </span>
              </div>

              <div className="p-3 flex-1 overflow-y-auto space-y-3">
                {colApps.length === 0 ? (
                  <div className="text-center py-8 text-xs text-muted-foreground border border-dashed border-border/60 rounded-lg">
                    Sin candidaturas
                  </div>
                ) : (
                  colApps.map((app) => (
                    <div
                      key={app.id}
                      className="p-3 bg-secondary/60 hover:bg-secondary border border-border rounded-lg shadow-sm cursor-pointer transition-all space-y-1.5"
                    >
                      <h4 className="text-xs font-bold line-clamp-1">{app.job.title}</h4>
                      <p className="text-[11px] text-muted-foreground">{app.job.company}</p>
                      <div className="pt-2 flex items-center justify-between text-[10px] text-muted-foreground border-t border-border/50">
                        <span>{app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : "Sin fecha"}</span>
                        {app.portalUrl && <span className="text-primary font-medium">Link</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
