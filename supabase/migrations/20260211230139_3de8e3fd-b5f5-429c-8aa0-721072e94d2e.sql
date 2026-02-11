
-- Drop all RESTRICTIVE policies and recreate as PERMISSIVE

-- consultations
DROP POLICY IF EXISTS "Admins can manage consultations" ON public.consultations;
DROP POLICY IF EXISTS "Users can create own consultations" ON public.consultations;
DROP POLICY IF EXISTS "Users can view own consultations" ON public.consultations;

CREATE POLICY "Admins can manage consultations" ON public.consultations FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can create own consultations" ON public.consultations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own consultations" ON public.consultations FOR SELECT USING (auth.uid() = user_id);

-- course_enrollments
DROP POLICY IF EXISTS "Admins can manage enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS "Users can create own enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS "Users can view own enrollments" ON public.course_enrollments;

CREATE POLICY "Admins can manage enrollments" ON public.course_enrollments FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can create own enrollments" ON public.course_enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own enrollments" ON public.course_enrollments FOR SELECT USING (auth.uid() = user_id);

-- courses
DROP POLICY IF EXISTS "Admins can manage courses" ON public.courses;
DROP POLICY IF EXISTS "Courses are publicly readable" ON public.courses;

CREATE POLICY "Admins can manage courses" ON public.courses FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Courses are publicly readable" ON public.courses FOR SELECT USING (true);

-- order_items
DROP POLICY IF EXISTS "Admins can manage order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can create own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;

CREATE POLICY "Admins can manage order items" ON public.order_items FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can create own order items" ON public.order_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

-- orders
DROP POLICY IF EXISTS "Admins can manage orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;

CREATE POLICY "Admins can manage orders" ON public.orders FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can create own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);

-- products
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Products are publicly readable" ON public.products;

CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Products are publicly readable" ON public.products FOR SELECT USING (true);

-- profiles
DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Admins can manage profiles" ON public.profiles FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Public profiles are viewable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- site_settings
DROP POLICY IF EXISTS "Admins can manage site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Site settings are publicly readable" ON public.site_settings;

CREATE POLICY "Admins can manage site settings" ON public.site_settings FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Site settings are publicly readable" ON public.site_settings FOR SELECT USING (true);

-- taromantes
DROP POLICY IF EXISTS "Admins can manage taromantes" ON public.taromantes;
DROP POLICY IF EXISTS "Taromantes are publicly readable" ON public.taromantes;

CREATE POLICY "Admins can manage taromantes" ON public.taromantes FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Taromantes are publicly readable" ON public.taromantes FOR SELECT USING (true);

-- tarot_readings
DROP POLICY IF EXISTS "Admins can manage readings" ON public.tarot_readings;
DROP POLICY IF EXISTS "Users can create own readings" ON public.tarot_readings;
DROP POLICY IF EXISTS "Users can view own readings" ON public.tarot_readings;

CREATE POLICY "Admins can manage readings" ON public.tarot_readings FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can create own readings" ON public.tarot_readings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own readings" ON public.tarot_readings FOR SELECT USING (auth.uid() = user_id);

-- user_products
DROP POLICY IF EXISTS "Admins can manage user products" ON public.user_products;
DROP POLICY IF EXISTS "Users can view own products" ON public.user_products;

CREATE POLICY "Admins can manage user products" ON public.user_products FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can view own products" ON public.user_products FOR SELECT USING (auth.uid() = user_id);

-- user_roles
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
