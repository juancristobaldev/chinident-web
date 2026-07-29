"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { api } from "@/lib/api";
import { getInitials, formatDate } from "@/lib/utils";
import { Building2, ChevronRight } from "lucide-react";

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
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10 text-xs font-bold text-blue-600 uppercase">
            {getInitials(t.owner?.firstName || t.name.charAt(0), t.owner?.lastName || "")}
          </div>
          <div>
            <p className="font-semibold text-foreground">{t.name}</p>
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
        t.owner ? <span className="font-medium">{t.owner.firstName} {t.owner.lastName}</span> : "-",
    },
    {
      key: "stats",
      header: "Actividad",
      render: (t: any) => (
        <div className="text-xs space-y-1 text-muted-foreground">
          <p><span className="font-medium text-foreground">{t._count?.locales ?? 0}</span> locales</p>
          <p><span className="font-medium text-foreground">{t._count?.dentists ?? 0}</span> dentistas</p>
          <p><span className="font-medium text-foreground">{t._count?.patients ?? 0}</span> pacientes</p>
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Creado",
      render: (t: any) => <span className="text-sm text-muted-foreground">{formatDate(t.createdAt)}</span>,
    },
    {
      key: "isActive",
      header: "Estado",
      render: (t: any) => <StatusBadge status={t.isActive ? "active" : "inactive"} />,
    },
    {
      key: "actions",
      header: "",
      render: (t: any) => (
        <div className="flex justify-end text-muted-foreground">
          <ChevronRight className="h-5 w-5" />
        </div>
      ),
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            Clínicas <Building2 className="h-6 w-6 text-blue-500" />
          </h1>
          <p className="text-muted-foreground mt-1">Todas las clínicas registradas en la plataforma.</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={tenants}
        isLoading={loading}
        emptyMessage="No hay clínicas registradas"
        onRowClick={(t) => router.push(`/admin/owners/${t.id}`)}
      />
    </div>
  );
}
