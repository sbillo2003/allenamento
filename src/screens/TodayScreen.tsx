/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp, ACTIVE_SESSION_STORAGE_KEY } from '../store/AppContext';
import { calculateRealSessionDurationMinutes } from '../logic/generator';
import { checkNeedRetest } from '../logic/progression';
import { scarichiDellaSeduta } from '../logic/recupero';
import { fasePiano } from '../logic/settimana';
import { messaggioCoach } from '../logic/coach';
import { NOMI_DISTRETTI } from '../data/muscoli';
import { PlannedSession, WorkoutLog, ActiveWorkoutState } from '../types';
import { HeroSettimana, GiornoSettimana } from '../components/home/HeroSettimana';
import { SchedaOggi } from '../components/home/SchedaOggi';
import { RiquadriHome } from '../components/home/RiquadriHome';
import { IconFlame, IconChevronRight, IconTrophy } from '../components/Icons';

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

  // Giorni della settimana per l'hero
  const giorni: GiornoSettimana[] = daysLabels.map((etichetta, idx) => ({
    etichetta,
    oggi: idx + 1 === currentDayOfWeek,
    completato: completedDaysThisWeek.has(idx + 1),
    previsto: !!plan?.sessions.some((x) => x.giorno === idx + 1)
  }));

  const faseBreve = fasePiano(plan?.settimanaCorrente || 1).breve;

  const messaggio = messaggioCoach({
    nome: profile?.nome || 'Atleta',
    sessioneInSospeso: !!activeSession,
    nessunAllenamentoFatto: workouts.length === 0,
    settimanaCiclo: plan?.settimanaCorrente || 1,
    sessioniFatte: completedSessionsCount,
    sessioniObiettivo: targetSessionsCount,
    sessioneOggi: plannedToday?.nome ?? null,
    oggiGiaAllenato: completedDaysThisWeek.has(currentDayOfWeek),
    distrettiScarichi: plannedToday
      ? scarichiDellaSeduta(plannedToday, workouts).map((x) => NOMI_DISTRETTI[x.distretto])
      : [],
    minutiStimati: plannedToday ? calculateRealSessionDurationMinutes(plannedToday) : 0
  });

  return (
    <div className="space-y-4 pb-24">
      {/* Intestazione */}
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
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-elevated border border-subtle text-accent text-xs font-bold tabular-nums"
            aria-label={`${weeklyStreak} ${weeklyStreak === 1 ? 'settimana' : 'settimane'} di serie`}
          >
            <IconFlame size={16} />
            <span>{weeklyStreak} sett.</span>
          </div>
        )}
      </div>

      {/* Coach: una frase sola, la prima regola che scatta */}
      <p className="text-sm leading-relaxed text-txt">
        <span className="mr-2 text-[10px] font-semibold uppercase tracking-wider text-muted-txt">
          Coach
        </span>
        {messaggio}
      </p>

      {/* Sessione interrotta */}
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
            {activeSession.session.nome}: riprendi esattamente da dove avevi lasciato.
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

      {/* Ri-test dovuto */}
      {isRetestDue && onOpenRetest && (
        <button
          type="button"
          onClick={onOpenRetest}
          className="w-full p-4 rounded-[20px] flex items-center gap-3 text-left active:scale-[0.99] transition-transform"
          style={{
            background: 'color-mix(in srgb, var(--color-accent) 10%, transparent)',
            border: '1px solid color-mix(in srgb, var(--color-accent) 40%, transparent)'
          }}
        >
          <span className="text-accent shrink-0">
            <IconTrophy size={20} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-txt">Tempo di ri-test</span>
            <span className="block text-[11px] text-muted-txt">
              Misura i progressi e aggiorna i livelli.
            </span>
          </span>
          <span className="text-accent shrink-0">
            <IconChevronRight size={18} />
          </span>
        </button>
      )}

      <HeroSettimana
        fatte={completedSessionsCount}
        obiettivo={targetSessionsCount}
        giorni={giorni}
      />

      <SchedaOggi
        oggi={plannedToday}
        primaNonFatta={firstUncompletedSession}
        workouts={workouts}
        faseBreve={faseBreve}
        onInizia={onStartWorkout}
      />

      <RiquadriHome workouts={workouts} settimanaCiclo={plan?.settimanaCorrente || 1} />
    </div>
  );
}
