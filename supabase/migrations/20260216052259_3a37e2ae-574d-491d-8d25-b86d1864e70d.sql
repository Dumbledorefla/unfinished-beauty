
-- Tabela de artigos do blog
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  category TEXT NOT NULL DEFAULT 'geral',
  tags TEXT[] DEFAULT '{}',
  author_name TEXT NOT NULL DEFAULT 'Chave do Oráculo',
  author_avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  featured BOOLEAN DEFAULT false,
  reading_time_min INTEGER DEFAULT 5,
  meta_title TEXT,
  meta_description TEXT,
  view_count INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_blog_posts_category ON public.blog_posts(category);
CREATE INDEX idx_blog_posts_published_at ON public.blog_posts(published_at DESC);
CREATE INDEX idx_blog_posts_featured ON public.blog_posts(featured) WHERE featured = true;

-- RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artigos publicados são públicos" ON public.blog_posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Admins gerenciam artigos" ON public.blog_posts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Categorias do blog
CREATE TABLE IF NOT EXISTS public.blog_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0
);

ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categorias são públicas" ON public.blog_categories
  FOR SELECT USING (true);

CREATE POLICY "Admins gerenciam categorias" ON public.blog_categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

INSERT INTO public.blog_categories (name, slug, description, icon, sort_order) VALUES
  ('Tarot', 'tarot', 'Significados das cartas, tiragens e interpretações', '🃏', 1),
  ('Astrologia', 'astrologia', 'Signos, trânsitos, mapas astrais e previsões', '⭐', 2),
  ('Numerologia', 'numerologia', 'Números pessoais, ciclos e vibrações', '🔢', 3),
  ('Amor', 'amor', 'Relacionamentos, compatibilidade e autoamor', '💕', 4),
  ('Carreira', 'carreira', 'Propósito profissional e decisões de carreira', '💼', 5),
  ('Autoconhecimento', 'autoconhecimento', 'Meditação, intuição e crescimento pessoal', '🧘', 6),
  ('Lua e Ciclos', 'lua-e-ciclos', 'Fases da lua, eclipses e rituais', '🌙', 7),
  ('Guias', 'guias', 'Tutoriais e guias práticos para iniciantes', '📖', 8);

-- Trigger para updated_at
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Status validation trigger
CREATE OR REPLACE FUNCTION public.validate_blog_post_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status NOT IN ('draft', 'published', 'archived') THEN
    RAISE EXCEPTION 'Invalid blog post status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER validate_blog_post_status_trigger
  BEFORE INSERT OR UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_blog_post_status();
