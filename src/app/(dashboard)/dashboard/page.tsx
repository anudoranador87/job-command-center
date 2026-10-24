import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Briefcase,
  FileCheck,
  Send,
  Sparkles,
  ArrowUpRight,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  // Real database queries
  const [applicationsCount, jobsCount, recentApplications, profile] = await Promise.all([
    userId ? prisma.application.count({ where: { userId } }) : 0,
    prisma.job.count(),
    userId
      ? prisma.application.findMany({
          where: { userId },
          include: { job: true },
          orderBy: { updatedAt: "desc" },
          take: 5,
        })
      : [],
    userId ? prisma.profile.findUnique({ where: { userId } }) : null,
  ]);

  const profileCompleteness = profile
    ? [profile.headline, profile.summary, profile.targetRole, profile.skills]
        .filter(Boolean).length * 25
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Centro de Mando</h1>
        <p className="text-muted-foreground mt-1">
          Bienvenido de nuevo, {session?.user?.name || "Candidato"}. Aquí está el resumen de tu búsqueda de empleo activa.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 bg-card rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Candidaturas Activas</span>
            <Send className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold">{applicationsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">En proceso de evaluación</p>
          </div>
        </div>

        <div className="p-6 bg-card rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Ofertas Rastreadas</span>
            <Briefcase className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold">{jobsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Guardadas o disponibles</p>
          </div>
        </div>

        <div className="p-6 bg-card rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Perfil Maestro</span>
            <FileCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold">{profileCompleteness}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {profile ? "Perfil configurado" : "Pendiente de completar"}
            </p>
          </div>
        </div>

        <div className="p-6 bg-card rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Optimización IA</span>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold">Listo</div>
            <p className="text-xs text-muted-foreground mt-1">Motor de compatibilidad activo</p>
          </div>
        </div>
      </div>

      {/* Recent Applications & Quick Actions */}
      <div className="grid gap-6 md:grid-cols-7">
        <div className="md:col-span-4 p-6 bg-card rounded-xl border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Candidaturas Recientes</h2>
            <Link
              href="/applications"
              className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
            >
              Ver todas <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-lg">
              <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium">Aún no hay candidaturas registradas</p>
              <p className="text-xs text-muted-foreground mt-1">
                Añade una oferta o postula desde el buscador para ver el seguimiento aquí.
              </p>
              <Link
                href="/jobs"
                className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:opacity-90"
              >
                Buscar ofertas
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentApplications.map((app) => (
                <div key={app.id} className="py-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">{app.job.title}</h3>
                    <p className="text-xs text-muted-foreground">{app.job.company} · {app.job.location || "Remoto"}</p>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded bg-secondary">
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="md:col-span-3 p-6 bg-card rounded-xl border border-border space-y-4">
          <h2 className="text-lg font-semibold">Acciones Rápidas</h2>
          <div className="space-y-2">
            <Link
              href="/profile"
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <div>
                  <p className="text-sm font-medium">Importar o editar CV</p>
                  <p className="text-xs text-muted-foreground">Sube PDF/DOCX y extrae tus datos</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </Link>

            <Link
              href="/jobs"
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Explorar ofertas de empleo</p>
                  <p className="text-xs text-muted-foreground">Filtra por afinidad técnica y salario</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </Link>

            <Link
              href="/applications"
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Send className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Tablero Kanban</p>
                  <p className="text-xs text-muted-foreground">Gestiona estados de candidaturas</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
