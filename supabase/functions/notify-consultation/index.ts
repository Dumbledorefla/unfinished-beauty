import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface NotificationResult {
  channel: string;
  success: boolean;
  error?: string;
  data?: any;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth
    const authHeader = req.headers.get("Authorization");
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
    const { data: claims, error: authError } = await supabaseUser.auth.getClaims(token);
    if (authError || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Token inválido" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claims.claims.sub as string;

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { consultationId } = body;

    if (!consultationId) {
      return new Response(JSON.stringify({ error: "consultationId é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch consultation details
    const { data: consultation, error: consultError } = await supabaseAdmin
      .from("consultations")
      .select("*")
      .eq("id", consultationId)
      .single();

    if (consultError || !consultation) {
      return new Response(JSON.stringify({ error: "Consulta não encontrada" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch user profile
    const { data: userProfile } = await supabaseAdmin
      .from("profiles")
      .select("email, display_name, whatsapp")
      .eq("user_id", consultation.user_id)
      .single();

    // Fetch taromante
    const { data: taromante } = await supabaseAdmin
      .from("taromantes")
      .select("name, user_id")
      .eq("id", consultation.taromante_id)
      .single();

    // Fetch taromante profile (for email/whatsapp)
    let taroProfile: any = null;
    if (taromante?.user_id) {
      const { data } = await supabaseAdmin
        .from("profiles")
        .select("email, display_name, whatsapp")
        .eq("user_id", taromante.user_id)
        .single();
      taroProfile = data;
    }

    const scheduledDate = new Date(consultation.scheduled_at).toLocaleString("pt-BR", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "America/Sao_Paulo",
    });

    const endDate = new Date(
      new Date(consultation.scheduled_at).getTime() + consultation.duration * 60 * 1000
    ).toISOString();

    const templateData = {
      userName: userProfile?.display_name || "Cliente",
      taromanteName: taromante?.name || "Taromante",
      consultationDate: scheduledDate,
      consultationType:
        consultation.consultation_type === "video"
          ? "Vídeo Chamada"
          : consultation.consultation_type === "chat"
          ? "Chat ao Vivo"
          : "Telefone",
    };

    const results: NotificationResult[] = [];
    const functionsUrl = Deno.env.get("SUPABASE_URL") + "/functions/v1";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // ── 1. EMAIL ─────────────────────────────────────────────
    // Send to client
    if (userProfile?.email && Deno.env.get("RESEND_API_KEY")) {
      try {
        const res = await fetch(`${functionsUrl}/send-email`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${serviceKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "consultation_confirmed",
            to: userProfile.email,
            data: templateData,
          }),
        });
        const data = await res.json();
        results.push({ channel: "email_client", success: res.ok, data });
      } catch (e: any) {
        results.push({ channel: "email_client", success: false, error: e.message });
      }

      // Send to taromante
      if (taroProfile?.email) {
        try {
          const res = await fetch(`${functionsUrl}/send-email`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${serviceKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: "consultation_confirmed",
              to: taroProfile.email,
              data: {
                ...templateData,
                userName: taroProfile.display_name || "Taromante",
              },
            }),
          });
          const data = await res.json();
          results.push({ channel: "email_taromante", success: res.ok, data });
        } catch (e: any) {
          results.push({ channel: "email_taromante", success: false, error: e.message });
        }
      }
    } else {
      results.push({ channel: "email", success: false, error: "RESEND_API_KEY não configurada ou e-mail não disponível" });
    }

    // ── 2. WHATSAPP ──────────────────────────────────────────
    const hasZapi = Deno.env.get("ZAPI_INSTANCE_ID") && Deno.env.get("ZAPI_TOKEN") && Deno.env.get("ZAPI_CLIENT_TOKEN");

    if (hasZapi) {
      // Send to client
      if (userProfile?.whatsapp) {
        try {
          const res = await fetch(`${functionsUrl}/send-whatsapp`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${serviceKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: "consultation_confirmed",
              phone: userProfile.whatsapp,
              data: templateData,
            }),
          });
          const data = await res.json();
          results.push({ channel: "whatsapp_client", success: res.ok, data });
        } catch (e: any) {
          results.push({ channel: "whatsapp_client", success: false, error: e.message });
        }
      }

      // Send to taromante
      if (taroProfile?.whatsapp) {
        try {
          const res = await fetch(`${functionsUrl}/send-whatsapp`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${serviceKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: "consultation_confirmed",
              phone: taroProfile.whatsapp,
              data: {
                ...templateData,
                userName: taroProfile.display_name || "Taromante",
              },
            }),
          });
          const data = await res.json();
          results.push({ channel: "whatsapp_taromante", success: res.ok, data });
        } catch (e: any) {
          results.push({ channel: "whatsapp_taromante", success: false, error: e.message });
        }
      }
    } else {
      results.push({ channel: "whatsapp", success: false, error: "Z-API não configurada" });
    }

    // ── 3. GOOGLE CALENDAR ───────────────────────────────────
    const hasGcal = Deno.env.get("GOOGLE_CALENDAR_CLIENT_ID") && Deno.env.get("GOOGLE_CALENDAR_CLIENT_SECRET");

    if (hasGcal) {
      // Create event for client
      try {
        const attendees: { email: string }[] = [];
        if (userProfile?.email) attendees.push({ email: userProfile.email });
        if (taroProfile?.email) attendees.push({ email: taroProfile.email });

        const res = await fetch(`${functionsUrl}/google-calendar-event`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${serviceKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "create",
            userId: consultation.user_id,
            eventData: {
              summary: `Consulta de Tarot - ${taromante?.name}`,
              description: `Consulta ${templateData.consultationType} com ${taromante?.name}.\n\n${consultation.topic ? "Assunto: " + consultation.topic : ""}`,
              startDateTime: consultation.scheduled_at,
              endDateTime: endDate,
              attendees,
              addMeet: consultation.consultation_type === "video",
            },
            attendeeUserId: taromante?.user_id || undefined,
          }),
        });
        const data = await res.json();

        if (data.notConnected) {
          results.push({ channel: "google_calendar", success: false, error: "Calendário não conectado" });
        } else {
          results.push({ channel: "google_calendar", success: res.ok, data });
        }
      } catch (e: any) {
        results.push({ channel: "google_calendar", success: false, error: e.message });
      }
    } else {
      results.push({ channel: "google_calendar", success: false, error: "Google Calendar não configurado" });
    }

    // ── Summary ──────────────────────────────────────────────
    const successCount = results.filter((r) => r.success).length;

    return new Response(
      JSON.stringify({
        success: true,
        summary: `${successCount}/${results.length} notificações enviadas`,
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Notify consultation error:", error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
