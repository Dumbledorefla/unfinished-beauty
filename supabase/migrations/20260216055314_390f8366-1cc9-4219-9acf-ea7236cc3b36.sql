
-- Fix function search_path warnings
CREATE OR REPLACE FUNCTION public.validate_subscription_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status NOT IN ('active', 'cancelled', 'expired', 'past_due') THEN
    RAISE EXCEPTION 'Invalid subscription status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.validate_streak_level()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.level NOT IN ('iniciante', 'aprendiz', 'adepto', 'mestre', 'oraculo') THEN
    RAISE EXCEPTION 'Invalid streak level: %', NEW.level;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_user_streak(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_last_date DATE;
  v_today DATE := CURRENT_DATE;
  v_streak INTEGER;
  v_longest INTEGER;
  v_total INTEGER;
  v_xp INTEGER;
BEGIN
  SELECT last_activity_date, current_streak, longest_streak, total_readings, xp
  INTO v_last_date, v_streak, v_longest, v_total, v_xp
  FROM public.user_streaks WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    INSERT INTO public.user_streaks (user_id, current_streak, longest_streak, last_activity_date, total_readings, xp)
    VALUES (p_user_id, 1, 1, v_today, 1, 10);
    RETURN;
  END IF;

  IF v_last_date = v_today THEN
    UPDATE public.user_streaks SET total_readings = v_total + 1, xp = v_xp + 5 WHERE user_id = p_user_id;
  ELSIF v_last_date = v_today - 1 THEN
    v_streak := v_streak + 1;
    IF v_streak > v_longest THEN v_longest := v_streak; END IF;
    UPDATE public.user_streaks SET
      current_streak = v_streak, longest_streak = v_longest,
      last_activity_date = v_today, total_readings = v_total + 1,
      xp = v_xp + 10 + (v_streak * 2),
      level = CASE
        WHEN v_xp + 10 >= 1000 THEN 'oraculo'
        WHEN v_xp + 10 >= 500 THEN 'mestre'
        WHEN v_xp + 10 >= 200 THEN 'adepto'
        WHEN v_xp + 10 >= 50 THEN 'aprendiz'
        ELSE 'iniciante'
      END,
      updated_at = now()
    WHERE user_id = p_user_id;
  ELSE
    UPDATE public.user_streaks SET
      current_streak = 1, last_activity_date = v_today,
      total_readings = v_total + 1, xp = v_xp + 10, updated_at = now()
    WHERE user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
