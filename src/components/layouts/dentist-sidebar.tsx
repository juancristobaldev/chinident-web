"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  Users,
  BarChart3,
  LogOut,
} from "lucide-react";
import { ToothIcon } from "@/components/ui/tooth-icon";
import { Button } from "../ui/button";
import { useAuthStore } from "@/stores/auth-store";

const dentistLinks = [
  { href: "/dentist/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dentist/agenda", label: "Agenda", icon: Calendar },
  { href: "/dentist/patients", label: "Pacientes", icon: Users },
  { href: "/dentist/reports", label: "Reportes", icon: BarChart3 },
];

export function DentistSidebar() {
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="flex h-full flex-col border-r bg-white">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dentist/dashboard" className="flex items-center gap-2 font-semibold text-lg">
          <ToothIcon className="h-6 w-6 text-primary" />
          <span>ChiniDent</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {dentistLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname.startsWith(link.href)
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="border-t p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}
