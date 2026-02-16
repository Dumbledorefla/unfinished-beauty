
-- Fix search_path on all new functions
ALTER FUNCTION public.validate_affiliate_status() SET search_path = public;
ALTER FUNCTION public.validate_commission_status() SET search_path = public;
ALTER FUNCTION public.validate_withdrawal_status() SET search_path = public;
ALTER FUNCTION public.generate_affiliate_code() SET search_path = public;
ALTER FUNCTION public.increment_affiliate_referrals(UUID) SET search_path = public;
ALTER FUNCTION public.process_affiliate_commission() SET search_path = public;
