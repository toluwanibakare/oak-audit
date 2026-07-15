import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { orgsApi } from "@/lib/api/orgs";
import { auditsApi, type ApprovalStageRecord } from "@/lib/api/audits";
import { ShieldCheck, Check, X, Clock, Mail, Building, FileText, Calendar } from "lucide-react";

export const Route = createFileRoute("/audits/$auditId/approval")({
  head: () => ({ meta: [{ title: "Audit Approval — OakAudix" }] }),
  component: ApprovalReviewPage,
});

function ApprovalReviewPage() {
  const { auditId } = Route.useParams();
  const [audit, setAudit] = useState<any>(null);
  const [stages, setStages] = useState<ApprovalStageRecord[]>([]);
  const [myStage, setMyStage] = useState<ApprovalStageRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const orgs = await orgsApi.list();
        if (orgs.length === 0) return;
        const data = await auditsApi.getApprovals(orgs[0].id, auditId);
        setAudit(data.audit);
        setStages(data.stages);
        // Pick the first stage that's "notified" or "in_review"
        const current = data.stages.find((s) => s.status === "notified" || s.status === "in_review");
        setMyStage(current ?? null);
      } catch (e) {
        console.error("[approval] failed to load", e);
        setError("Could not load audit approval details.");
      } finally {
        setLoading(false);
      }
    })();
  }, [auditId]);

  const handleApprove = async () => {
    if (!myStage) return;
    setSubmitting(true);
    setError("");
    try {
      const orgs = await orgsApi.list();
      if (orgs.length === 0) return;
      const res = await auditsApi.approveStage(orgs[0].id, auditId, myStage.id, comment || undefined);
      setStages(res.stages);
      setSubmitted(true);
    } catch (e: any) {
      setError(e?.response?.data?.error || "Failed to approve.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!myStage) return;
    if (!comment.trim()) { setError("Please provide a reason for rejection."); return; }
    setSubmitting(true);
    setError("");
    try {
      const orgs = await orgsApi.list();
      if (orgs.length === 0) return;
      const res = await auditsApi.rejectStage(orgs[0].id, auditId, myStage.id, comment);
      setStages(res.stages);
      setSubmitted(true);
    } catch (e: any) {
      setError(e?.response?.data?.error || "Failed to reject.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh grid place-items-center bg-gradient-to-br from-muted to-background p-4">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 rounded-full bg-muted animate-pulse mx-auto" />
          <p className="text-sm text-muted-foreground">Loading approval details...</p>
        </div>
      </div>
    );
  }

  if (error && !audit) {
    return (
      <div className="min-h-dvh grid place-items-center bg-gradient-to-br from-muted to-background p-4">
        <div className="w-full max-w-md text-center space-y-4">
          <div className="h-14 w-14 rounded-full bg-destructive/10 mx-auto grid place-items-center"><X className="h-6 w-6 text-destructive" /></div>
          <h1 className="text-lg font-semibold">Unable to load</h1>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Link to="/" className="inline-flex h-9 px-4 items-center rounded-md bg-foreground text-background text-sm font-medium">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  const auditStatus = stages.every((s) => s.status === "approved") ? "approved" :
    stages.some((s) => s.status === "rejected") ? "rejected" :
    "pending";

  return (
    <div className="min-h-dvh bg-gradient-to-br from-muted to-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className={`h-14 w-14 rounded-full mx-auto grid place-items-center ${
            auditStatus === "approved" ? "bg-green-100" :
            auditStatus === "rejected" ? "bg-destructive/10" : "bg-muted"
          }`}>
            {auditStatus === "approved" ? <Check className="h-6 w-6 text-green-600" /> :
             auditStatus === "rejected" ? <X className="h-6 w-6 text-destructive" /> :
             <ShieldCheck className="h-6 w-6 text-foreground/60" />}
          </div>
          <h1 className="text-xl font-semibold">Audit Approval</h1>
          <p className="text-sm text-muted-foreground">
            {auditStatus === "approved" ? "All approvals received. Audit can proceed." :
             auditStatus === "rejected" ? "Audit was rejected." :
             "Review and respond to the audit approval request."}
          </p>
        </div>

        {/* Audit details */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium"><FileText className="h-4 w-4 text-muted-foreground" />{audit.title}</div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div><span className="text-muted-foreground">Standard</span><p className="font-medium">{audit.standard}</p></div>
            <div><span className="text-muted-foreground">Scope</span><p className="font-medium">{audit.scope || "—"}</p></div>
            <div><span className="text-muted-foreground">Organization</span><p className="font-medium">{audit.organization?.name || "—"}</p></div>
            <div><span className="text-muted-foreground">Status</span><p className="font-medium capitalize">{audit.status?.replace(/_/g, " ")}</p></div>
          </div>
        </div>

        {/* Approval stages */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h2 className="text-sm font-medium flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" />Approval Stages</h2>
          <div className="space-y-2">
            {stages.map((s, i) => (
              <div key={s.id} className={`flex items-center gap-3 p-3 rounded-lg border text-sm ${
                s.id === myStage?.id ? "border-foreground/30 bg-muted/50" : "border-border"
              }`}>
                <div className={`h-7 w-7 rounded-full grid place-items-center text-xs font-semibold shrink-0 ${
                  s.status === "approved" ? "bg-green-100 text-green-700" :
                  s.status === "rejected" ? "bg-destructive/10 text-destructive" :
                  s.id === myStage?.id ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
                }`}>
                  {s.status === "approved" ? <Check className="h-3.5 w-3.5" /> :
                   s.status === "rejected" ? <X className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{s.stage}</div>
                  <div className="text-[11px] text-muted-foreground">{s.approver_name} · {s.approver_email}</div>
                </div>
                <span className={`text-[11px] font-medium capitalize ${
                  s.status === "approved" ? "text-green-600" :
                  s.status === "rejected" ? "text-destructive" :
                  s.status === "notified" || s.status === "in_review" ? "text-amber-600" : "text-muted-foreground"
                }`}>{s.status.replace(/_/g, " ")}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action area */}
        {myStage && !submitted && (
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-sm font-medium">Your Response</h2>
            <p className="text-xs text-muted-foreground">
              You are assigned as <strong className="text-foreground">{myStage.stage}</strong>. Please review the audit and provide your decision.
            </p>
            <textarea
              className="w-full min-h-[80px] p-3 rounded-lg border border-input bg-muted/30 text-sm outline-none focus:border-ring"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment (required for rejection)..."
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
            <div className="flex gap-2">
              <button onClick={handleReject} disabled={submitting}
                className="h-9 px-4 rounded-lg border border-destructive text-destructive text-sm font-medium disabled:opacity-40 hover:bg-destructive/5">
                {submitting ? "Processing..." : "Reject"}
              </button>
              <button onClick={handleApprove} disabled={submitting}
                className="h-9 px-4 rounded-lg bg-foreground text-background text-sm font-medium disabled:opacity-40">
                {submitting ? "Processing..." : "Approve"}
              </button>
            </div>
          </div>
        )}

        {submitted && (
          <div className="rounded-xl border border-border bg-card p-5 text-center space-y-3">
            <div className="h-10 w-10 rounded-full bg-green-100 mx-auto grid place-items-center"><Check className="h-5 w-5 text-green-600" /></div>
            <p className="text-sm font-medium">Response recorded</p>
            <p className="text-xs text-muted-foreground">Thank you. The audit creator has been notified.</p>
            <Link to="/" className="inline-flex h-9 px-4 items-center rounded-md bg-foreground text-background text-sm font-medium">Go to Dashboard</Link>
          </div>
        )}

        <p className="text-center text-[11px] text-muted-foreground">
          <Mail className="h-3 w-3 inline mr-1" />OakAudix &bull; Powered by Oak Global International
        </p>
      </div>
    </div>
  );
}
