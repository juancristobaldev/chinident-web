"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { getInitials, formatDate } from "@/lib/utils";
import { ArrowLeft, ClipboardList, Stethoscope, Activity, FileText, Cog, Pencil } from "lucide-react";
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
    occupation: "", password: "",
  });
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    api.get<any>(`/patients/${id}`)
      .then(setPatient)
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
      };
      if (editForm.password) payload.password = editForm.password;
      await api.put(`/patients/${id}`, payload);
      toast.success("Paciente actualizado");
      setEditOpen(false);
      const updated = await api.get<any>(`/patients/${id}`);
      setPatient(updated);
    } catch { toast.error("Error al actualizar"); } finally { setSaving(false); }
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
          <p className="text-muted-foreground">{patient.rut || "Sin RUT"}</p>
        </div>
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogTrigger asChild>
            <Button onClick={openEdit} variant="outline"><Pencil className="mr-2 h-4 w-4" /> Editar</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Editar Paciente</DialogTitle></DialogHeader>
            <form onSubmit={handleEditSave} className="space-y-4 pt-2">
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
              <div className="space-y-2">
                <Label htmlFor="eaddr">Dirección</Label>
                <Input id="eaddr" value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="eocc">Ocupación</Label>
                  <Input id="eocc" value={editForm.occupation} onChange={(e) => setEditForm({ ...editForm, occupation: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eemercontact">Contacto Emergencia</Label>
                  <Input id="eemercontact" value={editForm.emergencyContact} onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="eemerphone">Tel. Emergencia</Label>
                <Input id="eemerphone" value={editForm.emergencyPhone} onChange={(e) => setEditForm({ ...editForm, emergencyPhone: e.target.value })} />
              </div>
              <hr />
              <div className="space-y-2">
                <Label htmlFor="epass">Nueva Contraseña</Label>
                <Input id="epass" type="password" placeholder="Dejar en blanco para mantener actual" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} />
                <p className="text-xs text-muted-foreground">Mínimo 6 caracteres. Solo si deseas cambiarla.</p>
              </div>
              <div className="flex justify-end gap-3">
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
            <div className="flex justify-between"><span className="text-muted-foreground">RUT</span><span>{patient.rut || "-"}</span></div>
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
    </div>
  );
}
