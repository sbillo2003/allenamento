/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Web Audio synthesizer for 100% offline sound effects
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playBeep(freq = 440, duration = 0.1, type: OscillatorType = 'sine'): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Ignore audio errors gracefully
  }
}

export function playCountdownBeep(isFinal = false): void {
  if (isFinal) {
    playBeep(880, 0.35, 'triangle');
  } else {
    playBeep(520, 0.12, 'sine');
  }
}

export function playRestCompleteSound(): void {
  try {
    playBeep(587.33, 0.12, 'triangle'); // D5
    setTimeout(() => playBeep(739.99, 0.12, 'triangle'), 100); // F#5
    setTimeout(() => playBeep(880, 0.25, 'triangle'), 200); // A5
  } catch {
    // Ignore
  }
}

export function triggerVibration(pattern: number | number[] = 40): void {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    // Ignore unsupported
  }
}

export function speakItalian(text: string): void {
  try {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'it-IT';
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  } catch {
    // Ignore unsupported
  }
}

export async function requestWakeLock(): Promise<WakeLockSentinel | null> {
  try {
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
      return await navigator.wakeLock.request('screen');
    }
  } catch {
    // Wake Lock not supported or rejected
  }
  return null;
}
