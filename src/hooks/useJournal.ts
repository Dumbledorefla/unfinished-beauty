import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface JournalEntry {
  id: string;
  title: string | null;
  entry_type: "reading" | "reflection" | "dream" | "ritual" | "gratitude" | "intention";
  content: string;
  mood_before: string | null;
  mood_after: string | null;
  cards: any[];
  tags: string[];
  is_private: boolean;
  reading_id: string | null;
  created_at: string;
  updated_at: string;
}

export const ENTRY_TYPES = {
  reading: { label: "Leitura", emoji: "🃏" },
  reflection: { label: "Reflexão", emoji: "💭" },
  dream: { label: "Sonho", emoji: "🌙" },
  ritual: { label: "Ritual", emoji: "🕯️" },
  gratitude: { label: "Gratidão", emoji: "🙏" },
  intention: { label: "Intenção", emoji: "✨" },
};

export const MOODS = {
  muito_mal: { label: "Muito mal", emoji: "😢", color: "text-red-400" },
  mal: { label: "Mal", emoji: "😟", color: "text-orange-400" },
  neutro: { label: "Neutro", emoji: "😐", color: "text-yellow-400" },
  bem: { label: "Bem", emoji: "🙂", color: "text-emerald-400" },
  muito_bem: { label: "Muito bem", emoji: "😊", color: "text-green-400" },
};

export function useJournal() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    streak: 0,
    topCards: [] as { name: string; count: number }[],
    moodTrend: [] as { date: string; mood: string }[],
  });

  const loadEntries = useCallback(async (limit = 20) => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("tarot_journal")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);
    setEntries((data as unknown as JournalEntry[]) || []);
    setLoading(false);
  }, [user]);

  const loadStats = useCallback(async () => {
    if (!user) return;
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [allRes, monthRes] = await Promise.all([
      supabase.from("tarot_journal").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("tarot_journal").select("*", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", firstOfMonth),
    ]);

    const { data: cardEntries } = await supabase
      .from("tarot_journal")
      .select("cards")
      .eq("user_id", user.id)
      .not("cards", "eq", "[]");

    const cardCount: Record<string, number> = {};
    (cardEntries || []).forEach((e: any) => {
      (e.cards || []).forEach((c: any) => {
        const name = c.name || c;
        cardCount[name] = (cardCount[name] || 0) + 1;
      });
    });
    const topCards = Object.entries(cardCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    const { data: moodEntries } = await supabase
      .from("tarot_journal")
      .select("created_at, mood_after")
      .eq("user_id", user.id)
      .not("mood_after", "is", null)
      .order("created_at", { ascending: true })
      .limit(30);

    const moodTrend = (moodEntries || []).map((e: any) => ({
      date: e.created_at,
      mood: e.mood_after,
    }));

    const { data: streakData } = await supabase
      .from("tarot_journal")
      .select("created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(60);

    let streak = 0;
    if (streakData && streakData.length > 0) {
      const today = new Date().toISOString().split("T")[0];
      const dates = [...new Set(streakData.map((e: any) => e.created_at.split("T")[0]))];
      if (dates[0] === today || dates[0] === new Date(Date.now() - 86400000).toISOString().split("T")[0]) {
        streak = 1;
        for (let i = 1; i < dates.length; i++) {
          const prev = new Date(dates[i - 1]);
          const curr = new Date(dates[i]);
          const diff = (prev.getTime() - curr.getTime()) / 86400000;
          if (diff <= 1.5) streak++;
          else break;
        }
      }
    }

    setStats({
      total: allRes.count || 0,
      thisMonth: monthRes.count || 0,
      streak,
      topCards,
      moodTrend,
    });
  }, [user]);

  const createEntry = async (entry: Partial<JournalEntry>) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from("tarot_journal")
      .insert({ ...entry, user_id: user.id } as any)
      .select()
      .single();
    if (error) {
      toast.error("Erro ao salvar entrada");
      return null;
    }
    toast.success("Entrada salva no seu diário ✨");
    loadEntries();
    loadStats();
    return data;
  };

  const updateEntry = async (id: string, updates: Partial<JournalEntry>) => {
    const { error } = await supabase
      .from("tarot_journal")
      .update({ ...updates, updated_at: new Date().toISOString() } as any)
      .eq("id", id);
    if (error) {
      toast.error("Erro ao atualizar entrada");
      return false;
    }
    toast.success("Entrada atualizada");
    loadEntries();
    return true;
  };

  const deleteEntry = async (id: string) => {
    const { error } = await supabase.from("tarot_journal").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir entrada");
      return false;
    }
    toast.success("Entrada excluída");
    loadEntries();
    loadStats();
    return true;
  };

  useEffect(() => {
    loadEntries();
    loadStats();
  }, [loadEntries, loadStats]);

  return {
    entries,
    loading,
    stats,
    createEntry,
    updateEntry,
    deleteEntry,
    loadEntries,
    ENTRY_TYPES,
    MOODS,
  };
}
