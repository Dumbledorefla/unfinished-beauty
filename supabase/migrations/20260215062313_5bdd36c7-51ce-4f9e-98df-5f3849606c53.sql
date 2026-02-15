
-- Add provider_charge_id to payment_transactions
ALTER TABLE public.payment_transactions
ADD COLUMN IF NOT EXISTS provider_charge_id VARCHAR;

-- Enable realtime for orders to support polling
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
