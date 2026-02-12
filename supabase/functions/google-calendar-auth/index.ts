import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const SCOPES = "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email";

function getCredentials() {
  const clientId = Deno.env.get("GOOGLE_CALENDAR_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_CALENDAR_CLIENT_SECRET");
  const redirectUri = Deno.env.get("GOOGLE_CALENDAR_REDIRECT_URI");

  if (!clientId) throw new Error("GOOGLE_CALENDAR_CLIENT_ID não configurada.");
  if (!clientSecret) throw new Error("GOOGLE_CALENDAR_CLIENT_SECRET não configurada.");
  if (!redirectUri) throw new Error("GOOGLE_CALENDAR_REDIRECT_URI não configurada.");

  return { clientId, clientSecret, redirectUri };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // ── Action: Get OAuth URL ──────────────────────────────────
    if (action === "auth-url") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Não autorizado" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );

      const token = authHeader.replace("Bearer ", "");
      const { data: claims, error } = await supabase.auth.getClaims(token);
      if (error || !claims?.claims) {
        return new Response(JSON.stringify({ error: "Token inválido" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { clientId, redirectUri } = getCredentials();
      const state = claims.claims.sub; // user_id as state

      const authUrl = `${GOOGLE_AUTH_URL}?` +
        `client_id=${encodeURIComponent(clientId)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent(SCOPES)}` +
        `&access_type=offline` +
        `&prompt=consent` +
        `&state=${encodeURIComponent(state as string)}`;

      return new Response(JSON.stringify({ url: authUrl }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Action: Handle OAuth Callback ──────────────────────────
    if (action === "callback") {
      const code = url.searchParams.get("code");
      const userId = url.searchParams.get("state");

      if (!code || !userId) {
        return new Response("Parâmetros inválidos", { status: 400 });
      }

      const { clientId, clientSecret, redirectUri } = getCredentials();

      // Exchange code for tokens
      const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      const tokenData = await tokenRes.json();
      if (!tokenRes.ok) {
        throw new Error(`Google token error: ${JSON.stringify(tokenData)}`);
      }

      // Get user email from Google
      const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const userInfo = await userInfoRes.json();

      // Save tokens using service role
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

      const { error: upsertError } = await supabase
        .from("google_calendar_tokens")
        .upsert(
          {
            user_id: userId,
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            token_expires_at: expiresAt,
            calendar_email: userInfo.email,
          },
          { onConflict: "user_id" }
        );

      if (upsertError) {
        throw new Error(`Erro ao salvar tokens: ${upsertError.message}`);
      }

      // Redirect back to the app
      const siteUrl = Deno.env.get("SITE_URL") || Deno.env.get("SUPABASE_URL")!.replace(".supabase.co", ".lovable.app");
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${siteUrl}/perfil?calendar=connected`,
          ...corsHeaders,
        },
      });
    }

    // ── Action: Disconnect ─────────────────────────────────────
    if (action === "disconnect") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Não autorizado" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );

      const token = authHeader.replace("Bearer ", "");
      const { data: claims, error } = await supabase.auth.getClaims(token);
      if (error || !claims?.claims) {
        return new Response(JSON.stringify({ error: "Token inválido" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error: deleteError } = await supabase
        .from("google_calendar_tokens")
        .delete()
        .eq("user_id", claims.claims.sub);

      if (deleteError) {
        throw new Error(`Erro ao desconectar: ${deleteError.message}`);
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Action: Check Status ───────────────────────────────────
    if (action === "status") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Não autorizado" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );

      const token = authHeader.replace("Bearer ", "");
      const { data: claims, error } = await supabase.auth.getClaims(token);
      if (error || !claims?.claims) {
        return new Response(JSON.stringify({ error: "Token inválido" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data } = await supabase
        .from("google_calendar_tokens")
        .select("calendar_email, created_at")
        .eq("user_id", claims.claims.sub)
        .single();

      return new Response(
        JSON.stringify({
          connected: !!data,
          email: data?.calendar_email || null,
          connectedAt: data?.created_at || null,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ error: "Ação inválida" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Google Calendar Auth error:", error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
