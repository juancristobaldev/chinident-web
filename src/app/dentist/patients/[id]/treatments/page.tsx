"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Plus, CheckCircle2, Trash2 } from "lucide-react";
import { toast } from "sonner";

const STATUS_MAP: Record<string, string> = {
  PLANIFICADO: "active", EN_PROGRESO: "active", COMPLETADO: "inactive", CANCELADO: "inactive",
};

export default function TreatmentsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", notes: "" });
  const [stageForms, setStageForms] = useState<Record<string, { name: string; description: string; toothCode: string }>>({});

  const fetchPlans = async () => {
    try {
      const data = await api.get<any[]>(`/treatments/patient/${id}`);
      setPlans(data);
    } catch { toast.error("Error al cargar datos"); } finally { setLoading(false); }
  };

  useEffect(() => { fetchPlans(); }, [id]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/treatments", { patientId: id, ...form });
      setShowCreate(false);
      setForm({ name: "", description: "", notes: "" });
      fetchPlans();
    } catch { toast.error("Error al guardar"); } finally { setSaving(false); }
  };

  const completePlan = async (planId: string) => {
    await api.post(`/treatments/${planId}/complete`);
    fetchPlans();
  };

  const addStage = async (planId: string) => {
    const stage = stageForms[planId] || { name: "", description: "", toothCode: "" };
    if (!stage.name.trim()) return toast.error("Ingresa el nombre de la etapa");
    await api.post(`/treatments/${planId}/stages`, {
      name: stage.name,
      description: stage.description || undefined,
      toothCode: stage.toothCode ? Number(stage.toothCode) : undefined,
    });
    setStageForms((prev) => ({ ...prev, [planId]: { name: "", description: "", toothCode: "" } }));
    fetchPlans();
  };

  const completeStage = async (planId: string, stageId: string) => {
    await api.put(`/treatments/${planId}/stages/${stageId}`, { status: "COMPLETADO" });
    fetchPlans();
  };

  const removeStage = async (planId: string, stageId: string) => {
    await api.delete(`/treatments/${planId}/stages/${stageId}`);
    fetchPlans();
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner className="h-8 w-8" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
          <h1 className="text-2xl font-bold tracking-tight">Planes de Tratamiento</h1>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Nuevo Plan</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nuevo Plan de Tratamiento</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-2">
              <div className="space-y-2"><Label htmlFor="name">Nombre *</Label><Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="description">Descripción</Label><Textarea id="description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="notes">Notas</Label><Textarea id="notes" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancelar</Button>
                <Button type="submit" disabled={saving}>{saving ? <Spinner className="mr-2" /> : null} Guardar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {plans.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground">No hay planes de tratamiento.</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    {plan.description && <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={STATUS_MAP[plan.status] || "inactive"} />
                    {plan.status !== "COMPLETADO" && plan.status !== "CANCELADO" && (
                      <Button variant="outline" size="sm" onClick={() => completePlan(plan.id)}>
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Completar
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {plan.stages?.map((stage: any) => (
                    <div key={stage.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                          {stage.step}
                        </span>
                        <span>{stage.name}</span>
                        {stage.toothCode && <span className="text-xs text-muted-foreground">Diente {stage.toothCode}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={stage.status === "COMPLETADO" ? "active" : "inactive"} />
                        {stage.status !== "COMPLETADO" && <Button size="sm" variant="ghost" onClick={() => completeStage(plan.id, stage.id)}><CheckCircle2 className="h-4 w-4" /></Button>}
                        <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => removeStage(plan.id, stage.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                  <div className="grid gap-2 border-t pt-3 sm:grid-cols-[1fr_1fr_90px_auto]">
                    <Input placeholder="Nueva etapa" value={stageForms[plan.id]?.name || ""} onChange={(e) => setStageForms((prev) => ({ ...prev, [plan.id]: { ...(prev[plan.id] || { description: "", toothCode: "" }), name: e.target.value } }))} />
                    <Input placeholder="Descripción" value={stageForms[plan.id]?.description || ""} onChange={(e) => setStageForms((prev) => ({ ...prev, [plan.id]: { ...(prev[plan.id] || { name: "", toothCode: "" }), description: e.target.value } }))} />
                    <Input placeholder="Diente" type="number" value={stageForms[plan.id]?.toothCode || ""} onChange={(e) => setStageForms((prev) => ({ ...prev, [plan.id]: { ...(prev[plan.id] || { name: "", description: "" }), toothCode: e.target.value } }))} />
                    <Button type="button" variant="outline" onClick={() => addStage(plan.id)}>Agregar</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
