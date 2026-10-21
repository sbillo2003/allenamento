/**
 * Hero della home: il numero della settimana al centro di un anello, con un
 * alone caldo dietro. E' l'unico elemento "morbido" dell'interfaccia, di
 * proposito: tutto il resto e' denso e leggibile, qui si guarda un solo numero.
 */

import React from 'react';
import { IconCheck } from '../Icons';

export interface GiornoSettimana {
  etichetta: string;
  oggi: boolean;
  completato: boolean;
  previsto: boolean;
}

interface Props {
  fatte: number;
  obiettivo: number;
  giorni: GiornoSettimana[];
}

const RAGGIO = 78;
const CIRCONFERENZA = 2 * Math.PI * RAGGIO;

export function HeroSettimana({ fatte, obiettivo, giorni }: Props) {
  const frazione = obiettivo > 0 ? Math.min(1, fatte / obiettivo) : 0;
  const raggiunto = obiettivo > 0 && fatte >= obiettivo;

  return (
    <section
      className="relative overflow-hidden rounded-[28px] bg-surface border border-subtle px-4 pt-4 pb-3.5"
      aria-label="Progresso della settimana"
    >
      <div className="text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-txt">
        Questa settimana
      </div>

      <div className="relative mx-auto mt-2 flex items-center justify-center" style={{ width: 168, height: 168 }}>
        {/* alone: caldo al centro, si dissolve nel colore della scheda */}
        <div
          aria-hidden="true"
          className="absolute rounded-full"
          style={{
            width: 244,
            height: 244,
            background:
              'radial-gradient(circle, color-mix(in srgb, var(--color-rest) 62%, transparent) 0%, ' +
              'color-mix(in srgb, var(--color-rest) 22%, transparent) 34%, ' +
              'color-mix(in srgb, var(--color-accent) 10%, transparent) 54%, transparent 72%)',
            filter: 'blur(4px)'
          }}
        />

        <svg width="168" height="168" viewBox="0 0 196 196" className="relative" aria-hidden="true">
          <defs>
            <linearGradient id="anelloHero" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--color-rest)" />
              <stop offset="100%" stopColor="var(--color-accent)" />
            </linearGradient>
          </defs>
          <circle cx="98" cy="98" r={RAGGIO} fill="none" stroke="var(--color-border)" strokeWidth="10" opacity="0.7" />
          <circle
            cx="98"
            cy="98"
            r={RAGGIO}
            fill="none"
            stroke="url(#anelloHero)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCONFERENZA}
            strokeDashoffset={CIRCONFERENZA * (1 - frazione)}
            transform="rotate(-90 98 98)"
            style={{ transition: 'stroke-dashoffset 500ms ease-out' }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[56px] leading-none font-bold tracking-tighter text-txt tabular-nums">
            {fatte}
          </span>
          <span className="mt-1 text-xs font-semibold text-txt tabular-nums">
            {raggiunto ? 'obiettivo raggiunto' : `di ${obiettivo} sessioni`}
          </span>
        </div>
      </div>

      {/* i sette giorni */}
      <div className="mt-3 grid grid-cols-7 gap-1.5">
        {giorni.map((g) => (
          <div key={g.etichetta} className="flex flex-col items-center gap-1.5">
            <span
              className={`text-[10px] font-medium ${g.oggi ? 'text-txt' : 'text-muted-txt'}`}
            >
              {g.etichetta}
            </span>
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={
                g.completato
                  ? { background: 'var(--color-accent)', color: 'var(--color-accent-text)' }
                  : g.oggi
                    ? { border: '2px solid var(--color-accent)' }
                    : g.previsto
                      ? { border: '1.5px solid var(--color-muted)', opacity: 0.55 }
                      : { background: 'var(--color-border)', opacity: 0.5, transform: 'scale(0.4)' }
              }
            >
              {g.completato && <IconCheck size={13} />}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
