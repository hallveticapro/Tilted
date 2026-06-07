import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TeamSetupScreen } from "./TeamSetupScreen";

describe("TeamSetupScreen", () => {
  it("disables deck selection and warns for duplicate trimmed team names", () => {
    render(<TeamSetupScreen onStart={vi.fn()} onBack={vi.fn()} />);

    fireEvent.change(screen.getByRole("textbox", { name: "Team 1 name" }), {
      target: { value: "Red" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Team 2 name" }), {
      target: { value: " red " },
    });

    expect(screen.getByRole("button", { name: "Choose a Deck" })).toBeDisabled();
    expect(screen.getByText("Team names must be unique so scores and turns stay separate.")).toBeVisible();
  });

  it("enables deck selection for two unique trimmed team names", () => {
    render(<TeamSetupScreen onStart={vi.fn()} onBack={vi.fn()} />);

    fireEvent.change(screen.getByRole("textbox", { name: "Team 1 name" }), {
      target: { value: " Red " },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Team 2 name" }), {
      target: { value: "Blue" },
    });

    expect(screen.getByRole("button", { name: "Choose a Deck" })).toBeEnabled();
    expect(screen.queryByText("Team names must be unique so scores and turns stay separate.")).not.toBeInTheDocument();
  });

  it("accepts comma-separated players when team names are unique", () => {
    const onStart = vi.fn();
    render(<TeamSetupScreen onStart={onStart} onBack={vi.fn()} />);

    fireEvent.change(screen.getByRole("textbox", { name: "Team 1 players" }), {
      target: { value: "Rae, Rin" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Team 2 players" }), {
      target: { value: "Bea, Bo" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Choose a Deck" }));

    expect(onStart).toHaveBeenCalledWith(
      expect.objectContaining({
        teams: [
          expect.objectContaining({ name: "Team 1", players: ["Rae", "Rin"] }),
          expect.objectContaining({ name: "Team 2", players: ["Bea", "Bo"] }),
        ],
      }),
    );
  });
});
