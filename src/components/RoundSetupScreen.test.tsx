import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Deck, RoundSettings } from "../types";
import { RoundSetupScreen } from "./RoundSetupScreen";

const deck: Deck = {
  id: "deck",
  name: "Starter",
  cards: [
    { id: "one", prompt: "One", category: "Numbers", difficulty: "easy" },
    { id: "two", prompt: "Two", category: "Numbers", difficulty: "medium" },
  ],
};

const settings: RoundSettings = {
  deckId: deck.id,
  durationSeconds: 60,
  motionEnabled: true,
  reverseTilt: false,
  tiltThreshold: 40,
  sensitivityPreset: "standard",
  soundEnabled: true,
  vibrationEnabled: true,
  gameplayStyle: "forehead",
  difficultyFilter: "all",
  subcategoryFilter: "",
  cycleDeck: false,
  passLimit: null,
  fullscreenEnabled: false,
};

describe("RoundSetupScreen", () => {
  it("keeps advanced controls collapsed until requested", () => {
    render(
      <RoundSetupScreen
        deck={deck}
        settings={settings}
        motionError={null}
        onSettingsChange={vi.fn()}
        onStartRound={vi.fn()}
        onContinueWithoutMotion={vi.fn()}
        onChooseDeck={vi.fn()}
        onTestMotion={vi.fn()}
      />,
    );

    expect(screen.getByRole("group", { name: "Play Style" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Tilt On" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Tilt Off" })).toBeVisible();
    expect(screen.getByRole("group", { name: "Round Length" })).toBeVisible();
    expect(screen.getByRole("checkbox", { name: "Use Sound Effects" })).toBeVisible();
    expect(screen.getByRole("checkbox", { name: "Use Vibration" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Start Round" })).toBeVisible();

    expect(screen.queryByRole("checkbox", { name: "Reverse Tilt Directions" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Test Motion Controls" })).not.toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Tilt Sensitivity" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Difficulty")).not.toBeInTheDocument();
    expect(screen.queryByText(/Motion access will be requested/)).not.toBeInTheDocument();

    const advancedToggle = screen.getByRole("button", { name: "Advanced Settings" });
    expect(advancedToggle).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(advancedToggle);

    expect(screen.getByRole("button", { name: "Advanced Settings" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("checkbox", { name: "Reverse Tilt Directions" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Test Motion Controls" })).toBeVisible();
    expect(screen.getByRole("group", { name: "Tilt Sensitivity" })).toBeVisible();
    expect(screen.getByLabelText("Difficulty")).toBeVisible();
    expect(screen.getByText(/Motion access will be requested/)).toBeVisible();
  });
});
