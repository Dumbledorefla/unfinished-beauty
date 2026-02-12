import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
  profiles?: { display_name: string | null } | null;
}

interface Props {
  taromanteId: string;
  taromanteName: string;
}

export default function ReviewSection({ taromanteId, taromanteName }: Props) {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const fetchReviews = async () => {
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("taromante_id", taromanteId)
      .order("created_at", { ascending: false });
    
    if (data && data.length > 0) {
      // Fetch profile names for reviewers
      const userIds = [...new Set(data.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.user_id, p.display_name]) || []);
      const enriched = data.map(r => ({
        ...r,
        profiles: { display_name: profileMap.get(r.user_id) || null }
      }));
      setReviews(enriched);
    } else {
      setReviews([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchReviews(); }, [taromanteId]);

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      user_id: user.id,
      taromante_id: taromanteId,
      rating,
      comment: comment.trim() || null,
    });
    if (error) {
      toast({ title: "Erro ao enviar avaliação", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Avaliação enviada!", description: `Obrigado por avaliar ${taromanteName}` });
      setComment("");
      setRating(5);
      fetchReviews();
    }
    setSubmitting(false);
  };

  const userAlreadyReviewed = reviews.some(r => r.user_id === user?.id);

  return (
    <Card className="bg-card/80 backdrop-blur-md border-primary/20">
      <CardContent className="p-6">
        <h3 className="font-serif text-xl font-bold text-foreground mb-4">
          Avaliações ({reviews.length})
        </h3>

        {/* Submit Review */}
        {isAuthenticated && !userAlreadyReviewed && (
          <div className="mb-6 p-4 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-sm text-foreground/70 mb-3">Deixe sua avaliação</p>
            <div className="flex gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(s)}
                  className="transition-transform hover:scale-110"
                >
                  <Star className={`w-6 h-6 ${s <= (hoverRating || rating) ? "text-primary fill-primary" : "text-foreground/20"}`} />
                </button>
              ))}
            </div>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Conte sua experiência (opcional)"
              className="mb-3 bg-background/50 border-primary/20"
              rows={3}
            />
            <Button onClick={handleSubmit} disabled={submitting} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Send className="w-4 h-4 mr-2" />
              {submitting ? "Enviando..." : "Enviar Avaliação"}
            </Button>
          </div>
        )}

        {/* Reviews List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => <div key={i} className="h-20 rounded-lg shimmer" />)}
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-foreground/50 text-sm text-center py-4">Nenhuma avaliação ainda. Seja o primeiro!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="p-4 rounded-lg bg-background/30 border border-primary/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {r.profiles?.display_name || "Usuário"}
                    </span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={`w-3 h-3 ${s <= r.rating ? "text-primary fill-primary" : "text-foreground/20"}`} />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-foreground/40">
                    {new Date(r.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                {r.comment && <p className="text-foreground/60 text-sm">{r.comment}</p>}
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
