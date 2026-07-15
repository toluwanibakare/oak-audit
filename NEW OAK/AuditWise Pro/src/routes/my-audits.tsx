import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { WCard, WBadge, Annotation } from "@/components/wire";
import { auditsApi, type AuditRecord } from "@/lib/api/audits";
import { orgsApi } from "@/lib/api/orgs";
import { useAuth } from "@/hooks/use-auth";
import { RefreshCw, Play, SendHorizonal, CheckCircle, CalendarRange, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/my-audits")({
  head: () => ({ meta: [{ title: "My Assignments — OakAudix" }] }),
  component: MyAssignments,
});

const STATUS_BADGE: Record<string, "strong" | "info" | "outline" | "warning" | undefined> = {
  approved: "info",
  in_progress: "strong",
  under_review: "warning",
  completed: "strong",
};

const STATUS_LABEL: Record<string, string> = {
  approved: "Approved — Ready to Start",
  in_progress: "In Progress",
  under_review: "Under Review",
  completed: "Completed",
};

function MyAssignments() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const orgs = await orgsApi.list();
      if (orgs.length === 0) { setLoading(false); return; }
      const oid = orgs[0].id;
      setOrgId(oid);
      const data = await auditsApi.list(oid, user?.id);
      setAudits(data.filter((a) => !["draft", "pending_approval", "rejected"].includes(a.status)));
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to load assignments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) load(); }, [user]);
  useEffect(() => { if (!user) navigate({ to: "/auth" }); }, [user, navigate]);

  const handleTake = async (audit: AuditRecord) => {
    if (!orgId) return;
    setActionLoading(audit.id);
    try {
      await auditsApi.take(orgId, audit.id);
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.message || e?.message || "Failed to take audit.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmitForReview = async (audit: AuditRecord) => {
    if (!orgId) return;
    setActionLoading(audit.id);
    try {
      await auditsApi.submitForReview(orgId, audit.id);
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.message || e?.message || "Failed to submit for review.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleFinalSubmit = async (audit: AuditRecord) => {
    if (!orgId) return;
    if (!confirm("Finalize this audit? This will mark it as completed.")) return;
    setActionLoading(audit.id);
    try {
      await auditsApi.finalSubmit(orgId, audit.id);
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.message || e?.message || "Failed to finalize audit.");
    } finally {
      setActionLoading(null);
    }
  };

  const isLead = (audit: AuditRecord) => audit.lead_auditor_id === user?.id;

  return (
    <AppShell title="My Assignments" annotation="ASSIGNED AUDITS">
      {loading && (
        <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Loading assignments...
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 text-amber-700 text-xs">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          {error}
          <button onClick={load} className="ml-auto flex items-center gap-1 text-amber-700 hover:text-amber-900 cursor-pointer">
            <RefreshCw className="h-3 w-3" /> Retry
          </button>
        </div>
      )}

      {!loading && audits.length === 0 && (
        <WCard title="No Assignments">
          <div className="text-sm text-muted-foreground">
            You have no active audit assignments. Ask your Lead Auditor to assign you to an audit, or
            <Link to="/audits/new" className="text-primary underline mx-1">create a new audit</Link>
            if you are a Lead Auditor.
          </div>
        </WCard>
      )}

      {!loading && audits.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {audits.map((a) => {
            const busy = actionLoading === a.id;
            return (
              <WCard key={a.id} title={a.title || "Untitled Audit"}
                hint={a.standard || "No standard"}
                actions={<WBadge tone={STATUS_BADGE[a.status]}>{STATUS_LABEL[a.status] || a.status}</WBadge>}>
                <div className="text-xs text-muted-foreground space-y-1">
                  {a.start_date && (
                    <div className="flex items-center gap-1"><CalendarRange className="h-3 w-3" />{a.start_date} → {a.end_date || "ongoing"}</div>
                  )}
                  {a.lead_auditor && (
                    <div><Annotation>Lead</Annotation> {a.lead_auditor.full_name}</div>
                  )}
                  <div><Annotation>Role</Annotation> {isLead(a) ? "Lead Auditor" : "Auditor"}</div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {a.status === "approved" && (
                    <button onClick={() => handleTake(a)} disabled={busy}
                      className="h-8 px-3 inline-flex items-center gap-1.5 rounded-md bg-foreground text-background text-xs font-medium hover:opacity-90 disabled:opacity-50 cursor-pointer">
                      {busy ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                      Take Audit
                    </button>
                  )}
                  {a.status === "in_progress" && (
                    <button onClick={() => handleSubmitForReview(a)} disabled={busy}
                      className="h-8 px-3 inline-flex items-center gap-1.5 rounded-md bg-amber-600 text-white text-xs font-medium hover:opacity-90 disabled:opacity-50 cursor-pointer">
                      {busy ? <RefreshCw className="h-3 w-3 animate-spin" /> : <SendHorizonal className="h-3 w-3" />}
                      Submit for Review
                    </button>
                  )}
                  {a.status === "under_review" && isLead(a) && (
                    <button onClick={() => handleFinalSubmit(a)} disabled={busy}
                      className="h-8 px-3 inline-flex items-center gap-1.5 rounded-md bg-emerald-600 text-white text-xs font-medium hover:opacity-90 disabled:opacity-50 cursor-pointer">
                      {busy ? <RefreshCw className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                      Final Submit
                    </button>
                  )}
                  {a.status === "under_review" && !isLead(a) && (
                    <span className="h-8 px-3 inline-flex items-center gap-1.5 rounded-md bg-muted text-xs text-muted-foreground">
                      Awaiting Lead Auditor
                    </span>
                  )}
                  {a.status === "completed" && (
                    <span className="h-8 px-3 inline-flex items-center gap-1.5 rounded-md bg-muted text-xs text-muted-foreground">
                      <CheckCircle className="h-3 w-3 text-emerald-500" /> Completed
                    </span>
                  )}
                </div>
              </WCard>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
