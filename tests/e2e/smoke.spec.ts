import { expect, test, type Page } from "@playwright/test";

const customDeck = {
  id: "e2e-one-card",
  name: "E2E One Card",
  builtIn: false,
  cards: [{ id: "e2e-card", prompt: "E2E prompt" }],
};

function encodeShareText(text: string): string {
  return Buffer.from(text, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function seedCustomDeck(page: Page) {
  await page.addInitScript((deck) => {
    window.localStorage.setItem("tilted.customDecks.v1", JSON.stringify([deck]));
  }, customDeck);
}

async function gotoApp(page: Page, path = "/") {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(100);
}

test("Quick Round smoke reaches Round Complete with Tilt Off and Correct", async ({ page }) => {
  await seedCustomDeck(page);
  await page.setViewportSize({ width: 844, height: 390 });
  await gotoApp(page);

  await page.getByRole("button", { name: "Quick Round" }).click();
  await page.getByRole("button", { name: "E2E One Card", exact: true }).click();
  await page.getByRole("button", { name: "Tilt Off" }).click();
  await page.getByRole("button", { name: "30s" }).click();
  await page.getByRole("button", { name: "Start Round" }).click();

  await expect(page.getByRole("button", { name: "Correct" })).toBeVisible({ timeout: 6_000 });
  await page.getByRole("button", { name: "Correct" }).click();

  await expect(page.getByRole("heading", { name: "Round Complete!" })).toBeVisible();
});

test("Team Game smoke shows the first phone-holder turn after Choose a Deck", async ({ page }) => {
  await gotoApp(page);

  await page.getByRole("button", { name: "Team Game" }).click();
  await page.getByRole("button", { name: "Choose a Deck" }).click();
  await page.getByRole("button", { name: "4th Grade Math Review", exact: true }).click();

  await expect(page.getByRole("heading", { name: "Team 1's turn" })).toBeVisible();
  await expect(page.getByText(/Hand the phone to/)).toContainText("Team 1");
});

test("custom deck smoke creates a New Deck and uses Add Card", async ({ page }) => {
  await gotoApp(page);

  await page.getByRole("button", { name: "Create/Edit Decks" }).click();
  await page.getByRole("button", { name: "New" }).click();

  await expect(page.locator('input[value="New Deck"]')).toBeVisible();
  await page.getByRole("button", { name: "Add Card" }).click();
  await expect(page.locator('input[value="New card"]')).toBeVisible();
});

test("shared deck smoke imports a valid #deck= link and shows invalid shared deck errors", async ({ page }) => {
  const sharedDeckJson = JSON.stringify({
    id: "shared-e2e",
    name: "Shared E2E",
    cards: [{ id: "shared-e2e-card", prompt: "Shared clue" }],
  });

  await gotoApp(page, `/#deck=${encodeShareText(sharedDeckJson)}`);
  await expect(page.getByLabel("Shared deck import")).toContainText("Shared E2E Imported");
  await page.getByRole("button", { name: "Import Shared Deck" }).click();
  await expect(page.getByRole("heading", { name: "Deck Workshop" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Shared E2E Imported/ })).toBeVisible();

  await page.goto("/#deck=%");
  await page.reload();
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("alert")).toContainText("That shared deck link could not be read.");
});

test("mobile landscape viewport smoke can reach the game screen", async ({ page }) => {
  await seedCustomDeck(page);
  await page.setViewportSize({ width: 844, height: 390 });
  await gotoApp(page);

  await page.getByRole("button", { name: "Quick Round" }).click();
  await page.getByRole("button", { name: "E2E One Card", exact: true }).click();
  await page.getByRole("button", { name: "Tilt Off" }).click();
  await page.getByRole("button", { name: "Start Round" }).click();

  await expect(page.getByRole("region", { name: "Card Actions" })).toBeVisible({ timeout: 6_000 });
});
