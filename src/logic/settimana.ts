/**
 * Numeri della settimana per la home: sessioni fatte, serie fatte rispetto
 * allo stesso punto della settimana scorsa, fase del ciclo.
 */

import { WorkoutLog } from '../types';

const ORA_MS = 3_600_000;
const SETTIMANA_MS = 7 * 24 * ORA_MS;

/** Lunedi' alle 00:00 della settimana che contiene la data. */
export function lunedi(d: Date): Date {
  const x = new Date(d);
  const giorno = x.getDay() === 0 ? 7 : x.getDay();
  x.setDate(x.getDate() - (giorno - 1));
  x.setHours(0, 0, 0, 0);
  return x;
}

function serieTra(workouts: WorkoutLog[], da: number, a: number): number {
  let n = 0;
  for (const w of workouts) {
    const t = new Date(w.data).getTime();
    if (Number.isFinite(t) && t >= da && t < a) n += w.sets.length;
  }
  return n;
}

export interface VolumeSettimana {
  serie: number;
  /** Variazione percentuale sullo stesso punto della settimana scorsa; null se non confrontabile. */
  variazione: number | null;
}

/**
 * Serie fatte da lunedi' a ora, confrontate con la settimana scorsa fino
 * allo stesso giorno e alla stessa ora. Confrontare con la settimana
 * scorsa intera darebbe un -70% ogni mercoledi', senza dire nulla.
 */
export function volumeSettimana(workouts: WorkoutLog[], ora: Date = new Date()): VolumeSettimana {
  const inizio = lunedi(ora).getTime();
  const trascorso = ora.getTime() - inizio;

  const serie = serieTra(workouts, inizio, ora.getTime() + 1);
  const scorsa = serieTra(workouts, inizio - SETTIMANA_MS, inizio - SETTIMANA_MS + trascorso);

  return {
    serie,
    variazione: scorsa > 0 ? Math.round(((serie - scorsa) / scorsa) * 100) : null
  };
}

/** Sessioni completate questa settimana, contando una al giorno come fa la home. */
export function sessioniDellaSettimana(workouts: WorkoutLog[], ora: Date = new Date()): number {
  const inizio = lunedi(ora).getTime();
  const giorni = new Set<string>();
  for (const w of workouts) {
    const d = new Date(w.data);
    if (d.getTime() >= inizio && d.getTime() <= ora.getTime()) giorni.add(d.toDateString());
  }
  return giorni.size;
}

export function fasePiano(settimana: number): { breve: string; lunga: string } {
  if (settimana === 5) return { breve: 'Scarico', lunga: 'Scarico attivo (-40% volume)' };
  if (settimana === 3 || settimana === 4) {
    return { breve: 'Carico', lunga: 'Sovraccarico (+1 serie)' };
  }
  return { breve: 'Base', lunga: 'Volume base' };
}
