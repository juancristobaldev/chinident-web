"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { formatDate, formatCurrency } from "@/lib/utils";
import { ArrowLeft, ChevronDown, ChevronUp, FileText, Activity, Ban, Stethoscope, ClipboardList, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CLINICAL_CATALOG } from "@/components/odontogram/clinical-types";

interface ClinicalRecord {
  id: string;
  createdAt: string;
  type: string;
  content: { diagnosis?: string; treatment?: string; notes?: string; title?: string; description?: string };
  dentist?: { firstName?: string; lastName?: string };
}

interface OdontogramRecord {
  id: string;
  toothNumber: number;
  faces: string[];
  catalogId: string;
  status: string;
  notes: string | null;
  creatorName: string;
  createdAt: string;
}

interface TreatmentPlan {
  id: string;
  name: string;
  description: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  notes: string | null;
  createdAt: string;
  dentist?: { firstName?: string; lastName?: string };
  stages: TreatmentStage[];
  _count?: { stages: number };
}

interface TreatmentStage {
  id: string;
  step: number;
  name: string;
  description: string | null;
  toothCode: number | null;
  status: string;
  completedAt: string | null;
}

interface Budget {
  id: string;
  status: string;
  subtotal: number;
  discount: number;
  total: number;
  notes: string | null;
  validUntil: string | null;
  createdAt: string;
  dentist?: { firstName?: string; lastName?: string };
  items: BudgetItem[];
}

interface BudgetItem {
  id: string;
  procedure: string;
  description: string;
  unitPrice: number;
  quantity: number;
  total: number;
  toothCode: number | null;
}

type Section = "records" | "odontogram" | "treatments" | "budgets";

const STATUS_LABELS: Record<string, string> = {
  PLANIFICADO: "Planificado", EN_PROGRESO: "En Progreso", COMPLETADO: "Completado", CANCELADO: "Cancelado",
  BORRADOR: "Borrador", ENVIADO: "Enviado", ACEPTADO: "Aceptado", RECHAZADO: "Rechazado",
  realized: "Realizado", planned: "Planificado", existing: "Existente",
};

const STATUS_COLORS: Record<string, string> = {
  PLANIFICADO: "bg-yellow-100 text-yellow-800", EN_PROGRESO: "bg-blue-100 text-blue-800",
  COMPLETADO: "bg-green-100 text-green-800", CANCELADO: "bg-red-100 text-red-800",
  BORRADOR: "bg-gray-100 text-gray-800", ENVIADO: "bg-blue-100 text-blue-800",
  ACEPTADO: "bg-green-100 text-green-800", RECHAZADO: "bg-red-100 text-red-800",
  realized: "bg-blue-100 text-blue-800", planned: "bg-yellow-100 text-yellow-800", existing: "bg-gray-100 text-gray-800",
};

const FACE_NAMES: Record<string, string> = { M: "Mesial", D: "Distal", V: "Vestibular", L: "Lingual", P: "Palatino", O: "Oclusal" };

const EMPTY_FORM = { type: "DIAGNOSIS", diagnosis: "", treatment: "", notes: "" };
const RECORD_TYPES: { value: string; label: string }[] = [
  { value: "DIAGNOSIS", label: "Diagnóstico" }, { value: "PROCEDURE", label: "Procedimiento" },
  { value: "OBSERVATION", label: "Observación" }, { value: "ANAMNESIS", label: "Anamnesis" },
  { value: "EVOLUTION", label: "Evolución" },
];

function getCatalogName(catalogId: string) {
  return CLINICAL_CATALOG[catalogId]?.name || catalogId;
}

export default function ClinicHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [records, setRecords] = useState<ClinicalRecord[]>([]);
  const [odontogramRecords, setOdontogramRecords] = useState<OdontogramRecord[]>([]);
  const [treatments, setTreatments] = useState<TreatmentPlan[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleSections, setVisibleSections] = useState<Record<Section, boolean>>({ records: true, odontogram: true, treatments: true, budgets: true });
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ClinicalRecord | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const toggleSection = (section: Section) => setVisibleSections((s) => ({ ...s, [section]: !s[section] }));
  const toggleExpanded = (itemId: string) => setExpandedIds((prev) => { const next = new Set(prev); if (next.has(itemId)) next.delete(itemId); else next.add(itemId); return next; });

  const fetchAll = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get<ClinicalRecord[]>(`/clinical-records/patient/${id}`),
      api.get<OdontogramRecord[]>(`/odontogram/${id}/records`),
      api.get<TreatmentPlan[]>(`/treatments/patient/${id}`),
      api.get<Budget[]>(`/budgets/patient/${id}`),
    ])
      .then(([r, o, t, b]) => { setRecords(r); setOdontogramRecords(o); setTreatments(t); setBudgets(b); })
      .catch(() => toast.error("Error al cargar la historia clínica"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setDialogOpen(true); };
  const openEdit = (record: ClinicalRecord) => {
    setEditing(record);
    if (record.type === "EVOLUTION") {
      setForm({ type: "EVOLUTION", diagnosis: record.content?.description || "", treatment: "", notes: record.content?.notes || "" });
    } else {
      setForm({ type: record.type, diagnosis: record.content?.diagnosis || "", treatment: record.content?.treatment || "", notes: record.content?.notes || "" });
    }
    setDialogOpen(true);
  };

  const saveRecord = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      let content: any;
      if (form.type === "EVOLUTION") content = { description: form.diagnosis, notes: form.notes };
      else content = { diagnosis: form.diagnosis, treatment: form.treatment, notes: form.notes };

      if (editing) await api.put(`/clinical-records/${editing.id}`, { content });
      else await api.post("/clinical-records", { type: form.type, patientId: id, content });
      toast.success(editing ? "Registro actualizado" : "Registro creado");
      setDialogOpen(false);
      fetchAll();
    } catch { toast.error("Error al guardar"); } finally { setSaving(false); }
  };

  const deleteRecord = async (recordId: string) => {
    await api.delete(`/clinical-records/${recordId}`);
    toast.success("Registro eliminado");
    fetchAll();
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner className="h-8 w-8" /></div>;

  const SectionHeader = ({ section, label, count }: { section: Section; label: string; count: number }) => (
    <button onClick={() => toggleSection(section)} className="flex items-center gap-2 w-full text-left group">
      <div className="flex items-center gap-2 flex-1">
        <h2 className="text-lg font-semibold">{label}</h2>
        <span className="text-sm text-muted-foreground">({count})</span>
      </div>
      {visibleSections[section] ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
    </button>
  );

  const StatusBadge = ({ status }: { status: string }) => (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[status] || "bg-gray-100 text-gray-800"}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );

  const EmptyState = ({ message }: { message: string }) => (
    <Card><CardContent className="py-6 text-center text-sm text-muted-foreground">{message}</CardContent></Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Historia Clínica</h1>
          <p className="text-muted-foreground text-sm mt-1">Registros clínicos, odontograma, tratamientos y presupuestos</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Nuevo registro</Button>
      </div>

      {/* === Registros Clínicos === */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <SectionHeader section="records" label="Registros Clínicos" count={records.length} />
            {visibleSections.records && (
              records.length === 0 ? <EmptyState message="No hay registros clínicos" /> : (
                <div className="space-y-2">
                  {records.map((record) => {
                    const isExpanded = expandedIds.has(record.id);
                    const isEvolution = record.type === "EVOLUTION";
                    return (
                      <Card key={record.id} className="border-l-4" style={{ borderLeftColor: isEvolution ? "#10b981" : "#6b7280" }}>
                        <CardContent className="py-3 px-4">
                          <button onClick={() => toggleExpanded(record.id)} className="flex items-center justify-between w-full text-left">
                            <div className="flex items-center gap-3 min-w-0">
                              {isEvolution ? (
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100"><Activity className="h-3.5 w-3.5 text-green-600" /></div>
                              ) : (
                                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                              )}
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">{formatDate(record.createdAt)}</span>
                                  {isEvolution ? <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700">Evolución</span>
                                    : <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground">{RECORD_TYPES.find((t) => t.value === record.type)?.label || record.type}</span>}
                                </div>
                                <p className="text-xs text-muted-foreground truncate">
                                  {record.dentist ? `Dr(a). ${record.dentist.firstName} ${record.dentist.lastName}` : "Sin dentista"}
                                </p>
                              </div>
                            </div>
                            {isExpanded ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
                          </button>
                          {isExpanded && (
                            <div className="mt-3 space-y-2 border-t pt-3 text-sm">
                              {isEvolution ? (
                                <>
                                  <div><span className="font-medium text-muted-foreground">Descripción</span><p className="mt-0.5">{record.content?.description || "—"}</p></div>
                                  {record.content?.notes && <div><span className="font-medium text-muted-foreground">Notas</span><p className="mt-0.5 whitespace-pre-wrap">{record.content.notes}</p></div>}
                                </>
                              ) : (
                                <>
                                  <div><span className="font-medium text-muted-foreground">Diagnóstico</span><p className="mt-0.5">{record.content?.diagnosis || "—"}</p></div>
                                  <div><span className="font-medium text-muted-foreground">Tratamiento</span><p className="mt-0.5">{record.content?.treatment || "—"}</p></div>
                                  {record.content?.notes && <div><span className="font-medium text-muted-foreground">Notas</span><p className="mt-0.5 whitespace-pre-wrap">{record.content.notes}</p></div>}
                                </>
                              )}
                              <div className="flex gap-2 border-t pt-2">
                                <Button size="sm" variant="outline" onClick={() => openEdit(record)}>Editar</Button>
                                <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => deleteRecord(record.id)}><Trash2 className="mr-1 h-3 w-3" /> Eliminar</Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* === Odontograma === */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <SectionHeader section="odontogram" label="Odontograma" count={odontogramRecords.length} />
            {visibleSections.odontogram && (
              odontogramRecords.length === 0 ? <EmptyState message="No hay registros de odontograma" /> : (
                <div className="space-y-2">
                  {odontogramRecords.map((rec) => {
                    const isExpanded = expandedIds.has(`od-${rec.id}`);
                    return (
                      <Card key={rec.id}>
                        <CardContent className="py-3 px-4">
                          <button onClick={() => toggleExpanded(`od-${rec.id}`)} className="flex items-center justify-between w-full text-left">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100"><Ban className="h-3.5 w-3.5 text-blue-600" /></div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">Diente {rec.toothNumber}</span>
                                  <StatusBadge status={rec.status} />
                                </div>
                                <p className="text-xs text-muted-foreground">{getCatalogName(rec.catalogId)}</p>
                              </div>
                            </div>
                            {isExpanded ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
                          </button>
                          {isExpanded && (
                            <div className="mt-3 space-y-2 border-t pt-3 text-sm">
                              <div className="grid grid-cols-2 gap-2">
                                <div><span className="font-medium text-muted-foreground">Procedimiento</span><p className="mt-0.5">{getCatalogName(rec.catalogId)}</p></div>
                                <div><span className="font-medium text-muted-foreground">Estado</span><p className="mt-0.5"><StatusBadge status={rec.status} /></p></div>
                                <div><span className="font-medium text-muted-foreground">Fecha</span><p className="mt-0.5">{formatDate(rec.createdAt)}</p></div>
                                <div><span className="font-medium text-muted-foreground">Creado por</span><p className="mt-0.5">{rec.creatorName}</p></div>
                                {rec.faces.length > 0 && (
                                  <div className="col-span-2"><span className="font-medium text-muted-foreground">Caras afectadas</span><p className="mt-0.5">{rec.faces.map((f) => FACE_NAMES[f] || f).join(", ") || "—"}</p></div>
                                )}
                              </div>
                              {rec.notes && <div><span className="font-medium text-muted-foreground">Notas</span><p className="mt-0.5 whitespace-pre-wrap">{rec.notes}</p></div>}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* === Tratamientos === */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <SectionHeader section="treatments" label="Tratamientos" count={treatments.length} />
            {visibleSections.treatments && (
              treatments.length === 0 ? <EmptyState message="No hay tratamientos" /> : (
                <div className="space-y-2">
                  {treatments.map((plan) => {
                    const isExpanded = expandedIds.has(`tx-${plan.id}`);
                    return (
                      <Card key={plan.id}>
                        <CardContent className="py-3 px-4">
                          <button onClick={() => toggleExpanded(`tx-${plan.id}`)} className="flex items-center justify-between w-full text-left">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-100"><Stethoscope className="h-3.5 w-3.5 text-purple-600" /></div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">{plan.name}</span>
                                  <StatusBadge status={plan.status} />
                                </div>
                                <p className="text-xs text-muted-foreground">{plan._count?.stages || plan.stages?.length || 0} etapa(s) · {formatDate(plan.createdAt)}</p>
                              </div>
                            </div>
                            {isExpanded ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
                          </button>
                          {isExpanded && (
                            <div className="mt-3 space-y-3 border-t pt-3 text-sm">
                              {plan.description && <div><span className="font-medium text-muted-foreground">Descripción</span><p className="mt-0.5">{plan.description}</p></div>}
                              <div className="grid grid-cols-2 gap-2">
                                {plan.startDate && <div><span className="font-medium text-muted-foreground">Inicio</span><p className="mt-0.5">{formatDate(plan.startDate)}</p></div>}
                                {plan.endDate && <div><span className="font-medium text-muted-foreground">Término</span><p className="mt-0.5">{formatDate(plan.endDate)}</p></div>}
                                {plan.dentist && <div><span className="font-medium text-muted-foreground">Responsable</span><p className="mt-0.5">{`Dr(a). ${plan.dentist.firstName} ${plan.dentist.lastName}`}</p></div>}
                              </div>
                              {plan.notes && <div><span className="font-medium text-muted-foreground">Notas</span><p className="mt-0.5 whitespace-pre-wrap">{plan.notes}</p></div>}
                              {plan.stages && plan.stages.length > 0 && (
                                <div>
                                  <span className="font-medium text-muted-foreground">Etapas</span>
                                  <div className="mt-1 space-y-1">
                                    {plan.stages.map((stage) => (
                                      <div key={stage.id} className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-muted-foreground">{stage.step}.</span>
                                          <span>{stage.name}</span>
                                          {stage.toothCode && <span className="text-xs text-muted-foreground">Diente {stage.toothCode}</span>}
                                        </div>
                                        <StatusBadge status={stage.status} />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* === Presupuestos === */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <SectionHeader section="budgets" label="Presupuestos" count={budgets.length} />
            {visibleSections.budgets && (
              budgets.length === 0 ? <EmptyState message="No hay presupuestos" /> : (
                <div className="space-y-2">
                  {budgets.map((budget) => {
                    const isExpanded = expandedIds.has(`bg-${budget.id}`);
                    return (
                      <Card key={budget.id}>
                        <CardContent className="py-3 px-4">
                          <button onClick={() => toggleExpanded(`bg-${budget.id}`)} className="flex items-center justify-between w-full text-left">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100"><ClipboardList className="h-3.5 w-3.5 text-amber-600" /></div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">{formatCurrency(Number(budget.total))}</span>
                                  <StatusBadge status={budget.status} />
                                </div>
                                <p className="text-xs text-muted-foreground">{budget.items?.length || 0} ítem(s) · {formatDate(budget.createdAt)}</p>
                              </div>
                            </div>
                            {isExpanded ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
                          </button>
                          {isExpanded && (
                            <div className="mt-3 space-y-3 border-t pt-3 text-sm">
                              <div className="grid grid-cols-3 gap-2">
                                <div><span className="font-medium text-muted-foreground">Subtotal</span><p className="mt-0.5">{formatCurrency(Number(budget.subtotal))}</p></div>
                                <div><span className="font-medium text-muted-foreground">Descuento</span><p className="mt-0.5">{formatCurrency(Number(budget.discount))}</p></div>
                                <div><span className="font-medium text-muted-foreground">Total</span><p className="mt-0.5 font-semibold">{formatCurrency(Number(budget.total))}</p></div>
                              </div>
                              {budget.validUntil && <div><span className="font-medium text-muted-foreground">Válido hasta</span><p className="mt-0.5">{formatDate(budget.validUntil)}</p></div>}
                              {budget.dentist && <div><span className="font-medium text-muted-foreground">Creado por</span><p className="mt-0.5">{`Dr(a). ${budget.dentist.firstName} ${budget.dentist.lastName}`}</p></div>}
                              {budget.notes && <div><span className="font-medium text-muted-foreground">Notas</span><p className="mt-0.5 whitespace-pre-wrap">{budget.notes}</p></div>}
                              {budget.items && budget.items.length > 0 && (
                                <div>
                                  <span className="font-medium text-muted-foreground">Ítems</span>
                                  <div className="mt-1 space-y-1">
                                    {budget.items.map((item) => (
                                      <div key={item.id} className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2">
                                        <div className="min-w-0 flex-1">
                                          <p className="text-sm">{item.description}</p>
                                          <p className="text-xs text-muted-foreground">{item.procedure}{item.toothCode ? ` · Diente ${item.toothCode}` : ""} · {item.quantity}x {formatCurrency(Number(item.unitPrice))}</p>
                                        </div>
                                        <span className="text-sm font-medium ml-2">{formatCurrency(Number(item.total))}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Editar registro" : "Nuevo registro clínico"}</DialogTitle></DialogHeader>
          <form onSubmit={saveRecord} className="space-y-4">
            {!editing && (
              <div className="space-y-2">
                <Label>Tipo</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {RECORD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            )}
            {form.type === "EVOLUTION" ? (
              <>
                <div className="space-y-2"><Label>Descripción</Label><Textarea required value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} /></div>
                <div className="space-y-2"><Label>Notas</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              </>
            ) : (
              <>
                <div className="space-y-2"><Label>Diagnóstico</Label><Input value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} /></div>
                <div className="space-y-2"><Label>Tratamiento</Label><Input value={form.treatment} onChange={(e) => setForm({ ...form, treatment: e.target.value })} /></div>
                <div className="space-y-2"><Label>Notas</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              </>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving}>{saving ? <Spinner className="mr-2" /> : null} Guardar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
