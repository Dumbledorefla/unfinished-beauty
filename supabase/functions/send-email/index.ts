import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Email Templates ──────────────────────────────────────────────

const baseStyle = `
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #0f0a1e;
  color: #e2d9f3;
`;

const cardStyle = `
  max-width: 560px;
  margin: 0 auto;
  background: linear-gradient(135deg, #1a1230 0%, #0f0a1e 100%);
  border: 1px solid rgba(168, 130, 255, 0.2);
  border-radius: 16px;
  padding: 40px 32px;
`;

const buttonStyle = `
  display: inline-block;
  background: linear-gradient(135deg, #a882ff, #7c5ce0);
  color: #ffffff;
  padding: 12px 32px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  margin-top: 16px;
`;

function wrapTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="${baseStyle}">
      <div style="padding: 32px 16px;">
        <div style="${cardStyle}">
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="font-size: 28px;">✨</span>
            <h2 style="color: #d4a843; margin: 8px 0 0;">Oráculo Místico</h2>
          </div>
          ${content}
          <hr style="border: none; border-top: 1px solid rgba(168,130,255,0.15); margin: 32px 0 16px;" />
          <p style="font-size: 12px; color: #8b7faa; text-align: center;">
            Este e-mail foi enviado pelo Oráculo Místico. Não responda a este e-mail.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

interface TemplateData {
  userName?: string;
  consultationDate?: string;
  consultationType?: string;
  taromanteName?: string;
  amount?: string;
  orderId?: string;
  hoursUntil?: number;
}

function getTemplate(
  type: string,
  data: TemplateData
): { subject: string; html: string } {
  switch (type) {
    case "welcome":
      return {
        subject: "✨ Bem-vinda ao Oráculo Místico!",
        html: wrapTemplate(`
          <h3 style="color: #e2d9f3;">Olá, ${data.userName || "Viajante"}! 🌙</h3>
          <p>Seja muito bem-vinda ao <strong>Oráculo Místico</strong>! Estamos felizes em tê-la conosco nesta jornada de autoconhecimento.</p>
          <p>Aqui você encontrará:</p>
          <ul style="color: #c4b5e0;">
            <li>🔮 Leituras de Tarot personalizadas</li>
            <li>📚 Cursos de desenvolvimento espiritual</li>
            <li>👁️ Consultas com taromantes experientes</li>
            <li>🌟 Numerologia e Horóscopo</li>
          </ul>
          <p>Comece explorando uma leitura gratuita do Tarot do Dia!</p>
          <div style="text-align: center;">
            <a href="${Deno.env.get("SITE_URL") || "https://oraculo-mistico.lovable.app"}/tarot/dia" style="${buttonStyle}">
              Fazer minha primeira leitura
            </a>
          </div>
        `),
      };

    case "consultation_confirmed":
      return {
        subject: `📅 Consulta confirmada com ${data.taromanteName}`,
        html: wrapTemplate(`
          <h3 style="color: #e2d9f3;">Consulta Agendada! 🔮</h3>
          <p>Olá, ${data.userName || ""}!</p>
          <p>Sua consulta foi confirmada com sucesso:</p>
          <div style="background: rgba(168,130,255,0.1); border-radius: 12px; padding: 20px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Taromante:</strong> ${data.taromanteName}</p>
            <p style="margin: 4px 0;"><strong>Data:</strong> ${data.consultationDate}</p>
            <p style="margin: 4px 0;"><strong>Tipo:</strong> ${data.consultationType || "Vídeo"}</p>
          </div>
          <p style="color: #c4b5e0; font-size: 14px;">Prepare-se com uma mente aberta e tenha suas perguntas em mente. ✨</p>
        `),
      };

    case "consultation_reminder":
      return {
        subject: `⏰ Lembrete: sua consulta é em ${data.hoursUntil}h`,
        html: wrapTemplate(`
          <h3 style="color: #e2d9f3;">Lembrete de Consulta ⏰</h3>
          <p>Olá, ${data.userName || ""}!</p>
          <p>Sua consulta com <strong>${data.taromanteName}</strong> acontecerá em <strong>${data.hoursUntil} hora(s)</strong>.</p>
          <div style="background: rgba(168,130,255,0.1); border-radius: 12px; padding: 20px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Data:</strong> ${data.consultationDate}</p>
            <p style="margin: 4px 0;"><strong>Tipo:</strong> ${data.consultationType || "Vídeo"}</p>
          </div>
          <p style="color: #c4b5e0; font-size: 14px;">Encontre um lugar tranquilo e prepare-se para sua jornada interior. 🌙</p>
        `),
      };

    case "payment_confirmed":
      return {
        subject: "💳 Pagamento confirmado!",
        html: wrapTemplate(`
          <h3 style="color: #e2d9f3;">Pagamento Confirmado! 💳</h3>
          <p>Olá, ${data.userName || ""}!</p>
          <p>Seu pagamento foi processado com sucesso.</p>
          <div style="background: rgba(168,130,255,0.1); border-radius: 12px; padding: 20px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Valor:</strong> R$ ${data.amount}</p>
            <p style="margin: 4px 0;"><strong>Pedido:</strong> #${data.orderId?.slice(0, 8)}</p>
          </div>
          <p style="color: #c4b5e0; font-size: 14px;">Obrigada pela sua confiança! ✨</p>
        `),
      };

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
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error(
        "RESEND_API_KEY não configurada. Adicione a chave nas configurações do projeto."
      );
    }

    // Validate auth for non-cron requests
    const authHeader = req.headers.get("Authorization");
    const isCronRequest = req.headers.get("x-cron-secret") === Deno.env.get("CRON_SECRET");

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
    const { type, to, data } = body;

    if (!type || !to) {
      return new Response(
        JSON.stringify({ error: "Campos 'type' e 'to' são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { subject, html } = getTemplate(type, data || {});

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: Deno.env.get("EMAIL_FROM") || "Oráculo Místico <noreply@resend.dev>",
        to: [to],
        subject,
        html,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      throw new Error(
        `Resend API error [${resendResponse.status}]: ${JSON.stringify(resendData)}`
      );
    }

    return new Response(JSON.stringify({ success: true, id: resendData.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error sending email:", error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
