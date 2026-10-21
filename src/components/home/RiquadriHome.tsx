/**
 * Tre riquadri affiancati sotto la scheda di oggi: recupero, volume della
 * settimana, fase del ciclo. Sono le tre cose che cambiano come ti alleni
 * oggi, non una fila di numeri decorativi.
 */

import React from 'react';
import { WorkoutLog } from '../../types';
import { RecuperoCard } from '../RecuperoCard';
import { volumeSettimana, fasePiano } from '../../logic/settimana';

const COLORE_SU = '#2FD36B';
const COLORE_GIU = '#FF5A5F';

function Tile({
  etichetta,
  valore,
  sotto,
  coloreSotto
}: {
  etichetta: string;
  valore: string;
  sotto: string;
  coloreSotto?: string;
}) {
  return (
    <div className="h-full p-3 rounded-[20px] bg-surface border border-subtle flex flex-col">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-txt">
        {etichetta}
      </span>
      <span className="mt-2 text-[32px] leading-[50px] font-bold tracking-tight text-txt tabular-nums text-center">
        {valore}
      </span>
      <span
        className="mt-2 text-[11px] leading-snug text-muted-txt"
        style={coloreSotto ? { color: coloreSotto } : undefined}
      >
        {sotto}
      </span>
    </div>
  );
}

export function RiquadriHome({
  workouts,
  settimanaCiclo
}: {
  workouts: WorkoutLog[];
  settimanaCiclo: number;
}) {
  const volume = volumeSettimana(workouts);
  const fase = fasePiano(settimanaCiclo);

  let sottoVolume = 'questa settimana';
  let coloreVolume: string | undefined;
  if (volume.variazione !== null && volume.serie > 0) {
    const v = volume.variazione;
    sottoVolume = v === 0 ? 'come la scorsa' : `${v > 0 ? '+' : ''}${v}% sulla scorsa`;
    coloreVolume = v > 0 ? COLORE_SU : v < 0 ? COLORE_GIU : undefined;
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      <RecuperoCard workouts={workouts} variante="tile" />
      <Tile etichetta="Serie" valore={String(volume.serie)} sotto={sottoVolume} coloreSotto={coloreVolume} />
      <Tile etichetta="Ciclo" valore={`${settimanaCiclo}/5`} sotto={fase.breve} />
    </div>
  );
}
