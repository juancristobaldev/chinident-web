"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { getInitials } from "@/lib/utils";
import { ArrowLeft, Plus, Trash2, Link, Unlink, Search, X, UserPlus, Stethoscope } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function LocaleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [locale, setLocale] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newBox, setNewBox] = useState("");
  const [newSpecialty, setNewSpecialty] = useState("");

  const [localeDentists, setLocaleDentists] = useState<any[]>([]);
  const [localePatients, setLocalePatients] = useState<any[]>([]);
  const [allDentists, setAllDentists] = useState<any[]>([]);
  const [allPatients, setAllPatients] = useState<any[]>([]);
  const [allLocales, setAllLocales] = useState<any[]>([]);

  const [loadingDentists, setLoadingDentists] = useState(true);
  const [loadingPatients, setLoadingPatients] = useState(true);

  const [assignDentistOpen, setAssignDentistOpen] = useState(false);
  const [assignPatientOpen, setAssignPatientOpen] = useState(false);
  const [createDentistOpen, setCreateDentistOpen] = useState(false);
  const [createPatientOpen, setCreatePatientOpen] = useState(false);
  const [dentistSearch, setDentistSearch] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [unlinkDentistId, setUnlinkDentistId] = useState<string | null>(null);
  const [unlinkPatientId, setUnlinkPatientId] = useState<string | null>(null);

  const [dentistForm, setDentistForm] = useState({
    firstName: "", lastName: "", email: "", password: "",
    phone: "", specialty: "", licenseNumber: "", rut: "",
  });

  const [patientForm, setPatientForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    rut: "", dob: "", sex: "", address: "",
    emergencyContact: "", emergencyPhone: "", bloodType: "",
    occupation: "", referredBy: "",
    localeIds: [] as string[],
  });

  const [savingDentist, setSavingDentist] = useState(false);
  const [savingPatient, setSavingPatient] = useState(false);
  const [assignSaving, setAssignSaving] = useState(false);

  const fetchLocale = async () => {
    try {
      const data = await api.get<any>(`/locales/${id}`);
      setLocale(data);
    } catch (e: any) { toast.error(e.message || "Error al cargar datos"); } finally { setLoading(false); }
  };

  const fetchLocaleRelations = async () => {
    try {
      const [d, p] = await Promise.all([
        api.get<any[]>(`/locales/${id}/dentists`),
        api.get<any[]>(`/locales/${id}/patients`),
      ]);
      setLocaleDentists(d);
      setLocalePatients(p);
    } catch (e: any) { toast.error(e.message || "Error al cargar datos"); } finally {
      setLoadingDentists(false);
      setLoadingPatients(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const [d, p, l] = await Promise.all([
        api.get<any[]>("/dentists"),
        api.get<any[]>("/patients"),
        api.get<any[]>("/locales"),
      ]);
      setAllDentists(d);
      setAllPatients(p);
      setAllLocales(l);
    } catch {}
  };

  useEffect(() => { fetchLocale(); }, [id]);
  useEffect(() => { if (!loading) { fetchLocaleRelations(); fetchOptions(); } }, [loading]);

  const addBox = async () => {
    if (!newBox.trim()) return;
    try {
      await api.post(`/locales/${id}/boxes`, { name: newBox });
      toast.success("Box agregado");
      setNewBox("");
      fetchLocale();
    } catch (e: any) { toast.error(e.message || "Error al agregar box"); }
  };

  const removeBox = async (boxId: string) => {
    try {
      await api.delete(`/locales/${id}/boxes/${boxId}`);
      toast.success("Box eliminado");
      fetchLocale();
    } catch (e: any) { toast.error(e.message || "Error al eliminar box"); }
  };

  const addSpecialty = async () => {
    if (!newSpecialty.trim()) return;
    try {
      await api.post(`/locales/${id}/specialties`, { name: newSpecialty });
      toast.success("Especialidad agregada");
      setNewSpecialty("");
      fetchLocale();
    } catch (e: any) { toast.error(e.message || "Error al agregar especialidad"); }
  };

  const removeSpecialty = async (specialtyId: string) => {
    try {
      await api.delete(`/locales/${id}/specialties/${specialtyId}`);
      toast.success("Especialidad eliminada");
      fetchLocale();
    } catch (e: any) { toast.error(e.message || "Error al eliminar especialidad"); }
  };

  const assignedDentistIds = localeDentists.map((dl: any) => dl.dentist.id);
  const availableDentists = allDentists.filter((d) => !assignedDentistIds.includes(d.id));
  const filteredAvailableDentists = availableDentists.filter((d) => {
    const name = `${d.user?.firstName} ${d.user?.lastName}`.toLowerCase();
    return name.includes(dentistSearch.toLowerCase()) || (d.specialty || "").toLowerCase().includes(dentistSearch.toLowerCase());
  });

  const assignedPatientIds = localePatients.map((pl: any) => pl.patient.id);
  const availablePatients = allPatients.filter((p) => !assignedPatientIds.includes(p.id));
  const filteredAvailablePatients = availablePatients.filter((p) => {
    const name = (p.displayName || `${p.firstName} ${p.lastName}`).toLowerCase();
    return name.includes(patientSearch.toLowerCase()) || (p.rut || "").toLowerCase().includes(patientSearch.toLowerCase());
  });

  const handleAssignDentist = async (dentistId: string) => {
    setAssignSaving(true);
    try {
      const d = await api.get<any>(`/dentists/${dentistId}`);
      const existingLocales = d?.locales?.map((l: any) => l.locale.id) || [];
      await api.post(`/dentists/${dentistId}/locales`, { localeIds: [...existingLocales, id] });
      toast.success("Dentista asignado al local");
      setAssignDentistOpen(false);
      fetchLocaleRelations();
      fetchOptions();
    } catch (e: any) { toast.error(e.message || "Error al asignar"); } finally { setAssignSaving(false); }
  };

  const handleUnlinkDentist = async () => {
    if (!unlinkDentistId) return;
    try {
      const d = await api.get<any>(`/dentists/${unlinkDentistId}`);
      const updatedLocales = d?.locales?.filter((l: any) => l.locale.id !== id).map((l: any) => l.locale.id) || [];
      await api.post(`/dentists/${unlinkDentistId}/locales`, { localeIds: updatedLocales });
      toast.success("Dentista desvinculado del local");
      setUnlinkDentistId(null);
      fetchLocaleRelations();
      fetchOptions();
    } catch (e: any) { toast.error(e.message || "Error al desvincular"); }
  };

  const handleAssignPatient = async (patientId: string) => {
    setAssignSaving(true);
    try {
      const p = await api.get<any>(`/patients/${patientId}`);
      const existingLocales = p?.locales?.map((l: any) => l.locale.id) || [];
      await api.put(`/patients/${patientId}`, { localeIds: [...existingLocales, id] });
      toast.success("Paciente asignado al local");
      setAssignPatientOpen(false);
      fetchLocaleRelations();
      fetchOptions();
    } catch (e: any) { toast.error(e.message || "Error al asignar"); } finally { setAssignSaving(false); }
  };

  const handleUnlinkPatient = async () => {
    if (!unlinkPatientId) return;
    try {
      const p = await api.get<any>(`/patients/${unlinkPatientId}`);
      const updatedLocales = p?.locales?.filter((l: any) => l.locale.id !== id).map((l: any) => l.locale.id) || [];
      await api.put(`/patients/${unlinkPatientId}`, { localeIds: updatedLocales });
      toast.success("Paciente desvinculado del local");
      setUnlinkPatientId(null);
      fetchLocaleRelations();
      fetchOptions();
    } catch (e: any) { toast.error(e.message || "Error al desvincular"); }
  };

  const handleCreateDentist = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDentist(true);
    try {
      const payload: any = { ...dentistForm, localeIds: [id] };
      if (!dentistForm.licenseNumber) delete payload.licenseNumber;
      await api.post("/dentists", payload);
      toast.success("Dentista creado y asignado al local");
      setCreateDentistOpen(false);
      setDentistForm({ firstName: "", lastName: "", email: "", password: "", phone: "", specialty: "", licenseNumber: "", rut: "" });
      fetchLocaleRelations();
      fetchOptions();
    } catch (e: any) { toast.error(e.message || "Error al crear dentista"); } finally { setSavingDentist(false); }
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPatient(true);
    try {
      const payload: any = {
        ...patientForm,
        localeIds: [id],
        dob: patientForm.dob || undefined,
      };
      await api.post("/patients", payload);
      toast.success("Paciente creado y asignado al local");
      setCreatePatientOpen(false);
      setPatientForm({ firstName: "", lastName: "", email: "", phone: "", rut: "", dob: "", sex: "", address: "", emergencyContact: "", emergencyPhone: "", bloodType: "", occupation: "", referredBy: "", localeIds: [] });
      fetchLocaleRelations();
      fetchOptions();
    } catch (e: any) { toast.error(e.message || "Error al crear paciente"); } finally { setSavingPatient(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner className="h-8 w-8" /></div>;
  if (!locale) return <div className="py-20 text-center text-muted-foreground">Local no encontrado</div>;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{locale.name}</h1>
          <p className="text-muted-foreground">{locale.address || "Sin dirección"}</p>
        </div>
        <StatusBadge status={locale.isActive ? "active" : "inactive"} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Boxes de Atención</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input placeholder="Nombre del box" value={newBox} onChange={(e) => setNewBox(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addBox(); } }} />
              <Button onClick={addBox}><Plus className="h-4 w-4" /></Button>
            </div>
            {locale.boxes?.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay boxes configurados</p>
            ) : (
              <ul className="space-y-2">
                {locale.boxes?.map((box: any) => (
                  <li key={box.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                    <span className="text-sm">{box.name}</span>
                    <Button variant="ghost" size="sm" onClick={() => removeBox(box.id)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Especialidades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input placeholder="Nueva especialidad" value={newSpecialty} onChange={(e) => setNewSpecialty(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSpecialty(); } }} />
              <Button onClick={addSpecialty}><Plus className="h-4 w-4" /></Button>
            </div>
            {locale.specialties?.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay especialidades configuradas</p>
            ) : (
              <ul className="space-y-2">
                {locale.specialties?.map((s: any) => (
                  <li key={s.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                    <span className="text-sm">{s.name}</span>
                    <Button variant="ghost" size="sm" onClick={() => removeSpecialty(s.id)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Dentistas del Local</CardTitle>
            <div className="flex gap-2">
              <Dialog open={createDentistOpen} onOpenChange={setCreateDentistOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <UserPlus className="mr-1 h-3 w-3" /> Crear
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>Crear Dentista en {locale.name}</DialogTitle></DialogHeader>
                  <form onSubmit={handleCreateDentist} className="space-y-4 pt-2">
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Datos de Cuenta</p>
                      <div className="space-y-2">
                        <Label htmlFor="cd-email">Email *</Label>
                        <Input id="cd-email" type="email" required value={dentistForm.email} onChange={(e) => setDentistForm({ ...dentistForm, email: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cd-password">Contraseña *</Label>
                        <Input id="cd-password" type="password" required minLength={6} value={dentistForm.password} onChange={(e) => setDentistForm({ ...dentistForm, password: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Datos Personales</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="cd-fn">Nombre *</Label>
                          <Input id="cd-fn" required value={dentistForm.firstName} onChange={(e) => setDentistForm({ ...dentistForm, firstName: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cd-ln">Apellido *</Label>
                          <Input id="cd-ln" required value={dentistForm.lastName} onChange={(e) => setDentistForm({ ...dentistForm, lastName: e.target.value })} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="cd-phone">Teléfono</Label>
                          <Input id="cd-phone" value={dentistForm.phone} onChange={(e) => setDentistForm({ ...dentistForm, phone: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cd-spec">Especialidad</Label>
                          <Input id="cd-spec" value={dentistForm.specialty} onChange={(e) => setDentistForm({ ...dentistForm, specialty: e.target.value })} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cd-lic">N° Registro</Label>
                        <Input id="cd-lic" placeholder="Autogenerado si se deja vacío" value={dentistForm.licenseNumber} onChange={(e) => setDentistForm({ ...dentistForm, licenseNumber: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cd-rut">RUT</Label>
                        <Input id="cd-rut" placeholder="12.345.678-9" value={dentistForm.rut} onChange={(e) => setDentistForm({ ...dentistForm, rut: e.target.value })} />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Se asignará automáticamente al local {locale.name}</p>
                    <div className="flex justify-end gap-3">
                      <Button type="button" variant="outline" onClick={() => setCreateDentistOpen(false)}>Cancelar</Button>
                      <Button type="submit" disabled={savingDentist}>{savingDentist ? <Spinner className="mr-2" /> : null} Crear y Asignar</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              <Dialog open={assignDentistOpen} onOpenChange={setAssignDentistOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => setDentistSearch("")}>
                    <Link className="mr-1 h-3 w-3" /> Asignar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Asignar Dentista a {locale.name}</DialogTitle></DialogHeader>
                  <div className="space-y-3 pt-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Buscar dentista..." className="pl-9" value={dentistSearch} onChange={(e) => setDentistSearch(e.target.value)} />
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-1">
                      {filteredAvailableDentists.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No hay dentistas disponibles</p>
                      ) : (
                        filteredAvailableDentists.map((d) => (
                          <div key={d.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                                {getInitials(d.user?.firstName || "", d.user?.lastName || "")}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{d.user?.firstName} {d.user?.lastName}</p>
                                <p className="text-xs text-muted-foreground">{d.specialty || "Sin especialidad"}</p>
                              </div>
                            </div>
                            <Button size="sm" disabled={assignSaving} onClick={() => handleAssignDentist(d.id)}>
                              <Plus className="mr-1 h-3 w-3" /> Asignar
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {loadingDentists ? (
              <div className="flex justify-center py-4"><Spinner className="h-5 w-5" /></div>
            ) : localeDentists.length === 0 ? (
              <div className="py-8 text-center">
                <Stethoscope className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">No hay dentistas asignados a este local</p>
              </div>
            ) : (
              <div className="space-y-2">
                {localeDentists.map((dl: any) => (
                  <div key={dl.dentist.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                        {getInitials(dl.dentist.user?.firstName || "", dl.dentist.user?.lastName || "")}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{dl.dentist.user?.firstName} {dl.dentist.user?.lastName}</p>
                        <p className="text-xs text-muted-foreground">{dl.dentist.specialty || "Sin especialidad"}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setUnlinkDentistId(dl.dentist.id)} className="text-destructive hover:text-destructive">
                      <Unlink className="mr-1 h-3 w-3" /> Desvincular
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Pacientes del Local</CardTitle>
            <div className="flex gap-2">
              <Dialog open={createPatientOpen} onOpenChange={setCreatePatientOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <UserPlus className="mr-1 h-3 w-3" /> Crear
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>Crear Paciente en {locale.name}</DialogTitle></DialogHeader>
                  <form onSubmit={handleCreatePatient} className="space-y-4 pt-2">
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Identificación</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="cp-rut">RUT *</Label>
                          <Input id="cp-rut" placeholder="12345678-9" required value={patientForm.rut} onChange={(e) => setPatientForm({ ...patientForm, rut: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cp-email">Email</Label>
                          <Input id="cp-email" type="email" value={patientForm.email} onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })} />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Datos Personales</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="cp-fn">Nombre *</Label>
                          <Input id="cp-fn" required value={patientForm.firstName} onChange={(e) => setPatientForm({ ...patientForm, firstName: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cp-ln">Apellido *</Label>
                          <Input id="cp-ln" required value={patientForm.lastName} onChange={(e) => setPatientForm({ ...patientForm, lastName: e.target.value })} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="cp-phone">Teléfono</Label>
                          <Input id="cp-phone" value={patientForm.phone} onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cp-dob">Fecha Nacimiento</Label>
                          <Input id="cp-dob" type="date" value={patientForm.dob} onChange={(e) => setPatientForm({ ...patientForm, dob: e.target.value })} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="cp-sex">Sexo</Label>
                          <select id="cp-sex" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={patientForm.sex} onChange={(e) => setPatientForm({ ...patientForm, sex: e.target.value })}>
                            <option value="">Seleccionar</option>
                            <option value="M">Masculino</option>
                            <option value="F">Femenino</option>
                            <option value="O">Otro</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cp-blood">Grupo Sanguíneo</Label>
                          <Input id="cp-blood" value={patientForm.bloodType} onChange={(e) => setPatientForm({ ...patientForm, bloodType: e.target.value })} />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Se asignará automáticamente al local {locale.name}</p>
                    <div className="flex justify-end gap-3">
                      <Button type="button" variant="outline" onClick={() => setCreatePatientOpen(false)}>Cancelar</Button>
                      <Button type="submit" disabled={savingPatient}>{savingPatient ? <Spinner className="mr-2" /> : null} Crear y Asignar</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              <Dialog open={assignPatientOpen} onOpenChange={setAssignPatientOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => setPatientSearch("")}>
                    <Link className="mr-1 h-3 w-3" /> Asignar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Asignar Paciente a {locale.name}</DialogTitle></DialogHeader>
                  <div className="space-y-3 pt-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Buscar paciente por nombre o RUT..." className="pl-9" value={patientSearch} onChange={(e) => setPatientSearch(e.target.value)} />
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-1">
                      {filteredAvailablePatients.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No hay pacientes disponibles</p>
                      ) : (
                        filteredAvailablePatients.map((p) => (
                          <div key={p.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                            <div>
                              <p className="text-sm font-medium">{p.displayName || `${p.firstName || p.user?.firstName} ${p.lastName || p.user?.lastName}`}</p>
                              <p className="text-xs text-muted-foreground">{p.rut || "Sin RUT"}</p>
                            </div>
                            <Button size="sm" disabled={assignSaving} onClick={() => handleAssignPatient(p.id)}>
                              <Plus className="mr-1 h-3 w-3" /> Asignar
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {loadingPatients ? (
              <div className="flex justify-center py-4"><Spinner className="h-5 w-5" /></div>
            ) : localePatients.length === 0 ? (
              <div className="py-8 text-center">
                <UserPlus className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">No hay pacientes asignados a este local</p>
              </div>
            ) : (
              <div className="space-y-2">
                {localePatients.map((pl: any) => (
                  <div key={pl.patient.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                        {getInitials(pl.patient.firstName || pl.patient.user?.firstName || "", pl.patient.lastName || pl.patient.user?.lastName || "")}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{pl.patient.firstName || pl.patient.user?.firstName} {pl.patient.lastName || pl.patient.user?.lastName}</p>
                        <p className="text-xs text-muted-foreground">{pl.patient.rut || "Sin RUT"}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setUnlinkPatientId(pl.patient.id)} className="text-destructive hover:text-destructive">
                      <Unlink className="mr-1 h-3 w-3" /> Desvincular
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Teléfono</span>
            <span>{locale.phone || "-"}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Email</span>
            <span>{locale.email || "-"}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Zona horaria</span>
            <span>{locale.timezone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total de atenciones</span>
            <span>{locale._count?.appointments ?? 0}</span>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!unlinkDentistId} onOpenChange={(open) => { if (!open) setUnlinkDentistId(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirmar Desvinculación</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">¿Desvincular este dentista del local? El dentista no podrá atender en este local hasta que se le vuelva a asignar.</p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setUnlinkDentistId(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleUnlinkDentist}>Desvincular</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!unlinkPatientId} onOpenChange={(open) => { if (!open) setUnlinkPatientId(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirmar Desvinculación</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">¿Desvincular este paciente del local? El paciente perderá el acceso a esta sucursal.</p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setUnlinkPatientId(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleUnlinkPatient}>Desvincular</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
