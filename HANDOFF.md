# Stato del lavoro (aggiornato il 22/10/2026, dopo la Milestone 5)

## Obiettivo

App di allenamento a corpo libero (calisthenics) **per uso personale**: l'utente inserisce dati, attrezzi e livello, fa dei test fisici, riceve un piano personalizzato che progredisce da solo. Requisiti fissi: funziona offline, dati solo in locale (`localStorage`, chiave `calis.v1`), nessun backend, nessun account, nessuna API esterna.

Nasce come clone *funzionale* di BetterMe Calisthenics, senza usare nome, grafica o testi dell'originale. Il brief iniziale prevedeva quattro fasi con approvazione (`docs/feature-analysis.md`, `docs/spec.md`, scaffolding, milestone): **non sono state fatte**. L'utente ha preferito far generare l'app in un colpo solo da Google AI Studio e poi migliorarla qui. Non servono, salvo richiesta.

## Fatto (tutto il 21/10/2026)

Pubblicato su https://sbillo2003.github.io/allenamento/ (repo pubblico `sbillo2003/allenamento`, branch `main`, deploy automatico con GitHub Pages a ogni push).

**Verificato** (test, build, prova nel browser a 375×812):
- 33 test su 33 (`src/logic/*.test.ts`), controllo dei tipi pulito, build ok.
- Albero delle progressioni, heatmap "Costanza" e riga "In sintesi" nella schermata Progressi.
- Avanzamento automatico del ciclo di 5 settimane (piano fermo da 3 settimane: passa da 1 a 4, e un secondo caricamento non lo fa avanzare di nuovo).
- Riscaldamento guidato come prima fase del player; riga "Ultima volta" fuori dall'anello.
- Mappa muscolare (sagoma fronte/retro, 14 distretti) e onboarding con test a fasce, una domanda per schermata.
- Recupero muscolare (riquadro, pannello fronte/retro, avviso sulla seduta di oggi).
- Home ridisegnata (coach, hero con alone, scheda di oggi, tre riquadri), in tema scuro e chiaro.
- Sul sito pubblicato: manifest, service worker e icone rispondono 200; alla seconda apertura la cache contiene tutta l'app (verificato su https).
- Il codice di recupero e della home è presente nel bundle pubblicato.

**Scritto ma non verificato**:
- L'icona sul telefono vero (serve disinstallare e reinstallare la PWA: Android la fissa all'installazione).
- Il comportamento offline su telefono vero.
- L'aspetto della versione pubblicata dopo gli ultimi due deploy (ho controllato solo che il codice nuovo ci fosse).
- La home e il recupero con **allenamenti veri**: tutte le prove usano i dati dimostrativi (`?autostart=1`).

## Decisioni (e perché)

Prese dall'utente:
- **PWA React + Vite + TypeScript**, dati in `localStorage`: gira su browser e telefono, installabile, zero backend.
- **Demo degli esercizi con link esterni** (ricerca YouTube), non video incorporati: rompe l'offline solo per quella parte.
- **Scope: core allenamento.** Fuori: nutrizione, sfide, gamification, Health/Google Fit.
- **Repo pubblico con GitHub Pages**, cartella `C:\Users\billy\progetti\allenamento` (fuori da OneDrive, che rallenterebbe con `node_modules`).
- Stile preso dalle sue schermate di riferimento (`app ispirazione allenamento/`, 26 immagini): sagoma con i muscoli evidenziati, risposte a fasce nei test, alone dietro al numero principale.

Prese da me, accettate implicitamente (l'utente ha proseguito):
- **Non si modifica più da Google AI Studio.** Riscrive i file interi e passerebbe sopra ai commit; l'ultima volta la quota è finita a metà e ha prodotto ~490 righe scritte ma mai collegate. La copia su GitHub è la verità.
- **Il livello di ogni esercizio sta su una scala per pattern** (9 scale, ~55 esercizi): il livello dell'utente è la sua posizione sulla scala, per pattern separato.
- **Distretti muscolari ricavati dal `pattern`**, non dal campo `muscoli` della libreria (testo libero con ~100 varianti). Nove eccezioni in `src/data/muscoli.ts`.
- **Recupero**: ogni seduta lascia una dose di serie pesate (principale 1, secondario 0,4) che fissa 24–72 ore di recupero; soglie 90% pronto, 60% in recupero. Modello dichiarato come stima, non misura. Dettagli in `docs/design.md`.
- **Serie della settimana** confrontate con lo stesso punto della settimana scorsa, non con tutta (altrimenti ogni mercoledì sarebbe "-70%").
- **Streak a settimane** consecutive in cui si raggiunge l'obiettivo di sessioni, non a giorni: i giorni di riposo fanno parte del piano.
- **Coach = regole in ordine di priorità**, non un modello: prevedibile, testabile, offline.
- **Service worker registrato solo nella build di produzione**: in sviluppo serviva codice vecchio.
- **Avanzamento di settimana ancorato a `plan.settimanaIniziataIl`.** Il vecchio `AUTO_SYNC_WEEK` usava `creatoIl`, che viene riscritto a ogni rigenerazione del piano: la differenza era sempre 0 e il ciclo non avanzava mai.
- **Icona**: atleta in sospensione alla sbarra, forme piene (leggibile a 48 px). Le vecchie erano ritagli di uno screenshot dell'onboarding.

## In corso

Niente. Nessun server né processo attivo.

## Prossimi passi

0. **Bonifica del repository: fatta il 22/10/2026, con un residuo.** Le 26 immagini di `app ispirazione allenamento/` (screenshot di app di terzi e schermate del telefono dell'utente) erano finite per errore nel repo pubblico. La storia di `main` è stata riscritta senza di esse e pubblicata con push forzato: nessun commit del ramo le contiene più, e il contenuto del codice è identico a prima (verificato con un confronto degli alberi). **Residuo:** GitHub conserva i commit orfani e li serve ancora a chi conosce il loro indirizzo diretto; il ramo e il sito pubblicato rispondono 404. Per cancellarli del tutto bisogna chiederlo al supporto di GitHub (che può rimuovere le viste in cache e fare la pulizia), e ripulire le esecuzioni vecchie di Actions, che puntano a quei commit. Non fare altro senza chiedere all'utente se vuole spingersi fino a lì.
1. **Milestone 5, rifiniture: fatta il 22/10/2026** (tre commit, verificati nel browser a 375 px, test 39/39, lint e build puliti; **non ancora pubblicati con push**):
   - selettore `7g / 30g / 90g / Tutti` nei Progressi (`src/logic/periodo.ts`, 6 test). Vale per il volume (7g = barre giornaliere, altrimenti settimanali) e per peso/vita; radar e costanza hanno una finestra loro e non cambiano;
   - scheda a sfumatura rosso-arancio per le serie nel player (`src/components/SchedaSerie.tsx`, sostituisce i pallini) e per le statistiche del riepilogo finale. Colori fissi anche nel tema chiaro, per il contrasto;
   - barra di navigazione a pillola galleggiante in `src/App.tsx`.
   - **Resta della M5 solo "righe esercizio con miniatura del distretto"** (`docs/design.md`): non era nell'elenco dei passi, va deciso se farla.
2. **Provare tutto sul telefono vero**: disinstallare e reinstallare la PWA (icona), aprirla due volte (offline), fare qualche allenamento vero e vedere se le soglie del recupero sembrano giuste.
3. **Correggere le ~20 classi Tailwind inattive** (`bg-accent/10`, `border-error/40`…): i colori non sono nel tema di Tailwind, quindi il modificatore `/NN` non produce stile. Serve decidere come registrarli senza rompere il cambio tema chiaro/scuro (`src/index.css`).
4. **Aggiungere uno script `test`** a `package.json` (oggi si lancia a mano, vedi sotto).
5. **Cose dall'audit non fatte** (`docs/audit-iniziale.md`): pulsante "mi fa male" con esclusione dell'esercizio, autoregolazione prima della seduta ("oggi sono stanco"), modalità circuito, zavorra storicizzata per esercizio, promemoria `.ics`, backup automatico, avviso "nuova versione disponibile", personalizzazioni (scambi di esercizi, giorni spostati) che oggi si perdono al cambio settimana perché il piano viene rigenerato.

## Domande aperte per l'utente

- **Hollow hold**: il test opzionale è sparito dal nuovo onboarding (`hollowHoldSec` ora è sempre vuoto). Va reintrodotto?
- **"Non lo so" nei test**: `docs/design.md` (M2) promette un mini-test guidato; oggi invece si usa il valore più prudente e lo si dichiara nei risultati. Va bene così o si vuole il mini-test?
- **Scheda informativa sul ciclo** (spiegava settimane 3, 4 e 5): tolta dalla home, assorbita dal riquadro "Ciclo". Si rimette?
- **Illustrazioni 3D tipo Sweatcoin**: non so produrle. Se si vuole quello stile vanno generate altrove e messe in `public/`.

## Trappole e lezioni

- **Identita' git mancante dopo la bonifica**: `git commit` fallisce con "Author identity unknown". I commit del 22/10 sono stati fatti con `git -c user.name=Billy -c user.email=billy2003.bs@gmail.com commit ...` senza toccare la configurazione. Se si vuole sistemare: `git config user.name` / `user.email` nel repository.
- **`git add -A` senza guardare `git status` ha pubblicato cartelle che non dovevano uscire** (vedi passo 0). Ora la cartella è nel `.gitignore`; resta la regola di guardare lo stato prima di aggiungere. Riscrivere la storia richiede `git filter-branch` (`git-filter-repo` non è installato) e `git push --force-with-lease=main:<sha>`, e dopo la riscrittura gli identificativi dei commit cambiano tutti.
- **Service worker**: su GitHub Pages una nuova versione compare alla *seconda* apertura. In sviluppo non si registra più; se localhost mostra codice vecchio: cancellare registrazioni e cache dalla console del browser.
- **Il browser incorporato non registra il service worker su localhost** ("unknown error"): verificarlo solo sull'URL pubblico.
- **Il dev server si disallinea quando la sessione cambia cartella**: riavviarlo con `preview_start` (nome `allenamento`, porta 3000) e aspettare con un ciclo di `curl` che risponda 200 prima di navigare. `.claude/launch.json` è nel `.gitignore`: va ricreato (`npm run dev`, porta 3000).
- **Windows**: il percorso dello scratchpad è troppo lungo per `python -m http.server` (404 su tutto); usare un percorso corto. In Git Bash `--base /allenamento/` viene trasformato in un percorso Windows: anteporre `MSYS_NO_PATHCONV=1`.
- **Messaggi di commit**: in un heredoc con virgolette doppie i backtick vengono eseguiti dalla shell e spariscono dal testo. Usare `git commit -F - <<'MSG'` con delimitatore tra apici.
- **Modifiche via script Python a file TypeScript**: gli apostrofi dentro stringhe a apici singoli si rompono con il doppio escape. Per testi con apostrofi usare lo strumento Edit.
- **`npm install` falliva** per un pin di `esbuild` (`^0.25`) in conflitto con vite 8: tolto. Il progetto usa npm; `bun.lock` è ignorato.
- **Le icone PNG si generano dal canvas del browser** (PIL non c'è): `public/icon.svg` è la sorgente; la versione maskable ha il soggetto al 68%. Se si cambia l'icona vanno rigenerati tutti e quattro i PNG.
- **Dati dimostrativi**: `http://localhost:3000/?autostart=1` li carica. Hanno un test iniziale vecchio, quindi mostrano il banner del ri-test; per provare una giornata di allenamento si modifica `calis.v1` nel `localStorage` (porta una sessione a `giorno: 3`, aggiorna la data di `assessments`).
- **La quota**: Google AI Studio e questa sessione hanno entrambi esaurito l'utilizzo a metà lavoro. Meglio consegnare a pezzi, un commit per volta.

## Dove sono le cose

| Cosa | Dove |
|---|---|
| Codice | `C:\Users\billy\progetti\allenamento` |
| Repository | https://github.com/sbillo2003/allenamento |
| App pubblicata | https://sbillo2003.github.io/allenamento/ |
| Piano di design e milestone | `docs/design.md` |
| Audit iniziale e miglioramenti | `docs/audit-iniziale.md` |
| Prompt originale per AI Studio | `docs/prompt-originale-ai-studio.md` |
| Schermate di riferimento dell'utente | `app ispirazione allenamento/` (ignorata da git, resta solo sul disco dell'utente) |
| Libreria esercizi | `src/data/exercises.ts` |
| Distretti muscolari | `src/data/muscoli.ts`, `src/components/MuscleMap.tsx` |
| Recupero | `src/logic/recupero.ts`, `src/components/RecuperoCard.tsx` |
| Home | `src/screens/TodayScreen.tsx`, `src/components/home/`, `src/logic/coach.ts`, `src/logic/settimana.ts` |
| Test fisici (onboarding) | `src/screens/TestFisiciStep.tsx`, `src/logic/assessment.ts` |
| Stato globale e persistenza | `src/store/AppContext.tsx` |
| Test | `src/logic/*.test.ts`, da lanciare con `./node_modules/.bin/tsx --test src/logic/*.test.ts` |
| Conoscenze di progetto | `CLAUDE.md` |
