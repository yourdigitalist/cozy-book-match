import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, BookOpen, Loader2, Plus } from "lucide-react";
import BookCard from "@/components/BookCard";
import BookDetailModal from "@/components/BookDetailModal";
import { Book } from "@/lib/books";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STANDARD_SHELVES = ["want_to_read", "reading", "read", "not_now"] as const;

function toShelfLabel(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function Favorites() {
  const { user, profile, refreshProfile } = useAuth();
  const [favorites, setFavorites] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [activeShelf, setActiveShelf] = useState("want_to_read");
  const [newShelf, setNewShelf] = useState("");

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
            usersCount: 0,
            shelfName: f.shelf_name || "want_to_read",
          }))
        );
      }
      setLoading(false);
    };
    fetchFavorites();
  }, [user]);

  const shelves = Array.from(new Set([...STANDARD_SHELVES, ...(profile?.custom_shelves || [])]));
  const shelfBooks = favorites.filter((book) => (book.shelfName || "want_to_read") === activeShelf);

  const handleCreateShelf = async () => {
    const trimmed = newShelf.trim().toLowerCase().replace(/ /g, "_");
    if (!user || !trimmed || shelves.includes(trimmed)) return;
    const customShelves = [...(profile?.custom_shelves || []), trimmed];
    await supabase.from("profiles").update({ custom_shelves: customShelves } as any).eq("user_id", user.id);
    await refreshProfile();
    setActiveShelf(trimmed);
    setNewShelf("");
  };

  const moveBookToShelf = async (book: Book, targetShelf: string) => {
    if (!user || !book.shelfName || book.shelfName === targetShelf) return;

    await (supabase.from("favorites") as any).upsert(
      {
        user_id: user.id,
        book_isbn: book.isbn || book.id,
        shelf_name: targetShelf,
        book_title: book.title,
        book_author: book.author,
        book_cover: book.cover,
        book_description: book.description,
      },
      { onConflict: "user_id,book_isbn,shelf_name" }
    );

    await supabase
      .from("favorites")
      .delete()
      .eq("id", book.id)
      .eq("user_id", user.id);

    setFavorites((prev) =>
      prev
        .filter((b) => b.id !== book.id)
        .concat([{ ...book, shelfName: targetShelf }])
    );
  };

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="container mx-auto max-w-3xl">
        <motion.div className="text-center mb-8" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">Your Shelves</h1>
          <p className="text-muted-foreground font-body">Organize books by status and custom shelves</p>
        </motion.div>

        <div className="mb-6 space-y-3">
          <div className="flex flex-wrap gap-2">
            {shelves.map((shelf) => (
              <Badge
                key={shelf}
                variant={activeShelf === shelf ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setActiveShelf(shelf)}
              >
                {toShelfLabel(shelf)}
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newShelf}
              onChange={(e) => setNewShelf(e.target.value)}
              placeholder="Create a new shelf (e.g. cozy_fall)"
            />
            <Button type="button" variant="outline" onClick={handleCreateShelf} className="gap-1">
              <Plus className="h-4 w-4" /> Add shelf
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : shelfBooks.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground/30" />
            <h2 className="font-display text-xl font-semibold">No books on this shelf yet</h2>
            <p className="text-muted-foreground">Start swiping in Discover to save books to your shelves.</p>
            <Link to="/discover">
              <Button className="gap-2"><BookOpen className="h-4 w-4" /> Go Discover</Button>
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {shelfBooks.map((book) => (
              <div key={book.id} className="space-y-2">
                <BookCard book={book} compact onClick={() => setSelectedBook(book)} />
                <Select value={book.shelfName || "want_to_read"} onValueChange={(value) => moveBookToShelf(book, value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Move to shelf" />
                  </SelectTrigger>
                  <SelectContent>
                    {shelves.map((shelf) => (
                      <SelectItem key={shelf} value={shelf}>
                        {toShelfLabel(shelf)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedBook && <BookDetailModal book={selectedBook} onClose={() => setSelectedBook(null)} />}
    </div>
  );
}
