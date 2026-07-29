"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  MapPin,
  Users,
  Stethoscope,
  Calendar,
  BarChart3,
  CreditCard,
  ScrollText,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "../ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { ToothIcon } from "@phosphor-icons/react";

const adminLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/owners", label: "Owners", icon: Building2 },
  { href: "/admin/clinics", label: "Clínicas", icon: MapPin },
  { href: "/admin/dentists", label: "Dentistas", icon: Stethoscope },
  { href: "/admin/patients", label: "Pacientes", icon: Users },
  { href: "/admin/appointments", label: "Agenda", icon: Calendar },
  { href: "/admin/reports", label: "Reportes", icon: BarChart3 },
  { href: "/admin/subscriptions", label: "Suscripciones", icon: CreditCard },
  { href: "/admin/audit", label: "Auditoría", icon: ScrollText },
  { href: "/admin/settings", label: "Configuración", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="flex h-full flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tight hover:opacity-80 transition-opacity">
          <div className="bg-primary/10 p-1.5 rounded-lg">
            <ToothIcon className="h-5 w-5 text-primary" />
          </div>
          ChiniDent
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        <nav className="space-y-1 px-3">
          <div className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Menu Principal
          </div>
          {adminLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all relative",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-full w-1 bg-primary rounded-r-md" />
                )}
                <link.icon className={cn("h-4 w-4 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-accent-foreground")} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}
