import { useCallback, useEffect, useMemo, useState } from "react";
import { CountdownScreen } from "./components/CountdownScreen";
import { DeckEditor } from "./components/DeckEditor";
import { DeckSelectScreen } from "./components/DeckSelectScreen";
import { EndRoundScreen } from "./components/EndRoundScreen";
import { ForeheadSetupScreen } from "./components/ForeheadSetupScreen";
import { GameScreen } from "./components/GameScreen";
import { HomeScreen } from "./components/HomeScreen";
import { HowToPlayScreen } from "./components/HowToPlayScreen";
import { LandscapeGateScreen } from "./components/LandscapeGateScreen";
import { RoundSetupScreen } from "./components/RoundSetupScreen";
import { builtInDecks } from "./data/builtInDecks";
import { useLandscapeOrientation } from "./hooks/useLandscapeOrientation";
import { useMotionControls } from "./hooks/useMotionControls";
import { primeAudio } from "./services/audio";
import { loadCustomDecks } from "./services/deckStorage";
import {
  loadReverseTilt,
  loadSoundEffects,
  loadVibration,
  saveReverseTilt,
  saveSoundEffects,
  saveVibration,
} from "./services/preferences";
import type { Deck, RoundResult, RoundSettings } from "./types";

type Screen =
  | "home"
  | "decks"
  | "setup"
  | "landscape-gate"
  | "forehead-setup"
  | "countdown"
  | "game"
  | "results"
  | "editor"
  | "how-to-play";

const DEFAULT_THRESHOLD = 40;
type RoundStartDestination = "forehead-setup" | "countdown";

function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [customDecks, setCustomDecks] = useState<Deck[]>(() => loadCustomDecks());
  const [selectedDeckId, setSelectedDeckId] = useState(builtInDecks[0].id);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [pendingStart, setPendingStart] = useState<{
    destination: RoundStartDestination;
    cancelScreen: Screen;
  } | null>(null);
  const [settings, setSettings] = useState<RoundSettings>(() => ({
    deckId: builtInDecks[0].id,
    durationSeconds: 60,
    motionEnabled: true,
    reverseTilt: loadReverseTilt(),
    tiltThreshold: DEFAULT_THRESHOLD,
    soundEnabled: loadSoundEffects(),
    vibrationEnabled: loadVibration(),
  }));

  const decks = useMemo(() => [...builtInDecks, ...customDecks], [customDecks]);
  const selectedDeck = decks.find((deck) => deck.id === selectedDeckId) ?? builtInDecks[0];
  const isPortrait = useLandscapeOrientation();
  const motion = useMotionControls({
    enabled: settings.motionEnabled,
    reverseTilt: settings.reverseTilt,
    threshold: settings.tiltThreshold,
  });

  const updateSettings = (nextSettings: RoundSettings) => {
    saveReverseTilt(nextSettings.reverseTilt);
    saveSoundEffects(nextSettings.soundEnabled);
    saveVibration(nextSettings.vibrationEnabled);
    setSettings(nextSettings);
  };

  const startGame = useCallback(() => {
    motion.resetActions();
    setRoundResult(null);
    setScreen("game");
  }, [motion.resetActions]);

  const continueToRound = useCallback(
    (destination: RoundStartDestination) => {
      if (destination === "forehead-setup") {
        motion.beginForeheadSetup();
        setScreen("forehead-setup");
      } else {
        if (settings.motionEnabled && motion.permission === "granted") {
          motion.startCalibration();
        }
        setScreen("countdown");
      }
    },
    [motion.beginForeheadSetup, motion.permission, motion.startCalibration, settings.motionEnabled],
  );
  const beginCountdown = useCallback(() => continueToRound("countdown"), [continueToRound]);
  const cancelPreGame = useCallback(() => {
    motion.resetCalibration();
    setScreen("setup");
  }, [motion.resetCalibration]);
  const finishCountdown = useCallback(() => {
    if (settings.motionEnabled && motion.permission === "granted") {
      motion.finishCalibration();
    }
    startGame();
  }, [motion.finishCalibration, motion.permission, settings.motionEnabled, startGame]);

  const startWhenLandscape = useCallback(
    (destination: RoundStartDestination, cancelScreen: Screen) => {
      if (isPortrait) {
        setPendingStart({ destination, cancelScreen });
        setScreen("landscape-gate");
        return;
      }

      continueToRound(destination);
    },
    [continueToRound, isPortrait],
  );

  useEffect(() => {
    if (screen !== "landscape-gate" || isPortrait || !pendingStart) {
      return;
    }

    const { destination } = pendingStart;
    setPendingStart(null);
    continueToRound(destination);
  }, [continueToRound, isPortrait, pendingStart, screen]);

  const startRound = async () => {
    if (settings.soundEnabled) {
      primeAudio();
    }
    setRoundResult(null);
    motion.resetCalibration();

    if (!settings.motionEnabled) {
      startWhenLandscape("countdown", "setup");
      return;
    }

    const granted =
      motion.permission === "granted" ? true : await motion.requestPermission();
    if (granted) {
      startWhenLandscape("forehead-setup", "setup");
    }
  };

  const continueWithoutMotion = () => {
    const nextSettings = { ...settings, motionEnabled: false };
    updateSettings(nextSettings);
    startWhenLandscape("countdown", "setup");
  };

  const chooseDeck = (deckId: string) => {
    setSelectedDeckId(deckId);
    updateSettings({ ...settings, deckId });
    setScreen("setup");
  };

  const playAgain = () => {
    setRoundResult(null);
    if (settings.motionEnabled && motion.permission === "granted") {
      motion.resetCalibration();
      startWhenLandscape("forehead-setup", "results");
      return;
    }
    startWhenLandscape("countdown", "results");
  };

  if (screen === "home") {
    return (
      <HomeScreen
        onPlay={() => setScreen("decks")}
        onEditDecks={() => setScreen("editor")}
        onHowToPlay={() => setScreen("how-to-play")}
      />
    );
  }

  if (screen === "how-to-play") {
    return <HowToPlayScreen onBack={() => setScreen("home")} />;
  }

  if (screen === "decks") {
    return (
      <DeckSelectScreen
        builtInDecks={builtInDecks}
        customDecks={customDecks}
        onSelect={chooseDeck}
        onBack={() => setScreen("home")}
        onEditDecks={() => setScreen("editor")}
      />
    );
  }

  if (screen === "setup") {
    return (
      <RoundSetupScreen
        deck={selectedDeck}
        settings={settings}
        motionError={motion.error}
        onSettingsChange={updateSettings}
        onStartRound={startRound}
        onContinueWithoutMotion={continueWithoutMotion}
        onChooseDeck={() => setScreen("decks")}
      />
    );
  }

  if (screen === "landscape-gate") {
    return (
      <LandscapeGateScreen
        onCancel={() => {
          motion.resetCalibration();
          setScreen(pendingStart?.cancelScreen ?? "setup");
          setPendingStart(null);
        }}
      />
    );
  }

  if (screen === "forehead-setup") {
    return (
      <ForeheadSetupScreen
        movementDetected={motion.foreheadMovementDetected}
        soundEnabled={settings.soundEnabled}
        vibrationEnabled={settings.vibrationEnabled}
        onReady={beginCountdown}
        onCancel={cancelPreGame}
      />
    );
  }

  if (screen === "countdown") {
    return (
      <CountdownScreen
        reverseTilt={settings.reverseTilt}
        onComplete={finishCountdown}
        onCancel={cancelPreGame}
      />
    );
  }

  if (screen === "game") {
    return (
      <GameScreen
        deck={selectedDeck}
        settings={settings}
        motionStatus={motion.status}
        motionAction={motion.lastAction}
        onRoundEnd={(result) => {
          setRoundResult(result);
          setScreen("results");
        }}
        onQuit={() => {
          motion.resetActions();
          setRoundResult(null);
          setScreen("setup");
        }}
      />
    );
  }

  if (screen === "results" && roundResult) {
    return (
      <EndRoundScreen
        result={roundResult}
        onPlayAgain={playAgain}
        onChooseDeck={() => setScreen("decks")}
        onHome={() => setScreen("home")}
      />
    );
  }

  if (screen === "editor") {
    return (
      <DeckEditor
        customDecks={customDecks}
        onDecksChange={setCustomDecks}
        onBack={() => setScreen("home")}
      />
    );
  }

  return null;
}

export default App;
