import { useState } from "react";
import { BookOpen, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useJournal, MOODS } from "@/hooks/useJournal";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";

interface SaveToJournalProps {
  readingType: string;
  cards: Array<{ name: string; upright?: boolean }>;
  interpretation: string;
}

export default function SaveToJournal({ readingType, cards, interpretation }: SaveToJournalProps) {
  const { isAuthenticated } = useAuth();
  const { createEntry } = useJournal();
  const [open, setOpen] = useState(false);
  const [reflection, setReflection] = useState("");
  const [mood, setMood] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!isAuthenticated) return null;

  const handleSave = async () => {
    setSaving(true);
    const cardNames = cards.map((c) => c.name).join(", ");
    await createEntry({
      title: `${readingType} — ${cardNames}`,
      entry_type: "reading",
      content: `${reflection ? `**Minha reflexão:** ${reflection}\n\n---\n\n` : ""}**Interpretação:**\n${interpretation}`,
      mood_after: mood || null,
      cards,
      tags: [readingType.toLowerCase().replace(/\s/g, "-")],
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setOpen(false), 1500);
  };

  if (saved) {
    return (
      <Button variant="outline" disabled className="gap-2">
        <Check className="w-4 h-4 text-emerald-400" />
        Salvo no diário
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <BookOpen className="w-4 h-4" />
          Salvar no diário
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">Salvar no Diário</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Como você está se sentindo?</p>
            <div className="flex gap-2">
              {Object.entries(MOODS).map(([key, { label, emoji }]) => (
                <button
                  key={key}
                  onClick={() => setMood(key)}
                  className={`flex-1 p-2 rounded-lg border text-center transition-all ${
                    mood === key ? "border-primary bg-primary/10" : "border-border/30 hover:border-primary/20"
                  }`}
                >
                  <span className="text-lg">{emoji}</span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Adicionar reflexão (opcional)</p>
            <Textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="O que essa leitura significou para você?"
              className="min-h-[80px]"
            />
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "Salvando..." : "Salvar ✨"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
