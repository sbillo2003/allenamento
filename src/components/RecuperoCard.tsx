/**
 * Recupero muscolare: riquadro per la home e pannello con il corpo
 * fronte e retro colorato per stato.
 */

import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { WorkoutLog } from '../types';
import { MuscleMap } from './MuscleMap';
import { Distretto, NOMI_DISTRETTI } from '../data/muscoli';
import {
  StatoRecupero,
  RecuperoDistretto,
  calcolaRecupero,
  recuperoComplessivo,
  distrettiScarichi
} from '../logic/recupero';
import { IconClose } from './Icons';

export const COLORE_STATO: Record<StatoRecupero, string> = {
  pronto: '#2FD36B',
  in_recupero: '#F5B72E',
  da_recuperare: '#FF5A5F'
};

const ETICHETTA_STATO: Record<StatoRecupero, string> = {
  pronto: 'Pronto',
  in_recupero: 'In recupero',
  da_recuperare: 'Da recuperare'
};

/** Esito in due o tre parole, per le intestazioni. */
function esitoBreve(complessivo: number, scarichi: RecuperoDistretto[]): string {
  if (scarichi.length === 0) return 'Pronto per allenarti';
  return complessivo >= 90 ? 'Quasi pronto' : 'Ancora scarichi';
}

/** Frase che riassume lo stato: e' il verdetto, il resto e' dettaglio. */
function verdetto(complessivo: number, scarichi: RecuperoDistretto[]): string {
  if (scarichi.length === 0) return 'Pronto per allenarti';
  const peggiori = scarichi
    .slice(0, 2)
    .map((s) => NOMI_DISTRETTI[s.distretto].toLowerCase())
    .join(' e ');
  if (complessivo >= 90) return `Quasi pronto, ${peggiori} in recupero`;
  return `Scarichi: ${peggiori}`;
}

/** Colore per distretto, solo per quelli allenati di recente: gli altri restano neutri. */
function coloriDa(r: Record<Distretto, RecuperoDistretto>): Partial<Record<Distretto, string>> {
  const colori: Partial<Record<Distretto, string>> = {};
  for (const x of Object.values(r)) {
    if (x.allenatoDiRecente) colori[x.distretto] = COLORE_STATO[x.stato];
  }
  return colori;
}

function Arco({ valore, colore }: { valore: number; colore: string }) {
  const raggio = 40;
  const lunghezza = Math.PI * raggio;
  return (
    <svg width="104" height="62" viewBox="0 0 104 62" aria-hidden="true">
      <path
        d="M 12 54 A 40 40 0 0 1 92 54"
        fill="none"
        stroke="var(--color-border)"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path
        d="M 12 54 A 40 40 0 0 1 92 54"
        fill="none"
        stroke={colore}
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={lunghezza}
        strokeDashoffset={lunghezza * (1 - valore / 100)}
        style={{ transition: 'stroke-dashoffset 400ms ease-out' }}
      />
    </svg>
  );
}

export function RecuperoCard({ workouts }: { workouts: WorkoutLog[] }) {
  const [aperto, setAperto] = useState(false);

  const recupero = useMemo(() => calcolaRecupero(workouts), [workouts]);
  const complessivo = recuperoComplessivo(recupero);
  const scarichi = distrettiScarichi(recupero);
  const colori = coloriDa(recupero);
  const statoGenerale: StatoRecupero =
    complessivo >= 90 ? 'pronto' : complessivo >= 60 ? 'in_recupero' : 'da_recuperare';
  const coloreGenerale = COLORE_STATO[statoGenerale];

  return (
    <>
      <button
        type="button"
        onClick={() => setAperto(true)}
        className="w-full text-left p-4 rounded-[20px] bg-surface border border-subtle flex items-center gap-4 active:scale-[0.99] transition-transform"
        aria-label="Apri il dettaglio del recupero muscolare"
      >
        <div className="relative shrink-0" style={{ width: 104, height: 62 }}>
          <Arco valore={complessivo} colore={coloreGenerale} />
          <span className="absolute inset-x-0 bottom-0 text-center text-xl font-bold tabular-nums text-txt">
            {complessivo}%
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-txt">
            Recupero
          </div>
          <div className="text-sm font-semibold text-txt leading-snug mt-0.5">
            {verdetto(complessivo, scarichi)}
          </div>
        </div>

        <MuscleMap colori={colori} vista="entrambe" altezza={64} />
      </button>

      {/* Portale sul body: dentro <main> la barra di navigazione finiva sopra il pannello */}
      {aperto &&
        createPortal(
          <PannelloRecupero recupero={recupero} onChiudi={() => setAperto(false)} />,
          document.body
        )}
    </>
  );
}

function PannelloRecupero({
  recupero,
  onChiudi
}: {
  recupero: Record<Distretto, RecuperoDistretto>;
  onChiudi: () => void;
}) {
  const complessivo = recuperoComplessivo(recupero);
  const scarichi = distrettiScarichi(recupero);
  const colori = coloriDa(recupero);
  const nessunDato = !Object.values(recupero).some((x) => x.allenatoDiRecente);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
      onClick={onChiudi}
      role="dialog"
      aria-modal="true"
      aria-label="Recupero muscolare"
    >
      <div
        className="w-full max-w-[480px] max-h-[90vh] overflow-y-auto rounded-t-[28px] bg-surface border-t border-subtle px-5 pt-3 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full" style={{ background: 'var(--color-border)' }} />

        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-txt">
              Stato del recupero
            </div>
            <div className="text-lg font-bold text-txt mt-0.5">
              {complessivo}% complessivo · {esitoBreve(complessivo, scarichi)}
            </div>
          </div>
          <button
            type="button"
            onClick={onChiudi}
            aria-label="Chiudi"
            className="w-10 h-10 rounded-full bg-elevated flex items-center justify-center text-txt"
          >
            <IconClose size={16} />
          </button>
        </div>

        <div className="mt-5 flex justify-center">
          <MuscleMap colori={colori} vista="entrambe" altezza={230} />
        </div>

        <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-muted-txt">
          {(Object.keys(COLORE_STATO) as StatoRecupero[]).map((s) => (
            <span key={s} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORE_STATO[s] }} />
              {ETICHETTA_STATO[s]}
            </span>
          ))}
        </div>

        {nessunDato ? (
          <p className="mt-6 text-center text-sm text-muted-txt leading-relaxed">
            Completa un allenamento per vedere qui come recuperano i tuoi muscoli.
          </p>
        ) : (
          <ul className="mt-6 space-y-2">
            {Object.values(recupero)
              .filter((x) => x.allenatoDiRecente)
              .sort((a, b) => a.percentuale - b.percentuale)
              .map((x) => (
                <li key={x.distretto} className="p-3 rounded-xl bg-elevated">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-txt">{NOMI_DISTRETTI[x.distretto]}</span>
                    <span className="tabular-nums text-muted-txt">
                      {x.percentuale}%
                      {x.oreAlPronto > 0 && ` · pronto fra ${x.oreAlPronto} h`}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${x.percentuale}%`, background: COLORE_STATO[x.stato] }}
                    />
                  </div>
                </li>
              ))}
          </ul>
        )}

        <p className="mt-6 text-[11px] leading-relaxed text-muted-txt">
          Stima dal tuo storico: più serie fai su un distretto, più ore servono (da 24 a 72).
          Non è una misura, serve a scegliere come distribuire gli allenamenti.
        </p>
      </div>
    </div>
  );
}
