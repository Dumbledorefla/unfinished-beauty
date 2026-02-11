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

interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  original_price: number | null;
  description: string | null;
  short_description: string | null;
  image_url: string | null;
  is_active: boolean | null;
  is_featured: boolean | null;
  life_area: string | null;
}

const emptyProduct = {
  name: "", slug: "", category: "geral", price: 0, original_price: null as number | null,
  description: "", short_description: "", image_url: "", is_active: true, is_featured: false, life_area: "geral",
};

export default function AdminProducts({ products, onRefresh }: { products: Product[]; onRefresh: () => void }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);

  const openNew = () => { setEditing(null); setForm(emptyProduct); setOpen(true); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, slug: p.slug, category: p.category, price: p.price,
      original_price: p.original_price, description: p.description || "",
      short_description: p.short_description || "", image_url: p.image_url || "",
      is_active: p.is_active ?? true, is_featured: p.is_featured ?? false,
      life_area: p.life_area || "geral",
    });
    setOpen(true);
  };

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Nome é obrigatório"); return; }
    setSaving(true);
    const slug = form.slug || generateSlug(form.name);
    const payload = { ...form, slug, price: Number(form.price), original_price: form.original_price ? Number(form.original_price) : null };

    try {
      if (editing) {
        const { error } = await supabase.from("products").update(payload).eq("id", editing.id);
        if (error) throw error;
        toast.success("Produto atualizado!");
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
        toast.success("Produto criado!");
      }
      setOpen(false);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar produto");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Produto excluído!"); onRefresh(); }
  };

  return (
    <Card className="bg-card/80 border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Produtos ({products.length})</CardTitle>
        <Button size="sm" onClick={openNew}><Plus className="w-4 h-4 mr-1" />Novo Produto</Button>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? <p className="text-foreground/50 text-center py-8">Nenhum produto cadastrado.</p> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead><TableHead>Categoria</TableHead><TableHead>Preço</TableHead><TableHead>Ativo</TableHead><TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell>R$ {Number(p.price).toFixed(2)}</TableCell>
                  <TableCell>{p.is_active ? "✅" : "❌"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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
          <DialogHeader><DialogTitle>{editing ? "Editar Produto" : "Novo Produto"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div><Label>Nome *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: generateSlug(e.target.value) })} /></div>
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
              <div><Label>Área de Vida</Label>
                <Select value={form.life_area || "geral"} onValueChange={(v) => setForm({ ...form, life_area: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="geral">Geral</SelectItem>
                    <SelectItem value="amor">Amor</SelectItem>
                    <SelectItem value="carreira">Carreira</SelectItem>
                    <SelectItem value="saude">Saúde</SelectItem>
                    <SelectItem value="financas">Finanças</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Preço (R$)</Label><Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div>
              <div><Label>Preço Original (R$)</Label><Input type="number" step="0.01" value={form.original_price ?? ""} onChange={(e) => setForm({ ...form, original_price: e.target.value ? Number(e.target.value) : null })} /></div>
            </div>
            <div><Label>Descrição Curta</Label><Input value={form.short_description || ""} onChange={(e) => setForm({ ...form, short_description: e.target.value })} /></div>
            <div><Label>Descrição</Label><Textarea rows={3} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div><Label>URL da Imagem</Label><Input value={form.image_url || ""} onChange={(e) => setForm({ ...form, image_url: e.target.value })} /></div>
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
