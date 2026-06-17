"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { getInitials, formatDate } from "@/lib/utils";

export default function ClinicsPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any[]>("/admin/tenants")
      .then(setTenants)
      .catch(() => toast.error("Error al cargar datos"))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    {
      key: "name",
      header: "Clínica",
      render: (t: any) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
            {getInitials(t.owner?.firstName || t.name.charAt(0), t.owner?.lastName || "")}
          </div>
          <div>
            <p className="font-medium">{t.name}</p>
            <p className="text-xs text-muted-foreground">{t.owner?.email || t.email}</p>
          </div>
        </div>
      ),
    },
    { key: "rut", header: "RUT", render: (t: any) => t.rut },
    {
      key: "ownerName",
      header: "Owner",
      render: (t: any) =>
        t.owner ? `${t.owner.firstName} ${t.owner.lastName}` : "-",
    },
    {
      key: "isActive",
      header: "Estado",
      render: (t: any) => <StatusBadge status={t.isActive ? "active" : "inactive"} />,
    },
    {
      key: "stats",
      header: "Actividad",
      render: (t: any) => (
        <div className="text-xs space-y-0.5">
          <p>{t._count?.locales ?? 0} locales</p>
          <p>{t._count?.dentists ?? 0} dentistas</p>
          <p>{t._count?.patients ?? 0} pacientes</p>
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Creado",
      render: (t: any) => formatDate(t.createdAt),
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
        <h1 className="text-3xl font-bold tracking-tight">Clínicas</h1>
        <p className="text-muted-foreground">Todas las clínicas registradas en la plataforma</p>
      </div>

      <DataTable
        columns={columns}
        data={tenants}
        emptyMessage="No hay clínicas registradas"
        onRowClick={(t) => router.push(`/admin/owners/${t.id}`)}
      />
    </div>
  );
}
