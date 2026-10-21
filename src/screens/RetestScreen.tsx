/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { AssessmentResult, Pattern } from '../types';
import { evaluateAssessment } from '../logic/assessment';
import { PATTERN_NAMES } from '../data/exercises';
import {
  IconClose,
  IconChevronRight,
  IconChevronLeft,
  IconCheck,
  IconPlay,
  IconPause,
  IconRefresh,
  IconTrophy
} from '../components/Icons';

interface RetestScreenProps {
  onClose: () => void;
}

export function RetestScreen({ onClose }: RetestScreenProps) {
  const { state, dispatch } = useApp();
  const { profile, assessments } = state;
  const previous = assessments[0];

  // Test inputs, pre-populated with previous or defaults
  const [step, setStep] = useState(1);
  const [pushUp, setPushUp] = useState<number | ''>(previous?.pushUp || 12);
  const [pushUpType, setPushUpType] = useState<'completi' | 'ginocchia'>(previous?.pushUpType || 'completi');
  const [pullUp, setPullUp] = useState<number | ''>(previous?.pullUp || 4);
  const [deadHangSec, setDeadHangSec] = useState<number | ''>(previous?.deadHangSec || 35);
  const [squat, setSquat] = useState<number | ''>(previous?.squat || 30);
  const [plankSec, setPlankSec] = useState<number | ''>(previous?.plankSec || 60);
  const [dipOrRowType, setDipOrRowType] = useState<'dip' | 'row'>(previous?.dipOrRowType || 'dip');
  const [dipOrRow, setDipOrRow] = useState<number | ''>(previous?.dipOrRow || 6);
  const [hollowHoldSec, setHollowHoldSec] = useState<number | ''>(previous?.hollowHoldSec || 30);

  // Timer per i test isometrici
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSec, setTimerSec] = useState(0);

  // Risultato calcolato
  const [newResult, setNewResult] = useState<AssessmentResult | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerSec((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const handleComputeResults = () => {
    if (!profile) return;
    const input = {
      sex: profile.sesso,
      birthDate: profile.dataNascita,
      mesiInattivita: 0,
      equipment: profile.attrezzatura,
      pushUp: Number(pushUp) || 0,
      pushUpType,
      pullUp: Number(pullUp) || 0,
      deadHangSec: Number(deadHangSec) || 0,
      squat: Number(squat) || 0,
      plankSec: Number(plankSec) || 0,
      dipOrRowType,
      dipOrRow: Number(dipOrRow) || 0,
      hollowHoldSec: hollowHoldSec !== '' ? Number(hollowHoldSec) : undefined
    };

    const res = evaluateAssessment(input);
    setNewResult(res);
    setStep(7); // Vai al confronto
  };

  const handleConfirmRetest = () => {
    if (!newResult) return;
    dispatch({
      type: 'COMPLETE_RETEST',
      payload: { assessment: newResult }
    });
    onClose();
  };

  const totalSteps = 7;

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0E13] text-[#F2F6FA] flex flex-col justify-between max-w-[480px] mx-auto p-5 overflow-y-auto">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pb-3">
          {step > 1 && step < 7 ? (
            <button
              onClick={() => {
                setTimerRunning(false);
                setStep((s) => s - 1);
              }}
              className="w-10 h-10 rounded-xl bg-surface border border-subtle flex items-center justify-center text-muted-txt hover:text-txt"
            >
              <IconChevronLeft size={18} />
            </button>
          ) : (
            <div className="w-10 h-10" />
          )}

          <div className="text-center">
            <span className="text-[11px] font-semibold text-accent uppercase tracking-wider">
              {step === 7 ? 'Confronto Risultati' : `Test Fisico ${step} di 6`}
            </span>
            <div className="text-xs text-muted-txt">Ri-Test di Progressione</div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-surface border border-subtle flex items-center justify-center text-muted-txt hover:text-txt"
          >
            <IconClose size={18} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-surface rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${Math.round((step / totalSteps) * 100)}%` }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center py-2">
        {/* PASSO 1: PUSH-UP */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold text-accent uppercase tracking-wider">Test 1 · Spinta Orizzontale</span>
              <h2 className="text-2xl font-bold text-txt mt-0.5">Push-up Massimali</h2>
              <p className="text-xs text-muted-txt mt-1">
                Petto a 2 cm dal pavimento a ogni ripetizione, gomiti a 45°, corpo rigido senza inarcamento.
              </p>
            </div>

            {previous && (
              <div className="p-3 rounded-xl bg-elevated border border-subtle flex justify-between items-center text-xs">
                <span className="text-muted-txt">Test precedente:</span>
                <span className="font-bold text-accent tabular-nums">
                  {previous.pushUp} reps ({previous.pushUpType})
                </span>
              </div>
            )}

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPushUpType('completi')}
                  className={`py-2.5 rounded-xl border text-xs font-bold ${
                    pushUpType === 'completi'
                      ? 'bg-elevated border-accent text-accent'
                      : 'border-subtle text-muted-txt'
                  }`}
                >
                  Completi (a terra)
                </button>
                <button
                  type="button"
                  onClick={() => setPushUpType('ginocchia')}
                  className={`py-2.5 rounded-xl border text-xs font-bold ${
                    pushUpType === 'ginocchia'
                      ? 'bg-elevated border-accent text-accent'
                      : 'border-subtle text-muted-txt'
                  }`}
                >
                  Sulle ginocchia
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-txt mb-1">Ripetizioni completate</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={pushUp}
                  onChange={(e) => setPushUp(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full h-12 px-4 rounded-xl bg-surface border border-subtle text-txt font-bold text-lg tabular-nums"
                />
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full min-h-[50px] rounded-2xl bg-accent text-accent-contrast font-bold text-sm flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all"
            >
              <span>Continua</span>
              <IconChevronRight size={18} />
            </button>
          </div>
        )}

        {/* PASSO 2: PULL-UP / DEAD HANG */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold text-accent uppercase tracking-wider">Test 2 · Trazione Verticale</span>
              <h2 className="text-2xl font-bold text-txt mt-0.5">Trazioni alla Sbarra</h2>
              <p className="text-xs text-muted-txt mt-1">
                Presa prona o supina, mento sopra la sbarra, braccia completamente distese in basso.
              </p>
            </div>

            {previous && (
              <div className="p-3 rounded-xl bg-elevated border border-subtle flex justify-between items-center text-xs">
                <span className="text-muted-txt">Test precedente:</span>
                <span className="font-bold text-accent tabular-nums">
                  {previous.pullUp > 0 ? `${previous.pullUp} trazioni` : `Dead hang: ${previous.deadHangSec}s`}
                </span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-muted-txt mb-1">Trazioni complete (0 se non riesci ancora)</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={pullUp}
                  onChange={(e) => setPullUp(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full h-12 px-4 rounded-xl bg-surface border border-subtle text-txt font-bold text-lg tabular-nums"
                />
              </div>

              {Number(pullUp) === 0 && (
                <div className="p-3 rounded-xl bg-surface border border-subtle space-y-2">
                  <div className="text-xs text-muted-txt">Test alternativo: Secondi di sospensione passiva (Dead Hang)</div>
                  <input
                    type="number"
                    min="0"
                    max="180"
                    placeholder="Secondi"
                    value={deadHangSec}
                    onChange={(e) => setDeadHangSec(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg bg-elevated border border-subtle text-txt font-bold tabular-nums"
                  />
                </div>
              )}
            </div>

            <button
              onClick={() => setStep(3)}
              className="w-full min-h-[50px] rounded-2xl bg-accent text-accent-contrast font-bold text-sm flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all"
            >
              <span>Continua</span>
              <IconChevronRight size={18} />
            </button>
          </div>
        )}

        {/* PASSO 3: SQUAT */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold text-accent uppercase tracking-wider">Test 3 · Gambe Spinta</span>
              <h2 className="text-2xl font-bold text-txt mt-0.5">Squat a Corpo Libero</h2>
              <p className="text-xs text-muted-txt mt-1">
                Cosce parallele al pavimento o sotto il parallelo, talloni saldi, ritmo costante per 60 secondi.
              </p>
            </div>

            {previous && (
              <div className="p-3 rounded-xl bg-elevated border border-subtle flex justify-between items-center text-xs">
                <span className="text-muted-txt">Test precedente:</span>
                <span className="font-bold text-accent tabular-nums">{previous.squat} reps</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-muted-txt mb-1">Ripetizioni valide</label>
              <input
                type="number"
                min="0"
                max="120"
                value={squat}
                onChange={(e) => setSquat(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full h-12 px-4 rounded-xl bg-surface border border-subtle text-txt font-bold text-lg tabular-nums"
              />
            </div>

            <button
              onClick={() => setStep(4)}
              className="w-full min-h-[50px] rounded-2xl bg-accent text-accent-contrast font-bold text-sm flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all"
            >
              <span>Continua</span>
              <IconChevronRight size={18} />
            </button>
          </div>
        )}

        {/* PASSO 4: PLANK */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold text-accent uppercase tracking-wider">Test 4 · Core Anteriore</span>
              <h2 className="text-2xl font-bold text-txt mt-0.5">Plank Isometrico</h2>
              <p className="text-xs text-muted-txt mt-1">
                Avambracci a terra, glutei e addome contratti al massimo, stop quando il bacino cede.
              </p>
            </div>

            {previous && (
              <div className="p-3 rounded-xl bg-elevated border border-subtle flex justify-between items-center text-xs">
                <span className="text-muted-txt">Test precedente:</span>
                <span className="font-bold text-accent tabular-nums">{previous.plankSec} secondi</span>
              </div>
            )}

            {/* Cronometro integrato */}
            <div className="p-4 rounded-xl bg-surface border border-subtle flex items-center justify-between">
              <div>
                <div className="text-[10px] text-muted-txt uppercase">Cronometro Plank</div>
                <div className="text-2xl font-bold text-accent tabular-nums">{timerSec}s</div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTimerRunning(!timerRunning)}
                  className="px-3 py-2 rounded-lg bg-elevated border border-subtle text-xs font-bold text-txt flex items-center gap-1.5"
                >
                  {timerRunning ? <IconPause size={14} /> : <IconPlay size={14} />}
                  <span>{timerRunning ? 'Ferma' : 'Avvia'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPlankSec(timerSec);
                    setTimerRunning(false);
                  }}
                  className="px-3 py-2 rounded-lg bg-accent text-accent-contrast text-xs font-bold"
                >
                  Usa tempo
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-txt mb-1">Secondi di tenuta</label>
              <input
                type="number"
                min="0"
                max="300"
                value={plankSec}
                onChange={(e) => setPlankSec(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full h-12 px-4 rounded-xl bg-surface border border-subtle text-txt font-bold text-lg tabular-nums"
              />
            </div>

            <button
              onClick={() => {
                setTimerRunning(false);
                setTimerSec(0);
                setStep(5);
              }}
              className="w-full min-h-[50px] rounded-2xl bg-accent text-accent-contrast font-bold text-sm flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all"
            >
              <span>Continua</span>
              <IconChevronRight size={18} />
            </button>
          </div>
        )}

        {/* PASSO 5: DIP O ROW */}
        {step === 5 && (
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold text-accent uppercase tracking-wider">Test 5 · Dip o Row Orizzontale</span>
              <h2 className="text-2xl font-bold text-txt mt-0.5">Test di Forza Complementare</h2>
              <p className="text-xs text-muted-txt mt-1">
                Scegli in base all'attrezzatura disponibile.
              </p>
            </div>

            {previous && (
              <div className="p-3 rounded-xl bg-elevated border border-subtle flex justify-between items-center text-xs">
                <span className="text-muted-txt">Test precedente:</span>
                <span className="font-bold text-accent tabular-nums">
                  {previous.dipOrRow} reps ({previous.dipOrRowType === 'dip' ? 'Dip' : 'Row'})
                </span>
              </div>
            )}

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDipOrRowType('dip')}
                  className={`py-2.5 rounded-xl border text-xs font-bold ${
                    dipOrRowType === 'dip'
                      ? 'bg-elevated border-accent text-accent'
                      : 'border-subtle text-muted-txt'
                  }`}
                >
                  Dip alle parallele
                </button>
                <button
                  type="button"
                  onClick={() => setDipOrRowType('row')}
                  className={`py-2.5 rounded-xl border text-xs font-bold ${
                    dipOrRowType === 'row'
                      ? 'bg-elevated border-accent text-accent'
                      : 'border-subtle text-muted-txt'
                  }`}
                >
                  Row orizzontale
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-txt mb-1">Ripetizioni completate</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={dipOrRow}
                  onChange={(e) => setDipOrRow(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full h-12 px-4 rounded-xl bg-surface border border-subtle text-txt font-bold text-lg tabular-nums"
                />
              </div>
            </div>

            <button
              onClick={() => setStep(6)}
              className="w-full min-h-[50px] rounded-2xl bg-accent text-accent-contrast font-bold text-sm flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all"
            >
              <span>Continua</span>
              <IconChevronRight size={18} />
            </button>
          </div>
        )}

        {/* PASSO 6: HOLLOW HOLD (OPZIONALE) */}
        {step === 6 && (
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold text-accent uppercase tracking-wider">Test 6 · Core Avanzato</span>
              <h2 className="text-2xl font-bold text-txt mt-0.5">Hollow Body Hold</h2>
              <p className="text-xs text-muted-txt mt-1">
                Lombari incollati al suolo, gambe tese a 45°, braccia distese dietro le orecchie.
              </p>
            </div>

            {previous?.hollowHoldSec && (
              <div className="p-3 rounded-xl bg-elevated border border-subtle flex justify-between items-center text-xs">
                <span className="text-muted-txt">Test precedente:</span>
                <span className="font-bold text-accent tabular-nums">{previous.hollowHoldSec} secondi</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-muted-txt mb-1">Secondi di tenuta (facoltativo)</label>
              <input
                type="number"
                min="0"
                max="120"
                placeholder="es. 30 (opzionale)"
                value={hollowHoldSec}
                onChange={(e) => setHollowHoldSec(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full h-12 px-4 rounded-xl bg-surface border border-subtle text-txt font-bold text-lg tabular-nums"
              />
            </div>

            <button
              onClick={handleComputeResults}
              className="w-full min-h-[52px] rounded-2xl bg-accent text-accent-contrast font-bold text-base flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all"
            >
              <IconCheck size={20} />
              <span>Calcola nuovi livelli e confronta</span>
            </button>
          </div>
        )}

        {/* PASSO 7: CONFRONTO COMPLETO RISULTATI */}
        {step === 7 && newResult && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/30 text-accent flex items-center justify-center mx-auto">
                <IconTrophy size={24} />
              </div>
              <h2 className="text-xl font-bold text-txt">Confronto Ri-Test</h2>
              <div className="text-xs text-muted-txt">
                Classificazione:{' '}
                <span className="line-through text-muted-txt mr-1">{previous?.classificazioneComplessiva || 'Principiante'}</span>
                <span className="text-accent font-bold">→ {newResult.classificazioneComplessiva}</span>
              </div>
            </div>

            {/* Tabella delta test fisici */}
            <div className="p-4 rounded-[20px] bg-surface border border-subtle space-y-2.5 text-xs">
              <div className="font-semibold text-txt text-xs pb-1 border-b border-subtle">Progressione nei Test:</div>

              <div className="flex justify-between items-center py-1 border-b border-subtle/50">
                <span className="text-muted-txt">Push-up ({newResult.pushUpType})</span>
                <div className="tabular-nums font-bold">
                  <span className="text-muted-txt">{previous?.pushUp || 0}</span>
                  <span className="mx-1.5 text-muted-txt">→</span>
                  <span className="text-txt">{newResult.pushUp}</span>
                  {newResult.pushUp >= (previous?.pushUp || 0) ? (
                    <span className="text-accent ml-2">+{newResult.pushUp - (previous?.pushUp || 0)}</span>
                  ) : (
                    <span className="text-error ml-2">{newResult.pushUp - (previous?.pushUp || 0)}</span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-subtle/50">
                <span className="text-muted-txt">Trazioni (Pull-up)</span>
                <div className="tabular-nums font-bold">
                  <span className="text-muted-txt">{previous?.pullUp || 0}</span>
                  <span className="mx-1.5 text-muted-txt">→</span>
                  <span className="text-txt">{newResult.pullUp}</span>
                  {newResult.pullUp >= (previous?.pullUp || 0) && (
                    <span className="text-accent ml-2">+{newResult.pullUp - (previous?.pullUp || 0)}</span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-subtle/50">
                <span className="text-muted-txt">Squat (60s)</span>
                <div className="tabular-nums font-bold">
                  <span className="text-muted-txt">{previous?.squat || 0}</span>
                  <span className="mx-1.5 text-muted-txt">→</span>
                  <span className="text-txt">{newResult.squat}</span>
                  {newResult.squat >= (previous?.squat || 0) && (
                    <span className="text-accent ml-2">+{newResult.squat - (previous?.squat || 0)}</span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-subtle/50">
                <span className="text-muted-txt">Plank (sec)</span>
                <div className="tabular-nums font-bold">
                  <span className="text-muted-txt">{previous?.plankSec || 0}s</span>
                  <span className="mx-1.5 text-muted-txt">→</span>
                  <span className="text-txt">{newResult.plankSec}s</span>
                  {newResult.plankSec >= (previous?.plankSec || 0) && (
                    <span className="text-accent ml-2">+{newResult.plankSec - (previous?.plankSec || 0)}s</span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-muted-txt">Dip / Row</span>
                <div className="tabular-nums font-bold">
                  <span className="text-muted-txt">{previous?.dipOrRow || 0}</span>
                  <span className="mx-1.5 text-muted-txt">→</span>
                  <span className="text-txt">{newResult.dipOrRow}</span>
                  {newResult.dipOrRow >= (previous?.dipOrRow || 0) && (
                    <span className="text-accent ml-2">+{newResult.dipOrRow - (previous?.dipOrRow || 0)}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Tabella Livelli per Pattern */}
            <div className="p-4 rounded-[20px] bg-surface border border-subtle space-y-2 text-xs">
              <div className="font-semibold text-txt text-xs pb-1 border-b border-subtle">Aggiornamento Livelli Pattern:</div>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(newResult.livelliCalcolati) as Pattern[]).map((pat) => {
                  const oldLvl = previous?.livelliCalcolati[pat] || 1;
                  const newLvl = newResult.livelliCalcolati[pat] || 1;
                  const isUp = newLvl > oldLvl;

                  return (
                    <div key={pat} className="p-2 rounded-xl bg-elevated border border-subtle flex justify-between items-center">
                      <span className="text-[11px] text-muted-txt truncate pr-1">{PATTERN_NAMES[pat]}</span>
                      <div className="tabular-nums font-bold text-xs shrink-0">
                        <span className="text-muted-txt">{oldLvl}</span>
                        <span className="mx-1 text-muted-txt">→</span>
                        <span className={isUp ? 'text-accent' : 'text-txt'}>{newLvl}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pulsante conferma finale */}
            <button
              onClick={handleConfirmRetest}
              className="w-full min-h-[52px] rounded-2xl bg-accent text-accent-contrast font-bold text-base flex items-center justify-center gap-2 shadow-sm hover:opacity-95 active:scale-[0.98] transition-all"
            >
              <IconCheck size={20} />
              <span>Aggiorna piano con i nuovi livelli</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
