import { Plug, CheckCircle2, XCircle, ExternalLink, ShieldCheck } from "lucide-react";

const INTEGRATIONS = [
  {
    id: "remotive",
    name: "Remotive Job API",
    description: "Conexión a feed público de ofertas de trabajo 100% remotas.",
    status: "DISCONNECTED",
    authType: "API Pública (Sin credenciales)",
    realAvailable: true,
  },
  {
    id: "adzuna",
    name: "Adzuna Jobs",
    description: "Búsqueda en millones de ofertas en España y Europa con salario estimado.",
    status: "DISCONNECTED",
    authType: "API Key requerida (Gratuita para desarrolladores)",
    realAvailable: true,
  },
  {
    id: "github",
    name: "GitHub OAuth",
    description: "Inicio de sesión seguro y sincronización de repositorios de portfolio.",
    status: "DISCONNECTED",
    authType: "OAuth 2.0 Oficial",
    realAvailable: true,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    description: "Sincronización de perfil público oficial mediante API de desarrollador.",
    status: "DISCONNECTED",
    authType: "OAuth 2.0 (Requiere App Aprobada por LinkedIn)",
    realAvailable: false,
    note: "LinkedIn restringe el envío automatizado a socios certificados 'Apply with LinkedIn'.",
  },
];

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Integraciones y Conectores</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Estado real de las conexiones con plataformas externas. Por seguridad y transparencia, nunca simulamos conexiones falsas ni almacenamos credenciales en texto plano.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {INTEGRATIONS.map((item) => (
          <div
            key={item.id}
            className="p-5 bg-card border border-border rounded-xl space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-secondary rounded-lg">
                    <Plug className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold">{item.name}</h3>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
                  <XCircle className="h-3 w-3 text-muted-foreground" />
                  Desconectado
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {item.description}
              </p>
              {item.note && (
                <p className="text-[11px] text-amber-500/90 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                  {item.note}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="text-muted-foreground text-[11px]">{item.authType}</span>
              <button className="px-3 py-1.5 bg-secondary text-foreground hover:bg-secondary/80 rounded-md font-medium text-xs transition-colors">
                Configurar Conexión
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
