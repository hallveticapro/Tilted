import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PwaBanner } from "./PwaBanner";

const defaults = {
  online: true,
  canInstall: false,
  updateReady: false,
  showIosInstallHint: false,
  onInstall: vi.fn(),
  onUpdate: vi.fn(),
  onDismissIosInstallHint: vi.fn(),
  storageAvailable: true,
};

describe("PwaBanner", () => {
  it("surfaces update readiness before installation hints", () => {
    render(<PwaBanner {...defaults} updateReady showIosInstallHint />);
    expect(screen.getByText(/new Tilted version is ready/)).toBeVisible();
  });

  it("shows dismissible iOS installation instructions", () => {
    const onDismissIosInstallHint = vi.fn();
    render(<PwaBanner {...defaults} showIosInstallHint onDismissIosInstallHint={onDismissIosInstallHint} />);
    expect(screen.getByText(/Add to Home Screen/)).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onDismissIosInstallHint).toHaveBeenCalledTimes(1);
  });
});
