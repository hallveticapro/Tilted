import { useCallback, useEffect, useMemo, useReducer, useState, type ReactNode } from "react";
import { AppScreens } from "./components/AppScreens";
import { PwaBanner } from "./components/PwaBanner";
import { SharedDeckNotice } from "./components/SharedDeckNotice";
import { builtInDecks } from "./data/builtInDecks";
import { useLandscapeOrientation } from "./hooks/useLandscapeOrientation";
import { useMotionControls } from "./hooks/useMotionControls";
import { useRoundDisplay } from "./hooks/useRoundDisplay";
import { usePwaStatus } from "./hooks/usePwaStatus";
import { primeAudio } from "./services/audio";
import {
  appFlowReducer,
  initialAppFlowState,
  type RoundStartDestination,
  type Screen,
} from "./services/appFlow";
import { loadCustomDecks, saveCustomDecks } from "./services/deckStorage";
import { readSharedDeckFromLocation } from "./services/deckSharing";
import { addRoundToHistory, clearRoundHistory, loadRoundHistory } from "./services/roundHistory";
import { addTeamRound, isTeamSessionComplete } from "./services/teamSession";
import { canUseBrowserStorage } from "./services/safeStorage";
import {
  loadReverseTilt,
  loadClassroomOnly,
  loadFavoriteDecks,
  loadSensitivity,
  loadSoundEffects,
  loadVibration,
  saveReverseTilt,
  saveClassroomOnly,
  saveFavoriteDecks,
  saveSensitivity,
  saveSoundEffects,
  saveVibration,
} from "./services/preferences";
import type { Deck, GameMode, RoundResult, RoundSettings, TeamSession } from "./types";

const DEFAULT_THRESHOLD = 40;

function App() {
  const [flow, dispatchFlow] = useReducer(appFlowReducer, initialAppFlowState);
  const { screen, pendingStart } = flow;
  const [customDecks, setCustomDecks] = useState<Deck[]>(() => loadCustomDecks());
  const [virtualDeck, setVirtualDeck] = useState<Deck | null>(null);
  const [favoriteDeckIds, setFavoriteDeckIds] = useState<string[]>(() => loadFavoriteDecks());
  const [classroomOnly, setClassroomOnly] = useState(() => loadClassroomOnly());
  const [storageAvailable] = useState(() => canUseBrowserStorage());
  const [selectedDeckId, setSelectedDeckId] = useState(builtInDecks[0].id);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [history, setHistory] = useState<RoundResult[]>(() => loadRoundHistory());
  const [gameMode, setGameMode] = useState<GameMode>("quick");
  const [teamSession, setTeamSession] = useState<TeamSession | null>(null);
  const [gameNotice, setGameNotice] = useState<string | null>(null);
  const [sharedDeckImport, setSharedDeckImport] = useState(() => readSharedDeckFromLocation());
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
  const pwaBanner = (
    <PwaBanner
      online={pwa.online}
      canInstall={pwa.canInstall}
      updateReady={pwa.updateReady}
      showIosInstallHint={pwa.showIosInstallHint}
      onInstall={() => void pwa.install()}
      onUpdate={pwa.update}
      onDismissIosInstallHint={pwa.dismissIosInstallHint}
      storageAvailable={storageAvailable}
    />
  );
  const clearSharedDeckHash = () => {
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  };
  const goToScreen = (nextScreen: Screen) => {
    dispatchFlow({ type: "go", screen: nextScreen });
  };
  const dismissSharedDeckImport = () => {
    clearSharedDeckHash();
    setSharedDeckImport({ status: "none" });
  };
  const importSharedDeck = () => {
    if (sharedDeckImport.status !== "ok") {
      return;
    }
    try {
      const saved = saveCustomDecks([...customDecks, sharedDeckImport.deck]);
      setCustomDecks(saved);
      clearSharedDeckHash();
      setSharedDeckImport({ status: "none" });
      goToScreen("editor");
    } catch (error) {
      setSharedDeckImport({
        status: "error",
        message: error instanceof Error
          ? error.message
          : "That shared deck could not be saved in this browser.",
      });
    }
  };
  const withPwaBanner = (content: ReactNode, showBanner = true) => (
    <>
      {content}
      <SharedDeckNotice
        importResult={sharedDeckImport}
        onImport={importSharedDeck}
        onDismiss={dismissSharedDeckImport}
      />
      {showBanner ? pwaBanner : null}
    </>
  );

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
    dispatchFlow({ type: "start-game" });
  }, [motion.resetActions]);

  const continueToRound = useCallback(
    (destination: RoundStartDestination) => {
      if (destination === "forehead-setup") {
        motion.beginForeheadSetup();
        dispatchFlow({ type: "continue-to-round", destination: "forehead-setup" });
      } else {
        if (
          tiltModeEnabled &&
          motion.permission === "granted"
        ) {
          motion.startCalibration();
        }
        dispatchFlow({ type: "continue-to-round", destination: "countdown" });
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
    dispatchFlow({ type: "cancel-pre-game" });
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
        dispatchFlow({ type: "request-round-start", destination, cancelScreen, isPortrait });
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
    dispatchFlow({ type: "landscape-ready" });
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
    dispatchFlow({ type: "choose-deck", teamActive: Boolean(teamSession) });
  };

  const chooseMixedDeck = (sourceDecks: Deck[], label: string) => {
    const deck: Deck = {
      id: `mixed-${label.toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-") || "all"}`,
      name: `${label} Mix`,
      description: `A shuffled mix of ${label.toLocaleLowerCase()} decks.`,
      category: label,
      builtIn: true,
      classroomSafe: sourceDecks.every((source) => source.classroomSafe !== false),
      cards: sourceDecks.flatMap((source) => source.cards.map((card) => ({ ...card, id: `${source.id}-${card.id}` }))),
    };
    setVirtualDeck(deck);
    setSelectedDeckId(deck.id);
    updateSettings({ ...settings, deckId: deck.id, subcategoryFilter: "" });
    dispatchFlow({ type: "choose-deck", teamActive: Boolean(teamSession) });
  };

  const toggleFavoriteDeck = (deckId: string) => {
    const next = favoriteDeckIds.includes(deckId)
      ? favoriteDeckIds.filter((id) => id !== deckId)
      : [...favoriteDeckIds, deckId];
    setFavoriteDeckIds(next);
    saveFavoriteDecks(next);
  };

  const updateClassroomOnly = (value: boolean) => {
    setClassroomOnly(value);
    saveClassroomOnly(value);
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

  const clearHistory = () => {
    clearRoundHistory();
    setHistory([]);
  };

  const startQuickGame = () => {
    setGameMode("quick");
    setTeamSession(null);
    goToScreen("decks");
  };

  const startTeamGame = (session: TeamSession) => {
    setGameMode("teams");
    setTeamSession(session);
    goToScreen("decks");
  };

  const quitTeamGame = () => {
    setTeamSession(null);
    setGameMode("quick");
    goToScreen("home");
  };

  const resetMotionDiagnostics = () => {
    motion.resetCalibration();
    motion.resetActions();
  };

  const closeMotionDiagnostics = () => {
    resetMotionDiagnostics();
    goToScreen("setup");
  };

  const cancelLandscapeGate = () => {
    void roundDisplay.release();
    motion.resetCalibration();
    dispatchFlow({ type: "cancel-landscape" });
  };

  const finishRound = (result: RoundResult) => {
    void roundDisplay.release();
    const nextHistory = addRoundToHistory(result);
    setHistory(nextHistory);
    setRoundResult(result);
    if (teamSession) {
      const nextSession = addTeamRound(teamSession, result);
      setTeamSession(nextSession);
      dispatchFlow({ type: "round-ended", teamComplete: isTeamSessionComplete(nextSession) });
    } else {
      dispatchFlow({ type: "round-ended", teamComplete: false });
    }
  };

  const quitRound = () => {
    void roundDisplay.release();
    motion.resetActions();
    setRoundResult(null);
    goToScreen("setup");
  };

  return (
    <AppScreens
      screen={screen}
      customDecks={customDecks}
      selectedDeck={selectedDeck}
      settings={settings}
      motion={motion}
      roundDisplay={roundDisplay}
      tiltModeEnabled={tiltModeEnabled}
      gameMode={gameMode}
      teamSession={teamSession}
      roundResult={roundResult}
      history={history}
      favoriteDeckIds={favoriteDeckIds}
      classroomOnly={classroomOnly}
      gameNotice={gameNotice}
      frame={withPwaBanner}
      onClearHistory={clearHistory}
      onGoToScreen={goToScreen}
      onHomePlay={startQuickGame}
      onTeamStart={startTeamGame}
      onTeamQuit={quitTeamGame}
      onMotionReset={resetMotionDiagnostics}
      onMotionBack={closeMotionDiagnostics}
      onChooseDeck={chooseDeck}
      onChooseMixedDeck={chooseMixedDeck}
      onToggleFavorite={toggleFavoriteDeck}
      onClassroomOnlyChange={updateClassroomOnly}
      onSettingsChange={updateSettings}
      onStartRound={startRound}
      onContinueWithoutMotion={continueWithoutMotion}
      onCancelLandscape={cancelLandscapeGate}
      onBeginCountdown={beginCountdown}
      onCancelPreGame={cancelPreGame}
      onFinishCountdown={finishCountdown}
      onRoundEnd={finishRound}
      onQuitRound={quitRound}
      onPlayAgain={playAgain}
      onNextTeamRound={() => dispatchFlow({ type: "team-next-round" })}
      onDecksChange={setCustomDecks}
    />
  );
}

export default App;
