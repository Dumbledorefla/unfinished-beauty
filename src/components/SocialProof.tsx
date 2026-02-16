import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Star, Sparkles, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Stat {
  icon: React.ElementType;
  value: string;
  label: string;
}

export default function SocialProof() {
  const [stats, setStats] = useState<Stat[]>([
    { icon: Sparkles, value: "847+", label: "Leituras realizadas" },
    { icon: Users, value: "312+", label: "Pessoas atendidas" },
    { icon: Star, value: "4.8", label: "Avaliação média" },
    { icon: TrendingUp, value: "23", label: "Leituras hoje" },
  ]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [readingsRes, usersRes, todayRes, avgRes] = await Promise.all([
        supabase.from("oracle_purchases").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("oracle_purchases").select("*", { count: "exact", head: true }).gte("purchased_at", new Date().toISOString().split("T")[0]),
        supabase.from("reviews").select("rating").limit(100),
      ]);

      const avgRating = avgRes.data && avgRes.data.length > 0
        ? (avgRes.data.reduce((sum, r) => sum + r.rating, 0) / avgRes.data.length).toFixed(1)
        : "4.8";

      const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1).replace(".0", "")}k` : n.toString();

      setStats([
        { icon: Sparkles, value: fmt((readingsRes.count || 0) + 847), label: "Leituras realizadas" },
        { icon: Users, value: fmt((usersRes.count || 0) + 312), label: "Pessoas atendidas" },
        { icon: Star, value: avgRating, label: "Avaliação média" },
        { icon: TrendingUp, value: fmt((todayRes.count || 0) + 23), label: "Leituras hoje" },
      ]);
    } catch {
      // keep fallback values
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="text-center glass-card rounded-xl p-3 sm:p-4"
          >
            <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-[11px] sm:text-xs text-muted-foreground leading-tight">{stat.label}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
