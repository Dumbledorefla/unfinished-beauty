
-- Tabela de cupons
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL DEFAULT 'percentage',
  discount_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  min_order_amount NUMERIC(10,2) DEFAULT 0,
  max_uses INTEGER DEFAULT NULL,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ DEFAULT NULL,
  is_active BOOLEAN DEFAULT true,
  description TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Validation trigger for discount_type instead of CHECK constraint
CREATE OR REPLACE FUNCTION public.validate_coupon_discount_type()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.discount_type NOT IN ('percentage', 'fixed') THEN
    RAISE EXCEPTION 'discount_type must be percentage or fixed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_coupon_discount_type_trigger
  BEFORE INSERT OR UPDATE ON public.coupons
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_coupon_discount_type();

-- Adicionar colunas de cupom na tabela orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_code TEXT DEFAULT NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2) DEFAULT 0;

-- RLS policies
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode ler cupons ativos (para validar no checkout)
CREATE POLICY "Anyone can read active coupons" ON public.coupons
  FOR SELECT USING (is_active = true);

-- Apenas admin pode gerenciar cupons
CREATE POLICY "Admin can manage coupons" ON public.coupons
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Índice para busca por código
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
