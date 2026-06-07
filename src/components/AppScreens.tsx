import type { ReactNode } from "react";
import { builtInDecks } from "../data/builtInDecks";
import type { useMotionControls } from "../hooks/useMotionControls";
import type { useRoundDisplay } from "../hooks/useRoundDisplay";
import type { Screen } from "../services/appFlow";
import { getActivePlayer, getActiveTeam } from "../services/teamSession";
import type { Deck, GameMode, RoundResult, RoundSettings, TeamSession } from "../types";
import { CountdownScreen } from "./CountdownScreen";
import { DeckEditor } from "./DeckEditor";
import { DeckSelectScreen } from "./DeckSelectScreen";
import { EndRoundScreen } from "./EndRoundScreen";
import { ForeheadSetupScreen } from "./ForeheadSetupScreen";
import { GameScreen } from "./GameScreen";
import { HistoryScreen } from "./HistoryScreen";
import { HomeScreen } from "./HomeScreen";
import { HowToPlayScreen } from "./HowToPlayScreen";
import { LandscapeGateScreen } from "./LandscapeGateScreen";
import { MotionDiagnosticScreen } from "./MotionDiagnosticScreen";
import { RoundSetupScreen } from "./RoundSetupScreen";
import { TeamResultsScreen } from "./TeamResultsScreen";
import { TeamSetupScreen } from "./TeamSetupScreen";
import { TeamTurnScreen } from "./TeamTurnScreen";

interface AppScreensProps {
  screen: Screen;
  customDecks: Deck[];
  selectedDeck: Deck;
  settings: RoundSettings;
  motion: ReturnType<typeof useMotionControls>;
  roundDisplay: ReturnType<typeof useRoundDisplay>;
  tiltModeEnabled: boolean;
  gameMode: GameMode;
  teamSession: TeamSession | null;
  roundResult: RoundResult | null;
  history: RoundResult[];
  favoriteDeckIds: string[];
  classroomOnly: boolean;
  gameNotice: string | null;
  frame: (content: ReactNode, showBanner?: boolean) => ReactNode;
  onClearHistory: () => void;
  onGoToScreen: (screen: Screen) => void;
  onHomePlay: () => void;
  onTeamStart: (session: TeamSession) => void;
  onTeamQuit: () => void;
  onMotionReset: () => void;
  onMotionBack: () => void;
  onChooseDeck: (deckId: string) => void;
  onChooseMixedDeck: (decks: Deck[], label: string) => void;
  onToggleFavorite: (deckId: string) => void;
  onClassroomOnlyChange: (value: boolean) => void;
  onSettingsChange: (settings: RoundSettings) => void;
  onStartRound: () => void;
  onContinueWithoutMotion: () => void;
  onCancelLandscape: () => void;
  onBeginCountdown: () => void;
  onCancelPreGame: () => void;
  onFinishCountdown: () => void;
  onRoundEnd: (result: RoundResult) => void;
  onQuitRound: () => void;
  onPlayAgain: () => void;
  onNextTeamRound: () => void;
  onDecksChange: (decks: Deck[]) => void;
}

export function AppScreens({
  screen,
  customDecks,
  selectedDeck,
  settings,
  motion,
  roundDisplay: _roundDisplay,
  tiltModeEnabled,
  gameMode,
  teamSession,
  roundResult,
  history,
  favoriteDeckIds,
  classroomOnly,
  gameNotice,
  frame,
  onClearHistory,
  onGoToScreen,
  onHomePlay,
  onTeamStart,
  onTeamQuit,
  onMotionReset,
  onMotionBack,
  onChooseDeck,
  onChooseMixedDeck,
  onToggleFavorite,
  onClassroomOnlyChange,
  onSettingsChange,
  onStartRound,
  onContinueWithoutMotion,
  onCancelLandscape,
  onBeginCountdown,
  onCancelPreGame,
  onFinishCountdown,
  onRoundEnd,
  onQuitRound,
  onPlayAgain,
  onNextTeamRound,
  onDecksChange,
}: AppScreensProps) {
  if (screen === "home") {
    return frame(
      <HomeScreen
        onPlay={onHomePlay}
        onTeamGame={() => onGoToScreen("team-setup")}
        onHistory={() => onGoToScreen("history")}
        onEditDecks={() => onGoToScreen("editor")}
        onHowToPlay={() => onGoToScreen("how-to-play")}
      />,
    );
  }

  if (screen === "history") {
    return frame(
      <HistoryScreen
        history={history}
        onClear={onClearHistory}
        onBack={() => onGoToScreen("home")}
      />,
    );
  }

  if (screen === "team-setup") {
    return frame(<TeamSetupScreen onStart={onTeamStart} onBack={() => onGoToScreen("home")} />);
  }

  if (screen === "team-turn" && teamSession) {
    return frame(
      <TeamTurnScreen
        session={teamSession}
        onReady={() => onGoToScreen("setup")}
        onQuit={onTeamQuit}
      />,
    );
  }

  if (screen === "team-results" && teamSession) {
    return frame(
      <TeamResultsScreen
        session={teamSession}
        onHome={onTeamQuit}
        onPlayAgain={() => onGoToScreen("team-setup")}
      />,
    );
  }

  if (screen === "motion-test") {
    return frame(
      <MotionDiagnosticScreen
        permission={motion.permission}
        status={motion.status}
        sample={motion.currentSample}
        baseline={motion.baseline}
        action={motion.lastAction}
        error={motion.error}
        onEnable={motion.requestPermission}
        onStartCalibration={motion.startCalibration}
        onFinishCalibration={motion.finishCalibration}
        onReset={onMotionReset}
        onBack={onMotionBack}
      />,
    );
  }

  if (screen === "how-to-play") {
    return frame(<HowToPlayScreen onBack={() => onGoToScreen("home")} />);
  }

  if (screen === "decks") {
    return frame(
      <DeckSelectScreen
        builtInDecks={builtInDecks}
        customDecks={customDecks}
        onSelect={onChooseDeck}
        onBack={() => onGoToScreen("home")}
        onEditDecks={() => onGoToScreen("editor")}
        favoriteDeckIds={favoriteDeckIds}
        classroomOnly={classroomOnly}
        recentDeckIds={history.map(({ deckId }) => deckId).slice(0, 6)}
        onClassroomOnlyChange={onClassroomOnlyChange}
        onToggleFavorite={onToggleFavorite}
        onSelectMixed={onChooseMixedDeck}
      />,
    );
  }

  if (screen === "setup") {
    return frame(
      <RoundSetupScreen
        deck={selectedDeck}
        settings={settings}
        motionError={motion.error}
        onSettingsChange={onSettingsChange}
        onStartRound={onStartRound}
        onContinueWithoutMotion={onContinueWithoutMotion}
        onChooseDeck={() => onGoToScreen("decks")}
        onTestMotion={() => onGoToScreen("motion-test")}
      />,
    );
  }

  if (screen === "landscape-gate") {
    return frame(<LandscapeGateScreen onCancel={onCancelLandscape} />, false);
  }

  if (screen === "forehead-setup") {
    return frame(
      <ForeheadSetupScreen
        movementDetected={motion.foreheadMovementDetected}
        soundEnabled={settings.soundEnabled}
        vibrationEnabled={settings.vibrationEnabled}
        onReady={onBeginCountdown}
        onCancel={onCancelPreGame}
      />,
      false,
    );
  }

  if (screen === "countdown") {
    return frame(
      <CountdownScreen
        reverseTilt={settings.reverseTilt}
        showTiltHint={tiltModeEnabled}
        onComplete={onFinishCountdown}
        onCancel={onCancelPreGame}
      />,
      false,
    );
  }

  if (screen === "game") {
    return frame(
      <GameScreen
        deck={selectedDeck}
        settings={settings}
        motionStatus={motion.status}
        motionAction={motion.lastAction}
        gameMode={gameMode}
        teamId={teamSession ? getActiveTeam(teamSession).id : undefined}
        teamName={teamSession ? getActiveTeam(teamSession).name : undefined}
        playerName={teamSession ? getActivePlayer(teamSession) : undefined}
        onRoundEnd={onRoundEnd}
        onQuit={onQuitRound}
        notice={gameNotice}
      />,
      false,
    );
  }

  if (screen === "results" && roundResult) {
    return frame(
      <EndRoundScreen
        result={roundResult}
        onPlayAgain={onPlayAgain}
        onChooseDeck={() => onGoToScreen("decks")}
        onHome={() => onGoToScreen("home")}
        onNextRound={teamSession ? onNextTeamRound : undefined}
        teamName={roundResult.teamName}
        bestScore={history.reduce(
          (best, result) =>
            result.deckId === roundResult.deckId
              ? Math.max(best, result.correctCards.length)
              : best,
          0,
        )}
      />,
    );
  }

  if (screen === "editor") {
    return frame(
      <DeckEditor customDecks={customDecks} onDecksChange={onDecksChange} onBack={() => onGoToScreen("home")} />,
    );
  }

  return null;
}
