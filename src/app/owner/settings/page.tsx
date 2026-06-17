"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { useThemeStore, type ThemeColor } from "@/stores/theme-store";
import { Save, Building2, CreditCard, Palette } from "lucide-react";

interface TenantInfo {
  id: string;
  name: string;
  rut: string;
  businessName: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  themeColor: string;
  planType: string;
  subscription: {
    id: string;
    planType: string;
    status: string;
    maxLocales: number;
    maxDentists: number;
    maxPatients: number;
    features: string[];
    startsAt: string;
    expiresAt: string | null;
    autoRenew: boolean;
  } | null;
  usage: {
    locales: number;
    dentists: number;
    patients: number;
  };
}

const THEME_COLORS: { value: ThemeColor; label: string; className: string }[] = [
  { value: "blue", label: "Azul", className: "bg-blue-500" },
  { value: "purple", label: "Púrpura", className: "bg-purple-500" },
  { value: "pink", label: "Rosa", className: "bg-pink-500" },
  { value: "green", label: "Verde", className: "bg-green-500" },
  { value: "orange", label: "Naranja", className: "bg-orange-500" },
  { value: "teal", label: "Teal", className: "bg-teal-500" },
];

const PLAN_LABELS: Record<string, string> = {
  TRIAL: "Prueba",
  BASIC: "Básico",
  PRO: "Profesional",
  ENTERPRISE: "Empresarial",
};

export default function SettingsPage() {
  const { user } = useAuthStore();
  const setThemeColor = useThemeStore((s) => s.setColor);
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    businessName: "",
    email: "",
    phone: "",
    address: "",
    themeColor: "blue",
  });

  useEffect(() => {
    api.get<TenantInfo>("/owner/tenant")
      .then((data) => {
        setTenant(data);
        setForm({
          name: data.name,
          businessName: data.businessName || "",
          email: data.email,
          phone: data.phone || "",
          address: data.address || "",
          themeColor: data.themeColor,
        });
      })
      .catch(() => { toast.error("Error al cargar datos"); })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/owner/tenant", form);
      setThemeColor(form.themeColor as ThemeColor);
      if (user) {
        useAuthStore.getState().setUser({ ...user, themeColor: form.themeColor });
      }
      toast.success("Configuración guardada");
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleColorChange = (color: ThemeColor) => {
    setForm({ ...form, themeColor: color });
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Spinner className="h-8 w-8" /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">Datos de tu clínica y plan</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5" />
              Datos de la clínica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rut">RUT</Label>
              <Input id="rut" value={tenant?.rut || ""} disabled className="opacity-60" />
              <p className="text-xs text-muted-foreground">El RUT no se puede modificar</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessName">Razón social</Label>
              <Input id="businessName" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>

            <div className="space-y-2 pt-2">
              <Label className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Color del tema
              </Label>
              <div className="flex gap-2">
                {THEME_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    className={`h-8 w-8 rounded-full ${c.className} border-2 transition-all ${form.themeColor === c.value ? "border-foreground scale-110 ring-2 ring-offset-2 ring-primary" : "border-transparent"}`}
                    onClick={() => handleColorChange(c.value)}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? <Spinner className="mr-2" /> : <Save className="mr-2 h-4 w-4" />}
              Guardar cambios
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5" />
              Plan y suscripción
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <span className="text-sm text-muted-foreground">Plan actual</span>
              <span className="text-sm font-semibold">{PLAN_LABELS[tenant?.planType || ""] || tenant?.planType}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-sm text-muted-foreground">Estado</span>
              <span className={`text-sm font-medium ${tenant?.subscription?.status === "active" ? "text-green-600" : "text-amber-600"}`}>
                {tenant?.subscription?.status === "active" ? "Activo" : tenant?.subscription?.status}
              </span>
            </div>
            {tenant?.subscription?.expiresAt && (
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm text-muted-foreground">Expira</span>
                <span className="text-sm font-medium">
                  {new Date(tenant.subscription.expiresAt).toLocaleDateString("es-CL")}
                </span>
              </div>
            )}
            <div className="flex justify-between border-b pb-2">
              <span className="text-sm text-muted-foreground">Renovación automática</span>
              <span className={`text-sm font-medium ${tenant?.subscription?.autoRenew ? "text-green-600" : "text-muted-foreground"}`}>
                {tenant?.subscription?.autoRenew ? "Sí" : "No"}
              </span>
            </div>

            <div className="pt-2 space-y-3">
              <Label>Uso de recursos</Label>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Locales</span>
                    <span className="font-medium">{tenant?.usage.locales ?? 0} / {tenant?.subscription?.maxLocales ?? 1}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(((tenant?.usage.locales ?? 0) / (tenant?.subscription?.maxLocales || 1)) * 100, 100)}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Dentistas</span>
                    <span className="font-medium">{tenant?.usage.dentists ?? 0} / {tenant?.subscription?.maxDentists ?? 3}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(((tenant?.usage.dentists ?? 0) / (tenant?.subscription?.maxDentists || 1)) * 100, 100)}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Pacientes</span>
                    <span className="font-medium">{tenant?.usage.patients ?? 0} / {tenant?.subscription?.maxPatients ?? 100}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(((tenant?.usage.patients ?? 0) / (tenant?.subscription?.maxPatients || 1)) * 100, 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
