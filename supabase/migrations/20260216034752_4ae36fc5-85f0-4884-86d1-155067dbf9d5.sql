
-- =============================================
-- 1. NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT DEFAULT NULL,
  read_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, read_at) WHERE read_at IS NULL;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admin can manage notifications" ON public.notifications
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Helper function to create notifications
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_link TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, link)
  VALUES (p_user_id, p_type, p_title, p_message, p_link)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger: notify when order is paid
CREATE OR REPLACE FUNCTION public.notify_order_paid() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
    PERFORM public.create_notification(
      NEW.user_id,
      'payment',
      'Pagamento Aprovado!',
      'Seu pedido foi aprovado e o acesso já está liberado.',
      '/perfil'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_notify_order_paid ON public.orders;
CREATE TRIGGER trigger_notify_order_paid
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_order_paid();

-- Trigger: notify when consultation is confirmed
CREATE OR REPLACE FUNCTION public.notify_consultation_confirmed() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    PERFORM public.create_notification(
      NEW.user_id,
      'consultation',
      'Consulta Confirmada!',
      'Sua consulta foi confirmada. Verifique os detalhes.',
      '/consultas'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_notify_consultation_confirmed ON public.consultations;
CREATE TRIGGER trigger_notify_consultation_confirmed
  AFTER UPDATE ON public.consultations
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_consultation_confirmed();

-- =============================================
-- 2. RATE LIMITS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL DEFAULT date_trunc('minute', now()),
  count INTEGER NOT NULL DEFAULT 1,
  UNIQUE(key, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON public.rate_limits(key, window_start);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
-- No user-facing policies; only service_role accesses this table

-- Rate limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_key TEXT,
  p_limit INTEGER DEFAULT 10,
  p_window_seconds INTEGER DEFAULT 60
) RETURNS BOOLEAN AS $$
DECLARE
  v_window_start TIMESTAMPTZ;
  v_count INTEGER;
BEGIN
  v_window_start := date_trunc('minute', now());
  
  -- Clean old entries
  DELETE FROM public.rate_limits WHERE window_start < now() - interval '1 hour';
  
  SELECT count INTO v_count
  FROM public.rate_limits
  WHERE key = p_key AND window_start = v_window_start;
  
  IF v_count IS NULL THEN
    INSERT INTO public.rate_limits (key, window_start, count)
    VALUES (p_key, v_window_start, 1)
    ON CONFLICT (key, window_start) DO UPDATE SET count = rate_limits.count + 1;
    RETURN TRUE;
  ELSIF v_count >= p_limit THEN
    RETURN FALSE;
  ELSE
    UPDATE public.rate_limits SET count = count + 1
    WHERE key = p_key AND window_start = v_window_start;
    RETURN TRUE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =============================================
-- 3. ADMIN AUDIT LOG TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL,
  admin_name TEXT DEFAULT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT DEFAULT NULL,
  details JSONB DEFAULT NULL,
  ip_address TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_admin ON public.admin_audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON public.admin_audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_date ON public.admin_audit_log(created_at DESC);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can read audit log" ON public.admin_audit_log
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can insert audit log" ON public.admin_audit_log
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
