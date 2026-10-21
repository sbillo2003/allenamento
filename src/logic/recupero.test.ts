import test from 'node:test';
import assert from 'node:assert/strict';

import { calcolaRecupero, oreDiRecupero, recuperoComplessivo, distrettiScarichi, avvisiPerSeduta } from './recupero';
import { WorkoutLog } from '../types';

const ORA = new Date('2026-10-21T12:00:00Z');

function oreFa(ore: number): string {
  return new Date(ORA.getTime() - ore * 3_600_000).toISOString();
}

/** Seduta con N serie di un esercizio, senza altro. */
function seduta(exerciseId: string, serie: number, ore: number): WorkoutLog {
  return {
    id: `w_${exerciseId}_${ore}`,
    sessionId: 's',
    sessionName: 'Prova',
    data: oreFa(ore),
    durataSec: 1800,
    sensazione: 3,
    note: '',
    sets: Array.from({ length: serie }, (_, i) => ({
      exerciseId,
      serie: i + 1,
      repsFatte: 10,
      secondiFatti: 0,
      feedback: 'giusto' as const
    }))
  };
}

test('senza storico tutto e\' pronto e nulla risulta allenato di recente', () => {
  const r = calcolaRecupero([], ORA);
  assert.equal(recuperoComplessivo(r), 100);
  assert.equal(r.petto.stato, 'pronto');
  assert.equal(r.petto.allenatoDiRecente, false);
  assert.deepEqual(distrettiScarichi(r), []);
});

test('le ore di recupero crescono con la dose e restano nei limiti 24-72', () => {
  assert.equal(oreDiRecupero(0), 24);
  assert.equal(oreDiRecupero(4), 48);
  assert.equal(oreDiRecupero(8), 72);
  assert.equal(oreDiRecupero(50), 72);
});

test('subito dopo l\'allenamento il distretto primario e\' scarico', () => {
  const r = calcolaRecupero([seduta('pushup_completo', 4, 0.5)], ORA);
  assert.equal(r.petto.stato, 'da_recuperare');
  assert.ok(r.petto.percentuale < 5);
  assert.ok(r.petto.oreAlPronto >= 47);
});

test('il recupero avanza con il passare delle ore fino al 100%', () => {
  const dopo24 = calcolaRecupero([seduta('pushup_completo', 4, 24)], ORA);
  const dopo50 = calcolaRecupero([seduta('pushup_completo', 4, 50)], ORA);
  // 4 serie su un primario = 4 pesate = 48h: dopo 24h meta', dopo 50h completo
  assert.equal(dopo24.petto.percentuale, 50);
  assert.equal(dopo50.petto.percentuale, 100);
  assert.equal(dopo50.petto.stato, 'pronto');
  assert.equal(dopo50.petto.allenatoDiRecente, true);
});

test('i secondari si stancano meno dei primari', () => {
  const r = calcolaRecupero([seduta('pushup_completo', 4, 1)], ORA);
  // petto e' primario (4 serie), addome secondario (1.6 pesate)
  assert.ok(r.addome.percentuale > r.petto.percentuale);
});

test('vale la seduta che lascia il distretto piu\' scarico', () => {
  const r = calcolaRecupero(
    [seduta('pushup_completo', 3, 60), seduta('pushup_completo', 3, 2)],
    ORA
  );
  assert.ok(r.petto.percentuale < 20);
});

test('sedute oltre la finestra di sette giorni non contano', () => {
  const r = calcolaRecupero([seduta('pushup_completo', 6, 24 * 9)], ORA);
  assert.equal(r.petto.percentuale, 100);
  assert.equal(r.petto.allenatoDiRecente, false);
});

test('sedute con data futura o non valida vengono ignorate', () => {
  const futura = seduta('pushup_completo', 4, -5);
  const rotta = { ...seduta('pushup_completo', 4, 1), data: 'non-una-data' };
  const r = calcolaRecupero([futura, rotta], ORA);
  assert.equal(r.petto.percentuale, 100);
});

test('un esercizio sconosciuto non rompe il calcolo', () => {
  const r = calcolaRecupero([seduta('esercizio_che_non_esiste', 3, 1)], ORA);
  assert.equal(recuperoComplessivo(r), 100);
});

test('gli avvisi per una seduta elencano solo i primari ancora scarichi', () => {
  const r = calcolaRecupero([seduta('pushup_completo', 4, 1)], ORA);
  const avvisi = avvisiPerSeduta(r, ['petto', 'dorsali']);
  assert.deepEqual(avvisi.map((a) => a.distretto), ['petto']);
});
