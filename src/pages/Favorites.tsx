import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, BookOpen, Loader2 } from "lucide-react";
import BookCard from "@/components/BookCard";
import BookDetailModal from "@/components/BookDetailModal";
import { Book } from "@/lib/books";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function Favorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchFavorites = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        setFavorites(
          data.map((f) => ({
            id: f.id,
            title: f.book_title,
            author: f.book_author || "Unknown",
            cover: f.book_cover || "",
            description: f.book_description || "",
            categories: [],
            mood: [],
            rating: 4.0,
            pages: 300,
            isbn: f.book_isbn,
          }))
        );
      }
      setLoading(false);
    };
    fetchFavorites();
  }, [user]);

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="container mx-auto max-w-3xl">
        <motion.div className="text-center mb-8" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">Your Favorites</h1>
          <p className="text-muted-foreground font-body">Books you've loved — ready to shop</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground/30" />
            <h2 className="font-display text-xl font-semibold">No favorites yet</h2>
            <p className="text-muted-foreground">Start swiping in Discover to save books here!</p>
            <Link to="/discover">
              <Button className="gap-2"><BookOpen className="h-4 w-4" /> Go Discover</Button>
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {favorites.map((book) => (
              <BookCard key={book.id} book={book} compact onClick={() => setSelectedBook(book)} />
            ))}
          </div>
        )}
      </div>

      {selectedBook && <BookDetailModal book={selectedBook} onClose={() => setSelectedBook(null)} />}
    </div>
  );
}
