/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WorkoutLog, Measurement, Pattern } from '../types';
import { Periodo, bloccoVolume } from '../logic/periodo';

// ==========================================
// 1. VOLUME SETTIMANALE (A BARRE, 12 SETTIMANE)
// ==========================================
export function VolumeBarChart({ workouts, periodo }: { workouts: WorkoutLog[]; periodo: Periodo }) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const weeks = bloccoVolume(workouts, periodo);
  // Cambiando periodo cambia il numero di barre: una selezione vecchia non vale piu'
  const sel = selectedIdx !== null && selectedIdx < weeks.length ? selectedIdx : null;

  const maxVol = Math.max(...weeks.map((w) => w.volume), 80);
  const chartHeight = 160;
  const chartWidth = 320;
  const barWidth = Math.min(16, (chartWidth / weeks.length) * 0.6);
  const passoEtichette = Math.ceil(weeks.length / 13);
  const gap = (chartWidth - barWidth * weeks.length) / (weeks.length + 1);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-muted-txt">Volume (reps totali)</span>
        {sel !== null && (
          <span className="text-xs text-accent font-semibold tabular-nums">
            {weeks[sel].etichetta}: {weeks[sel].volume} reps ({weeks[sel].serie} serie)
          </span>
        )}
      </div>
      <div className="w-full overflow-x-auto pb-1">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 25}`} className="w-full h-44 select-none">
          {/* Griglia orizzontale */}
          {[0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = chartHeight - chartHeight * pct;
            return (
              <g key={idx}>
                <line
                  x1="0"
                  y1={y}
                  x2={chartWidth}
                  y2={y}
                  stroke="var(--color-border)"
                  strokeDasharray="2 3"
                  strokeWidth="0.75"
                />
                <text x="4" y={y - 3} fill="var(--color-muted)" fontSize="8" className="tabular-nums">
                  {Math.round(maxVol * pct)}
                </text>
              </g>
            );
          })}

          {/* Barre */}
          {weeks.map((w, idx) => {
            const barH = (w.volume / maxVol) * chartHeight;
            const x = gap + idx * (barWidth + gap);
            const y = chartHeight - barH;
            const isHovered = sel === idx;

            return (
              <g
                key={idx}
                className="cursor-pointer transition-opacity"
                onClick={() => setSelectedIdx(idx)}
                onMouseEnter={() => setSelectedIdx(idx)}
              >
                <rect x={x - 2} y="0" width={barWidth + 4} height={chartHeight} fill="transparent" />
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(2, barH)}
                  rx="4"
                  fill={isHovered ? 'var(--color-text)' : 'var(--color-accent)'}
                  opacity={w.volume > 0 ? (isHovered ? 1 : 0.85) : 0.15}
                />
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 16}
                  textAnchor="middle"
                  fill={isHovered ? 'var(--color-accent)' : 'var(--color-muted)'}
                  fontSize="8"
                  fontWeight={isHovered ? '600' : '400'}
                  className="tabular-nums"
                >
                  {(weeks.length - 1 - idx) % passoEtichette === 0 ? w.etichetta : ''}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ==========================================
// 2. LIVELLO PER PATTERN (GRAFICO RADAR A 6 ASSI)
// ==========================================
export function RadarPatternChart({
  currentLevels,
  initialLevels
}: {
  currentLevels: Record<Pattern, number>;
  initialLevels?: Record<Pattern, number>;
}) {
  const axes: { pattern: Pattern; label: string; maxLevel: number }[] = [
    { pattern: 'spinta_orizzontale', label: 'Spinta Orizz.', maxLevel: 10 },
    { pattern: 'spinta_verticale', label: 'Spinta Vert.', maxLevel: 6 },
    { pattern: 'dip', label: 'Dip', maxLevel: 6 },
    { pattern: 'trazione_orizzontale', label: 'Traz. Orizz.', maxLevel: 6 },
    { pattern: 'trazione_verticale', label: 'Traz. Vert.', maxLevel: 8 },
    { pattern: 'gambe_spinta', label: 'Gambe Spinta', maxLevel: 7 }
  ];

  const size = 300;
  const center = size / 2;
  const radius = 100;
  const angleStep = (Math.PI * 2) / axes.length;

  const getCoordinates = (index: number, normalizedVal: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = normalizedVal * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  const currentPoints = axes
    .map((ax, idx) => {
      const val = Math.min(1, (currentLevels[ax.pattern] || 1) / ax.maxLevel);
      const { x, y } = getCoordinates(idx, Math.max(0.15, val));
      return `${x},${y}`;
    })
    .join(' ');

  const initialPoints = initialLevels
    ? axes
        .map((ax, idx) => {
          const val = Math.min(1, (initialLevels[ax.pattern] || 1) / ax.maxLevel);
          const { x, y } = getCoordinates(idx, Math.max(0.15, val));
          return `${x},${y}`;
        })
        .join(' ')
    : null;

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex gap-4 text-xs mb-3">
        <div className="flex items-center gap-1.5 text-muted-txt">
          <span className="w-3 h-0.5 border-b border-dashed border-rest inline-block" />
          <span>Primo test</span>
        </div>
        <div className="flex items-center gap-1.5 text-accent font-medium">
          <span className="w-3 h-1 bg-accent rounded-full inline-block" />
          <span>Attuale</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[300px] h-auto select-none">
        {[0.25, 0.5, 0.75, 1].map((pct, idx) => {
          const r = radius * pct;
          const polygonPts = axes
            .map((_, aIdx) => {
              const angle = aIdx * angleStep - Math.PI / 2;
              return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
            })
            .join(' ');
          return (
            <polygon
              key={idx}
              points={polygonPts}
              fill="none"
              stroke="var(--color-border)"
              strokeWidth="0.8"
              strokeDasharray={pct === 1 ? 'none' : '2 3'}
            />
          );
        })}

        {axes.map((ax, idx) => {
          const endPt = getCoordinates(idx, 1);
          const labelPt = getCoordinates(idx, 1.22);
          const currentLev = currentLevels[ax.pattern] || 1;

          return (
            <g key={idx}>
              <line
                x1={center}
                y1={center}
                x2={endPt.x}
                y2={endPt.y}
                stroke="var(--color-border)"
                strokeWidth="1"
              />
              <text
                x={labelPt.x}
                y={labelPt.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="var(--color-text)"
                fontSize="9"
                fontWeight="500"
              >
                {ax.label}
              </text>
              <text
                x={labelPt.x}
                y={labelPt.y + 11}
                textAnchor="middle"
                fill="var(--color-accent)"
                fontSize="8"
                fontWeight="700"
                className="tabular-nums"
              >
                Lv.{currentLev}/{ax.maxLevel}
              </text>
            </g>
          );
        })}

        {initialPoints && (
          <polygon
            points={initialPoints}
            fill="var(--color-rest)"
            fillOpacity="0.12"
            stroke="var(--color-rest)"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
        )}

        <polygon
          points={currentPoints}
          fill="var(--color-accent)"
          fillOpacity="0.28"
          stroke="var(--color-accent)"
          strokeWidth="2"
        />

        {axes.map((ax, idx) => {
          const val = Math.min(1, (currentLevels[ax.pattern] || 1) / ax.maxLevel);
          const pt = getCoordinates(idx, Math.max(0.15, val));
          return <circle key={idx} cx={pt.x} cy={pt.y} r="3.5" fill="var(--color-accent)" stroke="var(--color-canvas)" strokeWidth="1.5" />;
        })}
      </svg>
    </div>
  );
}

// ==========================================
// 3. ANDAMENTO PESO & VITA (A LINEA DOPPIA)
// ==========================================
export function DoubleLineBodyChart({
  measurements,
  periodoFiltrato = false
}: {
  measurements: Measurement[];
  periodoFiltrato?: boolean;
}) {
  const validMeasurements = measurements
    .filter((m) => typeof m.pesoKg === 'number' && typeof m.vitaCm === 'number')
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

  if (validMeasurements.length === 0) {
    return (
      <div className="p-6 text-center rounded-xl bg-elevated/40 border border-subtle text-xs text-muted-txt space-y-1">
        <p className="font-semibold text-txt">
          {periodoFiltrato ? 'Nessuna misurazione in questo periodo' : 'Nessuna misurazione completa della vita'}
        </p>
        <p>
          {periodoFiltrato
            ? "Scegli un periodo più lungo o aggiungi peso e vita dal Profilo."
            : 'Aggiungi circonferenza vita e peso dal tuo Profilo per tracciare il grafico a doppia linea.'}
        </p>
      </div>
    );
  }

  const weights = validMeasurements.map((m) => m.pesoKg);
  const waists = validMeasurements.map((m) => m.vitaCm as number);

  const minWeight = Math.min(...weights) - 1;
  const maxWeight = Math.max(...weights) + 1;
  const minWaist = Math.min(...waists) - 2;
  const maxWaist = Math.max(...waists) + 2;

  const width = 320;
  const height = 150;
  const padX = 28;
  const padY = 20;

  const getWeightY = (w: number) => {
    const range = maxWeight - minWeight || 1;
    return height - padY - ((w - minWeight) / range) * (height - padY * 2);
  };

  const getWaistY = (w: number) => {
    const range = maxWaist - minWaist || 1;
    return height - padY - ((w - minWaist) / range) * (height - padY * 2);
  };

  const getX = (idx: number) => {
    if (validMeasurements.length === 1) return width / 2;
    return padX + (idx / (validMeasurements.length - 1)) * (width - padX * 2);
  };

  const weightPath = validMeasurements
    .map((m, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getWeightY(m.pesoKg)}`)
    .join(' ');

  const waistPath = validMeasurements
    .map((m, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getWaistY(m.vitaCm as number)}`)
    .join(' ');

  const latest = validMeasurements[validMeasurements.length - 1];

  return (
    <div className="w-full">
      <div className="flex justify-between items-center text-xs mb-3">
        <div className="flex items-center gap-1.5 text-accent font-semibold">
          <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block" />
          <span>Peso: {latest.pesoKg} kg</span>
        </div>
        <div className="flex items-center gap-1.5 text-rest font-semibold">
          <span className="w-2.5 h-2.5 rounded-full bg-rest inline-block" />
          <span>Vita: {latest.vitaCm} cm</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height + 20}`} className="w-full h-44 select-none">
        {[0, 0.5, 1].map((pct, idx) => {
          const y = padY + pct * (height - padY * 2);
          return (
            <line
              key={idx}
              x1={padX}
              y1={y}
              x2={width - padX}
              y2={y}
              stroke="var(--color-border)"
              strokeDasharray="2 3"
              strokeWidth="0.75"
            />
          );
        })}

        {/* Linea Vita (arancione) */}
        <path d={waistPath} fill="none" stroke="var(--color-rest)" strokeWidth="2" strokeLinecap="round" />
        {validMeasurements.map((m, idx) => (
          <circle
            key={`waist_${idx}`}
            cx={getX(idx)}
            cy={getWaistY(m.vitaCm as number)}
            r="3"
            fill="var(--color-rest)"
            stroke="var(--color-surface)"
            strokeWidth="1.5"
          />
        ))}

        {/* Linea Peso (verde acido) */}
        <path d={weightPath} fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" />
        {validMeasurements.map((m, idx) => (
          <circle
            key={`weight_${idx}`}
            cx={getX(idx)}
            cy={getWeightY(m.pesoKg)}
            r="3.5"
            fill="var(--color-accent)"
            stroke="var(--color-surface)"
            strokeWidth="1.5"
          />
        ))}

        {/* Date sotto */}
        {validMeasurements.map((m, idx) => {
          if (validMeasurements.length > 5 && idx % 2 !== 0 && idx !== validMeasurements.length - 1) return null;
          const d = new Date(m.data);
          const dateStr = `${d.getDate()}/${d.getMonth() + 1}`;
          return (
            <text
              key={`date_${idx}`}
              x={getX(idx)}
              y={height + 14}
              textAnchor="middle"
              fill="var(--color-muted)"
              fontSize="8"
              className="tabular-nums"
            >
              {dateStr}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

// ==========================================
// 4. GRIGLIA CALENDARIO A QUADRATINI (ULTIMI 3 MESI)
// ==========================================
export function CalendarHeatmapChart({ workouts }: { workouts: WorkoutLog[] }) {
  const [selectedDay, setSelectedDay] = useState<{ date: string; volume: number; sessionName?: string } | null>(null);

  // Mappa data YYYY-MM-DD -> volume totale
  const dailyVolume = new Map<string, { volume: number; sessionName: string }>();
  for (const w of workouts) {
    const dStr = w.data.slice(0, 10);
    const prev = dailyVolume.get(dStr) || { volume: 0, sessionName: w.sessionName };
    let vol = 0;
    for (const s of w.sets) {
      vol += s.repsFatte || 1;
    }
    dailyVolume.set(dStr, { volume: prev.volume + vol, sessionName: w.sessionName });
  }

  // Costruisci gli ultimi 84 giorni (12 settimane complete = 84 giorni)
  const days: { dateStr: string; dayOfWeek: number; volume: number; sessionName?: string }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Trova la domenica dell'attuale settimana per allineare le colonne
  const currentDayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
  const endOfGrid = new Date(today);
  endOfGrid.setDate(today.getDate() + (7 - currentDayOfWeek));

  const totalDays = 12 * 7; // 12 settimane = 84 giorni
  const startOfGrid = new Date(endOfGrid);
  startOfGrid.setDate(endOfGrid.getDate() - totalDays + 1);

  for (let d = new Date(startOfGrid); d <= endOfGrid; d.setDate(d.getDate() + 1)) {
    const iso = d.toISOString().slice(0, 10);
    const info = dailyVolume.get(iso);
    const dow = d.getDay() === 0 ? 7 : d.getDay();
    days.push({
      dateStr: iso,
      dayOfWeek: dow,
      volume: info?.volume || 0,
      sessionName: info?.sessionName
    });
  }

  // Raggruppa in 12 colonne da 7 giorni ciascuna
  const weeks: typeof days[] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const getSquareColor = (vol: number) => {
    if (vol === 0) return 'var(--color-elevated)';
    if (vol < 50) return 'rgba(184, 255, 60, 0.3)';
    if (vol < 120) return 'rgba(184, 255, 60, 0.65)';
    return 'var(--color-accent)';
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center text-xs">
        <span className="text-muted-txt">Frequenza ultimi 3 mesi</span>
        {selectedDay ? (
          <span className="text-accent font-semibold tabular-nums">
            {selectedDay.date}: {selectedDay.volume > 0 ? `${selectedDay.volume} reps (${selectedDay.sessionName})` : 'Riposo'}
          </span>
        ) : (
          <div className="flex items-center gap-1.5 text-[10px] text-muted-txt">
            <span>Meno</span>
            <span className="w-2.5 h-2.5 rounded-xs" style={{ background: 'var(--color-elevated)' }} />
            <span className="w-2.5 h-2.5 rounded-xs" style={{ background: 'rgba(184, 255, 60, 0.3)' }} />
            <span className="w-2.5 h-2.5 rounded-xs" style={{ background: 'rgba(184, 255, 60, 0.65)' }} />
            <span className="w-2.5 h-2.5 rounded-xs" style={{ background: 'var(--color-accent)' }} />
            <span>Più</span>
          </div>
        )}
      </div>

      <div className="w-full overflow-x-auto pb-1">
        <div className="flex gap-1.5 min-w-[280px]">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1.5">
              {week.map((day) => {
                const isSelected = selectedDay?.date === day.dateStr;
                return (
                  <button
                    key={day.dateStr}
                    type="button"
                    onClick={() => setSelectedDay({ date: day.dateStr, volume: day.volume, sessionName: day.sessionName })}
                    title={`${day.dateStr}: ${day.volume} reps`}
                    className={`w-3.5 h-3.5 rounded-xs transition-transform ${
                      isSelected ? 'ring-2 ring-white scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: getSquareColor(day.volume) }}
                    aria-label={`Attività ${day.dateStr}: ${day.volume} reps`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. RIEPILOGO DEL CAMBIAMENTO SIGNIFICATIVO (6 SETTIMANE)
// ==========================================
export function getSignificantChangeSummary(
  workouts: WorkoutLog[],
  currentLevels: Record<Pattern, number>,
  initialLevels?: Record<Pattern, number>
): string {
  if (workouts.length === 0) {
    return 'Inizia la tua prima settimana per tracciare i progressi nel tempo.';
  }

  // Confronta livelli
  let maxLevelDelta = 0;
  let topPatternName = '';
  const patternLabels: Record<Pattern, string> = {
    spinta_orizzontale: 'Spinta Orizzontale',
    spinta_verticale: 'Spinta Verticale',
    dip: 'Dip',
    trazione_orizzontale: 'Trazione Orizzontale',
    trazione_verticale: 'Trazione Verticale',
    gambe_spinta: 'Gambe (Spinta)',
    gambe_catena_posteriore: 'Catena Posteriore',
    core_anteriore: 'Core Anteriore',
    core_laterale: 'Core Laterale',
    polpacci: 'Polpacci'
  };

  if (initialLevels) {
    for (const p of Object.keys(currentLevels) as Pattern[]) {
      const delta = (currentLevels[p] || 1) - (initialLevels[p] || 1);
      if (delta > maxLevelDelta) {
        maxLevelDelta = delta;
        topPatternName = patternLabels[p];
      }
    }
  }

  // Calcola volume ultime 3 settimane vs 3 settimane precedenti
  const now = Date.now();
  const threeWeeksMs = 21 * 24 * 3600 * 1000;
  const recentWorkouts = workouts.filter((w) => now - new Date(w.data).getTime() <= threeWeeksMs);
  const priorWorkouts = workouts.filter((w) => {
    const diff = now - new Date(w.data).getTime();
    return diff > threeWeeksMs && diff <= threeWeeksMs * 2;
  });

  const getVol = (wList: WorkoutLog[]) =>
    wList.reduce((acc, w) => acc + w.sets.reduce((sAcc, s) => sAcc + (s.repsFatte || 1), 0), 0);

  const recentVol = getVol(recentWorkouts);
  const priorVol = getVol(priorWorkouts);

  let volGrowthPercent = 0;
  if (priorVol > 0) {
    volGrowthPercent = Math.round(((recentVol - priorVol) / priorVol) * 100);
  }

  if (maxLevelDelta > 0) {
    return `Nelle ultime 6 settimane sei avanzato di +${maxLevelDelta} ${
      maxLevelDelta === 1 ? 'livello' : 'livelli'
    } in ${topPatternName}${volGrowthPercent > 0 ? ` con un volume in crescita del +${volGrowthPercent}%` : ''}.`;
  }

  if (volGrowthPercent > 0) {
    return `Nelle ultime 6 settimane il tuo volume allenante è cresciuto del +${volGrowthPercent}% con ${workouts.length} sessioni completate.`;
  }

  return `Costanza impeccabile: ${workouts.length} allenamenti registrati con ${recentWorkouts.length} sessioni nelle ultime 3 settimane.`;
}
