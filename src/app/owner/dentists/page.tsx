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
import { Plus, Search, X, Power } from "lucide-react";

type LocaleOption = { id: string; name: string };

export default function DentistsPage() {
  const router = useRouter();
  const [dentists, setDentists] = useState<any[]>([]);
  const [locales, setLocales] = useState<LocaleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [localeSearch, setLocaleSearch] = useState("");
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "",
    phone: "", specialty: "", licenseNumber: "", rut: "", localeIds: [] as string[],
  });

  const fetchAll = async () => {
    try { const d = await api.get<any[]>("/dentists"); setDentists(d); } catch (e: any) { toast.error(e.message || "Error al cargar datos"); }
    try { const l = await api.get<any[]>("/locales"); setLocales(l); } catch (e: any) { toast.error(e.message || "Error al cargar datos"); }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => {
    setForm({ firstName: "", lastName: "", email: "", password: "", phone: "", specialty: "", licenseNumber: "", rut: "", localeIds: [] });
    setLocaleSearch("");
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

  const filteredLocales = locales.filter((l) =>
    l.name.toLowerCase().includes(localeSearch.toLowerCase())
  );

  const selectedLocales = locales.filter((l) => form.localeIds.includes(l.id));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.localeIds.length) { toast.error("Debe asignar al menos un local"); return; }
    setSaving(true);
    try {
      const payload: any = {
        ...form,
        email: form.email,
        password: form.password,
        localeIds: form.localeIds,
      };
      if (!form.licenseNumber) delete payload.licenseNumber;
      await api.post("/dentists", payload);
      toast.success("Dentista creado exitosamente");
      setDialogOpen(false);
      fetchAll();
    } catch (e: any) { toast.error(e.message || "Error al guardar"); } finally { setSaving(false); }
  };

  const toggleActive = async (id: string) => {
    try {
      await api.post(`/dentists/${id}/toggle-active`);
      toast.success("Estado actualizado");
      fetchAll();
    } catch (e: any) { toast.error(e.message || "Error al cambiar estado"); }
  };

  const columns = [
    { key: "name", header: "Dentista", render: (d: any) => (
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
          {getInitials(d.user?.firstName || "", d.user?.lastName || "")}
        </div>
        <div>
          <p className="font-medium">{d.user?.firstName} {d.user?.lastName}</p>
          <p className="text-xs text-muted-foreground">{d.licenseNumber} · {d.user?.email}</p>
        </div>
      </div>
    )},
    { key: "specialty", header: "Especialidad", render: (d: any) => d.specialty || "-" },
    { key: "rut", header: "RUT", render: (d: any) => d.rut || "-" },
    { key: "locales", header: "Locales", render: (d: any) =>
      d.locales?.map((dl: any) => dl.locale.name).join(", ") || "-"
    },
    { key: "isActive", header: "Estado", render: (d: any) => (
      <StatusBadge status={d.isActive ? "active" : "inactive"} />
    )},
    { key: "actions", header: "", render: (d: any) => (
      <div className="flex items-center gap-1">
        <Button title="Activar/Desactivar" variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); toggleActive(d.id); }}>
          <Power className="h-3 w-3" />
        </Button>
      </div>
    )},
  ];

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner className="h-8 w-8" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dentistas</h1>
          <p className="text-muted-foreground">Gestiona los profesionales de tu clínica</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Nuevo Dentista</Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Nuevo Dentista</DialogTitle></DialogHeader>
            <form onSubmit={handleSave} className="space-y-5 pt-2">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Datos de Cuenta</p>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña *</Label>
                  <Input id="password" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Datos Personales</p>
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
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialty">Especialidad</Label>
                    <Input id="specialty" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rut">RUT</Label>
                  <Input id="rut" placeholder="12.345.678-9" value={form.rut} onChange={(e) => setForm({ ...form, rut: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">N° Registro Profesional</Label>
                  <Input id="licenseNumber" placeholder="Se autogenera si se deja vacío" value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Asignación a Locales</p>
                {locales.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No tienes locales. Crea uno primero.</p>
                ) : (
                  <>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar local..."
                        className="pl-9"
                        value={localeSearch}
                        onChange={(e) => setLocaleSearch(e.target.value)}
                      />
                    </div>
                    {selectedLocales.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedLocales.map((l) => (
                          <span key={l.id} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                            {l.name}
                            <button type="button" onClick={() => toggleLocale(l.id)} className="ml-0.5 rounded-full hover:bg-primary/20">
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto rounded-md border p-2">
                      {filteredLocales.map((l) => (
                        <label key={l.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded px-2 py-1.5 transition-colors">
                          <input
                            type="checkbox"
                            checked={form.localeIds.includes(l.id)}
                            onChange={() => toggleLocale(l.id)}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          {l.name}
                        </label>
                      ))}
                      {filteredLocales.length === 0 && (
                        <p className="text-xs text-muted-foreground col-span-2 py-2 text-center">Sin resultados</p>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={saving}>{saving ? <Spinner className="mr-2" /> : null} Guardar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={dentists}
        emptyMessage="No hay dentistas registrados"
        onRowClick={(d) => router.push(`/owner/dentists/${d.id}`)}
      />
    </div>
  );
}
