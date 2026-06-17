"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, Pencil, MapPin } from "lucide-react";
import type { Locale } from "@/types";

export default function LocalesPage() {
  const router = useRouter();
  const [locales, setLocales] = useState<(Locale & { _count?: { boxes: number } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Locale | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", phone: "" });

  const fetchLocales = async () => {
    try {
      const data = await api.get<any[]>("/locales");
      setLocales(data);
    } catch { toast.error("Error al cargar datos"); } finally { setLoading(false); }
  };

  useEffect(() => { fetchLocales(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", address: "", phone: "" });
    setDialogOpen(true);
  };

  const openEdit = (locale: Locale) => {
    setEditing(locale);
    setForm({ name: locale.name, address: locale.address || "", phone: locale.phone || "" });
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/locales/${editing.id}`, form);
      } else {
        await api.post("/locales", form);
      }
      setDialogOpen(false);
      fetchLocales();
    } catch { toast.error("Error al guardar"); } finally { setSaving(false); }
  };

  const toggleActive = async (id: string) => {
    await api.post(`/locales/${id}/toggle-active`);
    fetchLocales();
  };

  const columns = [
    { key: "name", header: "Nombre", render: (l: any) => (
      <span className="font-medium">{l.name}</span>
    )},
    { key: "address", header: "Dirección", render: (l: any) => l.address || "-" },
    { key: "phone", header: "Teléfono", render: (l: any) => l.phone || "-" },
    { key: "boxes", header: "Boxes", render: (l: any) => l._count?.boxes ?? 0 },
    { key: "isActive", header: "Estado", render: (l: any) => (
      <StatusBadge status={l.isActive ? "active" : "inactive"} />
    )},
    { key: "actions", header: "", render: (l: Locale) => (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEdit(l); }}>
          <Pencil className="h-3 w-3" />
        </Button>
      </div>
    )},
  ];

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Spinner className="h-8 w-8" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Locales</h1>
          <p className="text-muted-foreground">Gestiona las sucursales de tu clínica</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" /> Nuevo Local
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Editar Local" : "Nuevo Local"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
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
        data={locales}
        emptyMessage="No hay locales registrados"
        onRowClick={(l) => router.push(`/owner/locales/${l.id}`)}
      />
    </div>
  );
}
