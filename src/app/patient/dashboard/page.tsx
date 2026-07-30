"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ClipboardList, FileText, UserCircle, Clock } from "lucide-react";
import { api } from "@/lib/api";
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
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <Skeleton className="h-[300px] rounded-xl" />
      </div>
    );
  }

  const cards = [
    { title: "Próximas Citas", value: data?.upcomingAppointments ?? 0, icon: Calendar },
    { title: "Tratamientos activos", value: data?.activeTreatments ?? 0, icon: ClipboardList },
    { title: "Presupuestos", value: data?.pendingBudgets ?? 0, icon: FileText },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          Bienvenido <UserCircle className="h-6 w-6 text-primary" />
        </h1>
        <p className="text-muted-foreground mt-1">Resumen de tu portal de paciente</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map(({ title, value, icon: Icon }) => (
          <Card key={title} className="group transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-primary/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
              <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
                <Icon className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Próximas citas</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.recentAppointments && data.recentAppointments.length > 0 ? (
            <div className="space-y-3">
              {data.recentAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-background px-4 py-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <span className="text-xs font-bold leading-none">{format(new Date(apt.startTime), "dd")}</span>
                      <span className="text-[10px] uppercase font-semibold leading-none">{format(new Date(apt.startTime), "MMM", { locale: es })}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold">
                        {format(new Date(apt.startTime), "EEEE", { locale: es }).replace(/^\w/, c => c.toUpperCase())}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {format(new Date(apt.startTime), "HH:mm")} – {format(new Date(apt.endTime), "HH:mm")}
                        {" · "}{apt.localeName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{apt.dentistName}</p>
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-800 uppercase tracking-wider mt-1">
                      {STATUS_LABELS[apt.status] || apt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="bg-primary/10 p-4 rounded-full mb-3">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">No tienes citas programadas</p>
              <p className="text-xs text-muted-foreground mt-1">Cuando agendes una nueva cita aparecerá aquí.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
