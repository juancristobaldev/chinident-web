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
import { ArrowLeft, Pencil, Link, Unlink, Search, X, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LocaleOption = { id: string; name: string; isActive: boolean };

export default function DentistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [dentist, setDentist] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [allLocales, setAllLocales] = useState<LocaleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [localeSearch, setLocaleSearch] = useState("");
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignSaving, setAssignSaving] = useState(false);
  const [unlinkConfirm, setUnlinkConfirm] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    firstName: "", lastName: "", phone: "", specialty: "", licenseNumber: "", rut: "", password: "",
    localeIds: [] as string[],
  });

  const fetchAll = async () => {
    try {
      const [d, s, l] = await Promise.all([
        api.get(`/dentists/${id}`),
        api.get(`/dentists/${id}/stats`),
        api.get<LocaleOption[]>("/locales"),
      ]);
      setDentist(d);
      setStats(s);
      setAllLocales(l);
    } catch (e: any) {
      toast.error(e.message || "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [id]);

  const openEdit = () => {
    const currentLocaleIds = dentist.locales?.map((dl: any) => dl.locale.id) || [];
    setEditForm({
      firstName: dentist.user?.firstName || "",
      lastName: dentist.user?.lastName || "",
      phone: dentist.user?.phone || "",
      specialty: dentist.specialty || "",
      licenseNumber: dentist.licenseNumber || "",
      rut: dentist.rut || "",
      password: "",
      localeIds: currentLocaleIds,
    });
    setLocaleSearch("");
    setEditOpen(true);
  };

  const toggleEditLocale = (id: string) => {
    setEditForm((f) => ({
      ...f,
      localeIds: f.localeIds.includes(id)
        ? f.localeIds.filter((lid) => lid !== id)
        : [...f.localeIds, id],
    }));
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
        licenseNumber: editForm.licenseNumber || undefined,
        rut: editForm.rut || undefined,
        localeIds: editForm.localeIds,
      };
      if (editForm.password) payload.password = editForm.password;

      await api.put(`/dentists/${id}`, payload);

      toast.success("Dentista actualizado");
      setEditOpen(false);
      fetchAll();
    } catch (e: any) { toast.error(e.message || "Error al actualizar"); } finally { setSaving(false); }
  };

  const handleUnlinkLocale = async (localeId: string) => {
    try {
      const fresh = await api.get<any>(`/dentists/${id}`);
      const currentLocaleIds = fresh.locales
        ?.map((dl: any) => dl.locale.id)
        .filter((lid: string) => lid !== localeId) || [];
      await api.post(`/dentists/${id}/locales`, { localeIds: currentLocaleIds });
      toast.success("Local desvinculado");
      setUnlinkConfirm(null);
      fetchAll();
    } catch (e: any) { toast.error(e.message || "Error al desvincular"); }
  };

  const availableLocales = allLocales.filter(
    (l) => !dentist.locales?.some((dl: any) => dl.locale.id === l.id)
  );

  const filteredAvailable = availableLocales.filter((l) =>
    l.name.toLowerCase().includes(localeSearch.toLowerCase())
  );

  const handleAssignLocale = async (localeId: string) => {
    setAssignSaving(true);
    try {
      const fresh = await api.get<any>(`/dentists/${id}`);
      const currentIds = fresh.locales?.map((dl: any) => dl.locale.id) || [];
      await api.post(`/dentists/${id}/locales`, { localeIds: [...currentIds, localeId] });
      toast.success("Local asignado");
      setAssignOpen(false);
      fetchAll();
    } catch (e: any) { toast.error(e.message || "Error al asignar"); } finally { setAssignSaving(false); }
  };

  const filteredEditLocales = allLocales.filter((l) =>
    l.name.toLowerCase().includes(localeSearch.toLowerCase())
  );
  const selectedEditLocales = allLocales.filter((l) => editForm.localeIds.includes(l.id));

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
          <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Editar Dentista</DialogTitle></DialogHeader>
            <form onSubmit={handleEditSave} className="space-y-5 pt-2">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Datos de Cuenta</p>
                <div className="space-y-2">
                  <Label htmlFor="eemail">Email</Label>
                  <Input id="eemail" value={dentist.user?.email || ""} disabled className="bg-muted/30 border-dashed text-muted-foreground cursor-not-allowed" />
                  <p className="text-xs text-muted-foreground">Solo lectura</p>
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
                    <Label htmlFor="espec">Especialidad</Label>
                    <Input id="espec" value={editForm.specialty} onChange={(e) => setEditForm({ ...editForm, specialty: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="elic">N° Registro Profesional</Label>
                  <Input id="elic" value={editForm.licenseNumber} onChange={(e) => setEditForm({ ...editForm, licenseNumber: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="erut">RUT</Label>
                  <Input id="erut" placeholder="12.345.678-9" value={editForm.rut} onChange={(e) => setEditForm({ ...editForm, rut: e.target.value })} />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Asignación a Locales</p>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar local..." className="pl-9" value={localeSearch} onChange={(e) => setLocaleSearch(e.target.value)} />
                </div>
                {selectedEditLocales.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedEditLocales.map((l) => (
                      <span key={l.id} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                        {l.name}
                        <button type="button" onClick={() => toggleEditLocale(l.id)} className="ml-0.5 rounded-full hover:bg-primary/20">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto rounded-md border p-2">
                  {filteredEditLocales.map((l) => (
                    <label key={l.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded px-2 py-1.5 transition-colors">
                      <input type="checkbox" checked={editForm.localeIds.includes(l.id)} onChange={() => toggleEditLocale(l.id)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                      {l.name}
                    </label>
                  ))}
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
            <div className="flex justify-between"><span className="text-muted-foreground">RUT</span><span>{dentist.rut || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">N° Registro</span><span>{dentist.licenseNumber || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Teléfono</span><span>{dentist.user?.phone || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Registrado</span><span>{dentist.createdAt ? formatDate(dentist.createdAt) : "-"}</span></div>
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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Locales Asignados</CardTitle>
              <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => setLocaleSearch("")}>
                    <Link className="mr-2 h-3 w-3" /> Asignar Local
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Asignar Local</DialogTitle></DialogHeader>
                  <div className="space-y-3 pt-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Buscar local..." className="pl-9" value={localeSearch} onChange={(e) => setLocaleSearch(e.target.value)} />
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-1">
                      {filteredAvailable.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No hay locales disponibles</p>
                      ) : (
                        filteredAvailable.map((l) => (
                          <div key={l.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                            <div>
                              <p className="text-sm font-medium">{l.name}</p>
                              <StatusBadge status={l.isActive ? "active" : "inactive"} />
                            </div>
                            <Button size="sm" disabled={assignSaving} onClick={() => handleAssignLocale(l.id)}>
                              <Plus className="mr-1 h-3 w-3" /> Asignar
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {dentist.locales?.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">No tiene locales asignados</p>
                  <Button variant="link" size="sm" onClick={() => setAssignOpen(true)} className="mt-1">Asignar un local ahora</Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {dentist.locales?.map((dl: any) => (
                    <div key={dl.locale.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{dl.locale.name}</span>
                        <StatusBadge status={dl.locale.isActive ? "active" : "inactive"} />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setUnlinkConfirm(dl.locale.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Unlink className="mr-1 h-3 w-3" /> Desvincular
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!unlinkConfirm} onOpenChange={(open) => { if (!open) setUnlinkConfirm(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirmar Desvinculación</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            ¿Estás seguro de desvincular este local del dentista? El dentista no podrá atender en este local hasta que se le vuelva a asignar.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setUnlinkConfirm(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => unlinkConfirm && handleUnlinkLocale(unlinkConfirm)}>Desvincular</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
