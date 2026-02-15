
-- Create oracle_products table to define freemium pricing per oracle type
CREATE TABLE public.oracle_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  oracle_type VARCHAR NOT NULL UNIQUE,
  name VARCHAR NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  is_free BOOLEAN NOT NULL DEFAULT false,
  preview_lines INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.oracle_products ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Oracle products are publicly readable"
  ON public.oracle_products FOR SELECT USING (true);

-- Admin manage
CREATE POLICY "Admins can manage oracle products"
  ON public.oracle_products FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create oracle_purchases to track individual reading purchases
CREATE TABLE public.oracle_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  oracle_type VARCHAR NOT NULL,
  reading_id UUID,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  price NUMERIC NOT NULL DEFAULT 0,
  order_id UUID REFERENCES public.orders(id)
);

-- Enable RLS
ALTER TABLE public.oracle_purchases ENABLE ROW LEVEL SECURITY;

-- Users can view own purchases
CREATE POLICY "Users can view own oracle purchases"
  ON public.oracle_purchases FOR SELECT USING (auth.uid() = user_id);

-- Users can create own purchases  
CREATE POLICY "Users can create own oracle purchases"
  ON public.oracle_purchases FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin manage
CREATE POLICY "Admins can manage oracle purchases"
  ON public.oracle_purchases FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed oracle products
INSERT INTO public.oracle_products (oracle_type, name, description, price, is_free, preview_lines) VALUES
  ('tarot-dia', 'Tarot do Dia', 'Uma carta diária com interpretação completa', 0, true, 999),
  ('tarot-amor', 'Tarot do Amor', 'Leitura de 3 cartas sobre sua vida amorosa', 9.90, false, 4),
  ('tarot-completo', 'Tarot Completo', 'Leitura profunda com 6 cartas — Cruz Celta', 14.90, false, 4),
  ('numerologia', 'Mapa Numerológico', 'Cálculo completo dos seus números pessoais', 9.90, false, 4),
  ('horoscopo', 'Horóscopo do Dia', 'Previsões diárias personalizadas por signo', 4.90, false, 3),
  ('mapa-astral', 'Mapa Astral', 'Análise completa das posições planetárias', 19.90, false, 4);
