"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/shared/status-badge";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { getInitials } from "@/lib/utils";
import { ArrowLeft, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function DentistProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", phone: "", specialty: "", password: "",
  });

  const fetchProfile = async () => {
    try {
      const data = await api.get("/dentists/me");
      setProfile(data);
    } catch (e: any) { toast.error(e.message || "Error al cargar perfil"); } finally { setLoading(false); }
  };

  useEffect(() => { fetchProfile(); }, []);

  const openEdit = () => {
    setForm({
      firstName: profile.user?.firstName || "",
      lastName: profile.user?.lastName || "",
      phone: profile.user?.phone || "",
      specialty: profile.specialty || "",
      password: "",
    });
    setEditOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || undefined,
        specialty: form.specialty || undefined,
      };
      if (form.password) payload.password = form.password;
      await api.put("/dentists/me", payload);
      toast.success("Perfil actualizado");
      setEditOpen(false);
      fetchProfile();
    } catch (e: any) { toast.error(e.message || "Error al actualizar"); } finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner className="h-8 w-8" /></div>;
  if (!profile) return <div className="py-20 text-center text-muted-foreground">Perfil no encontrado</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
          <p className="text-muted-foreground">Gestiona tu información profesional</p>
        </div>
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogTrigger asChild>
            <Button onClick={openEdit} variant="outline"><Pencil className="mr-2 h-4 w-4" /> Editar</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Editar Perfil</DialogTitle></DialogHeader>
            <form onSubmit={handleSave} className="space-y-5 pt-2">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Datos de Cuenta</p>
                <div className="space-y-2">
                  <Label htmlFor="pemail">Email</Label>
                  <Input id="pemail" value={profile.user?.email || ""} disabled className="bg-muted/30 border-dashed text-muted-foreground cursor-not-allowed" />
                  <p className="text-xs text-muted-foreground">Solo lectura</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plic">N° Registro Profesional</Label>
                  <Input id="plic" value={profile.licenseNumber || "-"} disabled className="bg-muted/30 border-dashed text-muted-foreground cursor-not-allowed" />
                  <p className="text-xs text-muted-foreground">Solo lectura</p>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Datos Personales</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="pfn">Nombre *</Label>
                    <Input id="pfn" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pln">Apellido *</Label>
                    <Input id="pln" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="pphone">Teléfono</Label>
                    <Input id="pphone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pspec">Especialidad</Label>
                    <Input id="pspec" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ppass">Nueva Contraseña</Label>
                <Input id="ppass" type="password" placeholder="Dejar en blanco para mantener actual" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
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

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Información Profesional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-center mb-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-medium text-primary">
                {getInitials(profile.user?.firstName || "", profile.user?.lastName || "")}
              </div>
            </div>
            <div>
              <p className="font-medium text-lg text-center">{profile.user?.firstName} {profile.user?.lastName}</p>
              <p className="text-muted-foreground text-center">{profile.user?.email}</p>
            </div>
            <hr />
            <div className="flex justify-between"><span className="text-muted-foreground">Especialidad</span><span>{profile.specialty || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">N° Registro</span><span className="font-mono">{profile.licenseNumber || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Teléfono</span><span>{profile.user?.phone || "-"}</span></div>
            <hr />
            <StatusBadge status={profile.isActive ? "active" : "inactive"} />
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Locales Asignados</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.locales?.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tienes locales asignados</p>
              ) : (
                <div className="space-y-2">
                  {profile.locales?.map((dl: any) => (
                    <div key={dl.locale.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                      <span className="font-medium">{dl.locale.name}</span>
                      <StatusBadge status={dl.locale.isActive ? "active" : "inactive"} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actividad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Último acceso</span>
                <span>{profile.user?.lastLogin ? new Date(profile.user.lastLogin).toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Sin registro"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Miembro desde</span>
                <span>{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric" }) : "-"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
