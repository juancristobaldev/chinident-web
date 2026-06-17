export type DentitionType = "permanent" | "temporal";
export type Quadrant = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type FaceId = "O" | "V" | "M" | "D" | "P" | "L";
export type StatusColor = "red" | "blue" | "green" | "black" | "yellow" | "gray" | "none";
export type TreatmentScope = "tooth" | "face" | "root";

export interface DiagnosisCatalogItem {
  id: string;
  name: string;
  scope: TreatmentScope;
  defaultColor: StatusColor;
  type: "diagnosis" | "treatment";
  requiresFaces?: boolean;
}

export interface OdontogramRecordData {
  id: string;
  odontogramId: string;
  creatorId: string;
  creatorName: string;
  toothNumber: number;
  faces: string[];
  catalogId: string;
  status: string;
  notes: string | null;
  createdAt: string;
}

export type ClinicalRecord = OdontogramRecordData;

export interface DentalPieceData {
  number: number;
  quadrant: Quadrant;
  type: DentitionType;
  records: OdontogramRecordData[];
}

export interface OdontogramState {
  patientId: string;
  dentition: DentitionType;
  pieces: Record<number, DentalPieceData>;
  history: OdontogramRecordData[];
  selectedTeeth: number[];
  selectedFaces: Record<number, FaceId[]>;
}

export const CLINICAL_CATALOG: Record<string, DiagnosisCatalogItem> = {
  caries: { id: "caries", name: "Caries", scope: "face", defaultColor: "red", type: "diagnosis", requiresFaces: true },
  rest_simple: { id: "rest_simple", name: "Restauración Simple", scope: "face", defaultColor: "blue", type: "treatment", requiresFaces: true },
  rest_existente: { id: "rest_existente", name: "Restauración Antigua", scope: "face", defaultColor: "black", type: "diagnosis", requiresFaces: true },
  extraccion_ind: { id: "extraccion_ind", name: "Extracción Indicada", scope: "tooth", defaultColor: "red", type: "treatment" },
  extraccion_rea: { id: "extraccion_rea", name: "Extracción Realizada", scope: "tooth", defaultColor: "blue", type: "treatment" },
  ausente: { id: "ausente", name: "Ausencia Dentaria", scope: "tooth", defaultColor: "gray", type: "diagnosis" },
  endodoncia_ind: { id: "endodoncia_ind", name: "Endodoncia Indicada", scope: "root", defaultColor: "red", type: "treatment" },
  endodoncia_rea: { id: "endodoncia_rea", name: "Endodoncia Realizada", scope: "root", defaultColor: "blue", type: "treatment" },
  implante: { id: "implante", name: "Implante", scope: "root", defaultColor: "green", type: "treatment" },
  corona: { id: "corona", name: "Corona", scope: "tooth", defaultColor: "blue", type: "treatment" },
  observacion: { id: "observacion", name: "Observación Clínica", scope: "tooth", defaultColor: "yellow", type: "diagnosis" },
  sellante_ind: { id: "sellante_ind", name: "Sellante Indicado", scope: "face", defaultColor: "red", type: "treatment", requiresFaces: true },
  sellante_rea: { id: "sellante_rea", name: "Sellante Realizado", scope: "face", defaultColor: "blue", type: "treatment", requiresFaces: true },
  protesis: { id: "protesis", name: "Prótesis", scope: "tooth", defaultColor: "blue", type: "treatment" },
  puente: { id: "puente", name: "Puente", scope: "tooth", defaultColor: "blue", type: "treatment" },
};

export const COLOR_MAP: Record<StatusColor, string> = {
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#10b981",
  black: "#111827",
  yellow: "#eab308",
  gray: "#9ca3af",
  none: "transparent",
};
