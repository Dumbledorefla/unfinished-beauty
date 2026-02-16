import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const emptyForm = { key: "", value: "", label: "", category: "general", description: "" };

export default function AdminSettings({ settings, onRefresh }: { settings: any[]; onRefresh: () => void }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const openNew = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (s: any) => {
    setEditing(s);
    setForm({ key: s.key, value: s.value, label: s.label || "", category: s.category, description: s.description || "" });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.key.trim() || !form.value.trim()) { toast.error("Chave e valor são obrigatórios"); return; }
    setSaving(true);
    try {
      if (editing) {
        const { error } = await supabase.from("site_settings").update({ value: form.value, label: form.label || null, category: form.category, description: form.description || null }).eq("id", editing.id);
        if (error) throw error;
        toast.success("Configuração atualizada!");
      } else {
        const { error } = await supabase.from("site_settings").insert(form);
        if (error) throw error;
        toast.success("Configuração criada!");
      }
      setOpen(false);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta configuração?")) return;
    const { error } = await supabase.from("site_settings").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Configuração excluída!"); onRefresh(); }
  };

  return (
    <Card className="bg-slate-900 border border-slate-800 rounded-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-slate-200">Configurações do Site</CardTitle>
        <Button size="sm" onClick={openNew}><Plus className="w-4 h-4 mr-1" />Nova Config</Button>
      </CardHeader>
      <CardContent>
        {settings.length === 0 ? <p className="text-slate-400 text-center py-8">Nenhuma configuração definida.</p> : (
          <Table>
            <TableHeader><TableRow><TableHead>Chave</TableHead><TableHead>Valor</TableHead><TableHead>Categoria</TableHead><TableHead className="w-24">Ações</TableHead></TableRow></TableHeader>
            <TableBody>
              {settings.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.label || s.key}</TableCell>
                  <TableCell className="max-w-xs truncate">{s.value}</TableCell>
                  <TableCell>{s.category}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Editar Configuração" : "Nova Configuração"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div><Label>Chave *</Label><Input value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} disabled={!!editing} /></div>
            <div><Label>Label</Label><Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} /></div>
            <div><Label>Valor *</Label><Textarea rows={2} value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /></div>
            <div><Label>Categoria</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
            <div><Label>Descrição</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
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
