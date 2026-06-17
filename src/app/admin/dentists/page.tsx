"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";

export default function DentistsPage() {
  const [dentists, setDentists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any[]>("/dentists")
      .then(setDentists)
      .catch(() => toast.error("Error al cargar datos"))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    {
      key: "name",
      header: "Dentista",
      render: (d: any) => (
        <div>
          <p className="font-medium">
            {d.user?.firstName} {d.user?.lastName}
          </p>
          <p className="text-xs text-muted-foreground">{d.user?.email}</p>
        </div>
      ),
    },
    { key: "email", header: "Email", render: (d: any) => d.user?.email ?? "-" },
    {
      key: "tenant",
      header: "Clínica",
      render: (d: any) => d.tenant?.name ?? "-",
    },
    {
      key: "specialty",
      header: "Especialidades",
      render: (d: any) => d.specialty || "General",
    },
    {
      key: "locales",
      header: "Locales",
      render: (d: any) => d.locales?.map((dl: any) => dl.locale.name).join(", ") || "-",
    },
    {
      key: "licenseNumber",
      header: "N° Colegiado",
      render: (d: any) => d.licenseNumber || "-",
    },
    {
      key: "isActive",
      header: "Estado",
      render: (d: any) => <StatusBadge status={d.isActive ? "active" : "inactive"} />,
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
        <h1 className="text-3xl font-bold tracking-tight">Dentistas</h1>
        <p className="text-muted-foreground">Todos los dentistas registrados en la plataforma</p>
      </div>

      <DataTable
        columns={columns}
        data={dentists}
        emptyMessage="No hay dentistas registrados"
      />
    </div>
  );
}
