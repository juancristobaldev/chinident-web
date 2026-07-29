"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle2, ShieldCheck, Lock, ArrowLeft } from "lucide-react";
import { ToothIcon} from "@phosphor-icons/react";
import { api } from "@/lib/api";
import { toast } from "sonner";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || password !== confirm) {
      toast.error(password !== confirm ? "Las contraseñas no coinciden" : "Token inválido");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      setDone(true);
    } catch {
      toast.error("Error al restablecer la contraseña");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="space-y-4 text-center lg:text-left mt-8">
        <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive font-medium border border-destructive/20">
          Enlace de recuperación inválido o expirado.
        </div>
        <Link href="/auth/forgot-password" className="inline-flex items-center justify-center w-full mt-2 px-6 h-11 bg-primary text-primary-foreground font-semibold rounded-md shadow-sm hover:bg-primary/90 transition-all">
          Solicitar nuevo enlace
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="space-y-6 text-center lg:text-left mt-8">
        <div className="flex flex-col items-center lg:items-start space-y-4">
          <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Contraseña actualizada</h3>
          <p className="text-muted-foreground">Tu contraseña ha sido restablecida exitosamente. Ya puedes acceder a tu cuenta.</p>
        </div>
        <Button onClick={() => router.push("/auth/login")} className="w-full h-11 text-base font-semibold shadow-sm hover:shadow-md transition-all">
          Ir al inicio de sesión
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-8">
      <div className="space-y-2">
        <Label htmlFor="password" className="font-semibold text-foreground/80">Nueva contraseña</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            placeholder="Mínimo 8 caracteres"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 h-11 bg-muted/40 border-muted-foreground/20 focus-visible:ring-primary/30 transition-all"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm" className="font-semibold text-foreground/80">Confirmar contraseña</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="confirm"
            type="password"
            placeholder="Repite la contraseña"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="pl-10 h-11 bg-muted/40 border-muted-foreground/20 focus-visible:ring-primary/30 transition-all"
          />
        </div>
      </div>
      <Button type="submit" className="w-full h-11 text-base font-semibold shadow-sm hover:shadow-md transition-all" disabled={loading}>
        {loading ? <Spinner className="mr-2 h-4 w-4" /> : null}
        {loading ? "Actualizando..." : "Restablecer contraseña"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen w-full bg-background selection:bg-primary/20">
      {/* Left Panel - Branding */}
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
        <div className="w-full max-w-sm">
          <Link href="/auth/login" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio de sesión
          </Link>
          
          <div className="text-center lg:text-left mt-4">
            <div className="lg:hidden flex justify-center mb-6">
              <div className="bg-primary/10 p-3 rounded-2xl">
                <ToothIcon className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Crear nueva contraseña</h2>
            <p className="mt-2 text-muted-foreground">Ingresa tu nueva contraseña para acceder.</p>
          </div>

          <Suspense fallback={<div className="flex justify-center py-12"><Spinner className="h-8 w-8 text-primary" /></div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
