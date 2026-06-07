export type Screen =
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

export type RoundStartDestination = "forehead-setup" | "countdown";

export interface AppFlowState {
  screen: Screen;
  pendingStart: {
    destination: RoundStartDestination;
    cancelScreen: Screen;
  } | null;
}

export type AppFlowEvent =
  | { type: "go"; screen: Screen }
  | {
      type: "request-round-start";
      destination: RoundStartDestination;
      cancelScreen: Screen;
      isPortrait: boolean;
    }
  | { type: "landscape-ready" }
  | { type: "cancel-landscape"; fallbackScreen?: Screen }
  | { type: "continue-to-round"; destination: RoundStartDestination }
  | { type: "start-game" }
  | { type: "cancel-pre-game" }
  | { type: "choose-deck"; teamActive: boolean }
  | { type: "round-ended"; teamComplete: boolean }
  | { type: "team-next-round" };

export const initialAppFlowState: AppFlowState = {
  screen: "home",
  pendingStart: null,
};

export function appFlowReducer(state: AppFlowState, event: AppFlowEvent): AppFlowState {
  switch (event.type) {
    case "go":
      return { ...state, screen: event.screen };
    case "request-round-start":
      return event.isPortrait
        ? {
            screen: "landscape-gate",
            pendingStart: {
              destination: event.destination,
              cancelScreen: event.cancelScreen,
            },
          }
        : { screen: event.destination, pendingStart: null };
    case "landscape-ready":
      return state.screen === "landscape-gate" && state.pendingStart
        ? { screen: state.pendingStart.destination, pendingStart: null }
        : state;
    case "cancel-landscape":
      return {
        screen: event.fallbackScreen ?? state.pendingStart?.cancelScreen ?? "setup",
        pendingStart: null,
      };
    case "continue-to-round":
      return { screen: event.destination, pendingStart: null };
    case "start-game":
      return { screen: "game", pendingStart: null };
    case "cancel-pre-game":
      return { screen: "setup", pendingStart: null };
    case "choose-deck":
      return { screen: event.teamActive ? "team-turn" : "setup", pendingStart: null };
    case "round-ended":
      return { screen: event.teamComplete ? "team-results" : "results", pendingStart: null };
    case "team-next-round":
      return { screen: "team-turn", pendingStart: null };
    default:
      return state;
  }
}
