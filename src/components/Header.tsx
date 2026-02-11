import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Menu, X, LogOut, Star, Calculator, Sun,
  Users, BookOpen, ShoppingBag, User, ChevronDown, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  {
    label: "Tarot", href: "/tarot", icon: Star,
    submenu: [
      { label: "Tarot do Dia", href: "/tarot/dia" },
      { label: "Tarot e o Amor", href: "/tarot/amor" },
      { label: "Tarot Completo", href: "/tarot/completo" },
    ]
  },
  { label: "Numerologia", href: "/numerologia", icon: Calculator },
  { label: "Horóscopo", href: "/horoscopo", icon: Sun },
  { label: "Consultas", href: "/consultas", icon: Users },
  { label: "Cursos", href: "/cursos", icon: BookOpen },
  { label: "Produtos", href: "/produtos", icon: ShoppingBag },
];

export default function Header() {
  const location = useLocation();
  const { isAuthenticated, isAdmin, profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/30 backdrop-blur-md border-b border-primary/20">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/30 flex items-center justify-center border border-primary/30">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <span className="font-serif text-xl font-bold text-primary">Oráculo Místico</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <div key={item.label} className="relative group">
              {item.submenu ? (
                <button
                  className={`flex items-center gap-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                    location.pathname.startsWith(item.href)
                      ? "text-primary bg-primary/10"
                      : "text-foreground/80 hover:text-primary hover:bg-foreground/5"
                  }`}
                  onClick={() => setActiveSubmenu(activeSubmenu === item.label ? null : item.label)}
                >
                  {item.label}
                  <ChevronDown className="w-3 h-3" />
                </button>
              ) : (
                <Link
                  to={item.href}
                  className={`flex items-center gap-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                    location.pathname === item.href || location.pathname.startsWith(item.href)
                      ? "text-primary bg-primary/10"
                      : "text-foreground/80 hover:text-primary hover:bg-foreground/5"
                  }`}
                >
                  {item.label}
                </Link>
              )}

              {item.submenu && (
                <div className="absolute top-full left-0 mt-1 py-2 bg-popover/95 backdrop-blur-md rounded-lg border border-primary/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all min-w-[180px] shadow-xl">
                  {item.submenu.map((sub) => (
                    <Link
                      key={sub.href}
                      to={sub.href}
                      className="block px-4 py-2 text-sm text-foreground/80 hover:text-primary hover:bg-primary/10 transition-colors"
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden lg:flex items-center gap-3">
          {isAuthenticated && profile ? (
            <>
              <Link to="/perfil">
                <span className="text-sm text-foreground/70 hover:text-primary transition-colors cursor-pointer flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="text-primary font-semibold">{profile.display_name || profile.email?.split('@')[0]}</span>
                </span>
              </Link>
              {isAdmin && (
                <Link to="/admin">
                  <Button size="sm" variant="ghost" className="text-primary hover:bg-primary/10">
                    <Shield className="w-4 h-4 mr-1" />
                    Admin
                  </Button>
                </Link>
              )}
              <Button size="sm" variant="outline" className="border-foreground/30 text-foreground hover:bg-foreground/10" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 border border-primary/50">
                Entrar
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 text-foreground/80 hover:text-primary transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background/95 backdrop-blur-md border-b border-primary/20 overflow-hidden"
          >
            <nav className="container mx-auto py-4 px-4 space-y-1">
              {navItems.map((item) => (
                <div key={item.label}>
                  {item.submenu ? (
                    <>
                      <button
                        className="w-full flex items-center justify-between px-4 py-3 text-foreground/80 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        onClick={() => setActiveSubmenu(activeSubmenu === item.label ? null : item.label)}
                      >
                        <span className="flex items-center gap-3">
                          <item.icon className="w-5 h-5" />
                          {item.label}
                        </span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${activeSubmenu === item.label ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {activeSubmenu === item.label && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pl-8 space-y-1 overflow-hidden"
                          >
                            {item.submenu.map((sub) => (
                              <Link
                                key={sub.href}
                                to={sub.href}
                                className="block px-4 py-2 text-sm text-foreground/60 hover:text-primary transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                {sub.label}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      to={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        location.pathname.startsWith(item.href)
                          ? "text-primary bg-primary/10"
                          : "text-foreground/80 hover:text-primary hover:bg-primary/10"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}

              <div className="pt-4 mt-4 border-t border-primary/20">
                {isAuthenticated ? (
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    onClick={() => { signOut(); setMobileMenuOpen(false); }}
                  >
                    <LogOut className="w-5 h-5" />
                    Sair
                  </button>
                ) : (
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                      Entrar
                    </Button>
                  </Link>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
