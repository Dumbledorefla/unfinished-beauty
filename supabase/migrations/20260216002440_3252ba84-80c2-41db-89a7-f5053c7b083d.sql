
CREATE OR REPLACE FUNCTION public.validate_coupon_discount_type()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.discount_type NOT IN ('percentage', 'fixed') THEN
    RAISE EXCEPTION 'discount_type must be percentage or fixed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;
