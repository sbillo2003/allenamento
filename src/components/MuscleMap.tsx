/**
 * Sagoma umana con i distretti muscolari indirizzabili singolarmente.
 *
 * Arte nostra, disegnata per essere leggibile anche a 28 px: forme piene,
 * nessun contorno sottile, nessun dettaglio anatomico sotto la soglia di
 * visibilita'. I tracciati sono dati, non markup, cosi' il rendering e'
 * un ciclo e aggiungere una vista non richiede toccare il componente.
 */

import React from 'react';
import { Distretto, VISTA_DISTRETTO } from '../data/muscoli';

type Vista = 'fronte' | 'retro';

/**
 * Specchia un tracciato rispetto all'asse verticale della sagoma (x = 60).
 * Vale solo per tracciati di soli comandi M/L/Z: gli archi hanno parametri
 * che non sono coordinate e verrebbero corrotti, percio' testa e mani sono
 * elementi a parte e non passano di qui.
 */
function specchia(d: string): string {
  return d.replace(/(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g, (_, x, y) => {
    return `${(120 - parseFloat(x)).toFixed(1)} ${y}`;
  });
}

/** Tracciati per distretto. Dove il distretto e' pari, si disegna anche lo specchio. */
const TRACCIATI: Record<Vista, Partial<Record<Distretto, { d: string; pari?: boolean }[]>>> = {
  fronte: {
    deltoidi: [{ d: 'M 46 48 L 38 52 L 33 64 L 38 72 L 46 64 Z', pari: true }],
    petto: [{ d: 'M 47 50 L 59 53 L 59 76 L 46 70 L 44 58 Z', pari: true }],
    bicipiti: [{ d: 'M 37 70 L 31 74 L 29 94 L 36 96 L 40 80 Z', pari: true }],
    avambracci: [{ d: 'M 35 98 L 29 97 L 25 120 L 31 123 Z', pari: true }],
    addome: [{ d: 'M 49 78 L 71 78 L 71 112 L 60 119 L 49 112 Z' }],
    obliqui: [{ d: 'M 46 73 L 50 80 L 49 118 L 43 107 Z', pari: true }],
    quadricipiti: [{ d: 'M 45 147 L 58 147 L 57 194 L 47 196 L 43 170 Z', pari: true }],
    polpacci: [{ d: 'M 49 205 L 56 205 L 55 232 L 50 232 Z', pari: true }]
  },
  retro: {
    trapezi: [{ d: 'M 46 46 L 60 41 L 74 46 L 70 70 L 60 64 L 50 70 Z' }],
    deltoidi: [{ d: 'M 46 48 L 38 52 L 33 64 L 38 72 L 46 64 Z', pari: true }],
    dorsali: [{ d: 'M 47 64 L 59 70 L 59 101 L 49 93 L 44 78 Z', pari: true }],
    tricipiti: [{ d: 'M 37 70 L 31 74 L 29 94 L 36 96 L 40 80 Z', pari: true }],
    avambracci: [{ d: 'M 35 98 L 29 97 L 25 120 L 31 123 Z', pari: true }],
    lombari: [{ d: 'M 50 102 L 70 102 L 71 121 L 49 121 Z' }],
    glutei: [{ d: 'M 47 124 L 59 124 L 59 150 L 47 147 L 43 134 Z', pari: true }],
    femorali: [{ d: 'M 46 152 L 58 152 L 57 194 L 47 196 L 43 172 Z', pari: true }],
    polpacci: [{ d: 'M 47 203 L 57 203 L 56 232 L 49 232 L 45 218 Z', pari: true }]
  }
};

/**
 * Corpo di base, uguale per le due viste: si disegna per primo e i distretti
 * ci vanno sopra. Senza, gli arti sembrano staccati dal tronco e il busto
 * appare vuoto quando nessun muscolo e' acceso.
 */
const SAGOMA: { d: string; pari?: boolean }[] = [
  // collo
  { d: 'M 53 32 L 67 32 L 68 48 L 52 48 Z' },
  // tronco
  { d: 'M 43 47 L 77 47 L 74 124 L 46 124 Z' },
  // bacino
  { d: 'M 45 120 L 75 120 L 78 150 L 42 150 Z' },
  // braccio intero, dalla spalla al polso
  { d: 'M 31 55 L 45 53 L 44 126 L 25 124 Z', pari: true },
  // mano
  { d: 'M 25 124 L 36 126 L 34 139 L 23 137 Z', pari: true },
  // gamba intera
  { d: 'M 43 146 L 59 146 L 57 236 L 45 236 Z', pari: true },
  // piede
  { d: 'M 43 233 L 58 233 L 59 244 L 42 244 Z', pari: true }
];

export interface MuscleMapProps {
  /** Distretti evidenziati con il colore pieno. */
  primari?: Distretto[];
  /** Distretti evidenziati in tono attenuato. */
  secondari?: Distretto[];
  /** Colore per distretto: ha la precedenza su primari/secondari (usato dal recupero). */
  colori?: Partial<Record<Distretto, string>>;
  vista?: Vista | 'entrambe';
  /** Altezza in pixel; la larghezza segue le proporzioni. */
  altezza?: number;
  className?: string;
}

function Sagoma({
  vista,
  primari,
  secondari,
  colori,
  altezza
}: {
  vista: Vista;
  primari: Distretto[];
  secondari: Distretto[];
  colori?: Partial<Record<Distretto, string>>;
  altezza: number;
}) {
  const tracciati = TRACCIATI[vista];
  const distretti = Object.keys(tracciati) as Distretto[];

  const riempimento = (dist: Distretto) => {
    if (colori && colori[dist]) return colori[dist] as string;
    if (primari.includes(dist)) return 'var(--color-accent)';
    if (secondari.includes(dist)) return 'color-mix(in srgb, var(--color-accent) 38%, transparent)';
    return 'var(--color-elevated)';
  };

  return (
    <svg
      viewBox="0 0 120 250"
      height={altezza}
      width={(altezza * 120) / 250}
      role="img"
      aria-label={`Sagoma ${vista}`}
      style={{ display: 'block' }}
    >
      <circle cx="60" cy="21" r="14" fill="var(--color-elevated)" />
      {SAGOMA.map((f, i) => (
        <React.Fragment key={`s${i}`}>
          <path d={f.d} fill="var(--color-elevated)" />
          {f.pari && <path d={specchia(f.d)} fill="var(--color-elevated)" />}
        </React.Fragment>
      ))}

      {distretti.map((dist) => {
        const forme = tracciati[dist] || [];
        return (
          <g key={dist}>
            {forme.map((f, i) => (
              <React.Fragment key={i}>
                <path d={f.d} fill={riempimento(dist)} />
                {f.pari && <path d={specchia(f.d)} fill={riempimento(dist)} />}
              </React.Fragment>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

export function MuscleMap({
  primari = [],
  secondari = [],
  colori,
  vista = 'fronte',
  altezza = 120,
  className
}: MuscleMapProps) {
  // Con 'entrambe' mostriamo fronte e retro affiancati; con una vista sola,
  // scegliamo automaticamente quella dove i distretti primari si vedono.
  const viste: Vista[] =
    vista === 'entrambe'
      ? ['fronte', 'retro']
      : [scegliVista(vista, primari, secondari)];

  return (
    <div className={`flex items-end justify-center gap-2 ${className || ''}`}>
      {viste.map((v) => (
        <Sagoma
          key={v}
          vista={v}
          primari={primari}
          secondari={secondari}
          colori={colori}
          altezza={altezza}
        />
      ))}
    </div>
  );
}

/**
 * Con una vista sola si mostra quella del primo distretto primario: gli
 * elenchi sono in ordine di importanza, quindi e' il muscolo che l'utente
 * si aspetta di vedere acceso. Contare quanti stanno davanti e quanti
 * dietro nascondeva il dorsale nelle trazioni.
 */
function scegliVista(richiesta: Vista, primari: Distretto[], secondari: Distretto[]): Vista {
  const principale = primari[0] || secondari[0];
  return principale ? VISTA_DISTRETTO[principale] : richiesta;
}
