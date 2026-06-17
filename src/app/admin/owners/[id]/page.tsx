"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Building2, Users, Stethoscope, Calendar, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function OwnerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "", lastName: "", phone: "", password: "",
  });

  useEffect(() => {
    api.get(`/admin/tenants/${id}`)
      .then(setTenant)
      .catch(() => { toast.error("Error al cargar datos"); })
      .finally(() => setLoading(false));
  }, [id]);

  const openEdit = () => {
    setEditForm({
      firstName: tenant.owner?.firstName || "",
      lastName: tenant.owner?.lastName || "",
      phone: tenant.owner?.phone || "",
      password: "",
    });
    setEditOpen(true);
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant.owner?.id) { toast.error("Este tenant no tiene owner"); return; }
    setSaving(true);
    try {
      const payload: any = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        phone: editForm.phone || undefined,
      };
      if (editForm.password) payload.password = editForm.password;
      await api.put(`/users/${tenant.owner.id}`, payload);
      toast.success("Owner actualizado");
      setEditOpen(false);
      const updated = await api.get(`/admin/tenants/${id}`);
      setTenant(updated);
    } catch { toast.error("Error al actualizar"); } finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner className="h-8 w-8" /></div>;
  if (!tenant) return <div className="py-20 text-center text-muted-foreground">No encontrado</div>;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{tenant.name}</h1>
          <p className="text-muted-foreground">RUT: {tenant.rut}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={tenant.isActive ? "active" : "inactive"} />
          {tenant.owner && (
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger asChild>
                <Button onClick={openEdit} variant="outline" size="sm"><Pencil className="mr-2 h-4 w-4" /> Editar Owner</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Editar Owner</DialogTitle></DialogHeader>
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
                  <div className="space-y-2">
                    <Label htmlFor="ephone">Teléfono</Label>
                    <Input id="ephone" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
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
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Locales</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{tenant._count?.locales ?? 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Dentistas</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{tenant._count?.dentists ?? 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pacientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{tenant._count?.patients ?? 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Citas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{tenant._count?.appointments ?? 0}</div></CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Owner</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {tenant.owner ? (
              <>
                <div className="flex justify-between"><span className="text-muted-foreground">Nombre</span><span>{tenant.owner.firstName} {tenant.owner.lastName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{tenant.owner.email}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Teléfono</span><span>{tenant.owner.phone || "-"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Último acceso</span><span>{tenant.owner.lastLogin ? formatDate(tenant.owner.lastLogin) : "-"}</span></div>
                <StatusBadge status={tenant.owner.isActive ? "active" : "inactive"} />
              </>
            ) : (
              <p className="text-muted-foreground">Sin owner asignado</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Suscripción</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Plan</span><span>{tenant.planType}</span></div>
            {tenant.subscriptions?.[0] && (
              <>
                <div className="flex justify-between"><span className="text-muted-foreground">Vence</span><span>{formatDate(tenant.subscriptions[0].expiresAt)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Máx Locales</span><span>{tenant.subscriptions[0].maxLocales}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Máx Dentistas</span><span>{tenant.subscriptions[0].maxDentists}</span></div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Locales</CardTitle></CardHeader>
        <CardContent>
          {tenant.locales?.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tiene locales registrados</p>
          ) : (
            <div className="space-y-2">
              {tenant.locales?.map((l: any) => (
                <div key={l.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                  <span>{l.name}</span>
                  <span className="text-muted-foreground">{l.address || "Sin dirección"}</span>
                  <StatusBadge status={l.isActive ? "active" : "inactive"} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
