import { useCallback, useEffect, useMemo, useState } from "react";
import { CountdownScreen } from "./components/CountdownScreen";
import { DeckEditor } from "./components/DeckEditor";
import { DeckSelectScreen } from "./components/DeckSelectScreen";
import { EndRoundScreen } from "./components/EndRoundScreen";
import { ForeheadSetupScreen } from "./components/ForeheadSetupScreen";
import { GameScreen } from "./components/GameScreen";
import { HistoryScreen } from "./components/HistoryScreen";
import { HomeScreen } from "./components/HomeScreen";
import { HowToPlayScreen } from "./components/HowToPlayScreen";
import { LandscapeGateScreen } from "./components/LandscapeGateScreen";
import { MotionDiagnosticScreen } from "./components/MotionDiagnosticScreen";
import { PwaBanner } from "./components/PwaBanner";
import { RoundSetupScreen } from "./components/RoundSetupScreen";
import { TeamResultsScreen } from "./components/TeamResultsScreen";
import { TeamSetupScreen } from "./components/TeamSetupScreen";
import { TeamTurnScreen } from "./components/TeamTurnScreen";
import { builtInDecks } from "./data/builtInDecks";
import { useLandscapeOrientation } from "./hooks/useLandscapeOrientation";
import { useMotionControls } from "./hooks/useMotionControls";
import { useRoundDisplay } from "./hooks/useRoundDisplay";
import { usePwaStatus } from "./hooks/usePwaStatus";
import { primeAudio } from "./services/audio";
import { loadCustomDecks, saveCustomDecks } from "./services/deckStorage";
import { readSharedDeckFromLocation } from "./services/deckSharing";
import { addRoundToHistory, clearRoundHistory, getBestScore, loadRoundHistory } from "./services/roundHistory";
import { addTeamRound, getActivePlayer, getActiveTeam, isTeamSessionComplete } from "./services/teamSession";
import { canUseBrowserStorage } from "./services/safeStorage";
import {
  loadReverseTilt,
  loadFavoriteDecks,
  loadSensitivity,
  loadSoundEffects,
  loadVibration,
  saveReverseTilt,
  saveFavoriteDecks,
  saveSensitivity,
  saveSoundEffects,
  saveVibration,
} from "./services/preferences";
import type { Deck, GameMode, RoundResult, RoundSettings, TeamSession } from "./types";

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
  | "how-to-play"
  | "history"
  | "team-setup"
  | "team-turn"
  | "team-results"
  | "motion-test";

const DEFAULT_THRESHOLD = 40;
type RoundStartDestination = "forehead-setup" | "countdown";

function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [customDecks, setCustomDecks] = useState<Deck[]>(() => loadCustomDecks());
  const [virtualDeck, setVirtualDeck] = useState<Deck | null>(null);
  const [favoriteDeckIds, setFavoriteDeckIds] = useState<string[]>(() => loadFavoriteDecks());
  const [storageAvailable] = useState(() => canUseBrowserStorage());
  const [selectedDeckId, setSelectedDeckId] = useState(builtInDecks[0].id);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [history, setHistory] = useState<RoundResult[]>(() => loadRoundHistory());
  const [gameMode, setGameMode] = useState<GameMode>("quick");
  const [teamSession, setTeamSession] = useState<TeamSession | null>(null);
  const [gameNotice, setGameNotice] = useState<string | null>(null);
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
    sensitivityPreset: loadSensitivity(),
    soundEnabled: loadSoundEffects(),
    vibrationEnabled: loadVibration(),
    gameplayStyle: "forehead",
    difficultyFilter: "all",
    subcategoryFilter: "",
    cycleDeck: false,
    passLimit: null,
    fullscreenEnabled: false,
  }));
  const tiltModeEnabled = settings.gameplayStyle === "forehead" && settings.motionEnabled;

  const decks = useMemo(
    () => [...builtInDecks, ...customDecks, ...(virtualDeck ? [virtualDeck] : [])],
    [customDecks, virtualDeck],
  );
  const selectedDeck = decks.find((deck) => deck.id === selectedDeckId) ?? builtInDecks[0];
  const isPortrait = useLandscapeOrientation();
  const motion = useMotionControls({
    enabled: tiltModeEnabled,
    reverseTilt: settings.reverseTilt,
    threshold: settings.tiltThreshold,
    publishSamples: screen === "motion-test",
  });
  const roundDisplay = useRoundDisplay();
  const pwa = usePwaStatus();

  useEffect(() => {
    const sharedDeck = readSharedDeckFromLocation();
    if (!sharedDeck || !window.confirm(`Import the shared deck "${sharedDeck.name}"?`)) {
      return;
    }
    try {
      const saved = saveCustomDecks([...customDecks, sharedDeck]);
      setCustomDecks(saved);
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
      setScreen("editor");
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "That shared deck could not be saved in this browser.",
      );
    }
  }, []);

  const updateSettings = (nextSettings: RoundSettings) => {
    saveReverseTilt(nextSettings.reverseTilt);
    saveSensitivity(nextSettings.sensitivityPreset);
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
        if (
          tiltModeEnabled &&
          motion.permission === "granted"
        ) {
          motion.startCalibration();
        }
        setScreen("countdown");
      }
    },
    [
      motion.beginForeheadSetup,
      motion.permission,
      motion.startCalibration,
      tiltModeEnabled,
    ],
  );
  const beginCountdown = useCallback(() => continueToRound("countdown"), [continueToRound]);
  const cancelPreGame = useCallback(() => {
    void roundDisplay.release();
    motion.resetCalibration();
    setScreen("setup");
  }, [motion.resetCalibration, roundDisplay.release]);
  const finishCountdown = useCallback(() => {
    if (
      tiltModeEnabled &&
      motion.permission === "granted"
    ) {
      const calibrated = motion.finishCalibration();
      setGameNotice(
        calibrated
          ? null
          : "Motion samples did not arrive, so fallback buttons are visible for this round.",
      );
    } else {
      setGameNotice(null);
    }
    startGame();
  }, [
    motion.finishCalibration,
    motion.permission,
    tiltModeEnabled,
    startGame,
  ]);

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
    void roundDisplay.engage(settings.fullscreenEnabled);
    if (settings.soundEnabled) {
      void primeAudio();
    }
    setRoundResult(null);
    motion.resetCalibration();

    if (!tiltModeEnabled) {
      startWhenLandscape("countdown", "setup");
      return;
    }

    const granted =
      motion.permission === "granted" ? true : await motion.requestPermission();
    if (granted) {
      startWhenLandscape("forehead-setup", "setup");
    } else {
      void roundDisplay.release();
    }
  };

  const continueWithoutMotion = () => {
    void roundDisplay.engage(settings.fullscreenEnabled);
    if (settings.soundEnabled) {
      void primeAudio();
    }
    const nextSettings = { ...settings, gameplayStyle: "review" as const, motionEnabled: false };
    updateSettings(nextSettings);
    startWhenLandscape("countdown", "setup");
  };

  const chooseDeck = (deckId: string) => {
    if (virtualDeck?.id !== deckId) {
      setVirtualDeck(null);
    }
    setSelectedDeckId(deckId);
    updateSettings({ ...settings, deckId, subcategoryFilter: "" });
    setScreen(teamSession ? "team-turn" : "setup");
  };

  const chooseMixedDeck = (sourceDecks: Deck[], label: string) => {
    const deck: Deck = {
      id: `mixed-${label.toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-") || "all"}`,
      name: `${label} Mix`,
      description: `A shuffled mix of ${label.toLocaleLowerCase()} decks.`,
      category: label,
      builtIn: true,
      classroomSafe: sourceDecks.every((source) => source.classroomSafe),
      cards: sourceDecks.flatMap((source) => source.cards.map((card) => ({ ...card, id: `${source.id}-${card.id}` }))),
    };
    setVirtualDeck(deck);
    setSelectedDeckId(deck.id);
    updateSettings({ ...settings, deckId: deck.id, subcategoryFilter: "" });
    setScreen(teamSession ? "team-turn" : "setup");
  };

  const toggleFavoriteDeck = (deckId: string) => {
    const next = favoriteDeckIds.includes(deckId)
      ? favoriteDeckIds.filter((id) => id !== deckId)
      : [...favoriteDeckIds, deckId];
    setFavoriteDeckIds(next);
    saveFavoriteDecks(next);
  };

  const playAgain = () => {
    void roundDisplay.engage(settings.fullscreenEnabled);
    if (settings.soundEnabled) {
      void primeAudio();
    }
    setRoundResult(null);
    if (
      tiltModeEnabled &&
      motion.permission === "granted"
    ) {
      motion.resetCalibration();
      startWhenLandscape("forehead-setup", "results");
      return;
    }
    startWhenLandscape("countdown", "results");
  };

  if (screen === "home") {
    return (
      <>
      <HomeScreen
        onPlay={() => {
          setGameMode("quick");
          setTeamSession(null);
          setScreen("decks");
        }}
        onTeamGame={() => setScreen("team-setup")}
        onHistory={() => setScreen("history")}
        onEditDecks={() => setScreen("editor")}
        onHowToPlay={() => setScreen("how-to-play")}
      />
      <PwaBanner online={pwa.online} canInstall={pwa.canInstall} updateReady={pwa.updateReady} showIosInstallHint={pwa.showIosInstallHint} onInstall={() => void pwa.install()} onUpdate={pwa.update} onDismissIosInstallHint={pwa.dismissIosInstallHint} storageAvailable={storageAvailable} />
      </>
    );
  }

  if (screen === "history") {
    return <HistoryScreen history={history} onClear={() => {
      clearRoundHistory();
      setHistory([]);
    }} onBack={() => setScreen("home")} />;
  }

  if (screen === "team-setup") {
    return <TeamSetupScreen onStart={(session) => {
      setGameMode("teams");
      setTeamSession(session);
      setScreen("decks");
    }} onBack={() => setScreen("home")} />;
  }

  if (screen === "team-turn" && teamSession) {
    return <TeamTurnScreen session={teamSession} onReady={() => setScreen("setup")} onQuit={() => {
      setTeamSession(null);
      setGameMode("quick");
      setScreen("home");
    }} />;
  }

  if (screen === "team-results" && teamSession) {
    return <TeamResultsScreen session={teamSession} onHome={() => {
      setTeamSession(null);
      setGameMode("quick");
      setScreen("home");
    }} onPlayAgain={() => setScreen("team-setup")} />;
  }

  if (screen === "motion-test") {
    return <MotionDiagnosticScreen permission={motion.permission} status={motion.status} sample={motion.currentSample} baseline={motion.baseline} action={motion.lastAction} error={motion.error} onEnable={motion.requestPermission} onStartCalibration={motion.startCalibration} onFinishCalibration={motion.finishCalibration} onReset={() => {
      motion.resetCalibration();
      motion.resetActions();
    }} onBack={() => {
      motion.resetCalibration();
      motion.resetActions();
      setScreen("setup");
    }} />;
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
        favoriteDeckIds={favoriteDeckIds}
        recentDeckIds={history.map(({ deckId }) => deckId).slice(0, 6)}
        onToggleFavorite={toggleFavoriteDeck}
        onSelectMixed={chooseMixedDeck}
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
        onTestMotion={() => setScreen("motion-test")}
      />
    );
  }

  if (screen === "landscape-gate") {
    return (
      <LandscapeGateScreen
        onCancel={() => {
          void roundDisplay.release();
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
        showTiltHint={tiltModeEnabled}
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
        gameMode={gameMode}
        teamId={teamSession ? getActiveTeam(teamSession).id : undefined}
        teamName={teamSession ? getActiveTeam(teamSession).name : undefined}
        playerName={teamSession ? getActivePlayer(teamSession) : undefined}
        onRoundEnd={(result) => {
          void roundDisplay.release();
          const nextHistory = addRoundToHistory(result);
          setHistory(nextHistory);
          setRoundResult(result);
          if (teamSession) {
            const nextSession = addTeamRound(teamSession, result);
            setTeamSession(nextSession);
            setScreen(isTeamSessionComplete(nextSession) ? "team-results" : "results");
          } else {
            setScreen("results");
          }
        }}
        onQuit={() => {
          void roundDisplay.release();
          motion.resetActions();
          setRoundResult(null);
          setScreen("setup");
        }}
        notice={gameNotice}
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
        onNextRound={teamSession ? () => setScreen("team-turn") : undefined}
        teamName={roundResult.teamName}
        bestScore={getBestScore(history, roundResult.deckId)}
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
