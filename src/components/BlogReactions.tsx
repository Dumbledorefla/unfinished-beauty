import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

const REACTIONS = [
  { type: "like", emoji: "🔮", label: "Revelador" },
  { type: "love", emoji: "💜", label: "Amei" },
  { type: "insightful", emoji: "✨", label: "Iluminador" },
  { type: "inspiring", emoji: "🙏", label: "Inspirador" },
];

interface BlogReactionsProps {
  postId: string;
  userId?: string;
}

export default function BlogReactions({ postId, userId }: BlogReactionsProps) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [sessionId] = useState(() => {
    let id = localStorage.getItem("blog_session_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("blog_session_id", id);
    }
    return id;
  });

  useEffect(() => {
    loadReactions();
  }, [postId]);

  const loadReactions = async () => {
    const { data: allReactions } = await supabase
      .from("blog_reactions")
      .select("reaction_type")
      .eq("post_id", postId);

    if (allReactions) {
      const grouped: Record<string, number> = {};
      allReactions.forEach((r: any) => {
        grouped[r.reaction_type] = (grouped[r.reaction_type] || 0) + 1;
      });
      setCounts(grouped);
    }

    if (userId) {
      const { data } = await supabase
        .from("blog_reactions")
        .select("reaction_type")
        .eq("post_id", postId)
        .eq("user_id", userId)
        .maybeSingle();
      if (data) setUserReaction((data as any).reaction_type);
    } else {
      const { data } = await supabase
        .from("blog_reactions")
        .select("reaction_type")
        .eq("post_id", postId)
        .eq("session_id", sessionId)
        .maybeSingle();
      if (data) setUserReaction((data as any).reaction_type);
    }
  };

  const handleReaction = async (type: string) => {
    if (userReaction === type) {
      if (userId) {
        await supabase.from("blog_reactions").delete().eq("post_id", postId).eq("user_id", userId);
      } else {
        await supabase.from("blog_reactions").delete().eq("post_id", postId).eq("session_id", sessionId);
      }
      setUserReaction(null);
      setCounts((prev) => ({ ...prev, [type]: Math.max(0, (prev[type] || 0) - 1) }));
      return;
    }

    if (userReaction) {
      if (userId) {
        await supabase.from("blog_reactions").update({ reaction_type: type } as any).eq("post_id", postId).eq("user_id", userId);
      } else {
        await supabase.from("blog_reactions").update({ reaction_type: type } as any).eq("post_id", postId).eq("session_id", sessionId);
      }
      setCounts((prev) => ({
        ...prev,
        [userReaction]: Math.max(0, (prev[userReaction] || 0) - 1),
        [type]: (prev[type] || 0) + 1,
      }));
    } else {
      await supabase.from("blog_reactions").insert({
        post_id: postId,
        user_id: userId || null,
        session_id: userId ? null : sessionId,
        reaction_type: type,
      } as any);
      setCounts((prev) => ({ ...prev, [type]: (prev[type] || 0) + 1 }));
    }
    setUserReaction(type);
  };

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm text-muted-foreground">
        {total > 0 ? `${total} ${total === 1 ? "pessoa achou" : "pessoas acharam"} este artigo útil` : "O que achou deste artigo?"}
      </p>
      <div className="flex gap-2">
        {REACTIONS.map((r) => (
          <motion.button
            key={r.type}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleReaction(r.type)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm transition-all
              ${userReaction === r.type
                ? "bg-primary/15 border-primary/40 text-primary shadow-sm"
                : "bg-secondary/40 border-border/30 text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }`}
          >
            <span className="text-base">{r.emoji}</span>
            <span className="hidden sm:inline">{r.label}</span>
            {(counts[r.type] || 0) > 0 && (
              <span className="text-xs font-medium ml-0.5">{counts[r.type]}</span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
