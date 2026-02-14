-- Allow taromantes to update their own consultations (status, notes)
CREATE POLICY "Taromantes can update their consultations"
ON public.consultations
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.taromantes t
    WHERE t.id = consultations.taromante_id AND t.user_id = auth.uid()
  )
);