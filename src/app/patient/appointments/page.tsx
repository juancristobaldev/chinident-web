"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  type: string | null;
  dentist?: { firstName: string; lastName: string };
  locale?: { name: string };
}

const STATUS_LABELS: Record<string, string> = {
  RESERVADA: "Reservada",
  CONFIRMADA: "Confirmada",
  EN_ATENCION: "En atención",
  FINALIZADA: "Finalizada",
  CANCELADA: "Cancelada",
  NO_ASISTIO: "No asistió",
};

const STATUS_COLORS: Record<string, string> = {
  RESERVADA: "bg-blue-100 text-blue-800",
  CONFIRMADA: "bg-green-100 text-green-800",
  EN_ATENCION: "bg-yellow-100 text-yellow-800",
  FINALIZADA: "bg-gray-100 text-gray-800",
  CANCELADA: "bg-red-100 text-red-800",
  NO_ASISTIO: "bg-orange-100 text-orange-800",
};

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Appointment[]>("/appointments/me")
      .then(setAppointments)
      .catch(() => {
        toast.error("Error al cargar citas");
        setAppointments([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Spinner className="h-8 w-8" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mis Citas</h1>
        <p className="text-muted-foreground">Próximas citas agendadas</p>
      </div>

      {appointments.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground">No tienes citas programadas.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {appointments.map((apt) => (
            <Card key={apt.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm font-medium">
                    {format(new Date(apt.startTime), "EEEE d 'de' MMMM", { locale: es })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(apt.startTime), "HH:mm")} – {format(new Date(apt.endTime), "HH:mm")}
                    {" · "}{apt.locale?.name || "Sin local"}
                  </p>
                  {apt.type && <p className="text-xs text-muted-foreground mt-0.5">{apt.type}</p>}
                </div>
                <div className="text-right">
                  <p className="text-sm">{apt.dentist ? `Dr. ${apt.dentist.firstName} ${apt.dentist.lastName}` : "Dentista"}</p>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[apt.status] || "bg-gray-100 text-gray-800"}`}>
                    {STATUS_LABELS[apt.status] || apt.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
