import type { Card, Deck, Difficulty } from "../types";
import { getDeckPromptExpansions } from "./deckPromptExpansions";
import { expandedDeckSeeds } from "./expandedDeckSeeds";

type SeedCard = Omit<Card, "id">;

function makeCards(deckId: string, cards: SeedCard[]): Card[] {
  return cards.map((card, index) => ({
    ...card,
    id: `${deckId}-${index + 1}`,
  }));
}

function word(
  prompt: string,
  category: string,
  difficulty: Difficulty = "medium",
): SeedCard {
  return { prompt, category, difficulty };
}

function makePromptDeck({
  id,
  name,
  category,
  prompts,
}: (typeof expandedDeckSeeds)[number]): Deck {
  const descriptionName = name === "U.S. States" ? "U.S. states" : name.toLowerCase();
  return {
    id,
    name,
    category,
    description: `Give clues for these ${descriptionName} without saying the answer.`,
    builtIn: true,
    cards: makeCards(
      id,
      prompts.map((prompt) => word(prompt, name, "easy")),
    ),
  };
}

function expandDeck(deck: Deck): Deck {
  const usedPrompts = new Set(deck.cards.map(({ prompt }) => prompt.toLowerCase()));
  const expansionPrompts = getDeckPromptExpansions(deck.id).filter((prompt) => {
    const key = prompt.toLowerCase();
    if (usedPrompts.has(key)) {
      return false;
    }
    usedPrompts.add(key);
    return true;
  });
  const expansionCards = expansionPrompts.map((prompt, index) => ({
      id: `${deck.id}-extra-${index + 1}`,
      prompt,
      category: deck.name,
      difficulty: "easy" as const,
    }));

  return {
    ...deck,
    cards: [...deck.cards, ...expansionCards].slice(0, 50),
  };
}

export const builtInDecks: Deck[] = [
  {
    id: "math-review",
    name: "4th Grade Math Review",
    category: "Education",
    description: "Describe math terms without saying the word on the card.",
    builtIn: true,
    cards: makeCards("math", [
      word("Multiplication", "Operations", "easy"),
      word("Division", "Operations", "easy"),
      word("Factor", "Multiplication and division"),
      word("Multiple", "Multiplication and division"),
      word("Prime number", "Number sense"),
      word("Composite number", "Number sense"),
      word("Area", "Measurement", "easy"),
      word("Perimeter", "Measurement", "easy"),
      word("Numerator", "Fractions"),
      word("Denominator", "Fractions"),
      word("Equivalent fractions", "Fractions"),
      word("Place value", "Number sense"),
      word("Product", "Multiplication and division"),
      word("Quotient", "Multiplication and division"),
      word("Remainder", "Multiplication and division"),
      word("Difference", "Operations", "easy"),
      word("Sum", "Operations", "easy"),
      word("Equation", "Problem solving"),
      word("Estimate", "Problem solving"),
      word("Word problem", "Problem solving", "easy"),
      word("Partial products", "Multi-digit multiplication", "hard"),
      word("Standard algorithm", "Multi-digit multiplication", "hard"),
      word("Line plot", "Data"),
      word("Angle", "Geometry", "easy"),
    ]),
  },
  {
    id: "science-review",
    name: "4th Grade Science Review",
    category: "Education",
    description: "Give clues for science words without using the term itself.",
    builtIn: true,
    cards: makeCards("science", [
      word("Matter", "Properties of matter", "easy"),
      word("Mass", "Properties of matter"),
      word("Solid", "Properties of matter", "easy"),
      word("Liquid", "Properties of matter", "easy"),
      word("Gas", "Properties of matter", "easy"),
      word("Conservation of mass", "Properties of matter", "hard"),
      word("Magnet", "Magnets", "easy"),
      word("Magnetic field", "Magnets"),
      word("Magnet poles", "Magnets"),
      word("Potential energy", "Forms of energy"),
      word("Kinetic energy", "Forms of energy"),
      word("Light energy", "Forms of energy", "easy"),
      word("Sound energy", "Forms of energy", "easy"),
      word("Force", "Force and motion", "easy"),
      word("Motion", "Force and motion", "easy"),
      word("Friction", "Force and motion"),
      word("Weathering", "Earth changes"),
      word("Erosion", "Earth changes"),
      word("Orbit", "Earth and space"),
      word("Experiment", "Scientific investigation", "easy"),
      word("Data", "Scientific investigation", "easy"),
      word("Hypothesis", "Scientific investigation"),
      word("Observation", "Scientific investigation"),
      word("Variable", "Scientific investigation", "hard"),
    ]),
  },
  {
    id: "classroom-fun",
    name: "Fun/Classroom Safe",
    category: "Just for Fun",
    description: "Quick, silly words for party-style clue rounds.",
    builtIn: true,
    cards: makeCards("fun", [
      word("Penguin", "Animals", "easy"),
      word("Octopus", "Animals", "easy"),
      word("Giraffe", "Animals", "easy"),
      word("Kangaroo", "Animals", "easy"),
      word("Roller coaster", "Vacation", "easy"),
      word("Water slide", "Vacation", "easy"),
      word("Road trip", "Vacation", "easy"),
      word("Souvenir", "Vacation"),
      word("Backpack", "School objects", "easy"),
      word("Pencil sharpener", "School objects", "easy"),
      word("Whiteboard", "School objects", "easy"),
      word("Lunchbox", "School objects", "easy"),
      word("Soccer", "Sports", "easy"),
      word("Basketball", "Sports", "easy"),
      word("Bowling", "Sports", "easy"),
      word("Tacos", "Food", "easy"),
      word("Spaghetti", "Food", "easy"),
      word("Pancakes", "Food", "easy"),
      word("Magic carpet", "Stories", "easy"),
      word("Glass slipper", "Stories"),
      word("Pirate ship", "Stories", "easy"),
      word("Treasure map", "Stories", "easy"),
      word("Build a blanket fort", "Silly actions"),
      word("Dance in slow motion", "Silly actions"),
      word("Invisible jump rope", "Silly actions"),
      word("Pretend the floor is lava", "Silly actions"),
    ]),
  },
  {
    id: "vocabulary",
    name: "Vocabulary",
    category: "Education",
    description: "Describe grade-appropriate words without saying them.",
    builtIn: true,
    cards: makeCards("vocab", [
      word("Compare", "Academic vocabulary", "easy"),
      word("Contrast", "Academic vocabulary", "easy"),
      word("Define", "Academic vocabulary", "easy"),
      word("Inference", "Reading"),
      word("Theme", "Reading"),
      word("Narrator", "Reading"),
      word("Fact", "Reading", "easy"),
      word("Opinion", "Reading", "easy"),
      word("Predict", "Academic vocabulary", "easy"),
      word("Summarize", "Academic vocabulary"),
      word("Effect", "Academic vocabulary"),
      word("Cause", "Academic vocabulary"),
      word("Paragraph", "Writing", "easy"),
      word("Antonym", "Language"),
      word("Synonym", "Language"),
      word("Mood", "Reading"),
      word("Precise", "General vocabulary"),
      word("Revise", "Writing"),
      word("Evidence", "Reading"),
      word("Context clue", "Reading"),
      word("Biography", "Reading"),
      word("Persuade", "Writing"),
      word("Sequence", "Academic vocabulary"),
      word("Conclusion", "Academic vocabulary"),
    ]),
  },
  ...expandedDeckSeeds.map(makePromptDeck),
].map(expandDeck);
