import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { User, Upload, FileText, CheckCircle2 } from "lucide-react";

export default async function ProfilePage() {
  const session = await auth();
  const userId = session?.user?.id;

  const profile = userId
    ? await prisma.profile.findUnique({
        where: { userId },
      })
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mi Perfil Profesional & CV Maestro</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Este perfil es la fuente de verdad estructurada que la IA utiliza para adaptar tu currículum a cada vacante.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* CV Importer card */}
        <div className="p-6 bg-card border border-border rounded-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Importar CV</h3>
              <p className="text-xs text-muted-foreground">PDF o DOCX</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Sube tu currículum actual y el sistema extraerá automáticamente tu experiencia, educación y competencias para crear tu perfil maestro.
          </p>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-secondary/30 transition-colors cursor-pointer">
            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs font-semibold">Arrastra tu archivo aquí</p>
            <p className="text-[11px] text-muted-foreground mt-1">o haz clic para explorar</p>
          </div>
        </div>

        {/* Profile info */}
        <div className="md:col-span-2 p-6 bg-card border border-border rounded-xl space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Datos Estructurados del Perfil
            </h2>
            <button className="px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-md">
              Guardar Cambios
            </button>
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Titular Profesional</label>
              <input
                type="text"
                defaultValue={profile?.headline || "Senior Full Stack Engineer"}
                className="mt-1 w-full p-2 bg-secondary border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Extracto / Resumen Ejecutivo</label>
              <textarea
                rows={4}
                defaultValue={profile?.summary || "Ingeniero de software con experiencia en desarrollo full-stack, arquitecturas cloud, microservicios y desarrollo ágil."}
                className="mt-1 w-full p-2 bg-secondary border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Rol Objetivo</label>
                <input
                  type="text"
                  defaultValue={profile?.targetRole || "Tech Lead / Senior Full Stack"}
                  className="mt-1 w-full p-2 bg-secondary border border-border rounded-md text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Ubicación</label>
                <input
                  type="text"
                  defaultValue={profile?.location || "Remoto / España"}
                  className="mt-1 w-full p-2 bg-secondary border border-border rounded-md text-sm"
                />
              </div>
            </div>

            <div className="pt-2">
              <span className="text-xs font-semibold text-muted-foreground">Habilidades Técnicas Clave</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "Docker", "Tailwind CSS", "Prisma"].map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-secondary text-xs font-medium border border-border"
                  >
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
