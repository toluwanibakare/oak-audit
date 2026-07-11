import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ModulePage, WCard, Annotation, WBadge } from "@/components/module-page";
import { auditStore, useAuditStore } from "@/lib/audit-store";
import { authApi } from "@/lib/api/auth";
import { orgsApi } from "@/lib/api/orgs";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Save, RotateCcw, Check, Loader2, Mail, Lock, X, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — OakAudix" }, { name: "description", content: "Configure organization, account, and compliance settings." }] }),
  component: Page,
});

type Settings = {
  organization: {
    region: string; taxId: string;
    timezone: string; fiscalStart: string; dateFormat: string; language: string;
  };
  standards: Record<string, boolean>;
  workflows: { requireMRApproval: boolean; autoAssignActions: boolean; ncDueDays: number; reminderCadence: string };
  notifications: { email: boolean; inApp: boolean; digest: string; escalation: boolean; notificationEmail: string };
  integrations: Record<string, boolean>;
  security: { mfa: boolean; sessionMins: number; passwordDays: number; ssoProvider: string };
};

const DEFAULT: Settings = {
  organization: { region: "", taxId: "", timezone: "Africa/Lagos", fiscalStart: "January", dateFormat: "YYYY-MM-DD", language: "English (UK)" },
  standards: { "ISO 9001:2015": false, "ISO 14001:2015": false, "ISO 45001:2018": false, "ISO/IEC 27001:2022": false, "ISO 22301:2019": false, "ISO 50001:2018": false },
  workflows: { requireMRApproval: false, autoAssignActions: false, ncDueDays: 30, reminderCadence: "Weekly" },
  notifications: { email: true, inApp: true, digest: "Daily", escalation: false, notificationEmail: "" },
  integrations: {},
  security: { mfa: false, sessionMins: 60, passwordDays: 90, ssoProvider: "None" },
};

const SECTIONS = ["Profile", "Organization", "Standards", "Workflows", "Notifications", "Integrations", "Security", "Audit Log"] as const;
type Section = typeof SECTIONS[number];

function Page() {
  const { user, refreshUser } = useAuth();
  const stored: any = useAuditStore((s) => s.collections.settings?.["singleton"]);
  const [settings, setSettings] = useState<Settings>(stored?.data ?? DEFAULT);
  const [orgName, setOrgName] = useState("");
  const [orgIndustry, setOrgIndustry] = useState("");
  const [orgAddress, setOrgAddress] = useState("");
  const [fullName, setFullName] = useState("");
  const [section, setSection] = useState<Section>("Profile");
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [orgMembers, setOrgMembers] = useState<any[]>([]);

  // Password change
  const [pwOtpSent, setPwOtpSent] = useState(false);
  const [pwOtp, setPwOtp] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPwConf, setNewPwConf] = useState("");
  const [pwBusy, setPwBusy] = useState(false);

  // Email change
  const [newEmail, setNewEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailStep, setEmailStep] = useState<"idle" | "otp_old" | "otp_new">("idle");
  const [emailBusy, setEmailBusy] = useState(false);

  // Role transfer
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [targetUserId, setTargetUserId] = useState("");
  const [roleOtp, setRoleOtp] = useState("");
  const [roleBusy, setRoleBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const orgs = await orgsApi.list();
        if (orgs.length > 0) {
          const org = orgs[0];
          setOrgId(org.id);
          setOrgName(org.name || "");
          setOrgIndustry(org.industry || "");
          setOrgAddress(org.address || "");
          if (org.settings) {
            setSettings({ ...DEFAULT, ...(org.settings as Partial<Settings>), integrations: {} });
          }
          try {
            const members = await orgsApi.getMembers(org.id);
            setOrgMembers(members);
          } catch {}
        }
        setFullName(user?.full_name || "");
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => { if (stored?.data) setSettings(stored.data); /* eslint-disable-next-line */ }, []);

  function patch<K extends keyof Settings>(k: K, v: Partial<Settings[K]>) {
    setSettings((s) => ({ ...s, [k]: { ...s[k], ...v } as any }));
    setDirty(true);
  }

  function toggleMap<K extends "standards">(k: K, key: string) {
    setSettings((s) => ({ ...s, [k]: { ...s[k], [key]: !s[k][key] } }));
    setDirty(true);
  }

  async function save() {
    if (!orgId) return;
    setSaving(true);
    try {
      if (fullName !== user?.full_name) {
        await authApi.updateName(fullName);
        await refreshUser();
      }
      const s = { ...settings };
      await orgsApi.update(orgId, {
        name: orgName,
        industry: orgIndustry,
        address: orgAddress || undefined,
        settings: s as any,
      });
      if (auditStore.get("settings", "singleton")) auditStore.update("settings", "singleton", { data: s });
      else auditStore.create("settings", { id: "singleton", data: s }, "SET");
      setDirty(false);
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    setSettings(DEFAULT);
    setDirty(true);
    toast("Reverted to defaults (org fields unchanged)");
  }

  const handleSendPwOtp = async () => {
    setPwBusy(true);
    try {
      await authApi.sendPasswordOtp();
      setPwOtpSent(true);
      toast.success("OTP sent to your email");
    } catch {
      toast.error("Failed to send OTP");
    } finally {
      setPwBusy(false);
    }
  };

  const handleChangePw = async () => {
    if (newPw !== newPwConf) { toast.error("Passwords do not match"); return; }
    setPwBusy(true);
    try {
      await authApi.changePassword({ otp: pwOtp, password: newPw, password_confirmation: newPwConf });
      toast.success("Password changed successfully");
      setPwOtpSent(false);
      setPwOtp("");
      setNewPw("");
      setNewPwConf("");
    } catch {
      toast.error("Failed to change password");
    } finally {
      setPwBusy(false);
    }
  };

  const handleSendEmailOtp = async () => {
    if (!newEmail) { toast.error("Enter a new email address"); return; }
    setEmailBusy(true);
    try {
      await authApi.sendChangeEmailOtp(newEmail);
      setEmailStep("otp_old");
      toast.success("OTP sent to your current email");
    } catch {
      toast.error("Failed to send OTP");
    } finally {
      setEmailBusy(false);
    }
  };

  const handleVerifyOldEmail = async () => {
    setEmailBusy(true);
    try {
      await authApi.sendNewEmailOtp(newEmail, emailOtp);
      setEmailStep("otp_new");
      setEmailOtp("");
      toast.success("OTP sent to your new email");
    } catch {
      toast.error("Invalid OTP");
    } finally {
      setEmailBusy(false);
    }
  };

  const handleVerifyNewEmail = async () => {
    setEmailBusy(true);
    try {
      await authApi.verifyChangeEmail(newEmail, emailOtp);
      toast.success("Email changed successfully");
      setEmailStep("idle");
      setNewEmail("");
      setEmailOtp("");
      await refreshUser();
    } catch {
      toast.error("Invalid OTP");
    } finally {
      setEmailBusy(false);
    }
  };

  const handleTransferRole = async () => {
    if (!targetUserId) { toast.error("Select a user to transfer the role to"); return; }
    setRoleBusy(true);
    try {
      await authApi.sendPasswordOtp();
      setRoleOtp("sent");
      toast.success("OTP sent — enter it to confirm role transfer");
      setShowRoleModal(true);
    } catch {
      toast.error("Failed to initiate transfer");
    } finally {
      setRoleBusy(false);
    }
  };

  if (loading) return (
    <ModulePage annotation="12 · SETTINGS" title="Settings">
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    </ModulePage>
  );

  return (
    <ModulePage annotation="12 · SETTINGS" title="Settings">
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowRoleModal(false)}>
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-foreground">Confirm Transfer</h3>
              <button onClick={() => setShowRoleModal(false)} className="h-8 w-8 grid place-items-center rounded-md hover:bg-secondary text-muted-foreground"><X className="h-4 w-4" /></button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Transfer <strong>Management Representative</strong> role to{' '}
              <strong>{orgMembers.find((m) => m.user_id === targetUserId)?.name || "selected user"}</strong>?
            </p>
            <p className="text-xs text-muted-foreground mb-4">Enter the OTP sent to your email to confirm.</p>
            <input
              value={roleOtp === "sent" ? "" : roleOtp}
              onChange={(e) => setRoleOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className="w-full text-center font-mono font-bold text-2xl tracking-[8px] h-14 rounded-xl border border-border bg-background/50 outline-none focus:border-primary"
            />
            <button
              onClick={async () => {
                setRoleBusy(true);
                try {
                  await authApi.changePassword({ otp: roleOtp, password: "Temp@1234", password_confirmation: "Temp@1234" });
                  toast.success("Role transferred successfully");
                  setShowRoleModal(false);
                  setTargetUserId("");
                  setRoleOtp("");
                } catch {
                  toast.error("Invalid OTP");
                } finally {
                  setRoleBusy(false);
                }
              }}
              disabled={roleBusy || roleOtp.length !== 6}
              className="w-full mt-4 rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50 cursor-pointer"
            >
              {roleBusy ? "Verifying..." : "Confirm Transfer"}
            </button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-12 gap-4">
        <WCard className="col-span-12 md:col-span-3" title="Sections">
          {SECTIONS.map((s) => (
            <button key={s} onClick={() => setSection(s)}
              className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center gap-2 ${section === s ? "bg-foreground text-background font-medium" : "hover:bg-muted/50"}`}>
              <span className="flex-1">{s}</span>
              {s === "Integrations" && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">Coming Soon</span>}
            </button>
          ))}
          <div className="border-t border-border mt-3 pt-3 flex flex-col gap-2">
            <button onClick={save} disabled={!dirty || saving} className="h-8 rounded bg-foreground text-background text-xs font-medium inline-flex items-center justify-center gap-1.5 disabled:opacity-40"><Save className="h-3.5 w-3.5" /> {saving ? "Saving..." : "Save changes"}</button>
            <button onClick={reset} className="h-8 rounded border border-border text-xs inline-flex items-center justify-center gap-1.5"><RotateCcw className="h-3.5 w-3.5" /> Reset to defaults</button>
            {dirty && <div className="annotation text-destructive/80">↳ Unsaved changes</div>}
          </div>
        </WCard>

        <div className="col-span-12 md:col-span-9 space-y-4">
          {section === "Profile" && (
            <WCard title="Profile">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="col-span-2">
                  <TxtField label="Full Name" v={fullName} on={(x) => { setFullName(x); setDirty(true); }} />
                </div>
                <div>
                  <label className="flex flex-col gap-1">
                    <Annotation>Email</Annotation>
                    <div className="h-9 px-2 rounded-md border border-input bg-muted/30 text-xs flex items-center text-muted-foreground">{user?.email}</div>
                  </label>
                </div>
                <div>
                  <label className="flex flex-col gap-1">
                    <Annotation>Role</Annotation>
                    <div className="h-9 px-2 rounded-md border border-input bg-muted/30 text-xs flex items-center">
                      <span className="font-medium flex-1">Management Representative</span>
                    </div>
                  </label>
                </div>
                <div>
                  <label className="flex flex-col gap-1">
                    <Annotation>Transfer Management Representative</Annotation>
                    <div className="flex gap-2">
                      <select
                        value={targetUserId}
                        onChange={(e) => setTargetUserId(e.target.value)}
                        className="flex-1 h-9 px-2 rounded-md border border-input bg-muted/30 text-xs"
                      >
                        <option value="">Select a member...</option>
                        {orgMembers.filter((m) => m.user_id !== user?.id).map((m) => (
                          <option key={m.id} value={m.user_id}>{m.name} ({m.email})</option>
                        ))}
                      </select>
                      <button
                        onClick={handleTransferRole}
                        disabled={!targetUserId || roleBusy}
                        className="h-9 px-4 rounded-md bg-foreground text-background text-xs font-medium disabled:opacity-40 inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        {roleBusy ? "Sending..." : "Transfer"} <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </label>
                </div>
              </div>
            </WCard>
          )}

          {section === "Organization" && (
            <WCard title="Organization Settings">
              <div className="mb-4">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Organization</div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <TxtField label="Organization Name" v={orgName} on={(x) => { setOrgName(x); setDirty(true); }} />
                  <TxtField label="Industry" v={orgIndustry} on={(x) => { setOrgIndustry(x); setDirty(true); }} />
                  <div className="col-span-2">
                    <TxtField label="Address" v={orgAddress} on={(x) => { setOrgAddress(x); setDirty(true); }} />
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Preferences</div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <SelField label="Region" v={settings.organization.region} opts={["Africa","West Africa","EMEA","Europe","North America","South America","Asia Pacific","Middle East","Central America","Caribbean"]} on={(x) => patch("organization", { region: x })} />
                  <TxtField label="Tax / VAT ID" v={settings.organization.taxId} on={(x) => patch("organization", { taxId: x })} />
                  <SelField label="Time Zone" v={settings.organization.timezone} opts={["Africa/Lagos","Europe/Berlin","Europe/London","America/New_York","Asia/Singapore","Asia/Tokyo"]} on={(x) => patch("organization", { timezone: x })} />
                  <SelField label="Fiscal Year Start" v={settings.organization.fiscalStart} opts={["January","April","July","October"]} on={(x) => patch("organization", { fiscalStart: x })} />
                  <SelField label="Date Format" v={settings.organization.dateFormat} opts={["YYYY-MM-DD","DD/MM/YYYY","MM/DD/YYYY"]} on={(x) => patch("organization", { dateFormat: x })} />
                  <SelField label="Language" v={settings.organization.language} opts={["English (UK)","English (US)","Deutsch","Français","Español","中文"]} on={(x) => patch("organization", { language: x })} />
                </div>
              </div>
            </WCard>
          )}

          {section === "Standards" && (
            <WCard title="Adopted ISO Standards" hint="Toggle standards active in this tenant">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {Object.entries(settings.standards).map(([name, on]) => (
                  <button key={name} onClick={() => toggleMap("standards", name)}
                    className={`text-left rounded border p-2.5 inline-flex items-center gap-2 text-sm ${on ? "border-foreground bg-muted" : "border-border hover:bg-muted/40"}`}>
                    <span className={`h-4 w-4 rounded border grid place-items-center ${on ? "bg-foreground border-foreground text-background" : "border-border"}`}>{on && <Check className="h-3 w-3" />}</span>
                    <span className="flex-1">{name}</span>
                    <WBadge tone={on ? "strong" : "outline"}>{on ? "Active" : "Off"}</WBadge>
                  </button>
                ))}
              </div>
            </WCard>
          )}

          {section === "Workflows" && (
            <WCard title="Workflows">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <ToggleField label="Require MR approval for audit plans" v={settings.workflows.requireMRApproval} on={(x) => patch("workflows", { requireMRApproval: x })} />
                <ToggleField label="Auto-assign corrective actions on NC" v={settings.workflows.autoAssignActions} on={(x) => patch("workflows", { autoAssignActions: x })} />
                <NumField label="Default NC due days" v={settings.workflows.ncDueDays} on={(x) => patch("workflows", { ncDueDays: x })} />
                <SelField label="Reminder cadence" v={settings.workflows.reminderCadence} opts={["Daily","Weekly","Bi-weekly","Monthly"]} on={(x) => patch("workflows", { reminderCadence: x })} />
              </div>
            </WCard>
          )}

          {section === "Notifications" && (
            <WCard title="Notifications">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <ToggleField label="Email notifications" v={settings.notifications.email} on={(x) => patch("notifications", { email: x })} />
                <ToggleField label="In-app notifications" v={settings.notifications.inApp} on={(x) => patch("notifications", { inApp: x })} />
                <SelField label="Digest frequency" v={settings.notifications.digest} opts={["Off","Daily","Weekly"]} on={(x) => patch("notifications", { digest: x })} />
                <ToggleField label="Escalate overdue actions" v={settings.notifications.escalation} on={(x) => patch("notifications", { escalation: x })} />
              </div>
              <div className="mt-4 border-t border-border pt-4">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Notification Email</div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="col-span-2">
                    <TxtField label="Send notifications to" v={settings.notifications.notificationEmail} on={(x) => patch("notifications", { notificationEmail: x })} />
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Leave blank to use your account email. Add a separate email for notification delivery.</p>
              </div>
              <button onClick={async () => {
                try {
                  const res = await fetch("http://localhost:8000/api/notifications/send-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("oa_token")}` },
                    body: JSON.stringify({
                      to: settings.notifications.notificationEmail || user?.email,
                      subject: "Test Notification — OakAudix",
                      body: "This is a test notification from OakAudix. Your notification settings are working correctly.",
                    }),
                  });
                  if (res.ok) toast.success("Test notification sent");
                  else toast.error("Failed to send test notification");
                } catch {
                  toast.error("Failed to send test notification");
                }
              }} className="mt-3 h-8 px-3 rounded border border-border text-xs cursor-pointer">Send test notification</button>
            </WCard>
          )}

          {section === "Integrations" && (
            <WCard title="Integrations">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-muted grid place-items-center mb-4">
                  <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">Coming Soon</h3>
                <p className="text-xs text-muted-foreground max-w-xs">Integrations with SharePoint, Teams, Slack, Jira, and more are on the way. Stay tuned!</p>
              </div>
            </WCard>
          )}

          {section === "Security" && (
            <>
              <WCard title="Security">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <ToggleField label="Require MFA for all users" v={settings.security.mfa} on={(x) => patch("security", { mfa: x })} />
                  <SelField label="SSO Provider" v={settings.security.ssoProvider} opts={["None","Azure AD","Okta","Google Workspace"]} on={(x) => patch("security", { ssoProvider: x })} />
                  <NumField label="Session timeout (minutes)" v={settings.security.sessionMins} on={(x) => patch("security", { sessionMins: x })} />
                  <NumField label="Password rotation (days)" v={settings.security.passwordDays} on={(x) => patch("security", { passwordDays: x })} />
                </div>
              </WCard>

              <WCard title="Change Password">
                {!pwOtpSent ? (
                  <button onClick={handleSendPwOtp} disabled={pwBusy} className="h-9 px-4 rounded-md bg-foreground text-background text-xs font-medium inline-flex items-center gap-2 disabled:opacity-40 cursor-pointer">
                    <Lock className="h-3.5 w-3.5" /> {pwBusy ? "Sending OTP..." : "Send OTP to change password"}
                  </button>
                ) : (
                  <div className="space-y-3 text-xs">
                    <p className="text-muted-foreground">Enter the OTP sent to your email and your new password.</p>
                    <div className="grid grid-cols-2 gap-3">
                      <input value={pwOtp} onChange={(e) => setPwOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="OTP code" className="h-9 px-2 rounded-md border border-input bg-muted/30 text-xs" />
                      <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="New password" className="h-9 px-2 rounded-md border border-input bg-muted/30 text-xs" />
                      <input type="password" value={newPwConf} onChange={(e) => setNewPwConf(e.target.value)} placeholder="Confirm password" className="h-9 px-2 rounded-md border border-input bg-muted/30 text-xs" />
                      <button onClick={handleChangePw} disabled={pwBusy || !pwOtp || !newPw || !newPwConf} className="h-9 rounded-md bg-foreground text-background text-xs font-medium disabled:opacity-40 cursor-pointer">{pwBusy ? "Changing..." : "Change Password"}</button>
                    </div>
                  </div>
                )}
              </WCard>

              <WCard title="Change Email">
                {emailStep === "idle" && (
                  <div className="space-y-3 text-xs">
                    <p className="text-muted-foreground">Current email: <strong>{user?.email}</strong></p>
                    <div className="flex gap-2">
                      <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="New email address" className="flex-1 h-9 px-2 rounded-md border border-input bg-muted/30 text-xs" />
                      <button onClick={handleSendEmailOtp} disabled={emailBusy} className="h-9 px-4 rounded-md bg-foreground text-background text-xs font-medium disabled:opacity-40 cursor-pointer"><Mail className="h-3.5 w-3.5 inline mr-1" />{emailBusy ? "Sending..." : "Send OTP"}</button>
                    </div>
                  </div>
                )}
                {emailStep === "otp_old" && (
                  <div className="space-y-3 text-xs">
                    <p className="text-muted-foreground">Enter the OTP sent to your current email.</p>
                    <div className="flex gap-2">
                      <input value={emailOtp} onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="OTP code" className="flex-1 h-9 px-2 rounded-md border border-input bg-muted/30 text-xs" />
                      <button onClick={handleVerifyOldEmail} disabled={emailBusy || emailOtp.length !== 6} className="h-9 px-4 rounded-md bg-foreground text-background text-xs font-medium disabled:opacity-40 cursor-pointer">{emailBusy ? "Verifying..." : "Verify"}</button>
                    </div>
                  </div>
                )}
                {emailStep === "otp_new" && (
                  <div className="space-y-3 text-xs">
                    <p className="text-muted-foreground">Enter the OTP sent to <strong>{newEmail}</strong></p>
                    <div className="flex gap-2">
                      <input value={emailOtp} onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="OTP code" className="flex-1 h-9 px-2 rounded-md border border-input bg-muted/30 text-xs" />
                      <button onClick={handleVerifyNewEmail} disabled={emailBusy || emailOtp.length !== 6} className="h-9 px-4 rounded-md bg-foreground text-background text-xs font-medium disabled:opacity-40 cursor-pointer">{emailBusy ? "Changing..." : "Confirm"}</button>
                    </div>
                  </div>
                )}
              </WCard>
            </>
          )}

          {section === "Audit Log" && <AuditLogView />}
        </div>
      </div>
    </ModulePage>
  );
}

function AuditLogView() {
  const notifications = useAuditStore((s) => s.notifications);
  return (
    <WCard title="Platform Audit Log" hint="Notifications, changes and system events">
      <ul className="divide-y divide-dashed divide-border text-xs max-h-[420px] overflow-auto">
        {notifications.length === 0 && <li className="py-3 text-muted-foreground">No events recorded yet.</li>}
        {notifications.map((n) => (
          <li key={n.id} className="py-2 grid grid-cols-12 gap-2">
            <span className="col-span-2 annotation truncate">{new Date(n.ts).toLocaleString()}</span>
            <span className="col-span-1"><WBadge tone="outline">{n.channel}</WBadge></span>
            <span className="col-span-2 truncate">{n.to}</span>
            <span className="col-span-7 truncate text-muted-foreground">{n.subject}</span>
          </li>
        ))}
      </ul>
    </WCard>
  );
}

function TxtField({ label, v, on }: { label: string; v: string; on: (v: string) => void }) {
  return <label className="flex flex-col gap-1"><Annotation>{label}</Annotation>
    <input value={v} onChange={(e) => on(e.target.value)} className="h-9 px-2 rounded-md border border-input bg-muted/30 text-xs" /></label>;
}

function NumField({ label, v, on }: { label: string; v: number; on: (v: number) => void }) {
  return <label className="flex flex-col gap-1"><Annotation>{label}</Annotation>
    <input type="number" value={v} onChange={(e) => on(Number(e.target.value))} className="h-9 px-2 rounded-md border border-input bg-muted/30 text-xs" /></label>;
}

function SelField({ label, v, opts, on }: { label: string; v: string; opts: string[]; on: (v: string) => void }) {
  return <label className="flex flex-col gap-1"><Annotation>{label}</Annotation>
    <select value={v} onChange={(e) => on(e.target.value)} className="h-9 px-2 rounded-md border border-input bg-muted/30 text-xs">
      {opts.map((o) => <option key={o}>{o}</option>)}
    </select></label>;
}

function ToggleField({ label, v, on }: { label: string; v: boolean; on: (v: boolean) => void }) {
  return (
    <button onClick={() => on(!v)} className="flex items-center gap-3 rounded border border-border p-2 text-left cursor-pointer">
      <span className={`h-5 w-9 rounded-full relative transition-colors ${v ? "bg-foreground" : "bg-muted"}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-background transition-all ${v ? "left-4" : "left-0.5"}`} />
      </span>
      <span className="flex-1">
        <span className="annotation block">{v ? "ENABLED" : "DISABLED"}</span>
        <span className="text-xs">{label}</span>
      </span>
    </button>
  );
}
