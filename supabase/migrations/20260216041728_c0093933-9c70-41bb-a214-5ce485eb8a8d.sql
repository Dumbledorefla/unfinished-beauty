
-- ==========================================
-- PROGRAMA DE AFILIADOS
-- ==========================================

-- Tabela principal de afiliados
CREATE TABLE IF NOT EXISTS public.affiliates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 10.00,
  status TEXT NOT NULL DEFAULT 'active',
  total_earned NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_withdrawn NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_referrals INTEGER NOT NULL DEFAULT 0,
  total_conversions INTEGER NOT NULL DEFAULT 0,
  pix_key TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Validation trigger for affiliates status
CREATE OR REPLACE FUNCTION public.validate_affiliate_status() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status NOT IN ('active', 'inactive', 'suspended') THEN
    RAISE EXCEPTION 'Invalid affiliate status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_affiliate_status
  BEFORE INSERT OR UPDATE ON public.affiliates
  FOR EACH ROW EXECUTE FUNCTION public.validate_affiliate_status();

-- Tabela de referências (quem indicou quem)
CREATE TABLE IF NOT EXISTS public.affiliate_referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL UNIQUE,
  referred_at TIMESTAMPTZ DEFAULT now(),
  converted BOOLEAN DEFAULT FALSE
);

-- Tabela de comissões
CREATE TABLE IF NOT EXISTS public.affiliate_commissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL,
  order_amount NUMERIC(10,2) NOT NULL,
  commission_rate NUMERIC(5,2) NOT NULL,
  commission_amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  paid_at TIMESTAMPTZ DEFAULT NULL
);

-- Validation trigger for commission status
CREATE OR REPLACE FUNCTION public.validate_commission_status() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status NOT IN ('pending', 'approved', 'paid', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid commission status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_commission_status
  BEFORE INSERT OR UPDATE ON public.affiliate_commissions
  FOR EACH ROW EXECUTE FUNCTION public.validate_commission_status();

-- Tabela de saques
CREATE TABLE IF NOT EXISTS public.affiliate_withdrawals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  pix_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_note TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ DEFAULT NULL
);

-- Validation trigger for withdrawal status
CREATE OR REPLACE FUNCTION public.validate_withdrawal_status() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status NOT IN ('pending', 'approved', 'paid', 'rejected') THEN
    RAISE EXCEPTION 'Invalid withdrawal status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_withdrawal_status
  BEFORE INSERT OR UPDATE ON public.affiliate_withdrawals
  FOR EACH ROW EXECUTE FUNCTION public.validate_withdrawal_status();

-- Índices
CREATE INDEX IF NOT EXISTS idx_affiliates_user ON public.affiliates(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_code ON public.affiliates(code);
CREATE INDEX IF NOT EXISTS idx_referrals_affiliate ON public.affiliate_referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_referrals_user ON public.affiliate_referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_commissions_affiliate ON public.affiliate_commissions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_affiliate ON public.affiliate_withdrawals(affiliate_id);

-- RLS
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_withdrawals ENABLE ROW LEVEL SECURITY;

-- Políticas: Afiliados
CREATE POLICY "Users can read own affiliate" ON public.affiliates
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own affiliate" ON public.affiliates
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own affiliate" ON public.affiliates
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin full access affiliates" ON public.affiliates
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Políticas: Referências
CREATE POLICY "Affiliates can read own referrals" ON public.affiliate_referrals
  FOR SELECT USING (
    affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid())
  );
CREATE POLICY "Authenticated users can insert referrals" ON public.affiliate_referrals
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admin full access referrals" ON public.affiliate_referrals
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Políticas: Comissões
CREATE POLICY "Affiliates can read own commissions" ON public.affiliate_commissions
  FOR SELECT USING (
    affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid())
  );
CREATE POLICY "Admin full access commissions" ON public.affiliate_commissions
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Políticas: Saques
CREATE POLICY "Affiliates can read own withdrawals" ON public.affiliate_withdrawals
  FOR SELECT USING (
    affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid())
  );
CREATE POLICY "Affiliates can insert own withdrawals" ON public.affiliate_withdrawals
  FOR INSERT WITH CHECK (
    affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid())
  );
CREATE POLICY "Admin full access withdrawals" ON public.affiliate_withdrawals
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Função: Gerar código de afiliado único
CREATE OR REPLACE FUNCTION public.generate_affiliate_code() RETURNS TEXT AS $$
DECLARE
  v_code TEXT;
  v_exists BOOLEAN;
BEGIN
  LOOP
    v_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
    SELECT EXISTS(SELECT 1 FROM public.affiliates WHERE code = v_code) INTO v_exists;
    EXIT WHEN NOT v_exists;
  END LOOP;
  RETURN v_code;
END;
$$ LANGUAGE plpgsql;

-- Função: Incrementar referrals
CREATE OR REPLACE FUNCTION public.increment_affiliate_referrals(aff_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.affiliates SET total_referrals = total_referrals + 1 WHERE id = aff_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função: Registrar comissão quando pedido é pago
CREATE OR REPLACE FUNCTION public.process_affiliate_commission() RETURNS TRIGGER AS $$
DECLARE
  v_referral RECORD;
  v_commission NUMERIC(10,2);
BEGIN
  IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
    SELECT ar.*, a.commission_rate, a.id as aff_id
    INTO v_referral
    FROM public.affiliate_referrals ar
    JOIN public.affiliates a ON a.id = ar.affiliate_id
    WHERE ar.referred_user_id = NEW.user_id
    AND a.status = 'active'
    LIMIT 1;

    IF FOUND THEN
      v_commission := ROUND(NEW.total_amount * v_referral.commission_rate / 100, 2);

      INSERT INTO public.affiliate_commissions (
        affiliate_id, order_id, referred_user_id,
        order_amount, commission_rate, commission_amount
      ) VALUES (
        v_referral.aff_id, NEW.id, NEW.user_id,
        NEW.total_amount, v_referral.commission_rate, v_commission
      );

      UPDATE public.affiliates SET
        total_earned = total_earned + v_commission,
        total_conversions = total_conversions + 1,
        updated_at = now()
      WHERE id = v_referral.aff_id;

      UPDATE public.affiliate_referrals SET converted = TRUE
      WHERE id = v_referral.id AND NOT converted;

      PERFORM public.create_notification(
        (SELECT user_id FROM public.affiliates WHERE id = v_referral.aff_id),
        'payment',
        'Nova Comissão!',
        'Você ganhou R$ ' || v_commission::text || ' de comissão por uma venda.',
        '/afiliado'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_affiliate_commission ON public.orders;
CREATE TRIGGER trigger_affiliate_commission
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.process_affiliate_commission();
