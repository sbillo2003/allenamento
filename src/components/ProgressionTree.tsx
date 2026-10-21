/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Pattern, Exercise, Equipment, WorkoutLog } from '../types';
import { EXERCISES, PATTERN_NAMES } from '../data/exercises';
import {
  IconCheck,
  IconLock,
  IconClose,
  IconExternalLink,
  IconTrophy
} from './Icons';

interface ProgressionTreeProps {
  currentLevels: Record<Pattern, number>;
  userEquipment: Equipment[];
  workouts: WorkoutLog[];
  initialPattern?: Pattern;
}

export function ProgressionTree({
  currentLevels,
  userEquipment,
  workouts,
  initialPattern = 'spinta_orizzontale'
}: ProgressionTreeProps) {
  const [activePattern, setActivePattern] = useState<Pattern>(initialPattern);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const patternsList = Object.keys(PATTERN_NAMES) as Pattern[];

  // Esercizi del pattern attivo ordinati per livello
  const exercisesInPattern = EXERCISES
    .filter((e) => e.pattern === activePattern)
    .sort((a, b) => a.livello - b.livello);

  const currentLevel = currentLevels[activePattern] || 1;

  // Calcola record personale per un dato esercizio
  const getExercisePR = (exId: string) => {
    let maxReps = 0;
    let maxSecs = 0;
    let totalTimes = 0;
    let lastDate: string | null = null;

    for (const w of workouts) {
      for (const s of w.sets) {
        if (s.exerciseId === exId) {
          totalTimes++;
          if (s.repsFatte > maxReps) maxReps = s.repsFatte;
          if (s.secondiFatti > maxSecs) maxSecs = s.secondiFatti;
          if (!lastDate || new Date(w.data) > new Date(lastDate)) {
            lastDate = w.data;
          }
        }
      }
    }

    return { maxReps, maxSecs, totalTimes, lastDate };
  };

  return (
    <div className="w-full space-y-4">
      {/* Selettore orizzontale dei pattern a scorrimento */}
      <div className="w-full overflow-x-auto pb-1">
        <div className="flex gap-1.5 min-w-max">
          {patternsList.map((p) => {
            const isSelected = activePattern === p;
            const lvl = currentLevels[p] || 1;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setActivePattern(p)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-elevated border-accent text-accent'
                    : 'bg-surface border-subtle text-muted-txt hover:text-txt'
                }`}
              >
                <span>{PATTERN_NAMES[p]}</span>
                <span className="ml-1.5 text-[10px] opacity-75 tabular-nums">Lv.{lvl}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Albero verticale SVG e nodi */}
      <div className="p-4 rounded-[20px] bg-surface border border-subtle relative">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-subtle">
          <div>
            <h3 className="text-sm font-bold text-txt">{PATTERN_NAMES[activePattern]}</h3>
            <p className="text-[11px] text-muted-txt">
              Tocca un nodo per visualizzare dettagli, storico e criterio di sblocco.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-accent font-bold tabular-nums">
              Livello {currentLevel} di {exercisesInPattern.length}
            </span>
          </div>
        </div>

        {/* Mappa verticale dei nodi */}
        <div className="relative pl-6 space-y-5">
          {/* Linea verticale SVG continua */}
          <div className="absolute left-[38px] top-4 bottom-6 w-0.5 bg-subtle" />

          {exercisesInPattern.map((ex, idx) => {
            const isPassed = ex.livello < currentLevel;
            const isCurrent = ex.livello === currentLevel;
            const isFuture = ex.livello > currentLevel;

            // Verifica attrezzatura richiesta
            const missingEquipment = ex.attrezzaturaRichiesta.filter(
              (req) => req !== 'pavimento' && !userEquipment.includes(req)
            );
            const isLocked = isFuture && missingEquipment.length > 0;

            return (
              <div
                key={ex.id}
                onClick={() => setSelectedExercise(ex)}
                className="flex items-center gap-3.5 cursor-pointer group"
              >
                {/* Nodo cerchio */}
                <div className="relative z-10 shrink-0">
                  {/* Cerchio pulsante per livello attuale */}
                  {isCurrent && (
                    <span className="absolute -inset-1 rounded-full bg-accent/25 animate-ping" />
                  )}

                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-110 ${
                      isPassed
                        ? 'bg-accent text-accent-contrast shadow-sm shadow-accent/20'
                        : isCurrent
                        ? 'bg-accent text-accent-contrast ring-4 ring-accent/30'
                        : isLocked
                        ? 'bg-elevated text-muted-txt border border-subtle'
                        : 'bg-elevated border border-subtle text-muted-txt'
                    }`}
                  >
                    {isPassed ? (
                      <IconCheck size={14} />
                    ) : isLocked ? (
                      <IconLock size={12} className="text-rest" />
                    ) : (
                      <span className="tabular-nums">{ex.livello}</span>
                    )}
                  </div>
                </div>

                {/* Contenuto del nodo */}
                <div
                  className={`flex-1 p-2.5 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-elevated border-accent/60 shadow-xs'
                      : 'bg-elevated/40 border-subtle group-hover:bg-elevated group-hover:border-subtle'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-txt">{ex.nome}</span>
                      {ex.unilaterale && (
                        <span className="text-[10px] text-accent/80 font-medium">Unilaterale</span>
                      )}
                    </div>
                    {isCurrent && (
                      <span className="text-[10px] font-bold text-accent uppercase tracking-wider bg-accent/15 px-1.5 py-0.5 rounded">
                        Attuale
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-muted-txt mt-0.5 flex items-center gap-2">
                    <span>{ex.tipo === 'tempo' ? 'Isometria' : 'Ripetizioni'}</span>
                    {isLocked && (
                      <span className="text-rest font-medium flex items-center gap-1">
                        · Manca: {missingEquipment.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SCHEDA DETTAGLIO ESERCIZIO */}
      {selectedExercise && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end">
          <div className="bg-[#141A22] border-t border-[#2A3540] rounded-t-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto max-w-[480px] mx-auto w-full">
            <div className="w-10 h-1 bg-subtle rounded-full mx-auto" />

            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs text-accent font-semibold uppercase tracking-wider">
                  Livello {selectedExercise.livello} di {exercisesInPattern.length} · {PATTERN_NAMES[selectedExercise.pattern]}
                </div>
                <h3 className="text-xl font-bold text-txt mt-0.5">{selectedExercise.nome}</h3>
                <div className="text-xs text-muted-txt italic">{selectedExercise.nomeInglese}</div>
              </div>
              <button
                onClick={() => setSelectedExercise(null)}
                className="w-9 h-9 rounded-xl bg-elevated border border-subtle flex items-center justify-center text-muted-txt hover:text-txt"
              >
                <IconClose size={18} />
              </button>
            </div>

            {/* Criterio di sblocco in numeri */}
            <div className="p-3.5 rounded-xl bg-elevated border border-accent/30 space-y-1">
              <span className="text-xs font-bold text-accent uppercase tracking-wider">
                Criterio di sblocco livello successivo
              </span>
              <p className="text-xs text-txt leading-relaxed">
                {selectedExercise.livello < exercisesInPattern.length ? (
                  selectedExercise.tipo === 'tempo' ? (
                    'Completa 2 sessioni consecutive mantenendo tutte le serie ad almeno 40 secondi con tecnica pulita.'
                  ) : (
                    'Completa 2 sessioni consecutive raggiungendo il limite alto del range (es. 3 serie da 12) con tecnica pulita.'
                  )
                ) : (
                  'Livello sommitale del pattern raggiunto! Mantieni o zavorra per intensificare.'
                )}
              </p>
            </div>

            {/* Storico personale & PR */}
            {(() => {
              const pr = getExercisePR(selectedExercise.id);
              return (
                <div className="p-3.5 rounded-xl bg-elevated border border-subtle space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-txt flex items-center gap-1.5">
                      <IconTrophy size={14} className="text-accent" />
                      <span>Storico Personale</span>
                    </span>
                    <span className="text-muted-txt tabular-nums">{pr.totalTimes} sedute svolte</span>
                  </div>
                  {pr.totalTimes > 0 ? (
                    <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                      <div>
                        <div className="text-[10px] text-muted-txt">Miglior Record (PR)</div>
                        <div className="font-bold text-accent tabular-nums">
                          {pr.maxReps > 0 ? `${pr.maxReps} ripetizioni` : `${pr.maxSecs}s`}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-txt">Ultima esecuzione</div>
                        <div className="font-medium text-txt tabular-nums">
                          {pr.lastDate
                            ? new Date(pr.lastDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })
                            : '-'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-muted-txt">
                      Nessuna sessione registrata finora con questo esercizio.
                    </p>
                  )}
                </div>
              );
            })()}

            {/* Istruzioni */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-txt uppercase tracking-wider">Istruzioni tecniche</span>
              <ol className="text-xs text-muted-txt space-y-1 list-decimal list-inside pl-1">
                {selectedExercise.istruzioni.map((step, sIdx) => (
                  <li key={sIdx} className="leading-relaxed"><span className="text-txt">{step}</span></li>
                ))}
              </ol>
            </div>

            {/* Errori comuni */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-error uppercase tracking-wider">Errori comuni</span>
              <ul className="text-xs text-muted-txt space-y-1 list-disc list-inside pl-1">
                {selectedExercise.erroriComuni.map((err, eIdx) => (
                  <li key={eIdx} className="leading-relaxed">{err}</li>
                ))}
              </ul>
            </div>

            {/* Muscoli */}
            <div className="text-xs text-muted-txt">
              <span className="font-semibold text-txt">Muscoli coinvolti: </span>
              {selectedExercise.muscoli.join(', ')}
            </div>

            {/* Link YouTube */}
            <a
              href={`https://www.youtube.com/results?search_query=calisthenics+how+to+${encodeURIComponent(
                selectedExercise.nomeInglese
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[46px] rounded-xl bg-elevated border border-subtle text-xs font-semibold text-txt flex items-center justify-center gap-2 hover:bg-surface transition-colors"
            >
              <span>Guarda l’esecuzione su YouTube</span>
              <IconExternalLink size={14} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
