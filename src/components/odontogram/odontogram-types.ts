export const PERMANENT_TEETH_UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
export const PERMANENT_TEETH_UPPER_LEFT = [21, 22, 23, 24, 25, 26, 27, 28];
export const PERMANENT_TEETH_LOWER_LEFT = [38, 37, 36, 35, 34, 33, 32, 31];
export const PERMANENT_TEETH_LOWER_RIGHT = [41, 42, 43, 44, 45, 46, 47, 48];

export const DECIDUOUS_TEETH_UPPER_RIGHT = [55, 54, 53, 52, 51];
export const DECIDUOUS_TEETH_UPPER_LEFT = [61, 62, 63, 64, 65];
export const DECIDUOUS_TEETH_LOWER_LEFT = [75, 74, 73, 72, 71];
export const DECIDUOUS_TEETH_LOWER_RIGHT = [81, 82, 83, 84, 85];

export type ToothSurface = "MESIAL" | "DISTAL" | "VESTIBULAR" | "LINGUAL" | "OCLUSAL";

export type DentalProcedure =
  | "CARIES"
  | "RESTAURACION"
  | "ENDODONCIA"
  | "EXTRACCION"
  | "CORONA"
  | "IMPLANTE"
  | "SELLANTE"
  | "PROTESIS"
  | "PUENTE";

export type ProcedureStatus = "PENDIENTE" | "EN_PROGRESO" | "COMPLETADO";

export interface OdontogramItem {
  id?: string;
  odontogramId?: string;
  toothCode: number;
  surface: ToothSurface;
  procedure: DentalProcedure;
  status: ProcedureStatus;
  color?: string;
  notes?: string;
}

export const PROCEDURE_COLORS: Record<DentalProcedure, { fill: string; stroke: string }> = {
  CARIES:          { fill: "#FEE2E2", stroke: "#EF4444" },
  RESTAURACION:    { fill: "#DBEAFE", stroke: "#3B82F6" },
  ENDODONCIA:      { fill: "#FEF3C7", stroke: "#F59E0B" },
  EXTRACCION:      { fill: "#1F2937", stroke: "#111827" },
  CORONA:          { fill: "#EDE9FE", stroke: "#8B5CF6" },
  IMPLANTE:        { fill: "#D1FAE5", stroke: "#10B981" },
  SELLANTE:        { fill: "#CFFAFE", stroke: "#06B6D4" },
  PROTESIS:        { fill: "#FCE7F3", stroke: "#EC4899" },
  PUENTE:          { fill: "#E0E7FF", stroke: "#6366F1" },
};

export const PROCEDURE_LABELS: Record<DentalProcedure, string> = {
  CARIES:          "Caries",
  RESTAURACION:    "Restauración",
  ENDODONCIA:      "Endodoncia",
  EXTRACCION:      "Extracción",
  CORONA:          "Corona",
  IMPLANTE:        "Implante",
  SELLANTE:        "Sellante",
  PROTESIS:        "Prótesis",
  PUENTE:          "Puente",
};

export const SURFACE_LABELS: Record<ToothSurface, string> = {
  MESIAL:     "M",
  DISTAL:     "D",
  VESTIBULAR: "V",
  LINGUAL:    "L",
  OCLUSAL:    "O",
};

export const TOOTH_NAMES: Record<number, string> = {
  18: "Tercer Molar", 17: "Segundo Molar", 16: "Primer Molar",
  15: "Segundo Premolar", 14: "Primer Premolar", 13: "Canino",
  12: "Incisivo Lateral", 11: "Incisivo Central",
  21: "Incisivo Central", 22: "Incisivo Lateral", 23: "Canino",
  24: "Primer Premolar", 25: "Segundo Premolar", 26: "Primer Molar",
  27: "Segundo Molar", 28: "Tercer Molar",
  31: "Incisivo Central", 32: "Incisivo Lateral", 33: "Canino",
  34: "Primer Premolar", 35: "Segundo Premolar", 36: "Primer Molar",
  37: "Segundo Molar", 38: "Tercer Molar",
  41: "Incisivo Central", 42: "Incisivo Lateral", 43: "Canino",
  44: "Primer Premolar", 45: "Segundo Premolar", 46: "Primer Molar",
  47: "Segundo Molar", 48: "Tercer Molar",
  55: "Segundo Molar", 54: "Primer Molar", 53: "Canino",
  52: "Incisivo Lateral", 51: "Incisivo Central",
  61: "Incisivo Central", 62: "Incisivo Lateral", 63: "Canino",
  64: "Primer Molar", 65: "Segundo Molar",
  71: "Incisivo Central", 72: "Incisivo Lateral", 73: "Canino",
  74: "Primer Molar", 75: "Segundo Molar",
  81: "Incisivo Central", 82: "Incisivo Lateral", 83: "Canino",
  84: "Primer Molar", 85: "Segundo Molar",
};
