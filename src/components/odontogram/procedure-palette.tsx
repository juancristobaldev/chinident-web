"use client";

import { cn } from "@/lib/utils";
import { PROCEDURE_COLORS, PROCEDURE_LABELS, type DentalProcedure } from "./odontogram-types";
import { Button } from "../ui/button";
import { Eraser } from "lucide-react";

interface ProcedurePaletteProps {
  selected: DentalProcedure | undefined;
  onSelect: (proc: DentalProcedure | undefined) => void;
}

export function ProcedurePalette({ selected, onSelect }: ProcedurePaletteProps) {
  const procedures = Object.keys(PROCEDURE_COLORS) as DentalProcedure[];

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Button
        variant={!selected ? "default" : "outline"}
        size="sm"
        onClick={() => onSelect(undefined)}
        className="h-8 text-xs"
      >
        <Eraser className="mr-1 h-3 w-3" />
        Ninguno
      </Button>
      {procedures.map((proc) => (
        <button
          key={proc}
          onClick={() => onSelect(proc)}
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium border transition-colors h-7",
            selected === proc
              ? "ring-2 ring-offset-1"
              : "hover:opacity-80"
          )}
          style={{
            backgroundColor: PROCEDURE_COLORS[proc].fill,
            borderColor: PROCEDURE_COLORS[proc].stroke,
            color: PROCEDURE_COLORS[proc].stroke,
          }}
        >
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: PROCEDURE_COLORS[proc].stroke }}
          />
          {PROCEDURE_LABELS[proc]}
        </button>
      ))}
    </div>
  );
}

interface OdontogramLegendProps {
  onProcedureClick?: (proc: DentalProcedure) => void;
}

export function OdontogramLegend({ onProcedureClick }: OdontogramLegendProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(PROCEDURE_COLORS).map(([key, colors]) => (
        <button
          key={key}
          onClick={() => onProcedureClick?.(key as DentalProcedure)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <span
            className="inline-block h-3 w-3 rounded-sm border"
            style={{
              backgroundColor: colors.fill,
              borderColor: colors.stroke,
            }}
          />
          {PROCEDURE_LABELS[key as DentalProcedure]}
        </button>
      ))}
    </div>
  );
}
