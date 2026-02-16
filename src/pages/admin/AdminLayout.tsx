import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  LayoutDashboard, Users, Package, Star, CreditCard, ShoppingBag,
  MessageSquare, GraduationCap, Settings, Tag, Shield, UserPlus,
  FileText, Mail, Bug, BarChart3, Search, Webhook, Bell,
  ChevronLeft, ChevronRight, Home, Globe, Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useNoIndex } from "@/hooks/useNoIndex";
import { Card, CardContent } from "@/components/ui/card";

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  section?: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin", section: "Principal" },
  { label: "Analytics", icon: BarChart3, href: "/admin/analytics", section: "Principal" },

  { label: "Blog", icon: FileText, href: "/admin/blog", section: "Conteúdo" },
  { label: "SEO", icon: Globe, href: "/admin/seo", section: "Conteúdo" },

  { label: "Usuários", icon: Users, href: "/admin/usuarios", section: "Gestão" },
  { label: "Taromantes", icon: Star, href: "/admin/taromantes", section: "Gestão" },
  { label: "Consultas", icon: MessageSquare, href: "/admin/consultas", section: "Gestão" },

  { label: "Produtos", icon: Package, href: "/admin/produtos", section: "Loja" },
  { label: "Pedidos", icon: ShoppingBag, href: "/admin/pedidos", section: "Loja" },
  { label: "Pagamentos", icon: CreditCard, href: "/admin/pagamentos", section: "Loja" },
  { label: "Cupons", icon: Tag, href: "/admin/cupons", section: "Loja" },

  { label: "Cursos", icon: GraduationCap, href: "/admin/cursos", section: "Educação" },

  { label: "Newsletter", icon: Mail, href: "/admin/newsletter", section: "Marketing" },
  { label: "Afiliados", icon: UserPlus, href: "/admin/afiliados", section: "Marketing" },
  { label: "Notificações", icon: Bell, href: "/admin/notificacoes", section: "Marketing" },

  { label: "Integrações", icon: Webhook, href: "/admin/integracoes", section: "Sistema" },
  { label: "Configurações", icon: Settings, href: "/admin/config", section: "Sistema" },
  { label: "Auditoria", icon: Shield, href: "/admin/auditoria", section: "Sistema" },
  { label: "Debug", icon: Bug, href: "/admin/debug", section: "Sistema" },
];

export default function AdminLayout() {
  useNoIndex();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, isAdmin, isProfileLoaded } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate("/auth");
    if (!isLoading && isAuthenticated && isProfileLoaded && !isAdmin) navigate("/");
  }, [isLoading, isAuthenticated, isAdmin, isProfileLoaded]);

  const sections = navItems.reduce((acc, item) => {
    const section = item.section || "Outros";
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  const isActive = (href: string) => {
    if (href === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(href);
  };

  if (isLoading || !isProfileLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        Carregando...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <Card className="bg-card/80 border-destructive/30 max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield className="w-12 h-12 mx-auto text-destructive mb-4" />
            <h2 className="text-xl font-bold mb-2">Acesso Negado</h2>
            <p className="text-muted-foreground mb-4">Você não tem permissão de administrador.</p>
            <Button onClick={() => navigate("/")} variant="outline">Voltar ao Início</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-primary/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-bold">CO</span>
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-serif text-sm font-bold text-foreground">Chave do Oráculo</h2>
              <p className="text-[10px] text-muted-foreground">Painel Administrativo</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {Object.entries(sections).map(([section, items]) => (
          <div key={section} className="mb-4">
            {!collapsed && (
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                {section}
              </p>
            )}
            {items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link key={item.href} to={item.href} onClick={() => setMobileOpen(false)}>
                  <div
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer",
                      active
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-primary/10"
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-primary/20 space-y-2">
        <Link to="/">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-primary/10 cursor-pointer">
            <Home className="w-4 h-4" />
            {!collapsed && <span>Voltar ao Site</span>}
          </div>
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground/40 hover:text-foreground hover:bg-primary/10 w-full"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span>Recolher</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed top-0 left-0 h-screen bg-card/95 backdrop-blur-xl border-r border-primary/20 z-30 transition-all duration-300",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Sidebar - Mobile */}
      <aside
        className={cn(
          "lg:hidden fixed top-0 left-0 h-screen w-64 bg-card/98 backdrop-blur-xl border-r border-primary/20 z-50 transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Main content */}
      <main
        className={cn(
          "flex-1 transition-all duration-300",
          collapsed ? "lg:ml-16" : "lg:ml-60"
        )}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-primary/10 px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden text-muted-foreground hover:text-foreground"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="font-serif text-lg font-bold text-foreground">
                {navItems.find(item => isActive(item.href))?.label || "Admin"}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-3 py-1.5">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 outline-none w-40"
                />
                <kbd className="text-[10px] text-muted-foreground/40 bg-primary/10 px-1.5 py-0.5 rounded">⌘K</kbd>
              </div>
              <Link to="/admin/notificacoes" className="relative text-muted-foreground hover:text-foreground">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full" />
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
