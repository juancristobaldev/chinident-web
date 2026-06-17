"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Calendar, ClipboardList, FileText, DollarSign, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [history, setHistory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "", lastName: "", phone: "", dob: "", sex: "",
    address: "", bloodType: "", emergencyContact: "", emergencyPhone: "",
    occupation: "", password: "",
  });

  useEffect(() => {
    api.get(`/patients/${id}/history`)
      .then(setHistory)
      .catch(() => { toast.error("Error al cargar datos"); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner className="h-8 w-8" /></div>;
  if (!history || !history.patient) return <div className="py-20 text-center text-muted-foreground">Paciente no encontrado</div>;

  const { patient } = history;

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
      const updated = await api.get(`/patients/${id}/history`);
      setHistory(updated);
    } catch { toast.error("Error al actualizar"); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
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

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Datos del Paciente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-lg">
                {patient.firstName || patient.user?.firstName} {patient.lastName || patient.user?.lastName}
              </p>
              <p className="text-muted-foreground">{patient.rut || "Sin RUT"}</p>
            </div>
            <hr />
            {patient.dob && <div className="flex justify-between"><span className="text-muted-foreground">Fecha Nac.</span><span>{formatDate(patient.dob)}</span></div>}
            {patient.sex && <div className="flex justify-between"><span className="text-muted-foreground">Sexo</span><span>{patient.sex === "M" ? "Masculino" : patient.sex === "F" ? "Femenino" : "Otro"}</span></div>}
            {patient.bloodType && <div className="flex justify-between"><span className="text-muted-foreground">Grupo Sang.</span><span>{patient.bloodType}</span></div>}
            <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{patient.user?.email || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Teléfono</span><span>{patient.user?.phone || patient.phone || "-"}</span></div>
            {patient.address && <div className="flex justify-between"><span className="text-muted-foreground">Dirección</span><span>{patient.address}</span></div>}
            <hr />
            <StatusBadge status={patient.isActive ? "active" : "inactive"} />
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <div className="grid gap-4 sm:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Citas</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold">{patient._count?.appointments ?? 0}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Tratamientos</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold">{patient._count?.treatmentPlans ?? 0}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Presupuestos</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold">{patient._count?.budgets ?? 0}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pagos</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold">{patient._count?.payments ?? 0}</div></CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Últimas Citas</CardTitle>
            </CardHeader>
            <CardContent>
              {history.appointments?.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay citas registradas</p>
              ) : (
                <div className="space-y-3">
                  {history.appointments?.slice(0, 10).map((apt: any) => (
                    <div key={apt.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                      <div>
                        <p className="font-medium">{formatDate(apt.startTime)}</p>
                        <p className="text-xs text-muted-foreground">
                          {apt.locale?.name} — Dr. {apt.dentist?.firstName} {apt.dentist?.lastName}
                        </p>
                      </div>
                      <StatusBadge status={apt.status.toLowerCase()} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Planes de Tratamiento</CardTitle>
            </CardHeader>
            <CardContent>
              {history.treatmentPlans?.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay tratamientos activos</p>
              ) : (
                <div className="space-y-3">
                  {history.treatmentPlans?.map((tp: any) => (
                    <div key={tp.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                      <div>
                        <p className="font-medium">{tp.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {tp.stages?.length || 0} etapas — {tp.status}
                        </p>
                      </div>
                      <StatusBadge status={tp.status.toLowerCase()} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
