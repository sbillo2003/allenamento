/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Sex = 'm' | 'f';

export type Experience = 'mai' | 'meno_6_mesi' | '6_24_mesi' | 'oltre_2_anni';

export type Goal = 'forza' | 'ipertrofia' | 'resistenza' | 'dimagrimento' | 'generale';

export type DurationMin = 20 | 30 | 45 | 60;

export type DaysPerWeek = 2 | 3 | 4 | 5 | 6;

export type Equipment =
  | 'pavimento'
  | 'sbarra'
  | 'parallele'
  | 'anelli'
  | 'elastici'
  | 'sedia'
  | 'zaino'
  | 'trx';

export type Limitation =
  | 'spalla'
  | 'gomito'
  | 'polso'
  | 'schiena'
  | 'anca'
  | 'ginocchio'
  | 'caviglia'
  | 'nessuna';

export type Pattern =
  | 'spinta_orizzontale'
  | 'spinta_verticale'
  | 'dip'
  | 'trazione_orizzontale'
  | 'trazione_verticale'
  | 'gambe_spinta'
  | 'gambe_catena_posteriore'
  | 'core_anteriore'
  | 'core_laterale'
  | 'polpacci';

export type ExerciseType = 'reps' | 'tempo';

export interface Exercise {
  id: string;
  nome: string;
  nomeInglese: string;
  pattern: Pattern;
  livello: number;
  attrezzaturaRichiesta: Equipment[];
  limitazioniEscluse: Limitation[];
  tipo: ExerciseType;
  unilaterale: boolean;
  istruzioni: string[];
  erroriComuni: string[];
  muscoli: string[];
}

export interface PatternLevel {
  pattern: Pattern;
  livello: number;
  aggiornatoIl: string;
}

export interface AssessmentResult {
  data: string;
  pushUp: number;
  pushUpType: 'completi' | 'ginocchia';
  pullUp: number;
  deadHangSec: number;
  squat: number;
  plankSec: number;
  dipOrRowType: 'dip' | 'row';
  dipOrRow: number;
  hollowHoldSec?: number;
  livelliCalcolati: Record<Pattern, number>;
  classificazioneComplessiva: 'Principiante' | 'Intermedio' | 'Avanzato' | 'Élite';
}

export interface PlannedBlock {
  exerciseId: string;
  serie: number;
  repMin: number;
  repMax: number;
  secondi: number;
  recuperoSec: number;
  zavorraKg?: number;
}

export interface PlannedSession {
  id: string;
  giorno: number; // 1 = Lun, 2 = Mar, ... 7 = Dom
  nome: string;
  patternCoinvolti: Pattern[];
  blocks: PlannedBlock[];
}

export interface Plan {
  id: string;
  creatoIl: string;
  settimanaCorrente: number; // 1 to 5
  split: 'Full Body' | 'Upper / Lower' | 'Push / Pull / Legs';
  sessions: PlannedSession[];
}

export type SetFeedback = 'facile' | 'giusto' | 'difficile';
export type ExecutionQuality =
  | 'pulita'
  | 'con_compensi'
  | 'cedimento_tecnico'
  | 'qualche_cedimento'
  | 'forma_persa';

export interface SetLog {
  exerciseId: string;
  serie: number;
  repsFatte: number;
  secondiFatti: number;
  feedback: SetFeedback;
  qualita?: ExecutionQuality;
  repsDestra?: number;
  repsSinistra?: number;
  secondiDestra?: number;
  secondiSinistra?: number;
}

export interface WorkoutLog {
  id: string;
  sessionId: string;
  sessionName: string;
  data: string; // ISO date
  durataSec: number;
  sets: SetLog[];
  sensazione: 1 | 2 | 3 | 4 | 5;
  note: string;
}

export interface Measurement {
  data: string;
  pesoKg: number;
  vitaCm?: number;
  colloCm?: number;
  toraceCm?: number;
  fianchiCm?: number;
  braccioCm?: number;
  cosciaCm?: number;
  polpaccioCm?: number;
}

export interface Settings {
  tema: 'dark' | 'light';
  suoni: boolean;
  voce: boolean;
  vibrazione: boolean;
  recuperoAutomatico: boolean;
}

export interface Profile {
  nome: string;
  sesso: Sex;
  dataNascita: string;
  altezzaCm: number;
  pesoKg: number;
  esperienza: Experience;
  mesiInattivita: number;
  obiettivo: Goal;
  giorniSettimana: DaysPerWeek;
  durataSessioneMin: DurationMin;
  attrezzatura: Equipment[];
  limitazioni: Limitation[];
  creatoIl: string;
  livelloAttivita?: 'sedentario' | 'leggero' | 'moderato' | 'intenso';
}

export interface ActiveWorkoutState {
  session: PlannedSession;
  currentBlockIndex: number;
  currentSetIndex: number;
  completedSets: SetLog[];
  workoutDurationSec: number;
  savedAt: string;
}

export interface AppState {
  version: string;
  onboarded: boolean;
  profile: Profile | null;
  levels: Record<Pattern, number>;
  assessments: AssessmentResult[];
  plan: Plan | null;
  workouts: WorkoutLog[];
  measurements: Measurement[];
  settings: Settings;
  consecutiveSuccesses: Record<string, number>;
  consecutiveFails: Record<string, number>;
  lastWorkoutDate: string | null;
  activeSessionState?: ActiveWorkoutState | null;
  lastWeekAdvanceDate?: string | null;
}
