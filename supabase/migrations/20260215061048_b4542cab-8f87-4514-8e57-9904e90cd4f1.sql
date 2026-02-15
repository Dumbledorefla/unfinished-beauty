
-- 1. Add image_path to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_path TEXT;

-- 2. Add payment_provider to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_provider CHARACTER VARYING DEFAULT 'manual_pix';

-- 3. Create payment_proofs table
CREATE TABLE public.payment_proofs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  review_status CHARACTER VARYING NOT NULL DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  note TEXT
);

ALTER TABLE public.payment_proofs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can upload proof for own orders"
ON public.payment_proofs FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.orders WHERE orders.id = payment_proofs.order_id AND orders.user_id = auth.uid()
));

CREATE POLICY "Users can view own proofs"
ON public.payment_proofs FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.orders WHERE orders.id = payment_proofs.order_id AND orders.user_id = auth.uid()
));

CREATE POLICY "Admins can manage payment proofs"
ON public.payment_proofs FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- 4. Create payment_transactions table
CREATE TABLE public.payment_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  provider CHARACTER VARYING NOT NULL DEFAULT 'manual_pix',
  method CHARACTER VARYING NOT NULL DEFAULT 'pix',
  status CHARACTER VARYING NOT NULL DEFAULT 'pending',
  amount NUMERIC NOT NULL,
  provider_transaction_id CHARACTER VARYING,
  raw_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
ON public.payment_transactions FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.orders WHERE orders.id = payment_transactions.order_id AND orders.user_id = auth.uid()
));

CREATE POLICY "Users can create own transactions"
ON public.payment_transactions FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.orders WHERE orders.id = payment_transactions.order_id AND orders.user_id = auth.uid()
));

CREATE POLICY "Admins can manage payment transactions"
ON public.payment_transactions FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- 5. Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-proofs', 'payment-proofs', false);

-- 6. Storage policies for product-images
CREATE POLICY "Product images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

-- 7. Storage policies for payment-proofs
CREATE POLICY "Users can upload payment proofs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'payment-proofs' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view own payment proofs"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-proofs' AND (
  auth.role() = 'authenticated' AND (
    public.has_role(auth.uid(), 'admin') OR
    auth.uid()::text = (storage.foldername(name))[1]
  )
));

CREATE POLICY "Admins can manage payment proofs"
ON storage.objects FOR ALL
USING (bucket_id = 'payment-proofs' AND public.has_role(auth.uid(), 'admin'));

-- 8. Trigger for payment_transactions updated_at
CREATE TRIGGER update_payment_transactions_updated_at
BEFORE UPDATE ON public.payment_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Function to auto-grant products on payment approval
CREATE OR REPLACE FUNCTION public.auto_grant_on_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    -- Grant all order items to user
    INSERT INTO public.user_products (user_id, product_id, order_id)
    SELECT NEW.user_id, oi.product_id, NEW.id
    FROM public.order_items oi
    WHERE oi.order_id = NEW.id
    ON CONFLICT DO NOTHING;
    
    -- Enroll in courses if product is a course-type
    INSERT INTO public.course_enrollments (user_id, course_id)
    SELECT NEW.user_id, c.id
    FROM public.order_items oi
    JOIN public.products p ON p.id = oi.product_id
    JOIN public.courses c ON c.slug = p.slug
    WHERE oi.order_id = NEW.id AND p.category = 'curso'
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_grant_on_payment
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.auto_grant_on_payment();
