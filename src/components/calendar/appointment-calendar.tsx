"use client";

import { cn } from "@/lib/utils";
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Button } from "../ui/button";

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7:00 - 20:00
const STATUS_COLORS: Record<string, string> = {
  RESERVADA: "bg-blue-100 border-blue-300 text-blue-800",
  CONFIRMADA: "bg-green-100 border-green-300 text-green-800",
  EN_ATENCION: "bg-amber-100 border-amber-300 text-amber-800",
  FINALIZADA: "bg-gray-100 border-gray-300 text-gray-800",
  CANCELADA: "bg-red-100 border-red-300 text-red-800 line-through",
  NO_ASISTIO: "bg-red-100 border-red-300 text-red-800",
};
const STATUS_LABELS: Record<string, string> = {
  RESERVADA: "Reservada",
  CONFIRMADA: "Confirmada",
  EN_ATENCION: "En atención",
  FINALIZADA: "Finalizada",
  CANCELADA: "Cancelada",
  NO_ASISTIO: "No asistió",
};

export interface CalendarAppointment {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  type?: string;
  notes?: string;
  patient: { id: string; firstName?: string; lastName?: string; rut?: string; user?: { firstName?: string; lastName?: string } };
  dentist?: { id: string; firstName: string; lastName: string };
  locale?: { id: string; name: string };
  box?: { id: string; name: string } | null;
}

interface DayViewProps {
  date: Date;
  appointments: CalendarAppointment[];
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onAppointmentClick: (apt: CalendarAppointment) => void;
  onCreateClick: (hour: number) => void;
}

export function DayView({ date, appointments, onPrev, onNext, onToday, onAppointmentClick, onCreateClick }: DayViewProps) {
  const dayAppointments = appointments.filter((a) => isSameDay(new Date(a.startTime), date));

  const getAppointmentStyle = (apt: CalendarAppointment) => {
    const start = new Date(apt.startTime);
    const end = new Date(apt.endTime);
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();
    const duration = (endMinutes - startMinutes) / 60;

    const topPx = ((startMinutes - 420) / 60) * 64; // 7:00 = 420 mins, each hour = 64px
    const heightPx = duration * 64;

    return { top: `${topPx}px`, height: `${Math.max(heightPx, 28)}px` };
  };

  const getPatientName = (apt: CalendarAppointment) => {
    const p = apt.patient;
    return p.firstName || p.user?.firstName || "Paciente";
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onPrev}><ChevronLeft className="h-4 w-4" /></Button>
          <h2 className="text-lg font-semibold min-w-[200px] text-center">
            {format(date, "EEEE d 'de' MMMM", { locale: es })}
            {isToday(date) && <span className="ml-2 text-sm font-normal text-primary">· Hoy</span>}
          </h2>
          <Button variant="outline" size="sm" onClick={onNext}><ChevronRight className="h-4 w-4" /></Button>
        </div>
        <Button variant="ghost" size="sm" onClick={onToday}>Hoy</Button>
      </div>

      <div className="rounded-lg border bg-white">
        <div className="relative" style={{ height: `${14 * 64}px` }}>
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="absolute left-0 right-0 border-t border-gray-100"
              style={{ top: `${(hour - 7) * 64}px` }}
            >
              <span className="absolute -top-3 left-14 text-xs text-muted-foreground">
                {hour}:00
              </span>
              <button
                type="button"
                className="absolute left-24 right-2 top-1 h-14 rounded-md border border-dashed border-transparent text-left text-xs text-muted-foreground opacity-0 transition hover:border-primary/30 hover:bg-primary/5 hover:px-2 hover:opacity-100"
                onClick={() => onCreateClick(hour)}
              >
                Agendar a las {hour}:00
              </button>
            </div>
          ))}
          <div className="absolute left-12 right-2 top-0">
            {dayAppointments.map((apt) => {
              const style = getAppointmentStyle(apt);
              return (
                <button
                  key={apt.id}
                  className={cn(
                    "absolute left-0 right-0 rounded-md border px-2 py-0.5 text-left text-xs cursor-pointer hover:opacity-80 transition-opacity overflow-hidden",
                    STATUS_COLORS[apt.status] || STATUS_COLORS.RESERVADA
                  )}
                  style={style}
                  onClick={() => onAppointmentClick(apt)}
                >
                  <p className="font-medium truncate">{getPatientName(apt)}</p>
                  <p className="truncate opacity-75">
                    {format(new Date(apt.startTime), "HH:mm")} - {format(new Date(apt.endTime), "HH:mm")}
                    {apt.type && ` · ${apt.type}`}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

interface WeekViewProps {
  date: Date;
  appointments: CalendarAppointment[];
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onAppointmentClick: (apt: CalendarAppointment) => void;
  onDayClick: (date: Date) => void;
}

export function WeekView({ date, appointments, onPrev, onNext, onToday, onAppointmentClick, onDayClick }: WeekViewProps) {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getPatientName = (apt: CalendarAppointment) => {
    const p = apt.patient;
    return p.firstName || p.user?.firstName || "P";
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onPrev}><ChevronLeft className="h-4 w-4" /></Button>
          <h2 className="text-lg font-semibold min-w-[220px] text-center">
            {format(weekStart, "d MMM", { locale: es })} – {format(weekEnd, "d MMM yyyy", { locale: es })}
          </h2>
          <Button variant="outline" size="sm" onClick={onNext}><ChevronRight className="h-4 w-4" /></Button>
        </div>
        <Button variant="ghost" size="sm" onClick={onToday}>Hoy</Button>
      </div>

      <div className="rounded-lg border bg-white overflow-auto">
        <div className="grid grid-cols-7" style={{ minWidth: "700px" }}>
          {days.map((day) => (
            <div key={day.toISOString()} className={cn("border-r last:border-r-0", isToday(day) && "bg-primary/5")}>
              <div className="p-2 text-center border-b cursor-pointer hover:bg-muted/50" onClick={() => onDayClick(day)}>
                <p className="text-xs text-muted-foreground uppercase">
                  {format(day, "EEE", { locale: es })}
                </p>
                <p className={cn("text-lg font-semibold", isToday(day) && "text-primary")}>
                  {format(day, "d")}
                </p>
              </div>
              <div className="p-1 space-y-1" style={{ minHeight: "120px" }}>
                {appointments
                  .filter((a) => isSameDay(new Date(a.startTime), day))
                  .slice(0, 4)
                  .map((apt) => (
                    <button
                      key={apt.id}
                      className={cn(
                        "w-full rounded px-1.5 py-0.5 text-left text-[10px] leading-tight cursor-pointer hover:opacity-80 truncate",
                        STATUS_COLORS[apt.status] || STATUS_COLORS.RESERVADA
                      )}
                      onClick={() => onAppointmentClick(apt)}
                    >
                      <span className="font-medium">
                        {format(new Date(apt.startTime), "HH:mm")}
                      </span>{" "}
                      {getPatientName(apt)}
                    </button>
                  ))}
                {appointments.filter((a) => isSameDay(new Date(a.startTime), day)).length > 4 && (
                  <p className="text-[10px] text-muted-foreground px-1">
                    +{appointments.filter((a) => isSameDay(new Date(a.startTime), day)).length - 4} más
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface MonthViewProps {
  date: Date;
  appointments: CalendarAppointment[];
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onDayClick: (date: Date) => void;
}

export function MonthView({ date, appointments, onPrev, onNext, onToday, onDayClick }: MonthViewProps) {
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  const startDay = new Date(monthStart);
  const dayOfWeek = startDay.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startDay.setDate(startDay.getDate() - diff);

  const weeks: Date[][] = [];
  let current = new Date(startDay);
  while (current <= monthEnd || weeks.length < 6) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onPrev}><ChevronLeft className="h-4 w-4" /></Button>
          <h2 className="text-lg font-semibold min-w-[180px] text-center capitalize">
            {format(date, "MMMM yyyy", { locale: es })}
          </h2>
          <Button variant="outline" size="sm" onClick={onNext}><ChevronRight className="h-4 w-4" /></Button>
        </div>
        <Button variant="ghost" size="sm" onClick={onToday}>Hoy</Button>
      </div>

      <div className="rounded-lg border bg-white overflow-auto">
        <div style={{ minWidth: "700px" }}>
          {["Lun", "Mar", "Mie", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
            <div key={d} className="inline-block w-[14.285%] p-2 text-center text-xs font-medium text-muted-foreground border-b border-r last:border-r-0">
              {d}
            </div>
          ))}
          {weeks.map((week, wi) => (
            <div key={wi}>
              {week.map((day) => {
                const isCurrentMonth = day.getMonth() === date.getMonth();
                const dayAppointments = appointments.filter((a) => isSameDay(new Date(a.startTime), day));
                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "inline-block w-[14.285%] h-24 align-top border-r border-b p-1 overflow-hidden cursor-pointer hover:bg-muted/30",
                      !isCurrentMonth && "opacity-40",
                      isToday(day) && "bg-primary/5"
                    )}
                    onClick={() => onDayClick(day)}
                  >
                    <p className={cn("text-xs mb-0.5", isToday(day) && "font-bold text-primary")}>
                      {format(day, "d")}
                    </p>
                    {dayAppointments.slice(0, 3).map((apt) => (
                      <div
                        key={apt.id}
                        className={cn(
                          "rounded px-1 py-px text-[9px] truncate mb-px",
                          STATUS_COLORS[apt.status] || STATUS_COLORS.RESERVADA
                        )}
                      >
                        {format(new Date(apt.startTime), "HH:mm")} {apt.patient.firstName || apt.patient.user?.firstName || "P"}
                      </div>
                    ))}
                    {dayAppointments.length > 3 && (
                      <p className="text-[9px] text-muted-foreground">+{dayAppointments.length - 3}</p>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { STATUS_COLORS, STATUS_LABELS };
