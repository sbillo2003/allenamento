/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp, ACTIVE_SESSION_STORAGE_KEY } from '../store/AppContext';
import { EXERCISES, PATTERN_NAMES } from '../data/exercises';
import { WARMUP_ROUTINE, calculateRealSessionDurationMinutes } from '../logic/generator';
import { checkNeedRetest } from '../logic/progression';
import { RecuperoCard } from '../components/RecuperoCard';
import { calcolaRecupero, avvisiPerSeduta } from '../logic/recupero';
import { distrettiDiPiuEsercizi, NOMI_DISTRETTI } from '../data/muscoli';
import { PlannedSession, WorkoutLog, ActiveWorkoutState } from '../types';
import {
  IconPlay,
  IconCheck,
  IconFlame,
  IconInfo,
  IconChevronRight,
  IconTrophy,
  IconRefresh
} from '../components/Icons';

interface TodayScreenProps {
  onStartWorkout: (session: PlannedSession, resumeState?: ActiveWorkoutState | null) => void;
  onOpenRetest?: () => void;
}

/**
 * Calcola le settimane consecutive in cui l'utente ha completato almeno il numero
 * di sessioni previste dal profilo. I giorni di riposo non spezzano la serie.
 */
export function calculateWeeklyStreak(workouts: WorkoutLog[], targetSessions: number): number {
  if (!workouts || workouts.length === 0 || targetSessions <= 0) return 0;

  const now = new Date();
  const currentDay = now.getDay() === 0 ? 7 : now.getDay();

  // Inizio settimana corrente (Lunedì 00:00:00)
  const currentWeekMonday = new Date(now);
  currentWeekMonday.setDate(now.getDate() - (currentDay - 1));
  currentWeekMonday.setHours(0, 0, 0, 0);

  // Raggruppa i workout per settimana di calendario
  const weekCounts = new Map<number, number>();

  for (const w of workouts) {
    const d = new Date(w.data);
    const day = d.getDay() === 0 ? 7 : d.getDay();
    const mon = new Date(d);
    mon.setDate(d.getDate() - (day - 1));
    mon.setHours(0, 0, 0, 0);
    const monTime = mon.getTime();
    weekCounts.set(monTime, (weekCounts.get(monTime) || 0) + 1);
  }

  const curMonTime = currentWeekMonday.getTime();
  const currentWeekCount = weekCounts.get(curMonTime) || 0;
  const oneWeekMs = 7 * 24 * 3600 * 1000;
  let streak = 0;

  if (currentWeekCount >= targetSessions) {
    // La settimana in corso ha già raggiunto l'obiettivo
    streak = 1;
    let prevMonTime = curMonTime - oneWeekMs;
    while ((weekCounts.get(prevMonTime) || 0) >= targetSessions) {
      streak++;
      prevMonTime -= oneWeekMs;
    }
  } else {
    // La settimana in corso è ancora aperta: i giorni di riposo non spezzano la serie
    // Si controllano le settimane precedenti concluse
    let checkMonTime = curMonTime - oneWeekMs;
    while ((weekCounts.get(checkMonTime) || 0) >= targetSessions) {
      streak++;
      checkMonTime -= oneWeekMs;
    }
  }

  return streak;
}

export function TodayScreen({ onStartWorkout, onOpenRetest }: TodayScreenProps) {
  const { state } = useApp();
  const { plan, workouts, profile } = state;

  const [activeSession, setActiveSession] = useState<ActiveWorkoutState | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const today = new Date();
  const currentDayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
  const daysLabels = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

  // Verifica quali giorni di questa settimana hanno un workout completato
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - (currentDayOfWeek - 1));
  startOfWeek.setHours(0, 0, 0, 0);

  const completedDaysThisWeek = new Set<number>();
  const completedSessionIdsThisWeek = new Set<string>();

  workouts.forEach((w) => {
    const wDate = new Date(w.data);
    if (wDate >= startOfWeek) {
      const dayNum = wDate.getDay() === 0 ? 7 : wDate.getDay();
      completedDaysThisWeek.add(dayNum);
      if (w.sessionId) {
        completedSessionIdsThisWeek.add(w.sessionId);
      }
    }
  });

  // Calcolo streak reale di settimane consecutive
  const targetSessionsCount = profile?.giorniSettimana || 3;
  const weeklyStreak = calculateWeeklyStreak(workouts, targetSessionsCount);

  // Trova la sessione prevista per oggi nel piano
  const plannedToday = plan?.sessions.find((s) => s.giorno === currentDayOfWeek);
  const isRestDay = !plannedToday;

  // Nel giorno di riposo, trova la prima sessione della settimana non ancora completata
  const firstUncompletedSession =
    plan?.sessions.find(
      (s) => !completedSessionIdsThisWeek.has(s.id) && !completedDaysThisWeek.has(s.giorno)
    ) || plan?.sessions[0];

  // Controllo se sono trascorse 6 settimane dall'ultimo test
  const lastAssessmentDate = state.assessments[0]?.data || state.profile?.creatoIl || null;
  const isRetestDue = checkNeedRetest(lastAssessmentDate);

  const completedSessionsCount = completedDaysThisWeek.size;

  const discardActiveSession = () => {
    try {
      localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
    } catch {
      // ignore
    }
    setActiveSession(null);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* 1. Header con Data e Streak Settimanale Reale */}
      <div className="flex justify-between items-end pt-2">
        <div>
          <span className="text-xs font-semibold text-muted-txt uppercase tracking-wider">
            {today.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-txt mt-0.5">
            Ciao, {profile?.nome || 'Atleta'}
          </h1>
        </div>

        {weeklyStreak > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-elevated border border-subtle text-accent text-xs font-bold tabular-nums">
            <IconFlame size={16} />
            <span>{weeklyStreak} {weeklyStreak === 1 ? 'settimana di serie' : 'settimane di serie'}</span>
          </div>
        )}
      </div>

      {/* 2. Banner Ripresa Sessione Interrotta (se salvata in localStorage) */}
      {activeSession && (
        <div className="p-4 rounded-[20px] bg-elevated border border-accent space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-accent uppercase tracking-wider">
              Sessione in sospeso
            </div>
            <span className="text-[10px] text-muted-txt tabular-nums">
              {activeSession.completedSets.length} serie completate
            </span>
          </div>
          <p className="text-xs text-txt leading-relaxed">
            Hai interrotto l'allenamento per <span className="font-semibold text-accent">{activeSession.session.nome}</span>. Vuoi riprenderlo esattamente da dove avevi lasciato?
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={discardActiveSession}
              className="h-10 rounded-xl bg-surface border border-subtle text-xs font-semibold text-muted-txt hover:text-txt transition-colors"
            >
              Scarta sessione
            </button>
            <button
              type="button"
              onClick={() => onStartWorkout(activeSession.session, activeSession)}
              className="h-10 rounded-xl bg-accent text-accent-contrast text-xs font-bold hover:opacity-95 transition-opacity"
            >
              Riprendi allenamento
            </button>
          </div>
        </div>
      )}

      {/* 3. Scheda Ri-Test Fisico (quando sono passate 6 settimane) */}
      {isRetestDue && onOpenRetest && (
        <div className="p-4 rounded-[20px] bg-accent/10 border border-accent/40 space-y-3">
          <div className="flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-wider">
            <IconTrophy size={16} />
            <span>Tempo di Ri-Test (6 settimane passate)</span>
          </div>
          <p className="text-xs text-txt leading-relaxed">
            Sono trascorse più di 6 settimane dal tuo ultimo test massimale. Esegui il ri-test per misurare i tuoi progressi di forza reali e aggiornare i pattern motori.
          </p>
          <button
            onClick={onOpenRetest}
            className="w-full min-h-[44px] rounded-xl bg-accent text-accent-contrast font-bold text-xs flex items-center justify-center gap-2 hover:opacity-95 active:scale-95 transition-all"
          >
            <span>Avvia Ri-Test Fisico</span>
            <IconChevronRight size={16} />
          </button>
        </div>
      )}

      {/* 4. Striscia dei 7 giorni della settimana */}
      <div className="p-3.5 rounded-[20px] bg-surface border border-subtle space-y-2">
        <div className="flex justify-between items-center text-xs text-muted-txt">
          <span>Settimana {plan?.settimanaCorrente || 1} di 5</span>
          <span className="tabular-nums font-semibold text-txt">
            {completedSessionsCount} / {targetSessionsCount} sessioni
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 pt-1">
          {daysLabels.map((lbl, idx) => {
            const dayNum = idx + 1;
            const isToday = dayNum === currentDayOfWeek;
            const isCompleted = completedDaysThisWeek.has(dayNum);
            const hasPlan = plan?.sessions.some((s) => s.giorno === dayNum);

            return (
              <div
                key={lbl}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
                  isToday
                    ? 'border-2 border-accent bg-elevated'
                    : 'bg-elevated/40 border border-subtle'
                }`}
              >
                <span className="text-[10px] text-muted-txt font-medium">{lbl}</span>
                <span className="w-5 h-5 flex items-center justify-center mt-1">
                  {isCompleted ? (
                    <span className="w-4 h-4 rounded-full bg-accent text-accent-contrast flex items-center justify-center">
                      <IconCheck size={11} />
                    </span>
                  ) : hasPlan ? (
                    <span className="w-2 h-2 rounded-full bg-muted-txt/50" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-subtle" />
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recupero muscolare */}
      <RecuperoCard workouts={workouts} />

      {/* 5. Scheda Allenamento di Oggi */}
      {!isRestDay && plannedToday ? (
        <div className="p-5 rounded-[20px] bg-surface border border-subtle space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                Allenamento in programma
              </span>
              <h2 className="text-xl font-bold text-txt mt-0.5">{plannedToday.nome}</h2>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-txt font-medium">Stima reale</span>
              <div className="text-sm font-bold text-txt tabular-nums">
                ~{calculateRealSessionDurationMinutes(plannedToday)} min
              </div>
            </div>
          </div>

          {/* Avviso: distretti della seduta ancora scarichi */}
          {(() => {
            const esercizi = plannedToday.blocks
              .map((b) => EXERCISES.find((e) => e.id === b.exerciseId))
              .filter((e): e is NonNullable<typeof e> => !!e);
            const primari = distrettiDiPiuEsercizi(esercizi).primari;
            const scarichi = avvisiPerSeduta(calcolaRecupero(workouts), primari);
            if (scarichi.length === 0) return null;
            const elenco =
              scarichi
                .slice(0, 3)
                .map((x) => `${NOMI_DISTRETTI[x.distretto].toLowerCase()} al ${x.percentuale}%`)
                .join(', ') + (scarichi.length > 3 ? ` e altri ${scarichi.length - 3}` : '');
            return (
              <div className="p-3 rounded-xl bg-elevated border border-error/40 text-xs leading-relaxed">
                <span className="font-semibold text-error">Muscoli ancora scarichi: </span>
                <span className="text-muted-txt">
                  {elenco}. Puoi allenarti lo stesso, ma se hai margine conviene aspettare.
                </span>
              </div>
            );
          })()}

          {/* Elenco compatto esercizi */}
          <div className="space-y-2 pt-1 border-t border-subtle">
            <div className="text-xs font-semibold text-muted-txt mb-2">
              Esercizi previsti ({plannedToday.blocks.length}):
            </div>
            {plannedToday.blocks.map((b, idx) => {
              const ex = EXERCISES.find((e) => e.id === b.exerciseId);
              if (!ex) return null;
              return (
                <div key={idx} className="flex justify-between items-center py-1.5 border-b border-subtle/50 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-muted-txt tabular-nums font-mono w-4">{idx + 1}.</span>
                    <span className="font-medium text-txt truncate">{ex.nome}</span>
                  </div>
                  <span className="text-muted-txt tabular-nums shrink-0 font-medium ml-2">
                    {b.serie} × {ex.tipo === 'tempo' ? `${b.secondi}s` : `${b.repMin}-${b.repMax}`}
                    {ex.unilaterale && ' (lato)'}
                  </span>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => onStartWorkout(plannedToday)}
            className="w-full min-h-[52px] rounded-2xl bg-accent text-accent-contrast font-bold text-base flex items-center justify-center gap-2 shadow-sm hover:opacity-95 active:scale-[0.98] transition-all"
          >
            <IconPlay size={18} />
            <span>Inizia allenamento</span>
          </button>
        </div>
      ) : (
        /* Giorno di Riposo */
        <div className="p-5 rounded-[20px] bg-surface border border-subtle space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-rest uppercase tracking-wider">
              Giorno di Riposo Attivo
            </span>
            <h2 className="text-xl font-bold text-txt">Recupero e Adattamento</h2>
            <p className="text-xs text-muted-txt leading-relaxed">
              La sintesi proteica e la crescita della forza avvengono durante il riposo. Dedica 10 minuti alla mobilità articolare.
            </p>
          </div>

          {/* Suggerimenti di mobilità */}
          <div className="p-3.5 rounded-xl bg-elevated border border-subtle space-y-2 text-xs">
            <span className="font-semibold text-txt">Routine di scarico consigliata:</span>
            <ul className="space-y-1.5 text-muted-txt list-disc list-inside">
              {WARMUP_ROUTINE.slice(0, 3).map((w, idx) => (
                <li key={idx}>
                  <span className="text-txt font-medium">{w.nome}</span> ({w.durataSec}s)
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-2">
            <div className="text-xs text-muted-txt text-center mb-2">Vuoi allenarti comunque oggi?</div>
            {firstUncompletedSession && (
              <button
                onClick={() => onStartWorkout(firstUncompletedSession)}
                className="w-full min-h-[48px] rounded-xl bg-elevated border border-accent text-accent font-bold text-sm flex items-center justify-center gap-2 hover:bg-surface active:scale-[0.98] transition-all"
              >
                <span>Allenati lo stesso ({firstUncompletedSession.nome})</span>
                <IconChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 6. Struttura del ciclo */}
      <div className="p-4 rounded-[20px] bg-elevated border border-subtle flex items-start gap-3 text-xs">
        <IconInfo size={18} className="text-accent shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold text-txt">Struttura del Ciclo (5 Settimane):</span>
          <p className="text-muted-txt leading-relaxed">
            Sei nella Settimana {plan?.settimanaCorrente || 1}. Alla settimana 3 e 4 aumentiamo le serie sui fondamentali; la settimana 5 prevede scarico al -40% prima del nuovo test massimale.
          </p>
        </div>
      </div>
    </div>
  );
}
