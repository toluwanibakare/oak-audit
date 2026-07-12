<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          {{-- Header --}}
          <tr>
            <td style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">OakAudix</h1>
              <p style="margin:4px 0 0;font-size:12px;color:#94a3b8;letter-spacing:1.5px;text-transform:uppercase;">Audit &bull; Compliance &bull; Risk</p>
            </td>
          </tr>
          {{-- Body --}}
          <tr>
            <td style="padding:36px 40px 28px;">
              <h2 style="margin:0 0 16px;font-size:20px;font-weight:600;color:#0f172a;">You're Invited!</h2>
              <p style="margin:0 0 6px;font-size:15px;color:#334155;line-height:1.6;">
                <strong style="color:#0f172a;">{{ $inviterName }}</strong> has invited you to join
                <strong style="color:#0f172a;">{{ $orgName }}</strong> on OakAudix.
              </p>
              <p style="margin:0 0 20px;font-size:15px;color:#334155;line-height:1.6;">
                OakAudix is the central platform for audit, compliance, and risk management. Collaborate with your team, track audits, manage findings, and stay compliant — all in one place.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:16px 0 24px;">
                    <a href="{{ $acceptUrl }}"
                       style="display:inline-block;padding:14px 40px;border-radius:8px;background:linear-gradient(135deg,#0f172a,#1e293b);color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:0.3px;">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:16px 0 0;font-size:13px;color:#64748b;line-height:1.5;">
                This invitation expires in <strong>7 days</strong>. If you don't have an account yet, you'll be prompted to create one when you accept.
              </p>

              <p style="margin:20px 0 0;font-size:13px;color:#94a3b8;">
                If you believe this invitation was sent in error, you can safely ignore this email.
              </p>
            </td>
          </tr>
          {{-- Footer --}}
          <tr>
            <td style="padding:16px 40px;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0;font-size:11px;color:#94a3b8;">
                OakAudix &bull; Powered by Oak Global International<br>
                <span style="color:#cbd5e1;">This is an automated message &mdash; please do not reply directly.</span>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
