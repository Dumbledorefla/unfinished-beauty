import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  session_id: string;
  sender_id: string;
  sender_role: "user" | "taromante";
  content: string;
  message_type: "text" | "image" | "system";
  created_at: string;
}

interface ChatSession {
  id: string;
  user_id: string;
  taromante_id: string;
  status: "pending" | "active" | "ended" | "cancelled";
  started_at: string | null;
  ended_at: string | null;
  duration_minutes: number;
  price: number;
  created_at: string;
}

export function useChat(sessionId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    const loadSession = async () => {
      setLoading(true);
      const { data: sess } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();
      if (sess) setSession(sess as unknown as ChatSession);

      const { data: msgs } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });
      setMessages((msgs as unknown as ChatMessage[]) || []);
      setLoading(false);
    };

    loadSession();
  }, [sessionId]);

  // Realtime subscription
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`chat:${sessionId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `session_id=eq.${sessionId}` },
        (payload) => {
          const newMsg = payload.new as unknown as ChatMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "chat_sessions", filter: `id=eq.${sessionId}` },
        (payload) => {
          setSession(payload.new as unknown as ChatSession);
          if ((payload.new as any).status === "ended") {
            toast.info("A sessão de chat foi encerrada.");
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sessionId]);

  const sendMessage = useCallback(
    async (content: string, type: "text" | "image" = "text") => {
      if (!sessionId || !user || !session || session.status !== "active") return;
      setSending(true);
      const senderRole = session.user_id === user.id ? "user" : "taromante";
      const { error } = await supabase.from("chat_messages").insert({
        session_id: sessionId,
        sender_id: user.id,
        sender_role: senderRole,
        content,
        message_type: type,
      });
      if (error) toast.error("Erro ao enviar mensagem.");
      setSending(false);
    },
    [sessionId, user, session]
  );

  const endSession = useCallback(async () => {
    if (!sessionId) return;
    await supabase.rpc("end_chat_session", { p_session_id: sessionId });
  }, [sessionId]);

  const rateSession = useCallback(
    async (rating: number, feedback?: string) => {
      if (!sessionId) return;
      await supabase
        .from("chat_sessions")
        .update({ rating, user_feedback: feedback || null })
        .eq("id", sessionId);
      toast.success("Obrigado pela avaliação!");
    },
    [sessionId]
  );

  return { messages, session, loading, sending, sendMessage, endSession, rateSession };
}

export function useOnlineTaromantes() {
  const [taromantes, setTaromantes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("taromante_availability")
        .select("*, taromantes:taromante_id(id, name, photo_url, slug, rating, specialties, short_bio)")
        .eq("is_online", true);

      const mapped = (data || [])
        .filter((d: any) => d.active_chats < d.max_concurrent_chats)
        .map((d: any) => ({
          ...d.taromantes,
          chat_price: d.chat_price_per_session,
          is_online: d.is_online,
        }));

      setTaromantes(mapped);
      setLoading(false);
    };

    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  return { taromantes, loading };
}
