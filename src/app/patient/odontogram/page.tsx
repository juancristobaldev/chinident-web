"use client";

import React, { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { History } from "lucide-react";
import { toast } from "sonner";
import {
  type DentitionType,
  type Quadrant,
  type FaceId,
  type ClinicalRecord,
  type DentalPieceData,
  CLINICAL_CATALOG,
  COLOR_MAP,
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

const CrownFaces = ({ number, records }: { number: number; records: ClinicalRecord[] }) => {
  const { facesMap } = getAnatomyForTooth(number);
  const getFaceColor = (faceId: string) => {
    const record = records.find((r) => (r.faces as string[]).includes(faceId));
    if (record) return COLOR_MAP[CLINICAL_CATALOG[record.catalogId]?.defaultColor || "red"];
    return "white";
  };
  const polygons = {
    top: { id: facesMap.top, points: "0,0 100,0 75,25 25,25" },
    bottom: { id: facesMap.bottom, points: "25,75 75,75 100,100 0,100" },
    left: { id: facesMap.left, points: "0,0 25,25 25,75 0,100" },
    right: { id: facesMap.right, points: "100,0 75,25 75,75 100,100" },
    center: { id: facesMap.center, points: "25,25 75,25 75,75 25,75" },
  };
  return (
    <div className="relative w-10 h-10">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {Object.entries(polygons).map(([key, data]) => (
          <polygon key={key} points={data.points} fill={getFaceColor(data.id)} stroke="#64748b" strokeWidth={2} />
        ))}
      </svg>
      {records.some((r) => r.catalogId === "corona") && <div className="absolute inset-0 border-4 border-blue-500 rounded-full pointer-events-none" />}
    </div>
  );
};

const Tooth = ({ number, pieces }: { number: number; pieces: Record<number, DentalPieceData> }) => {
  const pieceData = pieces[number];
  const records = (pieceData?.records || []) as ClinicalRecord[];
  const { isUpper } = getAnatomyForTooth(number);
  const isAbsent = records.some((r) => r.catalogId === "ausente");
  const isExtracted = records.find((r) => r.catalogId.includes("extraccion"));
  const extractionColor = isExtracted ? COLOR_MAP[CLINICAL_CATALOG[isExtracted.catalogId]?.defaultColor || "red"] : null;

  return (
    <div className="flex flex-col items-center mx-[2px]">
      <div className={`relative flex flex-col items-center ${isAbsent ? "opacity-30 grayscale" : ""}`}>
        {isUpper && <div className="h-14 w-8 mb-1"><ToothRoot number={number} records={records} /></div>}
        <div className="relative">
          <CrownFaces number={number} records={records} />
          {isExtracted && (
            <svg className="absolute -inset-3 w-16 h-16 pointer-events-none z-10" viewBox="0 0 100 100">
              <line x1="20" y1="20" x2="80" y2="80" stroke={extractionColor!} strokeWidth="8" strokeLinecap="round" />
              <line x1="80" y1="20" x2="20" y2="80" stroke={extractionColor!} strokeWidth="8" strokeLinecap="round" />
            </svg>
          )}
        </div>
        <span className="text-xs font-bold mt-0.5 mb-0.5 text-slate-600">{number}</span>
        {!isUpper && <div className="h-14 w-8 mt-1"><ToothRoot number={number} records={records} /></div>}
      </div>
    </div>
  );
};

const OdontogramGrid = ({ dentition, pieces }: { dentition: DentitionType; pieces: Record<number, DentalPieceData> }) => {
  const isTemp = dentition === "temporal";
  const UpperRow = isTemp ? [...TEMP_UPPER_RIGHT, ...TEMP_UPPER_LEFT] : [...PERMA_UPPER_RIGHT, ...PERMA_UPPER_LEFT];
  const LowerRow = isTemp ? [...TEMP_LOWER_RIGHT, ...TEMP_LOWER_LEFT] : [...PERMA_LOWER_RIGHT, ...PERMA_LOWER_LEFT];
  return (
    <div className="flex flex-col items-center w-full p-8 bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="flex justify-between w-full max-w-4xl mb-4 text-xs font-semibold text-slate-400"><span>Derecha</span><span>Izquierda</span></div>
      <div className="flex justify-center gap-1 mb-8 w-full max-w-5xl overflow-x-auto pb-4">
        <div className="flex gap-1 pr-4 border-r-2 border-slate-200">{UpperRow.slice(0, UpperRow.length / 2).map((num) => <Tooth key={num} number={num} pieces={pieces} />)}</div>
        <div className="flex gap-1 pl-4">{UpperRow.slice(UpperRow.length / 2).map((num) => <Tooth key={num} number={num} pieces={pieces} />)}</div>
      </div>
      <div className="flex justify-center gap-1 w-full max-w-5xl overflow-x-auto pb-4">
        <div className="flex gap-1 pr-4 border-r-2 border-slate-200">{LowerRow.slice(0, LowerRow.length / 2).map((num) => <Tooth key={num} number={num} pieces={pieces} />)}</div>
        <div className="flex gap-1 pl-4">{LowerRow.slice(LowerRow.length / 2).map((num) => <Tooth key={num} number={num} pieces={pieces} />)}</div>
      </div>
    </div>
  );
};

export default function PatientOdontogramPage() {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<ClinicalRecord[]>([]);
  const [dentition, setDentition] = useState<DentitionType>("permanent");
  const [pieces, setPieces] = useState<Record<number, DentalPieceData>>({});

  useEffect(() => {
    api.get<any>("/odontogram/me")
      .then((data) => {
        setDentition((data.dentition || "permanent") as DentitionType);
        const recs = data.records || [];
        setHistory(recs);
        const pcs: Record<number, DentalPieceData> = {};
        for (const rec of recs) {
          if (!pcs[rec.toothNumber]) {
            pcs[rec.toothNumber] = { number: rec.toothNumber, quadrant: Math.floor(rec.toothNumber / 10) as Quadrant, type: rec.toothNumber > 50 ? "temporal" : "permanent", records: [] };
          }
          pcs[rec.toothNumber].records.push(rec);
        }
        setPieces(pcs);
      })
      .catch(() => { toast.error("Error al cargar odontograma"); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner className="h-8 w-8" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mi Odontograma</h1>
        <p className="text-muted-foreground">Visualización de diagnósticos y tratamientos dentales</p>
      </div>

      <OdontogramGrid dentition={dentition} pieces={pieces} />

      <div className="flex flex-wrap items-center justify-center gap-6 py-4 border-t border-slate-200 text-xs font-medium text-slate-600">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /> Tratamiento Realizado</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500" /> Tratamiento Planificado</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500" /> Implantes</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-900" /> Existente</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500" /> Observación</div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2"><History className="w-5 h-5 text-slate-500" />Historial Clínico</h3>
          <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-1 rounded-full">{history.length} registros</span>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">No hay registros clínicos.</td></tr>
              ) : (
                history.map((record) => (
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
