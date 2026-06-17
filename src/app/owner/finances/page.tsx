"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { DollarSign, TrendingUp, Wallet, Plus } from "lucide-react";

interface PaymentSummary {
  totalPaid: number;
  totalPending: number;
  byMethod: { method: string; total: number }[];
}

export default function OwnerFinancesPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [form, setForm] = useState({ patientId: "", amount: 0, method: "EFECTIVO" });

  const fetchAll = async () => {
    try {
      const [p, s] = await Promise.all([
        api.get<any[]>("/payments"),
        api.get<PaymentSummary>("/payments/summary"),
      ]);
      setPayments(p.slice(0, 30));
      setSummary(s);
    } catch { toast.error("Error al cargar datos"); } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchAll();
    api.get<any[]>("/patients").then(setPatients).catch(() => { toast.error("Error al cargar datos"); });
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/payments", { ...form, amount: Number(form.amount) });
      setShowForm(false);
      setForm({ patientId: "", amount: 0, method: "EFECTIVO" });
      fetchAll();
    } catch { toast.error("Error al guardar"); } finally { setSaving(false); }
  };

  const methodLabels: Record<string, string> = {
    EFECTIVO: "Efectivo", TRANSFERENCIA: "Transferencia", TARJETA: "Tarjeta", MIXTO: "Mixto",
  };

  const columns = [
    { key: "date", header: "Fecha", render: (p: any) => formatDate(p.createdAt) },
    { key: "patient", header: "Paciente", render: (p: any) => `${p.patient?.firstName || ""} ${p.patient?.lastName || ""}` },
    { key: "amount", header: "Monto", render: (p: any) => `$${Number(p.amount).toLocaleString("es-CL")}` },
    { key: "method", header: "Método", render: (p: any) => methodLabels[p.method] || p.method },
    { key: "status", header: "Estado", render: (p: any) => <StatusBadge status={p.status === "PAGADO" ? "active" : "inactive"} /> },
  ];

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner className="h-8 w-8" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finanzas</h1>
          <p className="text-muted-foreground">Ingresos, pagos y resumen financiero</p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Registrar Pago</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Registrar Pago</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="patientId">Paciente *</Label>
                <select id="patientId" required className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm" value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}>
                  <option value="">Seleccionar</option>
                  {patients.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.firstName || p.user?.firstName} {p.lastName || p.user?.lastName}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Monto *</Label>
                <Input id="amount" type="number" required min={1} value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="method">Método de pago</Label>
                <select id="method" className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                  <option value="TARJETA">Tarjeta</option>
                  <option value="MIXTO">Mixto</option>
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button type="submit" disabled={saving}>{saving ? <Spinner className="mr-2" /> : null} Guardar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {summary && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Cobrado</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${summary.totalPaid.toLocaleString("es-CL")}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pendiente</CardTitle>
              <Wallet className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${summary.totalPending.toLocaleString("es-CL")}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Métodos</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              {summary.byMethod.map((m) => (
                <div key={m.method} className="flex justify-between">
                  <span>{methodLabels[m.method] || m.method}</span>
                  <span className="font-medium">${m.total.toLocaleString("es-CL")}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle className="text-lg">Últimos Pagos</CardTitle></CardHeader>
        <CardContent>
          <DataTable columns={columns} data={payments} emptyMessage="No hay pagos registrados" />
        </CardContent>
      </Card>
    </div>
  );
}
