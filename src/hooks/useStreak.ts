import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface StreakData {
  current_streak: number;
  longest_streak: number;
  total_readings: number;
  level: string;
  xp: number;
  last_activity_date: string | null;
}

const LEVEL_NAMES: Record<string, string> = {
  iniciante: "Iniciante",
  aprendiz: "Aprendiz",
  adepto: "Adepto",
  mestre: "Mestre",
  oraculo: "Oráculo",
};

const LEVEL_THRESHOLDS = [
  { level: "iniciante", min: 0, max: 49 },
  { level: "aprendiz", min: 50, max: 199 },
  { level: "adepto", min: 200, max: 499 },
  { level: "mestre", min: 500, max: 999 },
  { level: "oraculo", min: 1000, max: Infinity },
];

export function useStreak() {
  const { user } = useAuth();
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadStreak();
    else setLoading(false);
  }, [user]);

  const loadStreak = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_streaks")
      .select("*")
      .eq("user_id", user.id)
      .single();
    if (data) setStreak(data as any);
    setLoading(false);
  };

  const recordActivity = useCallback(async () => {
    if (!user) return;
    await supabase.rpc("update_user_streak", { p_user_id: user.id });
    loadStreak();
  }, [user]);

  const levelName = streak ? LEVEL_NAMES[streak.level] || "Iniciante" : "Iniciante";
  const currentThreshold = LEVEL_THRESHOLDS.find((t) => t.level === (streak?.level || "iniciante"));
  const nextThreshold = currentThreshold ? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.indexOf(currentThreshold) + 1] : undefined;
  const xpProgress = nextThreshold && currentThreshold
    ? ((streak?.xp || 0) - currentThreshold.min) / (nextThreshold.min - currentThreshold.min) * 100
    : 100;

  return {
    streak, loading, levelName, xpProgress,
    nextLevel: nextThreshold ? LEVEL_NAMES[nextThreshold.level] : null,
    recordActivity, refresh: loadStreak,
  };
}
