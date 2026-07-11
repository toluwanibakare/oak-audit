import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ModulePage, WCard, Annotation, WBadge } from "@/components/module-page";
import { auditStore, useAuditStore } from "@/lib/audit-store";
import { toast } from "sonner";
import { Save, RotateCcw, Check } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — AuditOS" }, { name: "description", content: "Configure organization, standards, workflows and integrations." }] }),
  component: Page,
});

type Settings = {
  organization: {
    orgName: string; industry: string; region: string; taxId: string;
    timezone: string; fiscalStart: string; dateFormat: string; language: string;
  };
  standards: Record<string, boolean>;
  workflows: { requireMRApproval: boolean; autoAssignActions: boolean; ncDueDays: number; reminderCadence: string };
  notifications: { email: boolean; inApp: boolean; digest: string; escalation: boolean };
  integrations: Record<string, boolean>;
  branding: { primary: string; accent: string; logoLabel: string };
  security: { mfa: boolean; sessionMins: number; passwordDays: number; ssoProvider: string };
};

const DEFAULT: Settings = {
  organization: { orgName: "Acme Industries GmbH", industry: "Manufacturing", region: "EMEA", taxId: "DE812345678", timezone: "Europe/Berlin", fiscalStart: "January", dateFormat: "YYYY-MM-DD", language: "English (UK)" },
  standards: { "ISO 9001:2015": true, "ISO 14001:2015": true, "ISO 45001:2018": true, "ISO/IEC 27001:2022": false, "ISO 22301:2019": false, "ISO 50001:2018": false },
  workflows: { requireMRApproval: true, autoAssignActions: true, ncDueDays: 21, reminderCadence: "Weekly" },
  notifications: { email: true, inApp: true, digest: "Daily", escalation: true },
  integrations: { "SharePoint": true, "Microsoft Teams": true, "Slack": false, "Jira": false, "SAP S/4HANA": true, "Power BI": false },
  branding: { primary: "#111111", accent: "#666666", logoLabel: "AuditOS" },
  security: { mfa: true, sessionMins: 60, passwordDays: 90, ssoProvider: "Azure AD" },
};

const SECTIONS = ["General", "Organization", "Standards", "Workflows", "Notifications", "Integrations", "Branding", "Security", "Audit Log"] as const;
type Section = typeof SECTIONS[number];

function Page() {
  const stored: any = useAuditStore((s) => s.collections.settings?.["singleton"]);
  const [settings, setSettings] = useState<Settings>(stored?.data ?? DEFAULT);
  const [section, setSection] = useState<Section>("General");
  const [dirty, setDirty] = useState(false);

  useEffect(() => { if (stored?.data) setSettings(stored.data); /* eslint-disable-next-line */ }, []);

  function patch<K extends keyof Settings>(k: K, v: Partial<Settings[K]>) {
    setSettings((s) => ({ ...s, [k]: { ...s[k], ...v } as any }));
    setDirty(true);
  }
  function toggleMap<K extends "standards" | "integrations">(k: K, key: string) {
    setSettings((s) => ({ ...s, [k]: { ...s[k], [key]: !s[k][key] } }));
    setDirty(true);
  }
  function save() {
    if (auditStore.get("settings", "singleton")) auditStore.update("settings", "singleton", { data: settings });
    else auditStore.create("settings", { id: "singleton", data: settings }, "SET");
    setDirty(false);
    toast.success("Settings saved");
  }
  function reset() { setSettings(DEFAULT); setDirty(true); toast("Reverted to defaults"); }

  return (
    <ModulePage annotation="12 · SETTINGS" title="Settings">
      <div className="grid grid-cols-12 gap-4">
        <WCard className="col-span-12 md:col-span-3" title="Sections">
          {SECTIONS.map((s) => (
            <button key={s} onClick={() => setSection(s)}
              className={`w-full text-left px-2 py-1.5 rounded text-xs ${section === s ? "bg-foreground text-background font-medium" : "hover:bg-muted/50"}`}>{s}</button>
          ))}
          <div className="border-t border-border mt-3 pt-3 flex flex-col gap-2">
            <button onClick={save} disabled={!dirty} className="h-8 rounded bg-foreground text-background text-xs font-medium inline-flex items-center justify-center gap-1.5 disabled:opacity-40"><Save className="h-3.5 w-3.5" /> Save changes</button>
            <button onClick={reset} className="h-8 rounded border border-border text-xs inline-flex items-center justify-center gap-1.5"><RotateCcw className="h-3.5 w-3.5" /> Reset to defaults</button>
            {dirty && <div className="annotation text-destructive/80">↳ Unsaved changes</div>}
          </div>
        </WCard>

        <div className="col-span-12 md:col-span-9 space-y-4">
          {(section === "General" || section === "Organization") && (
            <WCard title={section === "General" ? "General Settings" : "Organization"}>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <TxtField label="Organization Name" v={settings.organization.orgName} on={(x) => patch("organization", { orgName: x })} />
                <TxtField label="Industry" v={settings.organization.industry} on={(x) => patch("organization", { industry: x })} />
                <TxtField label="Region" v={settings.organization.region} on={(x) => patch("organization", { region: x })} />
                <TxtField label="Tax / VAT ID" v={settings.organization.taxId} on={(x) => patch("organization", { taxId: x })} />
                <SelField label="Time Zone" v={settings.organization.timezone} opts={["Europe/Berlin","Europe/London","America/New_York","Asia/Singapore","Asia/Tokyo"]} on={(x) => patch("organization", { timezone: x })} />
                <SelField label="Fiscal Year Start" v={settings.organization.fiscalStart} opts={["January","April","July","October"]} on={(x) => patch("organization", { fiscalStart: x })} />
                <SelField label="Date Format" v={settings.organization.dateFormat} opts={["YYYY-MM-DD","DD/MM/YYYY","MM/DD/YYYY"]} on={(x) => patch("organization", { dateFormat: x })} />
                <SelField label="Language" v={settings.organization.language} opts={["English (UK)","English (US)","Deutsch","Français","Español","中文"]} on={(x) => patch("organization", { language: x })} />
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
              <button onClick={() => { auditStore.notify({ channel: "email", to: settings.organization.orgName, subject: "Test notification", body: "Notification settings are working." }); }}
                className="mt-3 h-8 px-3 rounded border border-border text-xs">Send test notification</button>
            </WCard>
          )}

          {section === "Integrations" && (
            <WCard title="Integrations">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {Object.entries(settings.integrations).map(([name, on]) => (
                  <div key={name} className="rounded border border-border p-3 flex items-center gap-3">
                    <div className="h-9 w-9 rounded wire-box shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{name}</div>
                      <Annotation>{on ? "Connected" : "Not connected"}</Annotation>
                    </div>
                    <button onClick={() => toggleMap("integrations", name)}
                      className={`h-8 px-3 rounded text-xs font-medium ${on ? "bg-foreground text-background" : "border border-border"}`}>
                      {on ? "Disconnect" : "Connect"}
                    </button>
                  </div>
                ))}
              </div>
            </WCard>
          )}

          {section === "Branding" && (
            <WCard title="Branding">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <TxtField label="Wordmark" v={settings.branding.logoLabel} on={(x) => patch("branding", { logoLabel: x })} />
                <div />
                <ColorField label="Primary color" v={settings.branding.primary} on={(x) => patch("branding", { primary: x })} />
                <ColorField label="Accent color" v={settings.branding.accent} on={(x) => patch("branding", { accent: x })} />
              </div>
              <div className="mt-3 rounded border border-border p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded" style={{ background: settings.branding.primary }} />
                <div className="text-lg font-semibold">{settings.branding.logoLabel}</div>
                <div className="ml-auto h-6 w-6 rounded" style={{ background: settings.branding.accent }} />
              </div>
            </WCard>
          )}

          {section === "Security" && (
            <WCard title="Security">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <ToggleField label="Require MFA for all users" v={settings.security.mfa} on={(x) => patch("security", { mfa: x })} />
                <SelField label="SSO Provider" v={settings.security.ssoProvider} opts={["None","Azure AD","Okta","Google Workspace"]} on={(x) => patch("security", { ssoProvider: x })} />
                <NumField label="Session timeout (minutes)" v={settings.security.sessionMins} on={(x) => patch("security", { sessionMins: x })} />
                <NumField label="Password rotation (days)" v={settings.security.passwordDays} on={(x) => patch("security", { passwordDays: x })} />
              </div>
            </WCard>
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
    <button onClick={() => on(!v)} className="flex items-center gap-3 rounded border border-border p-2 text-left">
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
function ColorField({ label, v, on }: { label: string; v: string; on: (v: string) => void }) {
  return <label className="flex flex-col gap-1"><Annotation>{label}</Annotation>
    <div className="flex items-center gap-2">
      <input type="color" value={v} onChange={(e) => on(e.target.value)} className="h-9 w-12 rounded border border-input bg-muted/30" />
      <input value={v} onChange={(e) => on(e.target.value)} className="h-9 px-2 rounded-md border border-input bg-muted/30 text-xs flex-1" />
    </div></label>;
}
