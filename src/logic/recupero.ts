/**
 * Recupero muscolare stimato dallo storico degli allenamenti.
 *
 * E' un modello semplice e dichiarato, non una misura: nessun sensore, solo
 * quante serie hai fatto su un distretto e da quante ore. Serve a dire
 * "oggi il petto e' ancora scarico", non a diagnosticare nulla.
 *
 * Regola: ogni seduta lascia su un distretto una dose di lavoro (serie
 * pesate: primario 1, secondario 0.4) e quella dose fissa il tempo di
 * recupero, da 24h per un tocco leggero fino a 72h per un carico pesante.
 * Il recupero cresce in modo lineare dal momento dell'allenamento.
 */

import { WorkoutLog } from '../types';
import { EXERCISES } from '../data/exercises';
import { Distretto, NOMI_DISTRETTI, distrettiDi } from '../data/muscoli';

export type StatoRecupero = 'pronto' | 'in_recupero' | 'da_recuperare';

export interface RecuperoDistretto {
  distretto: Distretto;
  /** 0-100. */
  percentuale: number;
  stato: StatoRecupero;
  /** Ore mancanti al 100%. */
  oreAlPronto: number;
  /** True se il distretto e' stato allenato negli ultimi 7 giorni. */
  allenatoDiRecente: boolean;
}

const PESO_PRIMARIO = 1;
const PESO_SECONDARIO = 0.4;
const ORE_MINIME = 24;
const ORE_MASSIME = 72;
const ORE_PER_SERIE_PESATA = 6;
const FINESTRA_RECENTE_ORE = 7 * 24;

export const SOGLIA_PRONTO = 90;
export const SOGLIA_DA_RECUPERARE = 60;

export function statoDa(percentuale: number): StatoRecupero {
  if (percentuale >= SOGLIA_PRONTO) return 'pronto';
  if (percentuale >= SOGLIA_DA_RECUPERARE) return 'in_recupero';
  return 'da_recuperare';
}

/** Ore di recupero necessarie dopo una seduta con questa dose di lavoro. */
export function oreDiRecupero(seriePesate: number): number {
  const ore = ORE_MINIME + ORE_PER_SERIE_PESATA * seriePesate;
  return Math.min(ORE_MASSIME, Math.max(ORE_MINIME, ore));
}

const TUTTI = Object.keys(NOMI_DISTRETTI) as Distretto[];

/** Serie pesate per distretto in una singola seduta. */
function doseDellaSeduta(w: WorkoutLog): Partial<Record<Distretto, number>> {
  const dose: Partial<Record<Distretto, number>> = {};
  for (const s of w.sets) {
    const ex = EXERCISES.find((e) => e.id === s.exerciseId);
    if (!ex) continue;
    const d = distrettiDi(ex);
    for (const p of d.primari) dose[p] = (dose[p] || 0) + PESO_PRIMARIO;
    for (const sec of d.secondari) dose[sec] = (dose[sec] || 0) + PESO_SECONDARIO;
  }
  return dose;
}

export function calcolaRecupero(
  workouts: WorkoutLog[],
  ora: Date = new Date()
): Record<Distretto, RecuperoDistretto> {
  const risultato = {} as Record<Distretto, RecuperoDistretto>;
  for (const d of TUTTI) {
    risultato[d] = {
      distretto: d,
      percentuale: 100,
      stato: 'pronto',
      oreAlPronto: 0,
      allenatoDiRecente: false
    };
  }

  for (const w of workouts) {
    const trascorse = (ora.getTime() - new Date(w.data).getTime()) / 3_600_000;
    if (!Number.isFinite(trascorse) || trascorse < 0 || trascorse > FINESTRA_RECENTE_ORE) continue;

    const dose = doseDellaSeduta(w);
    for (const d of TUTTI) {
      const serie = dose[d];
      if (!serie) continue;

      const r = risultato[d];
      r.allenatoDiRecente = true;

      const ore = oreDiRecupero(serie);
      const percentuale = Math.min(100, Math.round((trascorse / ore) * 100));
      // vale la seduta che lascia il distretto piu' scarico
      if (percentuale < r.percentuale) {
        r.percentuale = percentuale;
        r.oreAlPronto = Math.max(0, Math.ceil(ore - trascorse));
      }
    }
  }

  for (const d of TUTTI) risultato[d].stato = statoDa(risultato[d].percentuale);
  return risultato;
}

/** Recupero complessivo: media sui distretti. */
export function recuperoComplessivo(r: Record<Distretto, RecuperoDistretto>): number {
  const valori = Object.values(r).map((x) => x.percentuale);
  return Math.round(valori.reduce((a, b) => a + b, 0) / valori.length);
}

/** Distretti allenati di recente che non sono ancora pronti, dal piu' scarico. */
export function distrettiScarichi(r: Record<Distretto, RecuperoDistretto>): RecuperoDistretto[] {
  return Object.values(r)
    .filter((x) => x.allenatoDiRecente && x.stato !== 'pronto')
    .sort((a, b) => a.percentuale - b.percentuale);
}

/** Fra i distretti primari di una seduta, quelli ancora scarichi. */
export function avvisiPerSeduta(
  r: Record<Distretto, RecuperoDistretto>,
  primariDellaSeduta: Distretto[]
): RecuperoDistretto[] {
  return primariDellaSeduta
    .map((d) => r[d])
    .filter((x) => x.stato === 'da_recuperare')
    .sort((a, b) => a.percentuale - b.percentuale);
}
