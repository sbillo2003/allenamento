import test from 'node:test';
import assert from 'node:assert/strict';

import { messaggioCoach, ContestoCoach } from './coach';
import { volumeSettimana, sessioniDellaSettimana, fasePiano, lunedi } from './settimana';
import { WorkoutLog } from '../types';

// mercoledi' 21 ottobre 2026, mezzogiorno
const ORA = new Date(2026, 9, 21, 12, 0, 0);

function giorno(offset: number, ore = 10): string {
  const d = new Date(ORA);
  d.setDate(d.getDate() + offset);
  d.setHours(ore, 0, 0, 0);
  return d.toISOString();
}

function seduta(data: string, serie: number): WorkoutLog {
  return {
    id: `w_${data}`,
    sessionId: 's',
    sessionName: 'Prova',
    data,
    durataSec: 1800,
    sensazione: 3,
    note: '',
    sets: Array.from({ length: serie }, (_, i) => ({
      exerciseId: 'pushup_completo',
      serie: i + 1,
      repsFatte: 10,
      secondiFatti: 0,
      feedback: 'giusto' as const
    }))
  };
}

const BASE: ContestoCoach = {
  nome: 'Billy',
  sessioneInSospeso: false,
  nessunAllenamentoFatto: false,
  settimanaCiclo: 2,
  sessioniFatte: 1,
  sessioniObiettivo: 3,
  sessioneOggi: 'Upper Body A',
  oggiGiaAllenato: false,
  distrettiScarichi: [],
  minutiStimati: 42
};

test('lunedi\' di una data a meta\' settimana e di domenica', () => {
  assert.equal(lunedi(ORA).getDate(), 19);
  assert.equal(lunedi(new Date(2026, 9, 25, 23, 0)).getDate(), 19); // domenica
  assert.equal(lunedi(new Date(2026, 9, 19, 0, 1)).getDate(), 19); // lunedi'
});

test('volume: confronta con lo stesso punto della settimana scorsa, non con tutta', () => {
  const w = [
    seduta(giorno(-2), 10), // lunedi' di questa settimana
    seduta(giorno(-9), 10), // lunedi' scorso, stesso punto
    seduta(giorno(-5), 30) // venerdi' scorso: dopo il punto di confronto
  ];
  const v = volumeSettimana(w, ORA);
  assert.equal(v.serie, 10);
  assert.equal(v.variazione, 0);
});

test('volume: senza settimana scorsa non c\'e\' variazione', () => {
  const v = volumeSettimana([seduta(giorno(-1), 8)], ORA);
  assert.equal(v.serie, 8);
  assert.equal(v.variazione, null);
});

test('volume: ignora date non valide', () => {
  const v = volumeSettimana([{ ...seduta(giorno(-1), 5), data: 'rotta' }], ORA);
  assert.equal(v.serie, 0);
});

test('sessioni della settimana: una al giorno, non quelle di ieri l\'altro mese', () => {
  const w = [seduta(giorno(-2, 9), 4), seduta(giorno(-2, 18), 4), seduta(giorno(-1), 4), seduta(giorno(-20), 4)];
  assert.equal(sessioniDellaSettimana(w, ORA), 2);
});

test('fase del piano per settimana del ciclo', () => {
  assert.equal(fasePiano(1).breve, 'Base');
  assert.equal(fasePiano(3).breve, 'Carico');
  assert.equal(fasePiano(4).breve, 'Carico');
  assert.equal(fasePiano(5).breve, 'Scarico');
});

test('coach: la sessione in sospeso ha la precedenza su tutto', () => {
  const m = messaggioCoach({ ...BASE, sessioneInSospeso: true, settimanaCiclo: 5 });
  assert.match(m, /a metà/);
});

test('coach: al primo avvio saluta e nomina la sessione', () => {
  const m = messaggioCoach({ ...BASE, nessunAllenamentoFatto: true });
  assert.match(m, /Benvenuto, Billy/);
  assert.match(m, /Upper Body A/);
});

test('coach: lo scarico viene prima di obiettivo raggiunto', () => {
  assert.match(messaggioCoach({ ...BASE, settimanaCiclo: 5, sessioniFatte: 3 }), /scarico/);
});

test('coach: obiettivo raggiunto e seduta gia\' fatta', () => {
  assert.match(messaggioCoach({ ...BASE, sessioniFatte: 3 }), /Obiettivo della settimana/);
  assert.match(messaggioCoach({ ...BASE, oggiGiaAllenato: true }), /fatta/);
});

test('coach: giorno di riposo conta le sessioni mancanti con il singolare giusto', () => {
  assert.match(messaggioCoach({ ...BASE, sessioneOggi: null, sessioniFatte: 2 }), /manca 1 sessione/);
  assert.match(messaggioCoach({ ...BASE, sessioneOggi: null, sessioniFatte: 0 }), /mancano 3 sessioni/);
});

test('coach: avvisa dei muscoli scarichi con la concordanza giusta', () => {
  assert.match(messaggioCoach({ ...BASE, distrettiScarichi: ['Petto'] }), /petto è ancora scarico/);
  assert.match(
    messaggioCoach({ ...BASE, distrettiScarichi: ['Petto', 'Tricipiti', 'Spalle'] }),
    /petto e tricipiti sono ancora scarichi/
  );
});

test('coach: caso normale propone la sessione e la durata', () => {
  assert.match(messaggioCoach(BASE), /Upper Body A, circa 42 minuti/);
});
