import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Sparkles, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { CATEGORIES, MOODS } from "@/lib/books";

const PACES = [
  { value: "slow", label: "🐌 Slow & savory", desc: "I like to take my time" },
  { value: "moderate", label: "📖 Moderate", desc: "A book a month or so" },
  { value: "fast", label: "🚀 Fast reader", desc: "I devour books quickly" },
];

const steps = ["genres", "moods", "pace"] as const;

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [genres, setGenres] = useState<string[]>([]);
  const [moods, setMoods] = useState<string[]>([]);
  const [pace, setPace] = useState("moderate");
  const [saving, setSaving] = useState(false);
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const toggleGenre = (g: string) => setGenres((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]);
  const toggleMood = (m: string) => setMoods((prev) => prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]);

  const finish = async () => {
    if (!user) return;
    setSaving(true);
    await supabase
      .from("profiles")
      .update({
        favorite_genres: genres,
        favorite_moods: moods,
        reading_pace: pace,
        onboarding_completed: true,
      })
      .eq("user_id", user.id);
    await refreshProfile();
    toast({ title: "You're all set! 📚", description: "Let's find your perfect books." });
    navigate("/discover");
    setSaving(false);
  };

  const currentStep = steps[step];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16">
      <motion.div
        className="w-full max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <Sparkles className="h-10 w-10 mx-auto text-primary mb-3" />
          <h1 className="font-display text-3xl font-bold mb-2">Let's find your taste</h1>
          <p className="text-muted-foreground font-body">Answer a few questions so we can match you perfectly</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-border"}`} />
          ))}
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border shadow-lg min-h-[320px]">
          <AnimatePresence mode="wait">
            {currentStep === "genres" && (
              <motion.div key="genres" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-display text-xl font-semibold mb-2">What genres do you love?</h2>
                <p className="text-sm text-muted-foreground mb-4">Pick at least 2 that excite you</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <Badge
                      key={c}
                      variant={genres.includes(c) ? "default" : "outline"}
                      className={`cursor-pointer text-sm px-3 py-1.5 transition-all ${genres.includes(c) ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
                      onClick={() => toggleGenre(c)}
                    >
                      {genres.includes(c) && <Check className="h-3 w-3 mr-1" />}
                      {c}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            )}

            {currentStep === "moods" && (
              <motion.div key="moods" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-display text-xl font-semibold mb-2">What moods speak to you?</h2>
                <p className="text-sm text-muted-foreground mb-4">Choose the vibes you're drawn to</p>
                <div className="flex flex-wrap gap-2">
                  {MOODS.map((m) => (
                    <Badge
                      key={m}
                      variant={moods.includes(m) ? "default" : "secondary"}
                      className={`cursor-pointer text-sm px-3 py-1.5 transition-all ${moods.includes(m) ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
                      onClick={() => toggleMood(m)}
                    >
                      {moods.includes(m) && <Check className="h-3 w-3 mr-1" />}
                      {m}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            )}

            {currentStep === "pace" && (
              <motion.div key="pace" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-display text-xl font-semibold mb-2">How fast do you read?</h2>
                <p className="text-sm text-muted-foreground mb-4">This helps us suggest the right length books</p>
                <div className="space-y-3">
                  {PACES.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setPace(p.value)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${pace === p.value ? "border-primary bg-accent" : "border-border hover:border-primary/30"}`}
                    >
                      <span className="font-display font-semibold">{p.label}</span>
                      <span className="block text-sm text-muted-foreground mt-0.5">{p.desc}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => setStep((s) => s - 1)} disabled={step === 0} className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>

          {step < steps.length - 1 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={(currentStep === "genres" && genres.length < 2) || (currentStep === "moods" && moods.length < 1)}
              className="gap-1"
            >
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={finish} disabled={saving} className="gap-1">
              {saving ? "Saving..." : "Start Reading"} <BookOpen className="h-4 w-4" />
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
