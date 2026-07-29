"use client";

import { cn } from "@/lib/utils";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  emptyMessage = "No se encontraron registros",
  onRowClick,
  isLoading,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="rounded-xl border bg-background shadow-sm overflow-hidden animate-pulse">
        <div className="h-14 bg-muted/20 border-b"></div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex h-16 border-b border-border/50 last:border-0 p-4 px-6 gap-6 items-center">
             <div className="h-4 w-1/4 bg-muted rounded"></div>
             <div className="h-4 w-1/4 bg-muted rounded"></div>
             <div className="h-4 w-1/4 bg-muted rounded"></div>
             <div className="h-4 w-1/4 bg-muted rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-xl border bg-background p-16 text-center text-sm text-muted-foreground shadow-sm flex flex-col items-center justify-center gap-4">
        <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center">
          <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
        </div>
        <span className="font-medium">{emptyMessage}</span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-background shadow-sm overflow-hidden animate-in fade-in duration-500">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/10">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-6 py-4 text-left font-semibold text-muted-foreground tracking-wide",
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {data.map((item, i) => (
              <tr
                key={item.id || i}
                className={cn(
                  "transition-colors hover:bg-muted/30",
                  onRowClick && "cursor-pointer"
                )}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn("px-6 py-4 align-middle", col.className)}>
                    {col.render ? col.render(item) : item[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
