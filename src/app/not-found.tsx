import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RootNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <FileQuestion className="h-12 w-12 text-muted-foreground" />
      <div className="text-center">
        <h2 className="text-lg font-semibold">Página no encontrada</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          La página que buscas no existe o fue movida.
        </p>
      </div>
      <Button asChild variant="outline">
        <Link href="/">Volver al inicio</Link>
      </Button>
    </div>
  );
}
