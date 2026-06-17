import { Wrench } from "lucide-react";

export default function SubscriptionsPage() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="mb-6 rounded-full bg-amber-100 p-4">
        <Wrench className="h-10 w-10 text-amber-600" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight">Suscripciones</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        Esta sección está en mantenimiento. Volveremos pronto con mejoras en la
        gestión de planes y suscripciones.
      </p>
    </div>
  );
}
