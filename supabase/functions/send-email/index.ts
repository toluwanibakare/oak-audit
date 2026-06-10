import nodemailer from "npm:nodemailer";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { to, subject, html, text } = await req.json();

    const host = Deno.env.get("SMTP_HOST") || "oak-global.com.ng";
    const port = Number(Deno.env.get("SMTP_PORT")) || 465;
    const user = Deno.env.get("SMTP_USER") || "o.kolawole@oak-global.com.ng";
    const pass = Deno.env.get("SMTP_PASS") || "69SlSNCTL{PM}";
    const senderName = Deno.env.get("SMTP_SENDER_NAME") || "Oak Audits";
    const senderEmail = Deno.env.get("SMTP_SENDER_EMAIL") || "o.kolawole@oak-global.com.ng";

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    const info = await transporter.sendMail({
      from: `"${senderName}" <${senderEmail}>`,
      to,
      subject,
      text,
      html,
    });

    return new Response(JSON.stringify({ success: true, messageId: info.messageId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
