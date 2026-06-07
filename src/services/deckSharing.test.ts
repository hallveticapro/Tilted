import { afterEach, describe, expect, it } from "vitest";
import { MAX_IMPORT_BYTES } from "./deckStorage";
import { createDeckShareUrl, readSharedDeckFromLocation } from "./deckSharing";
import type { Deck } from "../types";

function encode(text: string): string {
  return btoa(text).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

describe("deckSharing", () => {
  afterEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("reads a valid shared deck result", () => {
    const deck: Deck = {
      id: "deck-a",
      name: "Shared Review",
      cards: [{ id: "card-a", prompt: "Prompt" }],
    };
    window.history.replaceState(null, "", createDeckShareUrl(deck));

    expect(readSharedDeckFromLocation()).toEqual({
      status: "ok",
      deck: expect.objectContaining({ name: "Shared Review Imported" }),
    });
  });

  it("returns a readable error for malformed shared links", () => {
    window.history.replaceState(null, "", "/#deck=%");

    expect(readSharedDeckFromLocation()).toEqual({
      status: "error",
      message: "That shared deck link could not be read.",
    });
  });

  it("surfaces the size-limit error for oversized shared links", () => {
    window.history.replaceState(null, "", `/#deck=${encode("x".repeat(MAX_IMPORT_BYTES + 1))}`);

    expect(readSharedDeckFromLocation()).toEqual({
      status: "error",
      message: "That JSON deck is too large to import.",
    });
  });
});
