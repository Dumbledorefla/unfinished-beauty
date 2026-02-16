import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Eye, Calendar, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import ShareButtons from "@/components/ShareButtons";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { usePageSEO } from "@/hooks/usePageSEO";
import { useStructuredData } from "@/hooks/useStructuredData";
import Footer from "@/components/Footer";
import heroBg from "@/assets/hero-bg.jpg";

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image_url: string | null;
  category: string;
  tags: string[];
  author_name: string;
  author_avatar_url: string | null;
  reading_time_min: number;
  view_count: number;
  meta_title: string | null;
  meta_description: string | null;
  published_at: string;
}

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  category: string;
  reading_time_min: number;
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [related, setRelated] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);

  usePageSEO({
    title: post?.meta_title || post?.title || "Artigo",
    description: post?.meta_description || post?.excerpt || "",
    path: `/blog/${slug}`,
    type: post ? "article" : "website",
    publishedTime: post?.published_at,
    author: post?.author_name,
    image: post?.cover_image_url || undefined,
  });

  useStructuredData(post ? [
    {
      type: "article",
      title: post.title,
      description: post.excerpt || "",
      image: post.cover_image_url || undefined,
      author: post.author_name,
      datePublished: post.published_at,
      url: `${window.location.origin}/blog/${post.slug}`,
    },
    {
      type: "breadcrumb",
      items: [
        { name: "Início", url: window.location.origin },
        { name: "Blog", url: `${window.location.origin}/blog` },
        { name: post.title, url: `${window.location.origin}/blog/${post.slug}` },
      ],
    },
  ] : []);

  useEffect(() => {
    if (slug) loadPost(slug);
  }, [slug]);

  const loadPost = async (s: string) => {
    setLoading(true);
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", s)
      .eq("status", "published")
      .single();

    if (data) {
      setPost(data as Post);
      supabase.from("blog_posts").update({ view_count: (data.view_count || 0) + 1 }).eq("id", data.id).then();
      const { data: rel } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, cover_image_url, category, reading_time_min")
        .eq("status", "published")
        .eq("category", data.category)
        .neq("id", data.id)
        .order("published_at", { ascending: false })
        .limit(3);
      if (rel) setRelated(rel);
    }
    setLoading(false);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <Header />
        <div className="pt-24 pb-16 container mx-auto px-4 text-center">
          <div className="animate-pulse space-y-4 max-w-3xl mx-auto">
            <div className="h-8 bg-secondary/40 rounded w-3/4 mx-auto" />
            <div className="h-4 bg-secondary/40 rounded w-1/2 mx-auto" />
            <div className="h-64 bg-secondary/40 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen relative">
        <Header />
        <div className="pt-24 pb-16 container mx-auto px-4 text-center">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Artigo não encontrado</h2>
          <p className="text-muted-foreground mb-6">Este artigo pode ter sido removido ou o link está incorreto.</p>
          <Link to="/blog"><Button variant="outline">Voltar para o Blog</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-15" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background" />
      </div>
      <Header />
      <main className="relative z-10 pt-24 pb-16">
        <article className="container mx-auto px-4 max-w-3xl">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Voltar para o Blog
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-primary text-xs font-semibold uppercase tracking-wider">{post.category}</span>
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4 leading-tight">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(post.published_at)}</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {post.reading_time_min} min de leitura</span>
              <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {post.view_count} visualizações</span>
              <span>Por {post.author_name}</span>
            </div>
          </motion.div>

          {post.cover_image_url && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-10 rounded-2xl overflow-hidden">
              <img src={post.cover_image_url} alt={post.title} className="w-full h-auto" />
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="oracle-prose prose prose-lg max-w-none">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
          </motion.div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-border/30">
              {post.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20">{tag}</span>
              ))}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-border/30">
            <p className="text-center text-sm text-muted-foreground mb-3">Gostou? Compartilhe com alguém que precisa ler isso.</p>
            <ShareButtons text={post.content.slice(0, 500)} title={post.title} />
          </div>

          <div className="mt-10 p-8 rounded-2xl bg-secondary/60 backdrop-blur-md border border-primary/20 text-center">
            <h3 className="font-serif text-xl font-bold text-foreground mb-2">Quer saber o que as cartas dizem para você?</h3>
            <p className="text-muted-foreground text-sm mb-4">Tire sua carta do dia gratuitamente e receba uma mensagem personalizada.</p>
            <Link to="/tarot/dia"><Button className="bg-primary text-primary-foreground hover:bg-primary/90">Tirar minha carta grátis</Button></Link>
          </div>

          {related.length > 0 && (
            <div className="mt-16">
              <h3 className="font-serif text-2xl font-bold text-foreground mb-6">Você também pode gostar</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {related.map((r) => (
                  <Link key={r.id} to={`/blog/${r.slug}`}>
                    <div className="bg-card/80 backdrop-blur-md border border-primary/10 rounded-xl overflow-hidden group hover:border-primary/30 transition-all">
                      {r.cover_image_url && <img src={r.cover_image_url} alt={r.title} className="w-full h-32 object-cover" />}
                      <div className="p-4">
                        <span className="text-primary/70 text-xs uppercase">{r.category}</span>
                        <h4 className="font-semibold text-foreground text-sm mt-1 line-clamp-2 group-hover:text-primary transition-colors">{r.title}</h4>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </main>
      <Footer />
    </div>
  );
}
