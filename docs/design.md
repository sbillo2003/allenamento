# Analisi delle app di riferimento e piano di design

Analisi delle 26 schermate in `app ispirazione allenamento/`. Per ogni schermata: cosa fa bene, e cosa possiamo prendere senza copiare asset o testi altrui.

Il filo conduttore delle schermate che hai scelto è uno solo: **mostrano il corpo**. Dove un esercizio compare, compare anche la parte del corpo su cui incide. È la differenza più grossa rispetto alla nostra app, che oggi è tutta testo e numeri.

---

## 1. Quello che ti ha colpito, letto una per una

### Onboarding con il muscolo evidenziato
*WhatsApp 18.30.59 (2) e (3) — "Quanti squat riesci a fare?", "Quante flessioni riesci a fare?"*

Quattro cose, tutte copiabili:

1. **Una domanda per schermata**, titolo grande con la parola chiave a colore (`squat`, `flessioni` in blu). Il resto del titolo resta neutro.
2. **Un sottotitolo che toglie l'ambiguità**: "Quante riesci a fare senza una pausa?". Noi oggi diamo istruzioni lunghe; una riga basta.
3. **L'illustrazione anatomica con i muscoli coinvolti colorati.** È il pezzo centrale della schermata, non un contorno.
4. **Risposte a fasce, non un tastierino**: `Meno di 15` / `15-30` / `Più di 30` / `Non lo so`, quattro schede grandi in griglia 2×2. Molto più veloce da toccare e meno intimidatorio di "inserisci il numero esatto". Il `Non lo so` è un'uscita di sicurezza che evita di bloccare chi non ha mai provato.

Da notare: il pulsante `Continua` resta disattivato finché non scegli. Buona pratica, la teniamo.

### Stato dei muscoli come elenco
*Fitbod iOS 24 e 25*

Ogni gruppo muscolare è una riga con **una miniatura del corpo in cui quel muscolo è acceso in bianco** e il resto resta grigio. Chest, Triceps, Shoulders, Lower Back, Glutes: si capisce al volo anche senza leggere.

Da prendere: la miniatura del corpo come "icona" del gruppo muscolare, riusabile ovunque serva nominare un distretto.

Da non prendere: il pulsante `Next` che galleggia sopra l'ultima riga e la taglia a metà. È un difetto, si vede in entrambe le schermate.

### Mappa muscolare dell'allenamento
*Peloton Strength+ iOS 19*

Una scheda con la sagoma del corpo e **i muscoli bersaglio accesi in giallo** sul grigio scuro, accanto al testo che spiega. Sotto, l'allenamento diviso in sezioni (`Warm Up`, `Block 1`) con righe di esercizi e il dettaglio "30s per lato".

Da prendere:
- la sagoma con i bersagli accesi applicata alla **sessione intera**, non al singolo esercizio: apri l'allenamento di oggi e vedi subito cosa lavori
- la **riga di metadati**: `20 min · Upper Body · Build strength · Beginner · With Warm-up`. Densa, leggibile, dice tutto in una riga
- le sezioni con intestazione, che è esattamente come è fatto il nostro player ora che ha il riscaldamento

### Recupero muscolare
*WhatsApp 18.31.01 — "Stato del recupero, 100% complessivo · Pronto per allenarti"*

Corpo **fronte e retro** affiancati, ogni distretto colorato secondo lo stato, con legenda `Pronto` / `In recupero` / `Recupero`. Una riga di testo in cima dà il verdetto in parole.

È la schermata più forte del gruppo, e per noi è a costo quasi zero: abbiamo già lo storico degli allenamenti con data e pattern coinvolti. Il recupero si calcola, non serve un sensore.

### Home di un'app di calisthenics
*WhatsApp 18.31.00 (5)*

- striscia della settimana con i giorni e un puntino sotto quelli pianificati
- **tre riquadri affiancati**: `Peso`, `Movimento`, `Recupero`, quest'ultimo con un indicatore ad arco e la frase "Pronto per allenarti"
- una riga `COACH` che parla all'utente in prima persona
- la sessione con le righe degli esercizi e `2×6 ripetizioni` a destra
- un solo pulsante verde grande

Da prendere: i tre riquadri e la riga del coach. La nostra home ha quattro schede di pari peso e nessuna gerarchia.

### Icone e illustrazioni
*Sweatcoin iOS 4*

Illustrazione 3D lucida come intestazione della schermata. **Qui devo essere onesto: non posso produrre render 3D.** Quello che posso fare è un'intestazione illustrata in SVG con sfumature e trasparenze, che è un'altra cosa. Se quello stile ti interessa davvero, la strada è generare le immagini altrove e metterle nella cartella `public`.

### Sfumature e contrasto
*Sweatcoin iOS 5 e 6*

Questo invece si riproduce bene:
- **un alone radiale caldo dietro al numero principale**, che sfuma nel colore della pagina senza bordi netti
- schede a sfumatura piena con il pulsante bianco a pillola sopra
- la scheda serie con `M T W T F S S` e le spunte, su sfumatura rosso-arancio
- contrasto alto: bianco pieno su fondo saturo, numeri in giallo

Da prendere: l'alone dietro al numero grande, e le schede a sfumatura per i momenti che devono "spingere" (serie, traguardi, fine allenamento). Da usare con parsimonia: Sweatcoin può permettersi il viola ovunque perché non ha dati da leggere, noi sì.

---

## 2. Il resto delle schermate

| Schermata | Cosa vale |
|---|---|
| Apple Fitness iOS 6 | Griglia a riquadri di dimensione diversa, numeri grandi colorati, barra di navigazione a pillola galleggiante |
| WhatsApp 18.31.01 (3) | Selettore di periodo `7d / 30d / 90d / Tutti` sopra i grafici |
| WhatsApp 18.31.00 (3) e (4) | Riga di tre statistiche con icona; barra BMI a scala colorata continua |
| WhatsApp 18.31.00 (1) e (2) | Righe esercizio con miniatura, maniglia per riordinare e icona per sostituire |
| WhatsApp 18.30.59 | Domanda a scelta multipla "Su cosa ti vuoi concentrare?" per zona del corpo |
| Bevel iOS 10 | Tre anelli affiancati per metriche diverse |
| OpenNutriTracker, Bevel 13 | Nutrizione e sonno: fuori dal nostro perimetro |

---

## 3. Piano di implementazione

### M1 — Mappa muscolare *(la base di tutto il resto)*
Una sagoma umana in SVG, fronte e retro, con ogni distretto come tracciato separato e indirizzabile: petto, deltoidi, dorsali, trapezi, bicipiti, tricipiti, addome, obliqui, lombari, glutei, quadricipiti, femorali, polpacci.

Un solo componente con tre modi d'uso:
- **miniatura** per le righe di elenco, un distretto acceso
- **media** per la scheda esercizio e la sessione, più distretti accesi con intensità diversa fra primari e secondari
- **grande fronte+retro** per la schermata recupero

Richiede di aggiungere alla libreria esercizi i distretti primari e secondari. Il campo `muscoli` c'è già ma è testo libero: va trasformato in codici.

### M2 — Onboarding ridisegnato
Titolo con la parola chiave a colore, sottotitolo di una riga, mappa muscolare dell'esercizio al centro, risposte a fasce in griglia 2×2 più `Non lo so`.

Nota: le fasce vanno convertite in un numero per la nostra logica dei livelli. Uso il centro della fascia (`10-20` → 15), e `Non lo so` porta a un mini-test guidato invece che a un valore inventato.

### M3 — Recupero muscolare
**Fatto.** Modello semplice e dichiarato, in `src/logic/recupero.ts`: ogni seduta lascia su un distretto una dose di serie pesate (primario 1, secondario 0.4) e la dose fissa le ore di recupero, da 24 (tocco leggero) a 72 (carico pesante), con recupero lineare. Per ogni distretto vale la seduta che lo lascia più scarico; sedute oltre sette giorni non contano. Soglie: da 90% pronto, da 60% in recupero, sotto da recuperare.

Rispetto alla prima ipotesi (48 ore per un carico leggero) l'intervallo parte da 24: un tocco da una o due serie su un muscolo secondario non può richiedere due giorni.

Alimenta: la schermata fronte/retro, il riquadro in home, e un suggerimento quando stai per allenare un distretto ancora scarico.

### M4 — Home ridisegnata
**Fatto.** Ordine dall'alto: intestazione, riga del coach (una frase, la prima regola che scatta, in `src/logic/coach.ts`), hero con il numero delle sessioni in un anello con alone caldo, scheda di oggi con sagoma dei muscoli, riga di metadati e pulsante subito sotto, poi tre riquadri (recupero, serie della settimana rispetto allo stesso punto della scorsa, fase del ciclo). Il pulsante "Inizia allenamento" resta visibile senza scorrere su uno schermo da 375×812.

### M5 — Rifiniture
Selettore di periodo sui grafici, scheda serie a sfumatura, barra di navigazione a pillola galleggiante, righe esercizio con miniatura del distretto.

---

## 4. Dove implementare

**Non su Google AI Studio.** Da quando il codice sta su GitHub con una storia di commit, rigenerarlo da AI Studio significherebbe sovrascrivere in blocco: AI Studio riscrive i file interi, non applica differenze. Le correzioni dei giorni scorsi — l'albero delle progressioni collegato, l'avanzamento del ciclo, il riscaldamento nel player, le icone — tornerebbero indietro o andrebbero rifatte.

In più è già successo: l'ultima volta la quota si è esaurita a metà del terzo giro e i componenti sono arrivati scritti ma non collegati.

AI Studio è stato lo strumento giusto per partire da zero in un colpo solo. Per modifiche mirate a codice che esiste, la strada è qui: una modifica alla volta, verificata nel browser, con un commit per intervento e la possibilità di tornare indietro.

---

## 5. Problemi noti

- **Classi con modificatore di opacità inattive.** Nel codice preesistente ci sono una ventina di classi come `bg-accent/10` o `border-error/40` che non producono nessuno stile: i colori sono variabili CSS e non sono registrati nel tema di Tailwind, quindi il modificatore `/NN` non ha niente da calcolare. Nel codice nuovo si usa `color-mix(in srgb, var(--color-...) NN%, transparent)`. Correggere le classi vecchie richiede di decidere come registrare i colori senza rompere il cambio tema.
