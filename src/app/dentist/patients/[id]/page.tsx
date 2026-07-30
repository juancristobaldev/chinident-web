"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { getInitials, formatDate } from "@/lib/utils";
import { ArrowLeft, ClipboardList, Stethoscope, Activity, FileText, Cog, Pencil, X, Plus } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const sections = [
  { href: "clinic-history", label: "Historia Clínica", icon: ClipboardList, color: "text-blue-600" },
  { href: "odontogram", label: "Odontograma", icon: Stethoscope, color: "text-purple-600" },
  { href: "evolutions", label: "Evoluciones", icon: Activity, color: "text-green-600" },
  { href: "treatments", label: "Tratamientos", icon: Cog, color: "text-amber-600" },
  { href: "budgets", label: "Presupuestos", icon: FileText, color: "text-rose-600" },
];

export default function DentistPatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "", lastName: "", phone: "", dob: "", sex: "",
    address: "", bloodType: "", emergencyContact: "", emergencyPhone: "",
    occupation: "", referredBy: "", password: "",
  });
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [actionId, setActionId] = useState<string | null>(null);

  const [anamnesis, setAnamnesis] = useState({
    motivoConsulta: "",
    ultimaVisita: "",
    sangradoEncias: undefined as boolean | undefined,
    dolorDental: undefined as boolean | undefined,
    tratamientosPrevios: [] as string[],
    diseases: [] as string[],
    allergies: [] as string[],
    medications: [] as string[],
    surgeries: [] as string[],
    clinicalRisks: [] as string[],
    familyHistory: [] as string[],
    habits: [] as string[],
  });
  const [savingAnamnesis, setSavingAnamnesis] = useState(false);
  const [newTratamiento, setNewTratamiento] = useState("");
  const [newDisease, setNewDisease] = useState("");
  const [newAllergy, setNewAllergy] = useState("");
  const [newMedication, setNewMedication] = useState("");
  const [newSurgery, setNewSurgery] = useState("");
  const [newRisk, setNewRisk] = useState("");
  const [newHistory, setNewHistory] = useState("");
  const [newHabit, setNewHabit] = useState("");

  useEffect(() => {
    api.get<any>(`/patients/${id}`)
      .then((p) => {
        setPatient(p);
        const mi = p.medicalInfo;
        setAnamnesis({
          motivoConsulta: mi?.motivoConsulta || "",
          ultimaVisita: mi?.ultimaVisita ? mi.ultimaVisita.split("T")[0] : "",
          sangradoEncias: mi?.sangradoEncias,
          dolorDental: mi?.dolorDental,
          tratamientosPrevios: mi?.tratamientosPrevios || [],
          diseases: mi?.diseases || [],
          allergies: mi?.allergies || [],
          medications: mi?.medications || [],
          surgeries: mi?.surgeries || [],
          clinicalRisks: mi?.clinicalRisks || [],
          familyHistory: mi?.familyHistory || [],
          habits: mi?.habits || [],
        });
      })
      .catch(() => { toast.error("Error al cargar datos"); })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!patient) return;
    const today = new Date().toISOString();
    api.get<any[]>(`/appointments?patientId=${id}&date=${today}&view=day`)
      .then(setTodayAppointments)
      .catch(() => {});
  }, [patient, id]);

  const openEdit = () => {
    setEditForm({
      firstName: patient.firstName || patient.user?.firstName || "",
      lastName: patient.lastName || patient.user?.lastName || "",
      phone: patient.user?.phone || "",
      dob: patient.dob ? patient.dob.split("T")[0] : "",
      sex: patient.sex || "",
      address: patient.address || "",
      bloodType: patient.bloodType || "",
      emergencyContact: patient.emergencyContact || "",
      emergencyPhone: patient.emergencyPhone || "",
      occupation: patient.occupation || "",
      referredBy: patient.referredBy || "",
      password: "",
    });
    setEditOpen(true);
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        phone: editForm.phone,
        dob: editForm.dob || undefined,
        sex: editForm.sex || undefined,
        address: editForm.address || undefined,
        bloodType: editForm.bloodType || undefined,
        emergencyContact: editForm.emergencyContact || undefined,
        emergencyPhone: editForm.emergencyPhone || undefined,
        occupation: editForm.occupation || undefined,
        referredBy: editForm.referredBy || undefined,
      };
      if (editForm.password) payload.password = editForm.password;
      await api.put(`/patients/${id}`, payload);
      toast.success("Paciente actualizado");
      setEditOpen(false);
      const updated = await api.get<any>(`/patients/${id}`);
      setPatient(updated);
    } catch { toast.error("Error al actualizar"); } finally { setSaving(false); }
  };

  const handleSaveAnamnesis = async () => {
    setSavingAnamnesis(true);
    try {
      await api.put(`/patients/${id}/medical-info`, anamnesis);
      toast.success("Anamnesis actualizada");
      const updated = await api.get<any>(`/patients/${id}`);
      setPatient(updated);
      const mi = updated.medicalInfo;
      setAnamnesis({
        motivoConsulta: mi?.motivoConsulta || "",
        ultimaVisita: mi?.ultimaVisita ? mi.ultimaVisita.split("T")[0] : "",
        sangradoEncias: mi?.sangradoEncias,
        dolorDental: mi?.dolorDental,
        tratamientosPrevios: mi?.tratamientosPrevios || [],
        diseases: mi?.diseases || [],
        allergies: mi?.allergies || [],
        medications: mi?.medications || [],
        surgeries: mi?.surgeries || [],
        clinicalRisks: mi?.clinicalRisks || [],
        familyHistory: mi?.familyHistory || [],
        habits: mi?.habits || [],
      });
    } catch { toast.error("Error al guardar anamnesis"); } finally { setSavingAnamnesis(false); }
  };

  const addToList = (key: string, value: string, setter: (v: string) => void) => {
    if (!value.trim()) return;
    setAnamnesis((prev) => ({
      ...prev,
      [key]: [...(prev as any)[key], value.trim()],
    }));
    setter("");
  };

  const removeFromList = (key: string, index: number) => {
    setAnamnesis((prev) => ({
      ...prev,
      [key]: (prev as any)[key].filter((_: any, i: number) => i !== index),
    }));
  };

  const handleStatusChange = async (appointmentId: string, action: string) => {
    setActionId(appointmentId);
    try {
      await api.put(`/appointments/${appointmentId}/${action}`);
      toast.success("Estado actualizado");
      const today = new Date().toISOString();
      const apps = await api.get<any[]>(`/appointments?patientId=${id}&date=${today}&view=day`);
      setTodayAppointments(apps);
    } catch { toast.error("Error al actualizar"); } finally { setActionId(null); }
  };

  const STATUS_ACTIONS: Record<string, { label: string; action: string; variant?: string }[]> = {
    RESERVADA: [
      { label: "Confirmar", action: "confirm" },
      { label: "En atención", action: "start" },
      { label: "No asistió", action: "no-show" },
      { label: "Cancelar", action: "cancel", variant: "destructive" },
    ],
    CONFIRMADA: [
      { label: "En atención", action: "start" },
      { label: "No asistió", action: "no-show" },
      { label: "Cancelar", action: "cancel", variant: "destructive" },
    ],
    EN_ATENCION: [
      { label: "Finalizar", action: "attend" },
    ],
  };

  const activeAppointments = todayAppointments.filter(
    (a: any) => a.status !== "FINALIZADA" && a.status !== "CANCELADA" && a.status !== "NO_ASISTIO"
  );

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner className="h-8 w-8" /></div>;
  if (!patient) return <div className="py-20 text-center text-muted-foreground">Paciente no encontrado</div>;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver
      </Button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {patient.firstName || patient.user?.firstName} {patient.lastName || patient.user?.lastName}
          </h1>
          <p className="text-muted-foreground font-mono">{patient.rut || "Sin RUT"}</p>
        </div>
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogTrigger asChild>
            <Button onClick={openEdit} variant="outline"><Pencil className="mr-2 h-4 w-4" /> Editar</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Editar Paciente</DialogTitle></DialogHeader>
            <form onSubmit={handleEditSave} className="space-y-5 pt-2">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Identificación</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="erut">RUT</Label>
                    <Input id="erut" value={patient.rut || "-"} disabled className="bg-muted/30 border-dashed text-muted-foreground cursor-not-allowed" />
                    <p className="text-xs text-muted-foreground">Solo lectura</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eemail">Email</Label>
                    <Input id="eemail" value={patient.user?.email || "-"} disabled className="bg-muted/30 border-dashed text-muted-foreground cursor-not-allowed" />
                    <p className="text-xs text-muted-foreground">Solo lectura</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Datos Personales</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="efn">Nombre *</Label>
                    <Input id="efn" required value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eln">Apellido *</Label>
                    <Input id="eln" required value={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="ephone">Teléfono</Label>
                    <Input id="ephone" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edob">Fecha Nacimiento</Label>
                    <Input id="edob" type="date" value={editForm.dob} onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="esex">Sexo</Label>
                    <select
                      id="esex"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={editForm.sex}
                      onChange={(e) => setEditForm({ ...editForm, sex: e.target.value })}
                    >
                      <option value="">Seleccionar</option>
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                      <option value="O">Otro</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eblood">Grupo Sanguíneo</Label>
                    <Input id="eblood" value={editForm.bloodType} onChange={(e) => setEditForm({ ...editForm, bloodType: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="eaddr">Dirección</Label>
                    <Input id="eaddr" value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eocc">Ocupación</Label>
                    <Input id="eocc" value={editForm.occupation} onChange={(e) => setEditForm({ ...editForm, occupation: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eref">Referido por</Label>
                  <Input id="eref" value={editForm.referredBy} onChange={(e) => setEditForm({ ...editForm, referredBy: e.target.value })} />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Contacto de Emergencia</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="eemercontact">Contacto Emergencia</Label>
                    <Input id="eemercontact" value={editForm.emergencyContact} onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eemerphone">Tel. Emergencia</Label>
                    <Input id="eemerphone" value={editForm.emergencyPhone} onChange={(e) => setEditForm({ ...editForm, emergencyPhone: e.target.value })} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="epass">Nueva Contraseña</Label>
                <Input id="epass" type="password" placeholder="Dejar en blanco para mantener actual" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} />
                <p className="text-xs text-muted-foreground">Mínimo 6 caracteres. Solo si deseas cambiarla.</p>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t">
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={saving}>{saving ? <Spinner className="mr-2" /> : null} Guardar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {sections.map(({ href, label, icon: Icon, color }) => (
          <Link key={href} href={`/dentist/patients/${id}/${href}`}>
            <Card className="hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer h-full">
              <CardContent className="flex flex-col items-center justify-center py-6 gap-3">
                <Icon className={`h-8 w-8 ${color}`} />
                <span className="text-sm font-medium">{label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {activeAppointments.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Citas de hoy</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {activeAppointments.map((apt: any) => {
              const actions = STATUS_ACTIONS[apt.status] || [];
              return (
                <div key={apt.id} className="rounded-md border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <p className="font-medium">
                        {apt.startTime ? new Date(apt.startTime).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }) : ""}
                        {" – "}
                        {apt.endTime ? new Date(apt.endTime).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }) : ""}
                      </p>
                      {apt.locale && <p className="text-muted-foreground text-xs">{apt.locale.name}</p>}
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      apt.status === "EN_ATENCION" ? "bg-amber-100 text-amber-700" :
                      apt.status === "RESERVADA" ? "bg-blue-100 text-blue-700" :
                      "bg-green-100 text-green-700"
                    }`}>
                      {apt.status === "EN_ATENCION" ? "En atención" :
                       apt.status === "RESERVADA" ? "Reservada" :
                       apt.status === "CONFIRMADA" ? "Confirmada" : apt.status}
                    </span>
                  </div>
                  {actions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {actions.map((ac) => (
                        <Button
                          key={ac.action}
                          size="sm"
                          variant={ac.variant === "destructive" ? "destructive" : "outline"}
                          disabled={actionId === apt.id}
                          onClick={() => handleStatusChange(apt.id, ac.action)}
                        >
                          {actionId === apt.id ? <Spinner className="mr-1 h-3 w-3" /> : null}
                          {ac.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Datos Personales</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Nombre</span><span>{patient.firstName || patient.user?.firstName} {patient.lastName || patient.user?.lastName}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">RUT</span><span className="font-mono">{patient.rut || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{patient.user?.email || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Teléfono</span><span>{patient.user?.phone || "-"}</span></div>
            {patient.dob && <div className="flex justify-between"><span className="text-muted-foreground">Fecha Nac.</span><span>{formatDate(patient.dob)}</span></div>}
            {patient.sex && <div className="flex justify-between"><span className="text-muted-foreground">Sexo</span><span>{patient.sex === "M" ? "Masculino" : patient.sex === "F" ? "Femenino" : patient.sex}</span></div>}
            {patient.bloodType && <div className="flex justify-between"><span className="text-muted-foreground">Grupo Sang.</span><span>{patient.bloodType}</span></div>}
            <StatusBadge status={patient.isActive ? "active" : "inactive"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Resumen</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Citas totales</span><span className="font-medium">{patient._count?.appointments ?? 0}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tratamientos</span><span className="font-medium">{patient._count?.treatmentPlans ?? 0}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Presupuestos</span><span className="font-medium">{patient._count?.budgets ?? 0}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Pagos</span><span className="font-medium">{patient._count?.payments ?? 0}</span></div>
            {patient.dentist && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dentista asignado</span>
                <span>{patient.dentist.user?.firstName} {patient.dentist.user?.lastName}</span>
              </div>
            )}
            {patient.locales?.length > 0 && (
              <div className="flex justify-between"><span className="text-muted-foreground">Locales</span><span>{patient.locales.map((pl: any) => pl.locale.name).join(", ")}</span></div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Anamnesis</CardTitle>
          <Button onClick={handleSaveAnamnesis} disabled={savingAnamnesis} size="sm">
            {savingAnamnesis ? <Spinner className="mr-2 h-3 w-3" /> : null}
            Guardar
          </Button>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="dmotivoConsulta">Motivo de Consulta</Label>
            <textarea
              id="dmotivoConsulta"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
              value={anamnesis.motivoConsulta}
              onChange={(e) => setAnamnesis({ ...anamnesis, motivoConsulta: e.target.value })}
              placeholder="Describa el motivo de consulta del paciente..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dultimaVisita">Última Visita Odontológica</Label>
              <Input id="dultimaVisita" type="date" value={anamnesis.ultimaVisita} onChange={(e) => setAnamnesis({ ...anamnesis, ultimaVisita: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Sangrado de Encías</Label>
              <div className="flex gap-3 pt-1">
                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input type="radio" name="dsangrado" checked={anamnesis.sangradoEncias === true} onChange={() => setAnamnesis({ ...anamnesis, sangradoEncias: true })} className="h-4 w-4 text-primary" />
                  Sí
                </label>
                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input type="radio" name="dsangrado" checked={anamnesis.sangradoEncias === false} onChange={() => setAnamnesis({ ...anamnesis, sangradoEncias: false })} className="h-4 w-4 text-primary" />
                  No
                </label>
                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input type="radio" name="dsangrado" checked={anamnesis.sangradoEncias === undefined} onChange={() => setAnamnesis({ ...anamnesis, sangradoEncias: undefined })} className="h-4 w-4 text-primary" />
                  No sabe
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Dolor Dental Actual</Label>
              <div className="flex gap-3 pt-1">
                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input type="radio" name="ddolor" checked={anamnesis.dolorDental === true} onChange={() => setAnamnesis({ ...anamnesis, dolorDental: true })} className="h-4 w-4 text-primary" />
                  Sí
                </label>
                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input type="radio" name="ddolor" checked={anamnesis.dolorDental === false} onChange={() => setAnamnesis({ ...anamnesis, dolorDental: false })} className="h-4 w-4 text-primary" />
                  No
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tratamientos Dentales Previos</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Agregar tratamiento..."
                value={newTratamiento}
                onChange={(e) => setNewTratamiento(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addToList("tratamientosPrevios", newTratamiento, setNewTratamiento); } }}
              />
              <Button type="button" size="sm" variant="outline" onClick={() => addToList("tratamientosPrevios", newTratamiento, setNewTratamiento)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {anamnesis.tratamientosPrevios.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {anamnesis.tratamientosPrevios.map((t, i) => (
                  <span key={i} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                    {t}
                    <button type="button" onClick={() => removeFromList("tratamientosPrevios", i)} className="ml-0.5 rounded-full hover:bg-primary/20"><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <hr />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Enfermedades</Label>
              <div className="flex gap-2">
                <Input placeholder="Agregar enfermedad..." value={newDisease} onChange={(e) => setNewDisease(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addToList("diseases", newDisease, setNewDisease); } }} />
                <Button type="button" size="sm" variant="outline" onClick={() => addToList("diseases", newDisease, setNewDisease)}><Plus className="h-4 w-4" /></Button>
              </div>
              {anamnesis.diseases.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {anamnesis.diseases.map((t, i) => (
                    <span key={i} className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-900/20 px-2.5 py-1 text-xs font-medium text-red-700 dark:text-red-300">
                      {t}
                      <button type="button" onClick={() => removeFromList("diseases", i)} className="ml-0.5 rounded-full hover:bg-red-200 dark:hover:bg-red-800/20"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Alergias</Label>
              <div className="flex gap-2">
                <Input placeholder="Agregar alergia..." value={newAllergy} onChange={(e) => setNewAllergy(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addToList("allergies", newAllergy, setNewAllergy); } }} />
                <Button type="button" size="sm" variant="outline" onClick={() => addToList("allergies", newAllergy, setNewAllergy)}><Plus className="h-4 w-4" /></Button>
              </div>
              {anamnesis.allergies.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {anamnesis.allergies.map((t, i) => (
                    <span key={i} className="inline-flex items-center gap-1 rounded-full bg-orange-100 dark:bg-orange-900/20 px-2.5 py-1 text-xs font-medium text-orange-700 dark:text-orange-300">
                      {t}
                      <button type="button" onClick={() => removeFromList("allergies", i)} className="ml-0.5 rounded-full hover:bg-orange-200 dark:hover:bg-orange-800/20"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Medicamentos</Label>
              <div className="flex gap-2">
                <Input placeholder="Agregar medicamento..." value={newMedication} onChange={(e) => setNewMedication(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addToList("medications", newMedication, setNewMedication); } }} />
                <Button type="button" size="sm" variant="outline" onClick={() => addToList("medications", newMedication, setNewMedication)}><Plus className="h-4 w-4" /></Button>
              </div>
              {anamnesis.medications.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {anamnesis.medications.map((t, i) => (
                    <span key={i} className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/20 px-2.5 py-1 text-xs font-medium text-blue-700 dark:text-blue-300">
                      {t}
                      <button type="button" onClick={() => removeFromList("medications", i)} className="ml-0.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/20"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Cirugías</Label>
              <div className="flex gap-2">
                <Input placeholder="Agregar cirugía..." value={newSurgery} onChange={(e) => setNewSurgery(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addToList("surgeries", newSurgery, setNewSurgery); } }} />
                <Button type="button" size="sm" variant="outline" onClick={() => addToList("surgeries", newSurgery, setNewSurgery)}><Plus className="h-4 w-4" /></Button>
              </div>
              {anamnesis.surgeries.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {anamnesis.surgeries.map((t, i) => (
                    <span key={i} className="inline-flex items-center gap-1 rounded-full bg-purple-100 dark:bg-purple-900/20 px-2.5 py-1 text-xs font-medium text-purple-700 dark:text-purple-300">
                      {t}
                      <button type="button" onClick={() => removeFromList("surgeries", i)} className="ml-0.5 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800/20"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Riesgos Clínicos</Label>
              <div className="flex gap-2">
                <Input placeholder="Agregar riesgo..." value={newRisk} onChange={(e) => setNewRisk(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addToList("clinicalRisks", newRisk, setNewRisk); } }} />
                <Button type="button" size="sm" variant="outline" onClick={() => addToList("clinicalRisks", newRisk, setNewRisk)}><Plus className="h-4 w-4" /></Button>
              </div>
              {anamnesis.clinicalRisks.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {anamnesis.clinicalRisks.map((t, i) => (
                    <span key={i} className="inline-flex items-center gap-1 rounded-full bg-yellow-100 dark:bg-yellow-900/20 px-2.5 py-1 text-xs font-medium text-yellow-700 dark:text-yellow-300">
                      {t}
                      <button type="button" onClick={() => removeFromList("clinicalRisks", i)} className="ml-0.5 rounded-full hover:bg-yellow-200 dark:hover:bg-yellow-800/20"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Antecedentes Familiares</Label>
              <div className="flex gap-2">
                <Input placeholder="Agregar antecedente..." value={newHistory} onChange={(e) => setNewHistory(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addToList("familyHistory", newHistory, setNewHistory); } }} />
                <Button type="button" size="sm" variant="outline" onClick={() => addToList("familyHistory", newHistory, setNewHistory)}><Plus className="h-4 w-4" /></Button>
              </div>
              {anamnesis.familyHistory.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {anamnesis.familyHistory.map((t, i) => (
                    <span key={i} className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/20 px-2.5 py-1 text-xs font-medium text-green-700 dark:text-green-300">
                      {t}
                      <button type="button" onClick={() => removeFromList("familyHistory", i)} className="ml-0.5 rounded-full hover:bg-green-200 dark:hover:bg-green-800/20"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Hábitos</Label>
              <div className="flex gap-2">
                <Input placeholder="Agregar hábito..." value={newHabit} onChange={(e) => setNewHabit(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addToList("habits", newHabit, setNewHabit); } }} />
                <Button type="button" size="sm" variant="outline" onClick={() => addToList("habits", newHabit, setNewHabit)}><Plus className="h-4 w-4" /></Button>
              </div>
              {anamnesis.habits.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {anamnesis.habits.map((t, i) => (
                    <span key={i} className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                      {t}
                      <button type="button" onClick={() => removeFromList("habits", i)} className="ml-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
