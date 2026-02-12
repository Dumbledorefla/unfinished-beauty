import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY não configurada");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find consultations happening in the next 2 hours that haven't been reminded
    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const { data: consultations, error: fetchError } = await supabase
      .from("consultations")
      .select(`
        id,
        scheduled_at,
        consultation_type,
        user_id,
        taromante_id,
        status
      `)
      .eq("status", "confirmed")
      .gte("scheduled_at", now.toISOString())
      .lte("scheduled_at", twoHoursFromNow.toISOString());

    if (fetchError) {
      throw new Error(`Erro ao buscar consultas: ${fetchError.message}`);
    }

    if (!consultations || consultations.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "Nenhum lembrete a enviar", sent: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let sentCount = 0;

    for (const consultation of consultations) {
      // Get user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("email, display_name")
        .eq("user_id", consultation.user_id)
        .single();

      // Get taromante name
      const { data: taromante } = await supabase
        .from("taromantes")
        .select("name")
        .eq("id", consultation.taromante_id)
        .single();

      if (!profile?.email) continue;

      const hoursUntil = Math.round(
        (new Date(consultation.scheduled_at).getTime() - now.getTime()) / (1000 * 60 * 60)
      );

      const scheduledDate = new Date(consultation.scheduled_at).toLocaleString("pt-BR", {
        dateStyle: "long",
        timeStyle: "short",
        timeZone: "America/Sao_Paulo",
      });

      // Call send-email function
      const emailRes = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "consultation_reminder",
            to: profile.email,
            data: {
              userName: profile.display_name,
              taromanteName: taromante?.name || "Taromante",
              consultationDate: scheduledDate,
              consultationType: consultation.consultation_type,
              hoursUntil,
            },
          }),
        }
      );

      if (emailRes.ok) {
        sentCount++;
      } else {
        console.error(`Falha ao enviar lembrete para ${profile.email}:`, await emailRes.text());
      }
    }

    return new Response(
      JSON.stringify({ success: true, sent: sentCount, total: consultations.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in reminders:", error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
