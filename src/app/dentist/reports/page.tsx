"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { Calendar, CheckCircle, Clock, Activity } from "lucide-react";
import { toast } from "sonner";

interface DentistStats {
  todayAppointments: number;
  todayAttended: number;
  todayPending: number;
  weekAppointments: number;
  monthlyAppointments: number;
  uniquePatients: number;
}

export default function DentistReportsPage() {
  const [stats, setStats] = useState<DentistStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<DentistStats>("/dentist/dashboard")
      .then(setStats)
      .catch(() => { toast.error("Error al cargar datos"); })
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { title: "Citas Hoy", value: stats?.todayAppointments ?? "-", icon: Calendar },
    { title: "Atendidas Hoy", value: stats?.todayAttended ?? "-", icon: CheckCircle },
    { title: "Pendientes Hoy", value: stats?.todayPending ?? "-", icon: Clock },
    { title: "Esta Semana", value: stats?.weekAppointments ?? "-", icon: Calendar },
    { title: "Este Mes", value: stats?.monthlyAppointments ?? "-", icon: Activity },
    { title: "Pacientes Únicos", value: stats?.uniquePatients ?? "-", icon: Calendar },
  ];

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner className="h-8 w-8" /></div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
        <p className="text-muted-foreground">Estadísticas de tu actividad</p>
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
    </div>
  );
}
