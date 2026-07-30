"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { Calendar, CheckCircle, Clock, Activity, Users, Stethoscope } from "lucide-react";
import { toast } from "sonner";

interface DentistStats {
  todayAppointments: number;
  todayAttended: number;
  todayPending: number;
  weekAppointments: number;
  monthlyAppointments: number;
  uniquePatients: number;
}

export default function DentistDashboardPage() {
  const [stats, setStats] = useState<DentistStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<DentistStats>("/dentist/dashboard")
      .then(setStats)
      .catch(() => toast.error("No se pudieron cargar las estadísticas"))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { title: "Citas Hoy", value: stats?.todayAppointments ?? "-", icon: Calendar },
    { title: "Atendidas Hoy", value: stats?.todayAttended ?? "-", icon: CheckCircle },
    { title: "Pendientes Hoy", value: stats?.todayPending ?? "-", icon: Clock },
    { title: "Esta Semana", value: stats?.weekAppointments ?? "-", icon: Calendar },
    { title: "Este Mes", value: stats?.monthlyAppointments ?? "-", icon: Activity },
    { title: "Pacientes Únicos", value: stats?.uniquePatients ?? "-", icon: Users },
  ];

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          Dashboard <Stethoscope className="h-6 w-6 text-emerald-500" />
        </h1>
        <p className="text-muted-foreground mt-1">Resumen de tu actividad clínica</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ title, value, icon: Icon }) => (
          <Card key={title} className="group transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-emerald-500/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
              <div className="bg-emerald-500/10 p-2 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                <Icon className="h-4 w-4 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
