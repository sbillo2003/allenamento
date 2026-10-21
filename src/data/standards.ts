/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sex } from '../types';

export interface PerformanceBand {
  principiante: [number, number];
  intermedio: [number, number];
  avanzato: [number, number];
  elite: number; // minimo per elite
}

export const STANDARDS: {
  pushUp: Record<Sex, PerformanceBand>;
  pullUp: Record<Sex, PerformanceBand>;
  squat: PerformanceBand;
  plankSec: PerformanceBand;
  dip: Record<Sex, PerformanceBand>;
  row: PerformanceBand;
} = {
  pushUp: {
    m: { principiante: [0, 9], intermedio: [10, 24], avanzato: [25, 44], elite: 45 },
    f: { principiante: [0, 5], intermedio: [6, 14], avanzato: [15, 29], elite: 30 }
  },
  pullUp: {
    m: { principiante: [0, 0], intermedio: [1, 5], avanzato: [6, 11], elite: 12 },
    f: { principiante: [0, 0], intermedio: [1, 2], avanzato: [3, 7], elite: 8 }
  },
  squat: {
    principiante: [0, 19],
    intermedio: [20, 39],
    avanzato: [40, 59],
    elite: 60
  },
  plankSec: {
    principiante: [0, 44],
    intermedio: [45, 89],
    avanzato: [90, 179],
    elite: 180
  },
  dip: {
    m: { principiante: [0, 0], intermedio: [1, 7], avanzato: [8, 15], elite: 16 },
    f: { principiante: [0, 0], intermedio: [1, 4], avanzato: [5, 10], elite: 11 }
  },
  row: {
    principiante: [0, 7],
    intermedio: [8, 15],
    avanzato: [16, 25],
    elite: 26
  }
};

/**
 * Calcola il fattore di correzione per età da applicare alle soglie:
 * fino a 39 anni: 1.0; 40-49: 0.85; 50-59: 0.70; 60 e oltre: 0.55.
 */
export function getAgeFactor(age: number): number {
  if (age < 40) return 1.0;
  if (age < 50) return 0.85;
  if (age < 60) return 0.70;
  return 0.55;
}

/**
 * Calcola l'età da una data di nascita in formato YYYY-MM-DD
 */
export function calculateAge(birthDateStr: string): number {
  const birth = new Date(birthDateStr);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return isNaN(age) || age < 10 ? 25 : age;
}
