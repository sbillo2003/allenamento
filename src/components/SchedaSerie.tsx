/**
 * Scheda a sfumatura rosso-arancio per le serie del player: "Serie 2 di 4"
 * e un cerchio per serie (spuntato se fatta, toccabile per correggerla).
 *
 * La sfumatura ha colori fissi anche nel tema chiaro: serve il bianco pieno
 * su fondo saturo (contrasto oltre 4,5:1), cosa che var(--color-rest) non garantisce.
 */

import React from 'react';
import { IconCheck } from './Icons';

export const SFUMATURA_SPINTA = 'linear-gradient(135deg, #E5532B 0%, #B8321F 100%)';

interface Props {
  totale: number;
  /** Serie in corso, a partire da 1. */
  corrente: number;
  onModifica: (indice: number) => void;
}

export function SchedaSerie({ totale, corrente, onModifica }: Props) {
  return (
    <div
      className="flex items-center justify-between gap-3 rounded-2xl pl-4 pr-2 py-1.5 text-white"
      style={{ background: SFUMATURA_SPINTA }}
    >
      <div className="leading-tight">
        <div className="text-[10px] font-semibold uppercase tracking-wider opacity-90">Serie</div>
        <div className="text-lg font-bold tabular-nums">
          {corrente} <span className="text-sm font-medium opacity-90">di {totale}</span>
        </div>
      </div>

      <div className="flex items-center min-w-0">
        {Array.from({ length: totale }).map((_, idx) => {
          const fatta = idx + 1 < corrente;
          const inCorso = idx + 1 === corrente;

          if (fatta) {
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onModifica(idx)}
                title={`Modifica serie ${idx + 1}`}
                aria-label={`Modifica serie ${idx + 1}`}
                className="w-10 min-w-6 shrink h-11 flex items-center justify-center active:scale-95 transition-transform"
              >
                <span className="w-6 h-6 rounded-full bg-white text-[#B8321F] flex items-center justify-center">
                  <IconCheck size={14} />
                </span>
              </button>
            );
          }

          return (
            <span key={idx} className="w-10 min-w-6 shrink h-11 flex items-center justify-center" aria-hidden="true">
              <span
                className={`w-6 h-6 rounded-full ${
                  inCorso ? 'border-2 border-white' : 'bg-white/25'
                }`}
              />
            </span>
          );
        })}
      </div>
    </div>
  );
}
