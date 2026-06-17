"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, DollarSign, TrendingUp, Stethoscope, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";

interface OwnerStats {
  activePatients: number;
  newPatients: number;
  todayAppointments: number;
  monthlyRevenue: number;
  topTreatments: { name: string; count: number }[];
  topDentists: { id: string; name: string; appointments: number }[];
}

export default function OwnerDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<OwnerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<OwnerStats>("/dashboard")
      .then(setStats)
      .catch(() => toast.error("No se pudieron cargar las estadísticas"))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { title: "Pacientes Activos", value: stats?.activePatients ?? "-", icon: Users },
    { title: "Pacientes Nuevos (mes)", value: stats?.newPatients ?? "-", icon: TrendingUp },
    { title: "Atenciones Hoy", value: stats?.todayAppointments ?? "-", icon: Calendar },
    { title: "Ingresos del Mes", value: stats?.monthlyRevenue ? `$${stats.monthlyRevenue.toLocaleString("es-CL")}` : "-", icon: DollarSign },
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
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Resumen de tu clínica</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

      <div className="grid gap-6 md:grid-cols-2">
        {stats?.topDentists && stats.topDentists.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dentistas más activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.topDentists.map((d, i) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => router.push(`/owner/dentists/${d.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                      <span className="flex items-center gap-2">
                        <Stethoscope className="h-3.5 w-3.5 text-muted-foreground" />
                        {d.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{d.appointments} atenciones</span>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {stats?.topTreatments && stats.topTreatments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tratamientos más frecuentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.topTreatments.map((t, i) => (
                  <div key={t.name} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                      <span>{t.name}</span>
                    </div>
                    <span className="text-muted-foreground">{t.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
