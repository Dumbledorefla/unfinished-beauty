
-- C1: Planos de Assinatura
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10,2),
  features JSONB DEFAULT '[]',
  max_readings_per_day INTEGER DEFAULT -1,
  includes_consultations BOOLEAN DEFAULT false,
  includes_courses BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Planos são públicos" ON public.subscription_plans FOR SELECT USING (true);
CREATE POLICY "Admins gerenciam planos" ON public.subscription_plans FOR ALL USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_id UUID REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active',
  payment_method TEXT DEFAULT 'pix',
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '1 month'),
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários veem suas assinaturas" ON public.user_subscriptions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Usuários atualizam suas assinaturas" ON public.user_subscriptions FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admins gerenciam assinaturas" ON public.user_subscriptions FOR ALL USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE OR REPLACE FUNCTION public.validate_subscription_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status NOT IN ('active', 'cancelled', 'expired', 'past_due') THEN
    RAISE EXCEPTION 'Invalid subscription status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_subscription_status_trigger
BEFORE INSERT OR UPDATE ON public.user_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.validate_subscription_status();

INSERT INTO public.subscription_plans (name, slug, description, price_monthly, price_yearly, features, max_readings_per_day, includes_consultations, includes_courses, sort_order) VALUES
('Grátis', 'free', 'Acesso básico ao Tarot do Dia e Horóscopo', 0, 0, '["Tarot do Dia ilimitado", "Horóscopo diário", "Numerologia básica"]', 1, false, false, 0),
('Essencial', 'essencial', 'Leituras ilimitadas e acesso a todos os oráculos', 19.90, 189.90, '["Todas as leituras ilimitadas", "Tarot Completo sem limite", "Mapa Astral detalhado", "Compatibilidade ilimitada", "Calendário Lunar personalizado", "Sem anúncios"]', -1, false, false, 1),
('Premium', 'premium', 'Tudo do Essencial + consultas e cursos', 39.90, 389.90, '["Tudo do plano Essencial", "1 consulta ao vivo por mês", "Acesso a todos os cursos", "Leituras em profundidade", "Suporte prioritário", "Conteúdo exclusivo"]', -1, true, true, 2);

-- C2: Newsletter
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  source TEXT DEFAULT 'website',
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMPTZ DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ
);

CREATE INDEX idx_newsletter_email ON public.newsletter_subscribers(email);
CREATE INDEX idx_newsletter_active ON public.newsletter_subscribers(is_active) WHERE is_active = true;

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins gerenciam newsletter" ON public.newsletter_subscribers FOR ALL USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
);
CREATE POLICY "Qualquer um pode se inscrever" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);

-- C3: Gamificação — Streaks
CREATE TABLE IF NOT EXISTS public.user_streaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  total_readings INTEGER DEFAULT 0,
  level TEXT DEFAULT 'iniciante',
  xp INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.validate_streak_level()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.level NOT IN ('iniciante', 'aprendiz', 'adepto', 'mestre', 'oraculo') THEN
    RAISE EXCEPTION 'Invalid streak level: %', NEW.level;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_streak_level_trigger
BEFORE INSERT OR UPDATE ON public.user_streaks
FOR EACH ROW EXECUTE FUNCTION public.validate_streak_level();

ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários veem seus streaks" ON public.user_streaks FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Usuários atualizam seus streaks" ON public.user_streaks FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Usuários criam seus streaks" ON public.user_streaks FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.update_user_streak(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_last_date DATE;
  v_today DATE := CURRENT_DATE;
  v_streak INTEGER;
  v_longest INTEGER;
  v_total INTEGER;
  v_xp INTEGER;
BEGIN
  SELECT last_activity_date, current_streak, longest_streak, total_readings, xp
  INTO v_last_date, v_streak, v_longest, v_total, v_xp
  FROM public.user_streaks WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    INSERT INTO public.user_streaks (user_id, current_streak, longest_streak, last_activity_date, total_readings, xp)
    VALUES (p_user_id, 1, 1, v_today, 1, 10);
    RETURN;
  END IF;

  IF v_last_date = v_today THEN
    UPDATE public.user_streaks SET total_readings = v_total + 1, xp = v_xp + 5 WHERE user_id = p_user_id;
  ELSIF v_last_date = v_today - 1 THEN
    v_streak := v_streak + 1;
    IF v_streak > v_longest THEN v_longest := v_streak; END IF;
    UPDATE public.user_streaks SET
      current_streak = v_streak, longest_streak = v_longest,
      last_activity_date = v_today, total_readings = v_total + 1,
      xp = v_xp + 10 + (v_streak * 2),
      level = CASE
        WHEN v_xp + 10 >= 1000 THEN 'oraculo'
        WHEN v_xp + 10 >= 500 THEN 'mestre'
        WHEN v_xp + 10 >= 200 THEN 'adepto'
        WHEN v_xp + 10 >= 50 THEN 'aprendiz'
        ELSE 'iniciante'
      END,
      updated_at = now()
    WHERE user_id = p_user_id;
  ELSE
    UPDATE public.user_streaks SET
      current_streak = 1, last_activity_date = v_today,
      total_readings = v_total + 1, xp = v_xp + 10, updated_at = now()
    WHERE user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
