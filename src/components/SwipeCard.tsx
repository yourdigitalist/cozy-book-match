import { useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Heart, X, Star } from "lucide-react";
import { Book, getAmazonLink } from "@/lib/books";
import { Badge } from "@/components/ui/badge";

interface SwipeCardProps {
  book: Book;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onTap?: () => void;
}

export default function SwipeCard({ book, onSwipeLeft, onSwipeRight, onTap }: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);
  const [dragged, setDragged] = useState(false);

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 100) {
      onSwipeRight();
    } else if (info.offset.x < -100) {
      onSwipeLeft();
    }
    setTimeout(() => setDragged(false), 100);
  };

  const handleClick = () => {
    if (!dragged && onTap) onTap();
  };

  return (
    <motion.div
      className="absolute w-full max-w-md cursor-grab active:cursor-grabbing"
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragStart={() => setDragged(true)}
      onDragEnd={handleDragEnd}
      exit={{ x: 300, opacity: 0, rotate: 20 }}
      transition={{ type: "spring", damping: 20 }}
    >
      <div className="relative bg-card rounded-2xl shadow-2xl overflow-hidden border border-border" onClick={handleClick}>
        <motion.div className="absolute top-6 right-6 z-10 px-4 py-2 rounded-lg border-2 border-sage bg-sage/20 rotate-12" style={{ opacity: likeOpacity }}>
          <span className="font-display text-xl font-bold text-sage">LOVE</span>
        </motion.div>
        <motion.div className="absolute top-6 left-6 z-10 px-4 py-2 rounded-lg border-2 border-destructive bg-destructive/20 -rotate-12" style={{ opacity: nopeOpacity }}>
          <span className="font-display text-xl font-bold text-destructive">SKIP</span>
        </motion.div>

        <div className="relative h-80 overflow-hidden bg-muted/20">
          <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
        </div>

        <div className="p-5 space-y-3">
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">{book.title}</h2>
            <p className="text-sm text-muted-foreground">{book.author}</p>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="text-sm font-medium">{book.rating}</span>
            <span className="text-xs text-muted-foreground">• {book.pages} pages</span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-3">{book.description}</p>
          <div className="flex flex-wrap gap-1.5">
            {book.mood.map((m) => (
              <Badge key={m} variant="secondary" className="text-xs">{m}</Badge>
            ))}
          </div>
          <p className="text-xs text-center text-muted-foreground/60 italic">Tap for details and related books</p>
        </div>
      </div>

      <div className="flex justify-center gap-6 mt-5">
        <button onClick={onSwipeLeft} className="w-14 h-14 rounded-full bg-card border-2 border-destructive/30 flex items-center justify-center shadow-lg hover:bg-destructive/10 transition-colors" aria-label="Not now">
          <X className="h-6 w-6 text-destructive" />
        </button>
        <button onClick={onSwipeRight} className="w-14 h-14 rounded-full bg-card border-2 border-sage/30 flex items-center justify-center shadow-lg hover:bg-sage/10 transition-colors" aria-label="Want to read">
          <Heart className="h-6 w-6 text-sage" />
        </button>
      </div>
    </motion.div>
  );
}
