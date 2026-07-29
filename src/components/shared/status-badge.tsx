"use client";

import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "active" | "inactive" | string;
  className?: string;
}

const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: "bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  inactive: { bg: "bg-rose-500/10", text: "text-rose-700 dark:text-rose-400", dot: "bg-rose-500" },
  true: { bg: "bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  false: { bg: "bg-rose-500/10", text: "text-rose-700 dark:text-rose-400", dot: "bg-rose-500" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const key = typeof status === "boolean" ? String(status) : status.toLowerCase();
  const style = statusStyles[key] || { bg: "bg-slate-500/10", text: "text-slate-700", dot: "bg-slate-500" };
  const isActive = key === "active" || key === "true";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide border border-transparent shadow-sm",
        style.bg,
        style.text,
        isActive && "border-emerald-500/20",
        !isActive && "border-rose-500/20",
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        {isActive && (
          <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", style.dot)}></span>
        )}
        <span className={cn("relative inline-flex rounded-full h-2 w-2", style.dot)}></span>
      </span>
      {isActive ? "Activo" : "Inactivo"}
    </span>
  );
}
