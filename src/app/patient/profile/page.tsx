"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { getInitials } from "@/lib/utils";

interface PatientProfile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  rut: string | null;
  address: string | null;
  dob: string | null;
  user: { firstName: string; lastName: string; email: string; phone: string | null } | null;
  medicalInfo?: {
    allergies: string[];
    diseases: string[];
    medications: string[];
  } | null;
}

export default function PatientProfilePage() {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    dob: "",
  });

  useEffect(() => {
    api.get<PatientProfile>("/patients/me")
      .then((data) => {
        setProfile(data);
        const firstName = data.firstName || data.user?.firstName || "";
        const lastName = data.lastName || data.user?.lastName || "";
        setForm({
          firstName,
          lastName,
          phone: data.user?.phone || "",
          address: data.address || "",
          dob: data.dob ? data.dob.slice(0, 10) : "",
        });
      })
      .catch(() => {
        toast.error("Error al cargar perfil");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    try {
      await api.put("/patients/me", {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        address: form.address,
        dob: form.dob || undefined,
      });
      toast.success("Perfil actualizado correctamente");
    } catch {
      toast.error("Error al actualizar perfil");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Spinner className="h-8 w-8" /></div>;
  }

  if (!profile) {
    return <Card><CardContent className="py-10 text-center text-muted-foreground">No se pudo cargar el perfil.</CardContent></Card>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
        <p className="text-muted-foreground">Gestiona tu información personal</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-xl">
                {getInitials(profile.firstName || profile.user?.firstName || "", profile.lastName || profile.user?.lastName || "")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{profile.firstName || profile.user?.firstName} {profile.lastName || profile.user?.lastName}</h2>
              <p className="text-sm text-muted-foreground">RUT: {profile.rut}</p>
              <p className="text-sm text-muted-foreground">{profile.user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input id="firstName" name="firstName" value={form.firstName} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input id="lastName" name="lastName" value={form.lastName} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" name="phone" value={form.phone} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Fecha de nacimiento</Label>
                <Input id="dob" name="dob" type="date" value={form.dob} onChange={handleChange} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input id="address" name="address" value={form.address} onChange={handleChange} />
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {profile.medicalInfo && (
        <div className="grid gap-4 md:grid-cols-3">
          {profile.medicalInfo.allergies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Alergias</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {profile.medicalInfo.allergies.map((a) => <li key={a}>{a}</li>)}
                </ul>
              </CardContent>
            </Card>
          )}
          {profile.medicalInfo.diseases.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Condiciones médicas</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {profile.medicalInfo.diseases.map((c) => <li key={c}>{c}</li>)}
                </ul>
              </CardContent>
            </Card>
          )}
          {profile.medicalInfo.medications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Medicamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {profile.medicalInfo.medications.map((m) => <li key={m}>{m}</li>)}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
