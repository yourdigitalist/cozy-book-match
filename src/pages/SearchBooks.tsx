import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import BookDetailModal from "@/components/BookDetailModal";
import BookCard from "@/components/BookCard";
import { searchBooks, Book, SEED_BOOKS } from "@/lib/books";
import { discoverHardcoverBooks } from "@/api/hardcover";

export default function SearchBooks() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Book[]>([]);
  const [popular, setPopular] = useState<Book[]>(SEED_BOOKS.slice(0, 4));
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const books = await discoverHardcoverBooks({ query: "fiction", limit: 20 });
        if (books.length > 0) {
          setPopular(books.slice(0, 4));
        }
      } catch {
        // Keep seed books as fallback.
      }
    };
    fetchPopular();
  }, []);

  const tagPool = useMemo(() => {
    const source = results.length > 0 ? results : popular;
    const categories = new Set<string>();
    const moods = new Set<string>();
    for (const book of source) {
      book.categories.forEach((c) => categories.add(c));
      book.mood.forEach((m) => moods.add(m));
    }
    return {
      categories: Array.from(categories).slice(0, 12),
      moods: Array.from(moods).slice(0, 12),
    };
  }, [results, popular]);

  const handleSearch = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    const books = await searchBooks(q);
    setResults(books);
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleTagClick = (tag: string) => {
    setQuery(tag);
    handleSearch(tag);
  };

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="container mx-auto max-w-3xl">
        <motion.div className="text-center mb-8" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">Search Books</h1>
          <p className="text-muted-foreground font-body">Find your next read by title, mood, or category</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by title, author, mood, plot..." className="pl-12 h-12 text-base bg-card border-border rounded-xl" />
        </form>

        <div className="mb-8 space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Categories</p>
            <div className="flex flex-wrap gap-2">
              {tagPool.categories.map((c) => (
                <Badge key={c} variant="outline" className="cursor-pointer hover:bg-accent transition-colors" onClick={() => handleTagClick(c)}>{c}</Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Moods</p>
            <div className="flex flex-wrap gap-2">
              {tagPool.moods.map((m) => (
                <Badge key={m} variant="secondary" className="cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => handleTagClick(m)}>{m}</Badge>
              ))}
            </div>
          </div>
        </div>

        {loading && <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}

        {!loading && searched && results.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">No books found. Try a different search!</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-4">
            {results.map((book) => (
              <BookCard key={book.id} book={book} compact onClick={() => setSelectedBook(book)} />
            ))}
          </div>
        )}

        {!searched && !loading && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground font-medium">Popular right now</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {popular.map((book) => (
                <BookCard key={book.id} book={book} compact onClick={() => setSelectedBook(book)} />
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedBook && <BookDetailModal book={selectedBook} onClose={() => setSelectedBook(null)} />}
    </div>
  );
}
