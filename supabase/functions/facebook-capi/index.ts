// Facebook Conversions API forwarder
// Receives event data from frontend or admin and sends to Meta Graph API
// with proper hashing of PII (email/phone) per Meta requirements.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const PIXEL_ID = "3545701582264861";
const GRAPH_VERSION = "v21.0";

interface CapiBody {
  event_name: string;            // 'Lead' | 'Purchase' | 'PageView' | 'Contact' | etc
  event_id: string;              // dedup key (same as Pixel)
  event_source_url?: string;
  action_source?: "website" | "chat" | "system_generated";
  value?: number;
  currency?: string;             // default BRL
  email?: string;                // raw, will be hashed
  phone?: string;                // raw, will be hashed (digits only)
  first_name?: string;
  last_name?: string;
  external_id?: string;          // e.g. user_id
  fbp?: string;                  // _fbp cookie
  fbc?: string;                  // _fbc cookie or fbclid wrapped
  client_user_agent?: string;
  content_name?: string;
  content_ids?: string[];
  test_event_code?: string;      // only for testing
  event_time?: number;           // unix seconds; defaults to now
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const normalizeEmail = (e: string) => e.trim().toLowerCase();
const normalizePhone = (p: string) => p.replace(/\D/g, ""); // digits only, with country code

function getClientIp(req: Request): string | undefined {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("cf-connecting-ip") ||
         req.headers.get("x-real-ip") || undefined;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const token = Deno.env.get("FACEBOOK_CAPI_ACCESS_TOKEN");
  if (!token) {
    return new Response(
      JSON.stringify({ error: "FACEBOOK_CAPI_ACCESS_TOKEN not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  let body: CapiBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!body.event_name || !body.event_id) {
    return new Response(
      JSON.stringify({ error: "event_name and event_id are required" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // Build hashed user_data
  const user_data: Record<string, unknown> = {};
  if (body.email) user_data.em = [await sha256Hex(normalizeEmail(body.email))];
  if (body.phone) user_data.ph = [await sha256Hex(normalizePhone(body.phone))];
  if (body.first_name) user_data.fn = [await sha256Hex(body.first_name.trim().toLowerCase())];
  if (body.last_name) user_data.ln = [await sha256Hex(body.last_name.trim().toLowerCase())];
  if (body.external_id) user_data.external_id = [await sha256Hex(body.external_id)];
  if (body.fbp) user_data.fbp = body.fbp;
  if (body.fbc) user_data.fbc = body.fbc;
  const ip = getClientIp(req);
  if (ip) user_data.client_ip_address = ip;
  const ua = body.client_user_agent || req.headers.get("user-agent");
  if (ua) user_data.client_user_agent = ua;

  // Build custom_data
  const custom_data: Record<string, unknown> = {};
  if (typeof body.value === "number") {
    custom_data.value = body.value;
    custom_data.currency = body.currency || "BRL";
  }
  if (body.content_name) custom_data.content_name = body.content_name;
  if (body.content_ids) {
    custom_data.content_ids = body.content_ids;
    custom_data.content_type = "product";
  }

  const event = {
    event_name: body.event_name,
    event_time: body.event_time || Math.floor(Date.now() / 1000),
    event_id: body.event_id,
    event_source_url: body.event_source_url,
    action_source: body.action_source || "website",
    user_data,
    custom_data,
  };

  const payload: Record<string, unknown> = { data: [event] };
  if (body.test_event_code) payload.test_event_code = body.test_event_code;

  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${PIXEL_ID}/events?access_token=${token}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("Meta CAPI error", res.status, data);
      return new Response(
        JSON.stringify({ error: "Meta API error", status: res.status, details: data }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    return new Response(JSON.stringify({ success: true, meta: data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("CAPI fetch failed", err);
    return new Response(
      JSON.stringify({ error: "Network error", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
