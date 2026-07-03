import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, AlertTriangle, Send, ShieldAlert, Upload, X, FileText, Image, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { findingsApi } from "@/api/findings";
import { getClauseRequirement } from "@/data/isoClauses";
import logo from "@/assets/logo.png";

interface EvidenceItem {
  url: string;
  name: string;
}

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
  const [standardRequirement, setStandardRequirement] = useState("");

  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);

  useEffect(() => {
    if (!findingId) return;
    loadFinding();
  }, [findingId]);

  const loadFinding = async () => {
    setLoading(true);
    try {
      const data = await findingsApi.get(findingId!);

      setFinding(data);
      setAudit(data.audit);

      const meta = parseFindingMeta(data.root_cause);
      setCorrection(meta?.correction ?? "");
      setRootCauseText(meta?.rootCauseText ?? "");
      setCapa(data.capa ?? "");
      setEvidence((meta?.evidence || []).map((e: any) => {
        if (typeof e === 'string') {
          try { return JSON.parse(e); } catch { return { url: e, name: e.split('/').pop() || 'File' }; }
        }
        return e;
      }));

      const matchedClause = getClauseRequirement(data.audit?.standard, data.clause);
      const reqText = meta?.standardRequirement || (matchedClause ? matchedClause.requirement : "");
      setStandardRequirement(reqText);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !findingId) return;

    setUploadingEvidence(true);
    try {
      const result = await findingsApi.uploadEvidence(findingId, file);
      setEvidence((prev) => [...prev, { url: result.url, name: result.name }]);
      toast({ title: "File uploaded", description: result.name });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message || "Could not upload file.", variant: "destructive" });
    } finally {
      setUploadingEvidence(false);
      e.target.value = "";
    }
  };

  const removeEvidence = (index: number) => {
    setEvidence((prev) => prev.filter((_, i) => i !== index));
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
      await findingsApi.submitCar(findingId!, {
        correction: correction.trim(),
        root_cause_text: rootCauseText.trim(),
        capa: capa.trim(),
        evidence: evidence.map((e) => JSON.stringify({ url: e.url, name: e.name })),
      });
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

  const Footer = () => (
    <div className="pt-8 pb-6 text-center border-t border-border/30">
      <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground/50">
        <span>&copy; {new Date().getFullYear()} OakAudix.</span>
        <span className="mx-1.5">&middot;</span>
        <span>
          Built by{" "}
          <a
            href="https://www.tmb.it.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary/60 hover:text-primary transition-colors underline underline-offset-2"
          >
            TMB <ExternalLink className="inline h-2.5 w-2.5" />
          </a>
        </span>
        <span className="mx-1.5">&middot;</span>
        <span>Powered By Oak Global International</span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground font-medium">Loading CAR workspace...</p>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50/80 via-white to-slate-50/60 dark:from-background dark:via-background dark:to-background p-4 font-sans">
        <div className="w-full max-w-lg rounded-3xl border border-border bg-card shadow-elevated overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-primary/30 via-primary to-primary/30" />
          <div className="p-8 sm:p-10 text-center space-y-7">

            {/* Checkmark */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success ring-8 ring-success/5">
              <CheckCircle2 className="h-9 w-9" />
            </div>

            {/* Text */}
            <div className="space-y-3 max-w-sm mx-auto">
              <h2 className="font-display text-2xl font-extrabold text-foreground tracking-tight">
                Action Plan Submitted
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your corrective action plan has been received and will be reviewed by the auditor.
                You will be notified if any further updates are needed.
              </p>
            </div>

            {/* Key details */}
            {audit && (
              <div className="bg-secondary/20 border border-border/40 rounded-2xl p-4 text-left space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Audit</span>
                  <span className="text-foreground font-semibold text-right max-w-[60%] truncate">{audit.title}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Standard</span>
                  <span className="text-foreground font-semibold uppercase">{audit.standard}</span>
                </div>
                {finding?.clause && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground font-medium">Clause</span>
                    <span className="text-foreground font-semibold font-mono">{finding.clause}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Status</span>
                  <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    Under Review
                  </span>
                </div>
              </div>
            )}

            <Footer />
          </div>
        </div>
      </div>
    );
  }

  if (!finding) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4 font-sans">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-10 text-center shadow-elevated space-y-4">
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
  const resolvedReq = standardRequirement || meta?.standardRequirement || "";
  const isClosed = finding.status === "closed";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50/80 via-white to-slate-50/60 dark:from-background dark:via-background dark:to-background font-sans">
      {/* Decorative top bar */}
      <div className="h-1 w-full bg-gradient-to-r from-primary/40 via-primary/60 to-primary/40" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-7">

        {/* ── Brand Header ─────────────────────────────────── */}
        <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-primary/30 via-primary to-primary/30" />
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-5">
              <div className="shrink-0">
                <img
                  src={logo}
                  alt="OakAudix"
                  className="h-11 w-auto object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-[10px] font-mono font-bold bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-md text-primary uppercase tracking-wider">
                    Auditee Portal
                  </span>
                  {isClosed && (
                <span className="text-[10px] font-mono font-bold bg-success/10 border border-success/25 px-2.5 py-1 rounded-md text-success uppercase tracking-wider">
                  Approved / Closed
                </span>
                  )}
                </div>
                <h1 className="mt-2 font-display text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                  OakAudix
                </h1>
                <p className="text-[10px] tracking-wide text-muted-foreground/70 mt-0.5 font-medium uppercase">
                  Powered By Oak Global International
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border/40 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="font-semibold">{audit?.title}</span>
              <span className="text-muted-foreground/40">&bull;</span>
              <span className="font-mono text-[11px] uppercase tracking-wider">{audit?.standard?.toUpperCase()} Standard</span>
              {finding.clause && (
                <>
                  <span className="text-muted-foreground/40">&bull;</span>
                  <span>Clause {finding.clause}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Auditor Rejection Comment Alert ─────────────── */}
        {finding.auditor_comment && !isClosed && (
          <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-5 sm:p-6 flex items-start gap-4">
            <div className="p-2 rounded-xl bg-destructive/10 text-destructive mt-0.5 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-destructive mb-1.5">Feedback / Action Required by Auditor:</h4>
              <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {finding.auditor_comment}
              </p>
            </div>
          </div>
        )}

        {/* ── Finding Details Card ─────────────────────────── */}
        <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden">
          <div className="px-6 sm:px-8 py-5 border-b border-border/50">
            <h3 className="font-display text-sm font-bold text-foreground uppercase tracking-wider">
              Discrepancy &amp; Non-Conformity Details
            </h3>
          </div>
          <div className="p-6 sm:p-8 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <DetailBlock label="Clause Number" mono>{finding.clause || "N/A"}</DetailBlock>
              <DetailBlock label="Severity / Classification" capitalize>
                {finding.type}
              </DetailBlock>
            </div>

            <DetailBlock label="Objective Evidence / Statement of Problem" fullWidth>
              {finding.description}
            </DetailBlock>

            {meta?.nonConformityStatement && (
              <DetailBlock label="Statement of Non-Conformity" fullWidth>
                {meta.nonConformityStatement}
              </DetailBlock>
            )}

            {resolvedReq && (
              <DetailBlock label="Requirement of the Standard Not Met" fullWidth>
                {resolvedReq}
              </DetailBlock>
            )}
          </div>
        </div>

        {/* ── Action Plan Form ────────────────────────────── */}
        <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden">
          <div className="px-6 sm:px-8 py-5 border-b border-border/50">
            <h3 className="font-display text-sm font-bold text-foreground uppercase tracking-wider">
              Corrective Action Plan Response
            </h3>
          </div>
          <div className="p-6 sm:p-8">
            {isClosed ? (
              <div className="space-y-5">
                <ReadOnlyField label="Correction / Containment Action" value={correction} />
                <ReadOnlyField label="Root Cause Analysis (RCA)" value={rootCauseText} />
                <ReadOnlyField label="Corrective Action Plan (CAPA)" value={capa} />
                {evidence.length > 0 && (
                  <div>
                    <span className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Evidence Attachments</span>
                    <div className="space-y-2">
                      {evidence.map((ev, i) => (
                        <a
                          key={i}
                          href={ev.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2.5 p-3 bg-secondary/20 border border-border/40 rounded-xl text-xs text-primary hover:bg-primary/5 transition-colors"
                        >
                          {ev.url.match(/\.(png|jpg|jpeg|gif|webp|svg)/i) ? (
                            <Image className="h-4 w-4 shrink-0" />
                          ) : (
                            <FileText className="h-4 w-4 shrink-0" />
                          )}
                          <span className="truncate">{ev.name}</span>
                          <ExternalLink className="h-3 w-3 ml-auto shrink-0 text-muted-foreground/50" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <FormField label="Correction / Containment Action (Immediate containment)" required>
                  <textarea
                    className="input min-h-[100px] w-full text-xs"
                    placeholder="Describe immediate actions taken to contain, isolate, or neutralize the issue..."
                    value={correction}
                    onChange={(e) => setCorrection(e.target.value)}
                    required
                  />
                </FormField>

                <FormField label="Root Cause Analysis (RCA)" required>
                  <textarea
                    className="input min-h-[100px] w-full text-xs"
                    placeholder="Detail the procedural, human, or systemic root causes behind the discrepancy..."
                    value={rootCauseText}
                    onChange={(e) => setRootCauseText(e.target.value)}
                    required
                  />
                </FormField>

                <FormField label="Corrective Action Plan (CAR / CAPA)" required>
                  <textarea
                    className="input min-h-[100px] w-full text-xs"
                    placeholder="Describe the long-term corrective action planned to prevent recurrence..."
                    value={capa}
                    onChange={(e) => setCapa(e.target.value)}
                    required
                  />
                </FormField>

                {/* Evidence */}
                <div className="pt-4 border-t border-border/60">
                  <label className="mb-2 block text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Supporting Evidence
                  </label>
                  {evidence.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {evidence.map((ev, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 p-2.5 bg-secondary/30 border border-border/50 rounded-xl text-xs group"
                        >
                          {ev.url.match(/\.(png|jpg|jpeg|gif|webp|svg)/i) ? (
                            <img src={ev.url} alt={ev.name} className="h-8 w-8 rounded-lg object-cover" />
                          ) : (
                            <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                          )}
                          <span className="max-w-[130px] truncate text-foreground/80">{ev.name}</span>
                          <button
                            type="button"
                            onClick={() => removeEvidence(i)}
                            className="p-0.5 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <label className="relative inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-primary border border-primary/30 rounded-xl px-4 py-2.5 hover:bg-primary/5 transition-colors">
                    <Upload className="h-4 w-4" />
                    {uploadingEvidence ? "Uploading..." : "Upload File"}
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleFileUpload}
                      disabled={uploadingEvidence}
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                    />
                  </label>
                  <p className="mt-2 text-[10px] text-muted-foreground/50">
                    Accepted: Images, PDF, DOC, XLS &mdash; max 100MB per file
                  </p>
                </div>

                {/* Submit */}
                <div className="flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3 pt-4 border-t border-border/60">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="pill-cta px-7 py-3 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    {submitting ? "Sending..." : "Send Back to Auditor"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* ── Footer ────────────────────────────────────────── */}
        <Footer />

      </div>
    </div>
  );
}

/* ─── Helper Components ───────────────────────────────── */

function DetailBlock({
  label,
  children,
  mono,
  capitalize,
  fullWidth,
}: {
  label: string;
  children: React.ReactNode;
  mono?: boolean;
  capitalize?: boolean;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? "md:col-span-2" : ""}>
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">{label}</span>
      <div
        className={`p-3.5 bg-secondary/20 border border-border/30 rounded-xl text-foreground font-medium leading-relaxed ${
          mono ? "font-mono" : ""
        } ${capitalize ? "capitalize" : ""}`}
      >
        {children}
      </div>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">{label}</span>
      <div className="p-4 bg-secondary/10 border border-border/30 rounded-xl text-foreground/80 text-xs whitespace-pre-wrap leading-relaxed">
        {value || "—"}
      </div>
    </div>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
        {label}{required && <span className="text-destructive ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
