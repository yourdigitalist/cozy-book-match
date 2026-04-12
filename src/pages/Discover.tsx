import { useState, useCallback, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, RefreshCw, Loader2 } from "lucide-react";
import SwipeCard from "@/components/SwipeCard";
import BookDetailModal from "@/components/BookDetailModal";
import { SEED_BOOKS, Book } from "@/lib/books";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { discoverHardcoverBooks } from "@/api/hardcover";

export default function Discover() {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState("fiction");
  const [popularityRange, setPopularityRange] = useState<[number, number]>([0, 2000000]);
  const { toast } = useToast();
  const { user, profile } = useAuth();

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const seeds = [selectedTag.toLowerCase(), "fiction", "fantasy", "romance"];
        const merged: Book[] = [];
        const seen = new Set<string>();
        for (const seed of seeds) {
          const fetched = await discoverHardcoverBooks({ query: seed, limit: 30 });
          for (const book of fetched) {
            if (!seen.has(book.id)) {
              seen.add(book.id);
              merged.push(book);
            }
          }
          if (merged.length >= 60) break;
        }
        setBooks(merged.length > 0 ? merged : [...SEED_BOOKS]);
      } catch {
        setBooks([...SEED_BOOKS]);
      } finally {
        setCurrentIndex(0);
        setLoading(false);
      }
    };

    fetchBooks();
  }, [selectedTag]);

  useEffect(() => {
    if (profile?.favorite_genres?.length) {
      setSelectedTag(profile.favorite_genres[0].toLowerCase());
    } else if (profile?.favorite_moods?.length) {
      setSelectedTag(profile.favorite_moods[0].toLowerCase());
    }
  }, [profile]);

  const filteredBooks = useMemo(
    () =>
      books.filter((book) => {
        const popularity = book.usersCount || 0;
        return popularity >= popularityRange[0] && popularity <= popularityRange[1];
      }),
    [books, popularityRange]
  );

  const filterTags = useMemo(() => {
    const moods = new Set<string>();
    const categories = new Set<string>();
    for (const book of books) {
      book.mood.forEach((m) => moods.add(m));
      book.categories.forEach((c) => categories.add(c));
    }
    const tags = Array.from(new Set([...categories, ...moods]));
    return tags.slice(0, 16);
  }, [books]);

  const currentBook = filteredBooks[currentIndex];

  const saveToShelf = useCallback(async (shelfName: string) => {
    if (!currentBook) return;

    if (user) {
      await (supabase.from("favorites") as any).upsert({
        user_id: user.id,
        book_isbn: currentBook.isbn || currentBook.id,
        shelf_name: shelfName,
        book_title: currentBook.title,
        book_author: currentBook.author,
        book_cover: currentBook.cover,
        book_description: currentBook.description,
      }, { onConflict: "user_id,book_isbn,shelf_name" });
    }
  }, [currentBook, user]);

  const handleSwipeRight = useCallback(async () => {
    if (!currentBook) return;
    setLiked((prev) => [...prev, currentBook]);
    await saveToShelf("want_to_read");

    toast({ title: `❤️ Loved "${currentBook.title}"`, description: "Added to your favorites!" });
    setCurrentIndex((i) => i + 1);
  }, [currentBook, toast, saveToShelf]);

  const handleSwipeLeft = useCallback(async () => {
    await saveToShelf("not_now");
    toast({ title: `⏭️ Skipped "${currentBook?.title || "book"}"`, description: "Saved to Not Now shelf." });
    setCurrentIndex((i) => i + 1);
  }, [currentBook, saveToShelf, toast]);

  const resetDeck = () => setCurrentIndex(0);
  const done = currentIndex >= filteredBooks.length;

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="container mx-auto max-w-lg">
        <motion.div className="text-center mb-8" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">Discover Books</h1>
          <p className="text-muted-foreground font-body">Swipe right to love, left to skip. Tap for details.</p>
        </motion.div>

        <div className="mb-6 rounded-xl border border-border bg-card p-4 space-y-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Genres & moods</p>
            <div className="flex flex-wrap gap-2">
              {filterTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTag === tag ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Popularity range</p>
              <p className="text-xs text-muted-foreground">{popularityRange[0].toLocaleString()} - {popularityRange[1].toLocaleString()} users</p>
            </div>
            <Slider
              min={0}
              max={2000000}
              step={5000}
              value={popularityRange}
              onValueChange={(value) => setPopularityRange([value[0], value[1]])}
            />
          </div>
        </div>

        <div className="relative flex justify-center items-start min-h-[580px]">
          {loading && (
            <div className="py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          <AnimatePresence>
            {!loading && !done && currentBook && (
              <SwipeCard
                key={currentBook.id}
                book={currentBook}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                onTap={() => setSelectedBook(currentBook)}
              />
            )}
          </AnimatePresence>

          {!loading && done && (
            <motion.div className="text-center py-20 space-y-4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <BookOpen className="h-16 w-16 mx-auto text-primary/40" />
              <h2 className="font-display text-2xl font-bold">You've seen them all!</h2>
              <p className="text-muted-foreground">You loved {liked.length} book{liked.length !== 1 ? "s" : ""} in this set.</p>
              <Button onClick={resetDeck} className="gap-2">
                <RefreshCw className="h-4 w-4" /> Start Over
              </Button>
            </motion.div>
          )}
        </div>

        {!loading && !done && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            {currentIndex + 1} of {filteredBooks.length}
          </p>
        )}
      </div>

      {selectedBook && <BookDetailModal book={selectedBook} onClose={() => setSelectedBook(null)} />}
    </div>
  );
}
