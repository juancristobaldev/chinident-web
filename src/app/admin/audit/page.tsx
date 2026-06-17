"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/shared/data-table";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";

const methodLabels: Record<string, string> = {
  POST: "Creó",
  PUT: "Actualizó",
  PATCH: "Actualizó",
  DELETE: "Eliminó",
};

const entityLabels: Record<string, string> = {
  patients: "Paciente",
  appointments: "Cita",
  dentists: "Odontólogo",
  budgets: "Presupuesto",
  "clinical-records": "Historia Clínica",
  treatments: "Tratamiento",
  locales: "Consultorio",
  payments: "Pago",
  attachments: "Archivo",
  odontogram: "Odontograma",
  users: "Usuario",
  auth: "Autenticación",
  admin: "Administración",
  owner: "Configuración",
  evolutions: "Evolución",
  specialties: "Especialidad",
  boxes: "Box",
};

function getActionLabel(action: string, entityType: string): string {
  const method = action?.split(" ")[0] || "";
  const verb = methodLabels[method] || method;
  const noun = entityLabels[entityType] || entityType;
  return `${verb} ${noun}`.trim();
}

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any[]>("/admin/audit-logs")
      .then(setLogs)
      .catch(() => toast.error("Error al cargar datos"))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    {
      key: "timestamp",
      header: "Fecha",
      render: (l: any) => formatDateTime(l.createdAt ?? l.timestamp),
    },
    {
      key: "user",
      header: "Usuario",
      render: (l: any) => l.user?.email ?? l.userEmail ?? l.userId ?? "-",
    },
    {
      key: "action",
      header: "Acción",
      render: (l: any) => (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
          {getActionLabel(l.action, l.entityType)}
        </span>
      ),
    },
    {
      key: "entity",
      header: "Entidad",
      render: (l: any) => (
        <span className="text-sm">
          {entityLabels[l.entityType] || l.entityType || l.entity || ""} {l.entityId ? `#${l.entityId}` : ""}
        </span>
      ),
    },
    {
      key: "details",
      header: "Detalles",
      render: (l: any) => {
        const details = l.details ?? l.metadata ?? l.changes;
        if (!details) return <span className="text-xs text-muted-foreground">-</span>;
        const text =
          typeof details === "string" ? details : JSON.stringify(details, null, 2);
        return (
          <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
              Ver detalles
            </summary>
            <pre className="mt-1 max-h-32 overflow-auto rounded bg-muted p-2 text-xs whitespace-pre-wrap">
              {text}
            </pre>
          </details>
        );
      },
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
        <h1 className="text-3xl font-bold tracking-tight">Auditoría</h1>
        <p className="text-muted-foreground">Registro de actividad en la plataforma</p>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        emptyMessage="No hay registros de auditoría"
      />
    </div>
  );
}
