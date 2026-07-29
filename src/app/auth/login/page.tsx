"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useAuthStore, ROLE_ROUTES } from "@/stores/auth-store";
import Link from "next/link";
import { ToothIcon} from "@phosphor-icons/react";

import { ShieldCheck, Mail, Lock } from "lucide-react";

function getRolePrefix(role: string): string {
  const route = ROLE_ROUTES[role as keyof typeof ROLE_ROUTES] || "";
  return route.split("/")[1] || "";
}

export default function LoginPage() {
  const router = useRouter();
  const { login, checkAuth, user, isAuthenticated, isLoading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");
      if (redirect) setRedirectTo(redirect);
    } catch {}
  }, []);

  useEffect(() => { checkAuth(); }, []);

  useEffect(() => {
    const t = setTimeout(() => useAuthStore.setState({ isLoading: false }), 8000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const rolePrefix = getRolePrefix(user.role);
      const target = redirectTo && redirectTo.startsWith(`/${rolePrefix}`)
        ? redirectTo
        : ROLE_ROUTES[user.role];
      router.replace(target);
    }
  }, [isLoading, isAuthenticated, user, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const u = await login(email, password);
      const rolePrefix = getRolePrefix(u.role);
      const target = redirectTo && redirectTo.startsWith(`/${rolePrefix}`)
        ? redirectTo
        : ROLE_ROUTES[u.role];
      router.replace(target);
    } catch (err: any) {
      setError(err.message || "Credenciales inválidas");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Spinner className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-4 text-muted-foreground font-medium">Redirigiendo a tu panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-background selection:bg-primary/20">
      {/* Left Panel - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-primary p-12 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]"></div>
        
        <div className="relative z-10 flex items-center gap-2 font-bold text-2xl">
          <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm">
            <ToothIcon className="h-6 w-6 text-white" />
          </div>
          ChiniDent
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-4xl font-bold leading-tight mb-6">
            La plataforma líder para gestión odontológica.
          </h1>
          <p className="text-primary-foreground/80 text-lg">
            Administra tu clínica de manera eficiente, segura y con tecnología de vanguardia.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-sm text-primary-foreground/80 font-medium">
          <ShieldCheck className="h-5 w-5" />
          Acceso seguro y encriptado de extremo a extremo
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 sm:p-12 lg:p-24 relative">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-6">
              <div className="bg-primary/10 p-3 rounded-2xl">
                <ToothIcon className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Bienvenido de vuelta</h2>
            <p className="mt-2 text-muted-foreground">Ingresa tus credenciales para acceder a tu cuenta.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold text-foreground/80">Correo Electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="admin@chinident.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className="pl-10 h-11 bg-muted/40 border-muted-foreground/20 focus-visible:ring-primary/30 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="font-semibold text-foreground/80">Contraseña</Label>
                <Link href="/auth/forgot-password" className="text-sm font-medium text-primary hover:underline transition-all">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  className="pl-10 h-11 bg-muted/40 border-muted-foreground/20 focus-visible:ring-primary/30 transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive font-medium border border-destructive/20 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-11 text-base font-semibold shadow-sm hover:shadow-md transition-all" disabled={submitting}>
              {submitting ? <Spinner className="mr-2 h-4 w-4" /> : null}
              {submitting ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
