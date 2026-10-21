/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sex,
  Experience,
  Goal,
  DurationMin,
  DaysPerWeek,
  Equipment,
  Limitation,
  Profile,
  AssessmentResult,
  Pattern
} from '../types';
import { useApp } from '../store/AppContext';
import { evaluateAssessment } from '../logic/assessment';
import { PATTERN_NAMES } from '../data/exercises';
import { STANDARDS, calculateAge, getAgeFactor } from '../data/standards';
import {
  IconChevronRight,
  IconChevronLeft,
  IconCheck,
  IconPlay,
  IconPause,
  IconRefresh
} from '../components/Icons';

export function OnboardingWizard() {
  const { dispatch } = useApp();

  // Step 1 to 11
  const [step, setStep] = useState(1);

  // Dati profilo
  const [nome, setNome] = useState('');
  const [sesso, setSesso] = useState<Sex>('m');
  const [dataNascita, setDataNascita] = useState('1998-05-15');
  const [altezzaCm, setAltezzaCm] = useState(175);
  const [pesoKg, setPesoKg] = useState(72);
  const [esperienza, setEsperienza] = useState<Experience>('meno_6_mesi');
  const [mesiInattivita, setMesiInattivita] = useState(0);
  const [obiettivo, setObiettivo] = useState<Goal>('ipertrofia');
  const [giorniSettimana, setGiorniSettimana] = useState<DaysPerWeek>(3);
  const [durataSessioneMin, setDurataSessioneMin] = useState<DurationMin>(45);

  const [attrezzatura, setAttrezzatura] = useState<Equipment[]>(['pavimento', 'sbarra']);
  const [limitazioni, setLimitazioni] = useState<Limitation[]>(['nessuna']);

  // Misurazioni corporee iniziali (saltabili)
  const [vitaCm, setVitaCm] = useState<number | ''>('');
  const [colloCm, setColloCm] = useState<number | ''>('');
  const [fianchiCm, setFianchiCm] = useState<number | ''>('');
  const [toraceCm, setToraceCm] = useState<number | ''>('');
  const [braccioCm, setBraccioCm] = useState<number | ''>('');
  const [cosciaCm, setCosciaCm] = useState<number | ''>('');
  const [polpaccioCm, setPolpaccioCm] = useState<number | ''>('');

  // Test fisici
  const [pushUp, setPushUp] = useState<number | ''>(10);
  const [pushUpType, setPushUpType] = useState<'completi' | 'ginocchia'>('completi');
  const [pullUp, setPullUp] = useState<number | ''>(3);
  const [deadHangSec, setDeadHangSec] = useState<number | ''>(30);
  const [squat, setSquat] = useState<number | ''>(25);
  const [plankSec, setPlankSec] = useState<number | ''>(60);
  const [dipOrRow, setDipOrRow] = useState<number | ''>(5);
  const [hollowHoldSec, setHollowHoldSec] = useState<number | ''>('');

  // Cronometro per i test
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSec, setTimerSec] = useState(0);

  // Risultato calcolato
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerSec((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const toggleEquipment = (eq: Equipment) => {
    if (eq === 'pavimento') return; // Pavimento sempre presente
    setAttrezzatura((prev) =>
      prev.includes(eq) ? prev.filter((item) => item !== eq) : [...prev, eq]
    );
  };

  const toggleLimitation = (lim: Limitation) => {
    if (lim === 'nessuna') {
      setLimitazioni(['nessuna']);
      return;
    }
    setLimitazioni((prev) => {
      const filtered = prev.filter((i) => i !== 'nessuna');
      if (filtered.includes(lim)) {
        const res = filtered.filter((i) => i !== lim);
        return res.length === 0 ? ['nessuna'] : res;
      } else {
        return [...filtered, lim];
      }
    });
  };

  const hasDipEquipment =
    attrezzatura.includes('parallele') || attrezzatura.includes('sedia');

  const dipOrRowType: 'dip' | 'row' = hasDipEquipment ? 'dip' : 'row';

  // Calcola i risultati quando si raggiunge lo step 10
  const handleCalculateResults = () => {
    const input = {
      sex: sesso,
      birthDate: dataNascita,
      mesiInattivita: Number(mesiInattivita) || 0,
      equipment: attrezzatura,
      pushUp: Number(pushUp) || 0,
      pushUpType,
      pullUp: Number(pullUp) || 0,
      deadHangSec: Number(deadHangSec) || 0,
      squat: Number(squat) || 0,
      plankSec: Number(plankSec) || 0,
      dipOrRowType,
      dipOrRow: Number(dipOrRow) || 0,
      hollowHoldSec: hollowHoldSec ? Number(hollowHoldSec) : undefined
    };

    const result = evaluateAssessment(input);
    setAssessmentResult(result);
    setStep(10);
  };

  const handleFinishOnboarding = () => {
    if (!assessmentResult) return;

    const profile: Profile = {
      nome: nome.trim() || 'Atleta',
      sesso,
      dataNascita,
      altezzaCm: Number(altezzaCm) || 175,
      pesoKg: Number(pesoKg) || 70,
      esperienza,
      mesiInattivita: Number(mesiInattivita) || 0,
      obiettivo,
      giorniSettimana,
      durataSessioneMin,
      attrezzatura,
      limitazioni,
      creatoIl: new Date().toISOString()
    };

    const initialMeasurement = (vitaCm && colloCm)
      ? {
          data: new Date().toISOString(),
          pesoKg: Number(pesoKg) || 70,
          vitaCm: Number(vitaCm),
          colloCm: Number(colloCm),
          fianchiCm: fianchiCm ? Number(fianchiCm) : undefined,
          toraceCm: toraceCm ? Number(toraceCm) : undefined,
          braccioCm: braccioCm ? Number(braccioCm) : undefined,
          cosciaCm: cosciaCm ? Number(cosciaCm) : undefined,
          polpaccioCm: polpaccioCm ? Number(polpaccioCm) : undefined
        }
      : undefined;

    dispatch({
      type: 'COMPLETE_ONBOARDING',
      payload: { profile, assessment: assessmentResult, initialMeasurement }
    });
  };

  const totalSteps = 11;
  const progressPercent = Math.round((step / totalSteps) * 100);

  return (
    <div className="min-h-screen bg-canvas text-txt flex flex-col justify-between max-w-[480px] mx-auto px-4 py-6">
      {/* Top Header & Progress Bar */}
      <div>
        <div className="flex items-center justify-between mb-4">
          {step > 1 ? (
            <button
              onClick={() => {
                setTimerRunning(false);
                setTimerSec(0);
                setStep((s) => Math.max(1, s - 1));
              }}
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-surface border border-subtle text-txt hover:bg-elevated transition-colors"
              aria-label="Torna indietro"
            >
              <IconChevronLeft size={20} />
            </button>
          ) : (
            <div className="w-11 h-11" />
          )}

          <div className="flex items-center gap-1.5 text-xs text-muted-txt">
            <span>Passo</span>
            <span className="text-txt font-semibold tabular-nums">{step}</span>
            <span>di</span>
            <span className="tabular-nums">{totalSteps}</span>
          </div>

          <div className="w-11 h-11 flex items-center justify-center text-xs font-semibold text-accent tabular-nums">
            {progressPercent}%
          </div>
        </div>

        {/* Progress bar track */}
        <div className="w-full h-1 bg-surface rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-accent transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Form Content */}
      <div className="flex-1 flex flex-col justify-center py-2">
        {/* STEP 1: Benvenuto */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-accent uppercase">
              Calis Progression
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-txt leading-tight">
              Costruisci la tua forza a corpo libero.
            </h1>
            <p className="text-base text-muted-txt leading-relaxed">
              Misuriamo il tuo livello reale con test fisici oggettivi. Generiamo un programma
              calistenico personalizzato con doppia progressione deterministica, senza fronzoli.
            </p>

            <div className="p-4 rounded-[20px] bg-surface border border-subtle space-y-3">
              <div className="text-xs font-semibold text-txt">Cosa ti aspetta:</div>
              <ul className="text-xs text-muted-txt space-y-2">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                  <span>5 domande veloci su corporatura e obiettivi</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                  <span>Test fisici massimali con forma rigorosa</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                  <span>Piano d’allenamento su scala scientifica pronto all’uso</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full min-h-[52px] rounded-2xl bg-accent text-accent-contrast font-bold text-base flex items-center justify-center gap-2 shadow-sm hover:opacity-95 active:scale-[0.98] transition-all"
            >
              <span>Inizia la valutazione</span>
              <IconChevronRight size={20} />
            </button>
          </div>
        )}

        {/* STEP 2: Dati personali */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-txt">Chi sei?</h2>
              <p className="text-sm text-muted-txt mt-1">
                Questi dati determinano le soglie di riferimento biologiche.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-txt mb-1">Nome o pseudonimo</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Es. Marco"
                  className="w-full h-12 px-4 rounded-xl bg-surface border border-subtle text-txt focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-txt mb-1">Sesso biologico</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSesso('m')}
                    className={`h-12 rounded-xl font-medium text-sm flex items-center justify-center border transition-all ${
                      sesso === 'm'
                        ? 'bg-elevated border-accent text-accent'
                        : 'bg-surface border-subtle text-muted-txt'
                    }`}
                  >
                    Uomo
                  </button>
                  <button
                    type="button"
                    onClick={() => setSesso('f')}
                    className={`h-12 rounded-xl font-medium text-sm flex items-center justify-center border transition-all ${
                      sesso === 'f'
                        ? 'bg-elevated border-accent text-accent'
                        : 'bg-surface border-subtle text-muted-txt'
                    }`}
                  >
                    Donna
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-txt mb-1">Data di nascita</label>
                <input
                  type="date"
                  value={dataNascita}
                  onChange={(e) => setDataNascita(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-surface border border-subtle text-txt focus:outline-none focus:border-accent tabular-nums"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-txt mb-1">Altezza (cm)</label>
                  <input
                    type="number"
                    value={altezzaCm}
                    onChange={(e) => setAltezzaCm(Number(e.target.value))}
                    min={120}
                    max={230}
                    className="w-full h-12 px-4 rounded-xl bg-surface border border-subtle text-txt focus:outline-none focus:border-accent tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-txt mb-1">Peso attuale (kg)</label>
                  <input
                    type="number"
                    value={pesoKg}
                    onChange={(e) => setPesoKg(Number(e.target.value))}
                    min={35}
                    max={200}
                    step={0.5}
                    className="w-full h-12 px-4 rounded-xl bg-surface border border-subtle text-txt focus:outline-none focus:border-accent tabular-nums"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(3)}
              disabled={!nome.trim() || !altezzaCm || !pesoKg}
              className="w-full min-h-[50px] mt-2 rounded-2xl bg-accent text-accent-contrast font-bold text-base flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-40"
            >
              <span>Continua</span>
              <IconChevronRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 3: Esperienza & Inattività */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-txt">Il tuo background</h2>
              <p className="text-sm text-muted-txt mt-1">
                La memoria muscolare e i mesi di stop condizionano i carichi iniziali.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-txt mb-2">Da quanto tempo ti alleni a corpo libero?</label>
                <div className="space-y-2">
                  {[
                    { id: 'mai', title: 'Mai o da zero', desc: 'Non ho mai praticato calisthenics con costanza' },
                    { id: 'meno_6_mesi', title: 'Meno di 6 mesi', desc: 'Sto apprendendo le basi del movimento' },
                    { id: '6_24_mesi', title: 'Da 6 mesi a 2 anni', desc: 'Ho buona confidenza con trazioni e dip' },
                    { id: 'oltre_2_anni', title: 'Oltre 2 anni', desc: 'Atleta avanzato con controllo delle leve' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setEsperienza(item.id as Experience)}
                      className={`w-full p-3.5 rounded-xl text-left border transition-all ${
                        esperienza === item.id
                          ? 'bg-elevated border-accent text-txt'
                          : 'bg-surface border-subtle text-muted-txt'
                      }`}
                    >
                      <div className="text-sm font-semibold text-txt">{item.title}</div>
                      <div className="text-xs text-muted-txt mt-0.5">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-txt mb-1">Da quanti mesi sei fermo?</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={12}
                    value={mesiInattivita}
                    onChange={(e) => setMesiInattivita(Number(e.target.value))}
                    className="flex-1 accent-accent"
                  />
                  <span className="w-16 text-center text-sm font-bold text-txt tabular-nums bg-surface py-2 rounded-lg border border-subtle">
                    {mesiInattivita === 0 ? 'Attivo' : `${mesiInattivita} mesi`}
                  </span>
                </div>
                {mesiInattivita > 3 && (
                  <p className="text-xs text-rest mt-1.5">
                    Nota: per stop superiori a 3 mesi ridurremo il volume iniziale del 30% per prevenire infortuni tendinei.
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => setStep(4)}
              className="w-full min-h-[50px] rounded-2xl bg-accent text-accent-contrast font-bold text-base flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all"
            >
              <span>Continua</span>
              <IconChevronRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 4: Obiettivo */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-txt">Qual è il tuo obiettivo?</h2>
              <p className="text-sm text-muted-txt mt-1">
                Determina serie, ripetizioni, tempi di recupero e intensità dello sforzo.
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                { id: 'forza', title: 'Forza Massima', desc: '3-6 ripetizioni, recuperi 150-180s, massime leve corporee' },
                { id: 'ipertrofia', title: 'Ipertrofia (Massa Muscolare)', desc: '6-12 ripetizioni, recuperi 90-120s, tensione continua' },
                { id: 'resistenza', title: 'Resistenza & Densità', desc: '15-25 ripetizioni, recuperi 45-60s, ritmo cardiaco elevato' },
                { id: 'dimagrimento', title: 'Definizione & Dimagrimento', desc: 'Circuiti a 2 giri, 12-20 ripetizioni, recupero breve' },
                { id: 'generale', title: 'Forma Generale & Benessere', desc: 'Equilibrio armonico tra spinta, trazione e core' }
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setObiettivo(g.id as Goal)}
                  className={`w-full p-4 rounded-xl text-left border transition-all ${
                    obiettivo === g.id
                      ? 'bg-elevated border-accent text-txt'
                      : 'bg-surface border-subtle text-muted-txt'
                  }`}
                >
                  <div className="text-sm font-semibold text-txt">{g.title}</div>
                  <div className="text-xs text-muted-txt mt-0.5">{g.desc}</div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(5)}
              className="w-full min-h-[50px] rounded-2xl bg-accent text-accent-contrast font-bold text-base flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all"
            >
              <span>Continua</span>
              <IconChevronRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 5: Disponibilità */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-txt">Disponibilità settimanale</h2>
              <p className="text-sm text-muted-txt mt-1">
                Strutturiamo lo split di allenamento in base al tuo calendario reale.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-txt mb-2">Giorni a settimana</label>
              <div className="grid grid-cols-5 gap-2">
                {([2, 3, 4, 5, 6] as DaysPerWeek[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setGiorniSettimana(d)}
                    className={`h-12 rounded-xl font-bold text-sm flex items-center justify-center border transition-all tabular-nums ${
                      giorniSettimana === d
                        ? 'bg-elevated border-accent text-accent'
                        : 'bg-surface border-subtle text-muted-txt'
                    }`}
                  >
                    {d} gg
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-txt mt-2">
                {giorniSettimana <= 3 && 'Split: Full Body (spinta, trazione, gambe, core ad ogni sessione)'}
                {giorniSettimana === 4 && 'Split: Upper / Lower alternato (4 sessioni mirate)'}
                {giorniSettimana >= 5 && 'Split: Push / Pull / Legs (alta frequenza e specializzazione)'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-txt mb-2">Durata per sessione</label>
              <div className="grid grid-cols-4 gap-2">
                {([20, 30, 45, 60] as DurationMin[]).map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setDurataSessioneMin(dur)}
                    className={`h-12 rounded-xl font-bold text-sm flex items-center justify-center border transition-all tabular-nums ${
                      durataSessioneMin === dur
                        ? 'bg-elevated border-accent text-accent'
                        : 'bg-surface border-subtle text-muted-txt'
                    }`}
                  >
                    {dur}m
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-txt mt-2">
                {durataSessioneMin === 20 && '4 esercizi concentrati, 2-3 serie ciascuno'}
                {durataSessioneMin === 30 && '5 esercizi, 3 serie ciascuno'}
                {durataSessioneMin === 45 && '6 esercizi completi, 3-4 serie ciascuno'}
                {durataSessioneMin === 60 && '8 esercizi profondi, 4 serie con accessori'}
              </p>
            </div>

            <button
              onClick={() => setStep(6)}
              className="w-full min-h-[50px] rounded-2xl bg-accent text-accent-contrast font-bold text-base flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all"
            >
              <span>Continua</span>
              <IconChevronRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 6: Attrezzatura */}
        {step === 6 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-txt">La tua attrezzatura</h2>
              <p className="text-sm text-muted-txt mt-1">
                Seleziona cosa hai a disposizione. L’app adatterà ogni esercizio.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'pavimento', name: 'Pavimento', mandatory: true },
                { id: 'sbarra', name: 'Sbarra trazioni' },
                { id: 'parallele', name: 'Parallele / Dip bar' },
                { id: 'anelli', name: 'Anelli ginnici' },
                { id: 'elastici', name: 'Elastici (loop)' },
                { id: 'sedia', name: 'Sedia o Panca' },
                { id: 'zaino', name: 'Zaino zavorrabile' },
                { id: 'trx', name: 'TRX o Cinghie' }
              ].map((item) => {
                const isSelected = attrezzatura.includes(item.id as Equipment);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleEquipment(item.id as Equipment)}
                    className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-elevated border-accent text-txt'
                        : 'bg-surface border-subtle text-muted-txt'
                    }`}
                  >
                    <span className="text-xs font-semibold">{item.name}</span>
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center border text-[10px] ${
                        isSelected
                          ? 'bg-accent border-accent text-accent-contrast'
                          : 'border-subtle'
                      }`}
                    >
                      {isSelected && <IconCheck size={12} />}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setStep(7)}
              className="w-full min-h-[50px] rounded-2xl bg-accent text-accent-contrast font-bold text-base flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all"
            >
              <span>Continua</span>
              <IconChevronRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 7: Limitazioni articolari */}
        {step === 7 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-txt">Limitazioni fisiche</h2>
              <p className="text-sm text-muted-txt mt-1">
                Gli esercizi che caricano i distretti selezionati verranno automaticamente esclusi.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'nessuna', name: 'Nessuna limitazione' },
                { id: 'spalla', name: 'Spalla' },
                { id: 'gomito', name: 'Gomito' },
                { id: 'polso', name: 'Polso' },
                { id: 'schiena', name: 'Schiena / Lombari' },
                { id: 'anca', name: 'Anca' },
                { id: 'ginocchio', name: 'Ginocchio' },
                { id: 'caviglia', name: 'Caviglia' }
              ].map((lim) => {
                const isSelected = limitazioni.includes(lim.id as Limitation);
                return (
                  <button
                    key={lim.id}
                    type="button"
                    onClick={() => toggleLimitation(lim.id as Limitation)}
                    className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-elevated border-accent text-txt'
                        : 'bg-surface border-subtle text-muted-txt'
                    }`}
                  >
                    <span className="text-xs font-semibold">{lim.name}</span>
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center border text-[10px] ${
                        isSelected
                          ? 'bg-accent border-accent text-accent-contrast'
                          : 'border-subtle'
                      }`}
                    >
                      {isSelected && <IconCheck size={12} />}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setStep(8)}
              className="w-full min-h-[50px] rounded-2xl bg-accent text-accent-contrast font-bold text-base flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all"
            >
              <span>Continua</span>
              <IconChevronRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 8: Misurazioni iniziali (saltabile) */}
        {step === 8 && (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-txt">Misure corporee</h2>
                <p className="text-sm text-muted-txt mt-0.5">
                  Opzionali. Servono per stimare massa grassa e metabolismo.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep(9)}
                className="text-xs font-semibold text-muted-txt hover:text-txt py-1 px-2.5 rounded-lg border border-subtle"
              >
                Salta
              </button>
            </div>

            {/* Guida SVG anatomica minimale */}
            <div className="flex items-center justify-center p-3 rounded-2xl bg-surface border border-subtle">
              <svg viewBox="0 0 160 180" className="w-32 h-36">
                {/* Sagoma corpo umana */}
                <circle cx="80" cy="24" r="14" fill="none" stroke="var(--color-border)" strokeWidth="2" />
                <path d="M 66 40 L 94 40 L 102 75 L 94 110 L 100 165 L 86 165 L 80 115 L 74 165 L 60 165 L 66 110 L 58 75 Z" fill="none" stroke="var(--color-border)" strokeWidth="2" strokeLinejoin="round" />
                
                {/* Indicatori di misura */}
                {/* Collo */}
                <line x1="45" y1="36" x2="72" y2="36" stroke="var(--color-accent)" strokeWidth="1.5" />
                <circle cx="72" cy="36" r="2.5" fill="var(--color-accent)" />
                <text x="18" y="38" fill="var(--color-accent)" fontSize="8" fontWeight="600">Collo</text>

                {/* Torace */}
                <line x1="115" y1="58" x2="88" y2="58" stroke="var(--color-accent)" strokeWidth="1.5" />
                <circle cx="88" cy="58" r="2.5" fill="var(--color-accent)" />
                <text x="120" y="60" fill="var(--color-accent)" fontSize="8" fontWeight="600">Torace</text>

                {/* Vita */}
                <line x1="45" y1="84" x2="74" y2="84" stroke="var(--color-rest)" strokeWidth="1.5" />
                <circle cx="74" cy="84" r="2.5" fill="var(--color-rest)" />
                <text x="20" y="86" fill="var(--color-rest)" fontSize="8" fontWeight="600">Vita</text>

                {/* Fianchi */}
                <line x1="115" y1="102" x2="88" y2="102" stroke="var(--color-accent)" strokeWidth="1.5" />
                <circle cx="88" cy="102" r="2.5" fill="var(--color-accent)" />
                <text x="120" y="104" fill="var(--color-accent)" fontSize="8" fontWeight="600">Fianchi</text>
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-muted-txt mb-1">Circonferenza vita (cm)</label>
                <input
                  type="number"
                  value={vitaCm}
                  onChange={(e) => setVitaCm(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Es. 82"
                  className="w-full h-11 px-3 rounded-xl bg-surface border border-subtle text-txt tabular-nums"
                />
              </div>
              <div>
                <label className="block text-muted-txt mb-1">Circonferenza collo (cm)</label>
                <input
                  type="number"
                  value={colloCm}
                  onChange={(e) => setColloCm(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Es. 38"
                  className="w-full h-11 px-3 rounded-xl bg-surface border border-subtle text-txt tabular-nums"
                />
              </div>
              <div>
                <label className="block text-muted-txt mb-1">Fianchi (cm, per donne)</label>
                <input
                  type="number"
                  value={fianchiCm}
                  onChange={(e) => setFianchiCm(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Es. 96"
                  className="w-full h-11 px-3 rounded-xl bg-surface border border-subtle text-txt tabular-nums"
                />
              </div>
              <div>
                <label className="block text-muted-txt mb-1">Torace (cm)</label>
                <input
                  type="number"
                  value={toraceCm}
                  onChange={(e) => setToraceCm(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Es. 100"
                  className="w-full h-11 px-3 rounded-xl bg-surface border border-subtle text-txt tabular-nums"
                />
              </div>
            </div>

            <button
              onClick={() => setStep(9)}
              className="w-full min-h-[50px] rounded-2xl bg-accent text-accent-contrast font-bold text-base flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all"
            >
              <span>Procedi ai test fisici</span>
              <IconChevronRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 9: Test Fisici (Wizard interno o schermate sequenziali) */}
        {step === 9 && (
          <div className="space-y-4">
            <div>
              <div className="text-xs font-bold text-accent uppercase tracking-wider">Test Fisici di Livello</div>
              <h2 className="text-2xl font-bold text-txt mt-0.5">Misuriamo la tua forza reale</h2>
              <p className="text-xs text-muted-txt mt-1">
                Regole: 2 minuti di riposo tra i test, fermati al cedimento tecnico (quando la forma si deteriora), inserisci numeri reali.
              </p>
            </div>

            {/* Cronometro opzionale di ausilio */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-subtle">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-txt">Cronometro test:</span>
                <span className="text-lg font-bold text-accent tabular-nums">
                  {Math.floor(timerSec / 60)}:{(timerSec % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setTimerRunning(!timerRunning)}
                  className="p-2 rounded-lg bg-elevated border border-subtle text-txt hover:bg-surface"
                  aria-label={timerRunning ? 'Pausa' : 'Avvia'}
                >
                  {timerRunning ? <IconPause size={16} /> : <IconPlay size={16} />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTimerRunning(false);
                    setTimerSec(0);
                  }}
                  className="p-2 rounded-lg bg-elevated border border-subtle text-muted-txt hover:text-txt"
                  aria-label="Azzera cronometro"
                >
                  <IconRefresh size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-3.5 max-h-[52vh] overflow-y-auto pr-1">
              {/* Test 1: Push-up */}
              <div className="p-3.5 rounded-xl bg-surface border border-subtle space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-txt">1. Massimo Push-up consecutivi</span>
                  <div className="flex gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setPushUpType('completi')}
                      className={`px-2 py-0.5 rounded ${
                        pushUpType === 'completi' ? 'bg-accent text-accent-contrast font-bold' : 'text-muted-txt'
                      }`}
                    >
                      Completi
                    </button>
                    <button
                      type="button"
                      onClick={() => setPushUpType('ginocchia')}
                      className={`px-2 py-0.5 rounded ${
                        pushUpType === 'ginocchia' ? 'bg-accent text-accent-contrast font-bold' : 'text-muted-txt'
                      }`}
                    >
                      Ginocchia
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-muted-txt">
                  Petto tocca leggermente a terra, blocco articolare completo in alto.
                </p>
                <input
                  type="number"
                  min={0}
                  max={120}
                  value={pushUp}
                  onChange={(e) => setPushUp(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full h-11 px-3 rounded-lg bg-elevated border border-subtle text-txt tabular-nums"
                  placeholder="Numero ripetizioni"
                />
              </div>

              {/* Test 2: Trazioni & Dead Hang */}
              <div className="p-3.5 rounded-xl bg-surface border border-subtle space-y-2">
                <span className="text-sm font-semibold text-txt">2. Massimo Trazioni (Pull-up)</span>
                <p className="text-[11px] text-muted-txt">
                  Da braccia completamente distese a mento sopra la sbarra, senza slanci.
                </p>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={pullUp}
                  onChange={(e) => setPullUp(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full h-11 px-3 rounded-lg bg-elevated border border-subtle text-txt tabular-nums"
                  placeholder="Trazioni consecutive"
                />
                {Number(pullUp) === 0 && (
                  <div className="pt-2 border-t border-subtle space-y-1">
                    <label className="block text-[11px] text-rest font-medium">
                      Hai fatto 0 trazioni: quanti secondi riesci a restare appeso (Dead Hang)?
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={300}
                      value={deadHangSec}
                      onChange={(e) => setDeadHangSec(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full h-11 px-3 rounded-lg bg-elevated border border-subtle text-txt tabular-nums"
                      placeholder="Secondi in dead hang"
                    />
                  </div>
                )}
              </div>

              {/* Test 3: Squat */}
              <div className="p-3.5 rounded-xl bg-surface border border-subtle space-y-2">
                <span className="text-sm font-semibold text-txt">3. Massimo Squat a corpo libero</span>
                <p className="text-[11px] text-muted-txt">
                  Accosciata sotto il parallelo, talloni saldi a terra, estensione d’anca completa.
                </p>
                <input
                  type="number"
                  min={0}
                  max={200}
                  value={squat}
                  onChange={(e) => setSquat(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full h-11 px-3 rounded-lg bg-elevated border border-subtle text-txt tabular-nums"
                  placeholder="Numero squat"
                />
              </div>

              {/* Test 4: Plank */}
              <div className="p-3.5 rounded-xl bg-surface border border-subtle space-y-2">
                <span className="text-sm font-semibold text-txt">4. Tenuta massima Plank (secondi)</span>
                <p className="text-[11px] text-muted-txt">
                  Avambracci a terra, glutei stretti e addome attivo. Stop se il bacino cede.
                </p>
                <input
                  type="number"
                  min={0}
                  max={600}
                  value={plankSec}
                  onChange={(e) => setPlankSec(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full h-11 px-3 rounded-lg bg-elevated border border-subtle text-txt tabular-nums"
                  placeholder="Secondi tenuta plank"
                />
              </div>

              {/* Test 5: Dip o Row */}
              <div className="p-3.5 rounded-xl bg-surface border border-subtle space-y-2">
                <span className="text-sm font-semibold text-txt">
                  5. Massimo {dipOrRowType === 'dip' ? 'Dip alle parallele / sedia' : 'Row orizzontali'}
                </span>
                <p className="text-[11px] text-muted-txt">
                  {dipOrRowType === 'dip'
                    ? 'Discesa a 90° al gomito, estensione completa in alto.'
                    : 'Petto tocca la sbarra o tavolo, corpo dritto in asse.'}
                </p>
                <input
                  type="number"
                  min={0}
                  max={80}
                  value={dipOrRow}
                  onChange={(e) => setDipOrRow(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full h-11 px-3 rounded-lg bg-elevated border border-subtle text-txt tabular-nums"
                  placeholder={`Numero di ${dipOrRowType === 'dip' ? 'dip' : 'row'}`}
                />
              </div>

              {/* Test 6: Hollow hold (saltabile) */}
              <div className="p-3.5 rounded-xl bg-surface border border-subtle space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-txt">6. Hollow Hold (opzionale)</span>
                  <span className="text-[10px] text-muted-txt">Saltabile</span>
                </div>
                <p className="text-[11px] text-muted-txt">
                  Schiena lombare schiacciata al suolo, braccia e gambe tese a pochi cm da terra.
                </p>
                <input
                  type="number"
                  min={0}
                  max={300}
                  value={hollowHoldSec}
                  onChange={(e) => setHollowHoldSec(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full h-11 px-3 rounded-lg bg-elevated border border-subtle text-txt tabular-nums"
                  placeholder="Secondi hollow hold"
                />
              </div>
            </div>

            <button
              onClick={handleCalculateResults}
              disabled={pushUp === '' || pullUp === '' || squat === '' || plankSec === '' || dipOrRow === ''}
              className="w-full min-h-[50px] rounded-2xl bg-accent text-accent-contrast font-bold text-base flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-40"
            >
              <span>Elabora i risultati</span>
              <IconChevronRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 10: Risultati e Livelli Calcolati */}
        {step === 10 && assessmentResult && (
          <div className="space-y-4">
            <div>
              <div className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-accent/20 text-accent mb-1">
                Classificazione: {assessmentResult.classificazioneComplessiva}
              </div>
              <h2 className="text-2xl font-bold text-txt">I tuoi livelli di partenza</h2>
              <p className="text-xs text-muted-txt mt-0.5">
                Valori di riferimento per sesso ed età, non un verdetto.
              </p>
            </div>

            <div className="space-y-2.5 max-h-[55vh] overflow-y-auto pr-1">
              {(Object.keys(assessmentResult.livelliCalcolati) as Pattern[]).map((pat) => {
                const lvl = assessmentResult.livelliCalcolati[pat];
                const maxScale = pat === 'spinta_orizzontale' ? 10 : pat === 'trazione_verticale' || pat === 'core_anteriore' ? 8 : pat === 'gambe_spinta' ? 7 : 6;
                const pct = Math.min(100, Math.round((lvl / maxScale) * 100));

                return (
                  <div key={pat} className="p-3 rounded-xl bg-surface border border-subtle space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-txt">{PATTERN_NAMES[pat]}</span>
                      <span className="font-bold text-accent tabular-nums">
                        Livello {lvl} / {maxScale}
                      </span>
                    </div>
                    {/* Barra orizzontale progressione */}
                    <div className="w-full h-2 rounded-full bg-elevated overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setStep(11)}
              className="w-full min-h-[50px] rounded-2xl bg-accent text-accent-contrast font-bold text-base flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all"
            >
              <span>Genera piano settimanale</span>
              <IconChevronRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 11: Anteprima del piano generato */}
        {step === 11 && (
          <div className="space-y-4">
            <div>
              <div className="text-xs font-bold text-accent uppercase tracking-wider">Pronto per iniziare</div>
              <h2 className="text-2xl font-bold text-txt mt-0.5">La tua prima settimana</h2>
              <p className="text-xs text-muted-txt mt-1">
                {giorniSettimana} sessioni da {durataSessioneMin} min, calibrati sui tuoi test fisici.
              </p>
            </div>

            <div className="p-4 rounded-[20px] bg-surface border border-subtle space-y-3">
              <div className="flex justify-between items-center text-xs pb-2 border-b border-subtle">
                <span className="text-muted-txt">Split adottato:</span>
                <span className="font-bold text-txt">
                  {giorniSettimana <= 3 ? 'Full Body' : giorniSettimana === 4 ? 'Upper / Lower' : 'Push / Pull / Legs'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs pb-2 border-b border-subtle">
                <span className="text-muted-txt">Focus obiettivo:</span>
                <span className="font-bold text-accent capitalize">{obiettivo}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-txt">Frequenza test:</span>
                <span className="font-bold text-txt">Ogni 6 settimane</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-elevated border border-subtle text-xs text-muted-txt space-y-1">
              <div className="font-semibold text-txt">La regola d’oro della progressione:</div>
              <p>
                Completa tutte le serie al massimo del range con sensazione fluida e guadagnerai 1 rep alla sessione successiva. Con 2 sessioni consecutive al massimo, sali al livello successivo del pattern!
              </p>
            </div>

            <button
              onClick={handleFinishOnboarding}
              className="w-full min-h-[52px] rounded-2xl bg-accent text-accent-contrast font-bold text-base flex items-center justify-center gap-2 shadow-sm hover:opacity-95 active:scale-[0.98] transition-all"
            >
              <span>Inizia il percorso</span>
              <IconChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
