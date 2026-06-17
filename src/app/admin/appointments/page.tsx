"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/shared/data-table";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";

const statusLabels: Record<string, string> = {
  RESERVADA: "Reservada",
  CONFIRMADA: "Confirmada",
  EN_ATENCION: "En Atención",
  FINALIZADA: "Finalizada",
  CANCELADA: "Cancelada",
  NO_ASISTIO: "No Asistió",
};

const statusColors: Record<string, string> = {
  RESERVADA: "bg-blue-100 text-blue-800",
  CONFIRMADA: "bg-green-100 text-green-800",
  EN_ATENCION: "bg-yellow-100 text-yellow-800",
  FINALIZADA: "bg-gray-100 text-gray-800",
  CANCELADA: "bg-red-100 text-red-800",
  NO_ASISTIO: "bg-orange-100 text-orange-800",
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any[]>("/appointments")
      .then(setAppointments)
      .catch(() => toast.error("Error al cargar datos"))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    {
      key: "patient",
      header: "Paciente",
      render: (a: any) => (
        <div>
          <p className="font-medium">
            {a.patient?.user?.firstName} {a.patient?.user?.lastName}
          </p>
          <p className="text-xs text-muted-foreground">{a.patient?.rut ?? "Sin RUT"}</p>
        </div>
      ),
    },
    {
      key: "dentist",
      header: "Dentista",
      render: (a: any) => (
        <p>
          {a.dentist?.firstName} {a.dentist?.lastName}
        </p>
      ),
    },
    {
      key: "date",
      header: "Fecha",
      render: (a: any) => (
        <div className="text-xs space-y-0.5">
          <p>{formatDateTime(a.startTime)}</p>
        </div>
      ),
    },
    {
      key: "locale",
      header: "Local",
      render: (a: any) => a.locale?.name ?? "-",
    },
    {
      key: "status",
      header: "Estado",
      render: (a: any) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            statusColors[a.status] || "bg-gray-100 text-gray-800"
          }`}
        >
          {statusLabels[a.status] || a.status}
        </span>
      ),
    },
  ];

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agenda Global</h1>
        <p className="text-muted-foreground">Todas las citas agendadas en la plataforma</p>
      </div>

      <DataTable
        columns={columns}
        data={appointments}
        emptyMessage="No hay citas agendadas"
      />
    </div>
  );
}
