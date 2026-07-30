"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { api } from "@/lib/api";
import { Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold text-xs uppercase">
            {d.user?.firstName?.charAt(0)}{d.user?.lastName?.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-foreground">
              {d.user?.firstName} {d.user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground">{d.user?.email}</p>
          </div>
        </div>
      ),
    },
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
      key: "rut",
      header: "RUT",
      render: (d: any) => d.rut || "-",
    },
    {
      key: "isActive",
      header: "Estado",
      render: (d: any) => <StatusBadge status={d.isActive ? "active" : "inactive"} />,
    },
    {
      key: "actions",
      header: "",
      render: (d: any) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 font-medium">
            Ver detalle
          </Button>
        </div>
      ),
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            Dentistas <Stethoscope className="h-6 w-6 text-emerald-500" />
          </h1>
          <p className="text-muted-foreground mt-1">Directorio de todos los profesionales registrados.</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={dentists}
        isLoading={loading}
        emptyMessage="No hay dentistas registrados"
      />
    </div>
  );
}
