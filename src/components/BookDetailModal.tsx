import { Book, getAmazonLink, searchBooks } from "@/lib/books";
import { Star, ShoppingCart, BookOpen, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import BookCard from "./BookCard";

interface BookDetailModalProps {
  book: Book;
  onClose: () => void;
}

export default function BookDetailModal({ book, onClose }: BookDetailModalProps) {
  const [related, setRelated] = useState<Book[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      setLoadingRelated(true);
      // Search by author + first category for related books
      const query = book.categories[0] || book.author;
      const results = await searchBooks(query);
      setRelated(results.filter((r) => r.id !== book.id).slice(0, 6));
      setLoadingRelated(false);
    };
    fetchRelated();
  }, [book]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-2xl max-h-[85vh] bg-background rounded-2xl shadow-2xl border border-border overflow-y-auto"
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-accent transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Book header */}
          <div className="flex flex-col sm:flex-row gap-6 p-6 pb-0">
            <img
              src={book.cover}
              alt={book.title}
              className="w-40 h-56 object-cover rounded-xl shadow-lg flex-shrink-0 mx-auto sm:mx-0"
            />
            <div className="space-y-3 flex-1">
              <h2 className="font-display text-2xl font-bold text-foreground">{book.title}</h2>
              <p className="text-muted-foreground font-body">by {book.author}</p>

              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="font-medium">{book.rating}</span>
                <span className="text-sm text-muted-foreground">• {book.pages} pages</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {book.mood.map((m) => (
                  <Badge key={m} variant="secondary" className="text-xs">{m}</Badge>
                ))}
                {book.categories.slice(0, 3).map((c) => (
                  <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                ))}
              </div>

              <a href={getAmazonLink(book)} target="_blank" rel="noopener noreferrer">
                <Button className="gap-2 w-full sm:w-auto">
                  <ShoppingCart className="h-4 w-4" /> Get on Amazon
                </Button>
              </a>
            </div>
          </div>

          {/* Description */}
          <div className="p-6">
            <h3 className="font-display text-lg font-semibold mb-2">About this book</h3>
            <p className="text-muted-foreground font-body leading-relaxed">{book.description}</p>
          </div>

          {/* Related books */}
          <div className="p-6 pt-0">
            <h3 className="font-display text-lg font-semibold mb-3">You might also like</h3>
            {loadingRelated ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : related.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {related.map((r) => (
                  <BookCard key={r.id} book={r} compact />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No related books found</p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
