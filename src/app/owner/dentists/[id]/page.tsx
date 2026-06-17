"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DentistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [dentist, setDentist] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "", lastName: "", phone: "", specialty: "", password: "",
  });

  useEffect(() => {
    Promise.all([
      api.get(`/dentists/${id}`),
      api.get(`/dentists/${id}/stats`),
    ])
      .then(([d, s]) => { setDentist(d); setStats(s); })
      .catch(() => { toast.error("Error al cargar datos"); })
      .finally(() => setLoading(false));
  }, [id]);

  const openEdit = () => {
    setEditForm({
      firstName: dentist.user?.firstName || "",
      lastName: dentist.user?.lastName || "",
      phone: dentist.user?.phone || "",
      specialty: dentist.specialty || "",
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
        phone: editForm.phone || undefined,
        specialty: editForm.specialty || undefined,
      };
      if (editForm.password) payload.password = editForm.password;
      await api.put(`/dentists/${id}`, payload);
      toast.success("Dentista actualizado");
      setEditOpen(false);
      const [d, s] = await Promise.all([
        api.get(`/dentists/${id}`),
        api.get(`/dentists/${id}/stats`),
      ]);
      setDentist(d);
      setStats(s);
    } catch { toast.error("Error al actualizar"); } finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner className="h-8 w-8" /></div>;
  if (!dentist) return <div className="py-20 text-center text-muted-foreground">Dentista no encontrado</div>;

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
          <DialogContent>
            <DialogHeader><DialogTitle>Editar Dentista</DialogTitle></DialogHeader>
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
                  <Label htmlFor="espec">Especialidad</Label>
                  <Input id="espec" value={editForm.specialty} onChange={(e) => setEditForm({ ...editForm, specialty: e.target.value })} />
                </div>
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
            <CardTitle className="text-lg">Datos del Dentista</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-lg">{dentist.user?.firstName} {dentist.user?.lastName}</p>
              <p className="text-muted-foreground">{dentist.user?.email}</p>
            </div>
            <hr />
            <div className="flex justify-between"><span className="text-muted-foreground">Especialidad</span><span>{dentist.specialty || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">N° Registro</span><span>{dentist.licenseNumber || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Teléfono</span><span>{dentist.user?.phone || "-"}</span></div>
            <hr />
            <StatusBadge status={dentist.isActive ? "active" : "inactive"} />
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Citas</CardTitle>
              </CardHeader>
              <CardContent><div className="text-2xl font-bold">{stats?.totalAppointments ?? 0}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pacientes</CardTitle>
              </CardHeader>
              <CardContent><div className="text-2xl font-bold">{stats?.uniquePatients ?? 0}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Tratamientos</CardTitle>
              </CardHeader>
              <CardContent><div className="text-2xl font-bold">{stats?.treatmentPlans ?? 0}</div></CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Locales Asignados</CardTitle>
            </CardHeader>
            <CardContent>
              {dentist.locales?.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tiene locales asignados</p>
              ) : (
                <div className="space-y-2">
                  {dentist.locales?.map((dl: any) => (
                    <div key={dl.locale.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                      <span>{dl.locale.name}</span>
                      <StatusBadge status={dl.locale.isActive ? "active" : "inactive"} />
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
