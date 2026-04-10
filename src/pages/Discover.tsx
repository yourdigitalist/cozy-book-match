import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, RefreshCw } from "lucide-react";
import SwipeCard from "@/components/SwipeCard";
import BookDetailModal from "@/components/BookDetailModal";
import { SEED_BOOKS, Book } from "@/lib/books";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function Discover() {
  const [books] = useState<Book[]>([...SEED_BOOKS]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const currentBook = books[currentIndex];

  const handleSwipeRight = useCallback(async () => {
    if (!currentBook) return;
    setLiked((prev) => [...prev, currentBook]);

    // Save to DB
    if (user) {
      await supabase.from("favorites").upsert({
        user_id: user.id,
        book_isbn: currentBook.isbn || currentBook.id,
        book_title: currentBook.title,
        book_author: currentBook.author,
        book_cover: currentBook.cover,
        book_description: currentBook.description,
      }, { onConflict: "user_id,book_isbn" });
    }

    toast({ title: `❤️ Loved "${currentBook.title}"`, description: "Added to your favorites!" });
    setCurrentIndex((i) => i + 1);
  }, [currentBook, toast, user]);

  const handleSwipeLeft = useCallback(() => {
    setCurrentIndex((i) => i + 1);
  }, []);

  const resetDeck = () => setCurrentIndex(0);
  const done = currentIndex >= books.length;

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="container mx-auto max-w-lg">
        <motion.div className="text-center mb-8" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">Discover Books</h1>
          <p className="text-muted-foreground font-body">Swipe right to love, left to skip. Tap for details.</p>
        </motion.div>

        <div className="relative flex justify-center items-start min-h-[580px]">
          <AnimatePresence>
            {!done && currentBook && (
              <SwipeCard
                key={currentBook.id}
                book={currentBook}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                onTap={() => setSelectedBook(currentBook)}
              />
            )}
          </AnimatePresence>

          {done && (
            <motion.div className="text-center py-20 space-y-4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <BookOpen className="h-16 w-16 mx-auto text-primary/40" />
              <h2 className="font-display text-2xl font-bold">You've seen them all!</h2>
              <p className="text-muted-foreground">You loved {liked.length} book{liked.length !== 1 ? "s" : ""}.</p>
              <Button onClick={resetDeck} className="gap-2">
                <RefreshCw className="h-4 w-4" /> Start Over
              </Button>
            </motion.div>
          )}
        </div>

        {!done && <p className="text-center text-sm text-muted-foreground mt-4">{currentIndex + 1} of {books.length}</p>}
      </div>

      {selectedBook && <BookDetailModal book={selectedBook} onClose={() => setSelectedBook(null)} />}
    </div>
  );
}
