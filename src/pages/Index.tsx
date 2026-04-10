import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Search, Heart, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-cozy.jpg";
import { SEED_BOOKS } from "@/lib/books";
import BookCard from "@/components/BookCard";

const features = [
  {
    icon: Sparkles,
    title: "Swipe to Discover",
    description: "Like Tinder, but for books. Swipe right on your next favorite read.",
  },
  {
    icon: Search,
    title: "Smart Search",
    description: "Find books by mood, category, plot, or any vibe you're feeling.",
  },
  {
    icon: Heart,
    title: "Curated For You",
    description: "AI-powered recommendations that learn your taste with every swipe.",
  },
];

export default function Index() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Cozy reading nook" className="w-full h-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/30" />
        </div>

        <div className="container relative z-10 mx-auto px-4 py-20">
          <motion.div
            className="max-w-xl space-y-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="font-display text-lg text-primary font-medium">Cozy Corner</span>
            </div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1]">
              Find your next
              <span className="block text-primary italic">perfect read</span>
            </h1>

            <p className="text-lg text-muted-foreground font-body max-w-md leading-relaxed">
              Swipe through hand-picked books, discover hidden gems by mood and vibe, and fall in love with reading all over again.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/discover">
                <Button size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 text-base px-6">
                  <Sparkles className="h-5 w-5" />
                  Start Discovering
                </Button>
              </Link>
              <Link to="/search">
                <Button size="lg" variant="outline" className="gap-2 text-base px-6">
                  <Search className="h-5 w-5" />
                  Browse Books
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Your Reading Journey Starts Here
            </h2>
            <p className="text-muted-foreground font-body max-w-lg mx-auto">
              Whether you're a devoted bookworm or just getting started, we'll help you find stories that speak to your soul.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="text-center p-6 rounded-xl bg-card border border-border"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-accent flex items-center justify-center">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground font-body">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending picks */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold">Trending Picks</h2>
            <Link to="/search" className="text-primary font-body text-sm flex items-center gap-1 hover:underline">
              See all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SEED_BOOKS.slice(0, 6).map((book) => (
              <BookCard key={book.id} book={book} compact />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="font-display text-lg font-semibold">Cozy Corner</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Made with ☕ for book lovers everywhere. Links may contain affiliate partnerships.
          </p>
        </div>
      </footer>
    </div>
  );
}
