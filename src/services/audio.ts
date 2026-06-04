import type { CardOutcome } from "../types";

type AudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (audioContext && audioContext.state !== "closed") {
    return audioContext;
  }

  const audioWindow = window as AudioWindow;
  const AudioContextConstructor = audioWindow.AudioContext ?? audioWindow.webkitAudioContext;
  if (!AudioContextConstructor) {
    return null;
  }

  audioContext = new AudioContextConstructor();
  return audioContext;
}

function playSilentUnlock(context: AudioContext): void {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  gain.gain.value = 0;
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.03);
}

export async function primeAudio(): Promise<boolean> {
  const context = getAudioContext();
  if (!context) {
    return false;
  }

  if (context?.state === "suspended") {
    try {
      await context.resume();
    } catch {
      return false;
    }
  }

  if (context.state !== "running") {
    return false;
  }

  try {
    playSilentUnlock(context);
    return true;
  } catch {
    return false;
  }
}

export function playReadyTrill() {
  const context = getAudioContext();
  if (!context) {
    return;
  }

  const play = () => {
    const startAt = context.currentTime;
    [0, 0.1, 0.2].forEach((offset, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = 620 + index * 110;
      gain.gain.setValueAtTime(0.0001, startAt + offset);
      gain.gain.exponentialRampToValueAtTime(0.16, startAt + offset + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + offset + 0.09);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(startAt + offset);
      oscillator.stop(startAt + offset + 0.1);
    });
  };

  if (context.state === "suspended") {
    void primeAudio()
      .then((ready) => {
        if (ready) {
          play();
        }
      })
      .catch(() => undefined);
    return;
  }

  play();
}

export function playOutcomeSound(outcome: CardOutcome) {
  const context = getAudioContext();
  if (!context) {
    return;
  }

  const play = () => {
    const startAt = context.currentTime;
    const frequencies = outcome === "correct" ? [660, 880] : [260, 170];
    frequencies.forEach((frequency, index) => {
      const offset = index * 0.1;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = outcome === "correct" ? "sine" : "triangle";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, startAt + offset);
      gain.gain.exponentialRampToValueAtTime(0.2, startAt + offset + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + offset + 0.16);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(startAt + offset);
      oscillator.stop(startAt + offset + 0.18);
    });
  };

  if (context.state === "suspended") {
    void primeAudio()
      .then((ready) => {
        if (ready) {
          play();
        }
      })
      .catch(() => undefined);
    return;
  }

  play();
}
