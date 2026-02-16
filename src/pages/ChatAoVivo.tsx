import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Star, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import ChatWindow from "@/components/ChatWindow";
import { useOnlineTaromantes } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import heroBg from "@/assets/hero-bg.jpg";

export default function ChatAoVivo() {
  const { user, isAuthenticated } = useAuth();
  const { taromantes, loading } = useOnlineTaromantes();
  const [activeSession, setActiveSession] = useState<{ id: string; nome: string } | null>(null);
  const [starting, setStarting] = useState<string | null>(null);

  const startChat = async (taromante: any) => {
    if (!isAuthenticated || !user) {
      toast.error("Faça login para iniciar um chat.");
      window.location.href = "/auth?next=/chat-ao-vivo";
      return;
    }

    setStarting(taromante.id);

    try {
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({ user_id: user.id, total_amount: taromante.chat_price || 49.9, status: "pending_payment", payment_method: "chat" })
        .select().single();
      if (orderErr) throw orderErr;

      const { data: session, error: sessErr } = await supabase
        .from("chat_sessions")
        .insert({ user_id: user.id, taromante_id: taromante.id, order_id: order.id, price: taromante.chat_price || 49.9, status: "pending" })
        .select().single();
      if (sessErr) throw sessErr;

      setActiveSession({ id: session.id, nome: taromante.name });
      toast.success("Chat iniciado! Aguardando o taromante aceitar.");
    } catch (err: any) {
      toast.error("Erro ao iniciar chat: " + (err.message || "Tente novamente."));
    }
    setStarting(null);
  };

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
      </div>
      <Header />
      <main id="main-content" className="relative z-10 container mx-auto px-4 pt-24 pb-16 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-10">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Chat ao Vivo</h1>
            <p className="text-foreground/60 max-w-md mx-auto">
              Converse em tempo real com nossos taromantes. Tire suas dúvidas e receba orientação imediata.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-40 rounded-2xl bg-muted animate-pulse" />)}
            </div>
          ) : taromantes.length === 0 ? (
            <Card className="bg-card/80 border-primary/20 text-center py-12">
              <CardContent>
                <WifiOff className="w-12 h-12 mx-auto text-foreground/30 mb-4" />
                <h2 className="font-serif text-xl font-bold text-foreground mb-2">Nenhum taromante online</h2>
                <p className="text-foreground/50 max-w-sm mx-auto">
                  No momento não há taromantes disponíveis para chat. Tente novamente mais tarde ou agende uma consulta.
                </p>
                <Button variant="outline" className="mt-4" onClick={() => window.location.href = "/consultas"}>
                  Ver Consultas Agendadas
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {taromantes.map((t) => (
                <Card key={t.id} className="bg-card/80 backdrop-blur-md border-primary/20 card-hover">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0 overflow-hidden">
                        {t.photo_url ? (
                          <img src={t.photo_url} alt={t.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <span className="text-2xl">🔮</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-serif font-bold text-foreground truncate">{t.name}</h3>
                          <span className="flex items-center gap-0.5">
                            <Wifi className="w-3 h-3 text-emerald-400" />
                            <span className="text-[10px] text-emerald-400">Online</span>
                          </span>
                        </div>
                        {t.short_bio && <p className="text-xs text-foreground/50 line-clamp-2 mb-2">{t.short_bio}</p>}
                        {t.rating && (
                          <div className="flex items-center gap-1 mb-2">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span className="text-xs text-foreground/60">{Number(t.rating).toFixed(1)}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-primary">
                            R$ {(t.chat_price || 49.9).toFixed(2)}
                          </span>
                          <Button size="sm" onClick={() => startChat(t)} disabled={starting === t.id}
                            className="bg-primary hover:bg-primary/90 text-xs"
                          >
                            <MessageCircle className="w-3 h-3 mr-1" />
                            {starting === t.id ? "Iniciando..." : "Iniciar Chat"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      {activeSession && (
        <ChatWindow sessionId={activeSession.id} taromanteNome={activeSession.nome} onClose={() => setActiveSession(null)} />
      )}
    </div>
  );
}
