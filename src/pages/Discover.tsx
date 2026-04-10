import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, RefreshCw } from "lucide-react";
import SwipeCard from "@/components/SwipeCard";
import { SEED_BOOKS, Book } from "@/lib/books";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Discover() {
  const [books, setBooks] = useState<Book[]>([...SEED_BOOKS]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState<Book[]>([]);
  const { toast } = useToast();

  const currentBook = books[currentIndex];

  const handleSwipeRight = useCallback(() => {
    if (!currentBook) return;
    setLiked((prev) => [...prev, currentBook]);
    toast({
      title: `❤️ Loved "${currentBook.title}"`,
      description: "Added to your favorites!",
    });
    setCurrentIndex((i) => i + 1);
  }, [currentBook, toast]);

  const handleSwipeLeft = useCallback(() => {
    setCurrentIndex((i) => i + 1);
  }, []);

  const resetDeck = () => {
    setCurrentIndex(0);
  };

  const done = currentIndex >= books.length;

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="container mx-auto max-w-lg">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">Discover Books</h1>
          <p className="text-muted-foreground font-body">Swipe right to love, left to skip</p>
        </motion.div>

        <div className="relative flex justify-center items-start min-h-[580px]">
          <AnimatePresence>
            {!done && currentBook && (
              <SwipeCard
                key={currentBook.id}
                book={currentBook}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
              />
            )}
          </AnimatePresence>

          {done && (
            <motion.div
              className="text-center py-20 space-y-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <BookOpen className="h-16 w-16 mx-auto text-primary/40" />
              <h2 className="font-display text-2xl font-bold">You've seen them all!</h2>
              <p className="text-muted-foreground">
                You loved {liked.length} book{liked.length !== 1 ? "s" : ""}. Check your favorites or start again!
              </p>
              <Button onClick={resetDeck} className="gap-2">
                <RefreshCw className="h-4 w-4" /> Start Over
              </Button>
            </motion.div>
          )}
        </div>

        {!done && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            {currentIndex + 1} of {books.length}
          </p>
        )}
      </div>
    </div>
  );
}
