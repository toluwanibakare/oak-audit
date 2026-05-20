// Initialize a Paystack transaction for a credit top-up.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const NAIRA_PER_CREDIT = 5000;
const ALLOWED_BUNDLES = new Set([1, 3, 5, 10]);

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

    const { org_id, credits, email } = await req.json();
    if (!org_id || typeof credits !== "number" || !ALLOWED_BUNDLES.has(credits)) {
      return json({ error: "Invalid bundle" }, 400);
    }

    const naira = credits * NAIRA_PER_CREDIT;
    const amountKobo = naira * 100;
    const reference = `oak_topup_${credits}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const secret = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!secret) {
      return json({
        error: "Paystack key not configured",
        message: "Add PAYSTACK_SECRET_KEY in Cloud secrets to enable live checkout.",
      }, 503);
    }

    const callback = req.headers.get("origin")
      ? `${req.headers.get("origin")}/app/wallet?ref=${reference}`
      : `https://example.com/app/wallet?ref=${reference}`;

    const psRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email ?? user.email,
        amount: amountKobo,
        currency: "NGN",
        reference,
        callback_url: callback,
        metadata: { org_id, credits, user_id: user.id, kind: "topup" },
      }),
    });
    const ps = await psRes.json();
    if (!ps.status) return json({ error: ps.message ?? "Paystack init failed" }, 502);

    await supabase.from("paystack_transactions").insert({
      org_id, user_id: user.id, reference,
      pack: `topup_${credits}`,
      amount_ngn: naira, status: "pending", raw_payload: ps.data,
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
