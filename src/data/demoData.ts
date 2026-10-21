/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppState, WorkoutLog, Measurement, AssessmentResult, Profile } from '../types';
import { generateWorkoutPlan } from '../logic/generator';

export function getDemoState(): AppState {
  const profile: Profile = {
    nome: 'Marco Rossi',
    sesso: 'm',
    dataNascita: '1995-04-12',
    altezzaCm: 178,
    pesoKg: 76.5,
    esperienza: '6_24_mesi',
    mesiInattivita: 0,
    obiettivo: 'ipertrofia',
    giorniSettimana: 4,
    durataSessioneMin: 45,
    attrezzatura: ['pavimento', 'sbarra', 'parallele', 'elastici', 'sedia', 'zaino'],
    limitazioni: [],
    creatoIl: new Date(Date.now() - 56 * 24 * 3600 * 1000).toISOString(),
    livelloAttivita: 'moderato'
  };

  const initialLevels = {
    spinta_orizzontale: 4,
    spinta_verticale: 2,
    dip: 3,
    trazione_orizzontale: 3,
    trazione_verticale: 3,
    gambe_spinta: 2,
    gambe_catena_posteriore: 2,
    core_anteriore: 2,
    core_laterale: 2,
    polpacci: 1
  };

  const currentLevels = {
    spinta_orizzontale: 6,
    spinta_verticale: 3,
    dip: 5,
    trazione_orizzontale: 4,
    trazione_verticale: 5,
    gambe_spinta: 4,
    gambe_catena_posteriore: 3,
    core_anteriore: 4,
    core_laterale: 3,
    polpacci: 2
  };

  const initialAssessment: AssessmentResult = {
    data: new Date(Date.now() - 56 * 24 * 3600 * 1000).toISOString(),
    pushUp: 14,
    pushUpType: 'completi',
    pullUp: 4,
    deadHangSec: 45,
    squat: 32,
    plankSec: 65,
    dipOrRowType: 'dip',
    dipOrRow: 6,
    hollowHoldSec: 25,
    livelliCalcolati: initialLevels,
    classificazioneComplessiva: 'Intermedio'
  };

  const recentAssessment: AssessmentResult = {
    data: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    pushUp: 26,
    pushUpType: 'completi',
    pullUp: 9,
    deadHangSec: 80,
    squat: 48,
    plankSec: 110,
    dipOrRowType: 'dip',
    dipOrRow: 12,
    hollowHoldSec: 45,
    livelliCalcolati: currentLevels,
    classificazioneComplessiva: 'Avanzato'
  };

  // Genera 8 settimane di misurazioni (peso scende/si ricompone, vita cala)
  const measurements: Measurement[] = [];
  const baseWeight = 79.2;
  const baseWaist = 86.5;
  const baseNeck = 38.5;

  for (let w = 8; w >= 0; w--) {
    const d = new Date(Date.now() - w * 7 * 24 * 3600 * 1000);
    const weightLoss = (8 - w) * 0.32;
    const waistLoss = (8 - w) * 0.45;
    measurements.push({
      data: d.toISOString(),
      pesoKg: Math.round((baseWeight - weightLoss) * 10) / 10,
      vitaCm: Math.round((baseWaist - waistLoss) * 10) / 10,
      colloCm: baseNeck,
      toraceCm: 102 + (8 - w) * 0.2,
      fianchiCm: 98 - (8 - w) * 0.3,
      braccioCm: 35.5 + (8 - w) * 0.1,
      cosciaCm: 57,
      polpaccioCm: 37.5
    });
  }

  // Genera 8 settimane di workout reali (3-4 sessioni a settimana)
  const workouts: WorkoutLog[] = [];
  const sessionTypes = [
    { id: 'session_1', name: 'Upper Body A', exercises: ['pushup_completo', 'trazione_elastico', 'dip_parallele_elastico', 'row_orizzontale'] },
    { id: 'session_2', name: 'Lower Body & Core A', exercises: ['squat_corpo_libero', 'glute_bridge', 'plank', 'calf_due_gambe'] },
    { id: 'session_3', name: 'Upper Body B', exercises: ['pike_pushup', 'trazione_negativa_5s', 'pushup_diamante', 'row_piedi_rialzati'] },
    { id: 'session_4', name: 'Lower Body & Core B', exercises: ['affondo_bulgaro', 'hip_thrust_monopodalico', 'hollow_hold', 'side_plank'] }
  ];

  let workoutCounter = 1;
  for (let w = 8; w >= 1; w--) {
    for (let sIdx = 0; sIdx < 4; sIdx++) {
      const daysAgo = w * 7 - sIdx * 2 - 1;
      if (daysAgo < 0) continue;
      const d = new Date(Date.now() - daysAgo * 24 * 3600 * 1000);
      const st = sessionTypes[sIdx];

      const sets = st.exercises.flatMap((exId) => {
        const reps = 8 + Math.floor(Math.random() * 4);
        return [
          { exerciseId: exId, serie: 1, repsFatte: reps, secondiFatti: 35, feedback: 'giusto' as const },
          { exerciseId: exId, serie: 2, repsFatte: reps, secondiFatti: 35, feedback: 'giusto' as const },
          { exerciseId: exId, serie: 3, repsFatte: reps - 1, secondiFatti: 30, feedback: (Math.random() > 0.5 ? 'facile' : 'giusto') as 'facile' | 'giusto' }
        ];
      });

      workouts.push({
        id: `demo_workout_${workoutCounter++}`,
        sessionId: st.id,
        sessionName: st.name,
        data: d.toISOString(),
        durataSec: 2400 + Math.floor(Math.random() * 500),
        sets,
        sensazione: (Math.min(5, 3 + Math.floor(Math.random() * 3))) as 1 | 2 | 3 | 4 | 5,
        note: sIdx === 0 ? 'Ottima connessione scapolare, spinta fluida.' : ''
      });
    }
  }

  const plan = generateWorkoutPlan(profile, currentLevels, 2);

  return {
    version: 'calis.v1',
    onboarded: true,
    profile,
    levels: currentLevels,
    assessments: [initialAssessment, recentAssessment],
    plan,
    workouts,
    measurements,
    settings: {
      tema: 'dark',
      suoni: true,
      voce: false,
      vibrazione: true,
      recuperoAutomatico: true
    },
    consecutiveSuccesses: {
      pushup_diamante: 1,
      trazione_completa: 1
    },
    consecutiveFails: {},
    lastWorkoutDate: workouts[workouts.length - 1]?.data || null
  };
}
