/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import {
  VolumeBarChart,
  RadarPatternChart,
  DoubleLineBodyChart,
  CalendarHeatmapChart,
  getSignificantChangeSummary
} from '../components/Charts';
import { ProgressionTree } from '../components/ProgressionTree';
import { EXERCISES } from '../data/exercises';
import { WorkoutLog } from '../types';
import { Periodo, PERIODI, filtraPerPeriodo } from '../logic/periodo';
import { IconTrophy, IconClose, IconChevronRight } from '../components/Icons';

export function ProgressScreen() {
  const { state } = useApp();
  const { workouts, levels, assessments, measurements, profile } = state;

  const [activeTab, setActiveTab] = useState<'grafici' | 'percorso' | 'pr' | 'storico'>('grafici');
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutLog | null>(null);
  const [periodo, setPeriodo] = useState<Periodo>('90g');
  const [historyFilter, setHistoryFilter] = useState<'tutti' | '30gg' | 'anno'>('tutti');

  const initialAssessment = assessments[0];
  const initialLevels = initialAssessment?.livelliCalcolati;

  // Calcolo Record Personali (PR) da tutti i workout
  const personalRecords: {
    exerciseId: string;
    exerciseName: string;
    maxReps: number;
    maxSecs: number;
    date: string;
  }[] = [];

  const prMap = new Map<string, { maxReps: number; maxSecs: number; date: string }>();

  for (const w of workouts) {
    for (const set of w.sets) {
      const cur = prMap.get(set.exerciseId) || { maxReps: 0, maxSecs: 0, date: w.data };
      let updated = false;

      if (set.repsFatte > cur.maxReps) {
        cur.maxReps = set.repsFatte;
        cur.date = w.data;
        updated = true;
      }
      if (set.secondiFatti > cur.maxSecs) {
        cur.maxSecs = set.secondiFatti;
        cur.date = w.data;
        updated = true;
      }
      if (updated) {
        prMap.set(set.exerciseId, cur);
      }
    }
  }

  prMap.forEach((val, exId) => {
    const ex = EXERCISES.find((e) => e.id === exId);
    if (ex && (val.maxReps > 0 || val.maxSecs > 0)) {
      personalRecords.push({
        exerciseId: exId,
        exerciseName: ex.nome,
        maxReps: val.maxReps,
        maxSecs: val.maxSecs,
        date: val.date
      });
    }
  });

  // Filtro storico
  const now = Date.now();
  const filteredWorkouts = workouts.filter((w) => {
    if (historyFilter === '30gg') {
      const diffDays = (now - new Date(w.data).getTime()) / (1000 * 3600 * 24);
      return diffDays <= 30;
    }
    return true;
  });

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s > 0 ? `${s}s` : ''}`;
  };

  return (
    <div className="space-y-6 pb-24">
      {/* 1. Header con Tab Switcher */}
      <div className="pt-2 space-y-3">
        <div>
          <span className="text-xs font-semibold text-accent uppercase tracking-wider">
            Analisi & Statistiche
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-txt mt-0.5">I Tuoi Progressi</h1>
        </div>

        {/* Segmented Control */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-surface rounded-xl border border-subtle text-[11px]">
          <button
            onClick={() => setActiveTab('grafici')}
            className={`py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'grafici'
                ? 'bg-elevated text-accent border border-subtle'
                : 'text-muted-txt hover:text-txt'
            }`}
          >
            Grafici
          </button>
          <button
            onClick={() => setActiveTab('percorso')}
            className={`py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'percorso'
                ? 'bg-elevated text-accent border border-subtle'
                : 'text-muted-txt hover:text-txt'
            }`}
          >
            Percorso
          </button>
          <button
            onClick={() => setActiveTab('pr')}
            className={`py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'pr'
                ? 'bg-elevated text-accent border border-subtle'
                : 'text-muted-txt hover:text-txt'
            }`}
          >
            Record ({personalRecords.length})
          </button>
          <button
            onClick={() => setActiveTab('storico')}
            className={`py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'storico'
                ? 'bg-elevated text-accent border border-subtle'
                : 'text-muted-txt hover:text-txt'
            }`}
          >
            Storico ({workouts.length})
          </button>
        </div>
      </div>

      {/* TAB 1: GRAFICI SVG */}
      {activeTab === 'grafici' && (
        <div className="space-y-6">
          {/* Riga di sintesi: il cambiamento piu' significativo del periodo */}
          <div className="p-4 rounded-[20px] bg-elevated border border-accent/30">
            <span className="text-[10px] font-semibold text-accent uppercase tracking-wider">
              In sintesi
            </span>
            <p className="text-sm text-txt leading-relaxed mt-1">
              {getSignificantChangeSummary(workouts, levels, initialLevels)}
            </p>
          </div>

          {/* Il periodo vale per il volume e per peso e vita; radar e costanza hanno una finestra loro */}
          <div
            role="group"
            aria-label="Periodo dei grafici"
            className="grid grid-cols-4 gap-1 p-1 bg-surface rounded-xl border border-subtle text-[11px]"
          >
            {PERIODI.map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriodo(p.id)}
                aria-pressed={periodo === p.id}
                className={`py-1.5 rounded-lg font-semibold transition-all ${
                  periodo === p.id
                    ? 'bg-elevated text-accent border border-subtle'
                    : 'text-muted-txt hover:text-txt'
                }`}
              >
                {p.etichetta}
              </button>
            ))}
          </div>

          {/* Grafico 1: Volume a barre */}
          <div className="p-4 rounded-[20px] bg-surface border border-subtle space-y-3">
            <div>
              <h2 className="text-sm font-bold text-txt">
                {periodo === '7g' ? 'Volume Giornaliero' : 'Volume Settimanale Totale'}
              </h2>
              <p className="text-[11px] text-muted-txt">
                Somma delle ripetizioni per tutte le serie, {periodo === '7g' ? 'un giorno per barra' : 'una settimana per barra'}.
              </p>
            </div>
            <VolumeBarChart workouts={workouts} periodo={periodo} />
          </div>

          {/* Grafico 2: Radar a 6 assi */}
          <div className="p-4 rounded-[20px] bg-surface border border-subtle space-y-3">
            <div>
              <h2 className="text-sm font-bold text-txt">Livello per Pattern</h2>
              <p className="text-[11px] text-muted-txt">
                Radar a 6 assi: confronto tra il livello attuale e il test iniziale.
              </p>
            </div>
            <RadarPatternChart currentLevels={levels} initialLevels={initialLevels} />
          </div>

          {/* Grafico 3: Peso corporeo e Circonferenza Vita */}
          <div className="p-4 rounded-[20px] bg-surface border border-subtle space-y-3">
            <div>
              <h2 className="text-sm font-bold text-txt">Peso Corporeo e Vita</h2>
              <p className="text-[11px] text-muted-txt">
                Doppia linea temporale per monitorare la ricomposizione corporea.
              </p>
            </div>
            <DoubleLineBodyChart
              measurements={filtraPerPeriodo(measurements, periodo)}
              periodoFiltrato={periodo !== 'tutti' && measurements.length > 0}
            />
          </div>

          {/* Grafico 4: Mappa a calendario degli ultimi tre mesi */}
          <div className="p-4 rounded-[20px] bg-surface border border-subtle space-y-3">
            <div>
              <h2 className="text-sm font-bold text-txt">Costanza</h2>
              <p className="text-[11px] text-muted-txt">
                Un quadratino per giorno negli ultimi tre mesi, colorato in base al volume.
              </p>
            </div>
            <CalendarHeatmapChart workouts={workouts} />
          </div>
        </div>
      )}

      {/* TAB 2: ALBERO DELLE PROGRESSIONI */}
      {activeTab === 'percorso' && (
        <div className="space-y-3">
          <div className="px-1">
            <p className="text-[11px] text-muted-txt leading-relaxed">
              Ogni pattern e' una scala: i livelli superati sono pieni, quello attuale e'
              evidenziato, i successivi si sbloccano progredendo. Tocca un nodo per vedere
              istruzioni, criterio di sblocco e il tuo storico su quell'esercizio.
            </p>
          </div>
          <ProgressionTree
            currentLevels={levels}
            userEquipment={profile?.attrezzatura || []}
            workouts={workouts}
          />
        </div>
      )}

      {/* TAB 2: RECORD PERSONALI */}
      {activeTab === 'pr' && (
        <div className="space-y-3">
          <div className="text-xs text-muted-txt">
            Migliori prestazioni registrate durante le sessioni d’allenamento:
          </div>

          {personalRecords.length === 0 ? (
            <div className="p-8 text-center rounded-[20px] bg-surface border border-subtle text-muted-txt text-xs">
              Completa il tuo primo allenamento per stabilire i record personali!
            </div>
          ) : (
            <div className="space-y-2">
              {personalRecords.map((pr) => {
                const dateStr = new Date(pr.date).toLocaleDateString('it-IT', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                });
                return (
                  <div
                    key={pr.exerciseId}
                    className="p-3.5 rounded-xl bg-surface border border-subtle flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-txt">{pr.exerciseName}</div>
                      <div className="text-[10px] text-muted-txt">{dateStr}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-accent tabular-nums">
                        {pr.maxReps > 0 ? `${pr.maxReps} reps` : `${pr.maxSecs}s`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: STORICO ALLENAMENTI */}
      {activeTab === 'storico' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-txt">Filtra per periodo:</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setHistoryFilter('tutti')}
                className={`px-2.5 py-1 rounded-lg border text-[11px] ${
                  historyFilter === 'tutti'
                    ? 'bg-elevated border-accent text-accent font-semibold'
                    : 'bg-surface border-subtle text-muted-txt'
                }`}
              >
                Tutti
              </button>
              <button
                onClick={() => setHistoryFilter('30gg')}
                className={`px-2.5 py-1 rounded-lg border text-[11px] ${
                  historyFilter === '30gg'
                    ? 'bg-elevated border-accent text-accent font-semibold'
                    : 'bg-surface border-subtle text-muted-txt'
                }`}
              >
                Ultimi 30 gg
              </button>
            </div>
          </div>

          {filteredWorkouts.length === 0 ? (
            <div className="p-8 text-center rounded-[20px] bg-surface border border-subtle text-muted-txt text-xs">
              Nessun allenamento registrato in questo intervallo.
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredWorkouts.map((w) => {
                const dateStr = new Date(w.data).toLocaleDateString('it-IT', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short'
                });

                return (
                  <div
                    key={w.id}
                    onClick={() => setSelectedWorkout(w)}
                    className="p-3.5 rounded-xl bg-surface border border-subtle flex items-center justify-between cursor-pointer hover:bg-elevated transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-txt">{w.sessionName}</div>
                      <div className="text-[11px] text-muted-txt flex items-center gap-1.5">
                        <span>{dateStr}</span>
                        <span>·</span>
                        <span className="tabular-nums">{formatDuration(w.durataSec)}</span>
                        <span>·</span>
                        <span className="tabular-nums">{w.sets.length} serie</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-accent tabular-nums">
                        {w.sensazione}/5
                      </span>
                      <IconChevronRight size={16} className="text-muted-txt" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODALE DETTAGLIO ALLENAMENTO */}
      {selectedWorkout && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end">
          <div className="bg-[#141A22] border-t border-[#2A3540] rounded-t-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto max-w-[480px] mx-auto w-full">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-txt">{selectedWorkout.sessionName}</h3>
                <div className="text-xs text-muted-txt mt-0.5">
                  {new Date(selectedWorkout.data).toLocaleDateString('it-IT', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
              </div>
              <button
                onClick={() => setSelectedWorkout(null)}
                className="w-8 h-8 rounded-lg bg-elevated flex items-center justify-center text-muted-txt hover:text-txt"
              >
                <IconClose size={16} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-elevated border border-subtle text-center text-xs">
              <div>
                <div className="text-muted-txt">Durata</div>
                <div className="font-bold text-txt mt-0.5 tabular-nums">
                  {formatDuration(selectedWorkout.durataSec)}
                </div>
              </div>
              <div>
                <div className="text-muted-txt">Serie fatte</div>
                <div className="font-bold text-accent mt-0.5 tabular-nums">
                  {selectedWorkout.sets.length}
                </div>
              </div>
              <div>
                <div className="text-muted-txt">Sensazione</div>
                <div className="font-bold text-txt mt-0.5 tabular-nums">
                  {selectedWorkout.sensazione} / 5
                </div>
              </div>
            </div>

            {selectedWorkout.note && (
              <div className="p-3 rounded-xl bg-elevated/40 border border-subtle text-xs space-y-1">
                <span className="font-semibold text-muted-txt">Note personali:</span>
                <p className="text-txt">{selectedWorkout.note}</p>
              </div>
            )}

            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-txt">Dettaglio serie:</span>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {selectedWorkout.sets.map((s, idx) => {
                  const ex = EXERCISES.find((e) => e.id === s.exerciseId);
                  return (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-elevated border border-subtle flex justify-between items-center text-xs"
                    >
                      <div>
                        <div className="font-medium text-txt">{ex?.nome || s.exerciseId}</div>
                        <div className="text-[10px] text-muted-txt">Serie {s.serie}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-accent tabular-nums">
                          {s.repsFatte > 0 ? `${s.repsFatte} reps` : `${s.secondiFatti}s`}
                        </span>
                        <div className="text-[10px] text-muted-txt capitalize">{s.feedback}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
