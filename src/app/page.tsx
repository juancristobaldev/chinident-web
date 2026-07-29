"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ToothIcon} from "@phosphor-icons/react";
import { Calendar, Users, Shield, BarChart3, ChevronRight } from "lucide-react";
import { useAuthStore, ROLE_ROUTES } from "@/stores/auth-store";

export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-primary/20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 font-bold text-2xl tracking-tight text-foreground">
            <div className="bg-primary/10 p-2 rounded-xl">
              <ToothIcon className="h-6 w-6 text-primary" />
            </div>
            ChiniDent
          </div>
          <nav className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <Link href={ROLE_ROUTES[user.role]}>
                <Button variant="default" className="font-semibold rounded-full px-6 shadow-sm">
                  Ir a mi cuenta
                </Button>
              </Link>
            ) : (
              <Link href="/auth/login">
                <Button variant="default" className="font-semibold rounded-full px-6 shadow-sm">
                  Iniciar sesión
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-background pt-24 pb-32 lg:pt-36 lg:pb-40">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
          
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-8 transition-colors hover:bg-primary/10">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              Plataforma para Clínicas Dentales
            </div>
            
            <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-foreground sm:text-7xl mb-6">
              Gestión Odontológica <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
                Simple y Eficaz
              </span>
            </h1>
            
            <p className="mx-auto max-w-2xl text-lg sm:text-xl text-muted-foreground mb-10 leading-relaxed">
              Administra agendas, fichas clínicas, odontogramas interactivos y facturación desde un solo lugar. Diseñado para optimizar el tiempo de tu clínica.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated && user ? (
                <Link href={ROLE_ROUTES[user.role]} className="w-full sm:w-auto">
                  <Button size="lg" className="h-14 px-8 text-base font-semibold rounded-full w-full group shadow-md hover:shadow-lg">
                    Ir a mi cuenta
                    <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/login" className="w-full sm:w-auto">
                  <Button size="lg" className="h-14 px-8 text-base font-semibold rounded-full w-full group shadow-md hover:shadow-lg">
                    Comenzar ahora
                    <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t bg-muted/30 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
                Todo lo que necesitas para tu clínica
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Herramientas modernas y fáciles de usar, pensadas para dentistas, administradores y pacientes.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {[
                { 
                  icon: Calendar, 
                  title: "Agenda Inteligente", 
                  desc: "Organiza citas con vistas por día, semana y mes. Reprograma rápidamente." 
                },
                { 
                  icon: Users, 
                  title: "Ficha Clínica", 
                  desc: "Historial completo de pacientes, planes de tratamiento y evolución clínica detallada." 
                },
                { 
                  icon: ToothIcon, 
                  title: "Odontograma", 
                  desc: "Odontograma interactivo y visual para registrar diagnósticos de forma precisa." 
                },
                { 
                  icon: Shield, 
                  title: "Seguridad Avanzada", 
                  desc: "Control de acceso basado en roles para proteger toda la información clínica." 
                },
              ].map(({ icon: Icon, title, desc }, index) => (
                <div 
                  key={index} 
                  className="group relative rounded-2xl border bg-background p-8 shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
                >
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-foreground">{title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 font-bold text-xl text-foreground">
            <ToothIcon className="h-6 w-6 text-primary" />
            ChiniDent
          </div>
          <p className="text-sm text-muted-foreground text-center md:text-left">
            &copy; {new Date().getFullYear()} ChiniDent. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
