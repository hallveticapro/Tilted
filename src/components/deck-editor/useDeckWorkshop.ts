import { useEffect, useMemo, useRef, useState } from "react";
import { builtInDecks } from "../../data/builtInDecks";
import {
  cardsFromCsv,
  cardsFromLines,
  clearCustomDeckRecovery,
  copyDeck,
  createDeck,
  exportDeck,
  exportDeckCsv,
  exportDeckLibrary,
  getCustomDeckRecovery,
  importDeck,
  importDeckLibrary,
  saveCustomDecks,
} from "../../services/deckStorage";
import { createDeckShareUrl } from "../../services/deckSharing";
import { downloadText } from "../../services/download";
import type { Card, Deck } from "../../types";
import { createId } from "../../utils/id";

const ALL_CATEGORIES = "All";
const CARD_PAGE_SIZE = 30;

export interface DeletedCardBatch {
  deckId: string;
  cards: Array<{
    card: Card;
    index: number;
  }>;
}

interface UseDeckWorkshopOptions {
  customDecks: Deck[];
  onDecksChange: (decks: Deck[]) => void;
  onBack: () => void;
}

function deckFileBaseName(deck: Deck): string {
  return deck.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "tilted-deck";
}

function downloadJson(deck: Deck): void {
  downloadText(exportDeck(deck), `${deckFileBaseName(deck)}.json`, "application/json");
}

export function useDeckWorkshop({ customDecks, onDecksChange, onBack }: UseDeckWorkshopOptions) {
  const [workingDecks, setWorkingDecks] = useState(customDecks);
  const [selectedDeckId, setSelectedDeckId] = useState(customDecks[0]?.id ?? "");
  const [lineImport, setLineImport] = useState("");
  const [jsonImport, setJsonImport] = useState("");
  const [csvImport, setCsvImport] = useState("");
  const [libraryImport, setLibraryImport] = useState("");
  const [bulkCategory, setBulkCategory] = useState("");
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [cardPage, setCardPage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [deckPendingDelete, setDeckPendingDelete] = useState<Deck | null>(null);
  const [deletedCards, setDeletedCards] = useState<DeletedCardBatch | null>(null);
  const [hasRecovery, setHasRecovery] = useState(() => getCustomDeckRecovery() !== null);
  const persistTimeoutRef = useRef<number | null>(null);
  const pendingDecksRef = useRef<Deck[] | null>(null);
  const starterCategories = useMemo(
    () =>
      Array.from(
        new Set(
          builtInDecks
            .map((deck) => deck.category)
            .filter((category): category is string => Boolean(category)),
        ),
      ),
    [],
  );
  const [starterCategory, setStarterCategory] = useState(
    () => starterCategories[0] ?? ALL_CATEGORIES,
  );
  const visibleStarterDecks =
    starterCategory === ALL_CATEGORIES
      ? builtInDecks
      : builtInDecks.filter((deck) => deck.category === starterCategory);
  const selectedDeck = useMemo(
    () => workingDecks.find((deck) => deck.id === selectedDeckId),
    [selectedDeckId, workingDecks],
  );
  const pageCount = Math.max(1, Math.ceil((selectedDeck?.cards.length ?? 0) / CARD_PAGE_SIZE));
  const visibleCards =
    selectedDeck?.cards.slice(cardPage * CARD_PAGE_SIZE, (cardPage + 1) * CARD_PAGE_SIZE) ?? [];

  const clearPersistTimeout = () => {
    if (persistTimeoutRef.current !== null) {
      window.clearTimeout(persistTimeoutRef.current);
      persistTimeoutRef.current = null;
    }
  };

  const persistDecks = (decks: Deck[]): boolean => {
    try {
      const saved = saveCustomDecks(decks);
      setWorkingDecks(saved);
      onDecksChange(saved);
      pendingDecksRef.current = null;
      setError(null);
      return true;
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "This deck could not be saved.");
      return false;
    }
  };

  const commitDecks = (decks: Deck[]) => {
    clearPersistTimeout();
    pendingDecksRef.current = null;
    setWorkingDecks(decks);
    persistDecks(decks);
  };

  const scheduleDecks = (decks: Deck[]) => {
    setWorkingDecks(decks);
    pendingDecksRef.current = decks;
    clearPersistTimeout();
    persistTimeoutRef.current = window.setTimeout(() => {
      persistTimeoutRef.current = null;
      persistDecks(decks);
    }, 350);
  };

  const flushDecks = (): boolean => {
    clearPersistTimeout();
    if (pendingDecksRef.current) {
      return persistDecks(pendingDecksRef.current);
    }
    return true;
  };

  useEffect(
    () => () => {
      clearPersistTimeout();
      if (pendingDecksRef.current) {
        try {
          saveCustomDecks(pendingDecksRef.current);
        } catch {
          // Invalid in-progress edits remain visible until the user corrects them.
        }
      }
    },
    [],
  );

  const updateSelectedDeck = (partial: Partial<Deck>, deferred = false) => {
    if (!selectedDeck) {
      return;
    }
    const decks = workingDecks.map((deck) =>
      deck.id === selectedDeck.id ? { ...deck, ...partial } : deck,
    );
    if (deferred) {
      scheduleDecks(decks);
    } else {
      commitDecks(decks);
    }
  };

  const selectDeck = (deckId: string) => {
    setSelectedDeckId(deckId);
    setDeletedCards(null);
    setSelectedCardIds([]);
    setCardPage(0);
  };

  const addDeck = () => {
    const deck = createDeck();
    setDeletedCards(null);
    setSelectedCardIds([]);
    commitDecks([...workingDecks, deck]);
    setSelectedDeckId(deck.id);
  };

  const addCopy = (deck: Deck) => {
    const copied = copyDeck(deck);
    setDeletedCards(null);
    setSelectedCardIds([]);
    commitDecks([...workingDecks, copied]);
    setSelectedDeckId(copied.id);
  };

  const deleteDeck = (deck: Deck) => {
    if (!selectedDeck || deck.id !== selectedDeck.id) {
      return;
    }
    const remaining = workingDecks.filter((candidate) => candidate.id !== selectedDeck.id);
    setDeletedCards(null);
    setSelectedCardIds([]);
    setDeckPendingDelete(null);
    commitDecks(remaining);
    setSelectedDeckId(remaining[0]?.id ?? "");
  };

  const updateCard = (cardId: string, partial: Partial<Card>) => {
    if (!selectedDeck) {
      return;
    }
    updateSelectedDeck({
      cards: selectedDeck.cards.map((card) => (card.id === cardId ? { ...card, ...partial } : card)),
    });
  };

  const moveCard = (cardId: string, direction: -1 | 1) => {
    if (!selectedDeck) {
      return;
    }
    const index = selectedDeck.cards.findIndex((card) => card.id === cardId);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= selectedDeck.cards.length) {
      return;
    }
    const cards = [...selectedDeck.cards];
    [cards[index], cards[nextIndex]] = [cards[nextIndex], cards[index]];
    updateSelectedDeck({ cards });
  };

  const toggleSelectedCard = (cardId: string) =>
    setSelectedCardIds((current) =>
      current.includes(cardId) ? current.filter((id) => id !== cardId) : [...current, cardId],
    );

  const bulkDelete = () => {
    if (!selectedDeck || selectedCardIds.length === 0) {
      return;
    }
    const selectedIds = new Set(selectedCardIds);
    const deleted = selectedDeck.cards
      .map((card, index) => ({ card, index }))
      .filter(({ card }) => selectedIds.has(card.id));
    const cards = selectedDeck.cards.filter((card) => !selectedIds.has(card.id));
    if (cards.length === 0) {
      setError("Keep at least one card in the deck.");
      return;
    }
    setDeletedCards({ deckId: selectedDeck.id, cards: deleted });
    updateSelectedDeck({ cards });
    setSelectedCardIds([]);
  };

  const bulkAssignCategory = () => {
    if (!selectedDeck || selectedCardIds.length === 0) {
      return;
    }
    updateSelectedDeck({
      cards: selectedDeck.cards.map((card) =>
        selectedCardIds.includes(card.id) ? { ...card, category: bulkCategory } : card,
      ),
    });
    setSelectedCardIds([]);
    setBulkCategory("");
  };

  const deleteCard = (cardId: string) => {
    if (!selectedDeck || selectedDeck.cards.length === 1) {
      setError("A deck needs at least one card.");
      return;
    }
    const index = selectedDeck.cards.findIndex((card) => card.id === cardId);
    const card = selectedDeck.cards[index];
    if (!card) {
      return;
    }
    setDeletedCards({ deckId: selectedDeck.id, cards: [{ card, index }] });
    updateSelectedDeck({ cards: selectedDeck.cards.filter((candidate) => candidate.id !== cardId) });
  };

  const undoDeleteCard = () => {
    if (!deletedCards) {
      return;
    }
    const sourceDeck = workingDecks.find((deck) => deck.id === deletedCards.deckId);
    if (!sourceDeck || sourceDeck.id !== selectedDeckId) {
      setDeletedCards(null);
      return;
    }
    const cards = [...sourceDeck.cards];
    [...deletedCards.cards]
      .sort((left, right) => left.index - right.index)
      .forEach(({ card, index }) => {
        cards.splice(Math.min(index, cards.length), 0, card);
      });
    commitDecks(workingDecks.map((deck) => (deck.id === sourceDeck.id ? { ...deck, cards } : deck)));
    setDeletedCards(null);
  };

  const addCard = () => {
    if (!selectedDeck) {
      return;
    }
    updateSelectedDeck({
      cards: [...selectedDeck.cards, { id: createId("card"), prompt: "New card" }],
    });
  };

  const appendUniqueCards = (cards: Card[]) => {
    if (!selectedDeck) {
      return 0;
    }
    const prompts = new Set(
      selectedDeck.cards.map(({ prompt }) => prompt.trim().toLocaleLowerCase()),
    );
    const uniqueCards = cards.filter(({ prompt }) => {
      const key = prompt.trim().toLocaleLowerCase();
      if (prompts.has(key)) {
        return false;
      }
      prompts.add(key);
      return true;
    });
    if (uniqueCards.length > 0) {
      updateSelectedDeck({ cards: [...selectedDeck.cards, ...uniqueCards] });
    }
    return uniqueCards.length;
  };

  const importLines = () => {
    try {
      const cards = cardsFromLines(lineImport);
      if (!selectedDeck || cards.length === 0) {
        setError("Paste at least one non-empty line.");
        return;
      }
      const addedCardCount = appendUniqueCards(cards);
      setLineImport("");
      if (addedCardCount < cards.length) {
        setError("Skipped duplicate prompts that were already in this deck.");
      }
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Those cards could not be imported.");
    }
  };

  const importCsv = () => {
    try {
      const cards = cardsFromCsv(csvImport);
      if (!selectedDeck || cards.length === 0) {
        setError("Paste at least one CSV card.");
        return;
      }
      const addedCardCount = appendUniqueCards(cards);
      setCsvImport("");
      if (addedCardCount < cards.length) {
        setError("Skipped duplicate prompts that were already in this deck.");
      }
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "That CSV could not be imported.");
    }
  };

  const importLibrary = () => {
    try {
      const decks = importDeckLibrary(libraryImport);
      setDeletedCards(null);
      setSelectedCardIds([]);
      commitDecks([...workingDecks, ...decks]);
      setSelectedDeckId(decks[0]?.id ?? selectedDeckId);
      setLibraryImport("");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "That deck library could not be imported.");
    }
  };

  const shareDeck = async () => {
    if (!selectedDeck) {
      return;
    }
    const url = createDeckShareUrl(selectedDeck);
    if (navigator.share) {
      try {
        await navigator.share({ title: `${selectedDeck.name} - Tilted`, url });
        setShareMessage("Share sheet opened.");
        return;
      } catch {
        // Copying the URL is a reliable fallback when the share sheet is dismissed.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareMessage("Share URL copied.");
    } catch {
      setShareMessage(url);
    }
  };

  const importJson = () => {
    try {
      const deck = importDeck(jsonImport);
      setDeletedCards(null);
      setSelectedCardIds([]);
      commitDecks([...workingDecks, deck]);
      setSelectedDeckId(deck.id);
      setJsonImport("");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "That deck could not be imported.");
    }
  };

  const downloadRecovery = () => {
    const recovery = getCustomDeckRecovery();
    if (recovery) {
      downloadText(recovery, "tilted-custom-decks-recovery.json");
    }
  };

  const discardRecovery = () => {
    clearCustomDeckRecovery();
    setHasRecovery(false);
  };

  const done = () => {
    if (flushDecks()) {
      onBack();
    }
  };

  const exportLibrary = () =>
    downloadText(exportDeckLibrary(workingDecks), "tilted-deck-library.json", "application/json");

  const exportSelectedDeckJson = () => {
    if (selectedDeck) {
      downloadJson(selectedDeck);
    }
  };

  const exportSelectedDeckCsv = () => {
    if (selectedDeck) {
      downloadText(exportDeckCsv(selectedDeck), `${deckFileBaseName(selectedDeck)}.csv`, "text/csv");
    }
  };

  return {
    allCategories: ALL_CATEGORIES,
    bulkAssignCategory,
    bulkCategory,
    bulkDelete,
    cardPage,
    csvImport,
    deckPendingDelete,
    deleteCard,
    deleteDeck,
    deletedCards: deletedCards?.deckId === selectedDeckId ? deletedCards : null,
    discardRecovery,
    done,
    downloadRecovery,
    error,
    exportLibrary,
    exportSelectedDeckCsv,
    exportSelectedDeckJson,
    hasRecovery,
    importCsv,
    importJson,
    importLibrary,
    importLines,
    jsonImport,
    libraryImport,
    lineImport,
    moveCard,
    pageCount,
    selectDeck,
    selectedCardIds,
    selectedDeck,
    selectedDeckId,
    setBulkCategory,
    setCardPage,
    setCsvImport,
    setDeckPendingDelete,
    setJsonImport,
    setLibraryImport,
    setLineImport,
    shareDeck,
    shareMessage,
    seedCategories: starterCategories,
    seedCategory: starterCategory,
    setSeedCategory: setStarterCategory,
    toggleSelectedCard,
    undoDeleteCard,
    updateCard,
    updateSelectedDeck,
    visibleCards,
    visibleSeedDecks: visibleStarterDecks,
    workingDecks,
    addCard,
    addCopy,
    addDeck,
  };
}
