import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Reply, Trash2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Comment {
  id: string;
  content: string;
  author_name: string;
  author_avatar_url: string | null;
  user_id: string;
  parent_id: string | null;
  created_at: string;
  replies?: Comment[];
}

interface BlogCommentsProps {
  postId: string;
  userId?: string;
  userName?: string;
  userAvatar?: string;
}

export default function BlogComments({ postId, userId, userName, userAvatar }: BlogCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    const { data } = await supabase
      .from("blog_comments")
      .select("*")
      .eq("post_id", postId)
      .eq("status", "published")
      .order("created_at", { ascending: true });

    if (data) {
      const roots: Comment[] = [];
      const map = new Map<string, Comment>();
      (data as any[]).forEach((c) => {
        map.set(c.id, { ...c, replies: [] });
      });
      (data as any[]).forEach((c) => {
        const comment = map.get(c.id)!;
        if (c.parent_id && map.has(c.parent_id)) {
          map.get(c.parent_id)!.replies!.push(comment);
        } else {
          roots.push(comment);
        }
      });
      setComments(roots);
    }
  };

  const handleSubmit = async (parentId?: string) => {
    if (!userId) {
      toast.error("Faça login para comentar");
      return;
    }
    const text = parentId ? replyText : newComment;
    if (!text.trim()) return;

    setLoading(true);
    const { error } = await supabase.from("blog_comments").insert({
      post_id: postId,
      user_id: userId,
      parent_id: parentId || null,
      content: text.trim(),
      author_name: userName || "Anônimo",
      author_avatar_url: userAvatar || null,
    } as any);

    if (error) {
      toast.error("Erro ao enviar comentário");
    } else {
      toast.success("Comentário enviado!");
      if (parentId) {
        setReplyText("");
        setReplyTo(null);
      } else {
        setNewComment("");
      }
      loadComments();
    }
    setLoading(false);
  };

  const handleDelete = async (commentId: string) => {
    const { error } = await supabase.from("blog_comments").delete().eq("id", commentId);
    if (!error) {
      toast.success("Comentário removido");
      loadComments();
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const CommentItem = ({ comment, depth = 0 }: { comment: Comment; depth?: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${depth > 0 ? "ml-8 pl-4 border-l-2 border-primary/10" : ""}`}
    >
      <div className="flex gap-3 py-4">
        <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0 text-sm font-bold text-primary">
          {comment.author_avatar_url ? (
            <img src={comment.author_avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            comment.author_name.charAt(0).toUpperCase()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-foreground">{comment.author_name}</span>
            <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
          </div>
          <p className="text-sm text-foreground/90 mt-1 whitespace-pre-wrap break-words">{comment.content}</p>
          <div className="flex items-center gap-3 mt-2">
            {userId && (
              <button
                onClick={() => { setReplyTo(comment.id); setReplyText(""); }}
                className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
              >
                <Reply className="w-3 h-3" /> Responder
              </button>
            )}
            {userId === comment.user_id && (
              <button
                onClick={() => handleDelete(comment.id)}
                className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" /> Excluir
              </button>
            )}
          </div>
          <AnimatePresence>
            {replyTo === comment.id && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-3">
                <div className="flex gap-2">
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Responder ${comment.author_name}...`}
                    className="bg-input/50 border-border/50 text-sm min-h-[60px] resize-none"
                    rows={2}
                  />
                  <div className="flex flex-col gap-1">
                    <Button size="sm" onClick={() => handleSubmit(comment.id)} disabled={loading || !replyText.trim()}>
                      <Send className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setReplyTo(null)} className="text-xs">
                      ✕
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
          ))}
        </div>
      )}
    </motion.div>
  );

  return (
    <div>
      <h3 className="font-serif text-xl font-bold text-foreground mb-6 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-primary" />
        Comentários {comments.length > 0 && <span className="text-sm font-normal text-muted-foreground">({comments.length})</span>}
      </h3>

      {userId ? (
        <div className="mb-8 bg-secondary/40 backdrop-blur-md rounded-xl p-4 border border-border/30">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Compartilhe sua experiência ou dúvida..."
            className="bg-input/50 border-border/50 min-h-[80px] resize-none mb-3"
            rows={3}
          />
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">Seja respeitoso(a) e construtivo(a).</p>
            <Button onClick={() => handleSubmit()} disabled={loading || !newComment.trim()} size="sm">
              <Send className="w-3.5 h-3.5 mr-1.5" />
              {loading ? "Enviando..." : "Comentar"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mb-8 text-center py-6 bg-secondary/30 rounded-xl border border-border/20">
          <p className="text-sm text-muted-foreground">
            <a href="/auth" className="text-primary hover:underline">Faça login</a> para deixar um comentário.
          </p>
        </div>
      )}

      {comments.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground">Seja o primeiro a comentar!</p>
        </div>
      ) : (
        <div className="divide-y divide-border/20">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}
