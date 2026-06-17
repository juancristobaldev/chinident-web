"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Stethoscope, UserCheck, Calendar, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency } from "@/lib/utils";

interface AdminStats {
  activeClinics: number;
  totalUsers: number;
  totalDentists: number;
  totalPatients: number;
  monthlyAppointments: number;
  monthlyRevenue: number;
  topClinics: { id: string; name: string; _count: { patients: number; appointments: number } }[];
}

export default function ReportsPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<AdminStats>("/admin/stats")
      .then(setStats)
      .catch(() => toast.error("Error al cargar datos"))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { title: "Clínicas Activas", value: stats?.activeClinics ?? "-", icon: Building2 },
    { title: "Usuarios", value: stats?.totalUsers ?? "-", icon: Users },
    { title: "Dentistas", value: stats?.totalDentists ?? "-", icon: Stethoscope },
    { title: "Pacientes", value: stats?.totalPatients ?? "-", icon: UserCheck },
    { title: "Atenciones (mes)", value: stats?.monthlyAppointments ?? "-", icon: Calendar },
    {
      title: "Ingresos (mes)",
      value: stats?.monthlyRevenue ? formatCurrency(stats.monthlyRevenue) : "-",
      icon: DollarSign,
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
        <p className="text-muted-foreground">Estadísticas y métricas de la plataforma</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ title, value, icon: Icon }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {stats?.topClinics && stats.topClinics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Clínicas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topClinics.map((clinic, i) => (
                <div
                  key={clinic.id}
                  className="flex items-center justify-between rounded-md border px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-muted-foreground w-6">{i + 1}</span>
                    <span className="font-medium">{clinic.name}</span>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>{clinic._count.patients} pacientes</span>
                    <span>{clinic._count.appointments} atenciones</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {(!stats?.topClinics || stats.topClinics.length === 0) && (
        <p className="text-sm text-muted-foreground text-center py-8">No hay datos de clínicas disponibles</p>
      )}
    </div>
  );
}
