/**
 * Vocabolario dei distretti muscolari e mappatura dagli esercizi.
 *
 * Il campo `muscoli` della libreria e' testo libero con un centinaio di
 * varianti ("Pettorali", "Gran pettorale basso", "Fibre sternocostali
 * pettorale"...): utile da leggere, inutilizzabile per colorare una sagoma.
 * Qui ricaviamo i distretti dal `pattern`, che e' gia' strutturato, con
 * poche eccezioni per gli esercizi che il pattern da solo non descrive.
 */

import { Pattern, Exercise } from '../types';

export type Distretto =
  | 'petto'
  | 'deltoidi'
  | 'tricipiti'
  | 'bicipiti'
  | 'avambracci'
  | 'dorsali'
  | 'trapezi'
  | 'lombari'
  | 'addome'
  | 'obliqui'
  | 'glutei'
  | 'quadricipiti'
  | 'femorali'
  | 'polpacci';

export const NOMI_DISTRETTI: Record<Distretto, string> = {
  petto: 'Petto',
  deltoidi: 'Spalle',
  tricipiti: 'Tricipiti',
  bicipiti: 'Bicipiti',
  avambracci: 'Avambracci',
  dorsali: 'Dorsali',
  trapezi: 'Trapezi',
  lombari: 'Lombari',
  addome: 'Addome',
  obliqui: 'Obliqui',
  glutei: 'Glutei',
  quadricipiti: 'Quadricipiti',
  femorali: 'Femorali',
  polpacci: 'Polpacci'
};

/** Su quale vista della sagoma si vede ciascun distretto. */
export const VISTA_DISTRETTO: Record<Distretto, 'fronte' | 'retro'> = {
  petto: 'fronte',
  deltoidi: 'fronte',
  tricipiti: 'retro',
  bicipiti: 'fronte',
  avambracci: 'fronte',
  dorsali: 'retro',
  trapezi: 'retro',
  lombari: 'retro',
  addome: 'fronte',
  obliqui: 'fronte',
  glutei: 'retro',
  quadricipiti: 'fronte',
  femorali: 'retro',
  polpacci: 'retro'
};

export interface DistrettiEsercizio {
  primari: Distretto[];
  secondari: Distretto[];
}

const PER_PATTERN: Record<Pattern, DistrettiEsercizio> = {
  spinta_orizzontale: {
    primari: ['petto', 'tricipiti'],
    secondari: ['deltoidi', 'addome']
  },
  spinta_verticale: {
    primari: ['deltoidi', 'tricipiti'],
    secondari: ['trapezi', 'addome']
  },
  dip: {
    primari: ['petto', 'tricipiti'],
    secondari: ['deltoidi']
  },
  trazione_orizzontale: {
    primari: ['dorsali', 'bicipiti'],
    secondari: ['trapezi', 'deltoidi', 'addome']
  },
  trazione_verticale: {
    primari: ['dorsali', 'bicipiti'],
    secondari: ['avambracci', 'trapezi', 'addome']
  },
  gambe_spinta: {
    primari: ['quadricipiti', 'glutei'],
    secondari: ['femorali', 'polpacci', 'addome']
  },
  gambe_catena_posteriore: {
    primari: ['femorali', 'glutei'],
    secondari: ['lombari', 'addome']
  },
  core_anteriore: {
    primari: ['addome'],
    secondari: ['obliqui']
  },
  core_laterale: {
    primari: ['obliqui'],
    secondari: ['addome', 'glutei']
  },
  polpacci: {
    primari: ['polpacci'],
    secondari: []
  }
};

/**
 * Eccezioni: esercizi in cui il pattern non basta a descrivere il carico.
 * Vale la pena elencarli a mano solo dove la differenza si vede davvero.
 */
const ECCEZIONI: Record<string, DistrettiEsercizio> = {
  pushup_diamante: {
    primari: ['tricipiti', 'petto'],
    secondari: ['deltoidi', 'addome']
  },
  pushup_declinato: {
    primari: ['petto', 'deltoidi'],
    secondari: ['tricipiti', 'addome']
  },
  pushup_pseudo_planche: {
    primari: ['deltoidi', 'petto'],
    secondari: ['tricipiti', 'addome']
  },
  chinup_zavorrato: {
    primari: ['bicipiti', 'dorsali'],
    secondari: ['avambracci', 'addome']
  },
  dead_hang: {
    primari: ['avambracci'],
    secondari: ['dorsali', 'trapezi']
  },
  scapular_pullup: {
    primari: ['trapezi', 'dorsali'],
    secondari: ['avambracci']
  },
  glute_bridge: {
    primari: ['glutei'],
    secondari: ['femorali', 'lombari']
  },
  hip_thrust_monopodalico: {
    primari: ['glutei'],
    secondari: ['femorali', 'addome']
  },
  good_morning_corpo_libero: {
    primari: ['femorali', 'lombari'],
    secondari: ['glutei']
  }
};

const VUOTO: DistrettiEsercizio = { primari: [], secondari: [] };

/** Distretti primari e secondari di un esercizio. */
export function distrettiDi(esercizio: Pick<Exercise, 'id' | 'pattern'>): DistrettiEsercizio {
  return ECCEZIONI[esercizio.id] || PER_PATTERN[esercizio.pattern] || VUOTO;
}

/** Unione dei distretti di piu' esercizi, con i primari che prevalgono. */
export function distrettiDiPiuEsercizi(
  esercizi: Pick<Exercise, 'id' | 'pattern'>[]
): DistrettiEsercizio {
  const primari = new Set<Distretto>();
  const secondari = new Set<Distretto>();

  for (const e of esercizi) {
    const d = distrettiDi(e);
    d.primari.forEach((x) => primari.add(x));
    d.secondari.forEach((x) => secondari.add(x));
  }
  // un distretto primario in un esercizio non va declassato a secondario
  primari.forEach((x) => secondari.delete(x));

  return { primari: [...primari], secondari: [...secondari] };
}
