import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Course {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string | null;
  short_description: string | null;
  price: number | null;
  is_free: boolean | null;
  is_active: boolean | null;
  is_featured: boolean | null;
  instructor_name: string | null;
  level: string | null;
  image_url: string | null;
  total_modules: number | null;
  total_lessons: number | null;
  total_duration: number | null;
}

const emptyForm = {
  title: "", slug: "", category: "geral", description: "", short_description: "",
  price: 0, is_free: true, is_active: true, is_featured: false,
  instructor_name: "", level: "iniciante", image_url: "",
  total_modules: 0, total_lessons: 0, total_duration: 0,
};

export default function AdminCourses({ courses, onRefresh }: { courses: Course[]; onRefresh: () => void }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const openNew = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (c: Course) => {
    setEditing(c);
    setForm({
      title: c.title, slug: c.slug, category: c.category,
      description: c.description || "", short_description: c.short_description || "",
      price: c.price || 0, is_free: c.is_free ?? true, is_active: c.is_active ?? true,
      is_featured: c.is_featured ?? false, instructor_name: c.instructor_name || "",
      level: c.level || "iniciante", image_url: c.image_url || "",
      total_modules: c.total_modules || 0, total_lessons: c.total_lessons || 0,
      total_duration: c.total_duration || 0,
    });
    setOpen(true);
  };

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Título é obrigatório"); return; }
    setSaving(true);
    const slug = form.slug || generateSlug(form.title);
    const payload = {
      title: form.title, slug, category: form.category,
      description: form.description || null, short_description: form.short_description || null,
      price: form.is_free ? 0 : Number(form.price), is_free: form.is_free,
      is_active: form.is_active, is_featured: form.is_featured,
      instructor_name: form.instructor_name || null, level: form.level,
      image_url: form.image_url || null,
      total_modules: Number(form.total_modules) || 0,
      total_lessons: Number(form.total_lessons) || 0,
      total_duration: Number(form.total_duration) || 0,
    };

    try {
      if (editing) {
        const { error } = await supabase.from("courses").update(payload).eq("id", editing.id);
        if (error) throw error;
        toast.success("Curso atualizado!");
      } else {
        const { error } = await supabase.from("courses").insert(payload);
        if (error) throw error;
        toast.success("Curso criado!");
      }
      setOpen(false);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este curso?")) return;
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Curso excluído!"); onRefresh(); }
  };

  return (
    <Card className="bg-card/80 border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Cursos ({courses.length})</CardTitle>
        <Button size="sm" onClick={openNew}><Plus className="w-4 h-4 mr-1" />Novo Curso</Button>
      </CardHeader>
      <CardContent>
        {courses.length === 0 ? <p className="text-foreground/50 text-center py-8">Nenhum curso cadastrado.</p> : (
          <Table>
            <TableHeader>
              <TableRow><TableHead>Título</TableHead><TableHead>Categoria</TableHead><TableHead>Preço</TableHead><TableHead>Ativo</TableHead><TableHead className="w-24">Ações</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.title}</TableCell><TableCell>{c.category}</TableCell>
                  <TableCell>{c.is_free ? "Grátis" : `R$ ${Number(c.price).toFixed(2)}`}</TableCell>
                  <TableCell>{c.is_active ? "✅" : "❌"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Editar Curso" : "Novo Curso"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div><Label>Título *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: generateSlug(e.target.value) })} /></div>
            <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Categoria</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="geral">Geral</SelectItem>
                    <SelectItem value="tarot">Tarot</SelectItem>
                    <SelectItem value="numerologia">Numerologia</SelectItem>
                    <SelectItem value="astrologia">Astrologia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Nível</Label>
                <Select value={form.level || "iniciante"} onValueChange={(v) => setForm({ ...form, level: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="iniciante">Iniciante</SelectItem>
                    <SelectItem value="intermediario">Intermediário</SelectItem>
                    <SelectItem value="avancado">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Instrutor</Label><Input value={form.instructor_name} onChange={(e) => setForm({ ...form, instructor_name: e.target.value })} /></div>
            <div><Label>Descrição Curta</Label><Input value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} /></div>
            <div><Label>Descrição</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div><Label>URL da Imagem</Label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} /></div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2"><Switch checked={form.is_free} onCheckedChange={(v) => setForm({ ...form, is_free: v })} /><Label>Gratuito</Label></div>
              {!form.is_free && <div className="flex-1"><Label>Preço (R$)</Label><Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div>}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Módulos</Label><Input type="number" value={form.total_modules} onChange={(e) => setForm({ ...form, total_modules: Number(e.target.value) })} /></div>
              <div><Label>Aulas</Label><Input type="number" value={form.total_lessons} onChange={(e) => setForm({ ...form, total_lessons: Number(e.target.value) })} /></div>
              <div><Label>Duração (min)</Label><Input type="number" value={form.total_duration} onChange={(e) => setForm({ ...form, total_duration: Number(e.target.value) })} /></div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /><Label>Ativo</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} /><Label>Destaque</Label></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
