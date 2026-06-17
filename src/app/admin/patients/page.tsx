"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";

export default function PatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any[]>("/patients")
      .then(setPatients)
      .catch(() => toast.error("Error al cargar datos"))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    {
      key: "name",
      header: "Paciente",
      render: (p: any) => (
        <div>
          <p className="font-medium">
            {p.user?.firstName} {p.user?.lastName}
          </p>
          <p className="text-xs text-muted-foreground">{p.user?.email}</p>
        </div>
      ),
    },
    { key: "rut", header: "RUT", render: (p: any) => p.rut ?? "-" },
    { key: "email", header: "Email", render: (p: any) => p.user?.email ?? "-" },
    {
      key: "tenant",
      header: "Clínica",
      render: (p: any) => p.tenant?.name ?? "-",
    },
    {
      key: "isActive",
      header: "Estado",
      render: (p: any) => <StatusBadge status={p.isActive ? "active" : "inactive"} />,
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
        <h1 className="text-3xl font-bold tracking-tight">Pacientes</h1>
        <p className="text-muted-foreground">Todos los pacientes registrados en la plataforma</p>
      </div>

      <DataTable
        columns={columns}
        data={patients}
        emptyMessage="No hay pacientes registrados"
      />
    </div>
  );
}
