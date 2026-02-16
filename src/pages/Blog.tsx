import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Clock, Eye, Search, MessageCircle, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsletterSignup from "@/components/NewsletterSignup";
import { supabase } from "@/integrations/supabase/client";
import { usePageSEO } from "@/hooks/usePageSEO";
import { useStructuredData } from "@/hooks/useStructuredData";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import heroBg from "@/assets/hero-bg.jpg";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  category: string;
  author_name: string;
  featured: boolean;
  reading_time_min: number;
  view_count: number;
  reaction_count: number;
  comment_count: number;
  published_at: string;
}

interface Category {
  name: string;
  slug: string;
  icon: string;
}

const categoryColors: Record<string, string> = {
  tarot: "bg-amber-500/15 text-amber-400",
  astrologia: "bg-indigo-500/15 text-indigo-400",
  numerologia: "bg-emerald-500/15 text-emerald-400",
  amor: "bg-pink-500/15 text-pink-400",
  carreira: "bg-blue-500/15 text-blue-400",
  autoconhecimento: "bg-purple-500/15 text-purple-400",
  "lua-e-ciclos": "bg-slate-500/15 text-slate-400",
  guias: "bg-teal-500/15 text-teal-400",
};

export default function Blog() {
  usePageSEO({
    title: "Blog — Tarot, Astrologia, Numerologia e Autoconhecimento",
    description: "Artigos, guias e dicas sobre Tarot, Astrologia, Numerologia, amor, carreira e autoconhecimento. Conteúdo para iluminar seu caminho.",
    path: "/blog",
  });
  useStructuredData([
    { type: "breadcrumb", items: [{ name: "Início", url: window.location.origin }, { name: "Blog", url: `${window.location.origin}/blog` }] },
  ]);

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [featured, setFeatured] = useState<BlogPost | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("todos");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [popular, setPopular] = useState<BlogPost[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [postsRes, catsRes] = await Promise.all([
      supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, cover_image_url, category, author_name, featured, reading_time_min, view_count, reaction_count, comment_count, published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(50),
      supabase.from("blog_categories").select("name, slug, icon").order("sort_order"),
    ]);

    if (postsRes.data) {
      const allPosts = postsRes.data as BlogPost[];
      const featuredPost = allPosts.find((p) => p.featured) || allPosts[0];
      setFeatured(featuredPost || null);
      setPosts(allPosts.filter((p) => p.id !== featuredPost?.id));
      const sorted = [...allPosts].sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
      setPopular(sorted.slice(0, 5));
    }
    if (catsRes.data) setCategories(catsRes.data as Category[]);
    setLoading(false);
  };

  const filtered = posts.filter((p) => {
    const matchCat = activeCategory === "todos" || p.category === activeCategory;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || (p.excerpt || "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-15" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background" />
      </div>
      <Header />

      <main className="relative z-10 pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 text-primary/70 text-xs font-semibold tracking-[0.2em] uppercase mb-3">
              <BookOpen className="w-3.5 h-3.5" /> Conhecimento
            </span>
            <PageBreadcrumb items={[{ label: "Blog" }]} />
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              Artigos para iluminar seu caminho
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Tarot, Astrologia, Numerologia e tudo que você precisa para se conhecer melhor e tomar decisões com mais clareza.
            </p>
          </motion.div>

          {/* Busca + Filtros */}
          <div className="flex flex-col md:flex-row gap-4 mb-10">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar artigos..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-card/80 border-primary/20" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              <Button variant={activeCategory === "todos" ? "default" : "outline"} size="sm" onClick={() => setActiveCategory("todos")} className="whitespace-nowrap">
                Todos
              </Button>
              {categories.map((cat) => (
                <Button key={cat.slug} variant={activeCategory === cat.slug ? "default" : "outline"} size="sm" onClick={() => setActiveCategory(cat.slug)} className="whitespace-nowrap">
                  {cat.icon} {cat.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Layout: Conteúdo + Sidebar */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Destaque */}
              {featured && activeCategory === "todos" && !search && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                  <Link to={`/blog/${featured.slug}`}>
                    <Card className="bg-card/80 backdrop-blur-md border-primary/20 overflow-hidden group hover:border-primary/40 transition-all">
                      <div className="grid md:grid-cols-2 gap-0">
                        {featured.cover_image_url && (
                          <div className="h-64 md:h-80 overflow-hidden">
                            <img src={featured.cover_image_url} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          </div>
                        )}
                        <CardContent className="p-8 flex flex-col justify-center">
                          <span className={`inline-block w-fit px-2.5 py-0.5 rounded-full text-xs font-semibold mb-3 ${categoryColors[featured.category.toLowerCase()] || "bg-primary/15 text-primary"}`}>
                            Destaque
                          </span>
                          <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors leading-tight">
                            {featured.title}
                          </h2>
                          {featured.excerpt && <p className="text-muted-foreground mb-4 line-clamp-3">{featured.excerpt}</p>}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{formatDate(featured.published_at)}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {featured.reading_time_min} min</span>
                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {featured.view_count || 0}</span>
                            {(featured.reaction_count || 0) > 0 && <span>🔮 {featured.reaction_count}</span>}
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              )}

              {/* Grid */}
              {loading ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="bg-card/60 border-primary/10 animate-pulse">
                      <div className="h-44 bg-secondary/40" />
                      <CardContent className="p-5 space-y-3">
                        <div className="h-4 bg-secondary/40 rounded w-1/4" />
                        <div className="h-6 bg-secondary/40 rounded w-3/4" />
                        <div className="h-4 bg-secondary/40 rounded w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-16">
                  <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum artigo encontrado</h3>
                  <p className="text-muted-foreground">Tente outra busca ou categoria.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {filtered.map((post, index) => (
                    <motion.div key={post.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                      <Link to={`/blog/${post.slug}`}>
                        <Card className="bg-card/80 backdrop-blur-md border-primary/10 overflow-hidden group hover:border-primary/30 transition-all h-full">
                          {post.cover_image_url && (
                            <div className="h-44 overflow-hidden">
                              <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                          )}
                          <CardContent className="p-5">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider mb-2 ${categoryColors[post.category.toLowerCase()] || "bg-primary/15 text-primary"}`}>
                              {post.category}
                            </span>
                            <h3 className="font-serif text-lg font-bold text-foreground mt-1 mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-snug">{post.title}</h3>
                            {post.excerpt && <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{post.excerpt}</p>}
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{formatDate(post.published_at)}</span>
                              <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.reading_time_min} min</span>
                                {(post.comment_count || 0) > 0 && (
                                  <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {post.comment_count}</span>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-8">
              {popular.length > 0 && (
                <div className="bg-card/60 backdrop-blur-md border border-primary/10 rounded-2xl p-6">
                  <h3 className="font-serif text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" /> Mais lidos
                  </h3>
                  <div className="space-y-4">
                    {popular.map((post, i) => (
                      <Link key={post.id} to={`/blog/${post.slug}`} className="flex gap-3 group">
                        <span className="text-2xl font-bold text-primary/30 group-hover:text-primary transition-colors w-8 shrink-0">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">{post.title}</h4>
                          <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Eye className="w-3 h-3" /> {post.view_count || 0} leituras
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <NewsletterSignup source="blog-sidebar" />

              <div className="bg-gradient-to-br from-primary/10 to-amber-500/10 backdrop-blur-md border border-primary/20 rounded-2xl p-6 text-center">
                <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-serif text-lg font-bold text-foreground mb-2">Tire sua carta do dia</h3>
                <p className="text-sm text-muted-foreground mb-4">Receba uma mensagem personalizada das cartas — é grátis.</p>
                <Link to="/tarot/dia">
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" size="sm">
                    Tirar minha carta
                  </Button>
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
