/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Exercise } from '../types';

export const EXERCISES: Exercise[] = [
  // ==========================================
  // SPINTA ORIZZONTALE (1 - 10)
  // ==========================================
  {
    id: 'pushup_muro',
    nome: 'Push-up al muro',
    nomeInglese: 'Wall push-up',
    pattern: 'spinta_orizzontale',
    livello: 1,
    attrezzaturaRichiesta: ['pavimento'],
    limitazioniEscluse: [],
    tipo: 'reps',
    unilaterale: false,
    istruzioni: [
      'Posizionati a circa un metro da una parete solida con i piedi uniti.',
      'Appoggia i palmi al muro all’altezza e larghezza delle spalle.',
      'Piega i gomiti a 45 gradi scendendo fino a sfiorare la parete con il petto.',
      'Spingi con forza mantenendo il corpo dritto fino a distendere le braccia.'
    ],
    erroriComuni: [
      'Inarcare la schiena durante la spinta.',
      'Allargare eccessivamente i gomiti verso l’esterno a 90 gradi.'
    ],
    muscoli: ['Pettorali', 'Tricipiti', 'Deltoide anteriore']
  },
  {
    id: 'pushup_inclinato_alto',
    nome: 'Push-up inclinato alto',
    nomeInglese: 'High incline push-up',
    pattern: 'spinta_orizzontale',
    livello: 2,
    attrezzaturaRichiesta: ['sedia'],
    limitazioniEscluse: ['polso'],
    tipo: 'reps',
    unilaterale: false,
    istruzioni: [
      'Appoggia le mani sul piano di un tavolo o davanzale stabile.',
      'Estendi le gambe indietro formando una linea retta dalle caviglie alle spalle.',
      'Scendi controllando il movimento finché lo sterno tocca il bordo.',
      'Distendi le braccia contraendo petto e glutei al vertice.'
    ],
    erroriComuni: [
      'Lasciar cadere il bacino in avanti (iperestensione lombare).',
      'Non raggiungere la completa estensione dei gomiti.'
    ],
    muscoli: ['Gran pettorale', 'Tricipiti', 'Addome']
  },
  {
    id: 'pushup_inclinato_basso',
    nome: 'Push-up inclinato basso (sedia)',
    nomeInglese: 'Incline push-up chair',
    pattern: 'spinta_orizzontale',
    livello: 3,
    attrezzaturaRichiesta: ['sedia'],
    limitazioniEscluse: ['polso'],
    tipo: 'reps',
    unilaterale: false,
    istruzioni: [
      'Posiziona le mani sul bordo di una sedia stabile o panca (circa 40-50 cm).',
      'Attiva addome e glutei in plank rigido.',
      'Scendi toccando la seduta con la parte inferiore del petto.',
      'Spingi tornando alla posizione di plank alto senza muovere la testa.'
    ],
    erroriComuni: [
      'Ciondolare la testa in avanti per simulare profondità.',
      'Perdere la tensione della parete addominale.'
    ],
    muscoli: ['Pettorali', 'Tricipiti', 'Core']
  },
  {
    id: 'pushup_ginocchia',
    nome: 'Push-up sulle ginocchia',
    nomeInglese: 'Knee push-up',
    pattern: 'spinta_orizzontale',
    livello: 4,
    attrezzaturaRichiesta: ['pavimento'],
    limitazioniEscluse: ['polso'],
    tipo: 'reps',
    unilaterale: false,
    istruzioni: [
      'In ginocchio a terra con le mani poco più larghe delle spalle.',
      'Porta il bacino avanti allineando cosce e busto in una diagonale.',
      'Fletti le braccia fino a portare il petto a 2 cm dal pavimento.',
      'Ritorna in spinta completa bloccando le scapole in protrazione.'
    ],
    erroriComuni: [
      'Mantenere i glutei indietro a 90 gradi con le ginocchia.',
      'Gomiti che si aprono a forma di T invece che a freccia.'
    ],
    muscoli: ['Pettorali', 'Tricipiti', 'Spalle']
  },
  {
    id: 'pushup_completo',
    nome: 'Push-up completo',
    nomeInglese: 'Standard push-up',
    pattern: 'spinta_orizzontale',
    livello: 5,
    attrezzaturaRichiesta: ['pavimento'],
    limitazioniEscluse: ['polso', 'gomito'],
    tipo: 'reps',
    unilaterale: false,
    istruzioni: [
      'Plank a terra su mani e avampiedi, dita aperte rivolte in avanti.',
      'Contrai glutei e addome per una retroversione del bacino (hollow body).',
      'Scendi inspirando fino a toccare leggermente il pavimento con il petto.',
      'Spingi vigorosamente espirando finendo con scapole separate e protruse.'
    ],
    erroriComuni: [
      'Toccamento a terra prima con la pancia anziché con il petto.',
      'Mancata protrazione scapolare al termine della ripetizione.'
    ],
    muscoli: ['Pettorali', 'Tricipiti', 'Dentato anteriore', 'Core']
  },
  {
    id: 'pushup_diamante',
    nome: 'Push-up diamante',
    nomeInglese: 'Diamond push-up',
    pattern: 'spinta_orizzontale',
    livello: 6,
    attrezzaturaRichiesta: ['pavimento'],
    limitazioniEscluse: ['polso', 'gomito'],
    tipo: 'reps',
    unilaterale: false,
    istruzioni: [
      'Posiziona le mani a terra unendo indici e pollici a forma di triangolo sotto il centro del petto.',
      'Mantieni il corpo rigido e compatto.',
      'Scendi portando lo sterno a contatto con il triangolo delle mani.',
      'Spingi facendo perno sulla massima estensione dei tricipiti.'
    ],
    erroriComuni: [
      'Allargare i gomiti causando sovraccarico sui legamenti del polso.',
      'Spezzare la linea dell’anca durante la risalita.'
    ],
    muscoli: ['Tricipiti brachiali', 'Parte interna del petto', 'Spalle']
  },
  {
    id: 'pushup_declinato',
    nome: 'Push-up declinato (piedi rialzati)',
    nomeInglese: 'Decline push-up',
    pattern: 'spinta_orizzontale',
    livello: 7,
    attrezzaturaRichiesta: ['sedia'],
    limitazioniEscluse: ['polso', 'spalla'],
    tipo: 'reps',
    unilaterale: false,
    istruzioni: [
      'Appoggia le dita dei piedi su una panca o sedia e le mani a terra.',
      'Attiva il core per contrastare la naturale tendenza ad inarcare la zona lombare.',
      'Scendi con controllo portando la testa vicino al suolo prima delle mani.',
      'Spingi concentrando il lavoro sulla parte clavicolare del pettorale.'
    ],
    erroriComuni: [
      'Iperestensione del collo per cercare il pavimento.',
      'Inarcamento lombare per compensare la mancanza di forza anteriore.'
    ],
    muscoli: ['Pettorale clavicolare (alto)', 'Deltoide anteriore', 'Tricipiti']
  },
  {
    id: 'pushup_archer',
    nome: 'Archer push-up',
    nomeInglese: 'Archer push-up',
    pattern: 'spinta_orizzontale',
    livello: 8,
    attrezzaturaRichiesta: ['pavimento'],
    limitazioniEscluse: ['polso', 'gomito', 'spalla'],
    tipo: 'reps',
    unilaterale: true,
    istruzioni: [
      'Posiziona le mani molto distanziate sul pavimento con le dita rivolte verso l’esterno.',
      'Sposta il corpo lateralmente scendendo solo sul braccio attivo.',
      'Il braccio opposto si distende completamente lungo il fianco come un arco.',
      'Spingi per tornare al centro e ripeti sul lato opposto.'
    ],
    erroriComuni: [
      'Piegare anche il braccio di supporto invece di mantenerlo teso.',
      'Ruotare il busto perdendo l’allineamento orizzontale.'
    ],
    muscoli: ['Pettorali unilaterali', 'Tricipiti', 'Stabilizzatori scapolari']
  },
  {
    id: 'pushup_pseudo_planche',
    nome: 'Pseudo-planche push-up',
    nomeInglese: 'Pseudo planche push-up',
    pattern: 'spinta_orizzontale',
    livello: 9,
    attrezzaturaRichiesta: ['pavimento'],
    limitazioniEscluse: ['polso', 'gomito', 'spalla'],
    tipo: 'reps',
    unilaterale: false,
    istruzioni: [
      'Mani a terra all’altezza dei fianchi con le dita leggermente ruotate verso l’esterno.',
      'Sbilancia il corpo in avanti finché le spalle superano nettamente i polsi.',
      'Scendi mantenendo costantemente il massimo sbilanciamento anteriore.',
      'Risali spingendo forte e chiudi in protrazione scapolare massima.'
    ],
    erroriComuni: [
      'Arretrare con il bacino durante la discesa riducendo la leva.',
      'Perdere la protrazione scapolare nella fase concentrica.'
    ],
    muscoli: ['Deltoidi anteriori', 'Pettorali', 'Tendine bicipitale', 'Core']
  },
  {
    id: 'pushup_un_braccio_assistito',
    nome: 'Push-up a un braccio assistito',
    nomeInglese: 'Assisted one arm push-up',
    pattern: 'spinta_orizzontale',
    livello: 10,
    attrezzaturaRichiesta: ['pavimento'],
    limitazioniEscluse: ['polso', 'gomito', 'spalla'],
    tipo: 'reps',
    unilaterale: true,
    istruzioni: [
      'Allarga i piedi al doppio della larghezza spalle per stabilizzare il bacino.',
      'Posiziona una mano centrata sotto il torace e l’altra su un rialzo o solo sui polpastrelli lontani.',
      'Scendi controllando la torsione del busto con il braccio primario.',
      'Spingi con esplosività per completare la ripetizione senza oscillare.'
    ],
    erroriComuni: [
      'Ruotare le anche aprendole di lato.',
      'Scaricare troppo peso sulla mano assistiva.'
    ],
    muscoli: ['Pettorale unilaterale', 'Tricipite', 'Obliqui e Core profondo']
  },

  // ==========================================
  // SPINTA VERTICALE (1 - 6)
  // ==========================================
  {
    id: 'pike_pushup_ginocchia',
    nome: 'Pike push-up sulle ginocchia',
    nomeInglese: 'Knee pike push-up',
    pattern: 'spinta_verticale',
    livello: 1,
    attrezzaturaRichiesta: ['pavimento'],
    limitazioniEscluse: ['spalla'],
    tipo: 'reps',
    unilaterale: false,
    istruzioni: [
      'In ginocchio, porta le mani a terra a circa 50 cm dalle ginocchia.',
      'Solleva i glutei in alto formando una V invertita mantenendo le ginocchia a contatto con il suolo.',
      'Fletti i gomiti portando la testa in avanti rispetto alle mani, formando un triangolo.',
      'Spingi in alto e indietro tornando a spingere con la testa tra le braccia.'
    ],
    erroriComuni: [
      'Scendere con la testa direttamente tra le mani anziché avanti.',
      'Non bloccare le spalle in spinta attiva al vertice.'
    ],
    muscoli: ['Deltoidi', 'Tricipiti', 'Trapezio superiore']
  },
  {
    id: 'pike_pushup',
    nome: 'Pike push-up',
    nomeInglese: 'Pike push-up',
    pattern: 'spinta_verticale',
    livello: 2,
    attrezzaturaRichiesta: ['pavimento'],
    limitazioniEscluse: ['spalla', 'polso'],
    tipo: 'reps',
    unilaterale: false,
    istruzioni: [
      'Posizione a V rovesciata classica con gambe tese e piedi sugli avampiedi.',
      'Porta il bacino il più possibile sopra la perpendicolare delle spalle.',
      'Scendi portando la testa in avanti formando un tripode (vertice oltre le mani).',
      'Spingi indietro e verso l’alto allineando braccia, tronco e testa.'
    ],
    erroriComuni: [
      'Piegare le ginocchia o arretrare con i piedi.',
      'Gomiti svasati all’esterno invece di puntare a 45 gradi indietro.'
    ],
    muscoli: ['Deltoidi anteriori e mediali', 'Tricipiti', 'Dentato anteriore']
  },
  {
    id: 'pike_pushup_rialzati',
    nome: 'Pike push-up piedi rialzati',
    nomeInglese: 'Elevated feet pike push-up',
    pattern: 'spinta_verticale',
    livello: 3,
    attrezzaturaRichiesta: ['sedia'],
    limitazioniEscluse: ['spalla', 'polso'],
    tipo: 'reps',
    unilaterale: false,
    istruzioni: [
      'Piedi su una panca o sedia stabile, mani a terra vicine alla base del rialzo.',
      'Cammina con le mani indietro finché il busto è il più verticale possibile.',
      'Scendi controllando il peso fino a sfiorare il suolo con la fronte davanti alle mani.',
      'Spingi fino a incastrare la testa tra le spalle a braccia tese.'
    ],
    erroriComuni: [
      'Distanziarsi troppo dalla sedia perdendo l’angolo verticale.',
      'Crollare velocemente nella fase eccentrica.'
    ],
    muscoli: ['Deltoidi', 'Tricipiti', 'Trapezi']
  },
  {
    id: 'hspu_negativa_muro',
    nome: 'Negativa di handstand push-up al muro',
    nomeInglese: 'Wall handstand push-up negative',
    pattern: 'spinta_verticale',
    livello: 4,
    attrezzaturaRichiesta: ['pavimento'],
    limitazioniEscluse: ['spalla', 'polso'],
    tipo: 'reps',
    unilaterale: false,
    istruzioni: [
      'Lanciati in verticale contro il muro a pancia rivolta al muro (o schiena al muro se preferito).',
      'Corpo teso a banana rovesciata o dritto con glutei stretti.',
      'Inizia una discesa ultra-controllata di 5-7 secondi verso il pavimento.',
      'Tocca con controllo il pavimento con la testa, scendi e ripeti.'
    ],
    erroriComuni: [
      'Cadere bruscamente negli ultimi 10 centimetri di discesa.',
      'Allargare i gomiti a 90 gradi mettendo a rischio le spalle.'
    ],
    muscoli: ['Deltoidi completi', 'Tricipiti', 'Flessori ed estensori della spalla']
  },
  {
    id: 'hspu_muro',
    nome: 'Handstand push-up al muro',
    nomeInglese: 'Wall handstand push-up',
    pattern: 'spinta_verticale',
    livello: 5,
    attrezzaturaRichiesta: ['pavimento'],
    limitazioniEscluse: ['spalla', 'polso', 'gomito'],
    tipo: 'reps',
    unilaterale: false,
    istruzioni: [
      'In verticale al muro, mani a circa 20 cm dalla parete.',
      'Scendi controllando la traiettoria con la testa che atterra in avanti.',
      'Tocca leggermente il suolo con il capo senza scaricare il peso.',
      'Spingi con tutta la forza fino al blocco articolare completo in elevazione scapolare.'
    ],
    erroriComuni: [
      'Utilizzare il rimbalzo della testa sul pavimento.',
      'Inarcare eccessivamente la colonna lombare durante la spinta.'
    ],
    muscoli: ['Deltoidi', 'Tricipiti', 'Trapezio', 'Core']
  },
  {
    id: 'hspu_libero',
    nome: 'Handstand push-up libero',
    nomeInglese: 'Freestanding handstand push-up',
    pattern: 'spinta_verticale',
    livello: 6,
    attrezzaturaRichiesta: ['pavimento'],
    limitazioniEscluse: ['spalla', 'polso', 'gomito'],
    tipo: 'reps',
    unilaterale: false,
    istruzioni: [
      'Entra in verticale libera mantenendo perfetto equilibrio sui polpastrelli.',
      'Sbilancia leggermente le spalle avanti mentre fletti i gomiti verso il centro.',
      'Raggiungi la profondità mantenendo la linea delle gambe compatta.',
      'Spingi tornando alla verticale bilanciata senza toccare a terra coi piedi.'
    ],
    erroriComuni: [
      'Perdere l’equilibrio sagittale durante la fase di cambio direzione.',
      'Mancata coordinazione dell’assetto del bacino.'
    ],
    muscoli: ['Deltoidi', 'Tricipiti', 'Stabilizzatori polso', 'Core globale']
  },

  // ==========================================
  // DIP (1 - 6)
  // ==========================================
  {
    id: 'bench_dip_ginocchia',
    nome: 'Bench dip ginocchia piegate',
    nomeInglese: 'Bent knee bench dip',
    pattern: 'dip',
    livello: 1,
    attrezzaturaRichiesta: ['sedia'],
    limitazioniEscluse: ['spalla'],
    tipo: 'reps',
    unilaterale: false,
    istruzioni: [
      'Siediti sul bordo di una sedia salda e poggia i palmi ai lati dei fianchi.',
      'Sposta il bacino oltre il bordo mantenendo le ginocchia flesse a 90 gradi e piedi a terra.',
      'Scendi flettendo i gomiti fino a circa 90 gradi mantenendo la schiena vicina alla sedia.',
      'Spingi sui palmi per tornare a braccia distese espirando.'
    ],
    erroriComuni: [
      'Allontanare troppo il bacino dalla sedia sovraccaricando la spalla.',
      'Incassare il collo tra le spalle.'
    ],
    muscoli: ['Tricipiti', 'Deltoide anteriore', 'Pettorale inferiore']
  },
  {
    id: 'bench_dip_tese',
    nome: 'Bench dip gambe tese',
    nomeInglese: 'Straight leg bench dip',
    pattern: 'dip',
    livello: 2,
    attrezzaturaRichiesta: ['sedia'],
    limitazioniEscluse: ['spalla'],
    tipo: 'reps',
    unilaterale: false,
    istruzioni: [
      'Mani sul bordo della sedia, ma questa volta allunga le gambe tese poggiando solo i talloni.',
      'Scendi verticalmente con il busto vicino alla sedia fino a 90° al gomito.',
      'Mantieni le spalle depresse e aperte.',
      'Spingi estendendo i gomiti con contrazione di picco dei tricipiti.'
    ],
    erroriComuni: [
      'Scendere oltre la mobilità naturale della spalla causando pizzicamento.',
      'Slanciare il bacino in avanti con le gambe.'
    ],
    muscoli: ['Tricipiti', 'Gran pettorale basso', 'Spalle']
  },
  {
    id: 'dip_parallele_elastico',
    nome: 'Dip alle parallele assistito con elastico',
    nomeInglese: 'Band assisted dip',
    pattern: 'dip',
    livello: 3,
    attrezzaturaRichiesta: ['parallele', 'elastici'],
    limitazioniEscluse: ['spalla', 'gomito'],
    tipo: 'reps',
    unilaterale: false,
    istruzioni: [
      'Fissa una fascia elastica robusta tra le due sbarre parallele.',
      'Appoggia le ginocchia o un piede sull’elastico e sollevati a braccia distese.',
      'Scendi con busto leggermente inclinato in avanti finché la spalla è al livello del gomito.',
      'Spingi tornando in appoggio completo a braccia bloccate.'
    ],
    erroriComuni: [
      'Lasciarsi rimbalzare sul punto morto inferiore con l’elastico.',
      'Perdere la depressione scapolare in alto.'
    ],
    muscoli: ['Pettorale basso', 'Tricipiti', 'Deltoide anteriore']
  },
  {
    id: 'dip_negativo_5s',
    nome: 'Dip negativo 5 secondi',
    nomeInglese: '5 second dip negative',
    pattern: 'dip',
    livello: 4,
    attrezzaturaRichiesta: ['parallele'],
    limitazioniEscluse: ['spalla', 'gomito'],
    tipo: 'reps',
    unilaterale: false,
    istruzioni: [
      'Salta direttamente in cima alle parallele con le braccia distese.',
      'Deprimi con decisione le spalle verso il basso.',
      'Inizia una discesa lentissima contando mentalmente 5 secondi pieni fino a 90 gradi.',
      'Poggia i piedi a terra con delicatezza, risali con un salto e ripeti.'
    ],
    erroriComuni: [
      'Scendere troppo velocemente dopo i primi due secondi.',
      'Inclinare la testa all’indietro.'
    ],
    muscoli: ['Tricipiti', 'Fibre sternocostali pettorale', 'Spalle']
  },
  {
    id: 'dip_completo',
    nome: 'Dip completo',
    nomeInglese: 'Parallel bar dip',
    pattern: 'dip',
    livello: 5,
    attrezzaturaRichiesta: ['parallele'],
    limitazioniEscluse: ['spalla', 'gomito'],
    tipo: 'reps',
    unilaterale: false,
    istruzioni: [
      'Sospenditi alle parallele con braccia distese e sguardo avanti.',
      'Inclina il busto di circa 15-20 gradi per focalizzare il lavoro sul petto.',
      'Scendi controllando fino a formare un angolo di 90° tra braccio e avambraccio.',
      'Spingi vigorosamente risalendo alla posizione iniziale senza dondolare.'
    ],
    erroriComuni: [
      'Fermarsi a metà discesa con gomiti poco piegati.',
      'Oscillare avanti e indietro con le gambe per sfruttare l’inerzia.'
    ],
    muscoli: ['Pettorali inferiori', 'Tricipiti', 'Spalle anteriori']
  },
  {
    id: 'dip_zavorrato_anelli',
    nome: 'Dip con zavorra o agli anelli',
    nomeInglese: 'Ring dip or weighted dip',
    pattern: 'dip',
    livello: 6,
    attrezzaturaRichiesta: ['parallele', 'zaino'],
    limitazioniEscluse: ['spalla', 'gomito', 'polso'],
    tipo: 'reps',
    unilaterale: false,
    istruzioni: [
      'Indossa uno zaino zavorrato o usa anelli da ginnastica.',
      'Se agli anelli: stabilizza la presa ruotando i pollici all’esterno a braccia tese (RTO).',
      'Scendi mantenendo gli anelli vicini ai fianchi con controllo millimetrico.',
      'Spingi estendendo le braccia e ruotando nuovamente i palmi in fuori.'
    ],
    erroriComuni: [
      'Lasciar allontanare gli anelli dal corpo durante la discesa.',
      'Caricare zavorra eccessiva perdendo la profondità fisiologica.'
    ],
    muscoli: ['Pettorali', 'Tricipiti', 'Stabilizzatori della cuffia dei rotatori']
  },

  // ==========================================
  // TRAZIONE ORIZZONTALE (1 - 6)
  // ==========================================
  {
    id: 'row_inclinato_alto',
    nome: 'Row inclinato alto',
    nomeInglese: 'High incline inverted row',
    pattern: 'trazione_orizzontale',
    livello: 1,
    attrezzaturaRichiesta: ['sbarra'],
    limitazioniEscluse: [],
    tipo: 'reps',
    unilaterale: false,
    istruzioni: [
      'Impugna una sbarra bassa o corda/TRX posizionando i piedi avanti.',
      'Il corpo è inclinato a circa 60-70 gradi rispetto al suolo.',
      'Retrai le scapole e tira il petto verso le mani flettendo i gomiti indietro.',
      'Ritorna a braccia tese controllando la discesa.'
    ],
    erroriComuni: [
      'Tirare solo di bicipiti senza addurre le scapole.',
      'Piegare il bacino a cerniera anziché mantenere una linea retta.'
    ],
    muscoli: ['Romboidi', 'Trapezio medio', 'Bicipiti']
  },
  {
    id: 'row_45_gradi',
    nome: 'Row a 45 gradi',
    nomeInglese: '45 degree inverted row',
    pattern: 'trazione_orizzontale',
    livello: 2,
    attrezzaturaRichiesta: ['sbarra'],
    limitazioniEscluse: ['gomito'],
    tipo: 'reps',
    unilaterale: false,
    istruzioni: [
      'Porta i piedi più avanti sotto la sbarra fino a formare 45° con il pavimento.',
      'Glutei contratti e talloni saldamente piantati a terra.',
      'Tira lo sterno verso la sbarra aprendo il petto al vertice.',
      'Rilassa controllando fino a sentire le scapole allungarsi.'
    ],
    erroriComuni: [
      'Slancio con il bacino per superare il punto critico.',
      'Spalle che salgono verso le orecchie.'
    ],
    muscoli: ['Dorsali', 'Romboidi', 'Deltoidi posteriori', 'Bicipiti']
  },
  {
    id: 'row_orizzontale',
    nome: 'Row orizzontale',
    nomeInglese: 'Horizontal inverted row',
    pattern: 'trazione_orizzontale',
    livello: 3,
    attrezzaturaRichiesta: ['sbarra'],
    limitazioniEscluse: ['gomito'],
    tipo: 'reps',
    unilaterale: false,
    istruzioni: [
      'Regola la sbarra all’altezza del bacino; sdraiati sotto con talloni a terra.',
      'Corpo parallelo al pavimento a braccia distese.',
      'Tira portando il petto a contatto con la sbarra con scapole unite.',
      'Scendi con una fase eccentrica di 2 secondi fino a braccia tese.'
    ],
    erroriComuni: [
      'Non toccare la sbarra con il petto troncando il range.',
      'Incurvare le spalle in avanti al termine della salita.'
    ],
    muscoli: ['Gran dorsale', 'Trapezio medio e inferiore', 'Bicipiti', 'Core']
  },
  {
    id: 'row_piedi_rialzati',
    nome: 'Row con piedi rialzati',
    nomeInglese: 'Elevated feet inverted row',
    pattern: 'trazione_orizzontale',
    livello: 4,
    attrezzaturaRichiesta: ['sbarra', 'sedia'],
    limitazioniEscluse: ['gomito'],
    tipo: 'reps',
    unilaterale: false,
    istruzioni: [
      'Appoggia i talloni su una panca o sedia alla stessa altezza delle mani.',
      'Il corpo è perfettamente orizzontale all’inizio del movimento.',
      'Tira verso il petto sollevando l’intero peso corporeo con la schiena.',
      'Mantieni un secondo di contrazione isometrica prima di scendere.'
    ],
    erroriComuni: [
      'Lasciar scendere il bacino perdendo l’orizzontalità.',
      'Staccare i talloni dal rialzo.'
    ],
    muscoli: ['Trapezi', 'Romboidi', 'Dorsali', 'Glutei e lombari']
  },
  {
    id: 'row_archer',
    nome: 'Archer row',
    nomeInglese: 'Archer inverted row',
    pattern: 'trazione_orizzontale',
    livello: 5,
    attrezzaturaRichiesta: ['anelli'],
    limitazioniEscluse: ['gomito', 'spalla'],
    tipo: 'reps',
    unilaterale: true,
    istruzioni: [
      'Usa anelli o una sbarra larga in orizzontale.',
      'Tira flettendo un solo braccio verso il petto mentre l’altro si distende lateralmente.',
      'Tutto il carico di trazione si concentra sul braccio primario.',
      'Ritorna al centro con controllo e alterna le braccia.'
    ],
    erroriComuni: [
      'Piegare il braccio disteso usandolo come spinta.',
      'Ruotare il bacino eccessivamente.'
    ],
    muscoli: ['Dorsale unilaterale', 'Bicipiti', 'Stabilizzatori della scapola']
  },
  {
    id: 'row_un_braccio_assistito',
    nome: 'Row a un braccio assistito',
    nomeInglese: 'Assisted one arm row',
    pattern: 'trazione_orizzontale',
    livello: 6,
    attrezzaturaRichiesta: ['anelli'],
    limitazioniEscluse: ['gomito', 'spalla', 'polso'],
    tipo: 'reps',
    unilaterale: true,
    istruzioni: [
      'Impugna un anello con una mano e tieni una cordicella o elastico con l’altra mano d’aiuto.',
      'Mantieni il busto quadrato senza torsione eccessiva.',
      'Tira il gomito attivo indietro rasente al costato fino a toccare con la mano il petto.',
      'Scendi lentamente ruotando leggermente in allungamento dorsale.'
    ],
    erroriComuni: [
      'Tirare energicamente con il braccio assistente.',
      'Slancio brusco del corpo con torsione del tronco.'
    ],
    muscoli: ['Gran dorsale profondo', 'Bicipite brachiale', 'Addome e obliqui']
  },

  // ==========================================
  // TRAZIONE VERTICALE (1 - 8)
  // ==========================================
  {
    id: 'dead_hang',
    nome: 'Dead hang',
    nomeInglese: 'Dead hang',
    pattern: 'trazione_verticale',
    livello: 1,
    attrezzaturaRichiesta: ['sbarra'],
    limitazioniEscluse: ['spalla'],
    tipo: 'tempo',
    unilaterale: false,
    istruzioni: [
      'Salta alla sbarra con presa prona poco più larga delle spalle.',
      'Rilassa le gambe lasciandole sospese a piedi uniti.',
      'Consenti alle spalle di allungarsi passivamente verso l’alto (decompressione).',
      'Respira con il diaframma mantenendo la presa salda con le dita.'
    ],
    erroriComuni: [
      'Trattenere il fiato creando ipertensione toracica.',
      'Oscillare o scalciare con le gambe.'
    ],
    muscoli: ['Avambracci (flessori delle dita)', 'Dorsali', 'Cuffia dei rotatori']
  },
  {
    id: 'scapular_pullup',
    nome: 'Scapular pull-up',
    nomeInglese: 'Scapular pull-up',
    pattern: 'trazione_verticale',
    livello: 2,
    attrezzaturaRichiesta: ['sbarra'],
    limitazioniEscluse: ['spalla'],
    tipo: 'reps',
    unilaterale: false,
    istruzioni: [
      'Appeso alla sbarra a braccia rigorosamente tese.',
      'Senza piegare minimamente i gomiti, abbassa le spalle e unisci le scapole (depressione e adduzione).',
      'Il petto sale di circa 5-10 cm verso la sbarra.',
      'Trattieni un secondo in cima e torna lentamente nel dead hang attivo.'
    ],
    erroriComuni: [
      'Piegare le braccia trasformandolo in un mezzo chin-up.',
      'Alzare le spalle vicino alle orecchie.'
    ],
    muscoli: ['Trapezio inferiore', 'Dentato anteriore', 'Grande rotondo']
  },
  {
    id: 'trazione_negativa_5s',
    nome: 'Trazione negativa 5 secondi',
    nomeInglese: '5 second pull-up negative',
    pattern: 'trazione_verticale',
    livello: 3,
    attrezzaturaRichiesta: ['sbarra'],
    limitazioniEscluse: ['gomito', 'spalla'],
    tipo: 'reps',
    unilaterale: false,
    istruzioni: [
      'Usa un gradino o un salto per portare il mento sopra la sbarra con presa prona.',
      'Stabilizza il corpo evitando oscillazioni, stringi i glutei.',
      'Inizia una discesa progressiva e costante contando 5 secondi interi.',
      'Arriva alla completa estensione delle braccia prima di toccare terra coi piedi.'
    ],
    erroriComuni: [
      'Accelerare la discesa nella parte finale del movimento.',
      'Inarcare la schiena all’indietro.'
    ],
    muscoli: ['Gran dorsale', 'Bicipiti', 'Brachioradiale', 'Core']
  },
  {
    id: 'trazione_elastico',
    nome: 'Trazione assistita con elastico',
    nomeInglese: 'Band assisted pull-up',
    pattern: 'trazione_verticale',
    livello: 4,
    attrezzaturaRichiesta: ['sbarra', 'elastici'],
    limitazioniEscluse: ['gomito'],
    tipo: 'reps',
    unilaterale: false,
    istruzioni: [
      'Annoda un elastico alla sbarra e infila un piede o un ginocchio nel cappio.',
      'Parti da braccia completamente distese con corpo allineato.',
      'Attiva le scapole e tira con forza fino a superare nettamente la sbarra con il mento.',
      'Riscendi lentamente sfruttando l’elasticità senza farti rimbalzare.'
    ],
    erroriComuni: [
      'Calciare con la gamba per farsi lanciare dall’elastico.',
      'Non completare il lockout in basso.'
    ],
    muscoli: ['Gran dorsale', 'Bicipiti', 'Deltoidi posteriori']
  },
  {
    id: 'trazione_completa',
    nome: 'Trazione completa',
    nomeInglese: 'Pull-up',
    pattern: 'trazione_verticale',
    livello: 5,
    attrezzaturaRichiesta: ['sbarra'],
    limitazioniEscluse: ['gomito', 'spalla'],
    tipo: 'reps',
    unilaterale: false,
    istruzioni: [
      'Presa prona poco più ampia delle spalle, sospensione a braccia tese.',
      'Avvia il movimento deprimendo le scapole e portando il petto verso l’alto.',
      'Tira i gomiti verso le tasche posteriori fino a oltrepassare la sbarra con il mento.',
      'Riscendi in controllo fino alla distensione completa delle braccia.'
    ],
    erroriComuni: [
      'Kipping o sfarfallio con le gambe per darsi lo slancio.',
      'Accorciare il range evitando di distendere le braccia a ogni rep.'
    ],
    muscoli: ['Gran dorsale', 'Grande rotondo', 'Bicipite', 'Romboidi']
  },
  {
    id: 'chinup_zavorrato',
    nome: 'Chin-up zavorrato',
    nomeInglese: 'Weighted chin-up',
    pattern: 'trazione_verticale',
    livello: 6,
    attrezzaturaRichiesta: ['sbarra', 'zaino'],
    limitazioniEscluse: ['gomito', 'spalla'],
    tipo: 'reps',
    unilaterale: false,
    istruzioni: [
      'Indossa uno zaino zavorrato o cintura con carico. Presa supina alla larghezza spalle.',
      'Da braccia tese tira compatto concentrando il lavoro su bicipiti e dorsali.',
      'Porta il mento sopra la sbarra toccando la sbarra con la parte superiore del petto.',
      'Scendi con precisione in 2-3 secondi fino a gomiti estesi.'
    ],
    erroriComuni: [
      'Sollevare le ginocchia per ridurre il carico percepito.',
      'Estensione parziale del braccio per non perdere il reclutamento muscolare.'
    ],
    muscoli: ['Bicipite brachiale', 'Gran dorsale', 'Brachiale']
  },
  {
    id: 'archer_pullup',
    nome: 'Archer pull-up',
    nomeInglese: 'Archer pull-up',
    pattern: 'trazione_verticale',
    livello: 7,
    attrezzaturaRichiesta: ['sbarra'],
    limitazioniEscluse: ['gomito', 'spalla'],
    tipo: 'reps',
    unilaterale: true,
    istruzioni: [
      'Presa molto larga sulla sbarra.',
      'Tira il corpo verso una delle due mani mentre l’altro braccio scorre sopra la sbarra teso.',
      'Il braccio disteso assiste solo leggermente.',
      'Torna al centro e abbassati con controllo. Alterna i lati.'
    ],
    erroriComuni: [
      'Piegare il braccio secondario invece di mantenerlo teso.',
      'Cadere velocemente dal lato della mano attiva.'
    ],
    muscoli: ['Dorsale monolaterale', 'Brachiale', 'Cuffia rotatori']
  },
  {
    id: 'trazione_un_braccio_assistita',
    nome: 'Trazione a un braccio assistita',
    nomeInglese: 'Assisted one arm pull-up',
    pattern: 'trazione_verticale',
    livello: 8,
    attrezzaturaRichiesta: ['sbarra', 'elastici'],
    limitazioniEscluse: ['gomito', 'spalla', 'polso'],
    tipo: 'reps',
    unilaterale: true,
    istruzioni: [
      'Una mano alla sbarra (presa supina o semiprona), l’altra afferra una fettuccia/elastico più in basso.',
      'Tira con il braccio primario portando il mento oltre il livello della sbarra.',
      'Mantieni il core e i dorsali serrati contro la rotazione corporea.',
      'Riscendi lentamente fino alla massima estensione.'
    ],
    erroriComuni: [
      'Tirare eccessivamente con la mano bassa.',
      'Perdere l’allineamento scapolare rischiando strappi al bicipite.'
    ],
    muscoli: ['Gran dorsale', 'Bicipite', 'Avambraccio', 'Obliqui']
  },

  // ==========================================
  // GAMBE SPINTA (1 - 7)
  // ==========================================
  {
    id: 'squat_assistito',
    nome: 'Squat assistito con appoggio',
    nomeInglese: 'Assisted squat',
    pattern: 'gambe_spinta',
    livello: 1,
    attrezzaturaRichiesta: ['sedia'],
    limitazioniEscluse: [],
    tipo: 'reps',
    unilaterale: false,
    istruzioni: [
      'In piedi di fronte a uno stipite, tavolo o schienale di una sedia salda.',
      'Piedi larghezza spalle con punte leggermente aperte a 15-20 gradi.',
      'Scendi indietro con il bacino aiutandoti con le mani solo se necessario.',
      'Raggiungi il parallelo e spingi attraverso i talloni per rialzarti.'
    ],
    erroriComuni: [
      'Portare tutto il peso sulle mani invece di caricare le gambe.',
      'Sollevare i talloni dal suolo.'
    ],
    muscoli: ['Quadricipiti', 'Glutei']
  },
  {
    id: 'squat_corpo_libero',
    nome: 'Squat a corpo libero',
    nomeInglese: 'Bodyweight squat',
    pattern: 'gambe_spinta',
    livello: 2,
    attrezzaturaRichiesta: ['pavimento'],
    limitazioniEscluse: ['ginocchio', 'anca'],
    tipo: 'reps',
    unilaterale: false,
    istruzioni: [
      'Piedi aperti a larghezza spalle, braccia avanti per bilanciare il carico.',
      'Inizia piegando ginocchia e anche contemporaneamente.',
      'Scendi fino a quando le anche sono almeno al livello delle ginocchia (sotto il parallelo).',
      'Risali estendendo le anche con una forte contrazione dei glutei in alto.'
    ],
    erroriComuni: [
      'Collasso delle ginocchia verso l’interno (valgismo).',
      'Flettere la schiena in avanti per raggiungere fittizia profondità.'
    ],
    muscoli: ['Quadricipiti femorali', 'Glutei', 'Adduttori', 'Erettori spinali']
  },
  {
    id: 'affondo_bulgaro',
    nome: 'Affondo bulgaro',
    nomeInglese: 'Bulgarian split squat',
    pattern: 'gambe_spinta',
    livello: 3,
    attrezzaturaRichiesta: ['sedia'],
    limitazioniEscluse: ['ginocchio'],
    tipo: 'reps',
    unilaterale: true,
    istruzioni: [
      'In piedi a circa un passo da una sedia, poggia il dorso di un piede sul piano dietro di te.',
      'Distribuisci l’85% del peso sulla gamba anteriore piantata a terra.',
      'Scendi verticalmente finché il ginocchio posteriore sfiora il terreno.',
      'Spingi con tutta la pianta del piede anteriore per risalire.'
    ],
    erroriComuni: [
      'Posizionare il piede avanti troppo vicino provocando eccessiva pressione rotulea.',
      'Inclinarsi troppo all’indietro col tronco.'
    ],
    muscoli: ['Quadricipiti', 'Grande gluteo', 'Stabilizzatori anca']
  },
  {
    id: 'affondo_bulgaro_pausa',
    nome: 'Affondo bulgaro con pausa 3 secondi',
    nomeInglese: 'Pause bulgarian split squat',
    pattern: 'gambe_spinta',
    livello: 4,
    attrezzaturaRichiesta: ['sedia'],
    limitazioniEscluse: ['ginocchio'],
    tipo: 'reps',
    unilaterale: true,
    istruzioni: [
      'Configura la posizione dell’affondo bulgaro.',
      'Scendi con controllo di 3 secondi fino al punto di massima profondità.',
      'Mantieni l’isometria per 3 secondi pieni senza toccare o riposare il ginocchio a terra.',
      'Spingi con potenza per risalire alla posizione iniziale.'
    ],
    erroriComuni: [
      'Appoggiare il peso del ginocchio posteriore a terra durante la pausa.',
      'Oscillare col busto per rompere l’inerzia.'
    ],
    muscoli: ['Quadricipiti', 'Glutei', 'Core']
  },
  {
    id: 'shrimp_squat_assistito',
    nome: 'Shrimp squat assistito',
    nomeInglese: 'Assisted shrimp squat',
    pattern: 'gambe_spinta',
    livello: 5,
    attrezzaturaRichiesta: ['pavimento'],
    limitazioniEscluse: ['ginocchio'],
    tipo: 'reps',
    unilaterale: true,
    istruzioni: [
      'In equilibrio su una gamba sola, piega la gamba opposta indietro afferrando la caviglia con la mano omologa.',
      'L’altra mano può sfiorare una parete per assistenza.',
      'Scendi finché il ginocchio posteriore tocca dolcemente il suolo.',
      'Spingi con il quadricipite della gamba d’appoggio per tornare eretto.'
    ],
    erroriComuni: [
      'Sbattere il ginocchio a terra con impatto traumatico.',
      'Sollevare il tallone anteriore.'
    ],
    muscoli: ['Quadricipite monolaterale', 'Gluteo medio', 'Caviglia']
  },
  {
    id: 'pistol_squat_rialzo',
    nome: 'Pistol squat su rialzo',
    nomeInglese: 'Box pistol squat',
    pattern: 'gambe_spinta',
    livello: 6,
    attrezzaturaRichiesta: ['sedia'],
    limitazioniEscluse: ['ginocchio', 'caviglia'],
    tipo: 'reps',
    unilaterale: true,
    istruzioni: [
      'In piedi su una gamba sopra una sedia o box stabile, l’altra gamba pende tesa all’esterno.',
      'Braccia protese in avanti per controbilanciare il bacino.',
      'Scendi su una gamba fino al massimo accosciamento senza toccare con l’altro piede.',
      'Spingi vigorosamente per risalire a gamba tesa.'
    ],
    erroriComuni: [
      'Cedimento del ginocchio verso l’interno in salita.',
      'Rimbalzare sulla seduta.'
    ],
    muscoli: ['Quadricipiti', 'Glutei', 'Core profondo', 'Polpaccio']
  },
  {
    id: 'pistol_squat_completo',
    nome: 'Pistol squat completo',
    nomeInglese: 'Pistol squat',
    pattern: 'gambe_spinta',
    livello: 7,
    attrezzaturaRichiesta: ['pavimento'],
    limitazioniEscluse: ['ginocchio', 'caviglia'],
    tipo: 'reps',
    unilaterale: true,
    istruzioni: [
      'In piedi a terra su un solo arto, stendi la gamba opposta orizzontale davanti a te.',
      'Scendi in accosciata profonda con controllo millimetrico mantenendo il tallone incollato a terra.',
      'Tocca con i femorali il polpaccio rimanendo compatto.',
      'Spingi con forza sul centro del piede tornando alla posizione eretta senza posare la gamba sospesa.'
    ],
    erroriComuni: [
      'Sollevare il tallone perdendo la mobilità di dorsiflessione della caviglia.',
      'Lasciar cadere la gamba libera a terra.'
    ],
    muscoli: ['Quadricipiti', 'Flessori dell’anca', 'Glutei', 'Stabilizzatori della caviglia']
  },

  // ==========================================
  // GAMBE CATENA POSTERIORE (1 - 5)
  // ==========================================
  {
    id: 'glute_bridge',
    nome: 'Glute bridge',
    nomeInglese: 'Glute bridge',
    pattern: 'gambe_catena_posteriore',
    livello: 1,
    attrezzaturaRichiesta: ['pavimento'],
    limitazioniEscluse: [],
    tipo: 'reps',
    unilaterale: false,
    istruzioni: [
      'Sdraiati supino con ginocchia flesse e piante dei piedi a terra a larghezza fianchi.',
      'Premi sui talloni sollevando il bacino verso l’alto.',
      'Stringi con forza i glutei al culmine formando una linea dritta dalle ginocchia alle spalle.',
      'Scendi controllando senza poggiare completamente i glutei fino a fine serie.'
    ],
    erroriComuni: [
      'Spingere con la zona lombare inarcando eccessivamente la schiena.',
      'Piedi posizionati troppo lontani o troppo vicini.'
    ],
    muscoli: ['Grande gluteo', 'Bicipiti femorali', 'Erettori spinali']
  },
  {
    id: 'hip_thrust_monopodalico',
    nome: 'Hip thrust monopodalico',
    nomeInglese: 'Single leg hip thrust',
    pattern: 'gambe_catena_posteriore',
    livello: 2,
    attrezzaturaRichiesta: ['sedia'],
    limitazioniEscluse: ['schiena'],
    tipo: 'reps',
    unilaterale: true,
    istruzioni: [
      'Appoggia la parte alta della schiena sul bordo di un divano o sedia stabile.',
      'Solleva una gamba a 90 gradi mantenendola sospesa.',
      'Spingi sul tallone della gamba a terra portando il bacino allineato al busto.',
      'Mantieni 1 secondo di contrazione massima e scendi controllando.'
    ],
    erroriComuni: [
      'Rotazione o caduta del bacino dal lato della gamba sospesa.',
      'Guardare verso il soffitto invece di mantenere lo sguardo avanti.'
    ],
    muscoli: ['Gluteo unilaterale', 'Femorali', 'Core']
  },
  {
    id: 'good_morning_corpo_libero',
    nome: 'Good morning a corpo libero',
    nomeInglese: 'Bodyweight good morning',
    pattern: 'gambe_catena_posteriore',
    livello: 3,
    attrezzaturaRichiesta: ['pavimento'],
    limitazioniEscluse: ['schiena'],
    tipo: 'reps',
    unilaterale: false,
    istruzioni: [
      'In piedi, mani dietro la nuca e piedi larghezza spalle.',
      'Ginocchia sbloccate ma fisse: spingi i fianchi indietro inclinando il busto in avanti.',
      'Mantieni la colonna perfettamente neutra finché senti tirare i femorali.',
      'Contrai glutei e femorali per riportare il bacino in avanti.'
    ],
    erroriComuni: [
      'Piegare le ginocchia trasformandolo in uno squat.',
      'Arrotondare il tratto dorsale o lombare.'
    ],
    muscoli: ['Ischiocrurali (femorali)', 'Glutei', 'Erettori spinali lombari']
  },
  {
    id: 'nordic_curl_negativo',
    nome: 'Nordic curl negativo assistito',
    nomeInglese: 'Assisted nordic curl negative',
    pattern: 'gambe_catena_posteriore',
    livello: 4,
    attrezzaturaRichiesta: ['pavimento'],
    limitazioniEscluse: ['ginocchio', 'schiena'],
    tipo: 'reps',
    unilaterale: false,
    istruzioni: [
      'In ginocchio con caviglie saldamente bloccate (sotto un divano pesante o con partner/cinghie).',
      'Corpo rigido in linea dalle ginocchia alle spalle.',
      'Scendi in avanti il più lentamente possibile trattenendo il peso solo con i bicipiti femorali.',
      'Usa le mani per ammortizzare l’arrivo a terra, spingi leggermente per ripartire in alto.'
    ],
    erroriComuni: [
      'Flettere le anche spezzando la linea retta prima della discesa.',
      'Crollare subito senza resistere eccentricamente.'
    ],
    muscoli: ['Bicipiti femorali (fase eccentrica)', 'Gastrocnemio', 'Glutei']
  },
  {
    id: 'nordic_curl_completo',
    nome: 'Nordic curl completo',
    nomeInglese: 'Nordic curl',
    pattern: 'gambe_catena_posteriore',
    livello: 5,
    attrezzaturaRichiesta: ['pavimento'],
    limitazioniEscluse: ['ginocchio', 'schiena'],
    tipo: 'reps',
    unilaterale: false,
    istruzioni: [
      'In ginocchio con piedi saldamente ancorati e busto eretto.',
      'Scendi con controllo millimetrico fino a sfiorare il suolo con il petto.',
      'Senza usare le braccia, tira con la sola forza dei bicipiti femorali per risalire.',
      'Mantieni la completa estensione delle anche durante tutto il range.'
    ],
    erroriComuni: [
      'Spezzare il bacino a metà salita.',
      'Spingersi dal suolo con le braccia.'
    ],
    muscoli: ['Ischiocrurali', 'Polpacci posteriori', 'Glutei']
  },

  // ==========================================
  // CORE ANTERIORE (1 - 8)
  // ==========================================
  {
    id: 'dead_bug',
    nome: 'Dead bug',
    nomeInglese: 'Dead bug',
    pattern: 'core_anteriore',
    livello: 1,
    attrezzaturaRichiesta: ['pavimento'],
    limitazioniEscluse: [],
    tipo: 'reps',
    unilaterale: false,
    istruzioni: [
      'Sdraiati a terra con braccia rivolte al soffitto e ginocchia a 90° sollevate.',
      'Schiaccia vigorosamente la zona lombare contro il suolo annullando ogni vuoto.',
      'Allunga contemporaneamente braccio destro indietro e gamba sinistra avanti a pochi cm da terra.',
      'Ritorna al centro e alterna con il braccio e gamba opposti mantenendo la schiena incollata.'
    ],
    erroriComuni: [
      'Inarcare la schiena staccando i lombari da terra.',
      'Muoversi troppo in fretta perdendo il controllo neuromuscolare.'
    ],
    muscoli: ['Trasverso dell’addome', 'Retto dell’addome', 'Psoas']
  },
  {
    id: 'plank',
    nome: 'Plank',
    nomeInglese: 'Forearm plank',
    pattern: 'core_anteriore',
    livello: 2,
    attrezzaturaRichiesta: ['pavimento'],
    limitazioniEscluse: ['schiena'],
    tipo: 'tempo',
    unilaterale: false,
    istruzioni: [
      'In appoggio sugli avambracci e sulle punte dei piedi.',
      'Gomiti perpendicolari sotto le spalle.',
      'Attiva la retroversione del bacino contraendo glutei e addome come per unire sterno e pube.',
      'Mantieni la linea retta respirando regolarmente.'
    ],
    erroriComuni: [
      'Bacino che scende verso terra (rischio sovraccarico lombare).',
      'Glutei troppo alti a forma di casetta.'
    ],
    muscoli: ['Retto addominale', 'Trasverso', 'Glutei', 'Dentato']
  },
  {
    id: 'hollow_hold',
    nome: 'Hollow hold',
    nomeInglese: 'Hollow body hold',
    pattern: 'core_anteriore',
    livello: 3,
    attrezzaturaRichiesta: ['pavimento'],
    limitazioniEscluse: ['schiena'],
    tipo: 'tempo',
    unilaterale: false,
    istruzioni: [
      'Sdraiato supino, unisci le gambe con le punte dei piedi tese.',
      'Stendi le braccia indietro oltre la testa incollandole alle orecchie.',
      'Solleva spalle e gambe da terra formando una banana concava.',
      'I lombari devono restare schiacciati contro il suolo con forza totale.'
    ],
    erroriComuni: [
      'Staccare la schiena da terra per fatica.',
      'Piegare le ginocchia o staccare le braccia dalla testa.'
    ],
    muscoli: ['Retto dell’addome', 'Flessori dell’anca', 'Core globale']
  },
  {
    id: 'hanging_knee_raise',
    nome: 'Hanging knee raise',
    nomeInglese: 'Hanging knee raise',
    pattern: 'core_anteriore',
    livello: 4,
    attrezzaturaRichiesta: ['sbarra'],
    limitazioniEscluse: ['spalla'],
    tipo: 'reps',
    unilaterale: false,
    istruzioni: [
      'Appeso alla sbarra a braccia tese con presa prona e scapole attive.',
      'Senza dondolare, porta le ginocchia verso il petto.',
      'Arrotonda il bacino verso l’alto per attivare il retto addominale e non solo i flessori.',
      'Riscendi lentamente fino alla completa distensione delle gambe.'
    ],
    erroriComuni: [
      'Sfruttare l’inerzia del dondolio delle gambe.',
      'Limitarsi a flettere l’anca senza ruotare il bacino in retroversione.'
    ],
    muscoli: ['Retto addominale', 'Ileopsoas', 'Avambracci']
  },
  {
    id: 'hanging_leg_raise',
    nome: 'Hanging leg raise',
    nomeInglese: 'Hanging leg raise',
    pattern: 'core_anteriore',
    livello: 5,
    attrezzaturaRichiesta: ['sbarra'],
    limitazioniEscluse: ['spalla'],
    tipo: 'reps',
    unilaterale: false,
    istruzioni: [
      'Sospeso alla sbarra, gambe completamente tese e unite.',
      'Solleva le gambe tese fino a renderle parallele al pavimento (90 gradi).',
      'Mantieni i quadricipiti contratti e non piegare le ginocchia.',
      'Scendi lentamente controllando la fase eccentrica senza oscillazioni.'
    ],
    erroriComuni: [
      'Piegare i gomiti per alleggerire il carico.',
      'Lasciar cadere le gambe a piombo al ritorno.'
    ],
    muscoli: ['Addominali', 'Flessori dell’anca', 'Quadricipiti', 'Dorsali']
  },
  {
    id: 'toes_to_bar',
    nome: 'Toes to bar',
    nomeInglese: 'Toes to bar',
    pattern: 'core_anteriore',
    livello: 6,
    attrezzaturaRichiesta: ['sbarra'],
    limitazioniEscluse: ['spalla'],
    tipo: 'reps',
    unilaterale: false,
    istruzioni: [
      'Sospeso alla sbarra, attiva i dorsali spingendo la sbarra in basso.',
      'Solleva le gambe tese continuando il movimento fino a toccare la sbarra con la punta dei piedi tra le mani.',
      'Fai una micro pausa a contatto con la sbarra.',
      'Controlla la discesa in 2 secondi tornando in dead hang attivo.'
    ],
    erroriComuni: [
      'Usare slancio da crossfit (kipping) senza controllo calistenico strict.',
      'Piegare le gambe per toccare la sbarra.'
    ],
    muscoli: ['Retto addominale completo', 'Dorsali', 'Avambracci']
  },
  {
    id: 'dragon_flag_negativo',
    nome: 'Dragon flag negativo',
    nomeInglese: 'Dragon flag negative',
    pattern: 'core_anteriore',
    livello: 7,
    attrezzaturaRichiesta: ['pavimento'],
    limitazioniEscluse: ['spalla', 'schiena'],
    tipo: 'reps',
    unilaterale: false,
    istruzioni: [
      'Sdraiati a terra afferrando con le mani un palo, supporto solido o panca dietro la testa.',
      'Slanciati portando tutto il corpo verticale poggiando solo sulla parte alta dei trapezi/spalle.',
      'Corpo duro come un blocco d’acciaio: scendi in 4-5 secondi mantenendo cosce e busto allineati.',
      'Tocca il suolo e ripeti risalendo rannicchiato.'
    ],
    erroriComuni: [
      'Spezzare il bacino a 90° durante la discesa anziché restare a palo dritto.',
      'Scaricare il peso sulle vertebre cervicali invece che sulle scapole.'
    ],
    muscoli: ['Retto addominale', 'Obliqui', 'Glutei', 'Dorsali']
  },
  {
    id: 'dragon_flag',
    nome: 'Dragon flag',
    nomeInglese: 'Dragon flag',
    pattern: 'core_anteriore',
    livello: 8,
    attrezzaturaRichiesta: ['pavimento'],
    limitazioniEscluse: ['spalla', 'schiena'],
    tipo: 'reps',
    unilaterale: false,
    istruzioni: [
      'Presa salda dietro la nuca. Solleva il corpo intero in linea retta fino alla verticale.',
      'Scendi controllando fino a sfiorare il terreno a 5 cm dal suolo.',
      'Senza toccare terra e senza piegare il bacino, inverti la traiettoria e risali.',
      'Mantieni le punte tese e la contrazione totale da testa a piedi.'
    ],
    erroriComuni: [
      'Inarcare la schiena al cambio di direzione.',
      'Piegare le ginocchia per alleggerire il braccio di leva.'
    ],
    muscoli: ['Retto dell’addome', 'Lombari', 'Dorsali', 'Braccia']
  },

  // ==========================================
  // CORE LATERALE (1 - 4)
  // ==========================================
  {
    id: 'side_plank_ginocchia',
    nome: 'Side plank sulle ginocchia',
    nomeInglese: 'Knee side plank',
    pattern: 'core_laterale',
    livello: 1,
    attrezzaturaRichiesta: ['pavimento'],
    limitazioniEscluse: ['spalla'],
    tipo: 'tempo',
    unilaterale: true,
    istruzioni: [
      'Sdraiati su un fianco con gomito a terra sotto la spalla e ginocchia piegate indietro a 90 gradi.',
      'Solleva il bacino formando una diagonale retta dalle spalle alle ginocchia.',
      'Mantieni il braccio superiore disteso o sul fianco.',
      'Trattieni la posizione respirando con regolarità.'
    ],
    erroriComuni: [
      'Lasciar cadere il bacino verso il suolo.',
      'Ruotare il torace verso il pavimento.'
    ],
    muscoli: ['Obliqui interni ed esterni', 'Quadrato dei lombi']
  },
  {
    id: 'side_plank',
    nome: 'Side plank',
    nomeInglese: 'Side plank',
    pattern: 'core_laterale',
    livello: 2,
    attrezzaturaRichiesta: ['pavimento'],
    limitazioniEscluse: ['spalla'],
    tipo: 'tempo',
    unilaterale: true,
    istruzioni: [
      'Su un fianco in appoggio sull’avambraccio e sul bordo esterno del piede inferiore.',
      'Piedi uniti e gambe distese.',
      'Solleva le anche fino a che il corpo forma una linea retta perfetta.',
      'Spingi con decisione contro il suolo con il gomito attivo.'
    ],
    erroriComuni: [
      'Cedere con il fianco inferiore a causa della stanchezza.',
      'Lasciare crollare la testa lateralmente.'
    ],
    muscoli: ['Obliqui', 'Gluteo medio', 'Quadrato dei lombi']
  },
  {
    id: 'side_plank_abduzione',
    nome: 'Side plank con abduzione',
    nomeInglese: 'Side plank with leg raise',
    pattern: 'core_laterale',
    livello: 3,
    attrezzaturaRichiesta: ['pavimento'],
    limitazioniEscluse: ['spalla', 'anca'],
    tipo: 'reps',
    unilaterale: true,
    istruzioni: [
      'Assumi la posizione di side plank completo a gambe tese.',
      'Solleva la gamba superiore verso l’alto a circa 45 gradi con controllo.',
      'Mantieni il bacino alto e fermo senza oscillazioni.',
      'Abbassa la gamba sfiorando il piede inferiore e ripeti.'
    ],
    erroriComuni: [
      'Abbassare le anche mentre la gamba sale.',
      'Ruotare la punta del piede verso il soffitto (usare invece il gluteo medio).'
    ],
    muscoli: ['Gluteo medio', 'Obliqui', 'Adduttori dell’arto a terra']
  },
  {
    id: 'copenhagen_plank',
    nome: 'Copenhagen plank',
    nomeInglese: 'Copenhagen plank',
    pattern: 'core_laterale',
    livello: 4,
    attrezzaturaRichiesta: ['sedia'],
    limitazioniEscluse: ['spalla', 'ginocchio', 'anca'],
    tipo: 'tempo',
    unilaterale: true,
    istruzioni: [
      'In side plank posiziona il piede o la tibia della gamba superiore sopra una sedia o panca.',
      'La gamba inferiore rimane sospesa a mezz’aria sotto la panca.',
      'Solleva il bacino sostenendo il corpo intero con l’adduttore della gamba superiore e l’avambraccio.',
      'Trattieni la posizione per il tempo prestabilito su entrambi i lati.'
    ],
    erroriComuni: [
      'Poggiare la gamba inferiore a terra per aiutarsi.',
      'Flettere le anche indietro.'
    ],
    muscoli: ['Adduttori dell’anca', 'Obliqui addominali', 'Core profondo']
  },

  // ==========================================
  // POLPACCI (1 - 3)
  // ==========================================
  {
    id: 'calf_due_gambe',
    nome: 'Calf raise a due gambe',
    nomeInglese: 'Double leg calf raise',
    pattern: 'polpacci',
    livello: 1,
    attrezzaturaRichiesta: ['pavimento'],
    limitazioniEscluse: [],
    tipo: 'reps',
    unilaterale: false,
    istruzioni: [
      'In piedi con piedi paralleli a larghezza fianchi.',
      'Spingi sugli alluci sollevandoti al massimo sulle punte dei piedi.',
      'Mantieni 1 secondo di contrazione isometrica al vertice.',
      'Scendi controllando la discesa fino a sfiorare con i talloni.'
    ],
    erroriComuni: [
      'Spostare il peso verso l’esterno del piede (scaricando il gastrocnemio mediale).',
      'Eseguire il movimento a rimbalzo rapido.'
    ],
    muscoli: ['Gastrocnemio', 'Soleo']
  },
  {
    id: 'calf_monopodalico',
    nome: 'Calf raise monopodalico',
    nomeInglese: 'Single leg calf raise',
    pattern: 'polpacci',
    livello: 2,
    attrezzaturaRichiesta: ['pavimento'],
    limitazioniEscluse: ['caviglia'],
    tipo: 'reps',
    unilaterale: true,
    istruzioni: [
      'In piedi su una sola gamba, l’altra gamba flessa indietro.',
      'Poggia una mano su un muro per l’equilibrio.',
      'Sollevati sulla punta del piede caricando il 100% del peso corporeo.',
      'Trattieni al picco e scendi lentamente.'
    ],
    erroriComuni: [
      'Spingersi con la mano contro la parete per salire.',
      'Non raggiungere la completa estensione della caviglia.'
    ],
    muscoli: ['Gastrocnemio monolaterale', 'Soleo', 'Tibiale posteriore']
  },
  {
    id: 'calf_monopodalico_rialzo',
    nome: 'Calf raise monopodalico su rialzo',
    nomeInglese: 'Elevated single leg calf raise',
    pattern: 'polpacci',
    livello: 3,
    attrezzaturaRichiesta: ['sedia'],
    limitazioniEscluse: ['caviglia'],
    tipo: 'reps',
    unilaterale: true,
    istruzioni: [
      'Posiziona l’avampiede di un piede sul bordo di un gradino o rialzo stabile.',
      'Lascia scendere il tallone sotto il livello del gradino per un profondo allungamento.',
      'Spingi poderosamente verso l’alto raggiungendo la massima flessione plantare.',
      'Scendi in 3 secondi controllando l’eccentrica fino al massimo allungamento.'
    ],
    erroriComuni: [
      'Evitare il deficit scendendo solo fino al livello del gradino.',
      'Piegare il ginocchio per aiutarsi.'
    ],
    muscoli: ['Gastrocnemio', 'Soleo', 'Tendine d’Achille (stretching attivo)']
  }
];

export const PATTERN_NAMES: Record<Exercise['pattern'], string> = {
  spinta_orizzontale: 'Spinta Orizzontale',
  spinta_verticale: 'Spinta Verticale',
  dip: 'Dip',
  trazione_orizzontale: 'Trazione Orizzontale',
  trazione_verticale: 'Trazione Verticale',
  gambe_spinta: 'Gambe (Spinta)',
  gambe_catena_posteriore: 'Catena Posteriore',
  core_anteriore: 'Core Anteriore',
  core_laterale: 'Core Laterale',
  polpacci: 'Polpacci'
};
