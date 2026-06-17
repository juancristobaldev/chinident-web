"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle } from "lucide-react";
import { ToothIcon } from "@/components/ui/tooth-icon";
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
    <div className="flex min-h-screen items-center justify-center bg-muted/20 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <ToothIcon className="mx-auto h-10 w-10 text-primary" />
          <CardTitle className="mt-2">Recuperar Contraseña</CardTitle>
          <CardDescription>Ingresa tu email y te enviaremos un enlace</CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center space-y-4">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <p className="text-sm text-muted-foreground">
                Si el email está registrado, recibirás un enlace de recuperación.
              </p>
              <Link href="/auth/login" className="text-primary hover:underline text-sm">
                Volver al inicio
              </Link>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Spinner className="mr-2 h-4 w-4" /> : null}
                Enviar enlace
              </Button>
            </form>
          )}
          {!sent && (
            <div className="mt-4 text-center text-sm">
              <Link href="/auth/login" className="text-primary hover:underline">Volver al inicio</Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
