"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RoleNotFoundProps {
  homeHref: string;
  homeLabel: string;
}

export function RoleNotFound({ homeHref, homeLabel }: RoleNotFoundProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Página no encontrada</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            La página que buscas no existe o no tienes acceso.
          </p>
          <Button asChild>
            <Link href={homeHref}>{homeLabel}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
