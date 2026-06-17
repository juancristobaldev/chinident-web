"use client";

import React, { useReducer, useMemo, useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { ArrowLeft, Stethoscope, History, Check, X, ShieldAlert, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import {
  type DentitionType,
  type Quadrant,
  type FaceId,
  type StatusColor,
  type ClinicalRecord,
  type DentalPieceData,
  type OdontogramRecordData,
  CLINICAL_CATALOG,
  COLOR_MAP,
  type OdontogramState,
} from "@/components/odontogram/clinical-types";

const getToothArray = (start: number, end: number, reverse = false) => {
  const arr = [];
  for (let i = start; i <= end; i++) arr.push(i);
  return reverse ? arr.reverse() : arr;
};

const PERMA_UPPER_RIGHT = getToothArray(11, 18, true);
const PERMA_UPPER_LEFT = getToothArray(21, 28);
const PERMA_LOWER_RIGHT = getToothArray(41, 48, true);
const PERMA_LOWER_LEFT = getToothArray(31, 38);
const TEMP_UPPER_RIGHT = getToothArray(51, 55, true);
const TEMP_UPPER_LEFT = getToothArray(61, 65);
const TEMP_LOWER_RIGHT = getToothArray(81, 85, true);
const TEMP_LOWER_LEFT = getToothArray(71, 75);

const getAnatomyForTooth = (number: number) => {
  const quad = Math.floor(number / 10);
  const pos = number % 10;
  const isUpper = quad === 1 || quad === 2 || quad === 5 || quad === 6;
  const isRight = quad === 1 || quad === 4 || quad === 5 || quad === 8;

  let rootCanals = 1;
  if (isUpper && pos >= 6) rootCanals = 3;
  else if (!isUpper && pos >= 6) rootCanals = 2;
  else if (isUpper && pos === 4) rootCanals = 2;

  const actualTopFace: FaceId = isUpper ? "V" : "L";
  const actualBottomFace: FaceId = isUpper ? "P" : "V";
  const actualLeftFace: FaceId = isRight ? "D" : "M";
  const actualRightFace: FaceId = isRight ? "M" : "D";

  return { isUpper, rootCanals, facesMap: { top: actualTopFace, bottom: actualBottomFace, left: actualLeftFace, right: actualRightFace, center: "O" } };
};

type Action =
  | { type: "TOGGLE_TOOTH_SELECTION"; payload: { toothNumber: number; multiSelect: boolean } }
  | { type: "TOGGLE_FACE_SELECTION"; payload: { toothNumber: number; face: FaceId; multiSelect: boolean } }
  | { type: "ADD_RECORD"; payload: OdontogramRecordData }
  | { type: "DELETE_RECORD"; payload: { recordId: string } }
  | { type: "SET_DENTITION"; payload: DentitionType }
  | { type: "CLEAR_SELECTION" }
  | { type: "LOAD_RECORDS"; payload: { dentition: DentitionType; records: OdontogramRecordData[] } };

function odontogramReducer(state: OdontogramState, action: Action): OdontogramState {
  switch (action.type) {
    case "SET_DENTITION":
      return { ...state, dentition: action.payload, selectedTeeth: [], selectedFaces: {} };

    case "CLEAR_SELECTION":
      return { ...state, selectedTeeth: [], selectedFaces: {} };

    case "LOAD_RECORDS": {
      const pieces: Record<number, DentalPieceData> = {};
      for (const rec of action.payload.records) {
        if (!pieces[rec.toothNumber]) {
          pieces[rec.toothNumber] = {
            number: rec.toothNumber,
            quadrant: Math.floor(rec.toothNumber / 10) as Quadrant,
            type: rec.toothNumber > 50 ? "temporal" : "permanent",
            records: [],
          };
        }
        pieces[rec.toothNumber].records.push(rec);
      }
      return {
        ...state,
        dentition: action.payload.dentition,
        pieces,
        history: action.payload.records,
        selectedTeeth: [],
        selectedFaces: {},
      };
    }

    case "TOGGLE_TOOTH_SELECTION": {
      const { toothNumber, multiSelect } = action.payload;
      let newSelectedTeeth = [...state.selectedTeeth];
      if (newSelectedTeeth.includes(toothNumber)) {
        newSelectedTeeth = newSelectedTeeth.filter((t) => t !== toothNumber);
      } else {
        newSelectedTeeth = multiSelect ? [...newSelectedTeeth, toothNumber] : [toothNumber];
      }
      return { ...state, selectedTeeth: newSelectedTeeth, selectedFaces: multiSelect ? state.selectedFaces : {} };
    }

    case "TOGGLE_FACE_SELECTION": {
      const { toothNumber, face, multiSelect } = action.payload;
      let newSelectedFaces = { ...state.selectedFaces };
      if (!multiSelect) newSelectedFaces = {};
      if (!newSelectedFaces[toothNumber]) newSelectedFaces[toothNumber] = [];
      if (newSelectedFaces[toothNumber].includes(face)) {
        newSelectedFaces[toothNumber] = newSelectedFaces[toothNumber].filter((f) => f !== face);
        if (newSelectedFaces[toothNumber].length === 0) delete newSelectedFaces[toothNumber];
      } else {
        newSelectedFaces[toothNumber] = [...newSelectedFaces[toothNumber], face];
      }
      let newSelectedTeeth = state.selectedTeeth;
      if (!newSelectedTeeth.includes(toothNumber)) {
        newSelectedTeeth = multiSelect ? [...newSelectedTeeth, toothNumber] : [toothNumber];
      }
      return { ...state, selectedFaces: newSelectedFaces, selectedTeeth: newSelectedTeeth };
    }

    case "ADD_RECORD": {
      const rec = action.payload;
      const toothNum = rec.toothNumber;
      const existing = state.pieces[toothNum] || {
        number: toothNum,
        quadrant: Math.floor(toothNum / 10) as Quadrant,
        type: toothNum > 50 ? "temporal" : "permanent",
        records: [],
      };
      return {
        ...state,
        history: [rec, ...state.history],
        pieces: {
          ...state.pieces,
          [toothNum]: { ...existing, records: [rec, ...existing.records] },
        },
        selectedFaces: {},
        selectedTeeth: [],
      };
    }

    case "DELETE_RECORD": {
      const rid = action.payload.recordId;
      const newHistory = state.history.filter((r) => r.id !== rid);
      const newPieces = { ...state.pieces };
      for (const [key, piece] of Object.entries(newPieces)) {
        const filtered = piece.records.filter((r) => r.id !== rid);
        if (filtered.length === 0) {
          delete newPieces[Number(key)];
        } else {
          newPieces[Number(key)] = { ...piece, records: filtered };
        }
      }
      return { ...state, history: newHistory, pieces: newPieces };
    }

    default:
      return state;
  }
}

const OdontogramContext = React.createContext<{
  state: OdontogramState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

function useOdontogram() {
  const ctx = React.useContext(OdontogramContext);
  if (!ctx) throw new Error("Must be used within OdontogramContext.Provider");
  return ctx;
}

/* ---- VISUAL COMPONENTS ---- */

const ToothRoot = ({ number, records }: { number: number; records: ClinicalRecord[] }) => {
  const { isUpper, rootCanals } = getAnatomyForTooth(number);
  const endoRecord = records.find((r) => r.catalogId.includes("endodoncia"));
  const implantRecord = records.find((r) => r.catalogId === "implante");
  const endoColor = endoRecord ? COLOR_MAP[CLINICAL_CATALOG[endoRecord.catalogId]?.defaultColor || "red"] : null;

  if (implantRecord) {
    return (
      <svg viewBox="0 0 40 60" className={`w-full h-full ${!isUpper ? "rotate-180" : ""}`}>
        <rect x="15" y="5" width="10" height="50" fill="#94a3b8" rx="2" />
        <path d="M 12 15 L 28 15 M 12 25 L 28 25 M 12 35 L 28 35 M 12 45 L 28 45" stroke="#475569" strokeWidth="3" />
        <polygon points="15,55 25,55 20,60" fill="#94a3b8" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 40 60" className={`w-full h-full ${!isUpper ? "rotate-180" : ""}`}>
      <path d="M 5 60 C 5 25, 15 5, 20 2 C 25 5, 35 25, 35 60 Z" fill="white" stroke="#cbd5e1" strokeWidth="2" />
      {endoColor && (
        <g stroke={endoColor} strokeWidth="3" strokeLinecap="round">
          {rootCanals === 1 && <line x1="20" y1="10" x2="20" y2="55" />}
          {rootCanals === 2 && <><line x1="16" y1="15" x2="16" y2="55" /><line x1="24" y1="15" x2="24" y2="55" /></>}
          {rootCanals === 3 && <><line x1="14" y1="20" x2="14" y2="55" /><line x1="20" y1="10" x2="20" y2="55" /><line x1="26" y1="20" x2="26" y2="55" /></>}
        </g>
      )}
    </svg>
  );
};

const CrownFaces = ({ number, records, isSelected, selectedFaces, onFaceClick }: any) => {
  const { facesMap } = getAnatomyForTooth(number);

  const getFaceColor = (faceId: string) => {
    const record = records.find((r: ClinicalRecord) => (r.faces as string[]).includes(faceId));
    if (record) return COLOR_MAP[CLINICAL_CATALOG[record.catalogId]?.defaultColor || "red"];
    return "white";
  };

  const isFaceSelected = (faceId: string) => selectedFaces?.includes(faceId as FaceId);

  const polygons = {
    top: { id: facesMap.top, points: "0,0 100,0 75,25 25,25" },
    bottom: { id: facesMap.bottom, points: "25,75 75,75 100,100 0,100" },
    left: { id: facesMap.left, points: "0,0 25,25 25,75 0,100" },
    right: { id: facesMap.right, points: "100,0 75,25 75,75 100,100" },
    center: { id: facesMap.center, points: "25,25 75,25 75,75 25,75" },
  };

  return (
    <div className={`relative w-10 h-10 transition-transform ${isSelected ? "scale-110" : "hover:scale-105"}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full cursor-pointer">
        {Object.entries(polygons).map(([key, data]) => {
          const fillColor = getFaceColor(data.id);
          const selected = isFaceSelected(data.id);
          return (
            <polygon
              key={key}
              points={data.points}
              fill={fillColor}
              stroke={selected ? "#0ea5e9" : "#64748b"}
              strokeWidth={selected ? 4 : 2}
              className="transition-colors duration-200 hover:opacity-80"
              onClick={(e) => { e.stopPropagation(); onFaceClick(data.id, e.ctrlKey || e.metaKey); }}
            />
          );
        })}
      </svg>
      {records.some((r: ClinicalRecord) => r.catalogId === "corona") && (
        <div className="absolute inset-0 border-4 border-blue-500 rounded-full pointer-events-none" />
      )}
    </div>
  );
};

const Tooth = ({ number }: { number: number }) => {
  const { state, dispatch } = useOdontogram();
  const pieceData = state.pieces[number];
  const records = (pieceData?.records || []) as ClinicalRecord[];
  const isSelected = state.selectedTeeth.includes(number);
  const selectedFaces = state.selectedFaces[number] || [];
  const { isUpper } = getAnatomyForTooth(number);
  const isAbsent = records.some((r) => r.catalogId === "ausente");
  const isExtracted = records.find((r) => r.catalogId.includes("extraccion"));
  const extractionColor = isExtracted ? COLOR_MAP[CLINICAL_CATALOG[isExtracted.catalogId]?.defaultColor || "red"] : null;

  return (
    <div className="flex flex-col items-center mx-[2px] group relative">
      <div
        className={`flex flex-col items-center p-1 rounded-lg transition-all cursor-pointer ${isSelected ? "bg-sky-50 shadow-md ring-1 ring-sky-300" : "hover:bg-gray-50"}`}
        onClick={(e) => dispatch({ type: "TOGGLE_TOOTH_SELECTION", payload: { toothNumber: number, multiSelect: e.ctrlKey || e.metaKey } })}
      >
        <div className={`relative flex flex-col items-center ${isAbsent ? "opacity-30 grayscale" : ""}`}>
          {isUpper && <div className="h-14 w-8 mb-1"><ToothRoot number={number} records={records} /></div>}
          <div className="relative">
            <CrownFaces number={number} records={records} isSelected={isSelected} selectedFaces={selectedFaces} onFaceClick={(face: FaceId, multiSelect: boolean) => dispatch({ type: "TOGGLE_FACE_SELECTION", payload: { toothNumber: number, face, multiSelect } })} />
            {isExtracted && (
              <svg className="absolute -inset-3 w-16 h-16 pointer-events-none z-10" viewBox="0 0 100 100">
                <line x1="20" y1="20" x2="80" y2="80" stroke={extractionColor!} strokeWidth="8" strokeLinecap="round" />
                <line x1="80" y1="20" x2="20" y2="80" stroke={extractionColor!} strokeWidth="8" strokeLinecap="round" />
              </svg>
            )}
          </div>
          <span className={`text-xs font-bold mt-0.5 mb-0.5 ${isSelected ? "text-sky-700" : "text-slate-600"}`}>{number}</span>
          {!isUpper && <div className="h-14 w-8 mt-1"><ToothRoot number={number} records={records} /></div>}
        </div>
      </div>
    </div>
  );
};

const OdontogramGrid = () => {
  const { state } = useOdontogram();
  const isTemp = state.dentition === "temporal";

  const UpperRow = isTemp ? [...TEMP_UPPER_RIGHT, ...TEMP_UPPER_LEFT] : [...PERMA_UPPER_RIGHT, ...PERMA_UPPER_LEFT];
  const LowerRow = isTemp ? [...TEMP_LOWER_RIGHT, ...TEMP_LOWER_LEFT] : [...PERMA_LOWER_RIGHT, ...PERMA_LOWER_LEFT];

  return (
    <div className="flex flex-col items-center w-full p-8 bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="flex justify-between w-full max-w-4xl mb-4 text-xs font-semibold text-slate-400">
        <span>Derecha</span>
        <span>Izquierda</span>
      </div>
      <div className="flex justify-center gap-1 mb-8 w-full max-w-5xl overflow-x-auto pb-4">
        <div className="flex gap-1 pr-4 border-r-2 border-slate-200">
          {UpperRow.slice(0, UpperRow.length / 2).map((num) => <Tooth key={num} number={num} />)}
        </div>
        <div className="flex gap-1 pl-4">
          {UpperRow.slice(UpperRow.length / 2).map((num) => <Tooth key={num} number={num} />)}
        </div>
      </div>
      <div className="flex justify-center gap-1 w-full max-w-5xl overflow-x-auto pb-4">
        <div className="flex gap-1 pr-4 border-r-2 border-slate-200">
          {LowerRow.slice(0, LowerRow.length / 2).map((num) => <Tooth key={num} number={num} />)}
        </div>
        <div className="flex gap-1 pl-4">
          {LowerRow.slice(LowerRow.length / 2).map((num) => <Tooth key={num} number={num} />)}
        </div>
      </div>
    </div>
  );
};

const TreatmentPanel = ({ saving, onApply }: { saving: boolean; onApply: (payload: any) => void }) => {
  const { state, dispatch } = useOdontogram();
  const [selectedCatalog, setSelectedCatalog] = useState("caries");
  const [status, setStatus] = useState<"realized" | "planned">("planned");
  const [notes, setNotes] = useState("");
  const hasSelection = state.selectedTeeth.length > 0;
  const catalogItem = CLINICAL_CATALOG[selectedCatalog];

  const handleApply = () => {
    if (!hasSelection) return;
    for (const toothNumber of state.selectedTeeth) {
      let facesToApply: FaceId[] = [];
      if (catalogItem.requiresFaces) {
        facesToApply = state.selectedFaces[toothNumber] || [];
        if (facesToApply.length === 0) { toast.error(`Seleccione al menos una cara para la pieza ${toothNumber}`); return; }
      }
      onApply({ toothNumber, catalogId: selectedCatalog, status: catalogItem.type === "diagnosis" ? "existing" : status, faces: facesToApply, notes });
    }
    setNotes("");
  };

  return (
    <div className="w-80 bg-slate-50 border-l border-slate-200 p-6 flex flex-col h-full overflow-y-auto shrink-0">
      <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2"><Stethoscope className="w-5 h-5 text-sky-600" />Panel Clínico</h3>
      {!hasSelection ? (
        <div className="flex flex-col items-center justify-center text-center p-6 text-slate-400 bg-slate-100 rounded-lg border border-dashed border-slate-300">
          <ShieldAlert className="w-10 h-10 mb-3 text-slate-300" />
          <p className="text-sm">Seleccione una pieza o cara para comenzar.</p>
        </div>
      ) : (
        <div className="space-y-6 flex-1">
          <div className="bg-white p-3 rounded-lg border border-sky-100 shadow-sm">
            <span className="text-xs font-semibold text-sky-600 uppercase tracking-wider">Selección Activa</span>
            <p className="text-sm font-medium text-slate-700 mt-1">Piezas: {state.selectedTeeth.join(", ")}</p>
            {Object.entries(state.selectedFaces).length > 0 && (
              <p className="text-xs text-slate-500 mt-1">Caras: {Object.entries(state.selectedFaces).map(([k, v]) => `[${k}: ${v.join("")}]`).join(", ")}</p>
            )}
            <button onClick={() => dispatch({ type: "CLEAR_SELECTION" })} className="text-xs text-red-500 hover:text-red-700 mt-2 flex items-center gap-1"><X className="w-3 h-3" /> Limpiar selección</button>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Diagnóstico / Tratamiento</label>
            <select value={selectedCatalog} onChange={(e) => setSelectedCatalog(e.target.value)} className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-sky-500 focus:ring-sky-500 h-10 px-3 bg-white border">
              <optgroup label="Diagnósticos">
                {Object.values(CLINICAL_CATALOG).filter((c) => c.type === "diagnosis").map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </optgroup>
              <optgroup label="Tratamientos">
                {Object.values(CLINICAL_CATALOG).filter((c) => c.type === "treatment").map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </optgroup>
            </select>
          </div>
          {catalogItem.type === "treatment" && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Estado</label>
              <div className="flex gap-2">
                <button onClick={() => setStatus("planned")} className={`flex-1 py-1.5 text-xs font-medium rounded border ${status === "planned" ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>Planificado</button>
                <button onClick={() => setStatus("realized")} className={`flex-1 py-1.5 text-xs font-medium rounded border ${status === "realized" ? "bg-red-50 border-red-200 text-red-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>Realizado</button>
              </div>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Observaciones</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-sky-500 focus:ring-sky-500 resize-none p-2 border" placeholder="Añadir nota clínica..." />
          </div>
          <button onClick={handleApply} disabled={saving} className="w-full bg-sky-600 hover:bg-sky-700 text-white font-medium py-2 px-4 rounded-md shadow flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
            {saving ? <Spinner className="h-4 w-4" /> : <Plus className="w-4 h-4" />} Registrar en Historial
          </button>
        </div>
      )}
    </div>
  );
};

const HistoryTable = ({ onDelete }: { onDelete: (recordId: string) => void }) => {
  const { state } = useOdontogram();

  return (
    <div className="mt-6 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2"><History className="w-5 h-5 text-slate-500" />Historial Clínico</h3>
        <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-1 rounded-full">{state.history.length} registros</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-white border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Fecha</th>
              <th className="px-5 py-3 font-semibold">Pieza</th>
              <th className="px-5 py-3 font-semibold">Caras</th>
              <th className="px-5 py-3 font-semibold">Diagnóstico/Tratamiento</th>
              <th className="px-5 py-3 font-semibold">Estado</th>
              <th className="px-5 py-3 font-semibold">Profesional</th>
              <th className="px-5 py-3 font-semibold"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {state.history.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-400">No hay registros clínicos.</td></tr>
            ) : (
              state.history.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 whitespace-nowrap text-xs">{new Date(record.createdAt).toLocaleString()}</td>
                  <td className="px-5 py-3 font-medium text-slate-800">{record.toothNumber}</td>
                  <td className="px-5 py-3">
                    {record.faces?.length > 0 ? (
                      <span className="inline-flex gap-1">{(record.faces as string[]).map((f) => <span key={f} className="w-5 h-5 flex items-center justify-center bg-slate-100 border border-slate-200 rounded text-xs font-medium">{f}</span>)}</span>
                    ) : "-"}
                  </td>
                  <td className="px-5 py-3 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLOR_MAP[CLINICAL_CATALOG[record.catalogId]?.defaultColor || "gray"] }} />
                    {CLINICAL_CATALOG[record.catalogId]?.name || record.catalogId}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${record.status === "realized" ? "bg-red-100 text-red-700" : record.status === "planned" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"}`}>{record.status.toUpperCase()}</span>
                  </td>
                  <td className="px-5 py-3 text-xs">{record.creatorName}</td>
                  <td className="px-5 py-3">
                    <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700 h-7 w-7 p-0" onClick={() => onDelete(record.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ---- MAIN PAGE ---- */

export default function OdontogramPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [state, dispatch] = useReducer(odontogramReducer, {
    patientId: id,
    dentition: "permanent",
    pieces: {},
    history: [],
    selectedTeeth: [],
    selectedFaces: {},
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchOdontogram = useCallback(async () => {
    try {
      const data = await api.get<any>(`/odontogram/${id}`);
      dispatch({
        type: "LOAD_RECORDS",
        payload: {
          dentition: (data.dentition || "permanent") as DentitionType,
          records: data.records || [],
        },
      });
    } catch {
      toast.error("Error al cargar el odontograma");
      dispatch({ type: "LOAD_RECORDS", payload: { dentition: "permanent", records: [] } });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchOdontogram(); }, [fetchOdontogram]);

  const handleApply = async (payload: any) => {
    setSaving(true);
    try {
      const record = await api.post<any>(`/odontogram/${id}/records`, payload);
      dispatch({ type: "ADD_RECORD", payload: record });
      toast.success("Registro clínico guardado");
    } catch (err: any) {
      toast.error(err.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (recordId: string) => {
    try {
      await api.delete(`/odontogram/records/${recordId}`);
      dispatch({ type: "DELETE_RECORD", payload: { recordId } });
      toast.success("Registro eliminado");
    } catch (err: any) {
      toast.error(err.message || "Error al eliminar");
    }
  };

  const setDentition = async (dent: DentitionType) => {
    try {
      await api.put(`/odontogram/${id}/dentition`, { dentition: dent });
      dispatch({ type: "SET_DENTITION", payload: dent });
    } catch {
      toast.error("Error al cambiar dentición");
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner className="h-8 w-8" /></div>;

  return (
    <OdontogramContext.Provider value={{ state, dispatch }}>
      <div className="-m-6 min-h-screen bg-slate-50 flex flex-col">
        <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
            <h1 className="text-lg font-bold text-slate-800">Odontograma</h1>
            <div className="h-6 w-px bg-slate-300 mx-2" />
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button onClick={() => setDentition("permanent")} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${state.dentition === "permanent" ? "bg-white text-sky-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Permanente</button>
              <button onClick={() => setDentition("temporal")} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${state.dentition === "temporal" ? "bg-white text-sky-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Temporal</button>
            </div>
          </div>
        </div>

        <main className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 flex flex-col">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-800">Odontograma Inicial</h2>
              <p className="text-sm text-slate-500">Visualización interactiva FDI. Use Ctrl+Click para selección múltiple.</p>
            </div>
            <OdontogramGrid />
            <div className="flex flex-wrap items-center justify-center gap-6 py-4 mt-4 border-t border-slate-200 text-xs font-medium text-slate-600">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /> Tratamiento Realizado / Caries</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500" /> Tratamiento Planificado</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500" /> Implantes</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-900" /> Existente (Antiguo)</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500" /> Observación</div>
            </div>
            <HistoryTable onDelete={handleDelete} />
          </div>
          <TreatmentPanel saving={saving} onApply={handleApply} />
        </main>
      </div>
    </OdontogramContext.Provider>
  );
}
