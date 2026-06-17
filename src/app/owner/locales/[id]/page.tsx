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
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

export default function LocaleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [locale, setLocale] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newBox, setNewBox] = useState("");
  const [newSpecialty, setNewSpecialty] = useState("");

  const fetchLocale = async () => {
    try {
      const data = await api.get(`/locales/${id}`);
      setLocale(data);
    } catch { toast.error("Error al cargar datos"); } finally { setLoading(false); }
  };

  useEffect(() => { fetchLocale(); }, [id]);

  const addBox = async () => {
    if (!newBox.trim()) return;
    await api.post(`/locales/${id}/boxes`, { name: newBox });
    setNewBox("");
    fetchLocale();
  };

  const removeBox = async (boxId: string) => {
    await api.delete(`/locales/${id}/boxes/${boxId}`);
    fetchLocale();
  };

  const addSpecialty = async () => {
    if (!newSpecialty.trim()) return;
    await api.post(`/locales/${id}/specialties`, { name: newSpecialty });
    setNewSpecialty("");
    fetchLocale();
  };

  const removeSpecialty = async (specialtyId: string) => {
    await api.delete(`/locales/${id}/specialties/${specialtyId}`);
    fetchLocale();
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
              <Input placeholder="Nombre del box" value={newBox} onChange={(e) => setNewBox(e.target.value)} />
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
              <Input placeholder="Nueva especialidad" value={newSpecialty} onChange={(e) => setNewSpecialty(e.target.value)} />
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
    </div>
  );
}
