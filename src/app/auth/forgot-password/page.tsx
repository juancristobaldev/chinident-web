"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle2, Mail, ShieldCheck, ArrowLeft } from "lucide-react";
import { ToothIcon} from "@phosphor-icons/react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch {
      toast.error("Error al enviar el enlace");
    } finally {
      setLoading(false);
    }
  };

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
            Recupera tu acceso de forma segura.
          </h1>
          <p className="text-primary-foreground/80 text-lg">
            Te ayudaremos a restablecer tu contraseña para que sigas administrando tu clínica.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-sm text-primary-foreground/80 font-medium">
          <ShieldCheck className="h-5 w-5" />
          Tus datos están protegidos en todo momento
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 sm:p-12 lg:p-24 relative">
        <div className="w-full max-w-sm space-y-8">
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
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Recuperar contraseña</h2>
            <p className="mt-2 text-muted-foreground">Ingresa tu email y te enviaremos instrucciones.</p>
          </div>

          {sent ? (
            <div className="space-y-6 text-center lg:text-left">
              <div className="flex flex-col items-center lg:items-start space-y-4">
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Correo enviado</h3>
                <p className="text-muted-foreground">
                  Si el correo <span className="font-medium text-foreground">{email}</span> está registrado, recibirás un enlace de recuperación en los próximos minutos.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-semibold text-foreground/80">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="tu@email.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    className="pl-10 h-11 bg-muted/40 border-muted-foreground/20 focus-visible:ring-primary/30 transition-all"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-11 text-base font-semibold shadow-sm hover:shadow-md transition-all" disabled={loading}>
                {loading ? <Spinner className="mr-2 h-4 w-4" /> : null}
                {loading ? "Enviando enlace..." : "Enviar enlace de recuperación"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
