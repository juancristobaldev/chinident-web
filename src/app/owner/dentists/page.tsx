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
import { Plus, Pencil, Power } from "lucide-react";

type LocaleOption = { id: string; name: string };

export default function DentistsPage() {
  const router = useRouter();
  const [dentists, setDentists] = useState<any[]>([]);
  const [locales, setLocales] = useState<LocaleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "",
    phone: "", specialty: "", localeIds: [] as string[],
  });

  const fetchAll = async () => {
    try { const d = await api.get<any[]>("/dentists"); setDentists(d); } catch { toast.error("Error al cargar datos"); }
    try { const l = await api.get<any[]>("/locales"); setLocales(l); } catch { toast.error("Error al cargar datos"); }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => {
    setForm({ firstName: "", lastName: "", email: "", password: "", phone: "", specialty: "", localeIds: [] });
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
      await api.post("/dentists", form);
      setDialogOpen(false);
      fetchAll();
    } catch { toast.error("Error al guardar"); } finally { setSaving(false); }
  };

  const toggleActive = async (id: string) => {
    await api.post(`/dentists/${id}/toggle-active`);
    fetchAll();
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
    { key: "locales", header: "Locales", render: (d: any) =>
      d.locales?.map((dl: any) => dl.locale.name).join(", ") || "-"
    },
    { key: "isActive", header: "Estado", render: (d: any) => (
      <StatusBadge status={d.isActive ? "active" : "inactive"} />
    )},
    { key: "actions", header: "", render: (d: any) => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); toggleActive(d.id); }}>
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
          <DialogContent>
            <DialogHeader><DialogTitle>Nuevo Dentista</DialogTitle></DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 pt-2 max-h-[70vh] overflow-y-auto">
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
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña *</Label>
                <Input id="password" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
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
                <Label>Asignar a Locales</Label>
                {locales.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No tienes locales. Crea uno primero.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto rounded-md border p-2">
                    {locales.map((l) => (
                      <label key={l.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded px-2 py-1.5">
                        <input
                          type="checkbox"
                          checked={form.localeIds.includes(l.id)}
                          onChange={() => toggleLocale(l.id)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        {l.name}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3">
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
