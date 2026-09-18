import type { Card, Deck } from "../types";

const harryPotterPrompts = [
  "Harry Potter", "Hermione Granger", "Ron Weasley", "Albus Dumbledore", "Rubeus Hagrid",
  "Severus Snape", "Draco Malfoy", "Lord Voldemort", "Dobby", "Hedwig",
  "Luna Lovegood", "Neville Longbottom", "Ginny Weasley", "Sirius Black", "Remus Lupin",
  "Minerva McGonagall", "Fred and George Weasley", "Molly Weasley", "Arthur Weasley", "Dudley Dursley",
  "Hogwarts", "Gryffindor", "Slytherin", "Ravenclaw", "Hufflepuff",
  "Sorting Hat", "Magic wand", "Broomstick", "Quidditch", "Golden Snitch",
  "Hogwarts Express", "Platform Nine and Three-Quarters", "Diagon Alley", "Gringotts", "The Forbidden Forest",
  "The Great Hall", "The Chamber of Secrets", "The Room of Requirement", "Invisibility Cloak", "Marauder's Map",
  "Time-Turner", "Triwizard Tournament", "Goblet of Fire", "Dementor", "Patronus",
  "Chocolate Frog", "Bertie Bott's Every Flavour Beans", "Butterbeer", "Buckbeak", "Fawkes",
];

const groups = [
  "KATSEYE", "BTS", "BLACKPINK", "TWICE", "Stray Kids", "SEVENTEEN", "TXT", "ENHYPEN",
  "ATEEZ", "aespa", "IVE", "LE SSERAFIM", "NewJeans", "ITZY", "Red Velvet", "(G)I-DLE",
  "EXO", "SHINee", "BIGBANG", "Girls' Generation",
];

// Original title-based clues, not lyrics or lyric paraphrases.
const songs: [title: string, artist: string, clue: string][] = [
  ["Touch", "KATSEYE", "One of your five senses; you use your fingertips for this."],
  ["Gabriela", "KATSEYE", "A girl's first name, with the nickname Gabi."],
  ["Debut", "KATSEYE", "The word for a performer's very first appearance."],
  ["Gnarly", "KATSEYE", "Surfer slang for something extreme or impressive."],
  ["Dynamite", "BTS", "An explosive often pictured as red sticks with a fuse."],
  ["Butter", "BTS", "A yellow spread that melts on warm toast."],
  ["Permission to Dance", "BTS", "Imagine asking a teacher if you may move to the music."],
  ["Boy With Luv", "BTS", "A young guy with a big crush; the last word has a playful spelling."],
  ["Spring Day", "BTS", "A date on the calendar during the season after winter."],
  ["DNA", "BTS", "Three letters for the genetic instructions inside your cells."],
  ["How You Like That", "BLACKPINK", "A four-word question you might ask after showing off a trick."],
  ["Pink Venom", "BLACKPINK", "Combine a rosy color with the poison from a snake."],
  ["Shut Down", "BLACKPINK", "What you tell a computer to do when you are done using it."],
  ["DDU-DU DDU-DU", "BLACKPINK", "A rhythmic sound-effect title, with the same pair repeated."],
  ["The Feels", "TWICE", "Internet slang for a rush of strong emotions."],
  ["What Is Love?", "TWICE", "A question asking someone to explain a romantic feeling."],
  ["FANCY", "TWICE", "A word for something elegant, dressy, or extra special."],
  ["Cheer Up", "TWICE", "Two encouraging words for a friend who feels sad."],
  ["God's Menu", "Stray Kids", "Imagine the list of dishes at a restaurant run by a deity."],
  ["MANIAC", "Stray Kids", "A word for a person acting wildly out of control."],
  ["S-Class", "Stray Kids", "A single letter followed by a word for a category or school lesson."],
  ["Chk Chk Boom", "Stray Kids", "Two short clicking sounds, then the sound of an explosion."],
  ["Super Shy", "NewJeans", "An extra-intense way to describe someone who is very bashful."],
  ["OMG", "NewJeans", "A surprised text message using just three capital letters."],
  ["Ditto", "NewJeans", "A one-word way to say you feel exactly the same."],
  ["Hype Boy", "NewJeans", "An excitement-building word followed by a word for a young guy."],
  ["Supernova", "aespa", "An enormous explosion at the end of a star's life."],
  ["Next Level", "aespa", "Where you go after beating the current stage of a video game."],
  ["Love Dive", "IVE", "A romantic feeling followed by a headfirst jump into a pool."],
  ["ANTIFRAGILE", "LE SSERAFIM", "A word for becoming stronger under stress instead of breaking."],
  ["Super", "SEVENTEEN", "A short word meaning excellent, or the start of a hero's job title."],
  ["HOT", "SEVENTEEN", "The opposite of cold, written in three capital letters."],
  ["CROWN", "TXT", "A king or queen wears this on their head."],
  ["Blue Hour", "TXT", "A cool color paired with sixty minutes."],
  ["Polaroid Love", "ENHYPEN", "An instant-camera brand paired with a romantic feeling."],
  ["WANNABE", "ITZY", "A word for someone hoping to become like somebody else."],
  ["WAVE", "ATEEZ", "It rolls toward the beach, or greets a friend with one hand."],
  ["Red Flavor", "Red Velvet", "A primary color paired with the word for how food tastes."],
  ["Queencard", "(G)I-DLE", "Join a female royal title to something dealt from a deck."],
  ["Love Shot", "EXO", "A romantic feeling paired with one attempt at a basketball basket."],
];

function makeDeck(id: string, name: string, category: string, description: string, cards: Omit<Card, "id">[]): Deck {
  return {
    id, name, category, description, builtIn: true, classroomSafe: true,
    tags: [category, ...(id.startsWith("k-pop") ? ["K-pop", "KATSEYE"] : ["Harry Potter"])],
    cards: cards.map((card, index) => ({ ...card, id: `${id}-${index + 1}`, difficulty: "easy" })),
  };
}

export const studentRequestedDecks: Deck[] = [
  makeDeck("harry-potter", "Harry Potter", "Movies & TV",
    "Hogwarts characters, magical objects, places, and creatures for wizarding fans.",
    harryPotterPrompts.map((prompt) => ({ prompt, category: "Harry Potter" }))),
  makeDeck("k-pop-song-clues", "K-pop Song Clues", "Music",
    "Guess familiar songs from original word clues beneath each title. Includes KATSEYE; no lyrics.",
    songs.map(([prompt, category, clue]) => ({ prompt, category, clue }))),
  makeDeck("k-pop-song-names", "K-pop Song Names", "Music",
    "Recognizable song titles from popular K-pop groups and global pop guests KATSEYE.",
    songs.map(([prompt, category]) => ({ prompt, category }))),
  makeDeck("k-pop-bands", "K-pop Bands", "Music",
    "A focused lineup of popular K-pop groups, plus student favorites KATSEYE.",
    groups.map((prompt) => ({ prompt, category: "K-pop & global pop" }))),
];
