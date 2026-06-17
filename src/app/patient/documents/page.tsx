"use client";

import { useEffect, useState } from "react";
import { Download, ExternalLink, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Attachment } from "@/types";

const FILE_TYPE_LABELS: Record<Attachment["fileType"], string> = {
  IMAGE: "Imagen",
  XRAY: "Radiografía",
  DOCUMENT: "Documento",
  PRESCRIPTION: "Receta",
};

function formatFileSize(bytes: number) {
  if (!bytes) return "Sin tamaño";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PatientDocumentsPage() {
  const [documents, setDocuments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Attachment[]>("/attachments/me")
      .then(setDocuments)
      .catch(() => {
        toast.error("Error al cargar documentos");
        setDocuments([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Spinner className="h-8 w-8" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mis Documentos</h1>
        <p className="text-muted-foreground">Radiografías, recetas, informes y documentos compartidos por tu clínica</p>
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Aún no tienes documentos disponibles.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {documents.map((document) => (
            <Card key={document.id}>
              <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{document.fileName}</p>
                    <p className="text-sm text-muted-foreground">
                      {FILE_TYPE_LABELS[document.fileType]} · {formatFileSize(document.fileSize)} · {formatDate(document.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => window.open(document.fileUrl, "_blank")}>
                    <ExternalLink className="mr-2 h-4 w-4" /> Ver
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href={document.fileUrl} download><Download className="mr-2 h-4 w-4" /> Descargar</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
