"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function PatientTreatmentsPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any[]>("/treatments/me")
      .then(setPlans)
      .catch(() => {
        toast.error("Error al cargar tratamientos");
        setPlans([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner className="h-8 w-8" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mis Tratamientos</h1>
        <p className="text-muted-foreground">Planes de tratamiento activos y completados</p>
      </div>

      {plans.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground">No tienes tratamientos registrados.</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    {plan.description && <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>}
                    {plan.dentist && <p className="text-xs text-muted-foreground mt-1">Dr. {plan.dentist.firstName} {plan.dentist.lastName}</p>}
                  </div>
                  <StatusBadge status={plan.status === "COMPLETADO" ? "active" : "inactive"} />
                </div>
              </CardHeader>
              {plan.stages?.length > 0 && (
                <CardContent>
                  <div className="space-y-2">
                    {plan.stages.map((stage: any) => (
                      <div key={stage.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                        <span>{stage.name}</span>
                        <StatusBadge status={stage.status === "COMPLETADO" ? "active" : "inactive"} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
