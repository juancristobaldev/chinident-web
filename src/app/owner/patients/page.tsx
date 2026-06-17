"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { getInitials } from "@/lib/utils";
import { Plus, Search } from "lucide-react";

type LocaleOption = { id: string; name: string };
type DentistOption = { id: string; user: { firstName: string; lastName: string } };

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<any[]>([]);
  const [locales, setLocales] = useState<LocaleOption[]>([]);
  const [dentists, setDentists] = useState<DentistOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    rut: "", dob: "", sex: "", address: "",
    emergencyContact: "", emergencyPhone: "", bloodType: "",
    dentistId: "", localeIds: [] as string[],
  });

  const fetchAll = async () => {
    try { const p = await api.get<any[]>("/patients"); setPatients(p); } catch { toast.error("Error al cargar datos"); }
    try { const l = await api.get<any[]>("/locales"); setLocales(l); } catch { toast.error("Error al cargar datos"); }
    try { const d = await api.get<any[]>("/dentists"); setDentists(d); } catch { toast.error("Error al cargar datos"); }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.get<any[]>(`/patients/search?q=${encodeURIComponent(search)}`);
      setPatients(data);
    } catch { toast.error("Error al cargar datos"); } finally { setLoading(false); }
  };

  const openCreate = () => {
    setForm({ firstName: "", lastName: "", email: "", phone: "", rut: "", dob: "", sex: "", address: "", emergencyContact: "", emergencyPhone: "", bloodType: "", dentistId: "", localeIds: [] });
    setDialogOpen(true);
  };

  const toggleLocale = (id: string) => {
    setForm((f) => ({
      ...f,
      localeIds: f.localeIds.includes(id)
        ? f.localeIds.filter((lid) => lid !== id)
        : [...f.localeIds, id],
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        ...form,
        dob: form.dob || undefined,
        dentistId: form.dentistId || undefined,
        localeIds: form.localeIds.length ? form.localeIds : undefined,
      };
      await api.post("/patients", payload);
      setDialogOpen(false);
      fetchAll();
    } catch { toast.error("Error al guardar"); } finally { setSaving(false); }
  };

  const columns = [
    { key: "name", header: "Paciente", render: (p: any) => (
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
          {getInitials(p.firstName || p.user?.firstName || "", p.lastName || p.user?.lastName || "")}
        </div>
        <div>
          <p className="font-medium">{p.displayName || `${p.firstName || p.user?.firstName || ""} ${p.lastName || p.user?.lastName || ""}`}</p>
          <p className="text-xs text-muted-foreground">{p.rut || "Sin RUT"}</p>
        </div>
      </div>
    )},
    { key: "locales", header: "Locales", render: (p: any) =>
      p.locales?.map((pl: any) => pl.locale.name).join(", ") || "-"
    },
    { key: "dentist", header: "Dentista", render: (p: any) =>
      p.dentist ? `${p.dentist.user?.firstName} ${p.dentist.user?.lastName}` : "-"
    },
    { key: "appointments", header: "Citas", render: (p: any) => p._count?.appointments ?? 0 },
    { key: "isActive", header: "Estado", render: (p: any) => (
      <StatusBadge status={p.isActive ? "active" : "inactive"} />
    )},
  ];

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner className="h-8 w-8" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pacientes</h1>
          <p className="text-muted-foreground">Gestiona los pacientes de tu clínica</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Nuevo Paciente</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Nuevo Paciente</DialogTitle></DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre *</Label>
                  <Input id="firstName" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido *</Label>
                  <Input id="lastName" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="rut">RUT</Label>
                  <Input id="rut" placeholder="12345678-9" value={form.rut} onChange={(e) => setForm({ ...form, rut: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Fecha Nacimiento</Label>
                  <Input id="dob" type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="sex">Sexo</Label>
                  <select
                    id="sex"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.sex}
                    onChange={(e) => setForm({ ...form, sex: e.target.value })}
                  >
                    <option value="">Seleccionar</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="O">Otro</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bloodType">Grupo Sanguíneo</Label>
                  <Input id="bloodType" value={form.bloodType} onChange={(e) => setForm({ ...form, bloodType: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Asignar a Locales</Label>
                  {locales.length === 0 ? (
                    <p className="text-xs text-muted-foreground mt-1">No tienes locales creados</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-1 max-h-24 overflow-y-auto rounded-md border p-2">
                      {locales.map((l) => (
                        <label key={l.id} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-muted/50 rounded px-1.5 py-1">
                          <input
                            type="checkbox"
                            checked={form.localeIds.includes(l.id)}
                            onChange={() => toggleLocale(l.id)}
                            className="h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          {l.name}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dentistId">Dentista asignado</Label>
                  <select
                    id="dentistId"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.dentistId}
                    onChange={(e) => setForm({ ...form, dentistId: e.target.value })}
                  >
                    <option value="">Ninguno</option>
                    {dentists.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.user?.firstName} {d.user?.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={saving}>{saving ? <Spinner className="mr-2" /> : null} Guardar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <Input
          placeholder="Buscar por nombre o RUT..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Button type="submit" variant="outline">
          <Search className="mr-2 h-4 w-4" /> Buscar
        </Button>
        {search && (
          <Button type="button" variant="ghost" onClick={() => { setSearch(""); fetchAll(); }}>
            Limpiar
          </Button>
        )}
      </form>

      <DataTable
        columns={columns}
        data={patients}
        emptyMessage="No se encontraron pacientes"
        isLoading={loading}
        onRowClick={(p) => router.push(`/owner/patients/${p.id}`)}
      />
    </div>
  );
}
