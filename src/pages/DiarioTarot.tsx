import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Plus, Search, Filter, Calendar, TrendingUp,
  Flame, ChevronDown, ChevronUp, BarChart3, X, Trash2
} from "lucide-react";
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
import ReactMarkdown from "react-markdown";
import { useJournal, ENTRY_TYPES, MOODS } from "@/hooks/useJournal";
import { usePageSEO } from "@/hooks/usePageSEO";
import heroBg from "@/assets/hero-bg.jpg";

export default function DiarioTarot() {
  usePageSEO({
    title: "Diário de Tarot — Registre Suas Leituras e Reflexões",
    description: "Seu espaço sagrado para registrar leituras, sonhos, rituais e reflexões. Acompanhe sua jornada espiritual.",
    path: "/diario",
  });

  const { entries, loading, stats, createEntry, deleteEntry } = useJournal();
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<string>("reflection");
  const [newContent, setNewContent] = useState("");
  const [newMoodBefore, setNewMoodBefore] = useState<string>("");
  const [newMoodAfter, setNewMoodAfter] = useState<string>("");
  const [newTags, setNewTags] = useState("");
  const [saving, setSaving] = useState(false);

  const filteredEntries = entries.filter((e) => {
    const matchesSearch = !searchTerm ||
      e.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.title || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || e.entry_type === filterType;
    return matchesSearch && matchesType;
  });

  const handleSave = async () => {
    if (!newContent.trim()) return;
    setSaving(true);
    await createEntry({
      title: newTitle || null,
      entry_type: newType as any,
      content: newContent,
      mood_before: newMoodBefore || null,
      mood_after: newMoodAfter || null,
      tags: newTags ? newTags.split(",").map((t) => t.trim()) : [],
    });
    setSaving(false);
    setShowNewEntry(false);
    setNewTitle(""); setNewContent(""); setNewMoodBefore(""); setNewMoodAfter(""); setNewTags("");
  };

  const moodToNumber = (mood: string) => {
    const map: Record<string, number> = { muito_mal: 1, mal: 2, neutro: 3, bem: 4, muito_bem: 5 };
    return map[mood] || 3;
  };

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
            <span className="text-primary/70 text-xs font-semibold tracking-[0.2em] uppercase">Seu espaço sagrado</span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">Diário de Tarot</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Registre suas leituras, reflexões e sonhos. Acompanhe sua jornada e descubra padrões que o universo revela.
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <Card className="bg-secondary/20 backdrop-blur border-border/20 text-center p-4">
              <BookOpen className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Entradas</p>
            </Card>
            <Card className="bg-secondary/20 backdrop-blur border-border/20 text-center p-4">
              <Calendar className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{stats.thisMonth}</p>
              <p className="text-xs text-muted-foreground">Este mês</p>
            </Card>
            <Card className="bg-secondary/20 backdrop-blur border-border/20 text-center p-4">
              <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{stats.streak}</p>
              <p className="text-xs text-muted-foreground">Dias seguidos</p>
            </Card>
            <button onClick={() => setShowStats(!showStats)} className="bg-secondary/20 backdrop-blur border border-border/20 rounded-lg text-center p-4 hover:border-primary/30 transition-colors">
              <BarChart3 className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{stats.topCards.length}</p>
              <p className="text-xs text-muted-foreground">Cartas frequentes</p>
            </button>
          </div>

          {/* Insights */}
          <AnimatePresence>
            {showStats && stats.topCards.length > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-8">
                <Card className="bg-secondary/20 backdrop-blur border-border/20 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" /> Seus Padrões
                    </h3>
                    <button onClick={() => setShowStats(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-foreground/70 mb-3">Cartas mais frequentes</p>
                      <div className="space-y-2">
                        {stats.topCards.map((card, i) => (
                          <div key={card.name} className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                            <div className="flex-1 bg-secondary/40 rounded-full h-6 overflow-hidden">
                              <div className="h-full bg-primary/30 rounded-full flex items-center px-3" style={{ width: `${Math.min(100, (card.count / stats.topCards[0].count) * 100)}%` }}>
                                <span className="text-xs text-foreground truncate">{card.name}</span>
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground">{card.count}x</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {stats.moodTrend.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-foreground/70 mb-3">Tendência emocional</p>
                        <div className="flex items-end gap-1 h-24">
                          {stats.moodTrend.slice(-14).map((m, i) => (
                            <div key={i} className="flex-1 bg-primary/20 rounded-t-sm transition-all" style={{ height: `${(moodToNumber(m.mood) / 5) * 100}%` }}
                              title={`${new Date(m.date).toLocaleDateString("pt-BR")} — ${MOODS[m.mood as keyof typeof MOODS]?.label || m.mood}`} />
                          ))}
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-[10px] text-muted-foreground">14 dias atrás</span>
                          <span className="text-[10px] text-muted-foreground">Hoje</span>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar no diário..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-secondary/40 border-border/30" />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-44 bg-secondary/40 border-border/30">
                <Filter className="w-4 h-4 mr-2" /><SelectValue placeholder="Filtrar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {Object.entries(ENTRY_TYPES).map(([key, { label, emoji }]) => (
                  <SelectItem key={key} value={key}>{emoji} {label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setShowNewEntry(true)} className="bg-primary text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" /> Nova entrada
            </Button>
          </div>

          {/* New Entry Dialog */}
          <Dialog open={showNewEntry} onOpenChange={setShowNewEntry}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="font-serif text-xl">Nova Entrada no Diário</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Tipo de entrada</Label>
                  <Select value={newType} onValueChange={setNewType}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(ENTRY_TYPES).map(([key, { label, emoji }]) => (
                        <SelectItem key={key} value={key}>{emoji} {label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Título (opcional)</Label>
                  <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Ex: Reflexão sobre A Estrela" className="mt-1" />
                </div>
                <div>
                  <Label>Como você está se sentindo agora?</Label>
                  <div className="flex gap-2 mt-2">
                    {Object.entries(MOODS).map(([key, { label, emoji }]) => (
                      <button key={key} onClick={() => setNewMoodBefore(key)}
                        className={`flex-1 p-2 rounded-lg border text-center transition-all ${newMoodBefore === key ? "border-primary bg-primary/10" : "border-border/30 hover:border-primary/30"}`}>
                        <span className="text-xl">{emoji}</span>
                        <p className="text-[10px] text-muted-foreground mt-1">{label}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Sua reflexão</Label>
                  <Textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="Escreva livremente..." className="mt-1 min-h-[150px]" />
                </div>
                <div>
                  <Label>Como você está se sentindo depois de escrever?</Label>
                  <div className="flex gap-2 mt-2">
                    {Object.entries(MOODS).map(([key, { label, emoji }]) => (
                      <button key={key} onClick={() => setNewMoodAfter(key)}
                        className={`flex-1 p-2 rounded-lg border text-center transition-all ${newMoodAfter === key ? "border-primary bg-primary/10" : "border-border/30 hover:border-primary/30"}`}>
                        <span className="text-xl">{emoji}</span>
                        <p className="text-[10px] text-muted-foreground mt-1">{label}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Tags (separadas por vírgula)</Label>
                  <Input value={newTags} onChange={(e) => setNewTags(e.target.value)} placeholder="Ex: amor, lua cheia, A Estrela" className="mt-1" />
                </div>
                <Button onClick={handleSave} disabled={!newContent.trim() || saving} className="w-full">
                  {saving ? "Salvando..." : "Salvar no Diário ✨"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Entries */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-secondary/20 backdrop-blur rounded-xl p-6 animate-pulse border border-border/20">
                  <div className="h-4 bg-muted rounded w-1/3 mb-3" />
                  <div className="h-3 bg-muted rounded w-full mb-2" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : filteredEntries.length === 0 ? (
            <EmptyState icon={BookOpen} title="Seu diário está esperando" description="Comece registrando uma reflexão, um sonho ou sua leitura de tarot de hoje." actionLabel="Criar primeira entrada" onAction={() => setShowNewEntry(true)} />
          ) : (
            <div className="space-y-4">
              {filteredEntries.map((entry, index) => {
                const typeInfo = ENTRY_TYPES[entry.entry_type as keyof typeof ENTRY_TYPES] || ENTRY_TYPES.reflection;
                const isExpanded = expandedId === entry.id;
                return (
                  <motion.div key={entry.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                    <Card className="bg-secondary/20 backdrop-blur border-border/20 overflow-hidden">
                      <button onClick={() => setExpandedId(isExpanded ? null : entry.id)} className="w-full p-5 text-left hover:bg-primary/5 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <span className="text-2xl mt-0.5">{typeInfo.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{typeInfo.label}</span>
                                {entry.mood_before && (
                                  <span className="text-xs text-muted-foreground">
                                    {MOODS[entry.mood_before as keyof typeof MOODS]?.emoji}→{entry.mood_after ? MOODS[entry.mood_after as keyof typeof MOODS]?.emoji : "?"}
                                  </span>
                                )}
                              </div>
                              <h3 className="font-medium text-foreground mt-1 truncate">{entry.title || entry.content.slice(0, 60) + (entry.content.length > 60 ? "..." : "")}</h3>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(entry.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          </div>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                        </div>
                      </button>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="px-5 pb-5 border-t border-border/20 pt-4">
                              <div className="prose prose-sm prose-invert max-w-none text-foreground/80">
                                <ReactMarkdown>{entry.content}</ReactMarkdown>
                              </div>
                              {entry.tags && entry.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-4">
                                  {entry.tags.map((tag) => (
                                    <span key={tag} className="text-xs bg-secondary/60 text-muted-foreground px-2 py-0.5 rounded-full">#{tag}</span>
                                  ))}
                                </div>
                              )}
                              {entry.cards && entry.cards.length > 0 && (
                                <div className="mt-4 p-3 bg-secondary/30 rounded-lg">
                                  <p className="text-xs text-muted-foreground mb-2">Cartas desta entrada:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {entry.cards.map((card: any, i: number) => (
                                      <span key={i} className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-md">
                                        {card.name || card} {card.upright === false ? "(invertida)" : ""}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              <div className="flex justify-end gap-2 mt-4">
                                <Button variant="ghost" size="sm" onClick={() => deleteEntry(entry.id)} className="text-destructive/70 hover:text-destructive">
                                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Excluir
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
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
