import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import apiClient from "@/lib/api/client";
import { Mail, CheckCircle2, XCircle, RefreshCw, KeyRound } from "lucide-react";

export const Route = createFileRoute("/accept-invite/$token")({
  head: () => ({ meta: [{ title: "Accept Invitation — OakAudix" }] }),
  component: Page,
});

function Page() {
  const { token } = Route.useParams();
  const [step, setStep] = useState<"validating" | "otp" | "success" | "error">("validating");
  const [message, setMessage] = useState("");
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.post<{ message: string }>(`/team-members/accept-invite/${token}`);
        setMessage(res.data.message);
        setStep("success");
      } catch (e: any) {
        if (e?.response?.status === 422 && e?.response?.data?.needs_otp) {
          setStep("otp");
        } else {
          setMessage(e?.response?.data?.message || "This invitation link is invalid or expired.");
          setStep("error");
        }
      }
    })();
  }, [token]);

  const handleSubmitOtp = async () => {
    if (otp.length !== 6) return;
    setSubmitting(true);
    try {
      const res = await apiClient.post<{ message: string }>(`/team-members/accept-invite/${token}`, { otp });
      setMessage(res.data.message);
      setStep("success");
    } catch (e: any) {
      setMessage(e?.response?.data?.message || "Invalid OTP. Please try again.");
      setStep("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh grid place-items-center bg-gradient-to-br from-muted to-background p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl text-center">
        {step === "validating" && (
          <>
            <div className="h-14 w-14 rounded-full bg-muted animate-pulse mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Validating your invitation...</p>
          </>
        )}

        {step === "otp" && (
          <>
            <div className="h-14 w-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <Mail className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-semibold mb-1">Verify Your Email</h2>
            <p className="text-sm text-muted-foreground mb-6">
              An OTP has been sent to your email. Enter it below to accept the invitation.
            </p>
            <div className="flex justify-center gap-2 mb-4">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <input
                  key={i}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={otp[i] || ""}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    if (val.length > 1) return;
                    const newOtp = otp.split("");
                    newOtp[i] = val;
                    const joined = newOtp.join("");
                    setOtp(joined);
                    if (val && i < 5) {
                      const next = document.getElementById(`otp-${i + 1}`);
                      next?.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backward" && !otp[i] && i > 0) {
                      const prev = document.getElementById(`otp-${i - 1}`);
                      prev?.focus();
                    }
                    if (e.key === "Enter") handleSubmitOtp();
                  }}
                  id={`otp-${i}`}
                  className="h-12 w-10 text-center text-lg font-bold rounded-lg border border-input bg-muted/30 focus:border-foreground focus:ring-1 focus:ring-foreground outline-none"
                />
              ))}
            </div>
            {message && <p className="text-xs text-destructive mb-3">{message}</p>}
            <button
              onClick={handleSubmitOtp}
              disabled={otp.length !== 6 || submitting}
              className="w-full h-10 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 disabled:opacity-50 inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? <><RefreshCw className="h-4 w-4 animate-spin" /> Verifying...</> : <><KeyRound className="h-4 w-4" /> Accept Invitation</>}
            </button>
          </>
        )}

        {step === "success" && (
          <>
            <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-semibold mb-1">Invitation Accepted!</h2>
            <p className="text-sm text-muted-foreground mb-6">{message}</p>
            <Link to="/auth" className="inline-block h-10 px-6 rounded-lg bg-foreground text-background text-sm font-medium leading-10 hover:opacity-90">
              Sign In
            </Link>
          </>
        )}

        {step === "error" && (
          <>
            <div className="h-14 w-14 rounded-full bg-red-100 text-destructive flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-semibold mb-1">Invalid Link or OTP</h2>
            <p className="text-sm text-muted-foreground mb-6">{message}</p>
            <Link to="/auth" className="inline-block h-10 px-6 rounded-lg bg-foreground text-background text-sm font-medium leading-10 hover:opacity-90">
              Go to Sign In
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
