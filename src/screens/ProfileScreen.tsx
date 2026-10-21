/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { computeBodyComposition } from '../logic/body';
import { calculateAge } from '../data/standards';
import { Goal, DaysPerWeek, DurationMin, Measurement, Profile, Equipment, Limitation } from '../types';
import {
  IconDownload,
  IconUpload,
  IconTrash,
  IconRefresh,
  IconClose,
  IconCheck,
  IconFlame
} from '../components/Icons';

export function ProfileScreen() {
  const { state, dispatch } = useApp();
  const { profile, measurements, settings } = state;

  const [showAddMeasurement, setShowAddMeasurement] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [pendingProfileChange, setPendingProfileChange] = useState<Partial<Profile> | null>(null);

  // Form per nuova misurazione
  const [newWeight, setNewWeight] = useState<number | ''>(profile?.pesoKg || 70);
  const [newWaist, setNewWaist] = useState<number | ''>('');
  const [newNeck, setNewNeck] = useState<number | ''>('');
  const [newHips, setNewHips] = useState<number | ''>('');

  // Livello di attività per il calcolo TDEE
  const [activityFactor, setActivityFactor] = useState<
    'sedentario' | 'leggero' | 'moderato' | 'intenso'
  >('moderato');

  const age = profile ? calculateAge(profile.dataNascita) : 25;
  const currentWeight = profile?.pesoKg || 70;
  const currentHeight = profile?.altezzaCm || 175;

  const latestMeasurement = measurements.length > 0 ? measurements[0] : null;
  const hasValidMeasurements = Boolean(
    latestMeasurement && latestMeasurement.vitaCm && latestMeasurement.colloCm
  );

  const currentWaist = latestMeasurement?.vitaCm;
  const currentNeck = latestMeasurement?.colloCm;
  const currentHips = latestMeasurement?.fianchiCm;

  const bodyComp = computeBodyComposition(
    profile?.sesso || 'm',
    age,
    currentHeight,
    currentWeight,
    currentWaist,
    currentNeck,
    currentHips
  );

  // Aggiunta nuova misurazione
  const handleSaveMeasurement = () => {
    if (!newWeight || !newWaist || !newNeck) return;
    const m: Measurement = {
      data: new Date().toISOString(),
      pesoKg: Number(newWeight),
      vitaCm: Number(newWaist),
      colloCm: Number(newNeck),
      fianchiCm: newHips ? Number(newHips) : undefined
    };
    dispatch({ type: 'ADD_MEASUREMENT', payload: m });
    // Aggiorna anche il peso nel profilo (senza rigenerare il piano)
    dispatch({ type: 'UPDATE_PROFILE', payload: { pesoKg: Number(newWeight) } });
    setShowAddMeasurement(false);
  };

  // Richiesta di cambio strutturale (richiede conferma perché rigenera il piano)
  const requestStructuralChange = (change: Partial<Profile>) => {
    setPendingProfileChange(change);
  };

  const confirmStructuralChange = () => {
    if (pendingProfileChange) {
      dispatch({ type: 'UPDATE_PROFILE', payload: pendingProfileChange });
      setPendingProfileChange(null);
    }
  };

  // Esportazione JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `calis_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Importazione JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.version === 'calis.v1' && parsed.levels) {
          dispatch({ type: 'IMPORT_STATE', payload: parsed });
          alert('Backup importato con successo!');
        } else {
          alert('File JSON non valido o versione incompatibile.');
        }
      } catch {
        alert('Errore durante la lettura del file JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* 1. Header Profilo */}
      <div className="pt-2">
        <span className="text-xs font-semibold text-accent uppercase tracking-wider">
          Account & Parametri
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-txt mt-0.5">
          {profile?.nome || 'Atleta'}
        </h1>
        <p className="text-xs text-muted-txt mt-0.5">
          {profile?.sesso === 'm' ? 'Uomo' : 'Donna'} · {age} anni · {currentHeight} cm · {currentWeight} kg
        </p>
      </div>

      {/* 2. Composizione Corporea & Fabbisogno */}
      <div className="p-4 rounded-[20px] bg-surface border border-subtle space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold text-txt">Composizione & Fabbisogno</h2>
          <button
            type="button"
            onClick={() => setShowAddMeasurement(true)}
            className="text-xs font-semibold text-accent hover:underline"
          >
            + Nuova misura
          </button>
        </div>

        {!hasValidMeasurements ? (
          /* Stato vuoto quando non sono state inserite vita e collo */
          <div className="p-4 rounded-xl bg-elevated/40 border border-subtle/80 text-center space-y-3">
            <div className="text-xs text-muted-txt leading-relaxed">
              Nessuna misurazione corporea registrata. Inserisci circonferenza vita e collo per calcolare la percentuale di massa grassa con la formula clinica US Navy.
            </div>
            <button
              type="button"
              onClick={() => setShowAddMeasurement(true)}
              className="px-4 py-2.5 rounded-xl bg-accent text-accent-contrast font-bold text-xs hover:opacity-95 active:scale-95 transition-all"
            >
              + Inserisci misure corporee
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-elevated border border-subtle">
              <div className="text-[11px] text-muted-txt">Indice di Massa (BMI)</div>
              <div className="text-xl font-bold text-txt tabular-nums mt-0.5">
                {bodyComp.bmi}
              </div>
              <div className="text-[10px] text-accent font-medium mt-0.5">{bodyComp.bmiCategory}</div>
            </div>

            <div className="p-3 rounded-xl bg-elevated border border-subtle">
              <div className="text-[11px] text-muted-txt">Massa Grassa (stima US Navy)</div>
              <div className="text-xl font-bold text-txt tabular-nums mt-0.5">
                {bodyComp.bodyFatPercent !== null ? `${bodyComp.bodyFatPercent}%` : '—'}
              </div>
              <div className="text-[10px] text-muted-txt mt-0.5">
                Vita {currentWaist} cm · Collo {currentNeck} cm
              </div>
            </div>
          </div>
        )}

        {/* Fabbisogno calorico giornaliero (calcolato da altezza, peso ed età) */}
        <div className="pt-2 border-t border-subtle space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-muted-txt">Metabolismo Basale (BMR):</span>
            <span className="font-bold text-txt tabular-nums">{bodyComp.bmr} kcal</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-muted-txt">Fabbisogno Giornaliero (TDEE):</span>
              <span className="font-bold text-accent tabular-nums">
                {bodyComp.tdee[activityFactor]} kcal
              </span>
            </div>

            {/* Selettore livello attività */}
            <div className="grid grid-cols-4 gap-1 text-[10px] pt-1">
              {(['sedentario', 'leggero', 'moderato', 'intenso'] as const).map((act) => (
                <button
                  key={act}
                  type="button"
                  onClick={() => setActivityFactor(act)}
                  className={`py-1 rounded border capitalize ${
                    activityFactor === act
                      ? 'bg-elevated border-accent text-accent font-bold'
                      : 'border-subtle text-muted-txt hover:text-txt'
                  }`}
                >
                  {act}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Parametri Allenamento (Modificabili con conferma) */}
      <div className="p-4 rounded-[20px] bg-surface border border-subtle space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold text-txt">Parametri Allenamento</h2>
          <span className="text-[10px] text-muted-txt">Rigenera piano su modifica</span>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-muted-txt mb-1">Obiettivo principale</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['forza', 'ipertrofia', 'resistenza', 'dimagrimento', 'generale'] as Goal[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => {
                    if (profile?.obiettivo !== g) {
                      requestStructuralChange({ obiettivo: g });
                    }
                  }}
                  className={`py-2 px-1 rounded-lg border text-[11px] capitalize font-medium ${
                    profile?.obiettivo === g
                      ? 'bg-elevated border-accent text-accent font-bold'
                      : 'bg-elevated/40 border-subtle text-muted-txt hover:text-txt'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-muted-txt mb-1">Giorni settimanali</label>
              <select
                value={profile?.giorniSettimana || 3}
                onChange={(e) => {
                  const val = Number(e.target.value) as DaysPerWeek;
                  if (profile?.giorniSettimana !== val) {
                    requestStructuralChange({ giorniSettimana: val });
                  }
                }}
                className="w-full h-10 px-2 rounded-lg bg-elevated border border-subtle text-txt font-semibold"
              >
                {[2, 3, 4, 5, 6].map((d) => (
                  <option key={d} value={d}>
                    {d} giorni ({d <= 3 ? 'Full Body' : d === 4 ? 'Upper/Lower' : 'PPL'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-muted-txt mb-1">Durata sessione</label>
              <select
                value={profile?.durataSessioneMin || 45}
                onChange={(e) => {
                  const val = Number(e.target.value) as DurationMin;
                  if (profile?.durataSessioneMin !== val) {
                    requestStructuralChange({ durataSessioneMin: val });
                  }
                }}
                className="w-full h-10 px-2 rounded-lg bg-elevated border border-subtle text-txt font-semibold"
              >
                {[20, 30, 45, 60].map((m) => (
                  <option key={m} value={m}>
                    {m} minuti
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Impostazioni App & Player */}
      <div className="p-4 rounded-[20px] bg-surface border border-subtle space-y-3">
        <h2 className="text-sm font-bold text-txt">Impostazioni & Feedback</h2>

        <div className="space-y-2 text-xs divide-y divide-subtle/40">
          {/* Tema chiaro / scuro */}
          <div className="flex justify-between items-center py-2">
            <div>
              <div className="font-semibold text-txt">Tema scuro / chiaro</div>
              <div className="text-[10px] text-muted-txt">Alterna tra dark e light</div>
            </div>
            <button
              type="button"
              onClick={() =>
                dispatch({
                  type: 'UPDATE_SETTINGS',
                  payload: { tema: settings.tema === 'dark' ? 'light' : 'dark' }
                })
              }
              className="px-3 py-1.5 rounded-lg bg-elevated border border-subtle font-semibold text-txt capitalize"
            >
              {settings.tema === 'dark' ? 'Scuro' : 'Chiaro'}
            </button>
          </div>

          {/* Suoni Web Audio */}
          <div className="flex justify-between items-center py-2">
            <div>
              <div className="font-semibold text-txt">Effetti sonori e bip</div>
              <div className="text-[10px] text-muted-txt">Sintetizzatore offline per 3-2-1 e fine recupero</div>
            </div>
            <button
              type="button"
              onClick={() =>
                dispatch({ type: 'UPDATE_SETTINGS', payload: { suoni: !settings.suoni } })
              }
              className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                settings.suoni ? 'bg-accent justify-end' : 'bg-elevated justify-start'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-canvas shadow-sm" />
            </button>
          </div>

          {/* Voce guida italiana */}
          <div className="flex justify-between items-center py-2">
            <div>
              <div className="font-semibold text-txt">Voce guida in italiano</div>
              <div className="text-[10px] text-muted-txt">Annuncia esercizi e fine tempi di riposo</div>
            </div>
            <button
              type="button"
              onClick={() =>
                dispatch({ type: 'UPDATE_SETTINGS', payload: { voce: !settings.voce } })
              }
              className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                settings.voce ? 'bg-accent justify-end' : 'bg-elevated justify-start'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-canvas shadow-sm" />
            </button>
          </div>

          {/* Vibrazione aptica */}
          <div className="flex justify-between items-center py-2">
            <div>
              <div className="font-semibold text-txt">Vibrazione aptica</div>
              <div className="text-[10px] text-muted-txt">Feedback tattile al completamento serie</div>
            </div>
            <button
              type="button"
              onClick={() =>
                dispatch({ type: 'UPDATE_SETTINGS', payload: { vibrazione: !settings.vibrazione } })
              }
              className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                settings.vibrazione ? 'bg-accent justify-end' : 'bg-elevated justify-start'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-canvas shadow-sm" />
            </button>
          </div>

          {/* Recupero automatico */}
          <div className="flex justify-between items-center py-2">
            <div>
              <div className="font-semibold text-txt">Avvio automatico recupero</div>
              <div className="text-[10px] text-muted-txt">Parte istantaneamente dopo aver spuntato la serie</div>
            </div>
            <button
              type="button"
              onClick={() =>
                dispatch({
                  type: 'UPDATE_SETTINGS',
                  payload: { recuperoAutomatico: !settings.recuperoAutomatico }
                })
              }
              className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                settings.recuperoAutomatico ? 'bg-accent justify-end' : 'bg-elevated justify-start'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-canvas shadow-sm" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Gestione Dati, Backup e Demo */}
      <div className="p-4 rounded-[20px] bg-surface border border-subtle space-y-3">
        <h2 className="text-sm font-bold text-txt">Dati e Backup (100% Locale)</h2>
        <p className="text-[11px] text-muted-txt">
          Tutti i dati risiedono nel tuo browser sotto la chiave versionata <code className="text-accent font-mono">calis.v1</code>.
        </p>

        <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
          <button
            type="button"
            onClick={handleExportJSON}
            className="p-3 rounded-xl bg-elevated border border-subtle flex items-center justify-center gap-2 font-semibold text-txt hover:bg-surface transition-colors"
          >
            <IconDownload size={16} />
            <span>Esporta JSON</span>
          </button>

          <label className="p-3 rounded-xl bg-elevated border border-subtle flex items-center justify-center gap-2 font-semibold text-txt hover:bg-surface cursor-pointer transition-colors">
            <IconUpload size={16} />
            <span>Importa JSON</span>
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>
        </div>

        {/* Pulsante Carica Dati Dimostrativi */}
        <button
          type="button"
          onClick={() => {
            dispatch({ type: 'LOAD_DEMO_DATA' });
            alert('Dati dimostrativi caricati! 8 settimane di storico, misure e grafici popolati.');
          }}
          className="w-full min-h-[46px] rounded-xl bg-elevated border border-accent/40 text-accent font-bold text-xs flex items-center justify-center gap-2 hover:bg-surface transition-all"
        >
          <IconRefresh size={16} />
          <span>Carica dati dimostrativi (8 settimane)</span>
        </button>

        {/* Pulsante Azzera Tutto */}
        <button
          type="button"
          onClick={() => setShowConfirmReset(true)}
          className="w-full min-h-[42px] rounded-xl bg-error/10 border border-error/30 text-error font-semibold text-xs flex items-center justify-center gap-2 hover:bg-error/20 transition-all"
        >
          <IconTrash size={15} />
          <span>Azzera tutti i dati dell’app</span>
        </button>
      </div>

      {/* MODALE CONFERMA RIGENERAZIONE PIANO */}
      {pendingProfileChange && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-surface border border-subtle rounded-2xl p-5 max-w-sm w-full space-y-4 text-center">
            <h3 className="text-base font-bold text-txt">Rigenerare il piano settimanale?</h3>
            <p className="text-xs text-muted-txt leading-relaxed">
              La modifica di questo parametro strutturale rigenererà tutte le sessioni del programma. Eventuali scambi di esercizi e spostamenti di giorni effettuati manualmente andranno persi.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPendingProfileChange(null)}
                className="h-11 rounded-xl bg-elevated border border-subtle text-xs font-semibold text-txt"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={confirmStructuralChange}
                className="h-11 rounded-xl bg-accent text-accent-contrast font-bold text-xs"
              >
                Conferma e rigenera
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE NUOVA MISURAZIONE */}
      {showAddMeasurement && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-surface border border-subtle rounded-2xl p-5 max-w-sm w-full space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-txt">Registra Misurazione</h3>
              <button
                onClick={() => setShowAddMeasurement(false)}
                className="w-8 h-8 rounded-lg bg-elevated flex items-center justify-center text-muted-txt"
              >
                <IconClose size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-muted-txt mb-1">Peso attuale (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl bg-elevated border border-subtle text-txt tabular-nums"
                />
              </div>

              <div>
                <label className="block text-muted-txt mb-1">Circonferenza vita (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  value={newWaist}
                  onChange={(e) => setNewWaist(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl bg-elevated border border-subtle text-txt tabular-nums"
                />
              </div>

              <div>
                <label className="block text-muted-txt mb-1">Circonferenza collo (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  value={newNeck}
                  onChange={(e) => setNewNeck(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl bg-elevated border border-subtle text-txt tabular-nums"
                />
              </div>

              <div>
                <label className="block text-muted-txt mb-1">Fianchi (cm, opzionale)</label>
                <input
                  type="number"
                  step="0.5"
                  value={newHips}
                  onChange={(e) => setNewHips(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl bg-elevated border border-subtle text-txt tabular-nums"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddMeasurement(false)}
                className="h-10 rounded-xl bg-elevated border border-subtle text-xs font-semibold text-txt"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleSaveMeasurement}
                disabled={!newWeight || !newWaist || !newNeck}
                className="h-10 rounded-xl bg-accent text-accent-contrast text-xs font-bold disabled:opacity-40"
              >
                Salva misura
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE CONFERMA AZZERA */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-surface border border-subtle rounded-2xl p-5 max-w-sm w-full space-y-4 text-center">
            <h3 className="text-base font-bold text-error">Sei sicuro di voler azzerare tutto?</h3>
            <p className="text-xs text-muted-txt">
              Questa azione cancellerà tutti i test, lo storico allenamenti, il piano e le misurazioni salvate in locale.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmReset(false)}
                className="h-11 rounded-xl bg-elevated border border-subtle text-xs font-semibold text-txt"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmReset(false);
                  dispatch({ type: 'RESET_ALL' });
                }}
                className="h-11 rounded-xl bg-error text-white font-bold text-xs"
              >
                Azzera adesso
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
