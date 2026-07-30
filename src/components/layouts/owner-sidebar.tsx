"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Users,
  Stethoscope,
  Calendar,
  BarChart3,
  DollarSign,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeft
} from "lucide-react";
import { ToothIcon} from "@phosphor-icons/react";
import { Button } from "../ui/button";
import { useAuthStore } from "@/stores/auth-store";

const ownerLinks = [
  { href: "/owner/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/owner/locales", label: "Locales", icon: Building2 },
  { href: "/owner/dentists", label: "Dentistas", icon: Stethoscope },
  { href: "/owner/patients", label: "Pacientes", icon: Users },
  { href: "/owner/appointments", label: "Agenda", icon: Calendar },
  { href: "/owner/finances", label: "Finanzas", icon: DollarSign },
  { href: "/owner/reports", label: "Reportes", icon: BarChart3 },
  { href: "/owner/settings", label: "Configuración", icon: Settings },
];

export function OwnerSidebar({ 
  isCollapsed = false,
  onToggle
}: { 
  isCollapsed?: boolean;
  onToggle?: () => void;
}) {
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="flex h-full flex-col bg-background">
      <div className={cn("flex h-16 items-center border-b px-4", isCollapsed ? "justify-center" : "justify-between")}>
        {!isCollapsed && (
          <Link href="/owner/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tight hover:opacity-80 transition-opacity" title="Mi Clínica">
            <div className="bg-blue-500/10 p-1.5 rounded-lg shrink-0">
              <ToothIcon className="h-5 w-5 text-blue-600" />
            </div>
            <span className="truncate">Mi Clínica</span>
          </Link>
        )}
        {onToggle && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggle} 
            className="text-muted-foreground hover:text-foreground shrink-0 h-9 w-9 transition-colors"
            title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {isCollapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </Button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin overflow-x-hidden">
        <nav className="space-y-1 px-3">
          {!isCollapsed && (
            <div className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Menu Principal
            </div>
          )}
          {ownerLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                title={isCollapsed ? link.label : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-lg py-2 text-sm font-medium transition-all relative",
                  isActive
                    ? "bg-blue-500/10 text-blue-600"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  isCollapsed ? "px-0 justify-center mx-1" : "px-3"
                )}
              >
                {isActive && (
                  <div className={cn("absolute top-1/2 -translate-y-1/2 h-full w-1 bg-blue-600", isCollapsed ? "left-0 rounded-r-md" : "left-0 rounded-r-md")} />
                )}
                <link.icon className={cn("h-5 w-5 shrink-0 transition-colors", isActive ? "text-blue-600" : "text-muted-foreground group-hover:text-accent-foreground")} />
                {!isCollapsed && <span className="truncate">{link.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="border-t p-4">
        <Button
          variant="ghost"
          size={isCollapsed ? "icon" : "default"}
          title={isCollapsed ? "Cerrar sesión" : undefined}
          className={cn(
            "w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors",
            isCollapsed ? "justify-center" : "justify-start gap-3"
          )}
          onClick={logout}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span className="truncate">Cerrar sesión</span>}
        </Button>
      </div>
    </div>
  );
}
