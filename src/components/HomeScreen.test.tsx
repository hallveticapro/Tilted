import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HomeScreen } from "./HomeScreen";

describe("HomeScreen", () => {
  it("opens and closes the About Tilted modal", () => {
    render(<HomeScreen onPlay={vi.fn()} onEditDecks={vi.fn()} onHowToPlay={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "About Tilted" }));

    expect(screen.getByRole("dialog", { name: "About Tilted" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Buy Me A Coffee" })).toHaveAttribute(
      "href",
      "https://buymeacoffee.com/hallveticapro",
    );
    expect(screen.getByRole("link", { name: /GitHub/ })).toHaveAttribute(
      "href",
      "https://github.com/hallveticapro/math-quest-live",
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "About Tilted" })).not.toBeInTheDocument();
  });
});
