"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ClipboardList, FileText } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface PatientDashboardData {
  upcomingAppointments: number;
  activeTreatments: number;
  pendingBudgets: number;
  recentAppointments: {
    id: string;
    startTime: string;
    endTime: string;
    status: string;
    type: string | null;
    dentistName: string;
    localeName: string;
  }[];
}

const STATUS_LABELS: Record<string, string> = {
  RESERVADA: "Reservada",
  CONFIRMADA: "Confirmada",
  EN_ATENCION: "En atención",
  FINALIZADA: "Finalizada",
  CANCELADA: "Cancelada",
  NO_ASISTIO: "No asistió",
};

export default function PatientDashboard() {
  const [data, setData] = useState<PatientDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<PatientDashboardData>("/auth/patient-dashboard")
      .then(setData)
      .catch(() => { toast.error("Error al cargar datos"); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Spinner className="h-8 w-8" /></div>;
  }

  const cards = [
    { title: "Próximas Citas", value: data?.upcomingAppointments ?? 0, icon: Calendar },
    { title: "Tratamientos activos", value: data?.activeTreatments ?? 0, icon: ClipboardList },
    { title: "Presupuestos", value: data?.pendingBudgets ?? 0, icon: FileText },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bienvenido</h1>
        <p className="text-muted-foreground">Portal del paciente</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Próximas citas</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.recentAppointments && data.recentAppointments.length > 0 ? (
            <div className="space-y-3">
              {data.recentAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between rounded-md border px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">
                      {format(new Date(apt.startTime), "EEEE d 'de' MMMM", { locale: es })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(apt.startTime), "HH:mm")} – {format(new Date(apt.endTime), "HH:mm")}
                      {" · "}{apt.localeName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{apt.dentistName}</p>
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                      {STATUS_LABELS[apt.status] || apt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No tienes citas programadas
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
