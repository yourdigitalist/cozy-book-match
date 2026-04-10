import { searchHardcoverBooks } from "@/api/hardcover";

export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  description: string;
  categories: string[];
  mood: string[];
  rating: number;
  pages: number;
  isbn: string;
  usersCount?: number;
  shelfName?: string;
}

export const AMAZON_AFFILIATE_TAG = "cozycorner-20";

export function getAmazonLink(book: Book): string {
  if (book.isbn) {
    return `https://www.amazon.com/dp/${book.isbn}?tag=${AMAZON_AFFILIATE_TAG}`;
  }
  const query = encodeURIComponent(`${book.title} ${book.author}`);
  return `https://www.amazon.com/s?k=${query}&tag=${AMAZON_AFFILIATE_TAG}`;
}

export const MOODS = [
  "Cozy", "Thrilling", "Romantic", "Thought-provoking", "Adventurous",
  "Heartwarming", "Dark", "Whimsical", "Inspiring", "Mysterious",
] as const;

export const CATEGORIES = [
  "Fiction", "Romance", "Mystery", "Fantasy", "Sci-Fi", "Historical",
  "Non-Fiction", "Self-Help", "Biography", "Poetry", "Horror", "Thriller",
] as const;

// Curated seed books for the swipe experience
export const SEED_BOOKS: Book[] = [
  {
    id: "1",
    title: "The House in the Cerulean Sea",
    author: "TJ Klune",
    cover: "https://covers.openlibrary.org/b/isbn/1250217288-L.jpg",
    description: "A magical story about a caseworker who discovers that family can be found in the most unexpected places.",
    categories: ["Fantasy", "Fiction"],
    mood: ["Cozy", "Heartwarming", "Whimsical"],
    rating: 4.5,
    pages: 396,
    isbn: "1250217288",
  },
  {
    id: "2",
    title: "Circe",
    author: "Madeline Miller",
    cover: "https://covers.openlibrary.org/b/isbn/0316556343-L.jpg",
    description: "The enchantress Circe tells her story — a tale of gods, transformation, and the discovery of one's own power.",
    categories: ["Fantasy", "Historical", "Fiction"],
    mood: ["Adventurous", "Inspiring", "Thought-provoking"],
    rating: 4.3,
    pages: 393,
    isbn: "0316556343",
  },
  {
    id: "3",
    title: "The Midnight Library",
    author: "Matt Haig",
    cover: "https://covers.openlibrary.org/b/isbn/0525559477-L.jpg",
    description: "Between life and death there is a library where you can try every life you could have lived.",
    categories: ["Fiction"],
    mood: ["Thought-provoking", "Inspiring", "Heartwarming"],
    rating: 4.2,
    pages: 288,
    isbn: "0525559477",
  },
  {
    id: "4",
    title: "Anxious People",
    author: "Fredrik Backman",
    cover: "https://covers.openlibrary.org/b/isbn/1501160834-L.jpg",
    description: "A failed bank robbery leads to a hostage situation that changes everything for a group of strangers.",
    categories: ["Fiction"],
    mood: ["Heartwarming", "Whimsical", "Cozy"],
    rating: 4.1,
    pages: 341,
    isbn: "1501160834",
  },
  {
    id: "5",
    title: "Project Hail Mary",
    author: "Andy Weir",
    cover: "https://covers.openlibrary.org/b/isbn/0593135202-L.jpg",
    description: "A lone astronaut must save humanity from an extinction-level threat — if only he could remember how he got there.",
    categories: ["Sci-Fi", "Fiction"],
    mood: ["Thrilling", "Adventurous", "Inspiring"],
    rating: 4.6,
    pages: 476,
    isbn: "0593135202",
  },
  {
    id: "6",
    title: "The Seven Husbands of Evelyn Hugo",
    author: "Taylor Jenkins Reid",
    cover: "https://covers.openlibrary.org/b/isbn/1501161938-L.jpg",
    description: "An aging Hollywood icon finally tells the truth about her glamorous and scandalous life.",
    categories: ["Fiction", "Romance", "Historical"],
    mood: ["Romantic", "Thought-provoking", "Dark"],
    rating: 4.5,
    pages: 389,
    isbn: "1501161938",
  },
  {
    id: "7",
    title: "Mexican Gothic",
    author: "Silvia Moreno-Garcia",
    cover: "https://covers.openlibrary.org/b/isbn/0525620788-L.jpg",
    description: "A socialite investigates her cousin's mysterious illness in a decaying mansion in 1950s Mexico.",
    categories: ["Horror", "Historical", "Mystery"],
    mood: ["Dark", "Mysterious", "Thrilling"],
    rating: 3.9,
    pages: 301,
    isbn: "0525620788",
  },
  {
    id: "8",
    title: "Klara and the Sun",
    author: "Kazuo Ishiguro",
    cover: "https://covers.openlibrary.org/b/isbn/059331817X-L.jpg",
    description: "An Artificial Friend observes the world from a store window, waiting to be chosen by a customer.",
    categories: ["Sci-Fi", "Fiction"],
    mood: ["Thought-provoking", "Heartwarming"],
    rating: 4.0,
    pages: 303,
    isbn: "059331817X",
  },
];

export async function searchBooks(query: string): Promise<Book[]> {
  try {
    return await searchHardcoverBooks(query, 20);
  } catch {
    return [];
  }
}
