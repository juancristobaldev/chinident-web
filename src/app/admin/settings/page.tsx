"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { Save } from "lucide-react";

interface SettingEntry {
  key: string;
  value: string;
  label: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingEntry[]>([]);
  const [edited, setEdited] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get<SettingEntry[]>("/admin/settings")
      .then((data) => {
        if (Array.isArray(data)) {
          setSettings(data);
        } else if (data && typeof data === "object") {
          const entries = Object.entries(data as Record<string, string>).map(
            ([key, value]) => ({
              key,
              value: String(value),
              label: key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()),
            })
          );
          setSettings(entries);
        }
      })
      .catch(() => toast.error("Error al cargar datos"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: string) => {
    setEdited((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (Object.keys(edited).length === 0) {
      toast.error("No hay cambios para guardar");
      return;
    }
    setSaving(true);
    try {
      await api.put("/admin/settings", edited);
      toast.success("Configuración guardada");
      setSettings((prev) =>
        prev.map((s) => (edited[s.key] !== undefined ? { ...s, value: edited[s.key] } : s))
      );
      setEdited({});
    } catch {
      toast.error("Error al guardar configuración");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground">Configuración global de la plataforma</p>
        </div>
        <Button onClick={handleSave} disabled={saving || Object.keys(edited).length === 0}>
          {saving ? <Spinner className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
          Guardar
        </Button>
      </div>

      {settings.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No hay opciones de configuración disponibles
        </p>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Opciones Globales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings.map((setting) => (
              <div key={setting.key} className="space-y-2">
                <Label htmlFor={setting.key}>{setting.label ?? setting.key}</Label>
                <Input
                  id={setting.key}
                  value={edited[setting.key] ?? setting.value}
                  onChange={(e) => handleChange(setting.key, e.target.value)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
