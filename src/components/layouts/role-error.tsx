"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RoleErrorProps {
  error: Error;
  reset: () => void;
}

export function RoleError({ error, reset }: RoleErrorProps) {
  console.error("Page error:", error);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Algo salió mal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Ocurrió un error inesperado. Intenta nuevamente.
          </p>
          <Button onClick={reset}>Reintentar</Button>
        </CardContent>
      </Card>
    </div>
  );
}
