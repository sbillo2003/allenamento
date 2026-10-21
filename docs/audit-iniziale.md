# Calis — audit e piano di miglioramento

Base analizzata: `calis---calisthenics-progression.zip`, 7.233 righe in 23 file sorgente.
Struttura rispettata (types / data / logic / store / screens / components), nessuna chiamata di rete, dati in localStorage. Il lavoro è buono: quello che segue è dove si rompe o dove si può alzare il livello.

---

# PARTE 1 — Cose rotte o finte (da sistemare per prime)

Queste non sono preferenze: sono punti in cui l'app mostra un numero che non corrisponde alla realtà, o una funzione dichiarata che non esiste.

### 1.1 Lo streak è finto — `TodayScreen.tsx:48`

```ts
streak = Math.min(14, Math.max(1, workouts.length));
```

Non conta giorni consecutivi: conta quanti allenamenti hai fatto in totale, saturati a 14, a patto che l'ultimo sia nelle ultime 48 ore. Se ti alleni 5 volte in 5 settimane diverse, l'app ti dice "5 giorni di serie". È il numero più visibile della schermata principale ed è inventato.

**Da fare:** calcolare la serie sulle settimane in cui hai raggiunto l'obiettivo di sessioni, non sui giorni. Per un piano da 3 giorni a settimana una "serie di giorni consecutivi" non ha senso fisiologico: i giorni di riposo sono parte del programma e non devono spezzare niente.

### 1.2 Le misure corporee sono inventate — `AppContext.tsx` (COMPLETE_ONBOARDING)

```ts
const initialMeasurement = { pesoKg: profile.pesoKg, vitaCm: 80, colloCm: 38 };
```

Vita 80 cm e collo 38 cm sono scritti a mano nel codice. Il wizard le misure te le chiede davvero (`OnboardingWizard.tsx:166`) e le salva, ma il reducer ne aggiunge comunque una seconda con i valori finti. Risultato: la stima della massa grassa con la formula US Navy viene calcolata su numeri che non sono i tuoi, e il grafico dell'andamento vita parte da un punto falso.

**Da fare:** niente misurazione iniziale automatica. Se l'utente salta il passo, la scheda composizione corporea mostra "misure mancanti" e un pulsante per inserirle.

### 1.3 Il ciclo di 5 settimane non avanza da solo

`ADVANCE_WEEK` esiste nel reducer ma è collegato solo a un pulsante nella schermata Piano. Se non lo premi tu, resti nella settimana 1 per sempre: niente aumento di serie alla settimana 3, niente scarico alla settimana 5. L'app intanto ti scrive in home "Sei nella Settimana 1" con tono di certezza.

**Da fare:** l'avanzamento deve scattare da solo quando parte una nuova settimana di calendario, oppure quando hai completato le sessioni previste. Il pulsante manuale resta come eccezione.

### 1.4 Il ri-test a 6 settimane non esiste

`checkNeedRetest()` in `progression.ts:41` è codice morto: definita, mai chiamata da nessuna parte. E a riga 207 `proposedRetest` è scritto `false` fisso. Quindi l'app non ti proporrà mai di rifare i test, che è il meccanismo con cui dovrebbe ricalibrarsi.

**Da fare:** chiamarla davvero, e aggiungere una schermata di ri-test che riusa i passi del wizard e mostra il confronto con la volta precedente.

### 1.5 Se chiudi il player perdi tutto — `PlayerScreen.tsx:38-63`

Tutto lo stato dell'allenamento in corso (serie fatte, ripetizioni, feedback) vive in 15 `useState`. Niente è persistito. Se il telefono blocca lo schermo e il browser scarica la scheda, se ricevi una chiamata, se tocchi indietro per sbaglio: 40 minuti di allenamento spariti.

**Da fare:** salvare la sessione in corso in localStorage a ogni serie confermata, e alla riapertura dell'app proporre "Hai un allenamento in corso, riprendi da dove eri".

### 1.6 Il timer di recupero si ferma quando lo schermo si spegne

Il recupero gira con un `setInterval` che decrementa un contatore. I browser rallentano o congelano gli interval nelle schede in background: se metti il telefono in tasca durante i 180 secondi di recupero, al ritorno il timer è indietro o fermo.

**Da fare:** non contare i tick, calcolare il tempo residuo dalla differenza tra l'ora di fine e `Date.now()`. È la correzione singola che migliora di più l'uso reale.

### 1.7 "Allenati lo stesso" fa partire sempre la stessa sessione — `TodayScreen.tsx`

Nel giorno di riposo il pulsante lancia `plan.sessions[0]`, cioè sempre la prima del piano, anche se l'hai già fatta ieri.

**Da fare:** proporre la prossima sessione non ancora completata questa settimana.

### 1.8 Modificare il profilo cancella le personalizzazioni — `AppContext.tsx` (UPDATE_PROFILE)

Qualsiasi modifica al profilo, anche solo il nome, rigenera l'intero piano da zero. Perdi gli esercizi scambiati a mano e gli allenamenti spostati di giorno.

**Da fare:** rigenerare solo quando cambiano i campi che contano (giorni, durata, attrezzatura, obiettivo, limitazioni), e chiedere conferma dicendo che le modifiche manuali andranno perse.

### 1.9 La durata stimata non è stimata

In home `~{profile.durataSessioneMin} min` ripete semplicemente quello che hai scelto in onboarding. Non è un calcolo.

**Da fare:** stimarla come somma di (serie × tempo sotto tensione) + recuperi + riscaldamento. Così quando il piano cresce vedi che la sessione si allunga davvero.

### 1.10 Pulizia e installabilità

- `package.json` include `@google/genai` ed `express`: dipendenze mai usate, vanno via.
- `index.html` ha `maximum-scale=1.0, user-scalable=no`: impedisce lo zoom, è un problema di accessibilità reale e Safari lo ignora comunque.
- Non ci sono né manifest né service worker: l'app **non** è installabile sulla home e **non** funziona offline, nonostante fosse un requisito. Al primo caricamento senza rete non parte.
- Il font Inter arriva da Google Fonts via rete: offline degrada al font di sistema.

---

# PARTE 2 — Funzionalità mancanti che cambiano l'uso quotidiano

Ordinate per rapporto valore/sforzo.

### 2.1 Il riferimento alla volta scorsa (la singola aggiunta più utile)

È lo standard di fatto nei logger seri: accanto a ogni serie vedi cosa hai fatto l'ultima volta su quell'esercizio. Senza, non sai se stai progredendo mentre ti alleni, e il concetto di sovraccarico progressivo resta teorico.

Nel player, sotto il numero obiettivo: `Ultima volta: 3 × 9, 8, 8 — "giusto"`.

### 2.2 Correggere una serie già registrata

Oggi confermi e non torni indietro. Serve poter toccare un pallino di una serie già fatta e correggere le ripetizioni: sbagliare a contare è normale.

### 2.3 Le ripetizioni per lato sugli esercizi unilaterali

Pistol squat, affondo bulgaro, archer, side plank, calf monopodalico, row a un braccio: sono circa un terzo della libreria. Se "3 × 8" significhi 8 per gamba o 4 e 4 non è specificato da nessuna parte, e il conteggio del volume settimanale è di conseguenza sbagliato. Serve un flag `unilaterale` sull'esercizio e il player che chiede destra e sinistra separatamente.

### 2.4 La qualità delle ripetizioni, non solo il numero

È la critica principale che viene mossa alle app di calisthenics: registrano il completamento, non l'esecuzione. Nel calisthenics puoi fare 12 push-up pessimi o 6 puliti, e avanzare di livello sui primi ti porta dritto all'infortunio.

Aggiungere al feedback di fine serie una seconda domanda rapida: **tecnica pulita / qualche cedimento / forma persa**. Il criterio di avanzamento di livello richiede tecnica pulita, altrimenti aggiunge solo ripetizioni. Costa un tap e protegge tutta la logica di progressione.

### 2.5 Riscaldamento e defaticamento dentro il player

Oggi il riscaldamento è una lista di testo in una scheda. Deve essere la prima schermata guidata del player, con timer per ogni movimento, saltabile con un tap.

### 2.6 Modalità circuito

Il prompt la prevedeva per l'obiettivo dimagrimento, ma il player esegue sempre tutte le serie di un esercizio prima di passare al successivo. Serve una modalità che ruoti tra gli esercizi con recupero solo a fine giro.

### 2.7 Dolore e autoregolazione

Due funzioni piccole con effetto grande sulla sicurezza:
- Un pulsante "mi fa male" durante l'esercizio che lo interrompe, lo segna, propone la variante più facile e lo esclude per le sessioni successive finché non lo riabiliti.
- Prima di iniziare, una scelta "oggi sto bene / sono stanco / ho poco tempo" che riduce il volume del 20-30% o taglia gli accessori, invece di farti saltare del tutto la sessione. Saltare è peggio che ridurre.

### 2.8 Zavorra registrata nello storico

`backpackKg` esiste nel player ma va tracciato per esercizio nel tempo, altrimenti quando arrivi ai chin-up zavorrati il progresso diventa invisibile: le ripetizioni restano 6 mentre il peso sale.

### 2.9 Record personali e volume con un significato

Oggi i grafici sono quattro. Mancano i due numeri che le persone guardano davvero:
- Il massimale stimato per i movimenti chiave, con la data.
- Il confronto settimana su settimana in una riga di testo: "questa settimana 18 serie contro 15, +20% sul pattern trazione".

### 2.10 Promemoria realistici

Niente notifiche push: sono inaffidabili in una web app, soprattutto su iPhone. La soluzione onesta è un file `.ics` scaricabile che crea gli appuntamenti ricorrenti nel calendario del telefono, più un avviso in-app quando apri l'app in un giorno pianificato e non hai ancora fatto nulla.

### 2.11 Backup che non dipende dalla tua memoria

Export e import JSON ci sono. Manca la protezione dal caso tipico: pulisci i dati del browser e perdi tutto, perché localStorage non è una memoria sicura. Aggiungere un promemoria di backup ogni 2 settimane e, se il browser lo supporta, la scrittura diretta su un file scelto da te con File System Access API.

---

# PARTE 3 — Interfaccia: cosa guardare e cosa copiare

## 3.1 Dove cercare ispirazione (fonti, non collezioni Pinterest)

| Fonte | A cosa serve |
|---|---|
| **mobbin.com** | Screenshot reali di app vere, flusso per flusso, inclusi onboarding e schermate interne. È la fonte migliore: vedi come funziona davvero un'app, non un concept. |
| **screensdesign.com** | Registrazioni video di app in uso, utile per capire transizioni e micro-interazioni. |
| **pageflows.com** | Flussi completi registrati, ottimo per studiare onboarding. |
| **refero.design** | Pattern di interfaccia catalogati per componente. |
| **Apple Design Awards**, categoria salute e fitness | Il meglio in circolazione ogni anno, con le motivazioni. |

Dribbble e Behance evitali: mostrano concept mai costruiti, con layout che si rompono appena ci metti dati reali.

## 3.2 Le app da studiare e cosa rubare esattamente

**Hevy** — il logger. Da rubare: la densità della tabella di registrazione e la colonna "precedente" sempre visibile; il timer di recupero che resta in una barra fissa in alto mentre continui a navigare nell'app.

**Fitbod** — da rubare: la mappa del corpo colorata per gruppo muscolare in base al recupero. Tu hai già dieci pattern con un livello ciascuno: una silhouette umana colorata per livello renderebbe immediato quello che oggi è un grafico radar.

**Caliverse** — è l'app di calisthenics con l'albero delle abilità fatto meglio, e nelle recensioni è la cosa che le viene riconosciuta anche da chi la critica su altro. **Questa è la tua occasione più grossa**: hai nove scale di progressione già scritte nei dati, e le stai mostrando come una barra orizzontale. Trasformarle in una mappa verticale con nodi superati, nodo attuale che pulsa, nodi futuri bloccati e in grigio, cambia completamente la percezione dell'app. Si costruisce in SVG, non servono librerie, e usa dati che hai già.

**Gentler Streak** — da rubare l'atteggiamento verso il riposo: la serie non si spezza nei giorni di recupero perché il recupero è parte del piano. Risolve esattamente il problema del punto 1.1.

**Whoop** — da rubare la disciplina del numero unico: una metrica grande in alto con un colore che la spiega, tutto il resto sotto. La tua home oggi ha quattro schede di pari peso visivo e nessuna gerarchia.

**Strava** — da rubare la schermata di fine attività: riepilogo denso, record evidenziati, immagine condivisibile.

**Duolingo** — da rubare il percorso a tappe e il modo in cui il passo successivo è sempre ovvio, anche dopo due settimane di assenza.

## 3.3 Interventi concreti sulle tue schermate

**Home** — oggi: intestazione, striscia settimana, scheda allenamento, scheda informativa sul ciclo. Quattro blocchi con lo stesso peso e la scheda informativa, che è la meno utile, occupa spazio sotto. Da fare: una sola cosa sopra la piega, l'allenamento di oggi, grande; la striscia dei giorni ridotta a una riga; la spiegazione del ciclo spostata dentro la schermata Piano o in un pannello che si apre.

**Player** — da aggiungere: riferimento alla volta scorsa sotto il numero grande; pulsanti principali solo nel terzo inferiore dello schermo, perché ti alleni con una mano sola e il telefono per terra; pallini delle serie toccabili per correggere; conteggio per lato sugli unilaterali.

**Progressi** — il radar funziona come riepilogo ma non racconta una storia. Aggiungere sopra una riga di testo che dice cosa è cambiato ("Trazione verticale: da livello 3 a livello 5 in 6 settimane") e sotto una mappa a griglia dei giorni allenati sugli ultimi tre mesi, che è il grafico che le persone guardano più volentieri.

**Scheda esercizio** — oggi hai nome, istruzioni, errori comuni e il link a YouTube. Manca il contesto: dove si trova nella scala, cosa serve per sbloccare il prossimo livello ("3 × 12 puliti e passi all'archer"), e il tuo storico su quell'esercizio. È l'informazione che trasforma un elenco di esercizi in un percorso.

**Accessibilità** — togliere `user-scalable=no`, verificare il contrasto del verde `#B8FF3C` sul testo piccolo (su fondo scuro va bene come riempimento, male come colore di testo sotto i 14px), e assicurarsi che i numeri grandi del player siano leggibili a mezzo metro di distanza con il telefono per terra.

---

# PARTE 4 — Ordine di lavoro suggerito

**Giro 1, correzioni** — punti 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10. Sono tutti circoscritti e li puoi chiedere in un unico prompt di follow-up ad AI Studio.

**Giro 2, allenarsi meglio** — 2.1 volta scorsa, 2.2 correzione serie, 2.3 unilaterali, 2.4 qualità della tecnica, 2.5 riscaldamento nel player.

**Giro 3, l'albero delle progressioni** — il punto 3.2 su Caliverse, più la scheda esercizio con il criterio di sblocco. È il giro che fa sembrare l'app un prodotto.

**Giro 4, tenuta nel tempo** — PWA installabile e offline vera, promemoria .ics, backup, dolore e autoregolazione, modalità circuito.

---

# Appendice — prompt pronti da incollare in AI Studio

## Prompt giro 1

> Correggi i seguenti difetti senza cambiare l'architettura né lo stile grafico esistenti.
>
> 1. Lo streak in TodayScreen è finto: usa `workouts.length`. Sostituiscilo con una serie di settimane consecutive in cui l'utente ha completato almeno il numero di sessioni previste dal profilo. I giorni di riposo non devono spezzare la serie.
> 2. In COMPLETE_ONBOARDING elimina la misurazione iniziale con vitaCm 80 e colloCm 38 scritti a mano. Usa solo le misure realmente inserite nel wizard. Se mancano, la scheda composizione corporea mostra uno stato vuoto con un pulsante per inserirle, e non calcola la massa grassa.
> 3. ADVANCE_WEEK deve scattare automaticamente quando inizia una nuova settimana di calendario rispetto alla data di creazione del piano. Mantieni anche il pulsante manuale.
> 4. `checkNeedRetest` è codice morto e `proposedRetest` è fisso a false. Collegala davvero e, quando sono passate 6 settimane dall'ultimo test, mostra in home una scheda che propone il ri-test. Crea una schermata di ri-test che riusa i passi dei test del wizard e mostra il confronto con i risultati precedenti.
> 5. Il player perde tutto se la scheda viene chiusa. Salva la sessione in corso in localStorage a ogni serie confermata e, alla riapertura, proponi di riprenderla o di scartarla.
> 6. Il timer di recupero usa setInterval decrementando un contatore, quindi si blocca in background. Riscrivilo calcolando il residuo dalla differenza tra un timestamp di fine e Date.now(), con un listener su visibilitychange che risincronizza al ritorno in primo piano.
> 7. Nel giorno di riposo, "Allenati lo stesso" lancia sempre plan.sessions[0]. Deve proporre la prima sessione della settimana non ancora completata.
> 8. UPDATE_PROFILE rigenera il piano a ogni modifica, anche del nome. Rigeneralo solo se cambiano giorni, durata, attrezzatura, obiettivo o limitazioni, e chiedi conferma avvisando che gli scambi di esercizi e gli spostamenti di giorno andranno persi.
> 9. La durata stimata in home ripete il valore scelto in onboarding. Calcolala davvero: somma di serie per tempo sotto tensione, più i recuperi, più riscaldamento e defaticamento.
> 10. Rimuovi le dipendenze inutilizzate @google/genai ed express. Togli `maximum-scale=1.0, user-scalable=no` dal viewport. Aggiungi un manifest.webmanifest con icone, e un service worker che metta in cache l'app shell così che funzioni offline e sia installabile. Includi il font Inter come file locale invece che da Google Fonts.

## Prompt giro 2

> Aggiungi queste funzioni mantenendo lo stile esistente.
>
> 1. Nel player, sotto il numero obiettivo, mostra il riferimento all'ultima volta che è stato eseguito quell'esercizio: serie, ripetizioni e feedback ricevuto. Se non esiste storico, scrivi "prima volta".
> 2. I pallini delle serie già completate diventano toccabili: aprono un selettore rapido che permette di correggere le ripetizioni registrate.
> 3. Aggiungi al tipo Exercise un campo `unilaterale: boolean` e marcalo su pistol squat, affondo bulgaro, shrimp squat, archer push-up, archer pull-up, archer row, row a un braccio, push-up a un braccio, trazione a un braccio, side plank, Copenhagen plank, hip thrust monopodalico, calf raise monopodalico. Per questi esercizi il player chiede e registra lato destro e lato sinistro separatamente, e il calcolo del volume settimanale li conta una volta sola per serie, non due.
> 4. Dopo il feedback Facile/Giusto/Difficile aggiungi una seconda domanda a tre opzioni sulla qualità dell'esecuzione: tecnica pulita, qualche cedimento, forma persa. Modifica la logica di progressione in modo che l'avanzamento di livello richieda tecnica pulita: con "qualche cedimento" si aggiungono solo ripetizioni, con "forma persa" non si progredisce e si suggerisce di ripetere la stessa seduta.
> 5. Il riscaldamento diventa la prima fase del player: una schermata guidata con un movimento alla volta e il suo timer, con un pulsante per saltare tutto.

## Prompt giro 3

> Sostituisci la barra orizzontale che mostra il livello di ogni pattern con un albero delle progressioni.
>
> Per ogni pattern disegna in SVG una mappa verticale di nodi, uno per livello, collegati da una linea. I livelli superati sono pieni con il colore accento, il livello attuale è evidenziato con un anello che pulsa lentamente, i livelli futuri sono vuoti e in grigio, e quelli che richiedono attrezzatura che l'utente non possiede hanno un'icona di lucchetto con il nome dell'attrezzo mancante. Toccando un nodo si apre la scheda dell'esercizio.
>
> La scheda esercizio deve mostrare: la sua posizione nella scala, le istruzioni e gli errori comuni già presenti, il criterio esatto per sbloccare il livello successivo espresso in numeri (per esempio "3 serie da 12 con tecnica pulita"), e lo storico personale su quell'esercizio con il record.
>
> Nella schermata Progressi, sopra i grafici, aggiungi una riga di testo che riassume il cambiamento più significativo delle ultime sei settimane, e sotto una griglia a calendario degli ultimi tre mesi con un quadratino per giorno colorato in base al volume.

---

## Fonti consultate

- [Fitness App UI Design: Key Principles for Engaging Workout Apps — Stormotion](https://stormotion.io/blog/fitness-app-ux/)
- [Fitness App User Research: A Complete 2026 Guide — CleverX](https://cleverx.com/blog/fitness-app-user-research-a-complete-guide-for-health-and-fitness-product-teams)
- [Mobile App Design Trends 2026: UI Patterns — Muzli](https://muz.li/blog/whats-changing-in-mobile-app-design-ui-patterns-that-matter-in-2026/)
- [Fitness App Design: Onboarding, Tracking, and Retention — DesignYourWay](https://www.designyourway.net/blog/fitness-app-design/)
- [Best Calisthenics Apps 2026: 11 Tested — Fitloop](https://fitloop.app/blog/best-calisthenics-apps)
- [The 18 Best Calisthenics Apps in 2026 — Calisthenics Worldwide](https://calisthenicsworldwide.com/apps/best-calisthenics-apps/)
- [Best Calisthenics App & Program 2026 — The Movement Athlete](https://themovementathlete.com/the-best-calisthenics-program/)
- [Best Calisthenics Apps 2026: Planche, Lever & Handstand Tested — Titans Grip](https://www.titans-grip.com/blog/best-calisthenics-app-2026/)

Nota sulle fonti: le recensioni di app di calisthenics sono quasi tutte affiliate o scritte da concorrenti, e i prezzi e i punteggi non coincidono tra un sito e l'altro. Le ho usate solo per punti verificabili (Caliverse ha un albero delle abilità, a Thenx viene contestato di misurare il completamento e non la qualità dell'esecuzione). Le osservazioni sul tuo codice vengono invece dalla lettura diretta dei file e sono verificabili riga per riga.
