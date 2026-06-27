// Verify a Paystack payment reference and activate the audit.
// On success: creates the audit record and an audit_license entry.
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

    // Look up the pending transaction
    const { data: tx } = await admin
      .from("paystack_transactions")
      .select("*")
      .eq("reference", reference)
      .maybeSingle();

    if (!tx) return json({ error: "Unknown reference" }, 404);

    // Idempotency: if already verified, return existing audit_id
    if (tx.status === "success") {
      const existingAuditId = tx.raw_payload?.audit_id ?? null;
      return json({ ok: true, status: "success", audit_id: existingAuditId, already_verified: true });
    }

    const secret = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!secret) return json({ error: "Paystack key not configured" }, 503);

    // Verify with Paystack
    const psRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    const ps = await psRes.json();
    const ok = ps?.data?.status === "success";

    if (!ok) {
      await admin.from("paystack_transactions").update({
        status: "failed",
        raw_payload: ps.data,
      }).eq("reference", reference);

      return json({ ok: false, status: ps?.data?.status ?? "failed" });
    }

    // Extract metadata stored during initiation
    const meta = ps.data.metadata ?? {};
    const {
      org_id,
      pack,
      user_count,
      naira,
      user_id,
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
    } = meta;

    // Create the audit record as 'draft'
    const { data: newAudit, error: auditError } = await admin
      .from("audits")
      .insert({
        org_id,
        standard: pack,
        title: audit_title ?? `${pack.toUpperCase()} Audit`,
        criteria: audit_criteria ?? null,
        scope: audit_scope ?? null,
        object: audit_object ?? null,
        start_date: start_date ?? null,
        end_date: end_date ?? null,
        owner: audit_owner ?? null,
        auditee_name: auditee_name ?? null,
        auditee_email: auditee_email ?? null,
        lead_auditor_id: lead_auditor_id ?? null,
        status: "draft",
        created_by: user_id,
        user_count: user_count ?? null,
        paid_amount_ngn: naira ?? null,
        payment_reference: reference,
        payment_status: "paid",
      })
      .select("id")
      .single();

    if (auditError || !newAudit) {
      // Mark tx failed so user can retry
      await admin.from("paystack_transactions").update({
        status: "failed",
        raw_payload: { ...ps.data, audit_error: auditError?.message },
      }).eq("reference", reference);

      return json({ ok: false, error: auditError?.message ?? "Failed to create audit" }, 500);
    }

    // Create an audit_license entry — stores tier so Team page can enforce user limits
    const tier = meta.tier ?? null;
    await admin.from("audit_licenses").insert({
      org_id,
      pack,
      paid_amount_ngn: naira ?? 0,
      paystack_ref: reference,
      active: true,
      user_tier: tier,
      user_count: user_count ?? null,
    });

    // Mark transaction as success and store the audit_id
    await admin.from("paystack_transactions").update({
      status: "success",
      raw_payload: { ...ps.data, audit_id: newAudit.id },
    }).eq("reference", reference);

    return json({ ok: true, status: "success", audit_id: newAudit.id });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
