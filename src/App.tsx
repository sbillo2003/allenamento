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

      {/* Barra di navigazione in basso fissa con 4 voci */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-subtle pb-safe"
        aria-label="Navigazione principale"
      >
        <div className="max-w-[480px] mx-auto grid grid-cols-4 items-center h-16">
          {/* Tab 1: Oggi */}
          <button
            type="button"
            onClick={() => setActiveTab('oggi')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              activeTab === 'oggi' ? 'text-accent' : 'text-muted-txt hover:text-txt'
            }`}
            aria-label="Schermata Oggi"
          >
            <IconToday size={20} />
            <span className="text-[10px] font-semibold tracking-tight mt-1">Oggi</span>
          </button>

          {/* Tab 2: Piano */}
          <button
            type="button"
            onClick={() => setActiveTab('piano')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              activeTab === 'piano' ? 'text-accent' : 'text-muted-txt hover:text-txt'
            }`}
            aria-label="Schermata Piano"
          >
            <IconPlan size={20} />
            <span className="text-[10px] font-semibold tracking-tight mt-1">Piano</span>
          </button>

          {/* Tab 3: Progressi */}
          <button
            type="button"
            onClick={() => setActiveTab('progressi')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              activeTab === 'progressi' ? 'text-accent' : 'text-muted-txt hover:text-txt'
            }`}
            aria-label="Schermata Progressi"
          >
            <IconProgress size={20} />
            <span className="text-[10px] font-semibold tracking-tight mt-1">Progressi</span>
          </button>

          {/* Tab 4: Profilo */}
          <button
            type="button"
            onClick={() => setActiveTab('profilo')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              activeTab === 'profilo' ? 'text-accent' : 'text-muted-txt hover:text-txt'
            }`}
            aria-label="Schermata Profilo"
          >
            <IconProfile size={20} />
            <span className="text-[10px] font-semibold tracking-tight mt-1">Profilo</span>
          </button>
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
