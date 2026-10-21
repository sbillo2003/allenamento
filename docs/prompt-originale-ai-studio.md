# PROMPT PER GOOGLE AI STUDIO (Build)

Copia tutto il testo sotto la riga e incollalo nel prompt di AI Studio.

---

Costruisci una web app completa e funzionante di allenamento a corpo libero (calisthenics), in italiano, mobile-first, che valuta il livello reale dell'utente tramite test fisici e genera un piano di allenamento personalizzato che progredisce nel tempo. Implementa TUTTO quello che segue, senza omettere sezioni e senza sostituire i numeri indicati con valori inventati.

## 0. Vincoli non negoziabili

- Nessun backend, nessun login, nessun account, nessuna chiamata di rete, NON usare l'API Gemini né alcuna API esterna. Tutta la logica è deterministica e locale.
- Tutti i dati persistono in localStorage sotto un'unica chiave versionata ("calis.v1"), con salvataggio automatico a ogni modifica di stato.
- L'app deve funzionare offline al 100% e deve compilare ed eseguire senza un solo errore di TypeScript o di runtime.
- Tutti i testi dell'interfaccia in italiano. Unità metriche (kg, cm).

## 1. Stack e struttura

- React 18 + TypeScript + Tailwind CSS. Nessuna libreria di grafici: i grafici sono SVG inline scritti a mano.
- Stato globale con React Context + useReducer, persistito in localStorage.
- Struttura dei file, modulare e con file corti:
  - types.ts — tutti i tipi
  - data/exercises.ts — libreria esercizi (sezione 4)
  - data/standards.ts — soglie dei test (sezione 6)
  - logic/assessment.ts — calcolo livello per pattern
  - logic/generator.ts — generazione del piano
  - logic/progression.ts — progressione e adattamento
  - logic/body.ts — BMI, massa grassa, fabbisogno calorico
  - store/ — context, reducer, persistenza
  - components/ — componenti riutilizzabili
  - screens/ — una cartella per schermata
- Commenta solo dove la logica non è ovvia (formule, soglie, criteri di avanzamento).

## 2. Design system (questa parte conta quanto la logica)

Deve sembrare un'app premium da App Store, non un template generico.

- Mobile-first: contenuto in un contenitore centrato di larghezza massima 480px, che respira anche su desktop.
- Tema scuro di default, con interruttore per il tema chiaro. Definisci i colori come CSS custom properties su :root e ridefiniscili per il tema chiaro.
- Palette scura: sfondo #0A0E13, superficie #141A22, superficie elevata #1D262F, bordo #2A3540, testo #F2F6FA, testo attenuato #8D9BAA, accento primario #B8FF3C (verde acido, usato per azioni e progressi), accento riposo #FF7A45, errore #FF5A5F.
- Tipografia: Inter per il testo, numeri sempre con font-variant-numeric: tabular-nums. I numeri grandi del player a peso 700 e dimensione almeno 72px.
- Card con border-radius 20px, bordo sottile 1px, nessuna ombra pesante, nessun gradiente viola-blu.
- Icone: SVG inline disegnate a mano con stroke-width 1.75. NON usare emoji come icone.
- Micro-interazioni: transizioni 200ms ease-out, feedback tattile con navigator.vibrate quando disponibile, numeri che fanno un breve scale-up quando cambiano.
- Accessibilità: contrasto AA, aree toccabili minime 44x44px, stati di focus visibili.
- Navigazione: barra in basso fissa con 4 voci — Oggi, Piano, Progressi, Profilo. Il player dell'allenamento è a schermo intero e nasconde la barra.
- Da evitare esplicitamente: hero con gradiente, schede tutte uguali impilate, emoji decorative, testi di riempimento tipo "Benvenuto nel tuo percorso di benessere".

## 3. Modello dati

- Profile: nome, sesso (m/f), dataNascita, altezzaCm, pesoKg, esperienza (mai | meno di 6 mesi | 6-24 mesi | oltre 2 anni), mesiInattivita, obiettivo (forza | ipertrofia | resistenza | dimagrimento | generale), giorniSettimana 2-6, durataSessioneMin (20|30|45|60), attrezzatura, limitazioni, creatoIl
- Equipment: pavimento | sbarra | parallele | anelli | elastici | sedia | zaino | trx
- Exercise: id, nome, pattern, livello, attrezzaturaRichiesta, tipo (reps | tempo), istruzioni, erroriComuni, muscoli
- PatternLevel: pattern, livello, aggiornatoIl
- AssessmentResult: data, pushUp, pullUp, squat, plankSec, deadHangSec, dipOrRow, livelliCalcolati
- Plan: id, creatoIl, settimanaCorrente, split, sessions
- PlannedSession: id, giorno, nome, blocks (exerciseId, serie, repMin, repMax, secondi, recuperoSec)
- WorkoutLog: id, sessionId, data, durataSec, sets (exerciseId, serie, repsFatte, secondiFatti, feedback facile|giusto|difficile), sensazione 1-5, note
- Measurement: data, pesoKg, vitaCm, colloCm, toraceCm, fianchiCm, braccioCm, cosciaCm, polpaccioCm
- Settings: tema, suoni, voce, vibrazione, recuperoAutomatico

## 4. Libreria esercizi: scale di progressione

Questo è il cuore dell'app. Ogni pattern è una scala ordinata: il livello dell'utente in quel pattern è la sua posizione sulla scala. Crea TUTTI gli esercizi elencati, ognuno con istruzioni in 3-5 passaggi, 2-3 errori comuni e muscoli coinvolti, scritti da te.

**spinta_orizzontale** (petto, tricipiti, deltoide anteriore)
1. Push-up al muro — 2. Push-up inclinato alto — 3. Push-up inclinato basso (sedia) — 4. Push-up sulle ginocchia — 5. Push-up completo — 6. Push-up diamante — 7. Push-up declinato (piedi rialzati) — 8. Archer push-up — 9. Pseudo-planche push-up — 10. Push-up a un braccio assistito

**spinta_verticale** (spalle, tricipiti)
1. Pike push-up sulle ginocchia — 2. Pike push-up — 3. Pike push-up piedi rialzati — 4. Negativa di handstand push-up al muro — 5. Handstand push-up al muro — 6. Handstand push-up libero

**dip** (petto basso, tricipiti) — richiede parallele, sedia o anelli
1. Bench dip ginocchia piegate — 2. Bench dip gambe tese — 3. Dip alle parallele assistito con elastico — 4. Dip negativo 5 secondi — 5. Dip completo — 6. Dip con zavorra o agli anelli

**trazione_orizzontale** (dorso, bicipiti) — richiede sbarra bassa, anelli, TRX o tavolo
1. Row inclinato alto — 2. Row a 45 gradi — 3. Row orizzontale — 4. Row con piedi rialzati — 5. Archer row — 6. Row a un braccio assistito

**trazione_verticale** (dorsali, bicipiti) — richiede sbarra o anelli
1. Dead hang — 2. Scapular pull-up — 3. Trazione negativa 5 secondi — 4. Trazione assistita con elastico — 5. Trazione completa — 6. Chin-up zavorrato — 7. Archer pull-up — 8. Trazione a un braccio assistita

**gambe_spinta** (quadricipiti, glutei)
1. Squat assistito con appoggio — 2. Squat a corpo libero — 3. Affondo bulgaro — 4. Affondo bulgaro con pausa 3 secondi — 5. Shrimp squat assistito — 6. Pistol squat su rialzo — 7. Pistol squat completo

**gambe_catena_posteriore** (femorali, glutei)
1. Glute bridge — 2. Hip thrust monopodalico — 3. Good morning a corpo libero — 4. Nordic curl negativo assistito — 5. Nordic curl completo

**core_anteriore**
1. Dead bug — 2. Plank (tempo) — 3. Hollow hold (tempo) — 4. Hanging knee raise — 5. Hanging leg raise — 6. Toes to bar — 7. Dragon flag negativo — 8. Dragon flag

**core_laterale**
1. Side plank sulle ginocchia (tempo) — 2. Side plank (tempo) — 3. Side plank con abduzione — 4. Copenhagen plank (tempo)

**polpacci**
1. Calf raise a due gambe — 2. Calf raise monopodalico — 3. Calf raise monopodalico su rialzo

Ogni esercizio ha un pulsante "Guarda l'esecuzione" che apre in una nuova scheda una ricerca YouTube con il nome dell'esercizio in inglese. Nessun video incorporato, così l'app resta utilizzabile offline.

## 5. Onboarding: wizard a passi, una domanda per schermata

Barra di avanzamento in alto, pulsante indietro sempre disponibile, nessun passo saltabile tranne dove indicato.

1. **Benvenuto** — cosa fa l'app in tre righe, pulsante "Inizia".
2. **Dati personali** — nome, sesso, data di nascita, altezza, peso.
3. **Esperienza** — da quanto ti alleni, da quanti mesi sei fermo.
4. **Obiettivo** — forza / ipertrofia / resistenza / dimagrimento / forma generale.
5. **Disponibilità** — giorni a settimana (2-6), durata per sessione (20/30/45/60 minuti).
6. **Attrezzatura** — selezione multipla con icone: pavimento, sbarra per trazioni, parallele o dip bar, anelli, elastici, sedia o panca, zaino zavorrabile, TRX.
7. **Limitazioni** — selezione multipla: spalla, gomito, polso, schiena, anca, ginocchio, caviglia, nessuna. Ogni limitazione esclude dal piano gli esercizi che caricano quel distretto.
8. **Misurazioni iniziali** (saltabile) — vita, collo, fianchi, torace, braccio, coscia, polpaccio in cm, con un disegno SVG che indica dove misurare.
9. **Test fisici** — schermata introduttiva che spiega le regole: 2 minuti di riposo tra un test e l'altro, fermarsi al cedimento tecnico e non al dolore, inserire il numero reale. Poi un test per schermata, ognuno con cronometro integrato dove serve e con la descrizione della forma corretta:
   - Massimo di push-up consecutivi (indicare se completi o sulle ginocchia)
   - Massimo di trazioni consecutive; se il risultato è 0, chiedi la tenuta in dead hang in secondi
   - Massimo di squat a corpo libero consecutivi
   - Tenuta massima del plank in secondi
   - Massimo di dip se ha parallele o sedia, altrimenti massimo di row orizzontali
   - Hollow hold in secondi (saltabile)
10. **Risultati** — livello calcolato per ogni pattern con una barra orizzontale che mostra la posizione sulla scala di progressione, confronto con le fasce di riferimento per sesso ed età, classificazione complessiva (Principiante / Intermedio / Avanzato / Élite).
11. **Piano generato** — anteprima della prima settimana, pulsante "Inizia il percorso".

## 6. Dalla prestazione al livello: soglie di riferimento

Implementa esattamente questa tabella. Sono fasce orientative per adulti e vanno presentate nell'app come "valori di riferimento, non un verdetto".

- Uomo, push-up completi: 0-9 principiante, 10-24 intermedio, 25-44 avanzato, 45+ élite
- Donna, push-up completi: 0-5, 6-14, 15-29, 30+
- Uomo, trazioni: 0, 1-5, 6-11, 12+ — Donna, trazioni: 0, 1-2, 3-7, 8+
- Squat, entrambi: 0-19, 20-39, 40-59, 60+
- Plank in secondi, entrambi: 0-44, 45-89, 90-179, 180+
- Uomo, dip: 0, 1-7, 8-15, 16+ — Donna, dip: 0, 1-4, 5-10, 11+
- Row orizzontali, entrambi: 0-7, 8-15, 16-25, 26+

Correzione per età applicata alle soglie: fino a 39 anni fattore 1.0; 40-49 fattore 0.85; 50-59 fattore 0.70; 60 e oltre fattore 0.55. Arrotonda per difetto.

Mappatura prestazione → livello di partenza sulla scala del pattern:

- Push-up sulle ginocchia oppure 0 push-up completi → spinta_orizzontale livello 4; 1-7 → livello 5; 8-20 → livello 5 con range di ripetizioni più alto; 21-34 → livello 6; 35+ → livello 7
- Trazioni 0 e dead hang sotto 20s → trazione_verticale livello 1; 0 trazioni e hang da 20s in su → livello 3; 1-2 → livello 4; 3-7 → livello 5; 8-14 → livello 6; 15+ → livello 7
- Squat sotto 20 → gambe_spinta livello 2; 20-39 → livello 2 con ripetizioni alte; 40-59 → livello 3; 60+ → livello 4
- Plank sotto 45s → core_anteriore livello 2; 45-89s → livello 3; 90-179s → livello 4 se ha la sbarra altrimenti 3; 180s+ → livello 5
- Dip 0 → dip livello 1; 1-4 → livello 3; 5-10 → livello 5; 11+ → livello 6
- Row sotto 8 → trazione_orizzontale livello 1; 8-15 → livello 3; 16-25 → livello 4; 26+ → livello 5
- Pattern senza test diretto (spinta_verticale, catena posteriore, core laterale, polpacci): livello derivato dalla media dei pattern testati affini, arrotondata per difetto, con minimo 1

Correzione per inattività: se l'utente è fermo da più di 3 mesi, abbassa di 1 livello tutti i pattern (minimo 1) e per le prime 2 settimane riduci le serie del 30%.

## 7. Generazione del piano

Split in base ai giorni a settimana:
- 2 o 3 giorni → full body, ogni sessione copre spinta, trazione, gambe, core
- 4 giorni → alternanza Upper / Lower
- 5 o 6 giorni → Push / Pull / Legs ripetuto

Numero di esercizi e serie in base alla durata:
- 20 minuti → 4 esercizi, 2-3 serie
- 30 minuti → 5 esercizi, 3 serie
- 45 minuti → 6 esercizi, 3-4 serie
- 60 minuti → 8 esercizi, 4 serie

Selezione dell'esercizio: per ogni pattern previsto dalla sessione prendi l'esercizio al livello corrente dell'utente. Se richiede attrezzatura che non ha, scendi al livello più alto compatibile con la sua attrezzatura. Se una limitazione articolare esclude quell'esercizio, usa l'alternativa più vicina nello stesso pattern.

Serie, ripetizioni e recupero in base all'obiettivo:
- forza: 4-5 serie, 3-6 ripetizioni, recupero 150-180s, sforzo percepito 7-8 su 10
- ipertrofia: 3-4 serie, 6-12 ripetizioni, recupero 90-120s, sforzo 8-9
- resistenza: 3 serie, 15-25 ripetizioni, recupero 45-60s, sforzo 7-8
- dimagrimento: 3-4 serie, 12-20 ripetizioni, recupero 40-60s, struttura a circuito su 2 giri
- generale: 3 serie, 8-15 ripetizioni, recupero 90s

Per gli esercizi a tempo: forza 10-20s, ipertrofia 20-40s, resistenza e dimagrimento 40-60s.

Volume settimanale: mantieni tra 10 e 16 serie allenanti a settimana per gruppo muscolare principale. Se lo split supera questo tetto, riduci le serie degli esercizi accessori.

Ogni sessione include un riscaldamento di 5 minuti (cerchi con le braccia, rotazioni delle spalle, cat-cow, squat lenti a corpo libero, scapular pull-up o scapular push-up) e un defaticamento di 3 minuti con 4 allungamenti.

Ciclo: 4 settimane a volume crescente (settimana 1 di base, +1 serie sui fondamentali dalla settimana 3), settimana 5 di scarico con volume ridotto del 40%, poi proposta di ripetere i test.

## 8. Progressione e adattamento

Doppia progressione, per ogni esercizio:
- Se l'utente completa tutte le serie al limite alto del range con feedback "facile" o "giusto", la volta successiva aggiungi 1 ripetizione per serie.
- Quando raggiunge il limite alto del range su tutte le serie in 2 sessioni consecutive, avanza di 1 livello nella scala del pattern e riparti dal limite basso del range.
- Se in una sessione non raggiunge il limite basso del range su 2 o più serie, togli 1 ripetizione per serie.
- Se succede in 2 sessioni consecutive, scendi di 1 livello nella scala.
- Se l'utente salta più di 10 giorni consecutivi, al rientro riduci il volume del 30% per una settimana e non avanzare di livello.

Dopo ogni serie l'utente dà un feedback con tre pulsanti grandi: Facile / Giusto / Difficile. A fine sessione indica una sensazione generale da 1 a 5 e può lasciare una nota.

Ogni 6 settimane l'app propone di ripetere i test fisici e mostra il confronto con i risultati precedenti.

## 9. Schermate

**Oggi** — data, allenamento previsto con nome e durata stimata, elenco compatto degli esercizi, pulsante primario grande "Inizia allenamento", striscia dei 7 giorni con i giorni completati, serie di giorni consecutivi, barra delle sessioni completate questa settimana. Se è un giorno di riposo, mostra suggerimenti di mobilità e il pulsante "Allenati lo stesso".

**Piano** — vista della settimana con le sessioni, apertura di una sessione, scambio di un esercizio con un'alternativa dello stesso pattern, spostamento di un allenamento a un altro giorno, rigenerazione del piano. Indica in quale settimana del ciclo ci si trova.

**Progressi** — quattro grafici in SVG:
1. Volume settimanale totale (serie per ripetizioni), a barre, ultime 12 settimane
2. Livello per pattern, grafico radar a 6 assi, con confronto tra oggi e il primo test
3. Andamento del peso corporeo e della circonferenza vita, a linea doppia
4. Record personali per esercizio, elenco con data e valore

Più lo storico completo degli allenamenti con filtro e il dettaglio di ogni sessione passata.

**Profilo** — dati personali modificabili, attrezzatura, obiettivo, disponibilità, limitazioni; misurazioni con calcolo automatico di BMI, massa grassa stimata e fabbisogno calorico (formule nella sezione 12); impostazioni (tema, suoni, voce, vibrazione, avvio automatico del recupero); esportazione e importazione dei dati in JSON; pulsante "Carica dati dimostrativi" che genera 8 settimane di storico credibile per vedere i grafici popolati; pulsante "Azzera tutto" con conferma.

## 10. Player dell'allenamento (la schermata più importante)

Schermo intero, sfondo scuro pieno, nessuna barra di navigazione.

- In alto: nome dell'esercizio, indicatore "Esercizio 3 di 6", barra di avanzamento della sessione, pulsante di chiusura con conferma.
- Al centro: numero gigante con le ripetizioni obiettivo, oppure conto alla rovescia per gli esercizi a tempo, dentro un anello di progresso SVG animato.
- Sotto: pallini delle serie (pieni quando completate), peso dello zaino se usato, pulsante "Serie completata".
- Dopo ogni serie: schermata di recupero con conto alla rovescia grande, anello che si svuota, pulsanti -15s / +15s / Salta, anteprima della serie successiva e i tre pulsanti di feedback Facile / Giusto / Difficile.
- Per gli esercizi a ripetizioni l'utente può correggere il numero effettivamente eseguito con un selettore rapido prima di confermare.
- In qualsiasi momento: sostituzione dell'esercizio con un'alternativa, pannello istruzioni che sale dal basso con passaggi ed errori comuni, pausa.
- Audio e feedback: beep generato con Web Audio API al 3-2-1 e alla fine del recupero, vibrazione dove disponibile, voce opzionale con speechSynthesis in italiano che annuncia l'esercizio, l'inizio della serie e la fine del recupero. Tutto disattivabile dalle impostazioni.
- Lo schermo non si spegne durante l'allenamento: usa navigator.wakeLock quando disponibile, gestendo l'errore se non supportato.
- Alla fine: riepilogo con durata, serie totali, ripetizioni totali, record battuti, selettore della sensazione da 1 a 5, campo note e il messaggio di avanzamento di livello se è scattato.

## 11. Stati vuoti ed errori

Ogni schermata ha uno stato vuoto curato, con un'illustrazione SVG semplice e una sola azione chiara. Se localStorage contiene dati di una versione precedente o corrotti, l'app non deve rompersi: mostra un avviso e offri di ripartire da zero o importare un backup.

## 12. Formule per la composizione corporea

- BMI = peso in kg diviso l'altezza in metri al quadrato.
- Massa grassa stimata, formula US Navy in centimetri:
  - uomo: 495 / (1.0324 − 0.19077 × log10(vita − collo) + 0.15456 × log10(altezza)) − 450
  - donna: 495 / (1.29579 − 0.35004 × log10(vita + fianchi − collo) + 0.22100 × log10(altezza)) − 450
  - Mostrala solo se le misure necessarie sono state inserite, sempre con l'etichetta "stima".
- Metabolismo basale, Mifflin-St Jeor: uomo 10×kg + 6.25×cm − 5×età + 5; donna 10×kg + 6.25×cm − 5×età − 161. Fabbisogno giornaliero = basale × fattore di attività (sedentario 1.2, leggero 1.375, moderato 1.55, intenso 1.725) scelto dall'utente.

## 13. Criteri di accettazione

L'app è completa quando: si può completare tutto l'onboarding con i test e ottenere un piano coerente con attrezzatura e livello; si può eseguire un allenamento intero nel player con timer e recupero funzionanti; i dati sopravvivono al ricaricamento della pagina; il piano avanza automaticamente dopo sessioni facili e regredisce dopo sessioni fallite; i grafici mostrano dati reali; esportazione e importazione JSON funzionano; i dati dimostrativi popolano tutte le schermate; non esistono schermate vuote, pulsanti finti o funzioni dichiarate ma non implementate.

Scrivi il codice completo di tutti i file. Non lasciare segnaposto, TODO o funzioni vuote.
