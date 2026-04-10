import { BookOpen, Search, Sparkles, Heart, LogOut, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/", label: "Home", icon: BookOpen },
  { to: "/discover", label: "Discover", icon: Sparkles, auth: true },
  { to: "/search", label: "Search", icon: Search },
  { to: "/favorites", label: "Favorites", icon: Heart, auth: true },
];

export default function Navbar() {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const visibleItems = navItems.filter((item) => !item.auth || user);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="font-display text-xl font-semibold text-foreground">Cozy Corner</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {visibleItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link key={item.to} to={item.to} className="relative px-4 py-2 rounded-lg text-sm font-body font-medium transition-colors">
                {active && (
                  <motion.div layoutId="nav-active" className="absolute inset-0 bg-accent rounded-lg" transition={{ type: "spring", bounce: 0.2, duration: 0.4 }} />
                )}
                <span className={`relative z-10 flex items-center gap-1.5 ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </span>
              </Link>
            );
          })}

          {user ? (
            <Button variant="ghost" size="sm" onClick={signOut} className="ml-2 gap-1 text-muted-foreground">
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          ) : (
            <Link to="/auth">
              <Button variant="outline" size="sm" className="ml-2 gap-1">
                <User className="h-4 w-4" /> Sign in
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-2">
          {visibleItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link key={item.to} to={item.to} className={`p-2 rounded-lg transition-colors ${active ? "bg-accent text-foreground" : "text-muted-foreground"}`}>
                <item.icon className="h-5 w-5" />
              </Link>
            );
          })}
          {user ? (
            <button onClick={signOut} className="p-2 text-muted-foreground">
              <LogOut className="h-5 w-5" />
            </button>
          ) : (
            <Link to="/auth" className="p-2 text-muted-foreground">
              <User className="h-5 w-5" />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
