import { supabase } from "@/integrations/supabase/client";

export async function getCalendarAuthUrl(): Promise<string> {
  const { data, error } = await supabase.functions.invoke("google-calendar-auth", {
    body: {},
    headers: {},
  });

  // We need to pass query params, so use fetch directly
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;

  if (!token) throw new Error("Você precisa estar logado para conectar o calendário.");

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-calendar-auth?action=auth-url`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Erro ao gerar URL de autorização");

  return result.url;
}

export async function getCalendarStatus(): Promise<{
  connected: boolean;
  email: string | null;
  connectedAt: string | null;
}> {
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;

  if (!token) return { connected: false, email: null, connectedAt: null };

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-calendar-auth?action=status`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) return { connected: false, email: null, connectedAt: null };
  return await res.json();
}

export async function disconnectCalendar(): Promise<void> {
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;

  if (!token) throw new Error("Você precisa estar logado.");

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-calendar-auth?action=disconnect`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Erro ao desconectar calendário");
  }
}

interface CreateCalendarEventParams {
  summary: string;
  description?: string;
  startDateTime: string; // ISO 8601
  endDateTime: string; // ISO 8601
  attendees?: { email: string }[];
  addMeet?: boolean;
  attendeeUserId?: string;
}

export async function createCalendarEvent(params: CreateCalendarEventParams) {
  const { data, error } = await supabase.functions.invoke("google-calendar-event", {
    body: {
      action: "create",
      eventData: params,
      attendeeUserId: params.attendeeUserId,
    },
  });

  if (error) throw error;
  return data;
}

export async function deleteCalendarEvent(eventId: string) {
  const { data, error } = await supabase.functions.invoke("google-calendar-event", {
    body: { action: "delete", eventId },
  });

  if (error) throw error;
  return data;
}
