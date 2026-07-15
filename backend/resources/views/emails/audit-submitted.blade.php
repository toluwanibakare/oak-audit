<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">OakAudix</h1>
              <p style="margin:4px 0 0;font-size:12px;color:#94a3b8;letter-spacing:1.5px;text-transform:uppercase;">Audit &bull; Compliance &bull; Risk</p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px 28px;">
              <h2 style="margin:0 0 16px;font-size:20px;font-weight:600;color:#0f172a;">Audit Submitted for Review</h2>
              <p style="margin:0 0 6px;font-size:15px;color:#334155;line-height:1.6;">
                <strong style="color:#0f172a;">{{ $submittedBy }}</strong> has submitted an audit for your review:
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;border:1px solid #e2e8f0;border-radius:8px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <table width="100%">
                      <tr><td style="padding:4px 0;font-size:13px;color:#64748b;">Title</td><td style="padding:4px 0;font-size:13px;font-weight:600;color:#0f172a;">{{ $audit->title }}</td></tr>
                      <tr><td style="padding:4px 0;font-size:13px;color:#64748b;">Standard</td><td style="padding:4px 0;font-size:13px;font-weight:600;color:#0f172a;">{{ $audit->standard }}</td></tr>
                      <tr><td style="padding:4px 0;font-size:13px;color:#64748b;">Organization</td><td style="padding:4px 0;font-size:13px;font-weight:600;color:#0f172a;">{{ $orgName }}</td></tr>
                      <tr><td style="padding:4px 0;font-size:13px;color:#64748b;">Submitted By</td><td style="padding:4px 0;font-size:13px;font-weight:600;color:#0f172a;">{{ $submittedBy }}</td></tr>
                      <tr><td style="padding:4px 0;font-size:13px;color:#64748b;">Status</td><td style="padding:4px 0;font-size:13px;font-weight:600;color:#f59e0b;">Under Review</td></tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:16px 0 24px;">
                    <a href="{{ $reviewUrl }}"
                       style="display:inline-block;padding:14px 40px;border-radius:8px;background:linear-gradient(135deg,#0f172a,#1e293b);color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:0.3px;">
                      Review &amp; Finalize
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:16px 0 0;font-size:13px;color:#64748b;line-height:1.5;">
                Please review the submitted audit and either approve it as final or request revisions.
              </p>
            </td>
          </tr>
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
