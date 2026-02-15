import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-hub-signature, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const ok = () =>
    new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);

    // --- Validate webhook signature ---
    const webhookSecret = Deno.env.get("PAGARME_WEBHOOK_SECRET");
    if (webhookSecret) {
      const signature = req.headers.get("x-hub-signature");
      if (signature) {
        const expectedSig = createHmac("sha1", webhookSecret)
          .update(rawBody)
          .digest("hex");
        const fullExpected = `sha1=${expectedSig}`;
        if (signature !== fullExpected) {
          console.error("Webhook signature mismatch");
          return new Response(JSON.stringify({ error: "Invalid signature" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    const eventType = body.type;
    const chargeData = body.data;

    if (!chargeData || !chargeData.metadata?.order_id) {
      console.warn("Webhook without order_id metadata, ignoring");
      return ok();
    }

    const orderId = chargeData.metadata.order_id;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // --- Fetch current order ---
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      console.error("Order not found for webhook:", orderId);
      return ok(); // Don't return 500 for webhooks
    }

    // --- Amount validation ---
    if (chargeData.amount) {
      const webhookAmountDecimal = chargeData.amount / 100;
      if (Math.abs(webhookAmountDecimal - order.total_amount) > 0.01) {
        console.error(
          `Amount mismatch! Webhook: ${webhookAmountDecimal}, Order: ${order.total_amount}`
        );
        // Log but don't auto-approve — flag for manual review
        await supabase.from("payment_transactions").update({
          status: "amount_mismatch",
          raw_response: body,
        }).eq("order_id", orderId).eq("provider", "pagarme");
        return ok();
      }
    }

    // --- Process events ---
    if (eventType === "charge.paid") {
      // Idempotency: skip if already paid
      if (order.status === "paid") {
        console.log("Order already paid, skipping:", orderId);
        return ok();
      }

      // Update payment_transactions
      await supabase
        .from("payment_transactions")
        .update({
          status: "paid",
          raw_response: body,
        })
        .eq("order_id", orderId)
        .eq("provider", "pagarme");

      // Update order status → triggers auto_grant_on_payment
      await supabase
        .from("orders")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      console.log("Order paid via webhook:", orderId);

      // --- Send notification (best effort) ---
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, display_name, whatsapp")
          .eq("user_id", order.user_id)
          .single();

        if (profile?.email) {
          await fetch(`${supabaseUrl}/functions/v1/send-email`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${serviceRoleKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: "payment_approved",
              to: profile.email,
              data: {
                userName: profile.display_name || "Cliente",
                orderId: orderId.slice(0, 8),
                amount: order.total_amount,
              },
            }),
          });
        }
      } catch (notifErr) {
        console.warn("Notification failed (non-blocking):", notifErr);
      }
    } else if (eventType === "charge.payment_failed") {
      await supabase
        .from("payment_transactions")
        .update({ status: "failed", raw_response: body })
        .eq("order_id", orderId)
        .eq("provider", "pagarme");

      // Keep order as pending_payment so user can retry
      console.log("Payment failed for order:", orderId);
    } else if (eventType === "charge.refunded") {
      await supabase
        .from("payment_transactions")
        .update({ status: "refunded", raw_response: body })
        .eq("order_id", orderId)
        .eq("provider", "pagarme");

      await supabase
        .from("orders")
        .update({ status: "refunded" })
        .eq("id", orderId);

      // Optionally revoke access
      await supabase
        .from("user_products")
        .delete()
        .eq("order_id", orderId);

      console.log("Order refunded:", orderId);
    } else {
      console.log("Unhandled webhook event:", eventType);
    }

    return ok();
  } catch (err) {
    console.error("payment-webhook error:", err);
    // Always return 200 for webhooks to avoid retries on our errors
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
