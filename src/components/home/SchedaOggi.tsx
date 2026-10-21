/**
 * Scheda dell'allenamento di oggi (o del giorno di riposo).
 *
 * L'ordine e' pensato per chi la apre con una mano e poca pazienza:
 * cosa fai, quanto dura, quali muscoli lavori, e subito il pulsante.
 * L'elenco degli esercizi viene dopo, per chi vuole controllare.
 */

import React from 'react';
import { PlannedSession, WorkoutLog } from '../../types';
import { EXERCISES } from '../../data/exercises';
import { distrettiDi, distrettiDiPiuEsercizi, NOMI_DISTRETTI } from '../../data/muscoli';
import { scarichiDellaSeduta } from '../../logic/recupero';
import { WARMUP_ROUTINE, calculateRealSessionDurationMinutes } from '../../logic/generator';
import { MuscleMap } from '../MuscleMap';
import { IconPlay, IconChevronRight } from '../Icons';

interface Props {
  oggi: PlannedSession | undefined;
  primaNonFatta: PlannedSession | undefined;
  workouts: WorkoutLog[];
  faseBreve: string;
  onInizia: (s: PlannedSession) => void;
}

function esercizi(sessione: PlannedSession) {
  return sessione.blocks
    .map((b) => ({ blocco: b, ex: EXERCISES.find((e) => e.id === b.exerciseId) }))
    .filter((x): x is { blocco: typeof x.blocco; ex: NonNullable<typeof x.ex> } => !!x.ex);
}

export function SchedaOggi({ oggi, primaNonFatta, workouts, faseBreve, onInizia }: Props) {
  if (!oggi) {
    return (
      <div className="p-5 rounded-[24px] bg-surface border border-subtle space-y-4">
        <div className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-rest">
            Giorno di riposo
          </span>
          <h2 className="text-xl font-bold text-txt">Recupero e mobilità</h2>
          <p className="text-xs text-muted-txt leading-relaxed">
            La forza si costruisce mentre riposi. Dieci minuti di mobilità aiutano più di una seduta in più.
          </p>
        </div>

        <ul className="p-3.5 rounded-xl bg-elevated space-y-1.5 text-xs text-muted-txt">
          {WARMUP_ROUTINE.slice(0, 3).map((w) => (
            <li key={w.nome} className="flex justify-between">
              <span className="text-txt font-medium">{w.nome}</span>
              <span className="tabular-nums">{w.durataSec}s</span>
            </li>
          ))}
        </ul>

        {primaNonFatta && (
          <button
            onClick={() => onInizia(primaNonFatta)}
            className="w-full min-h-[48px] rounded-2xl bg-elevated border border-accent text-accent font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            <span>Allenati lo stesso: {primaNonFatta.nome}</span>
            <IconChevronRight size={16} />
          </button>
        )}
      </div>
    );
  }

  const righe = esercizi(oggi);
  const distretti = distrettiDiPiuEsercizi(righe.map((r) => r.ex));
  const scarichi = scarichiDellaSeduta(oggi, workouts);
  const minuti = calculateRealSessionDurationMinutes(oggi);

  const metadati = [`~${minuti} min`, `${righe.length} esercizi`, faseBreve];

  const elencoScarichi =
    scarichi
      .slice(0, 3)
      .map((x) => `${NOMI_DISTRETTI[x.distretto].toLowerCase()} (${x.percentuale}%)`)
      .join(', ') + (scarichi.length > 3 ? ` e altri ${scarichi.length - 3}` : '');

  return (
    <div className="p-5 rounded-[24px] bg-surface border border-subtle space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">
            Allenamento di oggi
          </span>
          <h2 className="mt-0.5 text-xl font-bold leading-tight text-txt">{oggi.nome}</h2>
          <p className="mt-1.5 text-[11px] leading-relaxed text-muted-txt">
            {metadati.join(' · ')}
          </p>
        </div>
        <MuscleMap primari={distretti.primari} secondari={distretti.secondari} vista="entrambe" altezza={92} />
      </div>

      <button
        onClick={() => onInizia(oggi)}
        className="w-full min-h-[54px] rounded-2xl bg-accent text-accent-contrast font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
      >
        <IconPlay size={18} />
        <span>Inizia allenamento</span>
      </button>

      {scarichi.length > 0 && (
        <div
          className="p-3 rounded-xl text-xs leading-relaxed"
          style={{
            background: 'color-mix(in srgb, var(--color-error) 10%, transparent)',
            border: '1px solid color-mix(in srgb, var(--color-error) 40%, transparent)'
          }}
        >
          <span className="font-semibold text-error">Muscoli ancora scarichi: </span>
          <span className="text-muted-txt">
            {elencoScarichi}. Puoi allenarti lo stesso, ma se hai margine conviene aspettare.
          </span>
        </div>
      )}

      <ul className="border-t border-subtle pt-1">
        {righe.map(({ blocco, ex }, idx) => (
          <li
            key={idx}
            className="flex items-center gap-3 py-2 border-b border-subtle last:border-b-0"
          >
            <span className="shrink-0 w-9 flex justify-center">
              <MuscleMap primari={distrettiDi(ex).primari} altezza={46} />
            </span>
            <span className="min-w-0 flex-1 truncate text-xs font-medium text-txt">{ex.nome}</span>
            <span className="shrink-0 text-[11px] font-medium text-muted-txt tabular-nums">
              {blocco.serie} × {ex.tipo === 'tempo' ? `${blocco.secondi}s` : `${blocco.repMin}-${blocco.repMax}`}
              {ex.unilaterale && ' · lato'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
