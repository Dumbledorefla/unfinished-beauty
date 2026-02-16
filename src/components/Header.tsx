import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logoImg from "@/assets/logo.png";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Menu, X, LogOut, Star, Calculator, Sun,
  Users, BookOpen, ShoppingBag, ShoppingCart, User, ChevronDown, Shield,
  MessageCircle, Moon, Heart, Compass, Calendar, Newspaper
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import NotificationBell from "@/components/NotificationBell";
import ThemeToggle from "@/components/ThemeToggle";
import StreakBadge from "@/components/StreakBadge";

/* ─── Navegação Principal (5 itens visíveis) ─── */
const mainNavItems = [
  {
    label: "Tarot", href: "/tarot", icon: Star,
    submenu: [
      { label: "Tarot do Dia", href: "/tarot/dia", desc: "Sua mensagem diária" },
      { label: "Tarot do Amor", href: "/tarot/amor", desc: "Energias do coração" },
      { label: "Tarot Completo", href: "/tarot/completo", desc: "Leitura profunda" },
    ]
  },
  { label: "Horóscopo", href: "/horoscopo", icon: Sun },
  { label: "Numerologia", href: "/numerologia", icon: Calculator },
  { label: "Consultas", href: "/consultas", icon: Users },
];

/* ─── Mega-menu "Explorar" (agrupa itens secundários) ─── */
const exploreItems = [
  { label: "Blog", href: "/blog", icon: Newspaper, desc: "Artigos e guias" },
  { label: "Signos", href: "/signos", icon: Compass, desc: "Os 12 signos do zodíaco" },
  { label: "Compatibilidade", href: "/compatibilidade", icon: Heart, desc: "Combine dois signos" },
  { label: "Calendário Lunar", href: "/calendario-lunar", icon: Moon, desc: "Fases da lua" },
  { label: "Mapa Astral", href: "/mapa-astral", icon: Star, desc: "Seu mapa completo" },
  { label: "Chat ao Vivo", href: "/chat-ao-vivo", icon: MessageCircle, desc: "Fale com taromantes" },
  { label: "Cursos", href: "/cursos", icon: BookOpen, desc: "Aprenda tarot e astrologia" },
  { label: "Loja", href: "/produtos", icon: ShoppingBag, desc: "Produtos místicos" },
];

function NavSubmenu({ items }: { items: { label: string; href: string; desc?: string }[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2 }}
      className="absolute top-full left-0 mt-2 py-2 bg-popover/95 backdrop-blur-xl rounded-xl border border-primary/20 min-w-[220px] shadow-2xl shadow-black/40"
    >
      {items.map((sub) => (
        <Link
          key={sub.href}
          to={sub.href}
          className="block px-4 py-2.5 hover:bg-primary/10 transition-all duration-200 first:rounded-t-lg last:rounded-b-lg"
        >
          <span className="text-sm text-foreground/90 hover:text-primary transition-colors">{sub.label}</span>
          {sub.desc && <span className="block text-xs text-muted-foreground mt-0.5">{sub.desc}</span>}
        </Link>
      ))}
    </motion.div>
  );
}

function MegaMenu() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2 }}
      className="absolute top-full right-0 mt-2 py-4 px-4 bg-popover/95 backdrop-blur-xl rounded-xl border border-primary/20 shadow-2xl shadow-black/40"
      style={{ width: "420px" }}
    >
      <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3 px-2">Explorar</p>
      <div className="grid grid-cols-2 gap-1">
        {exploreItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-primary/10 transition-all duration-200 group"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
              <item.icon className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors block">{item.label}</span>
              <span className="text-xs text-muted-foreground line-clamp-1">{item.desc}</span>
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}

export default function Header() {
  const location = useLocation();
  const { isAuthenticated, isAdmin, profile, signOut } = useAuth();
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/20 backdrop-blur-xl border-b border-primary/10">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center group-hover:shadow-[0_0_16px_hsl(258_62%_55%/0.2)] transition-all duration-300">
            <img src={logoImg} alt="Chave do Oráculo" className="w-full h-full object-cover" />
          </div>
          <span className="font-serif text-xl font-bold text-foreground hidden sm:block">Chave do Oráculo</span>
        </Link>

        {/* Desktop Navigation — 4 itens + Explorar */}
        <nav className="hidden lg:flex items-center gap-1">
          {mainNavItems.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => setHoveredNav(item.label)}
              onMouseLeave={() => setHoveredNav(null)}
            >
              {item.submenu ? (
                <button
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
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
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
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
          {/* Botão Explorar — Mega Menu */}
          <div
            className="relative"
            onMouseEnter={() => setHoveredNav("explorar")}
            onMouseLeave={() => setHoveredNav(null)}
          >
            <button
              className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                hoveredNav === "explorar"
                  ? "text-primary bg-primary/10"
                  : "text-foreground/70 hover:text-primary hover:bg-foreground/5"
              }`}
            >
              Explorar
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${hoveredNav === "explorar" ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {hoveredNav === "explorar" && <MegaMenu />}
            </AnimatePresence>
          </div>
        </nav>

        {/* Desktop Actions — Compacto */}
        <div className="hidden lg:flex items-center gap-1.5">
          {isAuthenticated && <StreakBadge />}
          {isAuthenticated && <NotificationBell />}
          <ThemeToggle />
          <Link to="/carrinho" aria-label={`Carrinho com ${totalItems} itens`} className="relative p-2 text-foreground/70 hover:text-primary transition-all duration-200 rounded-lg hover:bg-foreground/5">
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
            <div className="flex items-center gap-1">
              <Link to="/perfil" className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-foreground/5 transition-all duration-200">
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                  <User className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-sm text-primary font-medium max-w-[100px] truncate">{profile.display_name || profile.email?.split('@')[0]}</span>
              </Link>
              {isAdmin && (
                <Link to="/admin">
                  <Button size="icon" variant="ghost" className="text-primary hover:bg-primary/10 w-8 h-8" title="Painel Admin">
                    <Shield className="w-4 h-4" />
                  </Button>
                </Link>
              )}
              <Button size="icon" variant="ghost" className="text-foreground/60 hover:text-destructive hover:bg-destructive/10 w-8 h-8" onClick={signOut} title="Sair">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
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
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
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
            className="lg:hidden bg-background/95 backdrop-blur-xl border-b border-primary/15 overflow-hidden max-h-[80vh] overflow-y-auto"
          >
            <nav className="container mx-auto py-4 px-4 space-y-1">
              {/* Seção Principal */}
              <p className="text-xs font-semibold text-primary uppercase tracking-wider px-4 pt-2 pb-1">Oráculos</p>
              {mainNavItems.map((item) => (
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

              {/* Seção Explorar */}
              <div className="section-divider my-3" />
              <p className="text-xs font-semibold text-primary uppercase tracking-wider px-4 pt-1 pb-1">Explorar</p>
              {exploreItems.map((item) => (
                <Link
                  key={item.href}
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
              ))}

              {/* Carrinho */}
              <div className="section-divider my-3" />
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

              {/* Afiliados (só para logados) */}
              {isAuthenticated && (
                <Link
                  to="/afiliado"
                  className="flex items-center gap-3 px-4 py-3 text-foreground/80 hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Star className="w-5 h-5" />
                  Programa de Afiliados
                </Link>
              )}

              <div className="section-divider my-3" />
              <div className="space-y-1 px-1">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/perfil"
                      className="flex items-center gap-3 px-4 py-3 text-foreground/80 hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="w-5 h-5" />
                      Meu Perfil
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-3 px-4 py-3 text-foreground/80 hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-200"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Shield className="w-5 h-5" />
                        Painel Admin
                      </Link>
                    )}
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 text-destructive hover:bg-destructive/10 rounded-xl transition-all duration-200"
                      onClick={() => { signOut(); setMobileMenuOpen(false); }}
                    >
                      <LogOut className="w-5 h-5" />
                      Sair
                    </button>
                  </>
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
