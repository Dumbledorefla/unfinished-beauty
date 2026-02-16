import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Clock, Eye, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { usePageSEO } from "@/hooks/usePageSEO";
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
  published_at: string;
}

interface Category {
  name: string;
  slug: string;
  icon: string;
}

export default function Blog() {
  usePageSEO({
    title: "Blog — Tarot, Astrologia, Numerologia e Autoconhecimento",
    description: "Artigos, guias e dicas sobre Tarot, Astrologia, Numerologia, amor, carreira e autoconhecimento. Conteúdo para iluminar seu caminho.",
    path: "/blog",
  });

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [featured, setFeatured] = useState<BlogPost | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("todos");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [postsRes, catsRes] = await Promise.all([
      supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, cover_image_url, category, author_name, featured, reading_time_min, view_count, published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(50),
      supabase.from("blog_categories").select("name, slug, icon").order("sort_order"),
    ]);

    if (postsRes.data) {
      const featuredPost = postsRes.data.find((p) => p.featured) || postsRes.data[0];
      setFeatured(featuredPost || null);
      setPosts(postsRes.data.filter((p) => p.id !== featuredPost?.id));
    }
    if (catsRes.data) setCategories(catsRes.data);
    setLoading(false);
  };

  const filtered = posts.filter((p) => {
    const matchCat = activeCategory === "todos" || p.category === activeCategory;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background" />
      </div>
      <Header />
      <main className="relative z-10 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <span className="text-primary/70 text-xs font-semibold tracking-[0.2em] uppercase">Conhecimento</span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Artigos para iluminar seu caminho
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Tarot, Astrologia, Numerologia e tudo que você precisa saber para se conhecer melhor e tomar decisões com mais clareza.
            </p>
          </motion.div>

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar artigos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-card/80 border-primary/20"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button
                variant={activeCategory === "todos" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory("todos")}
                className="whitespace-nowrap"
              >
                Todos
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.slug}
                  variant={activeCategory === cat.slug ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(cat.slug)}
                  className="whitespace-nowrap"
                >
                  {cat.icon} {cat.name}
                </Button>
              ))}
            </div>
          </div>

          {featured && activeCategory === "todos" && !search && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
              <Link to={`/blog/${featured.slug}`}>
                <Card className="bg-card/80 backdrop-blur-md border-primary/20 overflow-hidden group hover:border-primary/40 transition-all">
                  <div className="grid md:grid-cols-2 gap-0">
                    {featured.cover_image_url && (
                      <div className="h-64 md:h-auto overflow-hidden">
                        <img src={featured.cover_image_url} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <CardContent className="p-8 flex flex-col justify-center">
                      <span className="text-primary text-xs font-semibold uppercase tracking-wider mb-3">Destaque</span>
                      <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                        {featured.title}
                      </h2>
                      {featured.excerpt && <p className="text-muted-foreground mb-4 line-clamp-3">{featured.excerpt}</p>}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{formatDate(featured.published_at)}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {featured.reading_time_min} min de leitura</span>
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {featured.view_count}</span>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            </motion.div>
          )}

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="bg-card/60 border-primary/10 animate-pulse">
                  <div className="h-48 bg-secondary/40" />
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((post, index) => (
                <motion.div key={post.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                  <Link to={`/blog/${post.slug}`}>
                    <Card className="bg-card/80 backdrop-blur-md border-primary/10 overflow-hidden group hover:border-primary/30 transition-all h-full">
                      {post.cover_image_url && (
                        <div className="h-48 overflow-hidden">
                          <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                      )}
                      <CardContent className="p-5">
                        <span className="text-primary/70 text-xs font-semibold uppercase tracking-wider">{post.category}</span>
                        <h3 className="font-serif text-lg font-bold text-foreground mt-2 mb-2 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                        {post.excerpt && <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{post.excerpt}</p>}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{formatDate(post.published_at)}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.reading_time_min} min</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
