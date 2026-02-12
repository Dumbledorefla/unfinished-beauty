-- Create a function that sends welcome email via edge function after user creation
-- This is called by a trigger on profiles table (after insert)
CREATE OR REPLACE FUNCTION public.send_welcome_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Use pg_net to call the send-email edge function asynchronously
  PERFORM net.http_post(
    url := (SELECT current_setting('app.settings.supabase_url', true) || '/functions/v1/send-email'),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT current_setting('app.settings.service_role_key', true))
    ),
    body := jsonb_build_object(
      'type', 'welcome',
      'to', NEW.email,
      'data', jsonb_build_object('userName', COALESCE(NEW.display_name, 'Viajante'))
    )
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't block user creation if email fails
    RAISE WARNING 'Failed to send welcome email: %', SQLERRM;
    RETURN NEW;
END;
$function$;

-- Create trigger on profiles table
DROP TRIGGER IF EXISTS on_profile_created_send_welcome ON public.profiles;
CREATE TRIGGER on_profile_created_send_welcome
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  WHEN (NEW.email IS NOT NULL)
  EXECUTE FUNCTION public.send_welcome_email();