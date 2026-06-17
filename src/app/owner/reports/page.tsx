"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/shared/data-table";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Stethoscope, Users, Calendar, Activity } from "lucide-react";

interface DentistStat {
  id: string;
  name: string;
  totalAppointments: number;
  uniquePatients: number;
  treatmentPlans: number;
}

interface AppointmentSummary {
  today: number;
  thisWeek: number;
  thisMonth: number;
  byStatus: Record<string, number>;
}

export default function ReportsPage() {
  const [dentistStats, setDentistStats] = useState<DentistStat[]>([]);
  const [appointmentSummary, setAppointmentSummary] = useState<AppointmentSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const dentists = await api.get<any[]>("/dentists");
        const statsList: DentistStat[] = [];

        for (const d of dentists) {
          try {
            const stats = await api.get<{
              totalAppointments: number;
              uniquePatients: number;
              treatmentPlans: number;
            }>(`/dentists/${d.id}/stats`);
            statsList.push({
              id: d.id,
              name: `${d.user?.firstName} ${d.user?.lastName}`,
              ...stats,
            });
          } catch {
            statsList.push({
              id: d.id,
              name: `${d.user?.firstName} ${d.user?.lastName}`,
              totalAppointments: 0,
              uniquePatients: 0,
              treatmentPlans: 0,
            });
          }
        }
        setDentistStats(statsList);

        const now = new Date();
        const todayStr = now.toISOString();
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);

        const [todayApps, weekApps, monthApps] = await Promise.all([
          api.get<any[]>(`/appointments?date=${todayStr}&view=day`),
          api.get<any[]>(`/appointments?date=${now.toISOString()}&view=week`),
          api.get<any[]>(`/appointments?view=month`),
        ]);

        const byStatus: Record<string, number> = {};
        for (const apt of monthApps) {
          byStatus[apt.status] = (byStatus[apt.status] || 0) + 1;
        }

        setAppointmentSummary({
          today: todayApps.length,
          thisWeek: weekApps.length,
          thisMonth: monthApps.length,
          byStatus,
        });
      } catch { toast.error("Error al cargar datos"); }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Spinner className="h-8 w-8" /></div>;
  }

  const STATUS_LABELS: Record<string, string> = {
    RESERVADA: "Reservadas",
    CONFIRMADA: "Confirmadas",
    EN_ATENCION: "En atención",
    FINALIZADA: "Finalizadas",
    CANCELADA: "Canceladas",
    NO_ASISTIO: "No asistió",
  };

  const statusCards = [
    { title: "Hoy", value: appointmentSummary?.today ?? "-", icon: Calendar },
    { title: "Esta semana", value: appointmentSummary?.thisWeek ?? "-", icon: Calendar },
    { title: "Este mes", value: appointmentSummary?.thisMonth ?? "-", icon: Calendar },
    { title: "Dentistas", value: dentistStats.length, icon: Stethoscope },
  ];

  const dentistColumns = [
    {
      key: "name",
      header: "Dentista",
      render: (d: DentistStat) => <span className="font-medium">{d.name}</span>,
    },
    { key: "totalAppointments", header: "Citas totales" },
    { key: "uniquePatients", header: "Pacientes únicos" },
    { key: "treatmentPlans", header: "Planes de tratamiento" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
        <p className="text-muted-foreground">Estadísticas de producción de tu clínica</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statusCards.map(({ title, value, icon: Icon }) => (
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Producción por dentista</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={dentistColumns}
              data={dentistStats}
              emptyMessage="No hay dentistas registrados"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Citas del mes por estado</CardTitle>
          </CardHeader>
          <CardContent>
            {appointmentSummary?.byStatus ? (
              <div className="space-y-3">
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className="text-sm font-medium">{appointmentSummary.byStatus[key] || 0}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Sin datos</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
