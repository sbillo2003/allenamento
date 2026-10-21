/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Pattern, Equipment, AssessmentResult } from '../types';
import { STANDARDS, getAgeFactor, calculateAge } from '../data/standards';

export interface AssessmentInput {
  sex: 'm' | 'f';
  birthDate: string;
  mesiInattivita: number;
  equipment: Equipment[];
  pushUp: number;
  pushUpType: 'completi' | 'ginocchia';
  pullUp: number;
  deadHangSec: number;
  squat: number;
  plankSec: number;
  dipOrRowType: 'dip' | 'row';
  dipOrRow: number;
  hollowHoldSec?: number;
}

export function evaluateAssessment(input: AssessmentInput): AssessmentResult {
  const hasBar = input.equipment.includes('sbarra');
  const hasParallelBars = input.equipment.includes('parallele') || input.equipment.includes('sedia');

  // --- 1. Spinta Orizzontale ---
  let spintaOrizzontale = 1;
  if (input.pushUpType === 'ginocchia' || input.pushUp === 0) {
    spintaOrizzontale = 4;
  } else if (input.pushUp >= 1 && input.pushUp <= 7) {
    spintaOrizzontale = 5;
  } else if (input.pushUp >= 8 && input.pushUp <= 20) {
    spintaOrizzontale = 5; // rep range più alto
  } else if (input.pushUp >= 21 && input.pushUp <= 34) {
    spintaOrizzontale = 6;
  } else if (input.pushUp >= 35) {
    spintaOrizzontale = 7;
  }

  // --- 2. Trazione Verticale ---
  let trazioneVerticale = 1;
  if (input.pullUp === 0) {
    if (input.deadHangSec < 20) {
      trazioneVerticale = 1;
    } else {
      trazioneVerticale = 3;
    }
  } else if (input.pullUp >= 1 && input.pullUp <= 2) {
    trazioneVerticale = 4;
  } else if (input.pullUp >= 3 && input.pullUp <= 7) {
    trazioneVerticale = 5;
  } else if (input.pullUp >= 8 && input.pullUp <= 14) {
    trazioneVerticale = 6;
  } else if (input.pullUp >= 15) {
    trazioneVerticale = 7;
  }

  // --- 3. Gambe Spinta ---
  let gambeSpinta = 2;
  if (input.squat < 20) {
    gambeSpinta = 2;
  } else if (input.squat <= 39) {
    gambeSpinta = 2; // ripetizioni alte
  } else if (input.squat <= 59) {
    gambeSpinta = 3;
  } else {
    gambeSpinta = 4;
  }

  // --- 4. Core Anteriore ---
  let coreAnteriore = 2;
  if (input.plankSec < 45) {
    coreAnteriore = 2;
  } else if (input.plankSec <= 89) {
    coreAnteriore = 3;
  } else if (input.plankSec <= 179) {
    coreAnteriore = hasBar ? 4 : 3;
  } else {
    coreAnteriore = 5;
  }

  // --- 5. Dip & Trazione Orizzontale ---
  let dipLevel = 1;
  let trazioneOrizzontale = 1;

  if (input.dipOrRowType === 'dip') {
    const dips = input.dipOrRow;
    if (dips === 0) dipLevel = 1;
    else if (dips <= 4) dipLevel = 3;
    else if (dips <= 10) dipLevel = 5;
    else dipLevel = 6;

    // Se non abbiamo testato i row direttamente, ricaviamo trazione orizzontale
    trazioneOrizzontale = Math.max(1, Math.min(6, trazioneVerticale));
  } else {
    const rows = input.dipOrRow;
    if (rows < 8) trazioneOrizzontale = 1;
    else if (rows <= 15) trazioneOrizzontale = 3;
    else if (rows <= 25) trazioneOrizzontale = 4;
    else trazioneOrizzontale = 5;

    // Se non abbiamo testato i dip, ricaviamo dai pushup
    dipLevel = Math.max(1, Math.min(6, spintaOrizzontale - 1));
  }

  // --- 6. Pattern derivati senza test diretto ---
  // Spinta verticale: media tra spinta orizzontale e dip
  const spintaVerticale = Math.max(1, Math.min(6, Math.floor((spintaOrizzontale + dipLevel) / 2)));
  
  // Gambe catena posteriore: correlato a gambe spinta
  const catenaPosteriore = Math.max(1, Math.min(5, gambeSpinta));

  // Core laterale: correlato a core anteriore
  const coreLaterale = Math.max(1, Math.min(4, Math.floor(coreAnteriore * 0.8)));

  // Polpacci: correlato a gambe spinta
  const polpacci = Math.max(1, Math.min(3, Math.floor(gambeSpinta * 0.75)));

  let livelli: Record<Pattern, number> = {
    spinta_orizzontale: spintaOrizzontale,
    spinta_verticale: spintaVerticale,
    dip: dipLevel,
    trazione_orizzontale: trazioneOrizzontale,
    trazione_verticale: trazioneVerticale,
    gambe_spinta: gambeSpinta,
    gambe_catena_posteriore: catenaPosteriore,
    core_anteriore: coreAnteriore,
    core_laterale: coreLaterale,
    polpacci: polpacci
  };

  // Correzione per inattività: se fermo da più di 3 mesi, abbassa di 1 livello (minimo 1)
  if (input.mesiInattivita > 3) {
    for (const key of Object.keys(livelli) as Pattern[]) {
      livelli[key] = Math.max(1, livelli[key] - 1);
    }
  }

  // Calcolo classificazione complessiva basata sui test standard corretti per età
  const age = calculateAge(input.birthDate);
  const factor = getAgeFactor(age);

  const getTier = (value: number, band: { principiante: [number, number]; intermedio: [number, number]; avanzato: [number, number]; elite: number }): number => {
    const intermedioMin = Math.floor(band.intermedio[0] * factor);
    const avanzatoMin = Math.floor(band.avanzato[0] * factor);
    const eliteMin = Math.floor(band.elite * factor);

    if (value >= eliteMin) return 4;
    if (value >= avanzatoMin) return 3;
    if (value >= intermedioMin) return 2;
    return 1;
  };

  const pushUpScore = input.pushUpType === 'ginocchia' ? 1 : getTier(input.pushUp, STANDARDS.pushUp[input.sex]);
  const pullUpScore = getTier(input.pullUp, STANDARDS.pullUp[input.sex]);
  const squatScore = getTier(input.squat, STANDARDS.squat);
  const plankScore = getTier(input.plankSec, STANDARDS.plankSec);
  
  const dipOrRowScore = input.dipOrRowType === 'dip'
    ? getTier(input.dipOrRow, STANDARDS.dip[input.sex])
    : getTier(input.dipOrRow, STANDARDS.row);

  const avgScore = (pushUpScore + pullUpScore + squatScore + plankScore + dipOrRowScore) / 5;

  let classificazione: 'Principiante' | 'Intermedio' | 'Avanzato' | 'Élite' = 'Principiante';
  if (avgScore >= 3.4) classificazione = 'Élite';
  else if (avgScore >= 2.5) classificazione = 'Avanzato';
  else if (avgScore >= 1.6) classificazione = 'Intermedio';
  else classificazione = 'Principiante';

  return {
    data: new Date().toISOString(),
    pushUp: input.pushUp,
    pushUpType: input.pushUpType,
    pullUp: input.pullUp,
    deadHangSec: input.deadHangSec,
    squat: input.squat,
    plankSec: input.plankSec,
    dipOrRowType: input.dipOrRowType,
    dipOrRow: input.dipOrRow,
    hollowHoldSec: input.hollowHoldSec,
    livelliCalcolati: livelli,
    classificazioneComplessiva: classificazione
  };
}
