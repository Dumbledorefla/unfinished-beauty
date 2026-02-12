
-- Tabela de avaliações de consultas
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  taromante_id UUID NOT NULL REFERENCES public.taromantes(id) ON DELETE CASCADE,
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL DEFAULT 5,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Validação de rating via trigger (ao invés de CHECK constraint)
CREATE OR REPLACE FUNCTION public.validate_review_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.rating < 1 OR NEW.rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_review_rating_trigger
BEFORE INSERT OR UPDATE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.validate_review_rating();

-- Atualizar rating médio do taromante ao inserir/deletar review
CREATE OR REPLACE FUNCTION public.update_taromante_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _taromante_id UUID;
BEGIN
  _taromante_id := COALESCE(NEW.taromante_id, OLD.taromante_id);
  UPDATE public.taromantes SET
    rating = COALESCE((SELECT AVG(rating)::numeric(3,1) FROM public.reviews WHERE taromante_id = _taromante_id), 5.0),
    total_reviews = (SELECT COUNT(*) FROM public.reviews WHERE taromante_id = _taromante_id)
  WHERE id = _taromante_id;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER update_taromante_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.update_taromante_rating();

-- RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are publicly readable" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create own reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage reviews" ON public.reviews FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
