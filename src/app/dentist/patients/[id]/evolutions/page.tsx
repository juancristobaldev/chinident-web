"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Activity, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Evolution {
  id: string;
  createdAt: string;
  content: { description?: string; notes?: string };
  dentist?: {
    firstName?: string; lastName?: string;
  };
}

const EMPTY_FORM = { description: "", notes: "" };

export default function EvolutionsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [evolutions, setEvolutions] = useState<Evolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Evolution | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchEvolutions = () => {
    api.get<Evolution[]>(`/clinical-records/patient/${id}/type/EVOLUTION`)
      .then(setEvolutions)
      .catch(() => { toast.error("Error al cargar las evoluciones"); })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvolutions();
  }, [id]);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setDialogOpen(true); };
  const openEdit = (evolution: Evolution) => { setEditing(evolution); setForm({ description: evolution.content?.description || "", notes: evolution.content?.notes || "" }); setDialogOpen(true); };
  const saveEvolution = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const content = { description: form.description, notes: form.notes };
      if (editing) await api.put(`/clinical-records/${editing.id}`, { content });
      else await api.post("/clinical-records", { patientId: id, type: "EVOLUTION", content });
      toast.success(editing ? "Evolución actualizada" : "Evolución creada");
      setDialogOpen(false);
      fetchEvolutions();
    } catch { toast.error("Error al guardar"); } finally { setSaving(false); }
  };
  const deleteEvolution = async (recordId: string) => { await api.delete(`/clinical-records/${recordId}`); fetchEvolutions(); };

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner className="h-8 w-8" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Evoluciones</h1>
          <p className="text-muted-foreground text-sm mt-1">Seguimiento cronológico del paciente</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Nueva evolución</Button>
      </div>

      {evolutions.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground">No hay registros</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {evolutions.map((evo) => {
            const isExpanded = expandedId === evo.id;
            return (
              <Card key={evo.id}>
                <CardContent className="pt-6">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : evo.id)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                        <Activity className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{formatDate(evo.createdAt)}</p>
                        <p className="text-sm text-muted-foreground">
                          {evo.dentist
                            ? `Dr(a). ${evo.dentist.firstName} ${evo.dentist.lastName}`
                            : "Sin dentista asignado"}
                        </p>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-4 space-y-3 border-t pt-4 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground">Descripción</span>
                        <p className="mt-0.5">{evo.content?.description || "—"}</p>
                      </div>
                      {evo.content?.notes && (
                        <div>
                          <span className="font-medium text-muted-foreground">Notas</span>
                          <p className="mt-0.5 whitespace-pre-wrap">{evo.content.notes}</p>
                        </div>
                      )}
                      <div className="flex gap-2 border-t pt-3">
                        <Button size="sm" variant="outline" onClick={() => openEdit(evo)}>Editar</Button>
                        <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => deleteEvolution(evo.id)}><Trash2 className="mr-1 h-4 w-4" /> Eliminar</Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Editar evolución" : "Nueva evolución"}</DialogTitle></DialogHeader>
          <form onSubmit={saveEvolution} className="space-y-4">
            <div className="space-y-2"><Label>Descripción</Label><Textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="space-y-2"><Label>Notas</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button><Button type="submit" disabled={saving}>{saving ? <Spinner className="mr-2" /> : null} Guardar</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
