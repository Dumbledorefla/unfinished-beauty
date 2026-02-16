import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, Star, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: string;
  status: string;
  featured: boolean;
  view_count: number;
  meta_title: string | null;
  meta_description: string | null;
  cover_image_url: string | null;
  tags: string[] | null;
  published_at: string | null;
  created_at: string;
}

export default function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    title: "", slug: "", excerpt: "", content: "", category: "tarot",
    status: "draft", featured: false, meta_title: "", meta_description: "",
    cover_image_url: "", tags: "",
  });

  useEffect(() => { loadPosts(); }, []);

  const loadPosts = async () => {
    const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    if (data) setPosts(data as BlogPost[]);
  };

  const generateSlug = (title: string) =>
    title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleSave = async () => {
    const slug = form.slug || generateSlug(form.title);
    const payload = {
      title: form.title,
      slug,
      excerpt: form.excerpt || null,
      content: form.content,
      category: form.category,
      status: form.status,
      featured: form.featured,
      meta_title: form.meta_title || null,
      meta_description: form.meta_description || null,
      cover_image_url: form.cover_image_url || null,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [],
      published_at: form.status === "published" ? new Date().toISOString() : null,
      reading_time_min: Math.max(1, Math.ceil(form.content.split(/\s+/).length / 200)),
    };

    if (editing) {
      const { error } = await supabase.from("blog_posts").update(payload).eq("id", editing.id);
      if (error) { toast.error("Erro ao atualizar"); return; }
      toast.success("Artigo atualizado!");
    } else {
      const { error } = await supabase.from("blog_posts").insert(payload);
      if (error) { toast.error("Erro ao criar: " + error.message); return; }
      toast.success("Artigo criado!");
    }
    setDialogOpen(false);
    setEditing(null);
    resetForm();
    loadPosts();
  };

  const resetForm = () => setForm({
    title: "", slug: "", excerpt: "", content: "", category: "tarot",
    status: "draft", featured: false, meta_title: "", meta_description: "",
    cover_image_url: "", tags: "",
  });

  const openEdit = (post: BlogPost) => {
    setEditing(post);
    setForm({
      title: post.title, slug: post.slug, excerpt: post.excerpt || "",
      content: post.content, category: post.category, status: post.status,
      featured: post.featured, meta_title: post.meta_title || "", meta_description: post.meta_description || "",
      cover_image_url: post.cover_image_url || "", tags: post.tags?.join(", ") || "",
    });
    setDialogOpen(true);
  };

  const toggleStatus = async (post: BlogPost) => {
    const newStatus = post.status === "published" ? "draft" : "published";
    await supabase.from("blog_posts").update({
      status: newStatus,
      published_at: newStatus === "published" ? new Date().toISOString() : null,
    }).eq("id", post.id);
    loadPosts();
    toast.success(newStatus === "published" ? "Artigo publicado!" : "Artigo despublicado");
  };

  const deletePost = async (id: string) => {
    await supabase.from("blog_posts").delete().eq("id", id);
    loadPosts();
    toast.success("Artigo removido");
  };

  const filtered = posts.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar artigos..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditing(null); resetForm(); } }}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground"><Plus className="w-4 h-4 mr-2" /> Novo Artigo</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Editar Artigo" : "Novo Artigo"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Título do artigo" />
                </div>
                <div className="space-y-2">
                  <Label>Slug (URL)</Label>
                  <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="gerado-automaticamente" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tarot">Tarot</SelectItem>
                      <SelectItem value="astrologia">Astrologia</SelectItem>
                      <SelectItem value="numerologia">Numerologia</SelectItem>
                      <SelectItem value="amor">Amor</SelectItem>
                      <SelectItem value="carreira">Carreira</SelectItem>
                      <SelectItem value="autoconhecimento">Autoconhecimento</SelectItem>
                      <SelectItem value="lua-e-ciclos">Lua e Ciclos</SelectItem>
                      <SelectItem value="guias">Guias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Rascunho</SelectItem>
                      <SelectItem value="published">Publicado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Resumo (aparece nos cards)</Label>
                <Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} placeholder="Um breve resumo do artigo..." />
              </div>
              <div className="space-y-2">
                <Label>URL da imagem de capa</Label>
                <Input value={form.cover_image_url} onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>Tags (separadas por vírgula)</Label>
                <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="tarot, amor, signos" />
              </div>
              <div className="space-y-2">
                <Label>Conteúdo (Markdown)</Label>
                <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={15} placeholder="Escreva o artigo em Markdown..." className="font-mono text-sm" />
              </div>
              <Button onClick={handleSave} className="w-full bg-primary text-primary-foreground">
                {editing ? "Salvar alterações" : "Criar artigo"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {filtered.map((post) => (
          <Card key={post.id} className="bg-card/80 border-primary/10">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${post.status === "published" ? "bg-emerald-500/15 text-emerald-400" : "bg-yellow-500/15 text-yellow-400"}`}>
                    {post.status === "published" ? "Publicado" : "Rascunho"}
                  </span>
                  <span className="text-xs text-muted-foreground">{post.category}</span>
                  {post.featured && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                </div>
                <h4 className="font-semibold text-foreground truncate">{post.title}</h4>
                <p className="text-xs text-muted-foreground">
                  {post.view_count} views • Criado em {new Date(post.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button size="icon" variant="ghost" onClick={() => toggleStatus(post)} title={post.status === "published" ? "Despublicar" : "Publicar"}>
                  {post.status === "published" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => openEdit(post)}><Edit className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deletePost(post.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
