/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Pattern,
  Plan,
  WorkoutLog,
  Exercise,
  Profile,
  ExecutionQuality
} from '../types';
import { EXERCISES, PATTERN_NAMES } from '../data/exercises';
import { selectExerciseForPattern } from './generator';

export interface ProgressionResult {
  updatedLevels: Record<Pattern, number>;
  updatedConsecutiveSuccesses: Record<string, number>;
  updatedConsecutiveFails: Record<string, number>;
  levelUpEvents: { pattern: Pattern; oldLevel: number; newLevel: number; exerciseName: string }[];
  levelDownEvents: { pattern: Pattern; oldLevel: number; newLevel: number; exerciseName: string }[];
  volumeReducedDueToAbsence: boolean;
  proposedRetest: boolean;
  repeatSessionSuggested?: boolean;
  updatedPlan: Plan;
}

/**
 * Verifica se sono trascorsi più di 10 giorni dall'ultimo workout
 */
export function checkLongAbsence(lastWorkoutDate: string | null): boolean {
  if (!lastWorkoutDate) return false;
  const last = new Date(lastWorkoutDate).getTime();
  const now = Date.now();
  const diffDays = (now - last) / (1000 * 60 * 60 * 24);
  return diffDays > 10;
}

/**
 * Verifica se sono trascorse più di 6 settimane dal piano iniziale o ultimo test
 */
export function checkNeedRetest(lastAssessmentDate: string | null): boolean {
  if (!lastAssessmentDate) return false;
  const last = new Date(lastAssessmentDate).getTime();
  const now = Date.now();
  const diffWeeks = (now - last) / (1000 * 60 * 60 * 24 * 7);
  return diffWeeks >= 6;
}

/**
 * Elabora la doppia progressione dopo un allenamento completato
 */
export function processWorkoutProgression(
  workout: WorkoutLog,
  currentPlan: Plan,
  currentLevels: Record<Pattern, number>,
  consecutiveSuccesses: Record<string, number>,
  consecutiveFails: Record<string, number>,
  lastWorkoutDate: string | null,
  profile: Profile,
  lastAssessmentDate?: string | null
): ProgressionResult {
  const isAbsent = checkLongAbsence(lastWorkoutDate);
  const needsRetest = checkNeedRetest(lastAssessmentDate || profile.creatoIl);

  const updatedLevels: Record<Pattern, number> = { ...currentLevels };
  const updatedSuccesses: Record<string, number> = { ...consecutiveSuccesses };
  const updatedFails: Record<string, number> = { ...consecutiveFails };
  const levelUpEvents: ProgressionResult['levelUpEvents'] = [];
  const levelDownEvents: ProgressionResult['levelDownEvents'] = [];
  let repeatSessionSuggested = false;

  const updatedPlan: Plan = JSON.parse(JSON.stringify(currentPlan));
  const session = updatedPlan.sessions.find((s) => s.id === workout.sessionId);

  if (session && !isAbsent) {
    const setsByExercise = new Map<string, typeof workout.sets>();
    for (const set of workout.sets) {
      const arr = setsByExercise.get(set.exerciseId) || [];
      arr.push(set);
      setsByExercise.set(set.exerciseId, arr);
    }

    session.blocks.forEach((block) => {
      const exLogs = setsByExercise.get(block.exerciseId);
      if (!exLogs || exLogs.length === 0) return;

      const exercise = EXERCISES.find((e) => e.id === block.exerciseId);
      if (!exercise) return;

      const isTempo = exercise.tipo === 'tempo';
      const targetMax = isTempo ? block.secondi : block.repMax;
      const targetMin = isTempo ? Math.max(10, block.secondi - 10) : block.repMin;

      // 1. Verifica raggiungimento del limite alto
      const allHitMaxWithGoodFeedback = exLogs.every((set) => {
        const achieved = isTempo ? set.secondiFatti : set.repsFatte;
        return achieved >= targetMax && (set.feedback === 'facile' || set.feedback === 'giusto');
      });

      // 2. Controllo qualità tecnica:
      // 'pulita': consente sia +1 rep che avanzamento di livello
      // 'con_compensi' / 'qualche_cedimento': aggiunge solo ripetizioni, NON fa avanzare di livello
      // 'cedimento_tecnico' / 'forma_persa': non progredisce, azzera successi, suggerisce di ripetere
      const hasLostForm = exLogs.some(
        (set) => set.qualita === 'forma_persa' || set.qualita === 'cedimento_tecnico'
      );
      const allCleanForm = exLogs.every((set) => !set.qualita || set.qualita === 'pulita');

      // 3. Fallimenti ripetizioni minime
      let failedSetsCount = 0;
      for (const set of exLogs) {
        const achieved = isTempo ? set.secondiFatti : set.repsFatte;
        if (achieved < targetMin) {
          failedSetsCount++;
        }
      }

      if (hasLostForm) {
        // Forma persa: nessun avanzamento e si suggerisce di ripetere la seduta
        updatedSuccesses[block.exerciseId] = 0;
        repeatSessionSuggested = true;
      } else if (allHitMaxWithGoodFeedback) {
        if (allCleanForm) {
          // Tecnica pulita: conta per avanzamento livello (dopo 2 consecutive)
          const succ = (updatedSuccesses[block.exerciseId] || 0) + 1;
          updatedSuccesses[block.exerciseId] = succ;
          updatedFails[block.exerciseId] = 0;

          if (succ >= 2) {
            const maxLevelInPattern = Math.max(
              ...EXERCISES.filter((e) => e.pattern === exercise.pattern).map((e) => e.livello)
            );
            const currentLev = updatedLevels[exercise.pattern] || 1;

            if (currentLev < maxLevelInPattern) {
              const newLev = currentLev + 1;
              updatedLevels[exercise.pattern] = newLev;
              updatedSuccesses[block.exerciseId] = 0;

              const newEx = selectExerciseForPattern(
                exercise.pattern,
                newLev,
                profile.attrezzatura,
                profile.limitazioni
              );
              block.exerciseId = newEx.id;

              levelUpEvents.push({
                pattern: exercise.pattern,
                oldLevel: currentLev,
                newLevel: newLev,
                exerciseName: newEx.nome
              });
            }
          } else {
            // Prima sessione al massimo: aggiungi 1 ripetizione per serie
            block.repMin += 1;
            block.repMax += 1;
            if (block.secondi > 0) block.secondi += 5;
          }
        } else {
          // Qualche cedimento: aggiungi solo 1 rep per serie, NON avanzare di livello
          block.repMin += 1;
          block.repMax += 1;
          if (block.secondi > 0) block.secondi += 5;
          updatedSuccesses[block.exerciseId] = 0;
          updatedFails[block.exerciseId] = 0;
        }
      } else if (failedSetsCount >= 2) {
        const fails = (updatedFails[block.exerciseId] || 0) + 1;
        updatedFails[block.exerciseId] = fails;
        updatedSuccesses[block.exerciseId] = 0;

        if (fails >= 2) {
          // Scendi di 1 livello
          const currentLev = updatedLevels[exercise.pattern] || 1;
          if (currentLev > 1) {
            const newLev = currentLev - 1;
            updatedLevels[exercise.pattern] = newLev;
            updatedFails[block.exerciseId] = 0;

            const newEx = selectExerciseForPattern(
              exercise.pattern,
              newLev,
              profile.attrezzatura,
              profile.limitazioni
            );
            block.exerciseId = newEx.id;

            levelDownEvents.push({
              pattern: exercise.pattern,
              oldLevel: currentLev,
              newLevel: newLev,
              exerciseName: newEx.nome
            });
          }
        } else {
          // Togli 1 ripetizione per serie
          if (block.repMin > 2) block.repMin -= 1;
          if (block.repMax > 3) block.repMax -= 1;
          if (block.secondi > 15) block.secondi -= 5;
        }
      } else {
        // Mantenimento
        updatedSuccesses[block.exerciseId] = 0;
        updatedFails[block.exerciseId] = 0;
      }
    });
  }

  // Se assente da > 10 giorni consecutivi: riduci il volume del 30% per una settimana
  if (isAbsent) {
    updatedPlan.sessions.forEach((s) => {
      s.blocks.forEach((b) => {
        b.serie = Math.max(2, Math.round(b.serie * 0.7));
      });
    });
  }

  return {
    updatedLevels,
    updatedConsecutiveSuccesses: updatedSuccesses,
    updatedConsecutiveFails: updatedFails,
    levelUpEvents,
    levelDownEvents,
    volumeReducedDueToAbsence: isAbsent,
    proposedRetest: needsRetest,
    repeatSessionSuggested,
    updatedPlan
  };
}
