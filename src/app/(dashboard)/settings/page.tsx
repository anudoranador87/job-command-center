import { Sliders, Cpu, Bell, Shield, Database } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuración del Sistema</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Ajustes de inteligencia artificial, notificaciones y almacenamiento de datos.
        </p>
      </div>

      <div className="space-y-4 max-w-3xl">
        <div className="p-5 bg-card border border-border rounded-xl space-y-4">
          <div className="flex items-center gap-3">
            <Cpu className="h-5 w-5 text-primary" />
            <div>
              <h3 className="text-sm font-semibold">Proveedor de Inteligencia Artificial</h3>
              <p className="text-xs text-muted-foreground">Configura el modelo para optimizar CVs y análisis de compatibilidad</p>
            </div>
          </div>
          <div className="space-y-3 pt-2 text-sm">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Modelo Predeterminado</label>
              <select className="mt-1 w-full p-2 bg-secondary border border-border rounded-md text-sm">
                <option value="gpt-4o">OpenAI GPT-4o</option>
                <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet</option>
                <option value="gemini-1.5-pro">Google Gemini 1.5 Pro</option>
                <option value="local-ollama">Local (Ollama / Llama 3)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Clave de API (opcional para local)</label>
              <input
                type="password"
                placeholder="sk-..."
                className="mt-1 w-full p-2 bg-secondary border border-border rounded-md text-sm"
              />
            </div>
          </div>
        </div>

        <div className="p-5 bg-card border border-border rounded-xl space-y-4">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-primary" />
            <div>
              <h3 className="text-sm font-semibold">Persistencia & Base de Datos</h3>
              <p className="text-xs text-muted-foreground">PostgreSQL 16 en contenedor Docker local</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Todos tus datos, currículums, ofertas y notas se guardan de forma privada en tu base de datos local.
          </p>
        </div>
      </div>
    </div>
  );
}
