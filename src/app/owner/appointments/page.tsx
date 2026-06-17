"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  DayView,
  WeekView,
  MonthView,
  type CalendarAppointment,
} from "@/components/calendar/appointment-calendar";
import { Calendar, Clock, MapPin, User, Stethoscope } from "lucide-react";
import { toast } from "sonner";

type LocaleOption = { id: string; name: string };
type PatientOption = { id: string; displayName?: string; firstName?: string; lastName?: string; rut?: string; user?: { firstName?: string; lastName?: string } };
type DentistOption = { id: string; user: { id: string; firstName: string; lastName: string } };
type ViewMode = "week" | "day" | "month";
const EMPTY_FORM = { patientId: "", dentistId: "", localeId: "", startTime: "", endTime: "", type: "", notes: "" };

function toDateTimeInput(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export default function OwnerAppointmentsPage() {
  const [locales, setLocales] = useState<LocaleOption[]>([]);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [dentists, setDentists] = useState<DentistOption[]>([]);
  const [selectedLocaleId, setSelectedLocaleId] = useState<string>("");
  const [appointments, setAppointments] = useState<CalendarAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [view, setView] = useState<ViewMode>("week");
  const [date, setDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<CalendarAppointment | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarAppointment | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<LocaleOption[]>("/locales"),
      api.get<PatientOption[]>("/patients"),
      api.get<DentistOption[]>("/dentists"),
    ]).then(([localeData, patientData, dentistData]) => {
      setLocales(localeData);
      setPatients(patientData);
      setDentists(dentistData);
      if (localeData.length > 0) setSelectedLocaleId(localeData[0].id);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedLocaleId) return;
    setAppointmentsLoading(true);
    const dateStr = date.toISOString();
    api.get<CalendarAppointment[]>(`/appointments?date=${dateStr}&view=${view}&localeId=${selectedLocaleId}`)
      .then(setAppointments)
      .catch(() => setAppointments([]))
      .finally(() => setAppointmentsLoading(false));
  }, [selectedLocaleId, date, view]);

  const navigate = (dir: "prev" | "next") => {
    const d = new Date(date);
    if (view === "day") d.setDate(d.getDate() + (dir === "next" ? 1 : -1));
    else if (view === "week") d.setDate(d.getDate() + (dir === "next" ? 7 : -7));
    else d.setMonth(d.getMonth() + (dir === "next" ? 1 : -1));
    setDate(d);
  };

  const handleDayClick = (d: Date) => {
    setDate(d);
    setView("day");
  };

  const getPatientDisplay = (apt: CalendarAppointment) => {
    const p = apt.patient;
    return `${p.firstName || p.user?.firstName || ""} ${p.lastName || p.user?.lastName || ""}`.trim() || "Paciente";
  };

  const getPatientLabel = (patient: PatientOption) => (
    patient.displayName || `${patient.firstName || patient.user?.firstName || ""} ${patient.lastName || patient.user?.lastName || ""}`.trim() || "Paciente"
  );

  const openCreate = (hour?: number) => {
    const start = new Date(date);
    start.setHours(hour ?? 9, 0, 0, 0);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + 60);
    setEditing(null);
    setForm({ ...EMPTY_FORM, localeId: selectedLocaleId || locales[0]?.id || "", dentistId: dentists[0]?.user ? dentists[0].user.id : "", startTime: toDateTimeInput(start), endTime: toDateTimeInput(end) });
    setDialogOpen(true);
  };

  const openEdit = (appointment: CalendarAppointment) => {
    setEditing(appointment);
    setForm({
      patientId: appointment.patient.id,
      dentistId: appointment.dentist?.id || "",
      localeId: appointment.locale?.id || selectedLocaleId,
      startTime: toDateTimeInput(new Date(appointment.startTime)),
      endTime: toDateTimeInput(new Date(appointment.endTime)),
      type: appointment.type || "",
      notes: appointment.notes || "",
    });
    setDialogOpen(true);
  };

  const refreshAppointments = () => {
    if (!selectedLocaleId) return;
    setAppointmentsLoading(true);
    api.get<CalendarAppointment[]>(`/appointments?date=${date.toISOString()}&view=${view}&localeId=${selectedLocaleId}`)
      .then(setAppointments)
      .catch(() => setAppointments([]))
      .finally(() => setAppointmentsLoading(false));
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
      } else {
        await api.post("/appointments", {
          patientId: form.patientId,
          dentistId: form.dentistId,
          localeId: form.localeId,
          startTime: new Date(form.startTime).toISOString(),
          endTime: new Date(form.endTime).toISOString(),
          type: form.type || undefined,
          notes: form.notes || undefined,
        });
      }
      toast.success(editing ? "Cita actualizada" : "Cita creada");
      setDialogOpen(false);
      setSelectedAppointment(null);
      refreshAppointments();
    } catch (error: any) {
      toast.error(error.message || "Error al guardar cita");
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (action: "confirm" | "start" | "attend" | "no-show" | "cancel") => {
    if (!selectedAppointment) return;
    try {
      await api.put(`/appointments/${selectedAppointment.id}/${action}`);
      toast.success("Estado actualizado");
      setSelectedAppointment(null);
      refreshAppointments();
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar estado");
    }
  };

  const tabs: { value: ViewMode; label: string }[] = [
    { value: "week", label: "Semana" },
    { value: "day", label: "Día" },
    { value: "month", label: "Mes" },
  ];

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Spinner className="h-8 w-8" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
          <p className="text-muted-foreground">Vista general de citas por local</p>
        </div>
        <Button onClick={() => openCreate()}>Nueva cita</Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <select
            className="rounded-md border bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            value={selectedLocaleId}
            onChange={(e) => setSelectedLocaleId(e.target.value)}
          >
            {locales.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {tabs.map((t) => (
            <Button
              key={t.value}
              variant={view === t.value ? "default" : "outline"}
              size="sm"
              onClick={() => setView(t.value)}
            >
              {t.label}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {appointmentsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="h-6 w-6" />
            </div>
          ) : view === "day" ? (
            <DayView
              date={date}
              appointments={appointments}
              onPrev={() => navigate("prev")}
              onNext={() => navigate("next")}
              onToday={() => setDate(new Date())}
              onAppointmentClick={setSelectedAppointment}
              onCreateClick={openCreate}
            />
          ) : view === "week" ? (
            <WeekView
              date={date}
              appointments={appointments}
              onPrev={() => navigate("prev")}
              onNext={() => navigate("next")}
              onToday={() => setDate(new Date())}
              onAppointmentClick={setSelectedAppointment}
              onDayClick={handleDayClick}
            />
          ) : (
            <MonthView
              date={date}
              appointments={appointments}
              onPrev={() => navigate("prev")}
              onNext={() => navigate("next")}
              onToday={() => setDate(new Date())}
              onDayClick={handleDayClick}
            />
          )}
        </CardContent>
      </Card>

      {selectedAppointment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Detalle de la cita</span>
              <Button variant="ghost" size="sm" onClick={() => setSelectedAppointment(null)}>
                Cerrar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Paciente</p>
                  <p className="font-medium">{getPatientDisplay(selectedAppointment)}</p>
                  {selectedAppointment.patient.rut && (
                    <p className="text-sm text-muted-foreground">RUT: {selectedAppointment.patient.rut}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Stethoscope className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Dentista</p>
                  <p className="font-medium">
                    {selectedAppointment.dentist
                      ? `${selectedAppointment.dentist.firstName} ${selectedAppointment.dentist.lastName}`
                      : "Sin asignar"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Horario</p>
                  <p className="font-medium">
                    {format(new Date(selectedAppointment.startTime), "EEEE d MMM yyyy", { locale: es })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedAppointment.startTime), "HH:mm")} – {format(new Date(selectedAppointment.endTime), "HH:mm")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Local / Box</p>
                  <p className="font-medium">
                    {selectedAppointment.locale?.name || "-"}
                    {selectedAppointment.box ? ` · Box ${selectedAppointment.box.name}` : ""}
                  </p>
                </div>
              </div>
            </div>
            {selectedAppointment.notes && (
              <div className="rounded-md bg-muted p-3">
                <p className="text-xs text-muted-foreground mb-1">Notas</p>
                <p className="text-sm">{selectedAppointment.notes}</p>
              </div>
            )}
            <div className="flex flex-wrap gap-2 border-t pt-3">
              <Button size="sm" variant="outline" onClick={() => openEdit(selectedAppointment)}>Editar</Button>
              <Button size="sm" variant="outline" onClick={() => changeStatus("confirm")}>Confirmar</Button>
              <Button size="sm" variant="outline" onClick={() => changeStatus("start")}>En atención</Button>
              <Button size="sm" variant="outline" onClick={() => changeStatus("attend")}>Finalizar</Button>
              <Button size="sm" variant="outline" onClick={() => changeStatus("no-show")}>No asistió</Button>
              <Button size="sm" variant="destructive" onClick={() => changeStatus("cancel")}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Editar cita" : "Nueva cita"}</DialogTitle></DialogHeader>
          <form className="space-y-4" onSubmit={saveAppointment}>
            {!editing && (
              <>
                <div className="space-y-2">
                  <Label>Paciente</Label>
                  <select required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}>
                    <option value="">Selecciona paciente</option>
                    {patients.map((p) => <option key={p.id} value={p.id}>{getPatientLabel(p)}{p.rut ? ` · ${p.rut}` : ""}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Dentista</Label>
                  <select required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.dentistId} onChange={(e) => setForm({ ...form, dentistId: e.target.value })}>
                    <option value="">Selecciona dentista</option>
                    {dentists.map((d) => <option key={d.id} value={d.user.id}>Dr. {d.user.firstName} {d.user.lastName}</option>)}
                  </select>
                </div>
              </>
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
