/**
 * Test fisici: una domanda per schermata, con la sagoma dei muscoli
 * coinvolti e risposte a fasce invece del numero esatto.
 *
 * Le fasce riducono l'attrito (un tocco invece di digitare) e tolgono
 * l'ansia della precisione, che in un autotest e' finta comunque: nessuno
 * conta le ripetizioni al cedimento con esattezza. Chi il numero ce l'ha
 * puo' sempre inserirlo.
 */

import React, { useState } from 'react';
import { MuscleMap } from '../components/MuscleMap';
import { Distretto } from '../data/muscoli';
import { IconChevronRight, IconCheck } from '../components/Icons';

export interface RisultatiTest {
  pushUp: number;
  pushUpType: 'completi' | 'ginocchia';
  pullUp: number;
  deadHangSec: number;
  squat: number;
  plankSec: number;
  dipOrRow: number;
  hollowHoldSec: number | '';
  /** Test a cui l'utente ha risposto "Non lo so": il livello e' prudenziale. */
  stimati: string[];
}

interface Fascia {
  etichetta: string;
  valore: number;
}

interface DefinizioneTest {
  chiave: keyof RisultatiTest | 'dipOrRow';
  titolo: string;
  /** Parola evidenziata a colore dentro al titolo. */
  parolaChiave: string;
  sottotitolo: string;
  primari: Distretto[];
  secondari: Distretto[];
  fasce: Fascia[];
  unita: string;
  /** Valore usato se l'utente risponde "Non lo so": il piu' prudente. */
  seNonSo: number;
  opzionale?: boolean;
}

function definizioni(dipOrRowType: 'dip' | 'row'): DefinizioneTest[] {
  return [
    {
      chiave: 'pushUp',
      titolo: 'Quante flessioni riesci a fare?',
      parolaChiave: 'flessioni',
      sottotitolo: 'Quante di fila, senza fermarti, con il petto che sfiora terra.',
      primari: ['petto', 'tricipiti'],
      secondari: ['deltoidi', 'addome'],
      fasce: [
        { etichetta: 'Meno di 10', valore: 5 },
        { etichetta: '10-20', valore: 15 },
        { etichetta: '21-34', valore: 27 },
        { etichetta: 'Più di 35', valore: 40 }
      ],
      unita: 'ripetizioni',
      seNonSo: 5
    },
    {
      chiave: 'pullUp',
      titolo: 'Quante trazioni riesci a fare?',
      parolaChiave: 'trazioni',
      sottotitolo: 'Da braccia distese a mento sopra la sbarra, senza slanci.',
      primari: ['dorsali', 'bicipiti'],
      secondari: ['avambracci', 'trapezi'],
      fasce: [
        { etichetta: 'Nessuna', valore: 0 },
        { etichetta: '1-2', valore: 2 },
        { etichetta: '3-7', valore: 5 },
        { etichetta: 'Più di 8', valore: 10 }
      ],
      unita: 'trazioni',
      seNonSo: 0
    },
    {
      chiave: 'squat',
      titolo: 'Quanti squat riesci a fare?',
      parolaChiave: 'squat',
      sottotitolo: 'A corpo libero, scendendo sotto il parallelo, senza pause.',
      primari: ['quadricipiti', 'glutei'],
      secondari: ['femorali', 'polpacci'],
      fasce: [
        { etichetta: 'Meno di 20', valore: 12 },
        { etichetta: '20-39', valore: 30 },
        { etichetta: '40-59', valore: 50 },
        { etichetta: 'Più di 60', valore: 70 }
      ],
      unita: 'ripetizioni',
      seNonSo: 12
    },
    {
      chiave: 'plankSec',
      titolo: 'Quanto reggi il plank?',
      parolaChiave: 'plank',
      sottotitolo: 'Sugli avambracci, bacino in linea, fino a quando la forma cede.',
      primari: ['addome'],
      secondari: ['obliqui', 'deltoidi'],
      fasce: [
        { etichetta: 'Meno di 45s', valore: 30 },
        { etichetta: '45-90s', valore: 65 },
        { etichetta: '90s-3 min', valore: 130 },
        { etichetta: 'Più di 3 min', valore: 200 }
      ],
      unita: 'secondi',
      seNonSo: 30
    },
    dipOrRowType === 'dip'
      ? {
          chiave: 'dipOrRow',
          titolo: 'Quanti dip riesci a fare?',
          parolaChiave: 'dip',
          sottotitolo: 'Alle parallele o fra due sedie, scendendo a 90 gradi.',
          primari: ['petto', 'tricipiti'],
          secondari: ['deltoidi'],
          fasce: [
            { etichetta: 'Nessuno', valore: 0 },
            { etichetta: '1-4', valore: 3 },
            { etichetta: '5-10', valore: 8 },
            { etichetta: 'Più di 11', valore: 14 }
          ],
          unita: 'dip',
          seNonSo: 0
        }
      : {
          chiave: 'dipOrRow',
          titolo: 'Quanti row orizzontali riesci a fare?',
          parolaChiave: 'row orizzontali',
          sottotitolo: 'Sotto una sbarra bassa o un tavolo, petto che tocca.',
          primari: ['dorsali', 'bicipiti'],
          secondari: ['trapezi', 'deltoidi'],
          fasce: [
            { etichetta: 'Meno di 8', valore: 5 },
            { etichetta: '8-15', valore: 12 },
            { etichetta: '16-25', valore: 20 },
            { etichetta: 'Più di 26', valore: 30 }
          ],
          unita: 'ripetizioni',
          seNonSo: 5
        }
  ];
}

interface Props {
  dipOrRowType: 'dip' | 'row';
  onCompleta: (r: RisultatiTest) => void;
  onIndietro: () => void;
}

export function TestFisiciStep({ dipOrRowType, onCompleta, onIndietro }: Props) {
  const test = definizioni(dipOrRowType);

  const [indice, setIndice] = useState(0);
  const [valori, setValori] = useState<Record<string, number>>({});
  const [stimati, setStimati] = useState<string[]>([]);
  const [pushUpType, setPushUpType] = useState<'completi' | 'ginocchia'>('completi');
  const [deadHangSec, setDeadHangSec] = useState<number>(30);
  const [numeroEsatto, setNumeroEsatto] = useState<string>('');
  const [mostraEsatto, setMostraEsatto] = useState(false);

  const corrente = test[indice];
  const chiave = corrente.chiave as string;
  const scelto = valori[chiave];
  const haScelto = scelto !== undefined;

  // Con 0 trazioni serve la tenuta in sospensione per distinguere chi e'
  // lontanissimo dalla prima trazione da chi ci e' quasi.
  const chiediDeadHang = chiave === 'pullUp' && scelto === 0;

  const scegli = (valore: number, nonSo = false) => {
    setValori((v) => ({ ...v, [chiave]: valore }));
    setStimati((s) =>
      nonSo
        ? [...new Set([...s, corrente.parolaChiave])]
        : s.filter((x) => x !== corrente.parolaChiave)
    );
    setMostraEsatto(false);
    setNumeroEsatto('');
  };

  const avanti = () => {
    if (indice < test.length - 1) {
      setIndice(indice + 1);
      setMostraEsatto(false);
      setNumeroEsatto('');
      return;
    }
    onCompleta({
      pushUp: valori.pushUp ?? 0,
      pushUpType,
      pullUp: valori.pullUp ?? 0,
      deadHangSec,
      squat: valori.squat ?? 0,
      plankSec: valori.plankSec ?? 0,
      dipOrRow: valori.dipOrRow ?? 0,
      hollowHoldSec: '',
      stimati
    });
  };

  const indietro = () => {
    if (indice === 0) return onIndietro();
    setIndice(indice - 1);
  };

  const avanzamento = (indice + (haScelto ? 1 : 0)) / test.length;

  return (
    <div className="flex flex-col min-h-[calc(100vh-2rem)]">
      {/* intestazione: indietro e anello di avanzamento */}
      <div className="flex items-center justify-between pt-1 pb-5">
        <button
          type="button"
          onClick={indietro}
          aria-label="Torna indietro"
          className="w-10 h-10 rounded-full bg-elevated border border-subtle flex items-center justify-center text-txt"
        >
          <span className="rotate-180">
            <IconChevronRight size={18} />
          </span>
        </button>

        <span className="text-[11px] font-semibold text-muted-txt tabular-nums">
          Test {indice + 1} di {test.length}
        </span>

        <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true">
          <circle cx="18" cy="18" r="15" fill="none" stroke="var(--color-border)" strokeWidth="3" />
          <circle
            cx="18"
            cy="18"
            r="15"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 15}
            strokeDashoffset={2 * Math.PI * 15 * (1 - avanzamento)}
            transform="rotate(-90 18 18)"
            style={{ transition: 'stroke-dashoffset 300ms ease-out' }}
          />
        </svg>
      </div>

      {/* domanda */}
      <h1 className="text-[26px] leading-tight font-bold tracking-tight text-txt">
        {corrente.titolo.split(corrente.parolaChiave).map((pezzo, i, arr) => (
          <React.Fragment key={i}>
            {pezzo}
            {i < arr.length - 1 && <span className="text-accent">{corrente.parolaChiave}</span>}
          </React.Fragment>
        ))}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-txt">{corrente.sottotitolo}</p>

      {/* sagoma con i muscoli coinvolti */}
      <div className="my-5 py-4 rounded-[20px] bg-surface border border-subtle flex flex-col items-center">
        <MuscleMap
          primari={corrente.primari}
          secondari={corrente.secondari}
          vista="entrambe"
          altezza={168}
        />
        <div className="mt-3 flex items-center gap-4 text-[10px] text-muted-txt">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-accent" /> Principali
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm"
              style={{ background: 'color-mix(in srgb, var(--color-accent) 38%, transparent)' }}
            />
            Secondari
          </span>
        </div>
      </div>

      {/* variante delle flessioni */}
      {chiave === 'pushUp' && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {(['completi', 'ginocchia'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setPushUpType(t)}
              className={`min-h-[40px] rounded-xl text-xs font-semibold border transition-all ${
                pushUpType === t
                  ? 'bg-elevated border-accent text-accent'
                  : 'bg-surface border-subtle text-muted-txt'
              }`}
            >
              {t === 'completi' ? 'Sulle punte' : 'Sulle ginocchia'}
            </button>
          ))}
        </div>
      )}

      {/* risposte a fasce */}
      <div className="grid grid-cols-2 gap-2.5">
        {corrente.fasce.map((f) => {
          const attiva = haScelto && scelto === f.valore && !stimati.includes(corrente.parolaChiave);
          return (
            <button
              key={f.etichetta}
              type="button"
              onClick={() => scegli(f.valore)}
              className={`min-h-[64px] rounded-2xl border px-3 text-sm font-bold transition-all active:scale-[0.98] ${
                attiva
                  ? 'bg-accent text-accent-contrast border-accent'
                  : 'bg-surface text-txt border-subtle hover:border-muted-txt'
              }`}
            >
              {f.etichetta}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => scegli(corrente.seNonSo, true)}
        className={`mt-2.5 w-full min-h-[48px] rounded-2xl border text-sm font-semibold transition-all ${
          stimati.includes(corrente.parolaChiave)
            ? 'bg-elevated border-accent text-accent'
            : 'bg-surface border-subtle text-muted-txt'
        }`}
      >
        Non lo so
      </button>

      {/* inserimento del numero esatto, per chi ce l'ha */}
      {!mostraEsatto ? (
        <button
          type="button"
          onClick={() => setMostraEsatto(true)}
          className="mt-3 text-[11px] text-muted-txt underline underline-offset-2 self-center"
        >
          Conosco il numero esatto
        </button>
      ) : (
        <div className="mt-3 flex gap-2">
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={numeroEsatto}
            onChange={(e) => setNumeroEsatto(e.target.value)}
            placeholder={`Numero di ${corrente.unita}`}
            className="flex-1 h-11 px-3 rounded-xl bg-elevated border border-subtle text-txt tabular-nums text-sm"
          />
          <button
            type="button"
            onClick={() => numeroEsatto !== '' && scegli(Number(numeroEsatto))}
            disabled={numeroEsatto === ''}
            className="px-4 rounded-xl bg-elevated border border-accent text-accent font-semibold text-sm disabled:opacity-40"
          >
            <IconCheck size={16} />
          </button>
        </div>
      )}

      {/* tenuta in sospensione, solo con 0 trazioni */}
      {chiediDeadHang && (
        <div className="mt-4 p-3.5 rounded-2xl bg-surface border border-rest/40 space-y-2">
          <span className="text-xs font-semibold text-rest">
            Zero trazioni: quanto resti appeso alla sbarra?
          </span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { e: 'Meno di 20s', v: 10 },
              { e: '20-45s', v: 32 },
              { e: 'Più di 45s', v: 60 }
            ].map((o) => (
              <button
                key={o.e}
                type="button"
                onClick={() => setDeadHangSec(o.v)}
                className={`min-h-[44px] rounded-xl border text-xs font-semibold ${
                  deadHangSec === o.v
                    ? 'bg-accent text-accent-contrast border-accent'
                    : 'bg-elevated border-subtle text-txt'
                }`}
              >
                {o.e}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1" />

      <button
        onClick={avanti}
        disabled={!haScelto}
        className="mt-6 mb-2 w-full min-h-[52px] rounded-2xl bg-accent text-accent-contrast font-bold text-base flex items-center justify-center gap-2 disabled:opacity-30 active:scale-[0.98] transition-all"
      >
        <span>{indice < test.length - 1 ? 'Continua' : 'Elabora i risultati'}</span>
        <IconChevronRight size={18} />
      </button>
    </div>
  );
}
