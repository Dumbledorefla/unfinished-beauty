
-- Drop the overly permissive public SELECT policy on profiles
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;

-- Replace with a policy that only allows users to view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);
