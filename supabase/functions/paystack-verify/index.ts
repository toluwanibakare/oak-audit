// Verify a Paystack reference and credit the wallet.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { reference } = await req.json();
    if (!reference) return json({ error: "Missing reference" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: tx } = await admin
      .from("paystack_transactions").select("*").eq("reference", reference).maybeSingle();
    if (!tx) return json({ error: "Unknown reference" }, 404);

    const secret = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!secret) return json({ error: "Paystack key not configured" }, 503);

    const psRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    const ps = await psRes.json();
    const ok = ps?.data?.status === "success";

    await admin.from("paystack_transactions").update({
      status: ok ? "success" : "failed", raw_payload: ps.data,
    }).eq("reference", reference);

    if (ok) {
      const credits = Number(ps?.data?.metadata?.credits ?? 0);
      if (credits > 0) {
        // Idempotent: topup_credits returns the same tx if reference already used
        await admin.rpc("topup_credits", {
          _org_id: tx.org_id,
          _credits: credits,
          _naira: tx.amount_ngn,
          _reference: reference,
          _user_id: tx.user_id,
        });
      }
    }

    return json({ ok, status: ps?.data?.status, credits: ps?.data?.metadata?.credits ?? 0 });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
