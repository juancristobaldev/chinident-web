"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { DayView, type CalendarAppointment } from "@/components/calendar/appointment-calendar";
import { toast } from "sonner";

interface DailySummary {
  date: string;
  byStatus: {
    total: number;
    RESERVADA: number;
    CONFIRMADA: number;
    EN_ATENCION: number;
    FINALIZADA: number;
    CANCELADA: number;
    NO_ASISTIO: number;
  };
  appointments: CalendarAppointment[];
}

type PatientOption = { id: string; displayName?: string; firstName?: string; lastName?: string; rut?: string; user?: { firstName?: string; lastName?: string } };
type LocaleOption = { id: string; name: string };

const EMPTY_FORM = { patientId: "", localeId: "", startTime: "", endTime: "", type: "", notes: "" };

function toDateTimeInput(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export default function DentistAgendaPage() {
  const router = useRouter();
  const [date, setDate] = useState(new Date());
  const [summary, setSummary] = useState<DailySummary["byStatus"] | null>(null);
  const [appointments, setAppointments] = useState<CalendarAppointment[]>([]);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [locales, setLocales] = useState<LocaleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarAppointment | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchData = async (d: Date) => {
    setLoading(true);
    try {
      const dateStr = d.toISOString();
      const [sum, apps] = await Promise.all([
        api.get<DailySummary>(`/appointments/summary/${d.toISOString().split("T")[0]}`),
        api.get<CalendarAppointment[]>(`/appointments?date=${dateStr}&view=day`),
      ]);
      setSummary(sum.byStatus);
      setAppointments(apps);
    } catch {
      setSummary(null);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(date);
  }, [date]);

  useEffect(() => {
    Promise.all([
      api.get<PatientOption[]>("/patients"),
      api.get<LocaleOption[]>("/locales"),
    ]).then(([patientsData, localesData]) => {
      setPatients(patientsData);
      setLocales(localesData);
    }).catch(() => toast.error("Error al cargar datos para agendar"));
  }, []);

  const pending = (summary?.RESERVADA ?? 0) + (summary?.CONFIRMADA ?? 0);
  const attended = (summary?.FINALIZADA ?? 0);

  const getPatientLabel = (patient: PatientOption) => (
    patient.displayName || `${patient.firstName || patient.user?.firstName || ""} ${patient.lastName || patient.user?.lastName || ""}`.trim() || "Paciente"
  );

  const openCreate = (hour?: number) => {
    const start = new Date(date);
    start.setHours(hour ?? 9, 0, 0, 0);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + 60);
    setEditing(null);
    setForm({ ...EMPTY_FORM, localeId: locales[0]?.id || "", startTime: toDateTimeInput(start), endTime: toDateTimeInput(end) });
    setDialogOpen(true);
  };

  const openEdit = (appointment: CalendarAppointment) => {
    setEditing(appointment);
    setForm({
      patientId: appointment.patient.id,
      localeId: appointment.locale?.id || "",
      startTime: toDateTimeInput(new Date(appointment.startTime)),
      endTime: toDateTimeInput(new Date(appointment.endTime)),
      type: appointment.type || "",
      notes: appointment.notes || "",
    });
    setDialogOpen(true);
  };

  const saveAppointment = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/appointments/${editing.id}`, {
          localeId: form.localeId,
          startTime: new Date(form.startTime).toISOString(),
          endTime: new Date(form.endTime).toISOString(),
          type: form.type || undefined,
          notes: form.notes || undefined,
        });
        toast.success("Cita actualizada");
      } else {
        await api.post("/appointments", {
          patientId: form.patientId,
          localeId: form.localeId,
          startTime: new Date(form.startTime).toISOString(),
          endTime: new Date(form.endTime).toISOString(),
          type: form.type || undefined,
          notes: form.notes || undefined,
        });
        toast.success("Cita creada");
      }
      setDialogOpen(false);
      fetchData(date);
    } catch (error: any) {
      toast.error(error.message || "Error al guardar cita");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
          <p className="text-muted-foreground">Gestiona tus citas del día</p>
        </div>
        <Button onClick={() => openCreate()}>Nueva cita</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Hoy</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.total ?? "-"}</div>
            <p className="text-xs text-muted-foreground">citas programadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "-" : pending}</div>
            <p className="text-xs text-muted-foreground">por confirmar o atender</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Atendidos</CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "-" : attended}</div>
            <p className="text-xs text-muted-foreground">hoy</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="h-6 w-6" />
            </div>
          ) : (
            <DayView
              date={date}
              appointments={appointments}
              onPrev={() => setDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1))}
              onNext={() => setDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1))}
              onToday={() => setDate(new Date())}
              onAppointmentClick={(apt) => router.push(`/dentist/patients/${apt.patient.id}`)}
              onCreateClick={openCreate}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Editar cita" : "Nueva cita"}</DialogTitle></DialogHeader>
          <form className="space-y-4" onSubmit={saveAppointment}>
            {!editing && (
              <div className="space-y-2">
                <Label>Paciente</Label>
                <select required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}>
                  <option value="">Selecciona paciente</option>
                  {patients.map((p) => <option key={p.id} value={p.id}>{getPatientLabel(p)}{p.rut ? ` · ${p.rut}` : ""}</option>)}
                </select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Local</Label>
              <select required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.localeId} onChange={(e) => setForm({ ...form, localeId: e.target.value })}>
                <option value="">Selecciona local</option>
                {locales.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Inicio</Label><Input required type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} /></div>
              <div className="space-y-2"><Label>Término</Label><Input required type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Tipo</Label><Input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} /></div>
            <div className="space-y-2"><Label>Notas</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving}>{saving ? <Spinner className="mr-2" /> : null} Guardar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
