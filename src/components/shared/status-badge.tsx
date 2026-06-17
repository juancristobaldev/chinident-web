"use client";

import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "active" | "inactive" | string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-red-100 text-red-800",
  true: "bg-green-100 text-green-800",
  false: "bg-red-100 text-red-800",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const key = typeof status === "boolean" ? String(status) : status.toLowerCase();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        statusStyles[key] || "bg-gray-100 text-gray-800",
        className
      )}
    >
      {key === "active" || key === "true" ? "Activo" : "Inactivo"}
    </span>
  );
}
