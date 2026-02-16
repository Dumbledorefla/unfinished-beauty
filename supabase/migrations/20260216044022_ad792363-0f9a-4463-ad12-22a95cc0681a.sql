
-- ==========================================
-- CHAT AO VIVO COM TAROMANTES
-- ==========================================

-- Sessões de chat
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  taromante_id UUID NOT NULL REFERENCES public.taromantes(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id),
  status TEXT NOT NULL DEFAULT 'pending',
  started_at TIMESTAMPTZ DEFAULT NULL,
  ended_at TIMESTAMPTZ DEFAULT NULL,
  duration_minutes INTEGER DEFAULT 0,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  rating INTEGER DEFAULT NULL,
  user_feedback TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Validation trigger for chat_sessions status
CREATE OR REPLACE FUNCTION public.validate_chat_session_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status NOT IN ('pending', 'active', 'ended', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid chat session status: %', NEW.status;
  END IF;
  IF NEW.rating IS NOT NULL AND (NEW.rating < 1 OR NEW.rating > 5) THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER validate_chat_session_status_trigger
  BEFORE INSERT OR UPDATE ON public.chat_sessions
  FOR EACH ROW EXECUTE FUNCTION public.validate_chat_session_status();

-- Mensagens do chat
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_role TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Validation trigger for chat_messages
CREATE OR REPLACE FUNCTION public.validate_chat_message()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sender_role NOT IN ('user', 'taromante') THEN
    RAISE EXCEPTION 'Invalid sender_role: %', NEW.sender_role;
  END IF;
  IF NEW.message_type NOT IN ('text', 'image', 'system') THEN
    RAISE EXCEPTION 'Invalid message_type: %', NEW.message_type;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER validate_chat_message_trigger
  BEFORE INSERT OR UPDATE ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.validate_chat_message();

-- Disponibilidade dos taromantes para chat
CREATE TABLE IF NOT EXISTS public.taromante_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  taromante_id UUID NOT NULL REFERENCES public.taromantes(id) ON DELETE CASCADE UNIQUE,
  is_online BOOLEAN NOT NULL DEFAULT FALSE,
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  chat_price_per_session NUMERIC(10,2) NOT NULL DEFAULT 49.90,
  max_concurrent_chats INTEGER NOT NULL DEFAULT 3,
  active_chats INTEGER NOT NULL DEFAULT 0
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_taromante ON public.chat_sessions(taromante_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON public.chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON public.chat_messages(session_id);

-- RLS
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taromante_availability ENABLE ROW LEVEL SECURITY;

-- Políticas: Chat Sessions
CREATE POLICY "Users can read own chat sessions" ON public.chat_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Taromantes can read their chat sessions" ON public.chat_sessions
  FOR SELECT USING (
    taromante_id IN (SELECT id FROM public.taromantes WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can create chat sessions" ON public.chat_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Participants can update chat sessions" ON public.chat_sessions
  FOR UPDATE USING (
    auth.uid() = user_id OR
    taromante_id IN (SELECT id FROM public.taromantes WHERE user_id = auth.uid())
  );
CREATE POLICY "Admin full access chat sessions" ON public.chat_sessions
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Políticas: Chat Messages
CREATE POLICY "Session participants can read chat messages" ON public.chat_messages
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM public.chat_sessions
      WHERE user_id = auth.uid()
      OR taromante_id IN (SELECT id FROM public.taromantes WHERE user_id = auth.uid())
    )
  );
CREATE POLICY "Session participants can send chat messages" ON public.chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    session_id IN (
      SELECT id FROM public.chat_sessions
      WHERE status = 'active' AND (
        user_id = auth.uid()
        OR taromante_id IN (SELECT id FROM public.taromantes WHERE user_id = auth.uid())
      )
    )
  );
CREATE POLICY "Admin full access chat messages" ON public.chat_messages
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Políticas: Disponibilidade
CREATE POLICY "Anyone can read taromante availability" ON public.taromante_availability
  FOR SELECT USING (true);
CREATE POLICY "Taromantes can update own availability" ON public.taromante_availability
  FOR UPDATE USING (
    taromante_id IN (SELECT id FROM public.taromantes WHERE user_id = auth.uid())
  );
CREATE POLICY "Taromantes can insert own availability" ON public.taromante_availability
  FOR INSERT WITH CHECK (
    taromante_id IN (SELECT id FROM public.taromantes WHERE user_id = auth.uid())
  );
CREATE POLICY "Admin full access taromante availability" ON public.taromante_availability
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_sessions;

-- Função: Encerrar chat e calcular duração
CREATE OR REPLACE FUNCTION public.end_chat_session(p_session_id UUID) RETURNS VOID AS $$
DECLARE
  v_session RECORD;
  v_duration INTEGER;
BEGIN
  SELECT * INTO v_session FROM public.chat_sessions WHERE id = p_session_id AND status = 'active';
  IF NOT FOUND THEN RETURN; END IF;

  v_duration := EXTRACT(EPOCH FROM (now() - v_session.started_at)) / 60;

  UPDATE public.chat_sessions SET
    status = 'ended',
    ended_at = now(),
    duration_minutes = GREATEST(v_duration, 1)
  WHERE id = p_session_id;

  UPDATE public.taromante_availability SET
    active_chats = GREATEST(active_chats - 1, 0)
  WHERE taromante_id = v_session.taromante_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
