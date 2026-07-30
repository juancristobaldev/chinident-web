"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Calendar, DollarSign, TrendingUp, Stethoscope, ExternalLink, Building2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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
      <div className="space-y-8 animate-in fade-in duration-500">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[300px] rounded-xl" />
          <Skeleton className="h-[300px] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          Dashboard <Building2 className="h-6 w-6 text-blue-500" />
        </h1>
        <p className="text-muted-foreground mt-1">Resumen general de tu clínica</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ title, value, icon: Icon }) => (
          <Card key={title} className="group transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-blue-500/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
              <div className="bg-blue-500/10 p-2 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                <Icon className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {stats?.topDentists && stats.topDentists.length > 0 && (
          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Dentistas más activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.topDentists.map((d, i) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between rounded-lg border border-border/50 bg-background px-4 py-3 text-sm cursor-pointer hover:bg-muted/50 hover:border-border transition-all"
                    onClick={() => router.push(`/owner/dentists/${d.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                        {i + 1}
                      </div>
                      <span className="flex items-center gap-2 font-medium">
                        <Stethoscope className="h-4 w-4 text-emerald-500" />
                        {d.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground font-medium">{d.appointments} atenciones</span>
                      <ExternalLink className="h-4 w-4 text-muted-foreground/50" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {stats?.topTreatments && stats.topTreatments.length > 0 && (
          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Tratamientos más frecuentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.topTreatments.map((t, i) => (
                  <div key={t.name} className="flex items-center justify-between rounded-lg border border-border/50 bg-background px-4 py-3 text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                        {i + 1}
                      </div>
                      <span className="font-medium">{t.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{t.count}</span>
                      <span className="text-muted-foreground text-xs">veces</span>
                    </div>
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
