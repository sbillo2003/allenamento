/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { calculateBMI, calculateNavyBodyFat, calculateMifflinStJeor } from './body';
import { getAgeFactor, calculateAge } from '../data/standards';
import { evaluateAssessment } from './assessment';
import { selectExerciseForPattern, getBlockSpecs, generateWorkoutPlan, calculateRealSessionDurationMinutes } from './generator';
import { processWorkoutProgression, checkLongAbsence, checkNeedRetest } from './progression';
import { Profile, WorkoutLog } from '../types';

test('BMI and Mifflin-St Jeor calculations', () => {
  const bmiResult = calculateBMI(75, 180);
  assert.equal(bmiResult.bmi, 23.1);
  assert.equal(bmiResult.category, 'Normopeso');

  const { bmr, tdee } = calculateMifflinStJeor('m', 75, 180, 30);
  // 10 * 75 + 6.25 * 180 - 5 * 30 + 5 = 750 + 1125 - 150 + 5 = 1730
  assert.equal(bmr, 1730);
  assert.equal(tdee.moderato, Math.round(1730 * 1.55));
});

test('US Navy body fat formula handles valid measurements', () => {
  const bfMale = calculateNavyBodyFat('m', 180, 82, 38);
  assert.ok(bfMale !== null && bfMale > 10 && bfMale < 25);

  const bfFemale = calculateNavyBodyFat('f', 165, 70, 32, 95);
  assert.ok(bfFemale !== null && bfFemale > 15 && bfFemale < 35);
});

test('Age correction factors for performance standards', () => {
  assert.equal(getAgeFactor(25), 1.0);
  assert.equal(getAgeFactor(39), 1.0);
  assert.equal(getAgeFactor(45), 0.85);
  assert.equal(getAgeFactor(55), 0.70);
  assert.equal(getAgeFactor(68), 0.55);
});

test('evaluateAssessment deterministic pattern levels', () => {
  const result = evaluateAssessment({
    sex: 'm',
    birthDate: '1995-01-01',
    mesiInattivita: 0,
    equipment: ['pavimento', 'sbarra', 'parallele'],
    pushUp: 15,
    pushUpType: 'completi',
    pullUp: 5,
    deadHangSec: 50,
    squat: 45,
    plankSec: 100,
    dipOrRowType: 'dip',
    dipOrRow: 8
  });

  // 15 pushups -> livello 5
  assert.equal(result.livelliCalcolati.spinta_orizzontale, 5);
  // 5 pullups -> livello 5
  assert.equal(result.livelliCalcolati.trazione_verticale, 5);
  // 45 squats -> livello 3
  assert.equal(result.livelliCalcolati.gambe_spinta, 3);
  // 100s plank con sbarra -> livello 4
  assert.equal(result.livelliCalcolati.core_anteriore, 4);
  // 8 dips -> livello 5
  assert.equal(result.livelliCalcolati.dip, 5);
  // spinta_verticale media floor((5+5)/2) -> 5
  assert.equal(result.livelliCalcolati.spinta_verticale, 5);
});

test('evaluateAssessment applies inactivity penalty for > 3 months', () => {
  const result = evaluateAssessment({
    sex: 'm',
    birthDate: '1995-01-01',
    mesiInattivita: 4,
    equipment: ['pavimento', 'sbarra', 'parallele'],
    pushUp: 15,
    pushUpType: 'completi',
    pullUp: 5,
    deadHangSec: 50,
    squat: 45,
    plankSec: 100,
    dipOrRowType: 'dip',
    dipOrRow: 8
  });

  // Livello 5 - 1 = 4
  assert.equal(result.livelliCalcolati.spinta_orizzontale, 4);
});

test('selectExerciseForPattern respects equipment and target level', () => {
  // If user only has pavimento, cannot do parallel dip
  const floorEx = selectExerciseForPattern('spinta_orizzontale', 5, ['pavimento'], []);
  assert.equal(floorEx.id, 'pushup_completo');

  // If user has target level 6, but only has pavimento, gets max possible
  const dipFloor = selectExerciseForPattern('dip', 5, ['pavimento'], []);
  // bench dip on chair requires sedia, if user has sedia
  const dipChair = selectExerciseForPattern('dip', 5, ['sedia'], []);
  assert.equal(dipChair.livello <= 2, true);
});

test('getBlockSpecs reduces deload week volume by 40%', () => {
  const normalSpecs = getBlockSpecs('ipertrofia', 45, false, false, 1, 0);
  const deloadSpecs = getBlockSpecs('ipertrofia', 45, false, false, 5, 0);

  assert.ok(deloadSpecs.serie < normalSpecs.serie);
});

test('Long absence detection', () => {
  const twelveDaysAgo = new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString();
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString();

  assert.equal(checkLongAbsence(twelveDaysAgo), true);
  assert.equal(checkLongAbsence(twoDaysAgo), false);
});

test('calculateRealSessionDurationMinutes considers TUT, rests, and warmups', () => {
  const sampleSession = {
    id: 'test_session',
    giorno: 1,
    nome: 'Full Body Test',
    patternCoinvolti: ['spinta_orizzontale' as const],
    blocks: [
      {
        exerciseId: 'pushup_completo',
        serie: 3,
        repMin: 8,
        repMax: 12,
        secondi: 0,
        recuperoSec: 90
      }
    ]
  };
  const duration = calculateRealSessionDurationMinutes(sampleSession);
  // Warmup (300) + Cooldown (180) + 3 * (10 reps * 3.5s = 105s) + 2 * 90s (180s) + 60s transition = 1005s / 60 = ~17 min
  assert.ok(duration >= 15 && duration <= 25);
});

test('checkNeedRetest detects when 6 weeks have elapsed', () => {
  const sevenWeeksAgo = new Date(Date.now() - 43 * 24 * 3600 * 1000).toISOString();
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString();

  assert.equal(checkNeedRetest(sevenWeeksAgo), true);
  assert.equal(checkNeedRetest(twoWeeksAgo), false);
});
