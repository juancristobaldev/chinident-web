"use client";

import { useState, useMemo } from "react";
import {
  PERMANENT_TEETH_UPPER_RIGHT, PERMANENT_TEETH_UPPER_LEFT,
  PERMANENT_TEETH_LOWER_RIGHT, PERMANENT_TEETH_LOWER_LEFT,
  PROCEDURE_COLORS, TOOTH_NAMES,
  type OdontogramItem, type ToothSurface, type DentalProcedure,
} from "./odontogram-types";
import { PROCEDURE_LABELS } from "./odontogram-types";

const TOOTH_W = 38;
const TOOTH_H = 38;
const GAP = 4;

interface OdontogramProps {
  items: OdontogramItem[];
  onSurfaceClick: (toothCode: number, surface: ToothSurface, existing?: OdontogramItem) => void;
  onToothRightClick?: (toothCode: number) => void;
  selectedProcedure?: DentalProcedure;
  showDeciduous?: boolean;
}

export function OdontogramSVG({
  items,
  onSurfaceClick,
  onToothRightClick,
  selectedProcedure,
  showDeciduous = false,
}: OdontogramProps) {
  const [hoveredTooth, setHoveredTooth] = useState<number | null>(null);
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);

  const itemsByTooth = useMemo(() => {
    const map = new Map<number, OdontogramItem[]>();
    for (const item of items) {
      const list = map.get(item.toothCode) || [];
      list.push(item);
      map.set(item.toothCode, list);
    }
    return map;
  }, [items]);

  const getItemOnSurface = (toothCode: number, surface: ToothSurface) =>
    itemsByTooth.get(toothCode)?.find((i) => i.surface === surface);

  const upperTeeth = showDeciduous
    ? ([] as number[])
    : [...PERMANENT_TEETH_UPPER_RIGHT, ...PERMANENT_TEETH_UPPER_LEFT];

  const lowerTeeth = showDeciduous
    ? ([] as number[])
    : [...PERMANENT_TEETH_LOWER_LEFT, ...PERMANENT_TEETH_LOWER_RIGHT];

  const calcX = (index: number) => index * (TOOTH_W + GAP);
  const totalWidth = Math.max(upperTeeth.length, lowerTeeth.length) * (TOOTH_W + GAP);

  const handleSurfaceClick = (
    toothCode: number,
    surface: ToothSurface,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    const existing = getItemOnSurface(toothCode, surface);
    onSurfaceClick(toothCode, surface, existing);
  };

  const handleToothRightClick = (toothCode: number, e: React.MouseEvent) => {
    e.preventDefault();
    onToothRightClick?.(toothCode);
  };

  const renderSurface = (
    toothCode: number,
    surface: ToothSurface,
    x: number,
    y: number,
    w: number,
    h: number,
    label?: string
  ) => {
    const item = getItemOnSurface(toothCode, surface);
    const colors = item ? PROCEDURE_COLORS[item.procedure] : null;

    return (
      <g key={`${toothCode}-${surface}`}>
        <rect
          x={x} y={y} width={w} height={h}
          fill={colors?.fill || "#FFFFFF"}
          stroke={colors?.stroke || "#D1D5DB"}
          strokeWidth={item ? 1.5 : 0.5}
          rx={1}
          onClick={(e) => handleSurfaceClick(toothCode, surface, e)}
          style={{ cursor: selectedProcedure ? "crosshair" : "pointer" }}
        />
        {label && (
          <text
            x={x + w / 2} y={y + h / 2 + 1}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={7}
            fill={colors?.stroke || "#9CA3AF"}
            pointerEvents="none"
          >
            {label}
          </text>
        )}
      </g>
    );
  };

  const renderTooth = (toothCode: number, x: number, y: number, isUpper: boolean) => {
    const isSelected = selectedTooth === toothCode;
    const isHovered = hoveredTooth === toothCode;
    const hasItems = itemsByTooth.has(toothCode);

    const areaX = x + 2;
    const areaY = y + 3;
    const areaW = TOOTH_W - 4;
    const areaH = TOOTH_H - 6;

    const midX = areaX + areaW / 2;
    const midY = areaY + areaH / 2;
    const thirdW = areaW / 3;
    const thirdH = areaH / 3;

    return (
      <g
        key={toothCode}
        onMouseEnter={() => setHoveredTooth(toothCode)}
        onMouseLeave={() => setHoveredTooth(null)}
        onClick={() => setSelectedTooth(isSelected ? null : toothCode)}
        onContextMenu={(e) => handleToothRightClick(toothCode, e)}
      >
        {/* Outer border */}
        <rect
          x={x} y={y} width={TOOTH_W} height={TOOTH_H}
          fill={hasItems ? "#F8FAFC" : "#FFFFFF"}
          stroke={isSelected ? "#3B82F6" : isHovered ? "#93C5FD" : "#E5E7EB"}
          strokeWidth={isSelected ? 2 : 1}
          rx={4}
        />

        {/* Tooth number */}
        <text
          x={x + TOOTH_W / 2} y={y + TOOTH_H - 4}
          textAnchor="middle"
          fontSize={9}
          fill={isSelected ? "#3B82F6" : "#9CA3AF"}
          fontWeight={isSelected ? "bold" : "normal"}
          pointerEvents="none"
        >
          {toothCode}
        </text>

        {/* Surfaces */}
        <g>
          {/* Vestibular - bottom for upper, top for lower */}
          {isUpper ? (
            renderSurface(toothCode, "VESTIBULAR", areaX, areaY + 2 * thirdH, areaW, thirdH, "V")
          ) : (
            renderSurface(toothCode, "VESTIBULAR", areaX, areaY, areaW, thirdH, "V")
          )}

          {/* Lingual - top for upper, bottom for lower */}
          {isUpper ? (
            renderSurface(toothCode, "LINGUAL", areaX, areaY, areaW, thirdH, "L")
          ) : (
            renderSurface(toothCode, "LINGUAL", areaX, areaY + 2 * thirdH, areaW, thirdH, "L")
          )}

          {/* Middle row: Mesial - Oclusal - Distal */}
          {renderSurface(toothCode, "MESIAL", areaX, areaY + thirdH, thirdW, thirdH, "M")}
          {renderSurface(toothCode, "OCLUSAL", areaX + thirdW, areaY + thirdH, thirdW, thirdH, "O")}
          {renderSurface(toothCode, "DISTAL", areaX + 2 * thirdW, areaY + thirdH, thirdW, thirdH, "D")}
        </g>
      </g>
    );
  };

  const renderArch = (teeth: number[], y: number, isUpper: boolean) => (
    <g>
      {teeth.map((toothCode, i) =>
        renderTooth(toothCode, calcX(i), y, isUpper)
      )}
    </g>
  );

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${totalWidth} 220`}
        className="w-full max-w-3xl"
        style={{ maxHeight: "220px" }}
      >
        {/* Upper arch label */}
        <text x={totalWidth / 2} y={10} textAnchor="middle" fontSize={11} fill="#6B7280" fontWeight={500}>
          Arcada Superior
        </text>

        {/* Upper teeth */}
        {renderArch(upperTeeth, 18, true)}

        {/* Lower arch label */}
        <text x={totalWidth / 2} y={124} textAnchor="middle" fontSize={11} fill="#6B7280" fontWeight={500}>
          Arcada Inferior
        </text>

        {/* Lower teeth */}
        {renderArch(lowerTeeth, 132, false)}
      </svg>

      {/* Tooltip */}
      {hoveredTooth && (
        <div className="absolute top-0 right-0 rounded-md border bg-white px-2 py-1 text-xs shadow-sm">
          <span className="font-medium">{hoveredTooth}</span>
          <span className="text-muted-foreground ml-1">{TOOTH_NAMES[hoveredTooth] || ""}</span>
          {itemsByTooth.has(hoveredTooth) && (
            <div className="mt-0.5 flex flex-wrap gap-0.5">
              {itemsByTooth.get(hoveredTooth)!.map((item, i) => (
                <span
                  key={i}
                  className="inline-block rounded px-1 py-px text-[9px]"
                  style={{
                    backgroundColor: PROCEDURE_COLORS[item.procedure].fill,
                    color: PROCEDURE_COLORS[item.procedure].stroke,
                    border: `1px solid ${PROCEDURE_COLORS[item.procedure].stroke}`,
                  }}
                >
                  {PROCEDURE_LABELS[item.procedure]}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
