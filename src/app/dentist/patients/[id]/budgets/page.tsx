"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Plus, Trash2, Send, Check, X } from "lucide-react";
import { toast } from "sonner";

export default function BudgetsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [itemForms, setItemForms] = useState<Record<string, { procedure: string; description: string; unitPrice: string; quantity: string }>>({});
  const [items, setItems] = useState<{ procedure: string; description: string; unitPrice: number; quantity: number; toothCode?: number }[]>([
    { procedure: "", description: "", unitPrice: 0, quantity: 1 },
  ]);
  const [form, setForm] = useState({ notes: "", validUntil: "" });

  const fetchBudgets = async () => {
    try {
      const data = await api.get<any[]>(`/budgets/patient/${id}`);
      setBudgets(data);
    } catch { toast.error("Error al cargar datos"); } finally { setLoading(false); }
  };

  useEffect(() => { fetchBudgets(); }, [id]);

  const addItem = () => setItems([...items, { procedure: "", description: "", unitPrice: 0, quantity: 1 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: string, value: any) => {
    const updated = [...items];
    (updated[i] as any)[field] = value;
    if (field === "unitPrice" || field === "quantity") {
      updated[i] = { ...updated[i], [field]: Number(value) || 0 };
    }
    setItems(updated);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const validItems = items.filter((i) => i.procedure && i.description && i.unitPrice > 0 && i.quantity > 0);
      if (validItems.length !== items.length || validItems.length === 0) {
        toast.error("Completa todos los ítems con precio y cantidad válidos");
        setSaving(false);
        return;
      }
      await api.post("/budgets", {
        patientId: id,
        notes: form.notes || undefined,
        validUntil: form.validUntil || undefined,
        items: validItems,
      });
      setShowCreate(false);
      setItems([{ procedure: "", description: "", unitPrice: 0, quantity: 1 }]);
      setForm({ notes: "", validUntil: "" });
      fetchBudgets();
    } catch { toast.error("Error al guardar"); } finally { setSaving(false); }
  };

  const handleAction = async (budgetId: string, action: string) => {
    await api.put(`/budgets/${budgetId}/${action}`);
    fetchBudgets();
  };

  const addBudgetItem = async (budgetId: string) => {
    const item = itemForms[budgetId] || { procedure: "", description: "", unitPrice: "", quantity: "1" };
    if (!item.procedure || !item.description || Number(item.unitPrice) <= 0 || Number(item.quantity) <= 0) {
      return toast.error("Completa el ítem antes de agregarlo");
    }
    await api.post(`/budgets/${budgetId}/items`, { ...item, unitPrice: Number(item.unitPrice), quantity: Number(item.quantity) });
    setItemForms((prev) => ({ ...prev, [budgetId]: { procedure: "", description: "", unitPrice: "", quantity: "1" } }));
    fetchBudgets();
  };

  const removeBudgetItem = async (budgetId: string, itemId: string) => {
    await api.delete(`/budgets/${budgetId}/items/${itemId}`);
    fetchBudgets();
  };

  const deleteBudget = async (budgetId: string) => {
    await api.delete(`/budgets/${budgetId}`);
    fetchBudgets();
  };

  const totalBudget = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner className="h-8 w-8" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
          <h1 className="text-2xl font-bold tracking-tight">Presupuestos</h1>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Nuevo Presupuesto</Button></DialogTrigger>
          <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Nuevo Presupuesto</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-2">
              {items.map((item, i) => (
                <div key={i} className="flex gap-2 items-end">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Procedimiento</Label>
                    <Input value={item.procedure} onChange={(e) => updateItem(i, "procedure", e.target.value)} placeholder="Ej: Limpieza" required />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Descripción</Label>
                    <Input value={item.description} onChange={(e) => updateItem(i, "description", e.target.value)} placeholder="Detalle" required />
                  </div>
                  <div className="w-20 space-y-1">
                    <Label className="text-xs">Precio</Label>
                    <Input type="number" value={item.unitPrice || ""} onChange={(e) => updateItem(i, "unitPrice", e.target.value)} min={0} />
                  </div>
                  <div className="w-14 space-y-1">
                    <Label className="text-xs">Cant</Label>
                    <Input type="number" value={item.quantity} onChange={(e) => updateItem(i, "quantity", e.target.value)} min={1} />
                  </div>
                  {items.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(i)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addItem}>+ Agregar item</Button>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm text-muted-foreground">Total: ${totalBudget.toLocaleString("es-CL")}</span>
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancelar</Button>
                <Button type="submit" disabled={saving}>{saving ? <Spinner className="mr-2" /> : null} Guardar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {budgets.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground">No hay presupuestos.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {budgets.map((b) => (
            <Card key={b.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      Presupuesto <span className="text-muted-foreground font-normal text-sm">#{b.id.slice(-6)}</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{formatDate(b.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">${Number(b.total).toLocaleString("es-CL")}</span>
                    <StatusBadge status={b.status === "ACEPTADO" || b.status === "ENVIADO" ? "active" : b.status === "RECHAZADO" ? "inactive" : "inactive"} />
                  </div>
                </div>
              </CardHeader>
              {b.items?.length > 0 && (
                <CardContent>
                  <div className="space-y-1">
                    {b.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between gap-3 text-sm">
                        <span>{item.procedure} — {item.description}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{item.quantity}x ${Number(item.unitPrice).toLocaleString("es-CL")}</span>
                          {b.status === "BORRADOR" && <Button size="sm" variant="ghost" onClick={() => removeBudgetItem(b.id, item.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>}
                        </div>
                      </div>
                    ))}
                  </div>
                  {b.status === "BORRADOR" && (
                    <div className="mt-4 space-y-3">
                      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_100px_80px_auto]">
                        <Input placeholder="Procedimiento" value={itemForms[b.id]?.procedure || ""} onChange={(e) => setItemForms((prev) => ({ ...prev, [b.id]: { ...(prev[b.id] || { description: "", unitPrice: "", quantity: "1" }), procedure: e.target.value } }))} />
                        <Input placeholder="Descripción" value={itemForms[b.id]?.description || ""} onChange={(e) => setItemForms((prev) => ({ ...prev, [b.id]: { ...(prev[b.id] || { procedure: "", unitPrice: "", quantity: "1" }), description: e.target.value } }))} />
                        <Input placeholder="Precio" type="number" value={itemForms[b.id]?.unitPrice || ""} onChange={(e) => setItemForms((prev) => ({ ...prev, [b.id]: { ...(prev[b.id] || { procedure: "", description: "", quantity: "1" }), unitPrice: e.target.value } }))} />
                        <Input placeholder="Cant" type="number" value={itemForms[b.id]?.quantity || "1"} onChange={(e) => setItemForms((prev) => ({ ...prev, [b.id]: { ...(prev[b.id] || { procedure: "", description: "", unitPrice: "" }), quantity: e.target.value } }))} />
                        <Button type="button" variant="outline" onClick={() => addBudgetItem(b.id)}>Agregar</Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleAction(b.id, "send")}><Send className="mr-1 h-3.5 w-3.5" /> Enviar</Button>
                        <Button size="sm" variant="outline" onClick={() => handleAction(b.id, "approve")}><Check className="mr-1 h-3.5 w-3.5 text-green-600" /> Aprobar</Button>
                        <Button size="sm" variant="outline" onClick={() => handleAction(b.id, "reject")}><X className="mr-1 h-3.5 w-3.5 text-red-600" /> Rechazar</Button>
                        <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => deleteBudget(b.id)}><Trash2 className="mr-1 h-3.5 w-3.5" /> Eliminar</Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
