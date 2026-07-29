"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Stethoscope, UserCheck, Calendar, DollarSign, Activity } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";

interface AdminStats {
  activeClinics: number;
  totalUsers: number;
  totalDentists: number;
  totalPatients: number;
  monthlyAppointments: number;
  monthlyRevenue: number;
  topClinics: { id: string; name: string; _count: { patients: number; appointments: number } }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<AdminStats>("/admin/stats")
      .then(setStats)
      .catch(() => toast.error("No se pudieron cargar las estadísticas"))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { title: "Clínicas Activas", value: stats?.activeClinics ?? 0, icon: Building2, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Usuarios Totales", value: stats?.totalUsers ?? 0, icon: Users, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { title: "Dentistas", value: stats?.totalDentists ?? 0, icon: Stethoscope, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Pacientes", value: stats?.totalPatients ?? 0, icon: UserCheck, color: "text-amber-500", bg: "bg-amber-500/10" },
    { title: "Atenciones (mes)", value: stats?.monthlyAppointments ?? 0, icon: Calendar, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Ingresos (mes)", value: stats?.monthlyRevenue ? `$${stats.monthlyRevenue.toLocaleString("es-CL")}` : "$0", icon: DollarSign, color: "text-green-600", bg: "bg-green-600/10" },
  ];

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div>
          <div className="h-10 w-48 bg-muted rounded-md mb-2"></div>
          <div className="h-5 w-64 bg-muted rounded-md"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border-border/50 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="h-4 w-24 bg-muted rounded"></div>
                <div className="h-8 w-8 bg-muted rounded-xl"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted rounded mt-2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            Dashboard <Activity className="h-6 w-6 text-primary" />
          </h1>
          <p className="text-muted-foreground mt-1">Vista general del rendimiento de la plataforma.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ title, value, icon: Icon, color, bg }) => (
          <Card key={title} className="border-border/50 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
            <div className={`absolute right-0 top-0 h-full w-1 ${bg} opacity-50`} />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">{title}</CardTitle>
              <div className={`p-2 rounded-xl ${bg} group-hover:scale-110 transition-transform`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {stats?.topClinics && stats.topClinics.length > 0 && (
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              Top Clínicas
              <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-semibold">Mayor volumen</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {stats.topClinics.map((clinic, i) => (
                <div key={clinic.id} className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {i + 1}
                    </div>
                    <div>
                      <span className="font-semibold block">{clinic.name}</span>
                      <span className="text-xs text-muted-foreground">ID: {clinic.id.split('-')[0]}</span>
                    </div>
                  </div>
                  <div className="flex gap-6 text-sm text-muted-foreground">
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-foreground">{clinic._count.patients}</span>
                      <span className="text-xs">Pacientes</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-foreground">{clinic._count.appointments}</span>
                      <span className="text-xs">Atenciones</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
