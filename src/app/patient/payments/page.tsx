"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { DollarSign } from "lucide-react";
import { toast } from "sonner";

export default function PatientPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any[]>("/payments/me")
      .then(setPayments)
      .catch(() => {
        toast.error("Error al cargar pagos");
        setPayments([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalPaid = payments
    .filter((p) => p.status === "PAGADO")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPending = payments
    .filter((p) => p.status === "PENDIENTE")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mis Pagos</h1>
        <p className="text-muted-foreground">Historial de pagos realizados</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Pagado</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">${totalPaid.toLocaleString("es-CL")}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pendiente</CardTitle>
            <DollarSign className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">${totalPending.toLocaleString("es-CL")}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Pagos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{payments.length}</div></CardContent>
        </Card>
      </div>

      {payments.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground">No tienes pagos registrados.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {payments.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">${Number(p.amount).toLocaleString("es-CL")}</span>
                    <span className="text-sm text-muted-foreground">{p.method}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{formatDate(p.createdAt)}</p>
                </div>
                <StatusBadge status={p.status === "PAGADO" ? "active" : "inactive"} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
