import { Book, getAmazonLink } from "@/lib/books";
import { Star, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface BookCardProps {
  book: Book;
  compact?: boolean;
  onClick?: () => void;
}

export default function BookCard({ book, compact = false, onClick }: BookCardProps) {
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="group flex gap-4 p-4 bg-card rounded-lg border border-border hover:shadow-lg transition-shadow cursor-pointer"
        onClick={onClick}
      >
        <img
          src={book.cover}
          alt={book.title}
          className="w-20 h-28 object-cover rounded-md shadow-md flex-shrink-0"
          loading="lazy"
        />
        <div className="flex flex-col justify-between min-w-0 flex-1">
          <div>
            <h3 className="font-display font-semibold text-foreground truncate">{book.title}</h3>
            <p className="text-sm text-muted-foreground">{book.author}</p>
            <div className="flex items-center gap-1 mt-1">
              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
              <span className="text-xs text-muted-foreground">{book.rating}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {book.mood.slice(0, 2).map((m) => (
              <Badge key={m} variant="secondary" className="text-xs">{m}</Badge>
            ))}
            <a
              href={getAmazonLink(book)}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                <ShoppingCart className="h-3 w-3" /> Buy
              </Button>
            </a>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="relative w-full max-w-sm mx-auto bg-card rounded-2xl shadow-xl overflow-hidden border border-border cursor-pointer"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", bounce: 0.3 }}
      onClick={onClick}
    >
      <div className="relative h-80 overflow-hidden">
        <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
      </div>
      <div className="p-6 space-y-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground leading-tight">{book.title}</h2>
          <p className="text-muted-foreground font-body">by {book.author}</p>
        </div>
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 fill-primary text-primary" />
          <span className="text-sm font-medium text-foreground">{book.rating}</span>
          <span className="text-sm text-muted-foreground">• {book.pages} pages</span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{book.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {book.mood.map((m) => (
            <Badge key={m} variant="secondary" className="text-xs">{m}</Badge>
          ))}
          {book.categories.slice(0, 2).map((c) => (
            <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
          ))}
        </div>
        <a href={getAmazonLink(book)} target="_blank" rel="noopener noreferrer" className="block" onClick={(e) => e.stopPropagation()}>
          <Button className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <ShoppingCart className="h-4 w-4" /> Get this book on Amazon
          </Button>
        </a>
      </div>
    </motion.div>
  );
}
