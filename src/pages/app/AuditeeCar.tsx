import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, AlertTriangle, Send, ShieldAlert, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getClauseRequirement } from "@/data/isoClauses";

export default function AuditeeCar() {
  const { findingId } = useParams();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [finding, setFinding] = useState<any | null>(null);
  const [audit, setAudit] = useState<any | null>(null);
  
  const [correction, setCorrection] = useState("");
  const [rootCauseText, setRootCauseText] = useState("");
  const [capa, setCapa] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!findingId) return;
    loadFinding();
  }, [findingId]);

  const loadFinding = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("findings")
        .select("*, audits(title, standard, auditee_name, auditee_email)")
        .eq("id", findingId)
        .single();
      
      if (error || !data) throw error || new Error("Finding not found");
      
      setFinding(data);
      setAudit(data.audits);
      
      const meta = parseFindingMeta(data.root_cause);
      setCorrection(meta?.correction ?? "");
      setRootCauseText(meta?.rootCauseText ?? "");
      setCapa(data.capa ?? "");
    } catch (err: any) {
      toast({
        title: "Error loading finding",
        description: err.message || "Failed to load the finding details. Please check the URL.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const parseFindingMeta = (rootCause: string | null) => {
    if (!rootCause?.startsWith("AUTO_META:")) {
      if (rootCause?.startsWith("AUTO_FINDING:")) {
        try {
          return JSON.parse(rootCause.slice("AUTO_FINDING:".length));
        } catch {
          return null;
        }
      }
      return null;
    }
    try {
      return JSON.parse(rootCause.slice("AUTO_META:".length));
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!findingId || !finding) return;
    
    if (!correction.trim() || !rootCauseText.trim() || !capa.trim()) {
      toast({
        title: "Incomplete Fields",
        description: "All fields (Correction, RCA, and Corrective Action Plan) are required.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const meta = parseFindingMeta(finding.root_cause) || {};
      const updatedMeta = {
        ...meta,
        correction: correction.trim(),
        rootCauseText: rootCauseText.trim(),
        nonConformityStatement: meta.nonConformityStatement || "",
        standardRequirement: meta.standardRequirement || "",
      };

      const rootCausePayload = `AUTO_META:${JSON.stringify(updatedMeta)}`;

      const { error } = await supabase
        .from("findings")
        .update({
          capa: capa.trim(),
          root_cause: rootCausePayload,
          status: "under_review" // Mark as under review so auditor can evaluate
        })
        .eq("id", findingId);

      if (error) throw error;
      setDone(true);
      toast({
        title: "Action Plan Submitted",
        description: "Your corrective action plan has been sent back to the auditor for review."
      });
    } catch (err: any) {
      toast({
        title: "Submission failed",
        description: err.message || "An error occurred while saving your response.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground font-semibold">Loading CAR workspace...</p>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4 font-sans">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-elevated space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success/15 text-success">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-extrabold text-foreground">Action Plan Sent!</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your Corrective Action Plan has been successfully submitted to the auditor. 
              They will review and close the finding if approved, or return it if updates are needed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!finding) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4 font-sans">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-elevated space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="font-display text-lg font-bold text-foreground">Finding Not Found</h2>
          <p className="text-xs text-muted-foreground">
            The link you followed may be invalid, or the finding has been deleted.
          </p>
        </div>
      </div>
    );
  }

  const meta = parseFindingMeta(finding.root_cause);
  const stdKey = audit?.standard;
  const clauseNum = finding.clause;
  const matchedClause = getClauseRequirement(stdKey, clauseNum);
  const resolvedReq = meta?.standardRequirement || (matchedClause ? matchedClause.requirement : "");
  const isClosed = finding.status === "closed";

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 dark:bg-background font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold bg-primary/10 border border-primary/20 px-2 py-0.5 rounded text-primary uppercase tracking-wider">
                Auditee Portal
              </span>
              {isClosed && (
                <span className="text-[10px] font-mono font-bold bg-success/15 px-2 py-0.5 rounded text-success uppercase tracking-wider">
                  Closed / Resolved
                </span>
              )}
            </div>
            <h1 className="mt-2 font-display text-2xl font-extrabold text-foreground">{audit?.title || "Audit Finding"}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Standard Checklist: {audit?.standard?.toUpperCase()}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-secondary/50 flex items-center justify-center text-muted-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>

        {/* Auditor Rejection Comment Alert */}
        {finding.auditor_comment && !isClosed && (
          <div className="bg-destructive/5 border border-destructive/30 rounded-2xl p-5 flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-destructive/10 text-destructive mt-0.5">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-destructive">Feedback / Action Required by Auditor:</h4>
              <p className="mt-1.5 text-xs text-foreground/80 leading-relaxed font-mono whitespace-pre-wrap">
                {finding.auditor_comment}
              </p>
            </div>
          </div>
        )}

        {/* Finding Details Card */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-5">
          <h3 className="font-display text-base font-bold pb-3 border-b border-border/80">1. Discrepancy & Non-Conformity Details</h3>
          
          <div className="grid gap-4 md:grid-cols-2 text-xs">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Clause Number</span>
              <div className="p-3 bg-secondary/30 rounded-xl font-mono font-bold text-foreground">
                {finding.clause || "N/A"}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Severity / Classification</span>
              <div className="p-3 bg-secondary/30 rounded-xl font-bold capitalize text-foreground">
                {finding.type}
              </div>
            </div>

            <div className="md:col-span-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Objective Evidence / Statement of Problem</span>
              <div className="p-4 bg-secondary/30 rounded-xl text-foreground font-medium leading-relaxed">
                {finding.description}
              </div>
            </div>

            {meta?.nonConformityStatement && (
              <div className="md:col-span-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Statement of Non-Conformity</span>
                <div className="p-4 bg-secondary/30 rounded-xl text-foreground font-medium leading-relaxed">
                  {meta.nonConformityStatement}
                </div>
              </div>
            )}

            {resolvedReq && (
              <div className="md:col-span-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Requirement of the Standard Not Met</span>
                <div className="p-4 bg-secondary/30 rounded-xl text-foreground font-medium leading-relaxed">
                  {resolvedReq}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Plan Form */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-5">
          <h3 className="font-display text-base font-bold pb-3 border-b border-border/80">2. Corrective Action Plan Response</h3>
          
          {isClosed ? (
            <div className="space-y-4 text-xs font-sans text-muted-foreground leading-relaxed">
              <div>
                <span className="block font-bold text-foreground uppercase mb-1">Correction / Containment Action</span>
                <div className="p-4 bg-secondary/10 border border-border/40 rounded-xl text-foreground/80 whitespace-pre-wrap">{correction || "—"}</div>
              </div>
              <div>
                <span className="block font-bold text-foreground uppercase mb-1">Root Cause Analysis (RCA)</span>
                <div className="p-4 bg-secondary/10 border border-border/40 rounded-xl text-foreground/80 whitespace-pre-wrap">{rootCauseText || "—"}</div>
              </div>
              <div>
                <span className="block font-bold text-foreground uppercase mb-1">Corrective Action Plan (CAPA)</span>
                <div className="p-4 bg-secondary/10 border border-border/40 rounded-xl text-foreground/80 whitespace-pre-wrap">{capa || "—"}</div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="mb-1 block font-bold uppercase tracking-wider text-muted-foreground">
                  Correction / Containment Action (Immediate containment) <span className="text-destructive">*</span>
                </label>
                <textarea
                  className="input min-h-[90px] w-full"
                  placeholder="Describe immediate actions taken to contain, isolate, or neutralize the issue..."
                  value={correction}
                  onChange={(e) => setCorrection(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block font-bold uppercase tracking-wider text-muted-foreground">
                  Root Cause Analysis (RCA) <span className="text-destructive">*</span>
                </label>
                <textarea
                  className="input min-h-[90px] w-full"
                  placeholder="Detail the procedural, human, or systemic root causes behind the discrepancy..."
                  value={rootCauseText}
                  onChange={(e) => setRootCauseText(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block font-bold uppercase tracking-wider text-muted-foreground">
                  Corrective Action Plan (CAR / CAPA) <span className="text-destructive">*</span>
                </label>
                <textarea
                  className="input min-h-[90px] w-full"
                  placeholder="Describe the long-term corrective action planned to prevent recurrence..."
                  value={capa}
                  onChange={(e) => setCapa(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end pt-2 border-t border-border">
                <button
                  type="submit"
                  disabled={submitting}
                  className="pill-cta px-6 py-2.5 text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  {submitting ? "Sending..." : "Send Back to Auditor"}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
