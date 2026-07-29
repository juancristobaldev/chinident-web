"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { api } from "@/lib/api";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
            {p.user?.firstName?.charAt(0)}{p.user?.lastName?.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-foreground">
              {p.user?.firstName} {p.user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground">{p.user?.email}</p>
          </div>
        </div>
      ),
    },
    { key: "rut", header: "RUT", render: (p: any) => p.rut ?? "-" },
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
    {
      key: "actions",
      header: "",
      render: (p: any) => (
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
            Pacientes <Users className="h-6 w-6 text-primary" />
          </h1>
          <p className="text-muted-foreground mt-1">Directorio de todos los pacientes registrados en la plataforma.</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={patients}
        isLoading={loading}
        emptyMessage="No hay pacientes registrados"
      />
    </div>
  );
}
