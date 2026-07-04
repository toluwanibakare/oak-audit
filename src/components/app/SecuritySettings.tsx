import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/api/auth";
import { ChevronDown, ChevronUp, Key, Mail, Eye, EyeOff } from "lucide-react";

export default function SecuritySettings() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);

  const [passwordStep, setPasswordStep] = useState<'idle' | 'otp_sent'>('idle');
  const [passwordOtp, setPasswordOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [emailStep, setEmailStep] = useState<'idle' | 'old_otp_sent' | 'new_otp_sent'>('idle');
  const [newEmail, setNewEmail] = useState("");
  const [oldEmailOtp, setOldEmailOtp] = useState("");
  const [newEmailOtp, setNewEmailOtp] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  const resetPassword = () => {
    setPasswordStep('idle');
    setPasswordOtp("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const resetEmail = () => {
    setEmailStep('idle');
    setNewEmail("");
    setOldEmailOtp("");
    setNewEmailOtp("");
  };

  const handleSendPasswordOtp = async () => {
    setPasswordLoading(true);
    try {
      await authApi.sendPasswordOtp();
      setPasswordStep('otp_sent');
      toast({ title: "OTP sent to your email" });
    } catch (err: any) {
      toast({ title: err?.response?.data?.error || "Failed to send OTP", variant: "destructive" });
    }
    setPasswordLoading(false);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      return toast({ title: "Passwords do not match", variant: "destructive" });
    }
    setPasswordLoading(true);
    try {
      await authApi.changePassword({ otp: passwordOtp, password: newPassword, password_confirmation: confirmPassword });
      toast({ title: "Password changed successfully" });
      resetPassword();
    } catch (err: any) {
      toast({ title: err?.response?.data?.error || err?.response?.data?.errors?.otp?.[0] || "Failed to change password", variant: "destructive" });
    }
    setPasswordLoading(false);
  };

  const handleSendOldEmailOtp = async () => {
    if (!newEmail.trim()) {
      return toast({ title: "Enter your new email address", variant: "destructive" });
    }
    setEmailLoading(true);
    try {
      await authApi.sendChangeEmailOtp(newEmail);
      setEmailStep('old_otp_sent');
      toast({ title: "OTP sent to your current email" });
    } catch (err: any) {
      toast({ title: err?.response?.data?.error || err?.response?.data?.errors?.new_email?.[0] || "Failed to send OTP", variant: "destructive" });
    }
    setEmailLoading(false);
  };

  const handleSendNewEmailOtp = async () => {
    setEmailLoading(true);
    try {
      await authApi.sendNewEmailOtp(newEmail, oldEmailOtp);
      setEmailStep('new_otp_sent');
      toast({ title: "OTP sent to your new email" });
    } catch (err: any) {
      toast({ title: err?.response?.data?.error || err?.response?.data?.errors?.otp?.[0] || "Failed to verify OTP", variant: "destructive" });
    }
    setEmailLoading(false);
  };

  const handleVerifyChangeEmail = async () => {
    setEmailLoading(true);
    try {
      await authApi.verifyChangeEmail(newEmail, newEmailOtp);
      toast({ title: "Email changed successfully" });
      if (refreshUser) await refreshUser();
      resetEmail();
    } catch (err: any) {
      toast({ title: err?.response?.data?.error || err?.response?.data?.errors?.otp?.[0] || "Failed to change email", variant: "destructive" });
    }
    setEmailLoading(false);
  };

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 sm:px-6 py-4 hover:bg-secondary/50 transition"
      >
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
            <Key className="h-4.5 w-4.5" />
          </div>
          <div className="text-left">
            <h3 className="font-display text-base font-bold text-foreground">Security Settings</h3>
            <p className="text-xs text-muted-foreground">Change your password or email address</p>
          </div>
        </div>
        {open ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
      </button>

      {open && (
        <div className="border-t border-border px-4 sm:px-6 py-5 space-y-8">
          {/* ── Change Password ── */}
          <div>
            <h4 className="font-display text-sm font-bold text-foreground flex items-center gap-2 mb-3">
              <Key className="h-4 w-4" /> Change Password
            </h4>
            {passwordStep === 'idle' ? (
              <button
                onClick={handleSendPasswordOtp}
                disabled={passwordLoading}
                className="pill-cta text-xs disabled:opacity-50"
              >
                {passwordLoading ? "Sending..." : "Send OTP to my email"}
              </button>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium">OTP Code</label>
                  <input className="input" value={passwordOtp} onChange={(e) => setPasswordOtp(e.target.value)} placeholder="Enter 6-digit OTP" maxLength={6} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">New Password</label>
                  <div className="relative">
                    <input className="input pr-10" type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">Confirm New Password</label>
                  <div className="relative">
                    <input className="input pr-10" type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleChangePassword} disabled={passwordLoading || !passwordOtp || !newPassword || !confirmPassword} className="pill-cta text-xs disabled:opacity-50">
                    {passwordLoading ? "Changing..." : "Change Password"}
                  </button>
                  <button onClick={resetPassword} className="pill-secondary text-xs">Cancel</button>
                </div>
              </div>
            )}
          </div>

          {/* ── Change Email ── */}
          <div>
            <h4 className="font-display text-sm font-bold text-foreground flex items-center gap-2 mb-3">
              <Mail className="h-4 w-4" /> Change Email
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              Current email: <span className="font-medium text-foreground">{user?.email}</span>
            </p>
            {emailStep === 'idle' && (
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium">New Email Address</label>
                  <input className="input" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Enter your new email" type="email" />
                </div>
                <button onClick={handleSendOldEmailOtp} disabled={emailLoading || !newEmail.trim()} className="pill-cta text-xs disabled:opacity-50">
                  {emailLoading ? "Sending..." : "Send OTP to current email"}
                </button>
              </div>
            )}
            {emailStep === 'old_otp_sent' && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">An OTP has been sent to your current email. Enter it below.</p>
                <div>
                  <label className="mb-1 block text-xs font-medium">OTP from current email</label>
                  <input className="input" value={oldEmailOtp} onChange={(e) => setOldEmailOtp(e.target.value)} placeholder="Enter 6-digit OTP" maxLength={6} />
                </div>
                <button onClick={handleSendNewEmailOtp} disabled={emailLoading || !oldEmailOtp} className="pill-cta text-xs disabled:opacity-50">
                  {emailLoading ? "Sending..." : "Send OTP to new email"}
                </button>
                <button onClick={resetEmail} className="pill-secondary text-xs">Cancel</button>
              </div>
            )}
            {emailStep === 'new_otp_sent' && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">An OTP has been sent to <span className="font-medium text-foreground">{newEmail}</span>. Enter it below.</p>
                <div>
                  <label className="mb-1 block text-xs font-medium">OTP from new email</label>
                  <input className="input" value={newEmailOtp} onChange={(e) => setNewEmailOtp(e.target.value)} placeholder="Enter 6-digit OTP" maxLength={6} />
                </div>
                <div className="flex gap-3">
                  <button onClick={handleVerifyChangeEmail} disabled={emailLoading || !newEmailOtp} className="pill-cta text-xs disabled:opacity-50">
                    {emailLoading ? "Verifying..." : "Verify & Change Email"}
                  </button>
                  <button onClick={resetEmail} className="pill-secondary text-xs">Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
