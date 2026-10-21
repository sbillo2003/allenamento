# Allenamento

App di allenamento a corpo libero (calisthenics). Valuta il livello reale con dei test fisici, genera un piano su misura e lo fa progredire in base a come vanno gli allenamenti.

Funziona interamente nel browser: nessun account, nessun server, nessuna chiamata di rete. Tutti i dati restano in `localStorage` sul dispositivo.

## Cosa fa

- **Test iniziali** — massimo di push-up, trazioni, squat, plank, dip o row, con conversione in un livello separato per ogni pattern di movimento, corretto per sesso ed età.
- **Nove scale di progressione** — dal push-up al muro al one-arm assistito, dal dead hang all'archer pull-up. Il livello dell'utente è la posizione sulla scala.
- **Piano generato** — split scelto in base ai giorni disponibili (full body, upper/lower, push/pull/legs), volume e recuperi secondo l'obiettivo, ciclo di 4 settimane più una di scarico.
- **Player** — riscaldamento guidato, timer, conto alla rovescia dei recuperi, riferimento all'ultima volta, conteggio separato per lato sugli esercizi unilaterali, feedback su sforzo e qualità tecnica.
- **Progressione automatica** — doppia progressione: prima salgono le ripetizioni, poi il livello. L'avanzamento richiede tecnica pulita.
- **Analisi** — volume settimanale, livello per pattern, peso e circonferenze, mappa di costanza, albero delle progressioni con criterio di sblocco e storico per esercizio.
- **Ri-test** — ogni sei settimane l'app propone di rifare i test e confronta i risultati.

## Sviluppo

```bash
npm install
npm run dev
```

Altri comandi:

```bash
npm run build     # build di produzione in dist/
npm run preview   # anteprima della build
npm run lint      # controllo dei tipi (tsc --noEmit)
```

## Struttura

```
src/
  data/        libreria esercizi, soglie dei test, dati dimostrativi
  logic/       valutazione, generazione del piano, progressione, composizione corporea
  store/       stato globale e persistenza
  screens/     onboarding, oggi, piano, progressi, profilo, player, ri-test
  components/  grafici, albero delle progressioni, icone
```

## Note

- I valori di riferimento dei test sono fasce orientative per adulti, non un giudizio clinico.
- La stima della massa grassa usa la formula US Navy ed è dichiarata come stima.
- Il piano non sostituisce un professionista: in caso di dolore o patologie, sentire un medico.

## Origine

Prima versione generata con Google AI Studio a partire da una specifica dettagliata. Il primo commit è quell'output non modificato; i commit successivi sono correzioni e aggiunte.
