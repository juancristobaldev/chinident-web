"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
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
import { getInitials, formatDate } from "@/lib/utils";
import { Plus, Eye, Ban, CheckCircle } from "lucide-react";
import type { Tenant } from "@/types";

export default function OwnersPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", rut: "", businessName: "", email: "", phone: "", address: "",
    ownerFirstName: "", ownerLastName: "", ownerPassword: "",
  });

  const fetchTenants = async () => {
    try {
      const data = await api.get<any[]>("/admin/tenants");
      setTenants(data);
    } catch { toast.error("Error al cargar datos"); } finally { setLoading(false); }
  };

  useEffect(() => { fetchTenants(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/admin/tenants", form);
      setDialogOpen(false);
      setForm({ name: "", rut: "", businessName: "", email: "", phone: "", address: "", ownerFirstName: "", ownerLastName: "", ownerPassword: "" });
      fetchTenants();
    } catch { toast.error("Error al guardar"); } finally { setSaving(false); }
  };

  const handleSuspend = async (id: string) => {
    await api.delete(`/admin/tenants/${id}`);
    fetchTenants();
  };

  const handleActivate = async (id: string) => {
    await api.post(`/admin/tenants/${id}/activate`);
    fetchTenants();
  };

  const columns = [
    { key: "name", header: "Clínica / Owner", render: (t: any) => (
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
          {getInitials(t.owner?.firstName || "", t.owner?.lastName || "")}
        </div>
        <div>
          <p className="font-medium">{t.name}</p>
          <p className="text-xs text-muted-foreground">{t.owner?.email || t.email}</p>
        </div>
      </div>
    )},
    { key: "rut", header: "RUT", render: (t: any) => t.rut },
    { key: "plan", header: "Plan", render: (t: any) => (
      <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
        {t.planType}
      </span>
    )},
    { key: "stats", header: "Actividad", render: (t: any) => (
      <div className="text-xs space-y-0.5">
        <p>{t._count?.locales ?? 0} locales</p>
        <p>{t._count?.dentists ?? 0} dentistas</p>
        <p>{t._count?.patients ?? 0} pacientes</p>
      </div>
    )},
    { key: "isActive", header: "Estado", render: (t: any) => (
      <StatusBadge status={t.isActive ? "active" : "inactive"} />
    )},
    { key: "actions", header: "", render: (t: any) => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); router.push(`/admin/owners/${t.id}`); }}>
          <Eye className="h-3 w-3" />
        </Button>
        {t.isActive ? (
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleSuspend(t.id); }}>
            <Ban className="h-3 w-3 text-destructive" />
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleActivate(t.id); }}>
            <CheckCircle className="h-3 w-3 text-green-600" />
          </Button>
        )}
      </div>
    )},
  ];

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner className="h-8 w-8" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Owners</h1>
          <p className="text-muted-foreground">Gestiona las clínicas registradas en la plataforma</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Nueva Clínica</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Registrar Nueva Clínica</DialogTitle></DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 pt-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase">Datos de la Clínica</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre *</Label>
                  <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rut">RUT *</Label>
                  <Input id="rut" required value={form.rut} onChange={(e) => setForm({ ...form, rut: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Razón Social</Label>
                  <Input id="businessName" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
              </div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase pt-2">Datos del Owner</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="ownerFirstName">Nombre *</Label>
                  <Input id="ownerFirstName" required value={form.ownerFirstName} onChange={(e) => setForm({ ...form, ownerFirstName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerLastName">Apellido *</Label>
                  <Input id="ownerLastName" required value={form.ownerLastName} onChange={(e) => setForm({ ...form, ownerLastName: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerPassword">Contraseña *</Label>
                <Input id="ownerPassword" type="password" required minLength={6} value={form.ownerPassword} onChange={(e) => setForm({ ...form, ownerPassword: e.target.value })} />
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
        data={tenants}
        emptyMessage="No hay clínicas registradas"
        onRowClick={(t) => router.push(`/admin/owners/${t.id}`)}
      />
    </div>
  );
}
