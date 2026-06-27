// Initiate a Paystack payment for a direct audit purchase.
// Pricing is per-user tier — no credits or wallet involved.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Pricing matrix: pack → tier → amount in Naira
const PACK_TIER_PRICES: Record<string, Record<string, number>> = {
  "9001":  { "1-5": 500_000,   "5-15": 1_000_000, "16+": 1_500_000 },
  "14001": { "1-5": 500_000,   "5-15": 1_000_000, "16+": 1_500_000 },
  "45001": { "1-5": 500_000,   "5-15": 1_000_000, "16+": 1_500_000 },
  "27001": { "1-5": 500_000,   "5-15": 1_000_000, "16+": 1_500_000 },
  "hse":   { "1-5": 1_000_000, "5-15": 1_500_000, "16+": 2_000_000 },
  "ims":   { "1-5": 1_500_000, "5-15": 2_000_000, "16+": 2_500_000 },
};

function getUserTier(userCount: number): string {
  if (userCount <= 5) return "1-5";
  if (userCount <= 15) return "5-15";
  return "16+";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization") ?? "";
    const jwt = auth.replace("Bearer ", "");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { Authorization: `Bearer ${jwt}` } } },
    );

    const { data: userData } = await supabase.auth.getUser(jwt);
    const user = userData?.user;
    if (!user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json();
    const {
      org_id,
      pack,
      user_count,
      email,
      // Audit metadata stored in transaction, used on verification to create the audit
      audit_title,
      audit_criteria,
      audit_scope,
      audit_object,
      start_date,
      end_date,
      audit_owner,
      auditee_name,
      auditee_email,
      lead_auditor_id,
    } = body;

    if (!org_id || !pack || typeof user_count !== "number" || user_count < 1) {
      return json({ error: "Missing required fields: org_id, pack, user_count" }, 400);
    }

    const tier = getUserTier(user_count);
    const prices = PACK_TIER_PRICES[pack];
    if (!prices) return json({ error: `Unknown pack: ${pack}` }, 400);

    const naira = prices[tier];
    const amountKobo = naira * 100;

    const reference = `oak_audit_${pack}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const secret = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!secret) {
      return json({
        error: "Paystack key not configured",
        message: "Add PAYSTACK_SECRET_KEY in Cloud secrets to enable live checkout.",
      }, 503);
    }

    const origin = req.headers.get("origin") ?? "https://app.oakaudix.com";
    const callback = `${origin}/app/licenses?ref=${reference}`;

    const psRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email ?? user.email,
        amount: amountKobo,
        currency: "NGN",
        reference,
        callback_url: callback,
        metadata: {
          org_id,
          pack,
          user_count,
          tier,
          naira,
          user_id: user.id,
          kind: "audit",
          // Audit metadata — used during verification to create the audit record
          audit_title,
          audit_criteria,
          audit_scope,
          audit_object,
          start_date,
          end_date,
          audit_owner,
          auditee_name,
          auditee_email,
          lead_auditor_id,
        },
      }),
    });

    const ps = await psRes.json();
    if (!ps.status) return json({ error: ps.message ?? "Paystack init failed" }, 502);

    // Record a pending transaction
    await supabase.from("paystack_transactions").insert({
      org_id,
      user_id: user.id,
      reference,
      pack,
      kind: "audit",
      amount_ngn: naira,
      status: "pending",
      raw_payload: ps.data,
    });

    return json({ authorization_url: ps.data.authorization_url, reference });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
