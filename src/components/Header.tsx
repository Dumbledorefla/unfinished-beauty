import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Menu, X, LogOut, Star, Calculator, Sun,
  Users, BookOpen, ShoppingBag, ShoppingCart, User, ChevronDown, Shield, Share2, MessageCircle, Moon, Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import NotificationBell from "@/components/NotificationBell";
import ThemeToggle from "@/components/ThemeToggle";
import StreakBadge from "@/components/StreakBadge";

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
  { label: "Consultas ao Vivo", href: "/consultas", icon: Users },
  { label: "Cursos", href: "/cursos", icon: BookOpen },
  { label: "Produtos", href: "/produtos", icon: ShoppingBag },
  { label: "Blog", href: "/blog", icon: BookOpen },
  { label: "Compatibilidade", href: "/compatibilidade", icon: Heart },
  { label: "Signos", href: "/signos", icon: Sun },
  { label: "Lua", href: "/calendario-lunar", icon: Moon },
  { label: "Afiliados", href: "/afiliado", icon: Share2 },
  { label: "Chat ao Vivo", href: "/chat-ao-vivo", icon: MessageCircle },
];

function NavSubmenu({ items }: { items: { label: string; href: string }[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2 }}
      className="absolute top-full left-0 mt-2 py-2 bg-popover/95 backdrop-blur-xl rounded-xl border border-primary/20 min-w-[200px] shadow-2xl shadow-black/40"
    >
      {items.map((sub) => (
        <Link
          key={sub.href}
          to={sub.href}
          className="block px-4 py-2.5 text-sm text-foreground/70 hover:text-primary hover:bg-primary/10 transition-all duration-200 first:rounded-t-lg last:rounded-b-lg"
        >
          {sub.label}
        </Link>
      ))}
    </motion.div>
  );
}

export default function Header() {
  const location = useLocation();
  const { isAuthenticated, isAdmin, profile, signOut } = useAuth();
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/20 backdrop-blur-xl border-b border-primary/10">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg"
      >
        Pular para o conteúdo principal
      </a>
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center group-hover:border-primary/40 transition-all duration-300 group-hover:shadow-[0_0_16px_hsl(258_62%_55%/0.2)]">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <span className="font-serif text-xl font-bold text-foreground">Chave do Oráculo</span>
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Navegação principal" className="hidden lg:flex items-center gap-0.5">
          {navItems.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => setHoveredNav(item.label)}
              onMouseLeave={() => setHoveredNav(null)}
            >
              {item.submenu ? (
                <button
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-sm rounded-lg transition-all duration-200 ${
                    location.pathname.startsWith(item.href)
                      ? "text-primary bg-primary/10"
                      : "text-foreground/70 hover:text-primary hover:bg-foreground/5"
                  }`}
                >
                  {item.label}
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${hoveredNav === item.label ? 'rotate-180' : ''}`} />
                </button>
              ) : (
                <Link
                  to={item.href}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-sm rounded-lg transition-all duration-200 ${
                    location.pathname === item.href || location.pathname.startsWith(item.href)
                      ? "text-primary bg-primary/10"
                      : "text-foreground/70 hover:text-primary hover:bg-foreground/5"
                  }`}
                >
                  {item.label}
                </Link>
              )}

              {item.submenu && (
                <AnimatePresence>
                  {hoveredNav === item.label && <NavSubmenu items={item.submenu} />}
                </AnimatePresence>
              )}
            </div>
          ))}
        </nav>

        {/* Desktop Cart + Auth */}
        <div className="hidden lg:flex items-center gap-2">
          {isAuthenticated && <NotificationBell />}
          {isAuthenticated && <StreakBadge />}
          <ThemeToggle />
          <Link to="/carrinho" aria-label={`Carrinho com ${totalItems} itens`} className="relative p-2.5 text-foreground/70 hover:text-primary transition-all duration-200 rounded-lg hover:bg-foreground/5">
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold shadow-lg"
              >
                {totalItems}
              </motion.span>
            )}
          </Link>
          {isAuthenticated && profile ? (
            <>
              <Link to="/perfil" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-foreground/5 transition-all duration-200">
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                  <User className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-sm text-primary font-medium">{profile.display_name || profile.email?.split('@')[0]}</span>
              </Link>
              {isAdmin && (
                <Link to="/admin">
                  <Button size="sm" variant="ghost" className="text-primary hover:bg-primary/10 gap-1.5">
                    <Shield className="w-4 h-4" />
                    Admin
                  </Button>
                </Link>
              )}
              <Button size="sm" variant="ghost" className="text-foreground/60 hover:text-destructive hover:bg-destructive/10" onClick={signOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 border border-primary/30 shadow-lg shadow-primary/20">
                Entrar
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex lg:hidden items-center gap-1">
          {isAuthenticated && <NotificationBell />}
          <button
            aria-label="Abrir menu de navegação"
            className="p-2 text-foreground/80 hover:text-primary transition-colors rounded-lg hover:bg-foreground/5"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
          <AnimatePresence mode="wait">
            {mobileMenuOpen ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <Menu className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="lg:hidden bg-background/95 backdrop-blur-xl border-b border-primary/15 overflow-hidden"
          >
            <nav className="container mx-auto py-4 px-4 space-y-1">
              {navItems.map((item) => (
                <div key={item.label}>
                  {item.submenu ? (
                    <>
                      <button
                        className="w-full flex items-center justify-between px-4 py-3 text-foreground/80 hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-200"
                        onClick={() => setActiveSubmenu(activeSubmenu === item.label ? null : item.label)}
                      >
                        <span className="flex items-center gap-3">
                          <item.icon className="w-5 h-5" />
                          {item.label}
                        </span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${activeSubmenu === item.label ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {activeSubmenu === item.label && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="pl-8 space-y-0.5 overflow-hidden"
                          >
                            {item.submenu.map((sub) => (
                              <Link
                                key={sub.href}
                                to={sub.href}
                                className="block px-4 py-2.5 text-sm text-foreground/60 hover:text-primary transition-colors rounded-lg"
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
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
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

              {/* Mobile Cart */}
              <Link
                to="/carrinho"
                className="flex items-center gap-3 px-4 py-3 text-foreground/80 hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ShoppingCart className="w-5 h-5" />
                Carrinho
                {totalItems > 0 && (
                  <span className="ml-auto w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </Link>

              <div className="section-divider my-4" />

              <div className="space-y-1">
                {isAuthenticated ? (
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 text-destructive hover:bg-destructive/10 rounded-xl transition-all duration-200"
                    onClick={() => { signOut(); setMobileMenuOpen(false); }}
                  >
                    <LogOut className="w-5 h-5" />
                    Sair
                  </button>
                ) : (
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
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
