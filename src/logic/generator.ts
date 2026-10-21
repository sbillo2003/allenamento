/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Profile,
  Plan,
  PlannedSession,
  PlannedBlock,
  Pattern,
  Exercise,
  Goal,
  DurationMin,
  DaysPerWeek
} from '../types';
import { EXERCISES } from '../data/exercises';

export interface WarmupItem {
  nome: string;
  durataSec: number;
  istruzione: string;
}

export const WARMUP_ROUTINE: WarmupItem[] = [
  { nome: 'Circonduzioni braccia', durataSec: 60, istruzione: '30s in avanti, 30s all’indietro con ampiezza progressiva.' },
  { nome: 'Dislocazioni spalle / rotazioni', durataSec: 60, istruzione: 'Movimento circolare fluido a braccia morbide.' },
  { nome: 'Cat-Cow a terra', durataSec: 60, istruzione: 'Mobilizza la colonna coordinando respiro e retro/antiversione.' },
  { nome: 'Squat lenti a corpo libero', durataSec: 60, istruzione: 'Discesa lenta in 3 secondi con apertura delle anche.' },
  { nome: 'Scapular push-up / pull-up', durataSec: 60, istruzione: 'Attivazione e isolamento della mobilità scapolare.' }
];

export const COOLDOWN_ROUTINE: WarmupItem[] = [
  { nome: 'Allungamento pettorali e bicipiti', durataSec: 45, istruzione: 'Braccio al muro con torsione dolce del tronco.' },
  { nome: 'Allungamento dorsale in ginocchio', durataSec: 45, istruzione: 'Seduto sui talloni, braccia distese in avanti sul pavimento.' },
  { nome: 'Allungamento quadricipiti e psoas', durataSec: 45, istruzione: 'Affondo a terra allungando la coscia posteriore.' },
  { nome: 'Cane a testa in giù / Femorali', durataSec: 45, istruzione: 'Distendi le gambe premendo i talloni al suolo.' }
];

/**
 * Trova l'esercizio ideale per un pattern dato il livello dell'utente,
 * filtrando per attrezzatura e limitazioni fisiche.
 */
export function selectExerciseForPattern(
  pattern: Pattern,
  targetLevel: number,
  userEquipment: string[],
  userLimitations: string[]
): Exercise {
  const allInPattern = EXERCISES.filter((e) => e.pattern === pattern);
  if (allInPattern.length === 0) {
    throw new Error(`Nessun esercizio registrato per il pattern ${pattern}`);
  }

  // Verifica compatibilità attrezzatura
  const isEquipCompatible = (e: Exercise) =>
    e.attrezzaturaRichiesta.every((req) => req === 'pavimento' || userEquipment.includes(req));

  // Verifica assenza di conflitti con limitazioni
  const isLimitationSafe = (e: Exercise) =>
    !e.limitazioniEscluse.some((lim) => userLimitations.includes(lim));

  const validExercises = allInPattern.filter((e) => isEquipCompatible(e) && isLimitationSafe(e));

  // Se nessun esercizio supera tutti i filtri, rilassiamo le limitazioni cercando il più sicuro
  const candidatePool = validExercises.length > 0 ? validExercises : allInPattern.filter(isEquipCompatible);
  const finalPool = candidatePool.length > 0 ? candidatePool : allInPattern;

  // Cerca il livello esatto o il più vicino <= targetLevel, oppure il minimo disponibile
  const exactOrLower = finalPool
    .filter((e) => e.livello <= targetLevel)
    .sort((a, b) => b.livello - a.livello);

  if (exactOrLower.length > 0) {
    return exactOrLower[0];
  }

  // Se tutti sono sopra il target, prendi il livello più basso disponibile
  return finalPool.sort((a, b) => a.livello - b.livello)[0];
}

/**
 * Ottiene le specifiche di serie, reps, recupero in base a obiettivo e durata
 */
export function getBlockSpecs(
  goal: Goal,
  duration: DurationMin,
  isTempo: boolean,
  isAccessory: boolean,
  settimanaCorrente: number = 1,
  mesiInattivita: number = 0
): { serie: number; repMin: number; repMax: number; secondi: number; recuperoSec: number } {
  let baseSets = 3;
  if (duration === 20) baseSets = 2;
  else if (duration === 30) baseSets = 3;
  else if (duration === 45) baseSets = 3;
  else if (duration === 60) baseSets = 4;

  let repMin = 8;
  let repMax = 12;
  let secondi = 30;
  let recuperoSec = 90;

  switch (goal) {
    case 'forza':
      baseSets = Math.min(5, baseSets + 1);
      repMin = 3;
      repMax = 6;
      secondi = 15;
      recuperoSec = 160;
      break;
    case 'ipertrofia':
      repMin = 6;
      repMax = 12;
      secondi = 30;
      recuperoSec = 100;
      break;
    case 'resistenza':
      baseSets = 3;
      repMin = 15;
      repMax = 25;
      secondi = 50;
      recuperoSec = 50;
      break;
    case 'dimagrimento':
      baseSets = 3;
      repMin = 12;
      repMax = 20;
      secondi = 45;
      recuperoSec = 45;
      break;
    case 'generale':
    default:
      baseSets = 3;
      repMin = 8;
      repMax = 15;
      secondi = 30;
      recuperoSec = 90;
      break;
  }

  // Riduzione per esercizi accessori per non eccedere volume settimanale
  let finalSets = isAccessory ? Math.max(2, baseSets - 1) : baseSets;

  // Ciclo 4 settimane: settimana 3 e 4 +1 serie sui fondamentali
  if (!isAccessory && (settimanaCorrente === 3 || settimanaCorrente === 4)) {
    finalSets += 1;
  }

  // Settimana 5 di scarico: volume ridotto del 40%
  if (settimanaCorrente === 5) {
    finalSets = Math.max(2, Math.round(finalSets * 0.6));
  }

  // Se utente fermo da > 3 mesi: prime 2 settimane -30% serie
  if (mesiInattivita > 3 && settimanaCorrente <= 2) {
    finalSets = Math.max(2, Math.round(finalSets * 0.7));
  }

  return {
    serie: finalSets,
    repMin,
    repMax,
    secondi: isTempo ? secondi : 0,
    recuperoSec
  };
}

/**
 * Genera il piano di allenamento su misura
 */
export function generateWorkoutPlan(
  profile: Profile,
  levels: Record<Pattern, number>,
  settimanaCorrente: number = 1
): Plan {
  const days = profile.giorniSettimana;
  const duration = profile.durataSessioneMin;

  // Numero di esercizi per sessione in base alla durata
  let numExercises = 5;
  if (duration === 20) numExercises = 4;
  else if (duration === 30) numExercises = 5;
  else if (duration === 45) numExercises = 6;
  else if (duration === 60) numExercises = 8;

  let splitName: Plan['split'] = 'Full Body';
  let sessionBlueprints: { giorno: number; nome: string; patterns: Pattern[] }[] = [];

  if (days <= 3) {
    splitName = 'Full Body';
    // 2 o 3 sessioni Full Body: coprono spinta, trazione, gambe, core
    const daysAssigned = days === 2 ? [1, 4] : [1, 3, 5]; // Lun-Gio o Lun-Mer-Ven
    sessionBlueprints = daysAssigned.map((g, idx) => {
      const variant = String.fromCharCode(65 + idx); // A, B, C
      const patterns: Pattern[] =
        idx % 2 === 0
          ? [
              'spinta_orizzontale',
              'trazione_verticale',
              'gambe_spinta',
              'core_anteriore',
              'spinta_verticale',
              'gambe_catena_posteriore',
              'core_laterale',
              'polpacci'
            ]
          : [
              'dip',
              'trazione_orizzontale',
              'gambe_catena_posteriore',
              'gambe_spinta',
              'spinta_orizzontale',
              'core_anteriore',
              'spinta_verticale',
              'polpacci'
            ];
      return {
        giorno: g,
        nome: `Full Body ${variant}`,
        patterns: patterns.slice(0, numExercises)
      };
    });
  } else if (days === 4) {
    splitName = 'Upper / Lower';
    // 4 giorni: Lun (Upper A), Mar (Lower A), Gio (Upper B), Ven (Lower B)
    const upperPatternsA: Pattern[] = ['spinta_orizzontale', 'trazione_verticale', 'dip', 'trazione_orizzontale', 'spinta_verticale', 'core_anteriore', 'core_laterale', 'polpacci'];
    const lowerPatternsA: Pattern[] = ['gambe_spinta', 'gambe_catena_posteriore', 'gambe_spinta', 'core_anteriore', 'core_laterale', 'polpacci', 'gambe_catena_posteriore', 'core_anteriore'];
    const upperPatternsB: Pattern[] = ['spinta_verticale', 'trazione_orizzontale', 'spinta_orizzontale', 'trazione_verticale', 'dip', 'core_laterale', 'core_anteriore', 'polpacci'];
    const lowerPatternsB: Pattern[] = ['gambe_catena_posteriore', 'gambe_spinta', 'polpacci', 'core_anteriore', 'gambe_spinta', 'core_laterale', 'polpacci', 'gambe_catena_posteriore'];

    sessionBlueprints = [
      { giorno: 1, nome: 'Upper Body A', patterns: upperPatternsA.slice(0, numExercises) },
      { giorno: 2, nome: 'Lower Body & Core A', patterns: lowerPatternsA.slice(0, numExercises) },
      { giorno: 4, nome: 'Upper Body B', patterns: upperPatternsB.slice(0, numExercises) },
      { giorno: 5, nome: 'Lower Body & Core B', patterns: lowerPatternsB.slice(0, numExercises) }
    ];
  } else {
    // 5 o 6 giorni: Push / Pull / Legs
    splitName = 'Push / Pull / Legs';
    const pushPatternsA: Pattern[] = ['spinta_orizzontale', 'dip', 'spinta_verticale', 'core_anteriore', 'spinta_orizzontale', 'dip', 'core_laterale', 'spinta_verticale'];
    const pullPatternsA: Pattern[] = ['trazione_verticale', 'trazione_orizzontale', 'trazione_verticale', 'trazione_orizzontale', 'core_laterale', 'core_anteriore', 'trazione_verticale', 'trazione_orizzontale'];
    const legsPatternsA: Pattern[] = ['gambe_spinta', 'gambe_catena_posteriore', 'polpacci', 'core_anteriore', 'gambe_spinta', 'gambe_catena_posteriore', 'polpacci', 'core_laterale'];

    const pushPatternsB: Pattern[] = ['spinta_verticale', 'spinta_orizzontale', 'dip', 'core_anteriore', 'spinta_verticale', 'dip', 'core_laterale', 'spinta_orizzontale'];
    const pullPatternsB: Pattern[] = ['trazione_orizzontale', 'trazione_verticale', 'trazione_orizzontale', 'core_anteriore', 'trazione_verticale', 'core_laterale', 'trazione_orizzontale', 'trazione_verticale'];
    const legsPatternsB: Pattern[] = ['gambe_catena_posteriore', 'gambe_spinta', 'polpacci', 'core_laterale', 'gambe_catena_posteriore', 'gambe_spinta', 'polpacci', 'core_anteriore'];

    const allPPL = [
      { giorno: 1, nome: 'Push A', patterns: pushPatternsA.slice(0, numExercises) },
      { giorno: 2, nome: 'Pull A', patterns: pullPatternsA.slice(0, numExercises) },
      { giorno: 3, nome: 'Legs & Core A', patterns: legsPatternsA.slice(0, numExercises) },
      { giorno: 5, nome: 'Push B', patterns: pushPatternsB.slice(0, numExercises) },
      { giorno: 6, nome: 'Pull B', patterns: pullPatternsB.slice(0, numExercises) },
      { giorno: 7, nome: 'Legs & Core B', patterns: legsPatternsB.slice(0, numExercises) }
    ];

    sessionBlueprints = days === 5 ? allPPL.slice(0, 5) : allPPL;
  }

  // Costruisci le sessioni concrete
  const sessions: PlannedSession[] = sessionBlueprints.map((blueprint, sIdx) => {
    const blocks: PlannedBlock[] = blueprint.patterns.map((pat, bIdx) => {
      const userLevel = levels[pat] || 1;
      const exercise = selectExerciseForPattern(
        pat,
        userLevel,
        profile.attrezzatura,
        profile.limitazioni
      );
      const isAccessory = bIdx >= 3;
      const specs = getBlockSpecs(
        profile.obiettivo,
        duration,
        exercise.tipo === 'tempo',
        isAccessory,
        settimanaCorrente,
        profile.mesiInattivita
      );

      return {
        exerciseId: exercise.id,
        serie: specs.serie,
        repMin: specs.repMin,
        repMax: specs.repMax,
        secondi: specs.secondi,
        recuperoSec: specs.recuperoSec
      };
    });

    return {
      id: `session_${sIdx + 1}`,
      giorno: blueprint.giorno,
      nome: blueprint.nome,
      patternCoinvolti: blueprint.patterns,
      blocks
    };
  });

  return {
    id: `plan_${Date.now()}`,
    creatoIl: new Date().toISOString(),
    settimanaCorrente,
    split: splitName,
    sessions
  };
}


/**
 * Calcola la durata stimata reale della sessione in minuti:
 * somma di serie per tempo sotto tensione (TUT), recuperi tra serie e tra esercizi,
 * più 5 minuti di riscaldamento (300s) e 3 minuti di defaticamento (180s).
 */
export function calculateRealSessionDurationMinutes(session: PlannedSession): number {
  let totalSecs = 300 + 180; // 5 min riscaldamento + 3 min defaticamento

  for (const block of session.blocks) {
    const ex = EXERCISES.find((e) => e.id === block.exerciseId);
    let tutPerSet: number;
    if (ex?.tipo === 'tempo') {
      tutPerSet = block.secondi || 30;
    } else {
      const avgReps = (block.repMin + block.repMax) / 2 || 10;
      tutPerSet = avgReps * 3.5; // ~3.5s tempo under tension per rep
    }
    // Per esercizi unilaterali, il tempo raddoppia per completare entrambi i lati
    if (ex?.unilaterale) {
      tutPerSet *= 2;
    }

    totalSecs += block.serie * tutPerSet;
    totalSecs += Math.max(0, block.serie - 1) * (block.recuperoSec || 90);
    totalSecs += 60; // transizione verso l'esercizio successivo
  }

  return Math.max(15, Math.round(totalSecs / 60));
}
