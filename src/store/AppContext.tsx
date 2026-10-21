/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import {
  AppState,
  Profile,
  Plan,
  WorkoutLog,
  Measurement,
  Settings,
  AssessmentResult,
  Pattern,
  ActiveWorkoutState
} from '../types';
import { generateWorkoutPlan } from '../logic/generator';
import { processWorkoutProgression } from '../logic/progression';
import { getDemoState } from '../data/demoData';

const STORAGE_KEY = 'calis.v1';
export const ACTIVE_SESSION_STORAGE_KEY = 'calis.active_session';

export function getCalendarWeekDifference(startDateStr: string, currentDate: Date = new Date()): number {
  try {
    const start = new Date(startDateStr);
    const startDay = start.getDay() === 0 ? 7 : start.getDay();
    const startMonday = new Date(start);
    startMonday.setDate(start.getDate() - (startDay - 1));
    startMonday.setHours(0, 0, 0, 0);

    const curDay = currentDate.getDay() === 0 ? 7 : currentDate.getDay();
    const curMonday = new Date(currentDate);
    curMonday.setDate(currentDate.getDate() - (curDay - 1));
    curMonday.setHours(0, 0, 0, 0);

    const diffMs = curMonday.getTime() - startMonday.getTime();
    return Math.max(0, Math.floor(diffMs / (7 * 24 * 3600 * 1000)));
  } catch {
    return 0;
  }
}

const INITIAL_LEVELS: Record<Pattern, number> = {
  spinta_orizzontale: 1,
  spinta_verticale: 1,
  dip: 1,
  trazione_orizzontale: 1,
  trazione_verticale: 1,
  gambe_spinta: 1,
  gambe_catena_posteriore: 1,
  core_anteriore: 1,
  core_laterale: 1,
  polpacci: 1
};

const INITIAL_SETTINGS: Settings = {
  tema: 'dark',
  suoni: true,
  voce: false,
  vibrazione: true,
  recuperoAutomatico: true
};

const INITIAL_STATE: AppState = {
  version: 'calis.v1',
  onboarded: false,
  profile: null,
  levels: INITIAL_LEVELS,
  assessments: [],
  plan: null,
  workouts: [],
  measurements: [],
  settings: INITIAL_SETTINGS,
  consecutiveSuccesses: {},
  consecutiveFails: {},
  lastWorkoutDate: null
};

type Action =
  | { type: 'COMPLETE_ONBOARDING'; payload: { profile: Profile; assessment: AssessmentResult; initialMeasurement?: Measurement } }
  | { type: 'FINISH_WORKOUT'; payload: { workout: WorkoutLog } }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<Settings> }
  | { type: 'UPDATE_PROFILE'; payload: Partial<Profile> }
  | { type: 'ADD_MEASUREMENT'; payload: Measurement }
  | { type: 'SWAP_EXERCISE'; payload: { sessionId: string; blockIndex: number; newExerciseId: string } }
  | { type: 'MOVE_SESSION_DAY'; payload: { sessionId: string; newDay: number } }
  | { type: 'ADVANCE_WEEK' }
  | { type: 'AUTO_SYNC_WEEK'; payload: { week: number } }
  | { type: 'COMPLETE_RETEST'; payload: { assessment: AssessmentResult } }
  | { type: 'REGENERATE_PLAN' }
  | { type: 'LOAD_DEMO_DATA' }
  | { type: 'RESET_ALL' }
  | { type: 'IMPORT_STATE'; payload: AppState };

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'COMPLETE_ONBOARDING': {
      const { profile, assessment, initialMeasurement } = action.payload;
      const levels = assessment.livelliCalcolati;
      const plan = generateWorkoutPlan(profile, levels, 1);

      return {
        ...state,
        onboarded: true,
        profile,
        levels,
        assessments: [assessment],
        plan,
        measurements: initialMeasurement ? [initialMeasurement] : [],
        lastWorkoutDate: null
      };
    }

    case 'FINISH_WORKOUT': {
      const { workout } = action.payload;
      const currentWorkouts = [workout, ...state.workouts];

      // Rimuovi eventuale sessione attiva salvata in localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
        } catch {
          // ignore
        }
      }

      if (!state.plan || !state.profile) {
        return {
          ...state,
          workouts: currentWorkouts,
          lastWorkoutDate: workout.data
        };
      }

      const lastAssessmentDate = state.assessments[0]?.data || null;

      // Esegui la logica di progressione e adattamento con la data reale dell'ultimo test
      const progression = processWorkoutProgression(
        workout,
        state.plan,
        state.levels,
        state.consecutiveSuccesses,
        state.consecutiveFails,
        state.lastWorkoutDate,
        state.profile,
        lastAssessmentDate
      );

      return {
        ...state,
        workouts: currentWorkouts,
        levels: progression.updatedLevels,
        plan: progression.updatedPlan,
        consecutiveSuccesses: progression.updatedConsecutiveSuccesses,
        consecutiveFails: progression.updatedConsecutiveFails,
        lastWorkoutDate: workout.data
      };
    }

    case 'UPDATE_SETTINGS': {
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload
        }
      };
    }

    case 'UPDATE_PROFILE': {
      if (!state.profile) return state;
      const prev = state.profile;
      const updatedProfile: Profile = {
        ...prev,
        ...action.payload
      };

      // Rigenera il piano SOLO se cambiano giorni, durata, attrezzatura, obiettivo o limitazioni
      const daysChanged =
        action.payload.giorniSettimana !== undefined &&
        action.payload.giorniSettimana !== prev.giorniSettimana;
      const durationChanged =
        action.payload.durataSessioneMin !== undefined &&
        action.payload.durataSessioneMin !== prev.durataSessioneMin;
      const goalChanged =
        action.payload.obiettivo !== undefined && action.payload.obiettivo !== prev.obiettivo;
      const eqChanged =
        action.payload.attrezzatura !== undefined &&
        JSON.stringify(action.payload.attrezzatura.slice().sort()) !==
          JSON.stringify(prev.attrezzatura.slice().sort());
      const limChanged =
        action.payload.limitazioni !== undefined &&
        JSON.stringify(action.payload.limitazioni.slice().sort()) !==
          JSON.stringify(prev.limitazioni.slice().sort());

      const shouldRegenerate = daysChanged || durationChanged || goalChanged || eqChanged || limChanged;

      let updatedPlan = state.plan;
      if (shouldRegenerate) {
        updatedPlan = generateWorkoutPlan(
          updatedProfile,
          state.levels,
          state.plan?.settimanaCorrente || 1
        );
      }

      return {
        ...state,
        profile: updatedProfile,
        plan: updatedPlan
      };
    }

    case 'ADD_MEASUREMENT': {
      return {
        ...state,
        measurements: [action.payload, ...state.measurements]
      };
    }

    case 'SWAP_EXERCISE': {
      if (!state.plan) return state;
      const { sessionId, blockIndex, newExerciseId } = action.payload;
      const updatedPlan: Plan = JSON.parse(JSON.stringify(state.plan));
      const session = updatedPlan.sessions.find((s) => s.id === sessionId);
      if (session && session.blocks[blockIndex]) {
        session.blocks[blockIndex].exerciseId = newExerciseId;
      }
      return {
        ...state,
        plan: updatedPlan
      };
    }

    case 'MOVE_SESSION_DAY': {
      if (!state.plan) return state;
      const { sessionId, newDay } = action.payload;
      const updatedPlan: Plan = JSON.parse(JSON.stringify(state.plan));
      const session = updatedPlan.sessions.find((s) => s.id === sessionId);
      if (session) {
        session.giorno = newDay;
      }
      return {
        ...state,
        plan: updatedPlan
      };
    }

    case 'ADVANCE_WEEK': {
      if (!state.plan || !state.profile) return state;
      const nextWeek = state.plan.settimanaCorrente >= 5 ? 1 : state.plan.settimanaCorrente + 1;
      const newPlan = generateWorkoutPlan(state.profile, state.levels, nextWeek);
      return {
        ...state,
        plan: newPlan
      };
    }

    case 'AUTO_SYNC_WEEK': {
      if (!state.plan || !state.profile) return state;
      const targetWeek = action.payload.week;
      const newPlan = generateWorkoutPlan(state.profile, state.levels, targetWeek);
      return {
        ...state,
        plan: newPlan
      };
    }

    case 'COMPLETE_RETEST': {
      if (!state.profile) return state;
      const { assessment } = action.payload;
      const updatedLevels = assessment.livelliCalcolati;
      const currentWeek = state.plan?.settimanaCorrente || 1;
      const newPlan = generateWorkoutPlan(state.profile, updatedLevels, currentWeek);

      return {
        ...state,
        levels: updatedLevels,
        assessments: [assessment, ...state.assessments],
        plan: newPlan
      };
    }

    case 'REGENERATE_PLAN': {
      if (!state.profile) return state;
      const newPlan = generateWorkoutPlan(
        state.profile,
        state.levels,
        state.plan?.settimanaCorrente || 1
      );
      return {
        ...state,
        plan: newPlan
      };
    }

    case 'LOAD_DEMO_DATA': {
      return getDemoState();
    }

    case 'RESET_ALL': {
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
      } catch {
        // ignore
      }
      return { ...INITIAL_STATE };
    }

    case 'IMPORT_STATE': {
      return { ...action.payload };
    }

    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  isCorrupted: boolean;
  clearCorrupted: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isCorrupted, setIsCorrupted] = useState(false);

  // Caricamento sicuro da localStorage
  const [state, dispatch] = useReducer(appReducer, INITIAL_STATE, (initial) => {
    if (typeof window === 'undefined') return initial;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return initial;

      const parsed = JSON.parse(stored);
      // Validazione schema minima
      if (parsed && parsed.version === 'calis.v1' && parsed.levels) {
        return parsed as AppState;
      } else {
        console.warn('Storage con versione differente o schema non valido');
        setIsCorrupted(true);
        return initial;
      }
    } catch (err) {
      console.error('Errore lettura localStorage:', err);
      setIsCorrupted(true);
      return initial;
    }
  });

  // Salvataggio automatico a ogni variazione di stato
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error('Errore salvataggio localStorage:', err);
    }
  }, [state]);

  // Avanzamento automatico della settimana quando inizia una nuova settimana di calendario
  useEffect(() => {
    if (!state.plan || !state.profile) return;
    const weeksElapsed = getCalendarWeekDifference(state.plan.creatoIl);
    const expectedWeek = (weeksElapsed % 5) + 1;
    if (state.plan.settimanaCorrente !== expectedWeek) {
      dispatch({ type: 'AUTO_SYNC_WEEK', payload: { week: expectedWeek } });
    }
  }, [state.plan?.creatoIl]);

  // Gestione tema scuro / chiaro sul DOM root
  useEffect(() => {
    const theme = state.settings.tema || 'dark';
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [state.settings.tema]);

  const clearCorrupted = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
    } catch {
      // ignore
    }
    setIsCorrupted(false);
    dispatch({ type: 'RESET_ALL' });
  };

  return (
    <AppContext.Provider value={{ state, dispatch, isCorrupted, clearCorrupted }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve essere utilizzato all’interno di un AppProvider');
  }
  return context;
}
