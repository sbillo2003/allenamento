import test from 'node:test';
import assert from 'node:assert/strict';

import { filtraPerPeriodo, bloccoVolume } from './periodo';
import { WorkoutLog } from '../types';

// mercoledi' 21 ottobre 2026, mezzogiorno
const ORA = new Date(2026, 9, 21, 12, 0, 0);

function giorno(offset: number, ore = 10): string {
  const d = new Date(ORA);
  d.setDate(d.getDate() + offset);
  d.setHours(ore, 0, 0, 0);
  return d.toISOString();
}

function seduta(data: string, reps: number[]): WorkoutLog {
  return {
    id: `w_${data}`,
    sessionId: 's',
    sessionName: 'Prova',
    data,
    durataSec: 1800,
    sensazione: 3,
    note: '',
    sets: reps.map((r, i) => ({
      exerciseId: 'push_up',
      serie: i + 1,
      repsFatte: r,
      secondiFatti: 0,
      feedback: 'giusto'
    })) as WorkoutLog['sets']
  };
}

test('filtraPerPeriodo: 7g tiene solo l ultima settimana', () => {
  const dati = [{ data: giorno(-1) }, { data: giorno(-6) }, { data: giorno(-8) }, { data: giorno(-40) }];
  assert.equal(filtraPerPeriodo(dati, '7g', ORA).length, 2);
  assert.equal(filtraPerPeriodo(dati, '30g', ORA).length, 3);
  assert.equal(filtraPerPeriodo(dati, '90g', ORA).length, 4);
});

test('filtraPerPeriodo: tutti non filtra e ignora le date rotte', () => {
  const dati = [{ data: giorno(-400) }, { data: 'non-una-data' }];
  assert.equal(filtraPerPeriodo(dati, 'tutti', ORA).length, 2);
  assert.equal(filtraPerPeriodo(dati, '90g', ORA).length, 0);
});

test('bloccoVolume 7g: sette giorni, oggi per ultimo', () => {
  const blocchi = bloccoVolume([seduta(giorno(0, 9), [10, 12]), seduta(giorno(-2), [8])], '7g', ORA);
  assert.equal(blocchi.length, 7);
  assert.equal(blocchi[6].etichetta, 'Oggi');
  assert.deepEqual([blocchi[6].volume, blocchi[6].serie], [22, 2]);
  assert.deepEqual([blocchi[4].volume, blocchi[4].serie], [8, 1]);
  assert.equal(blocchi[5].volume, 0);
});

test('bloccoVolume: 30g = 5 settimane, 90g = 13', () => {
  assert.equal(bloccoVolume([], '30g', ORA).length, 5);
  assert.equal(bloccoVolume([], '90g', ORA).length, 13);
});

test('bloccoVolume tutti: parte dalla prima seduta, minimo 4 e massimo 52 settimane', () => {
  assert.equal(bloccoVolume([], 'tutti', ORA).length, 4);
  assert.equal(bloccoVolume([seduta(giorno(-30), [5])], 'tutti', ORA).length, 5);
  assert.equal(bloccoVolume([seduta(giorno(-1000), [5])], 'tutti', ORA).length, 52);
});

test('bloccoVolume settimanale: ogni serie cade in un solo blocco', () => {
  const dati = [seduta(giorno(-1), [10]), seduta(giorno(-9), [6, 6]), seduta(giorno(-20), [4])];
  const blocchi = bloccoVolume(dati, '30g', ORA);
  assert.equal(blocchi.reduce((s, b) => s + b.serie, 0), 4);
  assert.equal(blocchi.reduce((s, b) => s + b.volume, 0), 26);
});
