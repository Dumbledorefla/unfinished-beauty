
-- Allow students to update their own course enrollment progress
CREATE POLICY "Users can update own enrollments"
ON public.course_enrollments
FOR UPDATE
USING (auth.uid() = user_id);

-- Allow taromantes to view consultations booked with them
-- The taromantes table links user_id to the taromante, so we check if the current user
-- is the taromante associated with the consultation
CREATE POLICY "Taromantes can view their consultations"
ON public.consultations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.taromantes t
    WHERE t.id = consultations.taromante_id
    AND t.user_id = auth.uid()
  )
);
