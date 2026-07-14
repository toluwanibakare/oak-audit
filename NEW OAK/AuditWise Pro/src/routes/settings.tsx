import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ModulePage, WCard, Annotation, WBadge } from "@/components/module-page";
import { auditStore, useAuditStore } from "@/lib/audit-store";
import { authApi } from "@/lib/api/auth";
import { entitiesApi } from "@/lib/api/entities";
import { orgsApi } from "@/lib/api/orgs";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Save, RotateCcw, Check, Loader2, Mail, Lock, Plus, X, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — OakAudix" }, { name: "description", content: "Configure organization, account, and compliance settings." }] }),
  component: Page,
});

type Settings = {
  organization: {
    region: string; taxId: string;
    timezone: string; fiscalStart: string; dateFormat: string; language: string;
  };
  workflows: { requireMRApproval: boolean; autoAssignActions: boolean; ncDueDays: number; reminderCadence: string };
  notifications: { email: boolean; inApp: boolean; digest: string; escalation: boolean; notificationEmail: string };
  integrations: Record<string, boolean>;
  security: { mfa: boolean; sessionMins: number; passwordDays: number; ssoProvider: string };
};

const DEFAULT: Settings = {
  organization: { region: "", taxId: "", timezone: "Africa/Lagos", fiscalStart: "January", dateFormat: "YYYY-MM-DD", language: "English (UK)" },
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

  // Standards
  const standards = useAuditStore((s) => Object.values(s.collections.standards ?? {}));
  const [showStdDialog, setShowStdDialog] = useState(false);
  const [stdSyncing, setStdSyncing] = useState(true);
  const [stdSearch, setStdSearch] = useState("");

  const DEFAULT_STANDARDS = [
    { code: "ISO 9001:2015", title: "Quality Management Systems — Requirements", type: "Management System", edition: "2015", status: "Active" },
    { code: "ISO 14001:2015", title: "Environmental Management Systems — Requirements", type: "Management System", edition: "2015", status: "Active" },
    { code: "ISO 45001:2018", title: "Occupational Health & Safety Management Systems", type: "Management System", edition: "2018", status: "Active" },
    { code: "ISO/IEC 27001:2022", title: "Information Security Management Systems", type: "Management System", edition: "2022", status: "Active" },
    { code: "ISO 22301:2019", title: "Security & Resilience — Business Continuity", type: "Management System", edition: "2019", status: "Active" },
    { code: "ISO 50001:2018", title: "Energy Management Systems — Requirements", type: "Management System", edition: "2018", status: "Active" },
    { code: "ISO 13485:2016", title: "Medical Devices — Quality Management Systems", type: "Management System", edition: "2016", status: "Active" },
    { code: "ISO 22000:2018", title: "Food Safety Management Systems — Requirements", type: "Management System", edition: "2018", status: "Active" },
  ];

  useEffect(() => {
    (async () => {
      try {
        const orgs = await orgsApi.list();
        if (orgs.length > 0) {
          const remote = await entitiesApi.list(orgs[0].id, "standards");
          const locals = auditStore.list("standards") as any[];
          const localById = new Map(locals.map((i: any) => [i.id, i]));
          const localByCode = new Map(locals.map((i: any) => [i.code, i]));
          for (const item of remote) {
            const code = item.data?.code ?? item.code;
            if (localById.has(item.id)) {
              auditStore.update("standards", item.id, item);
            } else if (code && localByCode.has(code)) {
              // Migrate short ID to UUID
              const old = localByCode.get(code);
              auditStore.remove("standards", old.id);
              auditStore.create("standards", { ...item, id: item.id }, "");
            } else {
              auditStore.create("standards", { ...item, id: item.id }, "");
            }
          }
        }
      } catch {}
      const local = auditStore.list("standards");
      if (local.length === 0) {
        for (const s of DEFAULT_STANDARDS) {
          auditStore.create("standards", s, "STD");
        }
      }
      setStdSyncing(false);
    })();
  }, []);

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
        }
        setFullName(user?.full_name || "");
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => { if (stored?.data) setSettings(stored.data); /* eslint-disable-next-line */ }, []);

  useEffect(() => {
    if (user?.full_name) setFullName(user.full_name);
  }, [user?.full_name]);

  function patch<K extends keyof Settings>(k: K, v: Partial<Settings[K]>) {
    setSettings((s) => ({ ...s, [k]: { ...s[k], ...v } as any }));
    setDirty(true);
  }

  async function save() {
    setSaving(true);
    try {
      let targetOrgId = orgId;
      if (!targetOrgId) {
        const created = await orgsApi.create({ name: orgName || "My Organization", industry: orgIndustry || undefined, address: orgAddress || undefined, type: "organization" });
        targetOrgId = created.id;
        setOrgId(targetOrgId);
      }
      if (fullName !== user?.full_name) {
        await authApi.updateName(fullName);
        await refreshUser();
      }
      const s = { ...settings };
      await orgsApi.update(targetOrgId, {
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

  if (loading) return (
    <ModulePage title="Settings">
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    </ModulePage>
  );

  return (
    <ModulePage title="Settings">
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
            <WCard title="ISO Standards" hint="Manage standards. Only Active ones appear in Processes.">
              <div className="flex items-center gap-2 mb-3">
                <input value={stdSearch} onChange={(e) => setStdSearch(e.target.value)} placeholder="Search standards…" className="h-8 px-2 rounded-md border border-input bg-muted/30 text-xs flex-1 min-w-0" />
                <button onClick={() => setShowStdDialog(true)} className="h-8 px-3 rounded-md bg-foreground text-background text-xs font-medium inline-flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Add Standard
                </button>
              </div>
              {stdSyncing ? (
                <div className="flex items-center justify-center py-10 text-xs text-muted-foreground">
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Loading standards…
                </div>
              ) : standards.length === 0 ? (
                <div className="py-10 text-center text-xs text-muted-foreground">
                  No standards yet. Click "Add Standard" to create one.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {standards
                    .filter((s: any) => `${s.code} ${s.title}`.toLowerCase().includes(stdSearch.toLowerCase()))
                    .map((s: any) => {
                      const active = s.status === "Active";
                      return (
                        <div key={s.id} className="rounded border border-border p-2.5 text-xs flex items-center gap-2">
                          <button onClick={() => {
                            auditStore.update("standards", s.id, { status: active ? "Adopted" : "Active" });
                            syncStdStatus(s.id, active ? "Adopted" : "Active");
                          }}
                            className={`h-5 w-9 rounded-full relative transition-colors shrink-0 ${active ? "bg-foreground" : "bg-muted"}`}>
                            <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-background transition-all ${active ? "left-4" : "left-0.5"}`} />
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{s.code}</div>
                            <div className="text-[11px] text-muted-foreground truncate">{s.title}</div>
                          </div>
                          <WBadge tone={active ? "strong" : "outline"}>{active ? "Active" : "Inactive"}</WBadge>
                          <button onClick={() => {
                            auditStore.remove("standards", s.id);
                            deleteRemote("standards", s.id);
                          }} className="h-6 w-6 grid place-items-center rounded hover:bg-muted text-muted-foreground">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                </div>
              )}
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
      {showStdDialog && <StandardCreateDialog onClose={() => setShowStdDialog(false)} />}
    </ModulePage>
  );
}

async function syncStdStatus(id: string, status: string) {
  try {
    const orgs = await orgsApi.list();
    if (!orgs.length) return;
    const oid = orgs[0].id;
    try {
      await entitiesApi.update(oid, "standards", id, { status });
    } catch (err: any) {
      if (err?.response?.status === 404) {
        const std = auditStore.get("standards", id);
        if (std) {
          const { id: _, ...payload } = std;
          const created = await entitiesApi.create(oid, "standards", { ...payload, status });
          auditStore.update("standards", id, { id: created.id });
        }
      }
    }
  } catch {}
}

async function deleteRemote(entity: string, id: string) {
  try {
    const orgs = await orgsApi.list();
    if (orgs.length > 0) await entitiesApi.delete(orgs[0].id, entity, id);
  } catch {}
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

function StandardCreateDialog({ onClose }: { onClose: () => void }) {
  const [f, setF] = useState({ code: "", title: "", type: "Management System", edition: String(new Date().getFullYear()), status: "Active" });
  const [saving, setSaving] = useState(false);
  async function save() {
    if (!f.code || !f.title) { toast.error("Code and title required"); return; }
    setSaving(true);
    try {
      const orgs = await orgsApi.list();
      if (orgs.length > 0) {
        const created = await entitiesApi.create(orgs[0].id, "standards", f);
        auditStore.create("standards", { ...created, id: created.id }, "");
      } else {
        auditStore.create("standards", f, "STD");
      }
      onClose();
    } catch {
      toast.error("Failed to create standard");
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4" onClick={onClose}>
      <div className="wire-card rounded-lg bg-background w-full max-w-lg p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Create ISO Standard</div>
          <button onClick={onClose} className="h-7 w-7 grid place-items-center rounded border border-border"><X className="h-3.5 w-3.5" /></button>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
          <div className="col-span-2"><Field label="Code*"><input value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} placeholder="ISO 50001:2018" className="h-9 w-full px-2 rounded-md border border-input bg-muted text-xs" /></Field></div>
          <div className="col-span-2"><Field label="Title*"><input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Energy Management Systems — Requirements" className="h-9 w-full px-2 rounded-md border border-input bg-muted text-xs" /></Field></div>
          <Field label="Type">
            <select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })} className="h-9 w-full px-2 rounded-md border border-input bg-muted text-xs">
              {["Management System", "Guideline", "Technical Spec", "Regulation"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Edition"><input value={f.edition} onChange={(e) => setF({ ...f, edition: e.target.value })} className="h-9 w-full px-2 rounded-md border border-input bg-muted text-xs" /></Field>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="h-8 px-3 rounded border border-border text-xs">Cancel</button>
          <button onClick={save} disabled={saving} className="h-8 px-3 rounded bg-foreground text-background text-xs font-medium disabled:opacity-40">{saving ? "Saving..." : "Create Standard"}</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="flex flex-col gap-1"><Annotation>{label}</Annotation>{children}</label>;
}
