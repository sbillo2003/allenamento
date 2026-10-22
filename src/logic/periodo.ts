/**
 * Periodo scelto sopra i grafici dei progressi: quali dati contano e come
 * si raggruppa il volume in barre.
 */

import { WorkoutLog } from '../types';

export type Periodo = '7g' | '30g' | '90g' | 'tutti';

export const PERIODI: { id: Periodo; etichetta: string }[] = [
  { id: '7g', etichetta: '7g' },
  { id: '30g', etichetta: '30g' },
  { id: '90g', etichetta: '90g' },
  { id: 'tutti', etichetta: 'Tutti' }
];

const GIORNO_MS = 24 * 3_600_000;
const SETTIMANA_MS = 7 * GIORNO_MS;
const MIN_SETTIMANE = 4;
const MAX_SETTIMANE = 52;
const GIORNI: Record<Exclude<Periodo, 'tutti'>, number> = { '7g': 7, '30g': 30, '90g': 90 };

/** Tiene gli elementi con data dentro il periodo; 'tutti' non filtra. */
export function filtraPerPeriodo<T extends { data: string }>(
  elementi: T[],
  periodo: Periodo,
  adesso: Date = new Date()
): T[] {
  if (periodo === 'tutti') return elementi;
  const da = adesso.getTime() - GIORNI[periodo] * GIORNO_MS;
  return elementi.filter((e) => {
    const t = new Date(e.data).getTime();
    return Number.isFinite(t) && t >= da && t <= adesso.getTime();
  });
}

export interface BloccoVolume {
  etichetta: string;
  volume: number;
  serie: number;
}

function sommaTra(workouts: WorkoutLog[], da: number, a: number) {
  let volume = 0;
  let serie = 0;
  for (const w of workouts) {
    const t = new Date(w.data).getTime();
    if (!Number.isFinite(t) || t < da || t >= a) continue;
    for (const s of w.sets) {
      volume += s.repsFatte || 1;
      serie++;
    }
  }
  return { volume, serie };
}

/**
 * Barre del volume: 7g = un blocco per giorno, gli altri = un blocco per
 * settimana (a ritroso da adesso). 'tutti' parte dalla prima seduta, tra 4 e 52 settimane.
 */
export function bloccoVolume(
  workouts: WorkoutLog[],
  periodo: Periodo,
  adesso: Date = new Date()
): BloccoVolume[] {
  const blocchi: BloccoVolume[] = [];

  if (periodo === '7g') {
    const oggi = new Date(adesso);
    oggi.setHours(0, 0, 0, 0);
    for (let i = 6; i >= 0; i--) {
      const inizio = new Date(oggi);
      inizio.setDate(oggi.getDate() - i);
      const fine = new Date(inizio);
      fine.setDate(inizio.getDate() + 1);
      const etichetta =
        i === 0
          ? 'Oggi'
          : inizio.toLocaleDateString('it-IT', { weekday: 'short' }).replace('.', '');
      blocchi.push({ etichetta, ...sommaTra(workouts, inizio.getTime(), fine.getTime()) });
    }
    return blocchi;
  }

  let settimane: number;
  if (periodo === 'tutti') {
    const tempi = workouts.map((w) => new Date(w.data).getTime()).filter(Number.isFinite);
    const primo = tempi.length > 0 ? Math.min(...tempi) : adesso.getTime();
    const trascorse = Math.ceil((adesso.getTime() - primo) / SETTIMANA_MS);
    settimane = Math.min(MAX_SETTIMANE, Math.max(MIN_SETTIMANE, trascorse));
  } else {
    settimane = Math.ceil(GIORNI[periodo] / 7);
  }

  for (let i = settimane - 1; i >= 0; i--) {
    const da = adesso.getTime() - (i + 1) * SETTIMANA_MS;
    const a = adesso.getTime() - i * SETTIMANA_MS;
    blocchi.push({ etichetta: i === 0 ? 'Oggi' : `S-${i}`, ...sommaTra(workouts, da, a) });
  }
  return blocchi;
}
