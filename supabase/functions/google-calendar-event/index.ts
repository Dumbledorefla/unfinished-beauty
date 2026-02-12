import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";

// Refresh access token if expired
async function getValidAccessToken(
  tokenRow: { access_token: string; refresh_token: string; token_expires_at: string; user_id: string },
  supabase: any
): Promise<string> {
  const expiresAt = new Date(tokenRow.token_expires_at);
  const now = new Date();

  // If token is still valid (with 5 min buffer), return it
  if (expiresAt.getTime() - now.getTime() > 5 * 60 * 1000) {
    return tokenRow.access_token;
  }

  // Refresh the token
  const clientId = Deno.env.get("GOOGLE_CALENDAR_CLIENT_ID")!;
  const clientSecret = Deno.env.get("GOOGLE_CALENDAR_CLIENT_SECRET")!;

  const refreshRes = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: tokenRow.refresh_token,
      grant_type: "refresh_token",
    }),
  });

  const refreshData = await refreshRes.json();
  if (!refreshRes.ok) {
    throw new Error(`Token refresh failed: ${JSON.stringify(refreshData)}`);
  }

  const newExpiresAt = new Date(Date.now() + refreshData.expires_in * 1000).toISOString();

  await supabase
    .from("google_calendar_tokens")
    .update({
      access_token: refreshData.access_token,
      token_expires_at: newExpiresAt,
    })
    .eq("user_id", tokenRow.user_id);

  return refreshData.access_token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const isCronRequest =
      req.headers.get("x-cron-secret") === Deno.env.get("CRON_SECRET");

    let userId: string;

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (isCronRequest) {
      // For cron, user_id comes from request body
      const body = await req.json();
      userId = body.userId;
      if (!userId) {
        return new Response(JSON.stringify({ error: "userId é obrigatório para cron" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Re-parse not needed since we already consumed body, handle below
      return await handleEvent(req, userId, supabaseAdmin, await Promise.resolve(body));
    } else {
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Não autorizado" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const supabaseUser = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );

      const token = authHeader.replace("Bearer ", "");
      const { data: claims, error } = await supabaseUser.auth.getClaims(token);
      if (error || !claims?.claims) {
        return new Response(JSON.stringify({ error: "Token inválido" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      userId = claims.claims.sub as string;
      const body = await req.json();
      return await handleEvent(req, userId, supabaseAdmin, body);
    }
  } catch (error: unknown) {
    console.error("Google Calendar Event error:", error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handleEvent(_req: Request, userId: string, supabase: any, body: any) {
  const { action, eventData, eventId, attendeeUserId } = body;

  // Get tokens for the user
  const { data: tokenRow, error: tokenError } = await supabase
    .from("google_calendar_tokens")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (tokenError || !tokenRow) {
    return new Response(
      JSON.stringify({
        error: "Google Calendar não conectado. Conecte seu calendário primeiro.",
        notConnected: true,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const accessToken = await getValidAccessToken(tokenRow, supabase);

  // ── Create Event ───────────────────────────────────────────
  if (action === "create") {
    if (!eventData) {
      return new Response(JSON.stringify({ error: "eventData é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const calendarEvent = {
      summary: eventData.summary || "Consulta - Oráculo Místico",
      description: eventData.description || "",
      start: {
        dateTime: eventData.startDateTime,
        timeZone: "America/Sao_Paulo",
      },
      end: {
        dateTime: eventData.endDateTime,
        timeZone: "America/Sao_Paulo",
      },
      attendees: eventData.attendees || [],
      reminders: {
        useDefault: false,
        overrides: [
          { method: "popup", minutes: 60 },
          { method: "popup", minutes: 15 },
        ],
      },
      conferenceData: eventData.addMeet
        ? {
            createRequest: {
              requestId: crypto.randomUUID(),
              conferenceSolutionKey: { type: "hangoutsMeet" },
            },
          }
        : undefined,
    };

    const createRes = await fetch(
      `${GOOGLE_CALENDAR_API}/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(calendarEvent),
      }
    );

    const created = await createRes.json();
    if (!createRes.ok) {
      throw new Error(`Google Calendar API error [${createRes.status}]: ${JSON.stringify(created)}`);
    }

    // If there's an attendee user, also create in their calendar
    if (attendeeUserId) {
      const { data: attendeeToken } = await supabase
        .from("google_calendar_tokens")
        .select("*")
        .eq("user_id", attendeeUserId)
        .single();

      if (attendeeToken) {
        const attendeeAccessToken = await getValidAccessToken(attendeeToken, supabase);
        await fetch(
          `${GOOGLE_CALENDAR_API}/calendars/primary/events?conferenceDataVersion=1`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${attendeeAccessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(calendarEvent),
          }
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        eventId: created.id,
        htmlLink: created.htmlLink,
        meetLink: created.conferenceData?.entryPoints?.[0]?.uri || null,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // ── Delete Event ───────────────────────────────────────────
  if (action === "delete") {
    if (!eventId) {
      return new Response(JSON.stringify({ error: "eventId é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const deleteRes = await fetch(
      `${GOOGLE_CALENDAR_API}/calendars/primary/events/${eventId}?sendUpdates=all`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!deleteRes.ok && deleteRes.status !== 404) {
      const errData = await deleteRes.text();
      throw new Error(`Delete event error [${deleteRes.status}]: ${errData}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ error: "Ação inválida. Use 'create' ou 'delete'." }), {
    status: 400,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
