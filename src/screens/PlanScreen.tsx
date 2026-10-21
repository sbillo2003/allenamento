/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { PlannedSession, PlannedBlock, Exercise, Pattern } from '../types';
import { EXERCISES, PATTERN_NAMES } from '../data/exercises';
import { calculateRealSessionDurationMinutes } from '../logic/generator';
import {
  IconPlay,
  IconSwap,
  IconClose,
  IconChevronRight,
  IconChevronLeft,
  IconRefresh,
  IconExternalLink
} from '../components/Icons';

interface PlanScreenProps {
  onStartWorkout: (session: PlannedSession) => void;
}

export function PlanScreen({ onStartWorkout }: PlanScreenProps) {
  const { state, dispatch } = useApp();
  const { plan, profile } = state;

  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(
    plan?.sessions[0]?.id || null
  );

  // Modal per swap esercizio
  const [swapTarget, setSwapTarget] = useState<{
    sessionId: string;
    blockIndex: number;
    currentExercise: Exercise;
  } | null>(null);

  // Modal per spostare giorno
  const [moveSessionTarget, setMoveSessionTarget] = useState<PlannedSession | null>(null);

  const daysLabels = [
    'Lunedì',
    'Martedì',
    'Mercoledì',
    'Giovedì',
    'Venerdì',
    'Sabato',
    'Domenica'
  ];

  if (!plan) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-muted-txt text-sm">Nessun piano attivo generato.</p>
        <button
          onClick={() => dispatch({ type: 'REGENERATE_PLAN' })}
          className="px-6 py-2.5 rounded-xl bg-accent text-accent-contrast font-bold text-sm"
        >
          Genera Piano
        </button>
      </div>
    );
  }

  const currentWeek = plan.settimanaCorrente || 1;
  let weekPhaseDescription = 'Volume base';
  if (currentWeek === 3 || currentWeek === 4) weekPhaseDescription = 'Sovraccarico (+1 serie)';
  else if (currentWeek === 5) weekPhaseDescription = 'Scarico attivo (-40% volume)';

  const sortedSessions = [...plan.sessions].sort((a, b) => a.giorno - b.giorno);

  return (
    <div className="space-y-6 pb-24">
      {/* 1. Header con settimana del ciclo */}
      <div className="flex justify-between items-start pt-2">
        <div>
          <span className="text-xs font-semibold text-accent uppercase tracking-wider">
            Split {plan.split}
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-txt mt-0.5">Piano d’Allenamento</h1>
          <p className="text-xs text-muted-txt mt-0.5">
            Settimana {currentWeek} di 5 · <span className="text-txt font-medium">{weekPhaseDescription}</span>
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => dispatch({ type: 'ADVANCE_WEEK' })}
            className="px-3 py-1.5 rounded-xl bg-elevated border border-subtle text-xs font-semibold text-txt hover:bg-surface transition-colors"
            title="Avanza settimana ciclo"
          >
            Settimana +1
          </button>
          <button
            onClick={() => dispatch({ type: 'REGENERATE_PLAN' })}
            className="w-9 h-9 rounded-xl bg-elevated border border-subtle flex items-center justify-center text-muted-txt hover:text-txt transition-colors"
            title="Rigenera piano da zero"
            aria-label="Rigenera piano"
          >
            <IconRefresh size={16} />
          </button>
        </div>
      </div>

      {/* 2. Lista delle sessioni settimanali */}
      <div className="space-y-4">
        {sortedSessions.map((session) => {
          const isExpanded = expandedSessionId === session.id;
          const dayName = daysLabels[session.giorno - 1] || `Giorno ${session.giorno}`;

          return (
            <div
              key={session.id}
              className="rounded-[20px] bg-surface border border-subtle overflow-hidden transition-all"
            >
              {/* Header card sessione */}
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-elevated/40"
                onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-accent uppercase">
                      {dayName}
                    </span>
                    <span className="text-[11px] text-muted-txt">·</span>
                    <span className="text-[11px] text-muted-txt tabular-nums">
                      {session.blocks.length} esercizi · ~{calculateRealSessionDurationMinutes(session)} min
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-txt">{session.nome}</h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMoveSessionTarget(session);
                    }}
                    className="text-[11px] font-semibold text-muted-txt hover:text-txt py-1 px-2.5 rounded-lg border border-subtle"
                  >
                    Sposta giorno
                  </button>
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-txt">
                    <IconChevronRight
                      size={18}
                      className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    />
                  </span>
                </div>
              </div>

              {/* Dettaglio esercizi espansi */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-subtle/50 space-y-3">
                  <div className="space-y-2">
                    {session.blocks.map((block, bIdx) => {
                      const exercise = EXERCISES.find((e) => e.id === block.exerciseId);
                      if (!exercise) return null;

                      return (
                        <div
                          key={bIdx}
                          className="p-3 rounded-xl bg-elevated/60 border border-subtle flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-txt">
                              <span>Lv.{exercise.livello}</span>
                              <span>·</span>
                              <span>{PATTERN_NAMES[exercise.pattern]}</span>
                            </div>
                            <div className="font-semibold text-txt truncate">{exercise.nome}</div>
                            <div className="text-muted-txt tabular-nums font-mono text-[11px]">
                              {block.serie} serie ×{' '}
                              {exercise.tipo === 'tempo'
                                ? `${block.secondi}s`
                                : `${block.repMin}-${block.repMax} reps`}{' '}
                              (rec. {block.recuperoSec}s)
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                setSwapTarget({
                                  sessionId: session.id,
                                  blockIndex: bIdx,
                                  currentExercise: exercise
                                })
                              }
                              className="p-2 rounded-lg bg-surface border border-subtle text-muted-txt hover:text-accent"
                              title="Sostituisci esercizio"
                              aria-label="Sostituisci esercizio"
                            >
                              <IconSwap size={15} />
                            </button>
                            <a
                              href={`https://www.youtube.com/results?search_query=calisthenics+how+to+${encodeURIComponent(
                                exercise.nomeInglese
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-surface border border-subtle text-muted-txt hover:text-txt"
                              title="Guarda esecuzione"
                              aria-label="Guarda esecuzione su YouTube"
                            >
                              <IconExternalLink size={15} />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => onStartWorkout(session)}
                    className="w-full min-h-[46px] rounded-xl bg-accent text-accent-contrast font-bold text-sm flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all"
                  >
                    <IconPlay size={16} />
                    <span>Inizia questa sessione</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODALE SOSTITUISCI ESERCIZIO */}
      {swapTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end">
          <div className="bg-[#141A22] border-t border-[#2A3540] rounded-t-3xl p-5 space-y-3 max-h-[80vh] overflow-y-auto max-w-[480px] mx-auto w-full">
            <div className="flex justify-between items-center mb-1">
              <div>
                <h3 className="text-base font-bold text-txt">Sostituisci con alternativa</h3>
                <span className="text-xs text-muted-txt">
                  Pattern: {PATTERN_NAMES[swapTarget.currentExercise.pattern]}
                </span>
              </div>
              <button
                onClick={() => setSwapTarget(null)}
                className="w-8 h-8 rounded-lg bg-elevated flex items-center justify-center text-muted-txt hover:text-txt"
              >
                <IconClose size={16} />
              </button>
            </div>

            <div className="space-y-2 mt-2">
              {EXERCISES.filter(
                (e) =>
                  e.pattern === swapTarget.currentExercise.pattern &&
                  e.id !== swapTarget.currentExercise.id
              ).map((alt) => (
                <button
                  key={alt.id}
                  onClick={() => {
                    dispatch({
                      type: 'SWAP_EXERCISE',
                      payload: {
                        sessionId: swapTarget.sessionId,
                        blockIndex: swapTarget.blockIndex,
                        newExerciseId: alt.id
                      }
                    });
                    setSwapTarget(null);
                  }}
                  className="w-full p-3 rounded-xl bg-elevated border border-subtle text-left flex justify-between items-center hover:border-accent transition-colors"
                >
                  <div>
                    <div className="text-xs font-bold text-txt">{alt.nome}</div>
                    <div className="text-[10px] text-muted-txt">
                      Livello {alt.livello} · {alt.tipo === 'tempo' ? 'A tempo' : 'Ripetizioni'}
                    </div>
                  </div>
                  <span className="text-xs text-accent font-semibold">Scegli</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODALE SPOSTA GIORNO */}
      {moveSessionTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-surface border border-subtle rounded-2xl p-5 max-w-sm w-full space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-txt">Sposta {moveSessionTarget.nome}</h3>
              <button
                onClick={() => setMoveSessionTarget(null)}
                className="w-8 h-8 rounded-lg bg-elevated flex items-center justify-center text-muted-txt"
              >
                <IconClose size={16} />
              </button>
            </div>
            <p className="text-xs text-muted-txt">Scegli in quale giorno eseguire questo allenamento:</p>

            <div className="space-y-1.5">
              {daysLabels.map((dayName, idx) => {
                const dayNum = idx + 1;
                const isCurrent = moveSessionTarget.giorno === dayNum;

                return (
                  <button
                    key={dayName}
                    onClick={() => {
                      dispatch({
                        type: 'MOVE_SESSION_DAY',
                        payload: {
                          sessionId: moveSessionTarget.id,
                          newDay: dayNum
                        }
                      });
                      setMoveSessionTarget(null);
                    }}
                    className={`w-full p-2.5 rounded-xl border text-xs font-semibold flex justify-between items-center transition-all ${
                      isCurrent
                        ? 'bg-elevated border-accent text-accent'
                        : 'bg-surface border-subtle text-txt hover:bg-elevated'
                    }`}
                  >
                    <span>{dayName}</span>
                    {isCurrent && <span className="text-[10px]">Attuale</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
