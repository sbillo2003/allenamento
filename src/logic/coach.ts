/**
 * Riga del coach in home: una frase sola che dice cosa conviene fare ora.
 *
 * Non e' un modello e non finge di esserlo: sono regole in ordine di
 * priorita', la prima che scatta vince. Cosi' e' prevedibile, testabile
 * e funziona offline.
 */

export interface ContestoCoach {
  nome: string;
  sessioneInSospeso: boolean;
  nessunAllenamentoFatto: boolean;
  settimanaCiclo: number;
  sessioniFatte: number;
  sessioniObiettivo: number;
  /** Nome della sessione prevista per oggi, null nei giorni di riposo. */
  sessioneOggi: string | null;
  oggiGiaAllenato: boolean;
  /** Distretti primari della seduta di oggi ancora scarichi, gia' in italiano. */
  distrettiScarichi: string[];
  minutiStimati: number;
}

function elencoA(voci: string[]): string {
  const v = voci.slice(0, 2).map((x) => x.toLowerCase());
  return v.length === 2 ? `${v[0]} e ${v[1]}` : v[0];
}

export function messaggioCoach(c: ContestoCoach): string {
  if (c.sessioneInSospeso) {
    return 'Hai una sessione a metà. Riprendila da dove eri, oppure scartala se non ha più senso.';
  }

  if (c.nessunAllenamentoFatto) {
    return c.sessioneOggi
      ? `Benvenuto, ${c.nome}. Il tuo primo allenamento è ${c.sessioneOggi}: parti dal riscaldamento e tieni la tecnica pulita.`
      : `Benvenuto, ${c.nome}. Oggi non è in programma niente: guarda il piano e scegli quando iniziare.`;
  }

  if (c.settimanaCiclo === 5) {
    return 'Settimana di scarico: meno serie, stessa tecnica. Il recupero fa parte del piano.';
  }

  if (c.sessioniFatte >= c.sessioniObiettivo) {
    return 'Obiettivo della settimana raggiunto. Quello che resta è recupero.';
  }

  if (c.oggiGiaAllenato) {
    return 'Seduta di oggi fatta. Mangia, dormi, e lascia lavorare i muscoli.';
  }

  if (!c.sessioneOggi) {
    const mancano = c.sessioniObiettivo - c.sessioniFatte;
    return `Oggi riposo. Ti ${mancano === 1 ? 'manca 1 sessione' : `mancano ${mancano} sessioni`} per chiudere la settimana.`;
  }

  if (c.distrettiScarichi.length > 0) {
    return `Oggi è in programma ${c.sessioneOggi}, ma ${elencoA(c.distrettiScarichi)} ${
      c.distrettiScarichi.length === 1 ? 'è ancora scarico' : 'sono ancora scarichi'
    }. Puoi allenarti lo stesso o aspettare un giorno.`;
  }

  return `Oggi: ${c.sessioneOggi}, circa ${c.minutiStimati} minuti. Quando vuoi.`;
}
