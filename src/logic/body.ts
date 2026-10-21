/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sex } from '../types';

export interface BodyComposition {
  bmi: number;
  bmiCategory: string;
  bodyFatPercent: number | null; // Stima US Navy o null se mancano misure
  bmr: number; // Basale Mifflin-St Jeor
  tdee: Record<'sedentario' | 'leggero' | 'moderato' | 'intenso', number>;
}

export function calculateBMI(weightKg: number, heightCm: number): { bmi: number; category: string } {
  if (heightCm <= 0 || weightKg <= 0) {
    return { bmi: 0, category: '-' };
  }
  const heightM = heightCm / 100;
  const bmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10;

  let category = 'Normopeso';
  if (bmi < 18.5) category = 'Sottopeso';
  else if (bmi < 25) category = 'Normopeso';
  else if (bmi < 30) category = 'Sovrappeso';
  else category = 'Obesità';

  return { bmi, category };
}

/**
 * Calcolo massa grassa con formula US Navy (in cm).
 * Uomo: 495 / (1.0324 - 0.19077 * log10(vita - collo) + 0.15456 * log10(altezza)) - 450
 * Donna: 495 / (1.29579 - 0.35004 * log10(vita + fianchi - collo) + 0.22100 * log10(altezza)) - 450
 */
export function calculateNavyBodyFat(
  sex: Sex,
  heightCm: number,
  waistCm: number,
  neckCm: number,
  hipsCm?: number
): number | null {
  if (!heightCm || !waistCm || !neckCm) return null;

  if (sex === 'm') {
    const diff = waistCm - neckCm;
    if (diff <= 0) return null;
    const denom = 1.0324 - 0.19077 * Math.log10(diff) + 0.15456 * Math.log10(heightCm);
    if (denom <= 0) return null;
    const bf = 495 / denom - 450;
    return bf > 3 && bf < 60 ? Math.round(bf * 10) / 10 : null;
  } else {
    if (!hipsCm) return null;
    const sumDiff = waistCm + hipsCm - neckCm;
    if (sumDiff <= 0) return null;
    const denom = 1.29579 - 0.35004 * Math.log10(sumDiff) + 0.221 * Math.log10(heightCm);
    if (denom <= 0) return null;
    const bf = 495 / denom - 450;
    return bf > 5 && bf < 65 ? Math.round(bf * 10) / 10 : null;
  }
}

/**
 * Metabolismo basale Mifflin-St Jeor:
 * Uomo: 10 * kg + 6.25 * cm - 5 * eta + 5
 * Donna: 10 * kg + 6.25 * cm - 5 * eta - 161
 */
export function calculateMifflinStJeor(
  sex: Sex,
  weightKg: number,
  heightCm: number,
  age: number
): { bmr: number; tdee: Record<'sedentario' | 'leggero' | 'moderato' | 'intenso', number> } {
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + (sex === 'm' ? 5 : -161);
  bmr = Math.max(800, Math.round(bmr));

  return {
    bmr,
    tdee: {
      sedentario: Math.round(bmr * 1.2),
      leggero: Math.round(bmr * 1.375),
      moderato: Math.round(bmr * 1.55),
      intenso: Math.round(bmr * 1.725)
    }
  };
}

export function computeBodyComposition(
  sex: Sex,
  age: number,
  heightCm: number,
  weightKg: number,
  waistCm?: number,
  neckCm?: number,
  hipsCm?: number
): BodyComposition {
  const { bmi, category } = calculateBMI(weightKg, heightCm);
  const bodyFatPercent =
    waistCm && neckCm ? calculateNavyBodyFat(sex, heightCm, waistCm, neckCm, hipsCm) : null;
  const { bmr, tdee } = calculateMifflinStJeor(sex, weightKg, heightCm, age);

  return {
    bmi,
    bmiCategory: category,
    bodyFatPercent,
    bmr,
    tdee
  };
}
