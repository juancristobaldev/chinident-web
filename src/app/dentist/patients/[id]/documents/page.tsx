"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Download, ExternalLink, FileText, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const INITIAL_FORM = {
  fileName: "",
  fileUrl: "",
  fileType: "DOCUMENT" as Attachment["fileType"],
  fileSize: "0",
};

function formatFileSize(bytes: number) {
  if (!bytes) return "Sin tamaño";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsPage() {
  const { id } = useParams<{ id: string }>();
  const [documents, setDocuments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);

  const fetchDocuments = useCallback(async () => {
    try {
      const data = await api.get<Attachment[]>(`/attachments/patient/${id}`);
      setDocuments(data);
    } catch {
      toast.error("Error al cargar documentos");
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.post("/attachments", {
        patientId: id,
        fileName: form.fileName,
        fileUrl: form.fileUrl,
        fileType: form.fileType,
        fileSize: Number(form.fileSize) || 0,
      });
      toast.success("Documento agregado");
      setForm(INITIAL_FORM);
      setDialogOpen(false);
      fetchDocuments();
    } catch {
      toast.error("Error al guardar documento");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    try {
      await api.delete(`/attachments/${documentId}`);
      toast.success("Documento eliminado");
      fetchDocuments();
    } catch {
      toast.error("Error al eliminar documento");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Spinner className="h-8 w-8" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documentos</h1>
          <p className="text-muted-foreground">Archivos clínicos y administrativos del paciente</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Nuevo documento</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar documento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="fileName">Nombre *</Label>
                <Input id="fileName" required value={form.fileName} onChange={(e) => setForm({ ...form, fileName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fileUrl">URL del archivo *</Label>
                <Input id="fileUrl" required type="url" value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} placeholder="https://..." />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fileType">Tipo</Label>
                  <select
                    id="fileType"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.fileType}
                    onChange={(e) => setForm({ ...form, fileType: e.target.value as Attachment["fileType"] })}
                  >
                    {Object.entries(FILE_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fileSize">Tamaño en bytes</Label>
                  <Input id="fileSize" type="number" min="0" value={form.fileSize} onChange={(e) => setForm({ ...form, fileSize: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={saving}>{saving ? <Spinner className="mr-2" /> : null} Guardar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No hay documentos registrados para este paciente.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {documents.map((document) => (
            <Card key={document.id}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-start gap-3 text-base">
                  <FileText className="mt-0.5 h-5 w-5 text-primary" />
                  <span className="line-clamp-2">{document.fileName}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>{FILE_TYPE_LABELS[document.fileType]}</p>
                  <p>{formatFileSize(document.fileSize)}</p>
                  <p>Subido el {formatDate(document.createdAt)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => window.open(document.fileUrl, "_blank")}> <ExternalLink className="mr-2 h-4 w-4" /> Ver</Button>
                  <Button variant="outline" size="sm" asChild><a href={document.fileUrl} download><Download className="mr-2 h-4 w-4" /> Descargar</a></Button>
                  <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleDelete(document.id)}><Trash2 className="mr-2 h-4 w-4" /> Eliminar</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
