"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useAuthStore, ROLE_ROUTES } from "@/stores/auth-store";
import { ToothIcon } from "@/components/ui/tooth-icon";
import Link from "next/link";

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
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Spinner className="mx-auto h-8 w-8" />
          <p className="mt-4 text-muted-foreground">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <ToothIcon className="mx-auto h-10 w-10 text-primary" />
          <CardTitle className="mt-2">ChiniDent</CardTitle>
          <CardDescription>Ingresa a tu cuenta para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="admin@chinident.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? <Spinner className="mr-2" /> : null}
              Iniciar sesión
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <Link href="/auth/forgot-password" className="text-primary hover:underline">¿Olvidaste tu contraseña?</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
