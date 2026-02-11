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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Taromante {
  id: string;
  name: string;
  slug: string;
  title: string | null;
  short_bio: string | null;
  bio: string | null;
  photo_url: string | null;
  experience: number | null;
  price_per_hour: number;
  price_per_session: number | null;
  rating: number | null;
  is_active: boolean | null;
  is_featured: boolean | null;
  specialties: any;
}

const emptyForm = {
  name: "", slug: "", title: "", short_bio: "", bio: "", photo_url: "",
  experience: 0, price_per_hour: 0, price_per_session: null as number | null,
  is_active: true, is_featured: false, specialties: "" as string,
};

export default function AdminTaromantes({ taromantes, onRefresh }: { taromantes: Taromante[]; onRefresh: () => void }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Taromante | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const openNew = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (t: Taromante) => {
    setEditing(t);
    const specs = Array.isArray(t.specialties) ? (t.specialties as string[]).join(", ") : "";
    setForm({
      name: t.name, slug: t.slug, title: t.title || "", short_bio: t.short_bio || "",
      bio: t.bio || "", photo_url: t.photo_url || "", experience: t.experience || 0,
      price_per_hour: t.price_per_hour, price_per_session: t.price_per_session,
      is_active: t.is_active ?? true, is_featured: t.is_featured ?? false, specialties: specs,
    });
    setOpen(true);
  };

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Nome é obrigatório"); return; }
    setSaving(true);
    const slug = form.slug || generateSlug(form.name);
    const specialties = form.specialties ? form.specialties.split(",").map((s) => s.trim()).filter(Boolean) : [];
    const payload = {
      name: form.name, slug, title: form.title || null, short_bio: form.short_bio || null,
      bio: form.bio || null, photo_url: form.photo_url || null, experience: Number(form.experience) || null,
      price_per_hour: Number(form.price_per_hour), price_per_session: form.price_per_session ? Number(form.price_per_session) : null,
      is_active: form.is_active, is_featured: form.is_featured, specialties,
    };

    try {
      if (editing) {
        const { error } = await supabase.from("taromantes").update(payload).eq("id", editing.id);
        if (error) throw error;
        toast.success("Taromante atualizado!");
      } else {
        const { error } = await supabase.from("taromantes").insert(payload);
        if (error) throw error;
        toast.success("Taromante criado!");
      }
      setOpen(false);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este taromante?")) return;
    const { error } = await supabase.from("taromantes").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Taromante excluído!"); onRefresh(); }
  };

  return (
    <Card className="bg-card/80 border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Taromantes ({taromantes.length})</CardTitle>
        <Button size="sm" onClick={openNew}><Plus className="w-4 h-4 mr-1" />Novo Taromante</Button>
      </CardHeader>
      <CardContent>
        {taromantes.length === 0 ? <p className="text-foreground/50 text-center py-8">Nenhum taromante cadastrado.</p> : (
          <Table>
            <TableHeader>
              <TableRow><TableHead>Nome</TableHead><TableHead>Título</TableHead><TableHead>Rating</TableHead><TableHead>Ativo</TableHead><TableHead className="w-24">Ações</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {taromantes.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.name}</TableCell><TableCell>{t.title || "—"}</TableCell>
                  <TableCell>{t.rating || "—"}</TableCell><TableCell>{t.is_active ? "✅" : "❌"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(t)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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
          <DialogHeader><DialogTitle>{editing ? "Editar Taromante" : "Novo Taromante"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div><Label>Nome *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: generateSlug(e.target.value) })} /></div>
            <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
            <div><Label>Título (ex: Tarologista Especialista)</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Bio Curta</Label><Input value={form.short_bio} onChange={(e) => setForm({ ...form, short_bio: e.target.value })} /></div>
            <div><Label>Bio Completa</Label><Textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></div>
            <div><Label>URL da Foto</Label><Input value={form.photo_url} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} /></div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Experiência (anos)</Label><Input type="number" value={form.experience} onChange={(e) => setForm({ ...form, experience: Number(e.target.value) })} /></div>
              <div><Label>Preço/Hora (R$)</Label><Input type="number" step="0.01" value={form.price_per_hour} onChange={(e) => setForm({ ...form, price_per_hour: Number(e.target.value) })} /></div>
              <div><Label>Preço/Sessão (R$)</Label><Input type="number" step="0.01" value={form.price_per_session ?? ""} onChange={(e) => setForm({ ...form, price_per_session: e.target.value ? Number(e.target.value) : null })} /></div>
            </div>
            <div><Label>Especialidades (separadas por vírgula)</Label><Input value={form.specialties} onChange={(e) => setForm({ ...form, specialties: e.target.value })} placeholder="Tarot, Numerologia, Astrologia" /></div>
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
