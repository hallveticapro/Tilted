import { describe, expect, it } from "vitest";
import { appFlowReducer, initialAppFlowState } from "./appFlow";

describe("appFlowReducer", () => {
  it("starts a quick button round directly when landscape is ready", () => {
    expect(
      appFlowReducer(initialAppFlowState, {
        type: "request-round-start",
        destination: "countdown",
        cancelScreen: "setup",
        isPortrait: false,
      }),
    ).toEqual({ screen: "countdown", pendingStart: null });
  });

  it("routes portrait starts through the landscape gate and supports cancel", () => {
    const gated = appFlowReducer(initialAppFlowState, {
      type: "request-round-start",
      destination: "forehead-setup",
      cancelScreen: "results",
      isPortrait: true,
    });

    expect(gated).toEqual({
      screen: "landscape-gate",
      pendingStart: { destination: "forehead-setup", cancelScreen: "results" },
    });
    expect(appFlowReducer(gated, { type: "cancel-landscape" })).toEqual({
      screen: "results",
      pendingStart: null,
    });
  });

  it("resolves the landscape gate to the pending round destination", () => {
    const gated = {
      screen: "landscape-gate" as const,
      pendingStart: { destination: "countdown" as const, cancelScreen: "setup" as const },
    };

    expect(appFlowReducer(gated, { type: "landscape-ready" })).toEqual({
      screen: "countdown",
      pendingStart: null,
    });
  });

  it("moves ended rounds to solo results or team results", () => {
    expect(appFlowReducer(initialAppFlowState, { type: "round-ended", teamComplete: false })).toEqual({
      screen: "results",
      pendingStart: null,
    });
    expect(appFlowReducer(initialAppFlowState, { type: "round-ended", teamComplete: true })).toEqual({
      screen: "team-results",
      pendingStart: null,
    });
  });

  it("moves team sessions to the next phone-holder turn", () => {
    expect(appFlowReducer(initialAppFlowState, { type: "team-next-round" })).toEqual({
      screen: "team-turn",
      pendingStart: null,
    });
  });
});
