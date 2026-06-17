"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function PatientBudgetsPage() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any[]>("/budgets/me")
      .then(setBudgets)
      .catch(() => {
        toast.error("Error al cargar presupuestos");
        setBudgets([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner className="h-8 w-8" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mis Presupuestos</h1>
        <p className="text-muted-foreground">Presupuestos de tratamientos</p>
      </div>

      {budgets.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground">No tienes presupuestos.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {budgets.map((b) => (
            <Card key={b.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Presupuesto #{b.id.slice(-6)}</CardTitle>
                    <p className="text-sm text-muted-foreground">{formatDate(b.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold">${Number(b.total).toLocaleString("es-CL")}</span>
                    <StatusBadge status={b.status === "ACEPTADO" ? "active" : b.status === "RECHAZADO" ? "inactive" : "inactive"} />
                  </div>
                </div>
              </CardHeader>
              {b.items?.length > 0 && (
                <CardContent>
                  <div className="space-y-1">
                    {b.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.procedure} — {item.description}</span>
                        <span className="text-muted-foreground">
                          {item.quantity}x ${Number(item.unitPrice).toLocaleString("es-CL")}
                        </span>
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
