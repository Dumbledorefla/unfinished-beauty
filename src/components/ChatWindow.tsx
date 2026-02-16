import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Star, Clock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  sessionId: string;
  taromanteNome: string;
  onClose: () => void;
}

export default function ChatWindow({ sessionId, taromanteNome, onClose }: Props) {
  const { user } = useAuth();
  const { messages, session, loading, sending, sendMessage, endSession, rateSession } = useChat(sessionId);
  const [input, setInput] = useState("");
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (session?.status === "ended" && !(session as any).rating) setShowRating(true);
  }, [session?.status]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleEnd = async () => {
    if (confirm("Tem certeza que deseja encerrar o chat?")) await endSession();
  };

  const handleRate = async () => {
    if (rating > 0) { await rateSession(rating, feedback); setShowRating(false); }
  };

  const isEnded = session?.status === "ended" || session?.status === "cancelled";

  return (
    <Card className="fixed bottom-4 right-4 w-[380px] h-[520px] bg-card/95 backdrop-blur-xl border-primary/20 shadow-2xl z-50 flex flex-col overflow-hidden rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-primary/15 bg-primary/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{taromanteNome}</p>
            <p className="text-[10px] text-foreground/50">
              {isEnded ? "Chat encerrado" : "Online"}
              {session?.duration_minutes ? ` • ${session.duration_minutes} min` : ""}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          {!isEnded && (
            <Button size="sm" variant="ghost" onClick={handleEnd} className="text-destructive hover:bg-destructive/10 text-xs h-7 px-2">
              Encerrar
            </Button>
          )}
          <Button size="icon" variant="ghost" onClick={onClose} className="h-7 w-7">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />)}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-foreground/40 text-sm">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p>Nenhuma mensagem ainda.</p>
            <p className="text-xs mt-1">Diga olá para começar!</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isMe = msg.sender_id === user?.id;
              const isSystem = msg.message_type === "system";

              if (isSystem) {
                return (
                  <motion.div key={msg.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-center text-xs text-foreground/40 py-1"
                  >
                    {msg.content}
                  </motion.div>
                );
              }

              return (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                    isMe
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-secondary text-secondary-foreground rounded-bl-md"
                  }`}>
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    <p className={`text-[9px] mt-1 ${isMe ? "text-primary-foreground/60" : "text-foreground/40"}`}>
                      {new Date(msg.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Rating overlay */}
      {showRating && (
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-10 p-6">
          <div className="text-center space-y-4">
            <h3 className="font-serif text-lg font-bold text-foreground">Como foi a consulta?</h3>
            <div className="flex gap-1 justify-center">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setRating(s)} className="p-1 transition-transform hover:scale-110">
                  <Star className={`w-8 h-8 ${s <= rating ? "text-amber-400 fill-amber-400" : "text-foreground/20"}`} />
                </button>
              ))}
            </div>
            <Input value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Comentário (opcional)" className="bg-card/80" />
            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={() => setShowRating(false)}>Pular</Button>
              <Button size="sm" onClick={handleRate} disabled={rating === 0}>Enviar Avaliação</Button>
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      {!isEnded && (
        <div className="p-3 border-t border-primary/15">
          <div className="flex gap-2">
            <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
              placeholder="Digite sua mensagem..." className="bg-background/50 text-sm"
              disabled={sending || session?.status !== "active"}
            />
            <Button size="icon" onClick={handleSend}
              disabled={!input.trim() || sending || session?.status !== "active"}
              className="bg-primary hover:bg-primary/90 shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          {session?.status === "pending" && (
            <p className="text-[10px] text-foreground/40 mt-1 text-center">
              <Clock className="w-3 h-3 inline mr-1" />
              Aguardando o taromante aceitar o chat...
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
