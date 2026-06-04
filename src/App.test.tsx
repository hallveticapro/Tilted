import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

const originalInnerWidth = window.innerWidth;
const originalInnerHeight = window.innerHeight;
const originalDeviceOrientationEvent = window.DeviceOrientationEvent;
const originalDeviceMotionEvent = window.DeviceMotionEvent;

function setViewport(width: number, height: number) {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: height });
  fireEvent(window, new Event("resize"));
}

describe("App landscape gate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    setViewport(originalInnerWidth, originalInnerHeight);
    Object.defineProperty(window, "DeviceOrientationEvent", {
      configurable: true,
      value: originalDeviceOrientationEvent,
    });
    Object.defineProperty(window, "DeviceMotionEvent", {
      configurable: true,
      value: originalDeviceMotionEvent,
    });
    vi.useRealTimers();
  });

  it("directs portrait players to rotate before a button-only round", () => {
    setViewport(390, 844);
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Quick Round" }));
    fireEvent.click(screen.getByRole("button", { name: "4th Grade Math Review" }));
    fireEvent.click(screen.getByRole("button", { name: "Tilt Off" }));
    fireEvent.click(screen.getByRole("button", { name: "Start Round" }));

    expect(screen.getByRole("heading", { name: "Turn your phone sideways" })).toBeVisible();
    expect(screen.getByText("Rotate to landscape to start the round.")).toBeVisible();
    expect(screen.getByText(/Disable Portrait Orientation Lock/)).toBeVisible();

    setViewport(844, 390);
    expect(screen.getByText("Ready?")).toBeVisible();
    expect(screen.queryByText(/Down = Correct/)).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1000));
    act(() => vi.advanceTimersByTime(1000));
    act(() => vi.advanceTimersByTime(1000));

    expect(screen.getByRole("region", { name: "Card Actions" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Correct" })).toBeVisible();
  });

  it("offers a button-only round when motion permission is denied", async () => {
    Object.defineProperty(window, "DeviceOrientationEvent", {
      configurable: true,
      value: class DeviceOrientationEvent {
        static requestPermission = vi.fn().mockResolvedValue("denied");
      },
    });
    Object.defineProperty(window, "DeviceMotionEvent", {
      configurable: true,
      value: class DeviceMotionEvent {},
    });
    setViewport(844, 390);
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Quick Round" }));
    fireEvent.click(screen.getByRole("button", { name: "4th Grade Math Review" }));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Start Round" }));
      await Promise.resolve();
    });

    const fallbackButton = screen.getByRole("button", { name: "Continue With Buttons" });
    expect(screen.getByText(/Motion permission was denied/)).toBeVisible();

    fireEvent.click(fallbackButton);
    expect(screen.getByText("Ready?")).toBeVisible();
    expect(screen.queryByText(/Down = Correct/)).not.toBeInTheDocument();
  });

  it("shows the first Team Game phone-holder handoff after deck selection", () => {
    setViewport(844, 390);
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Team Game" }));
    fireEvent.click(screen.getByRole("button", { name: "Choose a Deck" }));
    fireEvent.click(screen.getByRole("button", { name: "4th Grade Math Review" }));

    expect(screen.getByRole("heading", { name: "Team 1's turn" })).toBeVisible();
    expect(screen.getByText(/Hand the phone to/)).toHaveTextContent("Team 1");
  });
});
