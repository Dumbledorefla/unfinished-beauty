
-- Allow users to update their own consultations (reschedule, cancel, etc.)
CREATE POLICY "Users can update own consultations"
ON public.consultations
FOR UPDATE
USING (auth.uid() = user_id);
