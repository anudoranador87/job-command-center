"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Send,
  User,
  Sliders,
  Plug,
  BarChart3,
  LogOut,
  Sparkles,
} from "lucide-react";
import { signOut } from "next-auth/react";

interface SidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Buscador de Empleo", href: "/jobs", icon: Briefcase },
  { name: "Candidaturas (Kanban)", href: "/applications", icon: Send },
  { name: "Mi Perfil & CV Maestro", href: "/profile", icon: User },
  { name: "Documentos", href: "/documents", icon: FileText },
  { name: "Asistente IA", href: "/assistant", icon: Sparkles },
  { name: "Integraciones", href: "/integrations", icon: Plug },
  { name: "Estadísticas", href: "/analytics", icon: BarChart3 },
  { name: "Configuración", href: "/settings", icon: Sliders },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-screen select-none">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-black">
            J
          </div>
          <span>Job Command</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-secondary text-primary font-semibold"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-9 w-9 rounded-full bg-secondary text-muted-foreground flex items-center justify-center font-bold text-xs">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : "US"}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-medium text-foreground truncate">{user?.name || "Usuario"}</p>
            <p className="text-[11px] text-muted-foreground truncate">{user?.email || "usuario@local.com"}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/auth/sign-in" })}
          title="Cerrar sesión"
          className="p-2 text-muted-foreground hover:text-destructive hover:bg-secondary/50 rounded-md transition-colors"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
