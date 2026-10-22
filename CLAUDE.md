# Allenamento

App di calisthenics (PWA, React 19 + Vite 8 + TypeScript + Tailwind 4) per uso personale.
Funziona offline, dati solo in `localStorage` (chiave `calis.v1`), nessun backend, nessun account, nessuna API esterna.

**All'inizio di ogni sessione leggi `HANDOFF.md`**: dice cosa è fatto, cosa è deciso e perché, e da dove ripartire.

## Comandi

```bash
npm install
npm run dev        # sviluppo, porta 3000
npm run build      # build di produzione in dist/
npm run lint       # controllo dei tipi (tsc --noEmit)
./node_modules/.bin/tsx --test src/logic/*.test.ts   # test (non c'è ancora uno script npm)
```

## Convenzioni

- **Lingua**: interfaccia, commenti e messaggi di commit in italiano.
- **Struttura**: `src/data` (libreria esercizi, soglie, muscoli), `src/logic` (funzioni pure e testate), `src/store` (stato), `src/screens`, `src/components`.
- **File corti e modulari.** La logica sta in `src/logic` come funzioni pure con test, non dentro i componenti.
- **Commenti** solo dove la logica non è ovvia (formule, soglie, scelte che sembrerebbero sbagliate).
- **Colori**: variabili CSS in `src/index.css`. Il modificatore di opacità di Tailwind (`bg-accent/10`) **non funziona** perché i colori non sono nel tema: usare `color-mix(in srgb, var(--color-accent) 10%, transparent)`.
- **Un commit per intervento**, messaggio che spiega il perché. Prima di ogni commit: `npm run lint`, test, build e, se tocca l'interfaccia, prova nel browser a 375×812.
- **Dipendenze**: niente librerie pesanti senza chiedere. I grafici sono SVG scritti a mano.
- **Non usare Google AI Studio per modificare il codice**: riscrive i file interi e passerebbe sopra ai commit. La copia su GitHub è la verità.

## Trappole note

- **Prima di `git add -A` guarda `git status`.** La cartella `app ispirazione allenamento/` (screenshot di terzi e schermate personali) è nel `.gitignore`; non deve mai finire nel repository, che è pubblico.
- **Messaggi di commit**: usare `git commit -F - <<'MSG'` (delimitatore tra apici). In un heredoc normale i backtick vengono eseguiti dalla shell e spariscono.
- **Service worker**: si registra solo in produzione. Su GitHub Pages una nuova versione compare alla seconda apertura. Il browser incorporato non lo registra su localhost: verificarlo sull'URL pubblico.
- **Windows / Git Bash**: `--base /percorso/` viene trasformato in un percorso Windows, anteporre `MSYS_NO_PATHCONV=1`. Percorsi molto lunghi (come lo scratchpad) rompono `python -m http.server`.
- **Icone PWA**: sorgente `public/icon.svg`; i quattro PNG si rigenerano dal canvas del browser (PIL non è installato). La versione maskable ha il soggetto al 68%.
- **Dev server**: se localhost mostra codice vecchio, cancellare registrazioni del service worker e cache dalla console, poi ricaricare. `.claude/launch.json` è ignorato da git e va ricreato (`npm run dev`, porta 3000).
- Il ciclo di 5 settimane avanza da `plan.settimanaIniziataIl`, **non** da `plan.creatoIl` (che si azzera a ogni rigenerazione del piano).
