import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Message Templates ────────────────────────────────────────────

interface TemplateData {
  userName?: string;
  consultationDate?: string;
  consultationType?: string;
  taromanteName?: string;
  amount?: string;
  orderId?: string;
  hoursUntil?: number;
}

function getMessage(type: string, data: TemplateData): string {
  switch (type) {
    case "welcome":
      return `✨ *Bem-vinda ao Chave do Oráculo!* ✨

Olá, ${data.userName || "Viajante"}! 🌙

Estamos felizes em tê-la conosco nesta jornada de autoconhecimento.

Aqui você encontrará:
🔮 Leituras de Tarot personalizadas
📚 Cursos de desenvolvimento espiritual
👁️ Consultas com taromantes experientes
🌟 Numerologia e Horóscopo

Comece agora com uma leitura gratuita do Tarot do Dia!`;

    case "consultation_confirmed":
      return `📅 *Consulta Confirmada!* 🔮

Olá, ${data.userName || ""}!

Sua consulta foi agendada com sucesso:

👤 *Taromante:* ${data.taromanteName}
📅 *Data:* ${data.consultationDate}
📹 *Tipo:* ${data.consultationType || "Vídeo"}

Prepare-se com uma mente aberta e tenha suas perguntas em mente. ✨`;

    case "consultation_reminder":
      return `⏰ *Lembrete de Consulta*

Olá, ${data.userName || ""}!

Sua consulta com *${data.taromanteName}* acontecerá em *${data.hoursUntil} hora(s)*.

📅 *Data:* ${data.consultationDate}
📹 *Tipo:* ${data.consultationType || "Vídeo"}

Encontre um lugar tranquilo e prepare-se para sua jornada interior. 🌙`;

    case "payment_confirmed":
      return `💳 *Pagamento Confirmado!*

Olá, ${data.userName || ""}!

Seu pagamento foi processado com sucesso.

💰 *Valor:* R$ ${data.amount}
🆔 *Pedido:* #${data.orderId?.slice(0, 8)}

Obrigada pela sua confiança! ✨`;

    default:
      throw new Error(`Template desconhecido: ${type}`);
  }
}

// ── Main Handler ─────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ZAPI_INSTANCE_ID = Deno.env.get("ZAPI_INSTANCE_ID");
    const ZAPI_TOKEN = Deno.env.get("ZAPI_TOKEN");
    const ZAPI_CLIENT_TOKEN = Deno.env.get("ZAPI_CLIENT_TOKEN");

    if (!ZAPI_INSTANCE_ID) {
      throw new Error("ZAPI_INSTANCE_ID não configurada.");
    }
    if (!ZAPI_TOKEN) {
      throw new Error("ZAPI_TOKEN não configurada.");
    }
    if (!ZAPI_CLIENT_TOKEN) {
      throw new Error("ZAPI_CLIENT_TOKEN não configurada.");
    }

    // Validate auth
    const authHeader = req.headers.get("Authorization");
    const isCronRequest =
      req.headers.get("x-cron-secret") === Deno.env.get("CRON_SECRET");

    if (!isCronRequest) {
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
      const { error } = await supabase.auth.getClaims(token);
      if (error) {
        return new Response(JSON.stringify({ error: "Token inválido" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const body = await req.json();
    const { type, phone, data } = body;

    if (!type || !phone) {
      return new Response(
        JSON.stringify({ error: "Campos 'type' e 'phone' são obrigatórios" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Normalize phone: remove non-digits, ensure country code
    const cleanPhone = phone.replace(/\D/g, "");
    const normalizedPhone = cleanPhone.startsWith("55")
      ? cleanPhone
      : `55${cleanPhone}`;

    const message = getMessage(type, data || {});

    const zapiUrl = `https://api.z-api.io/instances/${ZAPI_INSTANCE_ID}/token/${ZAPI_TOKEN}/send-text`;

    const zapiResponse = await fetch(zapiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Client-Token": ZAPI_CLIENT_TOKEN,
      },
      body: JSON.stringify({
        phone: normalizedPhone,
        message,
      }),
    });

    const zapiData = await zapiResponse.json();

    if (!zapiResponse.ok) {
      throw new Error(
        `Z-API error [${zapiResponse.status}]: ${JSON.stringify(zapiData)}`
      );
    }

    return new Response(
      JSON.stringify({ success: true, messageId: zapiData.messageId }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error sending WhatsApp:", error);
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
