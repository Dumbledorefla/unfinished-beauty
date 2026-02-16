import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Eye, Calendar, BookOpen, Bookmark, BookmarkCheck, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShareButtons from "@/components/ShareButtons";
import BlogReadingProgress from "@/components/BlogReadingProgress";
import BlogTableOfContents from "@/components/BlogTableOfContents";
import BlogReactions from "@/components/BlogReactions";
import BlogComments from "@/components/BlogComments";
import BlogCTA from "@/components/BlogCTA";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { usePageSEO } from "@/hooks/usePageSEO";
import { useStructuredData } from "@/hooks/useStructuredData";
import heroBg from "@/assets/hero-bg.jpg";
import { toast } from "sonner";

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
  reaction_count: number;
  comment_count: number;
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
  const [bookmarked, setBookmarked] = useState(false);
  const [userId, setUserId] = useState<string | undefined>();
  const [userName, setUserName] = useState<string | undefined>();
  const [userAvatar, setUserAvatar] = useState<string | undefined>();

  usePageSEO({
    title: post?.meta_title || post?.title || "Artigo",
    description: post?.meta_description || post?.excerpt || "",
    path: `/blog/${slug}`,
    type: post ? "article" : "website",
    publishedTime: post?.published_at,
    author: post?.author_name,
    image: post?.cover_image_url || undefined,
  });

  useStructuredData(
    post
      ? [
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
        ]
      : []
  );

  useEffect(() => {
    if (slug) loadPost();
    checkAuth();
  }, [slug]);

  const checkAuth = async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      setUserId(data.user.id);
      setUserName(data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "Usuário");
      setUserAvatar(data.user.user_metadata?.avatar_url);
    }
  };

  const loadPost = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (data) {
      setPost(data as Post);
      supabase.from("blog_posts").update({ view_count: (data.view_count || 0) + 1 }).eq("id", data.id).then();
      const { data: rel } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, cover_image_url, category, reading_time_min")
        .eq("status", "published")
        .eq("category", data.category)
        .neq("id", data.id)
        .limit(3);
      if (rel) setRelated(rel as RelatedPost[]);
      // Check bookmark
      const { data: authData } = await supabase.auth.getUser();
      if (authData.user) {
        const { data: bm } = await supabase
          .from("blog_bookmarks")
          .select("id")
          .eq("post_id", data.id)
          .eq("user_id", authData.user.id)
          .maybeSingle();
        setBookmarked(!!bm);
      }
    }
    setLoading(false);
  };

  const toggleBookmark = async () => {
    if (!userId || !post) {
      toast.error("Faça login para salvar artigos");
      return;
    }
    if (bookmarked) {
      await supabase.from("blog_bookmarks").delete().eq("post_id", post.id).eq("user_id", userId);
      setBookmarked(false);
      toast.success("Artigo removido dos salvos");
    } else {
      await supabase.from("blog_bookmarks").insert({ post_id: post.id, user_id: userId } as any);
      setBookmarked(true);
      toast.success("Artigo salvo!");
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });

  const markdownComponents = {
    h2: ({ children, ...props }: any) => {
      const text = String(children);
      const id = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      return <h2 id={id} className="scroll-mt-24" {...props}>{children}</h2>;
    },
    h3: ({ children, ...props }: any) => {
      const text = String(children);
      const id = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      return <h3 id={id} className="scroll-mt-24" {...props}>{children}</h3>;
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <Header />
        <div className="container mx-auto px-4 pt-28 max-w-3xl animate-pulse space-y-6">
          <div className="h-4 bg-secondary/40 rounded w-1/4" />
          <div className="h-10 bg-secondary/40 rounded w-3/4" />
          <div className="h-4 bg-secondary/40 rounded w-1/2" />
          <div className="h-64 bg-secondary/40 rounded-2xl" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 bg-secondary/40 rounded" style={{ width: `${70 + Math.random() * 30}%` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen relative">
        <Header />
        <div className="container mx-auto px-4 pt-28 text-center">
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
      <BlogReadingProgress />
      <div className="fixed inset-0 z-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/80 to-background" />
      </div>
      <Header />

      <main className="relative z-10 pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-primary transition-colors">Início</Link>
            <span>/</span>
            <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-primary capitalize">{post.category}</span>
          </nav>

          {/* Layout: TOC + Artigo + Share */}
          <div className="grid xl:grid-cols-[220px_1fr_60px] gap-8 max-w-6xl mx-auto">
            {/* TOC desktop */}
            <BlogTableOfContents content={post.content} variant="desktop" />

            {/* Artigo */}
            <article className="max-w-3xl">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <span className="text-primary text-xs font-semibold uppercase tracking-wider">{post.category}</span>
                <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4 leading-tight">
                  {post.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(post.published_at)}</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {post.reading_time_min} min de leitura</span>
                  <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {post.view_count} visualizações</span>
                  <span>Por {post.author_name}</span>
                </div>
                <div className="flex items-center gap-3 mb-8">
                  <Button variant="outline" size="sm" onClick={toggleBookmark} className="gap-1.5">
                    {bookmarked ? <BookmarkCheck className="w-4 h-4 text-primary" /> : <Bookmark className="w-4 h-4" />}
                    {bookmarked ? "Salvo" : "Salvar"}
                  </Button>
                  <ShareButtons text={post.excerpt || post.title} title={post.title} />
                </div>
              </motion.div>

              {/* TOC mobile */}
              <BlogTableOfContents content={post.content} variant="mobile" />

              {/* Cover */}
              {post.cover_image_url && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-10 rounded-2xl overflow-hidden">
                  <img src={post.cover_image_url} alt={post.title} className="w-full h-auto" />
                </motion.div>
              )}

              {/* CTA inline */}
              <BlogCTA category={post.category} variant="inline" />

              {/* Content */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div className="oracle-prose prose prose-lg max-w-none">
                  <ReactMarkdown components={markdownComponents}>{post.content}</ReactMarkdown>
                </div>
              </motion.div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-border/30">
                  {post.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20">{tag}</span>
                  ))}
                </div>
              )}

              {/* Reactions */}
              <div className="mt-10 pt-8 border-t border-border/30">
                <BlogReactions postId={post.id} userId={userId} />
              </div>

              {/* CTA Footer */}
              <div className="mt-10">
                <BlogCTA category={post.category} variant="footer" />
              </div>

              {/* Share final */}
              <div className="mt-8 pt-6 border-t border-border/30">
                <p className="text-center text-sm text-muted-foreground mb-3">Gostou? Compartilhe com alguém que precisa ler isso.</p>
                <div className="flex justify-center">
                  <ShareButtons text={post.content.slice(0, 500)} title={post.title} />
                </div>
              </div>

              {/* Comments */}
              <div className="mt-12 pt-8 border-t border-border/30">
                <BlogComments postId={post.id} userId={userId} userName={userName} userAvatar={userAvatar} />
              </div>

              {/* Related */}
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

            {/* Share lateral fixo (desktop) */}
            <div className="hidden xl:block">
              <div className="sticky top-28 flex flex-col items-center gap-3">
                <button
                  onClick={() => {
                    const url = window.location.href;
                    window.open(`https://wa.me/?text=${encodeURIComponent(post.title + " " + url)}`, "_blank");
                  }}
                  className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                  title="WhatsApp"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    const url = window.location.href;
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(url)}`, "_blank");
                  }}
                  className="w-10 h-10 rounded-full bg-sky-500/15 flex items-center justify-center text-sky-400 hover:bg-sky-500/25 transition-colors"
                  title="Twitter"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(window.location.href).then(() => toast.success("Link copiado!"))}
                  className="w-10 h-10 rounded-full bg-secondary/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  title="Copiar link"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-border/30" />
                <button
                  onClick={toggleBookmark}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${bookmarked ? "bg-primary/15 text-primary" : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
                  title={bookmarked ? "Remover dos salvos" : "Salvar artigo"}
                >
                  {bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
