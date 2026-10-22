/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './store/AppContext';
import { OnboardingWizard } from './screens/OnboardingWizard';
import { TodayScreen } from './screens/TodayScreen';
import { PlanScreen } from './screens/PlanScreen';
import { ProgressScreen } from './screens/ProgressScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { PlayerScreen } from './screens/PlayerScreen';
import { RetestScreen } from './screens/RetestScreen';
import { PlannedSession, ActiveWorkoutState } from './types';
import { IconToday, IconPlan, IconProgress, IconProfile } from './components/Icons';

type Tab = 'oggi' | 'piano' | 'progressi' | 'profilo';

const VOCI: { id: Tab; etichetta: string; Icona: typeof IconToday }[] = [
  { id: 'oggi', etichetta: 'Oggi', Icona: IconToday },
  { id: 'piano', etichetta: 'Piano', Icona: IconPlan },
  { id: 'progressi', etichetta: 'Progressi', Icona: IconProgress },
  { id: 'profilo', etichetta: 'Profilo', Icona: IconProfile }
];

function AppContent() {
  const { state, dispatch, isCorrupted, clearCorrupted } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>('oggi');
  const [activeWorkoutSession, setActiveWorkoutSession] = useState<PlannedSession | null>(null);
  const [resumedActiveState, setResumedActiveState] = useState<ActiveWorkoutState | null>(null);
  const [showRetestModal, setShowRetestModal] = useState(false);

  // Support ?autostart=1 to automatically seed and start if requested
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1' && !state.onboarded) {
        dispatch({ type: 'LOAD_DEMO_DATA' });
      }
    }
  }, [state.onboarded, dispatch]);

  const handleStartWorkout = (
    session: PlannedSession,
    resumeState?: ActiveWorkoutState | null
  ) => {
    setResumedActiveState(resumeState || null);
    setActiveWorkoutSession(session);
  };

  const handleClosePlayer = () => {
    setActiveWorkoutSession(null);
    setResumedActiveState(null);
  };

  // Gestione stato corrotto da localStorage
  if (isCorrupted) {
    return (
      <div className="min-h-screen bg-canvas text-txt flex items-center justify-center p-6 max-w-[480px] mx-auto">
        <div className="p-6 rounded-[20px] bg-surface border border-error/40 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h2 className="text-lg font-bold text-txt">Dati Locali Non Validi</h2>
          <p className="text-xs text-muted-txt leading-relaxed">
            I dati salvati in memoria appartengono a una versione precedente o sono stati alterati. Puoi ripartire da zero in totale sicurezza.
          </p>
          <button
            onClick={clearCorrupted}
            className="w-full h-12 rounded-xl bg-accent text-accent-contrast font-bold text-sm"
          >
            Riparti da zero
          </button>
        </div>
      </div>
    );
  }

  // Se l'utente non ha completato l'onboarding, mostra il wizard
  if (!state.onboarded) {
    return <OnboardingWizard />;
  }

  // Player dell'allenamento a schermo intero (nasconde la navbar in basso)
  if (activeWorkoutSession) {
    return (
      <PlayerScreen
        session={activeWorkoutSession}
        resumedState={resumedActiveState}
        onClose={handleClosePlayer}
      />
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-txt">
      <main className="max-w-[480px] mx-auto min-h-screen px-4 pt-4 pb-20 flex flex-col">
        {activeTab === 'oggi' && (
          <TodayScreen
            onStartWorkout={handleStartWorkout}
            onOpenRetest={() => setShowRetestModal(true)}
          />
        )}
        {activeTab === 'piano' && <PlanScreen onStartWorkout={handleStartWorkout} />}
        {activeTab === 'progressi' && <ProgressScreen />}
        {activeTab === 'profilo' && <ProfileScreen />}
      </main>

      {/* Schermata di Ri-Test Fisico (modale a schermo intero) */}
      {showRetestModal && (
        <RetestScreen onClose={() => setShowRetestModal(false)} />
      )}

      {/* Barra di navigazione a pillola, galleggiante sopra i contenuti */}
      <nav
        className="fixed inset-x-0 z-40 px-4 pointer-events-none"
        style={{ bottom: 'max(12px, env(safe-area-inset-bottom))' }}
        aria-label="Navigazione principale"
      >
        <div
          className="max-w-[360px] mx-auto grid grid-cols-4 items-center gap-1 p-1.5 rounded-full border border-subtle backdrop-blur-md pointer-events-auto"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--color-surface) 92%, transparent)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)'
          }}
        >
          {VOCI.map(({ id, etichetta, Icona }) => {
            const attiva = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                aria-label={`Schermata ${etichetta}`}
                aria-current={attiva ? 'page' : undefined}
                className={`flex flex-col items-center justify-center h-12 min-h-[44px] rounded-full transition-colors ${
                  attiva ? 'text-accent' : 'text-muted-txt hover:text-txt'
                }`}
                style={
                  attiva
                    ? { backgroundColor: 'color-mix(in srgb, var(--color-accent) 14%, transparent)' }
                    : undefined
                }
              >
                <Icona size={20} />
                <span className="text-[10px] font-semibold tracking-tight mt-0.5">{etichetta}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
