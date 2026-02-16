import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Layout, Lock, Globe, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EmptyState from "@/components/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { usePageSEO } from "@/hooks/usePageSEO";
import heroBg from "@/assets/hero-bg.jpg";

interface SpreadPosition { index: number; label: string; meaning: string; }

interface CustomSpread {
  id: string; name: string; description: string | null;
  positions: SpreadPosition[]; card_count: number; category: string;
  is_public: boolean; use_count: number; created_at: string; user_id: string;
}

const CATEGORIES: Record<string, { label: string; emoji: string }> = {
  geral: { label: "Geral", emoji: "🃏" }, amor: { label: "Amor", emoji: "💕" },
  carreira: { label: "Carreira", emoji: "💼" }, saude: { label: "Saúde", emoji: "🌿" },
  espiritual: { label: "Espiritual", emoji: "✨" }, decisao: { label: "Decisão", emoji: "⚖️" },
  outro: { label: "Outro", emoji: "🔮" },
};

export default function SpreadsCustom() {
  usePageSEO({ title: "Tiragens Personalizadas — Crie Seu Próprio Spread", description: "Crie tiragens de tarot personalizadas com posições e significados únicos.", path: "/spreads" });

  const { user, isAuthenticated } = useAuth();
  const [mySpreads, setMySpreads] = useState<CustomSpread[]>([]);
  const [communitySpreads, setCommunitySpreads] = useState<CustomSpread[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [tab, setTab] = useState<"mine" | "community">("mine");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("geral");
  const [isPublic, setIsPublic] = useState(false);
  const [positions, setPositions] = useState<SpreadPosition[]>([
    { index: 0, label: "Posição 1", meaning: "Situação atual" },
    { index: 1, label: "Posição 2", meaning: "Desafio" },
    { index: 2, label: "Posição 3", meaning: "Conselho" },
  ]);

  useEffect(() => { loadSpreads(); }, [user]);

  const loadSpreads = async () => {
    setLoading(true);
    if (user) {
      const { data: mine } = await supabase.from("custom_spreads").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setMySpreads((mine as unknown as CustomSpread[]) || []);
    }
    const { data: community } = await supabase.from("custom_spreads").select("*").eq("is_public", true).order("use_count", { ascending: false }).limit(20);
    setCommunitySpreads((community as unknown as CustomSpread[]) || []);
    setLoading(false);
  };

  const addPosition = () => setPositions([...positions, { index: positions.length, label: `Posição ${positions.length + 1}`, meaning: "" }]);
  const removePosition = (i: number) => { if (positions.length <= 1) return; setPositions(positions.filter((_, idx) => idx !== i).map((p, idx) => ({ ...p, index: idx }))); };
  const updatePosition = (i: number, field: "label" | "meaning", value: string) => setPositions(positions.map((p, idx) => idx === i ? { ...p, [field]: value } : p));

  const handleCreate = async () => {
    if (!name.trim() || !user) return;
    const { error } = await supabase.from("custom_spreads").insert({
      user_id: user.id, name, description: description || null,
      positions: JSON.stringify(positions) as any, card_count: positions.length,
      category, is_public: isPublic,
    } as any);
    if (error) { toast.error("Erro ao criar tiragem"); return; }
    toast.success("Tiragem criada! ✨");
    setShowCreate(false); setName(""); setDescription("");
    setPositions([{ index: 0, label: "Posição 1", meaning: "Situação atual" }, { index: 1, label: "Posição 2", meaning: "Desafio" }, { index: 2, label: "Posição 3", meaning: "Conselho" }]);
    loadSpreads();
  };

  const deleteSpread = async (id: string) => {
    await supabase.from("custom_spreads").delete().eq("id", id);
    toast.success("Tiragem excluída"); loadSpreads();
  };

  const displaySpreads = tab === "mine" ? mySpreads : communitySpreads;

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background" />
      </div>
      <Header />
      <main className="relative z-10 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <span className="text-primary/70 text-xs font-semibold tracking-[0.2em] uppercase">Crie sua própria tiragem</span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">Tiragens Personalizadas</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">Monte seus próprios layouts com posições e significados personalizados.</p>
          </motion.div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
              <Button variant={tab === "mine" ? "default" : "outline"} size="sm" onClick={() => setTab("mine")}>
                <Lock className="w-3.5 h-3.5 mr-1.5" /> Minhas ({mySpreads.length})
              </Button>
              <Button variant={tab === "community" ? "default" : "outline"} size="sm" onClick={() => setTab("community")}>
                <Globe className="w-3.5 h-3.5 mr-1.5" /> Comunidade ({communitySpreads.length})
              </Button>
            </div>
            <Button onClick={() => setShowCreate(true)} size="sm"><Plus className="w-4 h-4 mr-1.5" /> Criar tiragem</Button>
          </div>

          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="font-serif text-xl">Criar Nova Tiragem</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div><Label>Nome</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Cruz Celta Simplificada" className="mt-1" /></div>
                <div><Label>Descrição (opcional)</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Para que serve?" className="mt-1" /></div>
                <div>
                  <Label>Categoria</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(CATEGORIES).map(([k, { label, emoji }]) => <SelectItem key={k} value={k}>{emoji} {label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Posições ({positions.length})</Label>
                    <Button variant="ghost" size="sm" onClick={addPosition}><Plus className="w-3.5 h-3.5 mr-1" /> Adicionar</Button>
                  </div>
                  <div className="space-y-3">
                    {positions.map((pos, i) => (
                      <div key={i} className="flex gap-2 items-start">
                        <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center mt-2 shrink-0">{i + 1}</span>
                        <div className="flex-1 space-y-1">
                          <Input value={pos.label} onChange={(e) => updatePosition(i, "label", e.target.value)} placeholder="Nome da posição" className="text-sm" />
                          <Input value={pos.meaning} onChange={(e) => updatePosition(i, "meaning", e.target.value)} placeholder="O que representa" className="text-sm" />
                        </div>
                        {positions.length > 1 && <Button variant="ghost" size="sm" onClick={() => removePosition(i)} className="mt-2 text-destructive/50"><Trash2 className="w-3.5 h-3.5" /></Button>}
                      </div>
                    ))}
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="rounded" />
                  <span className="text-sm text-foreground/70">Compartilhar com a comunidade</span>
                </label>
                <Button onClick={handleCreate} disabled={!name.trim()} className="w-full">Criar tiragem ✨</Button>
              </div>
            </DialogContent>
          </Dialog>

          {loading ? (
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => <div key={i} className="bg-secondary/20 backdrop-blur rounded-xl p-6 animate-pulse border border-border/20"><div className="h-5 bg-muted rounded w-2/3 mb-3" /><div className="h-3 bg-muted rounded w-full mb-2" /></div>)}
            </div>
          ) : displaySpreads.length === 0 ? (
            <EmptyState icon={Layout} title={tab === "mine" ? "Nenhuma tiragem criada" : "Nenhuma tiragem compartilhada"} description="Crie sua primeira tiragem personalizada." actionLabel="Criar tiragem" onAction={() => setShowCreate(true)} />
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {displaySpreads.map((spread, index) => {
                const catInfo = CATEGORIES[spread.category] || CATEGORIES.geral;
                const parsedPositions = typeof spread.positions === "string" ? JSON.parse(spread.positions as string) : spread.positions;
                return (
                  <motion.div key={spread.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                    <Card className="bg-secondary/20 backdrop-blur border-border/20 p-5 hover:border-primary/20 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{catInfo.emoji}</span>
                          <div>
                            <h3 className="font-medium text-foreground">{spread.name}</h3>
                            <p className="text-xs text-muted-foreground">{parsedPositions.length} cartas · {catInfo.label}</p>
                          </div>
                        </div>
                        {tab === "mine" && <Button variant="ghost" size="sm" onClick={() => deleteSpread(spread.id)} className="text-destructive/50 hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>}
                      </div>
                      {spread.description && <p className="text-sm text-muted-foreground mb-3">{spread.description}</p>}
                      <div className="flex flex-wrap gap-1.5">
                        {(parsedPositions as SpreadPosition[]).map((pos, i) => (
                          <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{pos.label}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                        {spread.is_public ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        <span>{spread.is_public ? "Público" : "Privado"}</span>
                        {spread.use_count > 0 && <span>· {spread.use_count} usos</span>}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
