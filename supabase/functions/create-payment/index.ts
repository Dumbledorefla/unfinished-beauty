import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, rateLimitResponse, getClientIP } from '../_shared/rate-limit.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PAGARME_API_URL = "https://api.pagar.me/core/v5";

function errorResponse(code: string, message: string, status = 400) {
  return new Response(
    JSON.stringify({ success: false, error: code, message }),
    { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting: 3 requests per minute per IP
    const clientIP = getClientIP(req);
    const allowed = await checkRateLimit({ key: `create-payment:${clientIP}`, limit: 3, windowSeconds: 60 });
    if (!allowed) return rateLimitResponse();

    // --- Auth ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return errorResponse("UNAUTHORIZED", "Token não fornecido", 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const pagarmeApiKey = Deno.env.get("PAGARME_API_KEY");

    if (!pagarmeApiKey) {
      return errorResponse("PROVIDER_ERROR", "Gateway de pagamento não configurado", 500);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return errorResponse("UNAUTHORIZED", "Token inválido", 401);
    }
    const userId = claimsData.claims.sub as string;

    // --- Parse body ---
    const { order_id, method } = await req.json();

    if (!order_id) return errorResponse("INVALID_REQUEST", "order_id é obrigatório");
    if (!method || !["pix", "card"].includes(method)) {
      return errorResponse("INVALID_METHOD", "Método deve ser 'pix' ou 'card'");
    }

    // --- Fetch order ---
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();

    if (orderErr || !order) return errorResponse("ORDER_NOT_FOUND", "Pedido não encontrado", 404);
    if (order.user_id !== userId) return errorResponse("UNAUTHORIZED", "Pedido não pertence ao usuário", 403);
    if (order.status !== "pending_payment") {
      return errorResponse("INVALID_STATUS", `Status atual: ${order.status}. Esperado: pending_payment`);
    }

    // --- Fetch order items for description ---
    const { data: items } = await supabase
      .from("order_items")
      .select("product_name, quantity, price")
      .eq("order_id", order_id);

    const description = items?.map((i: any) => `${i.quantity}x ${i.product_name}`).join(", ") || "Pedido Chave do Oráculo";

    // --- Amount in cents ---
    const amountInCents = Math.round(order.total_amount * 100);

    // --- Build Pagar.me payload ---
    let pagarmePayload: any = {
      items: [
        {
          amount: amountInCents,
          description: description.substring(0, 256),
          quantity: 1,
          code: order_id,
        },
      ],
      metadata: { order_id },
      payments: [],
    };

    if (method === "pix") {
      pagarmePayload.payments.push({
        payment_method: "pix",
        pix: {
          expires_in: 3600, // 1 hour
        },
        amount: amountInCents,
      });
    } else if (method === "card") {
      // Card requires tokenization on frontend – placeholder
      return errorResponse("INVALID_METHOD", "Pagamento via cartão ainda não implementado");
    }

    // --- Call Pagar.me ---
    const pagarmeAuth = btoa(`${pagarmeApiKey}:`);
    const pagarmeRes = await fetch(`${PAGARME_API_URL}/orders`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${pagarmeAuth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pagarmePayload),
    });

    const pagarmeData = await pagarmeRes.json();

    if (!pagarmeRes.ok) {
      console.error("Pagar.me error:", JSON.stringify(pagarmeData));
      return errorResponse("PROVIDER_ERROR", pagarmeData?.message || "Erro no gateway de pagamento");
    }

    // --- Extract PIX data ---
    const charge = pagarmeData.charges?.[0];
    const transaction = charge?.last_transaction;

    // --- Save payment_transaction ---
    const serviceClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await serviceClient.from("payment_transactions").insert({
      order_id,
      provider: "pagarme",
      method,
      status: "pending",
      amount: order.total_amount,
      provider_transaction_id: transaction?.id || null,
      provider_charge_id: charge?.id || null,
      raw_response: pagarmeData,
    });

    // --- Update order provider info ---
    await serviceClient
      .from("orders")
      .update({
        payment_provider: "pagarme",
        payment_method: method,
      })
      .eq("id", order_id);

    // --- Build response ---
    if (method === "pix") {
      const pixData = transaction?.qr_code_url
        ? {
            qr_code_url: transaction.qr_code_url,
            pix_copy_paste: transaction.qr_code,
            expires_at: transaction.expires_at,
          }
        : null;

      return new Response(
        JSON.stringify({
          success: true,
          payment: {
            provider: "pagarme",
            method: "pix",
            transaction_id: transaction?.id,
            charge_id: charge?.id,
            ...pixData,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, payment: { provider: "pagarme", method, status: "processing" } }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("create-payment error:", err);
    return errorResponse("INTERNAL_ERROR", "Erro interno do servidor", 500);
  }
});
