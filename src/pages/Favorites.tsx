import { motion } from "framer-motion";
import { Heart, BookOpen } from "lucide-react";
import BookCard from "@/components/BookCard";
import { SEED_BOOKS } from "@/lib/books";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Favorites() {
  // For now, show a placeholder. When we add Lovable Cloud, this will persist.
  const favorites = SEED_BOOKS.slice(0, 3);

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">Your Favorites</h1>
          <p className="text-muted-foreground font-body">Books you've loved — ready to shop</p>
        </motion.div>

        {favorites.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground/30" />
            <h2 className="font-display text-xl font-semibold">No favorites yet</h2>
            <p className="text-muted-foreground">Start swiping in Discover to save books here!</p>
            <Link to="/discover">
              <Button className="gap-2">
                <BookOpen className="h-4 w-4" /> Go Discover
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {favorites.map((book) => (
              <BookCard key={book.id} book={book} compact />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
