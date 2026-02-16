
-- =============================================
-- Diário de Tarot
-- =============================================
CREATE TABLE public.tarot_journal (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT,
  entry_type TEXT NOT NULL DEFAULT 'reflection',
  content TEXT NOT NULL,
  mood_before TEXT,
  mood_after TEXT,
  cards JSONB DEFAULT '[]',
  tags TEXT[] DEFAULT '{}',
  is_private BOOLEAN DEFAULT true,
  reading_id UUID REFERENCES public.tarot_readings(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_journal_user ON public.tarot_journal(user_id);
CREATE INDEX idx_journal_type ON public.tarot_journal(entry_type);
CREATE INDEX idx_journal_date ON public.tarot_journal(created_at);

ALTER TABLE public.tarot_journal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own journal" ON public.tarot_journal
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin full access journal" ON public.tarot_journal
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Validation trigger for entry_type
CREATE OR REPLACE FUNCTION public.validate_journal_entry_type()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = 'public' AS $$
BEGIN
  IF NEW.entry_type NOT IN ('reading', 'reflection', 'dream', 'ritual', 'gratitude', 'intention') THEN
    RAISE EXCEPTION 'Invalid journal entry type: %', NEW.entry_type;
  END IF;
  IF NEW.mood_before IS NOT NULL AND NEW.mood_before NOT IN ('muito_mal', 'mal', 'neutro', 'bem', 'muito_bem') THEN
    RAISE EXCEPTION 'Invalid mood_before: %', NEW.mood_before;
  END IF;
  IF NEW.mood_after IS NOT NULL AND NEW.mood_after NOT IN ('muito_mal', 'mal', 'neutro', 'bem', 'muito_bem') THEN
    RAISE EXCEPTION 'Invalid mood_after: %', NEW.mood_after;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_journal_entry
  BEFORE INSERT OR UPDATE ON public.tarot_journal
  FOR EACH ROW EXECUTE FUNCTION public.validate_journal_entry_type();

-- Updated_at trigger
CREATE TRIGGER update_journal_updated_at
  BEFORE UPDATE ON public.tarot_journal
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- Spreads Customizados
-- =============================================
CREATE TABLE public.custom_spreads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  positions JSONB NOT NULL DEFAULT '[]',
  card_count INT NOT NULL DEFAULT 3,
  category TEXT DEFAULT 'geral',
  is_public BOOLEAN DEFAULT false,
  use_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_spreads_user ON public.custom_spreads(user_id);
CREATE INDEX idx_spreads_public ON public.custom_spreads(is_public) WHERE is_public = true;

ALTER TABLE public.custom_spreads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own spreads" ON public.custom_spreads
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can read public spreads" ON public.custom_spreads
  FOR SELECT USING (is_public = true);

CREATE POLICY "Admin full access spreads" ON public.custom_spreads
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Validation trigger for category
CREATE OR REPLACE FUNCTION public.validate_spread_category()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = 'public' AS $$
BEGIN
  IF NEW.category NOT IN ('geral', 'amor', 'carreira', 'saude', 'espiritual', 'decisao', 'outro') THEN
    RAISE EXCEPTION 'Invalid spread category: %', NEW.category;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_spread_cat
  BEFORE INSERT OR UPDATE ON public.custom_spreads
  FOR EACH ROW EXECUTE FUNCTION public.validate_spread_category();
