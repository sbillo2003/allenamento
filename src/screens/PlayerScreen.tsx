/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  PlannedSession,
  PlannedBlock,
  Exercise,
  SetLog,
  SetFeedback,
  ExecutionQuality,
  WorkoutLog,
  ActiveWorkoutState
} from '../types';
import { EXERCISES, PATTERN_NAMES } from '../data/exercises';
import { WARMUP_ROUTINE } from '../logic/generator';
import { SchedaSerie, SFUMATURA_SPINTA } from '../components/SchedaSerie';
import { useApp, ACTIVE_SESSION_STORAGE_KEY } from '../store/AppContext';
import {
  playCountdownBeep,
  playRestCompleteSound,
  triggerVibration,
  speakItalian,
  requestWakeLock
} from '../utils/feedback';
import {
  IconClose,
  IconPause,
  IconPlay,
  IconCheck,
  IconInfo,
  IconSwap,
  IconExternalLink,
  IconTrophy,
  IconRefresh
} from '../components/Icons';

interface PlayerProps {
  session: PlannedSession;
  onClose: () => void;
  resumedState?: ActiveWorkoutState | null;
}

export function PlayerScreen({ session, onClose, resumedState }: PlayerProps) {
  const { state, dispatch } = useApp();
  const { settings, workouts } = state;

  // Il riscaldamento si salta quando si riprende una sessione interrotta:
  // chi riprende l'ha gia' fatto.
  const [fase, setFase] = useState<'riscaldamento' | 'allenamento'>(
    resumedState ? 'allenamento' : 'riscaldamento'
  );
  const [warmupIndex, setWarmupIndex] = useState(0);
  const [warmupRemaining, setWarmupRemaining] = useState(WARMUP_ROUTINE[0].durataSec);
  const warmupEndTimeRef = useRef<number>(Date.now() + WARMUP_ROUTINE[0].durataSec * 1000);

  // Session state (resumed or initial)
  const [currentBlockIndex, setCurrentBlockIndex] = useState(
    resumedState ? resumedState.currentBlockIndex : 0
  );
  const [currentSetIndex, setCurrentSetIndex] = useState(
    resumedState ? resumedState.currentSetIndex : 1
  );
  const [isResting, setIsResting] = useState(false);
  const [restRemaining, setRestRemaining] = useState(90);
  const [initialRestDuration, setInitialRestDuration] = useState(90);
  const [isPaused, setIsPaused] = useState(false);

  // Time-based exercise timer
  const [tempoRemaining, setTempoRemaining] = useState(30);
  const [isTempoRunning, setIsTempoRunning] = useState(false);

  // Reps adjustment for bilateral
  const [repsDone, setRepsDone] = useState(10);
  const [backpackKg, setBackpackKg] = useState<number | undefined>(undefined);

  // Unilateral controls (destra e sinistra separati)
  const [repsDestra, setRepsDestra] = useState(10);
  const [repsSinistra, setRepsSinistra] = useState(10);
  const [tempoDestra, setTempoDestra] = useState(30);
  const [tempoSinistra, setTempoSinistra] = useState(30);

  // Modals & Drawers
  const [showInstructions, setShowInstructions] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [editingSetIndex, setEditingSetIndex] = useState<number | null>(null);

  // Completed workout sets & timers
  const [completedSets, setCompletedSets] = useState<SetLog[]>(
    resumedState ? resumedState.completedSets : []
  );
  const [workoutFinished, setWorkoutFinished] = useState(false);
  const [workoutDurationSec, setWorkoutDurationSec] = useState(
    resumedState ? resumedState.workoutDurationSec : 0
  );
  const [feeling, setFeeling] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [notes, setNotes] = useState('');

  // Rest timer end timestamp ref (per non bloccarsi in background)
  const restEndTimeRef = useRef<number | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const currentBlock = session.blocks[currentBlockIndex] || session.blocks[0];
  const currentExercise = EXERCISES.find((e) => e.id === currentBlock?.exerciseId) || EXERCISES[0];
  const isTempo = currentExercise.tipo === 'tempo';
  const isUnilateral = Boolean(currentExercise.unilaterale);

  // Initialize reps/seconds for current block
  useEffect(() => {
    if (isTempo) {
      const sec = currentBlock.secondi || 30;
      setTempoRemaining(sec);
      setTempoDestra(sec);
      setTempoSinistra(sec);
      setIsTempoRunning(false);
    } else {
      const reps = currentBlock.repMax || 10;
      setRepsDone(reps);
      setRepsDestra(reps);
      setRepsSinistra(reps);
    }
    setBackpackKg(currentBlock.zavorraKg);
  }, [currentBlockIndex, isTempo, currentBlock]);

  // Request WakeLock to keep screen awake during workout
  useEffect(() => {
    let isMounted = true;
    requestWakeLock().then((lock) => {
      if (isMounted) wakeLockRef.current = lock;
    });

    return () => {
      isMounted = false;
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
      }
    };
  }, []);

  // Announce exercise with voice on load
  useEffect(() => {
    if (settings.voce && currentExercise) {
      speakItalian(`Esercizio ${currentBlockIndex + 1}: ${currentExercise.nome}`);
    }
  }, [currentBlockIndex, currentExercise, settings.voce]);

  // Total session timer
  useEffect(() => {
    if (workoutFinished || isPaused) return;
    const interval = setInterval(() => {
      setWorkoutDurationSec((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [workoutFinished, isPaused]);

  // Conto alla rovescia del riscaldamento. Come per i recuperi, il residuo si
  // ricava dalla differenza con un timestamp di fine: non si sfasa se la scheda
  // finisce in background.
  useEffect(() => {
    if (fase !== 'riscaldamento') return;

    const aggiorna = () => {
      const residuo = Math.max(0, Math.round((warmupEndTimeRef.current - Date.now()) / 1000));
      setWarmupRemaining(residuo);

      if (residuo === 0) {
        setWarmupIndex((indice) => {
          if (indice < WARMUP_ROUTINE.length - 1) {
            const prossimo = indice + 1;
            warmupEndTimeRef.current = Date.now() + WARMUP_ROUTINE[prossimo].durataSec * 1000;
            setWarmupRemaining(WARMUP_ROUTINE[prossimo].durataSec);
            return prossimo;
          }
          setFase('allenamento');
          return indice;
        });
      }
    };

    const interval = setInterval(aggiorna, 500);
    document.addEventListener('visibilitychange', aggiorna);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', aggiorna);
    };
  }, [fase]);

  // Rest countdown timer basato sulla differenza tra timestamp di fine e Date.now()
  // Include listener visibilitychange per risincronizzare istantaneamente al ritorno in primo piano
  useEffect(() => {
    if (!isResting || isPaused) return;

    const updateRemaining = () => {
      if (!restEndTimeRef.current) return;
      const diffMs = restEndTimeRef.current - Date.now();
      const remaining = Math.max(0, Math.ceil(diffMs / 1000));
      setRestRemaining(remaining);

      if (remaining <= 3 && remaining > 0 && settings.suoni) {
        playCountdownBeep(remaining === 1);
      }

      if (remaining <= 0) {
        if (settings.suoni) playRestCompleteSound();
        if (settings.vibrazione) triggerVibration([80, 50, 80]);
        if (settings.voce) speakItalian('Recupero terminato. Inizia la serie!');
        setIsResting(false);
        restEndTimeRef.current = null;
      }
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 300);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateRemaining();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isResting, isPaused, settings]);

  // Modificatori manuali recupero (+15s / -15s)
  const adjustRest = (seconds: number) => {
    if (!restEndTimeRef.current) return;
    restEndTimeRef.current += seconds * 1000;
    const diffMs = restEndTimeRef.current - Date.now();
    const remaining = Math.max(0, Math.ceil(diffMs / 1000));
    setRestRemaining(remaining);
  };

  const skipRest = () => {
    restEndTimeRef.current = null;
    setIsResting(false);
    setRestRemaining(0);
  };

  // Tempo countdown timer (per esercizi isometrici come plank)
  useEffect(() => {
    if (!isTempoRunning || isPaused || isResting) return;

    if (tempoRemaining <= 0) {
      if (settings.suoni) playRestCompleteSound();
      if (settings.vibrazione) triggerVibration(100);
      setIsTempoRunning(false);
      handleCompleteSet('giusto', 'pulita');
      return;
    }

    if (tempoRemaining <= 3 && tempoRemaining > 0 && settings.suoni) {
      playCountdownBeep(tempoRemaining === 1);
    }

    const timer = setInterval(() => {
      setTempoRemaining((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isTempoRunning, tempoRemaining, isPaused, isResting, settings]);

  // Completamento serie corrente e salvataggio automatico in localStorage
  const handleCompleteSet = (
    feedback: SetFeedback = 'giusto',
    qualita: ExecutionQuality = 'pulita'
  ) => {
    if (settings.vibrazione) triggerVibration(40);

    const log: SetLog = {
      exerciseId: currentExercise.id,
      serie: currentSetIndex,
      repsFatte: isTempo
        ? 0
        : isUnilateral
        ? Math.min(repsDestra, repsSinistra)
        : repsDone,
      secondiFatti: isTempo
        ? isUnilateral
          ? Math.min(tempoDestra, tempoSinistra)
          : (currentBlock.secondi || 30) - tempoRemaining
        : 0,
      feedback,
      qualita,
      repsDestra: isUnilateral ? repsDestra : undefined,
      repsSinistra: isUnilateral ? repsSinistra : undefined,
      secondiDestra: isUnilateral && isTempo ? tempoDestra : undefined,
      secondiSinistra: isUnilateral && isTempo ? tempoSinistra : undefined
    };

    const updatedSets = [...completedSets, log];
    setCompletedSets(updatedSets);

    let nextBlockIdx = currentBlockIndex;
    let nextSetIdx = currentSetIndex;

    // Se ci sono altre serie in questo blocco
    if (currentSetIndex < currentBlock.serie) {
      nextSetIdx = currentSetIndex + 1;
      setCurrentSetIndex(nextSetIdx);

      // Avvia recupero
      const restSec = currentBlock.recuperoSec || 90;
      setInitialRestDuration(restSec);
      setRestRemaining(restSec);
      restEndTimeRef.current = Date.now() + restSec * 1000;
      setIsResting(true);

      if (isTempo) {
        setTempoRemaining(currentBlock.secondi || 30);
      }
    } else {
      // Se ci sono altri esercizi nella sessione
      if (currentBlockIndex < session.blocks.length - 1) {
        nextBlockIdx = currentBlockIndex + 1;
        nextSetIdx = 1;
        setCurrentBlockIndex(nextBlockIdx);
        setCurrentSetIndex(1);

        const restSec = currentBlock.recuperoSec || 90;
        setInitialRestDuration(restSec);
        setRestRemaining(restSec);
        restEndTimeRef.current = Date.now() + restSec * 1000;
        setIsResting(true);
      } else {
        // Allenamento concluso!
        setWorkoutFinished(true);
      }
    }

    // Salva lo stato in localStorage a ogni serie confermata
    try {
      const activeState: ActiveWorkoutState = {
        session,
        currentBlockIndex: nextBlockIdx,
        currentSetIndex: nextSetIdx,
        completedSets: updatedSets,
        workoutDurationSec,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, JSON.stringify(activeState));
    } catch (err) {
      console.error('Errore salvataggio sessione attiva:', err);
    }
  };

  // Termina e salva l'allenamento nel registro permanente
  const handleFinishAndSave = () => {
    const workoutLog: WorkoutLog = {
      id: `workout_${Date.now()}`,
      sessionId: session.id,
      sessionName: session.nome,
      data: new Date().toISOString(),
      durataSec: workoutDurationSec,
      sets: completedSets,
      sensazione: feeling,
      note: notes.trim()
    };

    dispatch({
      type: 'FINISH_WORKOUT',
      payload: { workout: workoutLog }
    });

    try {
      localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
    } catch {
      // ignore
    }

    onClose();
  };

  // Uscita con eliminazione della sessione interrotta
  const handleDiscardAndExit = () => {
    try {
      localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
    } catch {
      // ignore
    }
    onClose();
  };

  // Trova lo storico dell'ultima volta per l'esercizio corrente
  const lastWorkoutWithExercise = workouts.find((w) =>
    w.sets.some((s) => s.exerciseId === currentExercise.id)
  );

  let lastHistoryDisplay = 'prima volta';
  if (lastWorkoutWithExercise) {
    const exSets = lastWorkoutWithExercise.sets.filter(
      (s) => s.exerciseId === currentExercise.id
    );
    if (exSets.length > 0) {
      const totalSetsCount = exSets.length;
      const bestVal = Math.max(
        ...exSets.map((s) => (isTempo ? s.secondiFatti : s.repsFatte) || 0)
      );
      const lastFb = exSets[exSets.length - 1].feedback;
      const unit = isTempo ? 's' : ' reps';
      lastHistoryDisplay = `${totalSetsCount} serie, max ${bestVal}${unit} (${lastFb})`;
    }
  }

  // Calcolo avanzamento complessivo
  const totalSetsInWorkout = session.blocks.reduce((acc, b) => acc + b.serie, 0);
  const sessionProgress = Math.min(100, Math.round((completedSets.length / totalSetsInWorkout) * 100));

  // Sostituzione esercizio
  const handleSwap = (newExId: string) => {
    dispatch({
      type: 'SWAP_EXERCISE',
      payload: {
        sessionId: session.id,
        blockIndex: currentBlockIndex,
        newExerciseId: newExId
      }
    });
    setShowSwapModal(false);
  };

  const alternatives = EXERCISES.filter(
    (e) => e.pattern === currentExercise.pattern && e.id !== currentExercise.id
  );

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // SCHERMATA DI RISCALDAMENTO: prima fase guidata, un movimento per volta
  if (fase === 'riscaldamento') {
    const movimento = WARMUP_ROUTINE[warmupIndex];
    const frazione = 1 - warmupRemaining / movimento.durataSec;

    const prossimoMovimento = () => {
      if (warmupIndex < WARMUP_ROUTINE.length - 1) {
        const next = warmupIndex + 1;
        setWarmupIndex(next);
        setWarmupRemaining(WARMUP_ROUTINE[next].durataSec);
        warmupEndTimeRef.current = Date.now() + WARMUP_ROUTINE[next].durataSec * 1000;
      } else {
        setFase('allenamento');
      }
    };

    return (
      <div className="fixed inset-0 z-50 bg-[#0A0E13] text-[#F2F6FA] flex flex-col max-w-[480px] mx-auto">
        <div className="flex items-center justify-between px-4 pt-5 pb-3">
          <button
            type="button"
            onClick={onClose}
            aria-label="Esci dall'allenamento"
            className="w-11 h-11 rounded-xl bg-[#1D262F] flex items-center justify-center"
          >
            <IconClose size={18} />
          </button>
          <div className="text-center">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#8D9BAA]">
              Riscaldamento
            </div>
            <div className="text-xs font-semibold text-[#B8FF3C]">
              Movimento {warmupIndex + 1} di {WARMUP_ROUTINE.length}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFase('allenamento')}
            className="h-11 px-3 rounded-xl bg-[#1D262F] text-[11px] font-semibold text-[#8D9BAA]"
          >
            Salta tutto
          </button>
        </div>

        {/* Barra di avanzamento del riscaldamento */}
        <div className="px-4">
          <div className="h-1 rounded-full bg-[#2A3540] overflow-hidden">
            <div
              className="h-full bg-[#B8FF3C] transition-all duration-500"
              style={{ width: `${((warmupIndex + frazione) / WARMUP_ROUTINE.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight">{movimento.nome}</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#8D9BAA]">{movimento.istruzione}</p>

          <div className="relative mt-8 flex items-center justify-center">
            <svg width="200" height="200" viewBox="0 0 200 200" className="-rotate-90">
              <circle cx="100" cy="100" r="86" stroke="#2A3540" strokeWidth="8" fill="transparent" />
              <circle
                cx="100"
                cy="100"
                r="86"
                stroke="#B8FF3C"
                strokeWidth="8"
                strokeLinecap="round"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 86}
                strokeDashoffset={2 * Math.PI * 86 * frazione}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <span className="absolute text-6xl font-bold tabular-nums tracking-tighter">
              {warmupRemaining}
            </span>
          </div>
        </div>

        <div className="px-4 pb-8 space-y-2">
          <button
            type="button"
            onClick={prossimoMovimento}
            className="w-full min-h-[52px] rounded-2xl bg-[#B8FF3C] text-[#0A0E13] font-bold"
          >
            {warmupIndex < WARMUP_ROUTINE.length - 1 ? 'Movimento successivo' : 'Inizia allenamento'}
          </button>
          <p className="text-center text-[11px] text-[#8D9BAA]">
            Il movimento successivo parte da solo a fine conteggio.
          </p>
        </div>
      </div>
    );
  }

  // SCHERMATA FINALE: RIEPILOGO ALLENAMENTO
  if (workoutFinished) {
    const totalReps = completedSets.reduce((sum, s) => sum + s.repsFatte, 0);
    const totalSecs = completedSets.reduce((sum, s) => sum + s.secondiFatti, 0);

    return (
      <div className="fixed inset-0 z-50 bg-[#0A0E13] text-[#F2F6FA] flex flex-col justify-between p-6 max-w-[480px] mx-auto overflow-y-auto">
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-3xl bg-[#B8FF3C]/10 text-accent mx-auto border border-[#B8FF3C]/30">
            <IconTrophy size={32} />
          </div>

          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Allenamento Completato!</h1>
            <p className="text-sm text-muted-txt">{session.nome}</p>
          </div>

          {/* Statistiche sessione */}
          <div
            className="grid grid-cols-3 gap-3 p-4 rounded-[20px] text-center text-white"
            style={{ background: SFUMATURA_SPINTA }}
          >
            <div>
              <div className="text-xs opacity-90">Durata</div>
              <div className="text-xl font-bold tabular-nums mt-0.5">
                {formatTime(workoutDurationSec)}
              </div>
            </div>
            <div>
              <div className="text-xs opacity-90">Serie totali</div>
              <div className="text-xl font-bold tabular-nums mt-0.5">
                {completedSets.length}
              </div>
            </div>
            <div>
              <div className="text-xs opacity-90">Ripetizioni</div>
              <div className="text-xl font-bold tabular-nums mt-0.5">
                {totalReps > 0 ? totalReps : `${totalSecs}s`}
              </div>
            </div>
          </div>

          {/* Valutazione sensazione generale 1-5 */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-muted-txt">Come ti sei sentito?</label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setFeeling(lvl as 1 | 2 | 3 | 4 | 5)}
                  className={`h-12 rounded-xl border text-sm font-bold flex items-center justify-center transition-all ${
                    feeling === lvl
                      ? 'bg-accent text-accent-contrast border-accent'
                      : 'bg-surface border-subtle text-muted-txt hover:bg-elevated'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-muted-txt px-1">
              <span>Esausto</span>
              <span>Perfetto</span>
              <span>Troppo facile</span>
            </div>
          </div>

          {/* Campo Note */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-muted-txt">Note della sessione</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Sensazioni tendinee, tenuta delle scapole, carichi..."
              rows={3}
              className="w-full p-3 rounded-xl bg-surface border border-subtle text-sm text-txt focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div className="pt-4 pb-6">
          <button
            onClick={handleFinishAndSave}
            className="w-full min-h-[52px] rounded-2xl bg-accent text-accent-contrast font-bold text-base flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all"
          >
            <span>Salva e registra allenamento</span>
            <IconCheck size={20} />
          </button>
        </div>
      </div>
    );
  }

  // SCHERMATA DEL PLAYER IN ESECUZIONE
  return (
    <div className="fixed inset-0 z-50 bg-[#0A0E13] text-[#F2F6FA] flex flex-col justify-between max-w-[480px] mx-auto select-none overflow-hidden">
      {/* 1. TOP HEADER & PROGRESS */}
      <div className="p-4 pt-safe space-y-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowConfirmExit(true)}
            className="w-10 h-10 rounded-xl bg-surface border border-subtle flex items-center justify-center text-muted-txt hover:text-txt"
            aria-label="Esci dall'allenamento"
          >
            <IconClose size={18} />
          </button>

          <div className="text-center">
            <span className="text-[11px] font-medium text-muted-txt tracking-wide uppercase">
              Esercizio {currentBlockIndex + 1} di {session.blocks.length}
            </span>
            <div className="text-xs text-accent font-semibold">{PATTERN_NAMES[currentExercise.pattern]}</div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowSwapModal(true)}
              className="w-10 h-10 rounded-xl bg-surface border border-subtle flex items-center justify-center text-muted-txt hover:text-txt"
              aria-label="Sostituisci esercizio"
            >
              <IconSwap size={18} />
            </button>
            <button
              onClick={() => setShowInstructions(true)}
              className="w-10 h-10 rounded-xl bg-surface border border-subtle flex items-center justify-center text-muted-txt hover:text-txt"
              aria-label="Guida esecuzione"
            >
              <IconInfo size={18} />
            </button>
          </div>
        </div>

        {/* Barra di avanzamento sessione */}
        <div className="w-full h-1 bg-surface rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${sessionProgress}%` }}
          />
        </div>

        <div className="text-center">
          <h2 className="text-lg font-bold tracking-tight text-txt truncate px-2">
            {currentExercise.nome}
          </h2>
        </div>
      </div>

      {/* 2. ZONA CENTRALE: ANELLO PROGRESSO E NUMERO GIGANTE */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 relative">
        {/* MODALITA RECUPERO */}
        {isResting ? (
          <div className="flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-200">
            <div className="text-xs font-semibold text-rest uppercase tracking-widest">
              Recupero tra le serie
            </div>

            <div className="relative w-60 h-60 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="120"
                  cy="120"
                  r="100"
                  stroke="var(--color-border)"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="120"
                  cy="120"
                  r="100"
                  stroke="var(--color-rest)"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 100}
                  strokeDashoffset={
                    2 * Math.PI * 100 * (1 - restRemaining / (initialRestDuration || 90))
                  }
                  strokeLinecap="round"
                  fill="transparent"
                  style={{ transition: 'stroke-dashoffset 0.3s linear' }}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-6xl font-bold tracking-tighter text-rest tabular-nums">
                  {restRemaining}s
                </span>
                <span className="text-xs text-muted-txt mt-1">
                  Prossima: Serie {currentSetIndex} di {currentBlock.serie}
                </span>
              </div>
            </div>

            {/* Pulsanti -15s / Salta / +15s */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => adjustRest(-15)}
                className="px-4 py-2 rounded-xl bg-surface border border-subtle text-xs font-semibold text-muted-txt hover:text-txt active:scale-95 transition-all"
              >
                -15s
              </button>
              <button
                type="button"
                onClick={skipRest}
                className="px-6 py-2.5 rounded-xl bg-elevated border border-rest text-sm font-bold text-rest hover:bg-surface active:scale-95 transition-all"
              >
                Salta recupero
              </button>
              <button
                type="button"
                onClick={() => adjustRest(15)}
                className="px-4 py-2 rounded-xl bg-surface border border-subtle text-xs font-semibold text-muted-txt hover:text-txt active:scale-95 transition-all"
              >
                +15s
              </button>
            </div>
          </div>
        ) : (
          /* MODALITA ESERCIZIO ATTIVO */
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative w-60 h-60 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="120"
                  cy="120"
                  r="100"
                  stroke="var(--color-border)"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="120"
                  cy="120"
                  r="100"
                  stroke="var(--color-accent)"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 100}
                  strokeDashoffset={
                    isTempo
                      ? 2 * Math.PI * 100 * (1 - tempoRemaining / (currentBlock.secondi || 30))
                      : 0
                  }
                  strokeLinecap="round"
                  fill="transparent"
                  style={{ transition: isTempo ? 'stroke-dashoffset 1s linear' : 'none' }}
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center px-4 text-center">
                {isTempo ? (
                  <>
                    <span className="text-6xl font-bold tracking-tighter text-txt tabular-nums animate-pop">
                      {tempoRemaining}
                    </span>
                    <span className="text-xs text-muted-txt uppercase tracking-wider mt-1">secondi</span>
                  </>
                ) : (
                  <>
                    <span className="text-6xl font-bold tracking-tighter text-txt tabular-nums animate-pop">
                      {isUnilateral ? `${repsDestra}/${repsSinistra}` : repsDone}
                    </span>
                    <span className="text-xs text-muted-txt uppercase tracking-wider mt-1">
                      Target: {currentBlock.repMin}-{currentBlock.repMax} reps
                    </span>
                  </>
                )}

              </div>
            </div>

            {/* Riferimento all'ultima volta: fuori dall'anello, dove ha spazio
                per andare a capo senza sovrapporsi al tracciato */}
            <div className="mt-4 px-6 text-center text-[11px] leading-snug text-muted-txt">
              Ultima volta: <span className="text-txt font-medium">{lastHistoryDisplay}</span>
            </div>

            {/* Selettori ripetizioni / tempo */}
            {!isTempo ? (
              isUnilateral ? (
                /* Esercizio Unilaterale: Destra e Sinistra separati */
                <div className="space-y-2 w-full max-w-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-surface border border-subtle">
                    <span className="text-xs font-semibold text-muted-txt pl-1">Lato Destro:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setRepsDestra((r) => Math.max(1, r - 1))}
                        className="w-8 h-8 rounded-lg bg-elevated border border-subtle font-bold text-txt active:scale-95"
                      >
                        -
                      </button>
                      <span className="text-sm font-bold text-accent tabular-nums w-8 text-center">
                        {repsDestra}
                      </span>
                      <button
                        type="button"
                        onClick={() => setRepsDestra((r) => r + 1)}
                        className="w-8 h-8 rounded-lg bg-elevated border border-subtle font-bold text-txt active:scale-95"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-surface border border-subtle">
                    <span className="text-xs font-semibold text-muted-txt pl-1">Lato Sinistro:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setRepsSinistra((r) => Math.max(1, r - 1))}
                        className="w-8 h-8 rounded-lg bg-elevated border border-subtle font-bold text-txt active:scale-95"
                      >
                        -
                      </button>
                      <span className="text-sm font-bold text-accent tabular-nums w-8 text-center">
                        {repsSinistra}
                      </span>
                      <button
                        type="button"
                        onClick={() => setRepsSinistra((r) => r + 1)}
                        className="w-8 h-8 rounded-lg bg-elevated border border-subtle font-bold text-txt active:scale-95"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Bilaterale standard */
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setRepsDone((r) => Math.max(1, r - 1))}
                    className="w-11 h-11 rounded-xl bg-surface border border-subtle text-lg font-bold text-txt hover:bg-elevated flex items-center justify-center active:scale-95 transition-all"
                    aria-label="Togli una ripetizione"
                  >
                    -
                  </button>
                  <span className="text-xs font-semibold text-muted-txt tracking-wide">
                    Reps effettive
                  </span>
                  <button
                    type="button"
                    onClick={() => setRepsDone((r) => r + 1)}
                    className="w-11 h-11 rounded-xl bg-surface border border-subtle text-lg font-bold text-txt hover:bg-elevated flex items-center justify-center active:scale-95 transition-all"
                    aria-label="Aggiungi una ripetizione"
                  >
                    +
                  </button>
                </div>
              )
            ) : (
              <button
                type="button"
                onClick={() => setIsTempoRunning(!isTempoRunning)}
                className="px-6 py-2.5 rounded-xl bg-surface border border-subtle text-sm font-bold text-accent flex items-center gap-2 hover:bg-elevated active:scale-95 transition-all"
              >
                {isTempoRunning ? <IconPause size={18} /> : <IconPlay size={18} />}
                <span>{isTempoRunning ? 'Metti in pausa' : 'Avvia timer isometrico'}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 3. PARTE INFERIORE: FEEDBACK & PALLINI DELLE SERIE */}
      <div className="p-4 pb-safe space-y-3">
        {/* Scheda delle serie: le completate si toccano per correggerle */}
        <SchedaSerie
          totale={currentBlock.serie}
          corrente={currentSetIndex}
          onModifica={setEditingSetIndex}
        />

        {/* Due domande di feedback durante il recupero */}
        {isResting ? (
          <div className="space-y-2 p-3 rounded-2xl bg-surface/90 border border-subtle">
            {/* Domanda 1: Difficoltà */}
            <div className="space-y-1">
              <div className="text-center text-[10px] text-muted-txt uppercase tracking-wider font-semibold">
                1. Sforzo percepito:
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {(['facile', 'giusto', 'difficile'] as SetFeedback[]).map((fb) => {
                  const lastSet = completedSets[completedSets.length - 1];
                  const isSelected = lastSet?.feedback === fb;
                  return (
                    <button
                      key={fb}
                      type="button"
                      onClick={() => {
                        setCompletedSets((prev) => {
                          if (prev.length === 0) return prev;
                          const copy = [...prev];
                          copy[copy.length - 1].feedback = fb;
                          return copy;
                        });
                        if (settings.vibrazione) triggerVibration(30);
                      }}
                      className={`h-9 rounded-xl border text-xs font-bold capitalize transition-all ${
                        isSelected
                          ? 'bg-accent text-accent-contrast border-accent'
                          : 'bg-elevated border-subtle text-txt hover:bg-surface'
                      }`}
                    >
                      {fb}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Domanda 2: Qualità dell'esecuzione */}
            <div className="space-y-1 pt-1 border-t border-subtle/50">
              <div className="text-center text-[10px] text-muted-txt uppercase tracking-wider font-semibold">
                2. Qualità tecnica dell'esecuzione:
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'pulita', label: 'Pulita' },
                  { id: 'con_compensi', label: 'Con compensi' },
                  { id: 'cedimento_tecnico', label: 'Al cedimento' }
                ].map((q) => {
                  const lastSet = completedSets[completedSets.length - 1];
                  const isSelected =
                    lastSet?.qualita === q.id ||
                    (!lastSet?.qualita && q.id === 'pulita');

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        setCompletedSets((prev) => {
                          if (prev.length === 0) return prev;
                          const copy = [...prev];
                          copy[copy.length - 1].qualita = q.id as ExecutionQuality;
                          return copy;
                        });
                        if (settings.vibrazione) triggerVibration(30);
                      }}
                      className={`h-9 rounded-xl border text-[11px] font-bold transition-all ${
                        isSelected
                          ? 'bg-accent text-accent-contrast border-accent'
                          : 'bg-elevated border-subtle text-txt hover:bg-surface'
                      }`}
                    >
                      {q.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => handleCompleteSet('giusto', 'pulita')}
            className="w-full min-h-[54px] rounded-2xl bg-accent text-accent-contrast font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-accent/10 hover:opacity-95 active:scale-[0.98] transition-all"
          >
            <IconCheck size={20} />
            <span>Serie completata</span>
          </button>
        )}
      </div>

      {/* MODALE MODIFICA RAPIDA SERIE COMPLETATA */}
      {editingSetIndex !== null && completedSets[editingSetIndex] && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-surface border border-subtle rounded-2xl p-5 max-w-sm w-full space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-txt">
                Modifica Serie {editingSetIndex + 1}
              </h3>
              <button
                onClick={() => setEditingSetIndex(null)}
                className="w-8 h-8 rounded-lg bg-elevated flex items-center justify-center text-muted-txt"
              >
                <IconClose size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-muted-txt mb-1">
                  Ripetizioni / Secondi registrati:
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCompletedSets((prev) => {
                        const copy = [...prev];
                        const s = copy[editingSetIndex];
                        if (s.repsFatte > 0) s.repsFatte = Math.max(1, s.repsFatte - 1);
                        if (s.secondiFatti > 0) s.secondiFatti = Math.max(5, s.secondiFatti - 5);
                        return copy;
                      });
                    }}
                    className="w-10 h-10 rounded-xl bg-elevated border border-subtle text-base font-bold text-txt"
                  >
                    -
                  </button>
                  <span className="text-xl font-bold text-accent tabular-nums flex-1 text-center">
                    {completedSets[editingSetIndex].repsFatte ||
                      completedSets[editingSetIndex].secondiFatti}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCompletedSets((prev) => {
                        const copy = [...prev];
                        const s = copy[editingSetIndex];
                        if (s.repsFatte > 0) s.repsFatte += 1;
                        if (s.secondiFatti > 0) s.secondiFatti += 5;
                        return copy;
                      });
                    }}
                    className="w-10 h-10 rounded-xl bg-elevated border border-subtle text-base font-bold text-txt"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Qualità */}
              <div>
                <label className="block text-muted-txt mb-1">Qualità esecuzione:</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'pulita', label: 'Pulita' },
                    { id: 'con_compensi', label: 'Compensi' },
                    { id: 'cedimento_tecnico', label: 'Cedimento' }
                  ].map((q) => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        setCompletedSets((prev) => {
                          const copy = [...prev];
                          copy[editingSetIndex].qualita = q.id as ExecutionQuality;
                          return copy;
                        });
                      }}
                      className={`h-9 rounded-lg border text-[10px] font-bold ${
                        completedSets[editingSetIndex].qualita === q.id
                          ? 'bg-accent text-accent-contrast border-accent'
                          : 'bg-elevated border-subtle text-txt'
                      }`}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setEditingSetIndex(null)}
              className="w-full h-11 rounded-xl bg-accent text-accent-contrast font-bold text-xs"
            >
              Conferma correzione
            </button>
          </div>
        </div>
      )}

      {/* DRAWER ISTRUZIONI DAL BASSO */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end">
          <div className="bg-[#141A22] border-t border-[#2A3540] rounded-t-3xl p-5 space-y-4 max-h-[80vh] overflow-y-auto max-w-[480px] mx-auto w-full">
            <div className="w-10 h-1 bg-subtle rounded-full mx-auto" />
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-txt">{currentExercise.nome}</h3>
                <div className="text-xs text-muted-txt">
                  Livello {currentExercise.livello} · {PATTERN_NAMES[currentExercise.pattern]}
                  {currentExercise.unilaterale && ' · Unilaterale'}
                </div>
              </div>
              <button
                onClick={() => setShowInstructions(false)}
                className="w-9 h-9 rounded-xl bg-elevated border border-subtle flex items-center justify-center text-muted-txt hover:text-txt"
              >
                <IconClose size={18} />
              </button>
            </div>

            {/* Passaggi */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                Istruzioni passo-passo
              </span>
              <ol className="text-xs text-txt space-y-1.5 list-decimal list-inside pl-1">
                {currentExercise.istruzioni.map((step, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {/* Errori comuni */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-error uppercase tracking-wider">
                Errori da evitare
              </span>
              <ul className="text-xs text-muted-txt space-y-1.5 list-disc list-inside pl-1">
                {currentExercise.erroriComuni.map((err, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {err}
                  </li>
                ))}
              </ul>
            </div>

            {/* Muscoli coinvolti */}
            <div className="text-xs text-muted-txt">
              <span className="font-semibold text-txt">Muscoli: </span>
              {currentExercise.muscoli.join(', ')}
            </div>

            {/* Pulsante YouTube esecuzione */}
            <a
              href={`https://www.youtube.com/results?search_query=calisthenics+how+to+${encodeURIComponent(
                currentExercise.nomeInglese
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[44px] rounded-xl bg-elevated border border-subtle text-xs font-semibold text-txt flex items-center justify-center gap-2 hover:bg-surface transition-colors"
            >
              <span>Guarda l’esecuzione su YouTube</span>
              <IconExternalLink size={14} />
            </a>
          </div>
        </div>
      )}

      {/* MODALE SOSTITUISCI ESERCIZIO */}
      {showSwapModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end">
          <div className="bg-[#141A22] border-t border-[#2A3540] rounded-t-3xl p-5 space-y-3 max-h-[80vh] overflow-y-auto max-w-[480px] mx-auto w-full">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-base font-bold text-txt">Sostituisci esercizio</h3>
              <button
                onClick={() => setShowSwapModal(false)}
                className="w-8 h-8 rounded-lg bg-elevated flex items-center justify-center text-muted-txt hover:text-txt"
              >
                <IconClose size={16} />
              </button>
            </div>
            <p className="text-xs text-muted-txt">
              Alternative disponibili nello stesso pattern ({PATTERN_NAMES[currentExercise.pattern]}):
            </p>

            <div className="space-y-2 mt-2">
              {alternatives.map((alt) => (
                <button
                  key={alt.id}
                  onClick={() => handleSwap(alt.id)}
                  className="w-full p-3 rounded-xl bg-elevated border border-subtle text-left flex justify-between items-center hover:border-accent transition-colors"
                >
                  <div>
                    <div className="text-xs font-bold text-txt">{alt.nome}</div>
                    <div className="text-[10px] text-muted-txt">
                      Livello {alt.livello} · {alt.tipo === 'tempo' ? 'A tempo' : 'Ripetizioni'}
                      {alt.unilaterale && ' · Unilaterale'}
                    </div>
                  </div>
                  <span className="text-xs text-accent font-semibold">Scegli</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CONFERMA USCITA */}
      {showConfirmExit && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-surface border border-subtle rounded-2xl p-5 max-w-sm w-full space-y-4 text-center">
            <h3 className="text-base font-bold text-txt">Vuoi uscire dall’allenamento?</h3>
            <p className="text-xs text-muted-txt leading-relaxed">
              I dati fino all’ultima serie completata sono salvati sul dispositivo. Puoi riprendere l’allenamento in seguito oppure scartarlo definitivamente.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmExit(false)}
                className="h-11 rounded-xl bg-elevated border border-subtle text-xs font-semibold text-txt"
              >
                Continua
              </button>
              <button
                type="button"
                onClick={handleDiscardAndExit}
                className="h-11 rounded-xl bg-error/20 border border-error text-xs font-bold text-error"
              >
                Scarta ed esci
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
