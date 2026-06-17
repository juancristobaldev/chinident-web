"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ToothIcon } from "@/components/ui/tooth-icon";
import { Calendar, Users, Shield, BarChart3 } from "lucide-react";
import { useAuthStore, ROLE_ROUTES } from "@/stores/auth-store";

export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2 font-semibold text-xl">
            <ToothIcon className="h-7 w-7 text-primary" />
            ChiniDent
          </div>
          <nav className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <Link href={ROLE_ROUTES[user.role]}>
                <Button>Ir a mi cuenta</Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button>Iniciar sesión</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
            Gestión Odontológica
            <br />
            <span className="text-primary">Simple y Eficaz</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Plataforma multi-tenant diseñada para clínicas dentales. Administra
            agendas, fichas clínicas, odontogramas, presupuestos y facturación
            desde un solo lugar.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            {isAuthenticated && user ? (
              <Link href={ROLE_ROUTES[user.role]}>
                <Button size="lg">Ir a mi cuenta</Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button size="lg">Comenzar ahora</Button>
                </Link>
              </>
            )}
          </div>
        </section>

        <section className="border-t bg-muted/50 py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Calendar, title: "Agenda Inteligente", desc: "Vista día, semana y mes con drag & drop." },
                { icon: Users, title: "Ficha Clínica", desc: "Historial completo, odontograma interactivo." },
                { icon: BarChart3, title: "Dashboard Financiero", desc: "Ingresos, pagos pendientes y reportes." },
                { icon: Shield, title: "Seguridad RBAC", desc: "Roles admin, owner, dentista y paciente." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rounded-lg border bg-white p-6">
                  <Icon className="h-10 w-10 text-primary" />
                  <h3 className="mt-4 font-semibold">{title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} ChiniDent. Todos los derechos reservados.
      </footer>
    </div>
  );
}
