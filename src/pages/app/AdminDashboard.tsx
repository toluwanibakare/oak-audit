import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, 
  ShieldCheck, 
  Users, 
  FileText, 
  ArrowRight, 
  Lock, 
  LogOut, 
  Search, 
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  DollarSign
} from "lucide-react";

type Workspace = {
  id: string;
  type: string;
  name: string;
  industry: string | null;
  address: string | null;
  logo_url: string | null;
  created_at: string;
  created_by_email: string | null;
};

export default function AdminDashboard() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [loading, setLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [search, setSearch] = useState("");
  
  // Review configuration state
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [customPricing, setCustomPricing] = useState<Record<string, number>>({
    "9001": 1,
    "14001": 1,
    "45001": 1,
    "27001": 1,
    "hse": 2,
    "ims": 3
  });
  const [saving, setSaving] = useState(false);

  // Authenticate Admin locally
  useEffect(() => {
    const adminToken = sessionStorage.getItem("oak_admin_token");
    if (adminToken === "authenticated_oak_admin_2026") {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === "administrator" && password === "oak-admin-2026") {
      sessionStorage.setItem("oak_admin_token", "authenticated_oak_admin_2026");
      setIsLoggedIn(true);
      setLoginError("");
      toast({ title: "Welcome back, Administrator", description: "OAK Global GRC portal successfully unlocked." });
    } else {
      setLoginError("Invalid administrator credentials. Access Denied.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("oak_admin_token");
    setIsLoggedIn(false);
    toast({ title: "Logged out", description: "Admin session closed." });
  };

  // Fetch all workspaces via custom RPC bypassing RLS
  const loadWorkspaces = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("admin_get_all_workspaces");
      if (error) throw error;
      setWorkspaces((data ?? []) as Workspace[]);
    } catch (err: any) {
      toast({ title: "Failed to load workspaces", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadWorkspaces();
    }
  }, [isLoggedIn]);

  // Decode address column json data safely
  const parseAddressData = (addressStr: string | null) => {
    if (!addressStr) return null;
    if (!addressStr.trim().startsWith("{")) return { address: addressStr };
    try {
      return JSON.parse(addressStr);
    } catch {
      return { address: addressStr };
    }
  };

  // Filter workspaces based on search query
  const filteredWorkspaces = useMemo(() => {
    return workspaces.filter((w) => {
      const emailMatch = w.created_by_email?.toLowerCase().includes(search.toLowerCase());
      const nameMatch = w.name.toLowerCase().includes(search.toLowerCase());
      const industryMatch = w.industry?.toLowerCase().includes(search.toLowerCase());
      return nameMatch || emailMatch || industryMatch;
    });
  }, [workspaces, search]);

  // Summarize workspaces details
  const stats = useMemo(() => {
    let awaiting = 0;
    let approved = 0;
    let individuals = 0;

    workspaces.forEach((w) => {
      if (w.type === "individual") {
        individuals++;
      } else {
        const addrData = parseAddressData(w.address);
        if (addrData?.reviewStatus === "approved") {
          approved++;
        } else {
          awaiting++;
        }
      }
    });

    return { total: workspaces.length, awaiting, approved, individuals };
  }, [workspaces]);

  // Open review editor panel
  const handleOpenReview = (w: Workspace) => {
    setSelectedWorkspace(w);
    const addrData = parseAddressData(w.address);
    const currentCustomPricing = addrData?.customPricing ?? {};
    setCustomPricing({
      "9001": currentCustomPricing["9001"] ?? 1,
      "14001": currentCustomPricing["14001"] ?? 1,
      "45001": currentCustomPricing["45001"] ?? 1,
      "27001": currentCustomPricing["27001"] ?? 1,
      "hse": currentCustomPricing["hse"] ?? 2,
      "ims": currentCustomPricing["ims"] ?? 3
    });
  };

  // Submit Approval & Save Custom Pricing object inside address column
  const handleApprove = async () => {
    if (!selectedWorkspace) return;
    setSaving(true);
    
    try {
      const addrData = parseAddressData(selectedWorkspace.address) || {};
      const updatedAddress = JSON.stringify({
        ...addrData,
        reviewStatus: "approved",
        customPricing: customPricing
      });

      const { error } = await supabase.rpc("admin_update_workspace_review", {
        _org_id: selectedWorkspace.id,
        _address: updatedAddress
      });

      if (error) throw error;

      toast({ title: "Workspace approved!", description: `${selectedWorkspace.name} custom rates successfully deployed.` });
      setSelectedWorkspace(null);
      loadWorkspaces();
    } catch (err: any) {
      toast({ title: "Could not approve", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[32px] p-8 shadow-2xl relative overflow-hidden space-y-6">
          {/* Subtle glowing ring decoration */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 rounded-full blur-[80px]" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-accent/20 rounded-full blur-[80px]" />

          <div className="text-center relative z-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-4 animate-pulse">
              <Lock className="h-6 w-6" />
            </div>
            <h2 className="font-display text-2xl font-extrabold tracking-tight">OAK Global Admin Portal</h2>
            <p className="mt-1.5 text-xs text-slate-400">
              Access restricted to corporate compliance administrators
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 relative z-10">
            {loginError && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive text-center font-medium">
                {loginError}
              </div>
            )}
            
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 pl-1">Admin Username</label>
              <input
                type="text"
                className="w-full bg-slate-950 border border-slate-800 focus:border-primary/50 text-slate-100 rounded-xl px-3.5 py-2 text-sm focus:outline-none transition"
                placeholder="administrator"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 pl-1">Access Password</label>
              <input
                type="password"
                className="w-full bg-slate-950 border border-slate-800 focus:border-primary/50 text-slate-100 rounded-xl px-3.5 py-2 text-sm focus:outline-none transition"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary/95 text-white font-bold rounded-xl py-2.5 text-xs transition duration-200 shadow-lg tracking-wider uppercase mt-2"
            >
              Unlock Portal →
            </button>
          </form>

          <div className="text-[10px] text-center text-slate-500 font-medium select-none pt-2 border-t border-slate-800/60 relative z-10">
            © 2026 OAK Global International. All rights reserved.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
      <div className="space-y-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-900 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <ShieldCheck className="h-4 w-4" />
              GRC Administration Console
            </div>
            <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight">OAK Global International</h1>
            <p className="mt-1 text-sm text-slate-400">Review workspace registers, assess organizational size, and assign custom credit rates.</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-slate-800 hover:border-destructive hover:bg-destructive/10 px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-destructive transition shrink-0"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </button>
        </header>

        {/* Stats Panel */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-slate-900/60 border border-slate-900 rounded-2xl p-5 shadow-card">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              Total Workspaces
            </div>
            <div className="mt-3 text-4xl font-extrabold">{stats.total}</div>
            <p className="mt-1 text-xs text-slate-400">Total registers in database</p>
          </div>
          
          <div className="bg-slate-900/60 border border-slate-900 rounded-2xl p-5 shadow-card">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Awaiting GRC Review
            </div>
            <div className="mt-3 text-4xl font-extrabold text-warning">{stats.awaiting}</div>
            <p className="mt-1 text-xs text-slate-400">Companies pending custom pricing</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-900 rounded-2xl p-5 shadow-card">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-success" />
              Approved Companies
            </div>
            <div className="mt-3 text-4xl font-extrabold text-success">{stats.approved}</div>
            <p className="mt-1 text-xs text-slate-400">Active workspaces with rates</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-900 rounded-2xl p-5 shadow-card">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Users className="h-4 w-4 text-accent" />
              Individual Auditors
            </div>
            <div className="mt-3 text-4xl font-extrabold text-accent">{stats.individuals}</div>
            <p className="mt-1 text-xs text-slate-400">Self-managed personal spaces</p>
          </div>
        </section>

        {/* Main list & review workspace */}
        <section className="grid gap-6 lg:grid-cols-[1fr_400px] items-start">
          {/* Workspaces register */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 shadow-card space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-display text-lg font-bold">Workspace Register</h2>
              
              <div className="relative w-64 max-w-full">
                <input
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-primary/50 text-slate-100 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none transition"
                  placeholder="Search by name, email, industry..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              </div>
            </div>

            {loading ? (
              <div className="py-16 text-center text-sm text-slate-500">Querying secure database registers...</div>
            ) : filteredWorkspaces.length === 0 ? (
              <div className="py-16 text-center text-sm text-slate-500">No workspaces match your query.</div>
            ) : (
              <div className="space-y-3">
                {filteredWorkspaces.map((w) => {
                  const addrData = parseAddressData(w.address);
                  const isCompany = w.type === "organization";
                  const isApproved = isCompany ? addrData?.reviewStatus === "approved" : true;

                  return (
                    <div 
                      key={w.id} 
                      className={`rounded-2xl border p-4 flex flex-wrap items-center justify-between gap-4 transition ${
                        selectedWorkspace?.id === w.id 
                          ? "border-primary bg-primary/5 shadow-elevated" 
                          : "border-slate-900 bg-slate-900/30 hover:border-slate-800 hover:-translate-y-0.5 hover:shadow-card"
                      }`}
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            isCompany ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"
                          }`}>
                            {w.type === "organization" ? "Company" : "Individual"}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            isApproved ? "bg-success/20 text-success" : "bg-warning/20 text-warning"
                          }`}>
                            {isApproved ? "Approved" : "Awaiting Review"}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Registered {new Date(w.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <h3 className="font-display font-bold text-base truncate">{w.name}</h3>
                        
                        <div className="text-xs text-slate-400 space-y-1">
                          <p>Creator Email: <strong className="text-slate-300">{w.created_by_email || "no creator email"}</strong></p>
                          {isCompany && (
                            <p>Sector: <span className="text-slate-300 font-medium">{w.industry || "Not mapped"}</span> · Size: <span className="text-slate-300 font-medium">{addrData?.size || "Not mapped"}</span></p>
                          )}
                        </div>
                      </div>

                      {isCompany && (
                        <button
                          onClick={() => handleOpenReview(w)}
                          className={`pill-cta text-xs px-3.5 py-2 shrink-0 ${
                            isApproved 
                              ? "bg-slate-800 border border-slate-700 hover:bg-slate-750 text-slate-300"
                              : "bg-warning hover:bg-warning/90 text-slate-950 font-bold"
                          }`}
                        >
                          {isApproved ? "Adjust Pricing" : "GRC Review & Approve →"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Setup review sidebar panels */}
          <div className="bg-slate-900 border border-slate-900 rounded-3xl p-6 shadow-card space-y-6 lg:sticky lg:top-8">
            <div>
              <h2 className="font-display text-lg font-bold">GRC Review Board</h2>
              <p className="text-xs text-slate-400 mt-1">Select any awaiting company from the register to configure.</p>
            </div>

            {selectedWorkspace ? (
              <div className="space-y-5">
                <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                    <span className="text-xs font-bold text-slate-400">Target Workspace</span>
                    <span className="text-[10px] bg-warning/20 text-warning px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Awaiting Review</span>
                  </div>

                  <div className="text-xs space-y-2 leading-relaxed">
                    <p><span className="text-slate-500 block">Workspace Name:</span> <strong className="text-slate-100 text-sm">{selectedWorkspace.name}</strong></p>
                    <p><span className="text-slate-500 block">Industry Sector:</span> <strong className="text-slate-100">{selectedWorkspace.industry || "Not provided"}</strong></p>
                    <p><span className="text-slate-500 block">Corporate Website:</span> <strong className="text-slate-100">{parseAddressData(selectedWorkspace.address)?.website || "Not provided"}</strong></p>
                    <p><span className="text-slate-500 block">Company Strength / Employees:</span> <strong className="text-slate-100">{parseAddressData(selectedWorkspace.address)?.size || "Not provided"}</strong></p>
                    <p><span className="text-slate-500 block">Location Address:</span> <strong className="text-slate-100">{parseAddressData(selectedWorkspace.address)?.address || "Not provided"}</strong></p>
                    <p><span className="text-slate-500 block">Corporate Overview / Scope:</span> <strong className="text-slate-100 block mt-0.5 text-slate-300 italic">{parseAddressData(selectedWorkspace.address)?.description || "Not provided"}</strong></p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4 text-primary" />
                    Configure Custom Credit Prices
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">ISO 9001 Cost</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none transition"
                        value={customPricing["9001"]}
                        onChange={(e) => setCustomPricing({ ...customPricing, "9001": parseInt(e.target.value, 10) || 0 })}
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">ISO 14001 Cost</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none transition"
                        value={customPricing["14001"]}
                        onChange={(e) => setCustomPricing({ ...customPricing, "14001": parseInt(e.target.value, 10) || 0 })}
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">ISO 45001 Cost</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none transition"
                        value={customPricing["45001"]}
                        onChange={(e) => setCustomPricing({ ...customPricing, "45001": parseInt(e.target.value, 10) || 0 })}
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">ISO 27001 Cost</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none transition"
                        value={customPricing["27001"]}
                        onChange={(e) => setCustomPricing({ ...customPricing, "27001": parseInt(e.target.value, 10) || 0 })}
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">HSE Cost</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none transition"
                        value={customPricing["hse"]}
                        onChange={(e) => setCustomPricing({ ...customPricing, "hse": parseInt(e.target.value, 10) || 0 })}
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">IMS Cost</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none transition"
                        value={customPricing["ims"]}
                        onChange={(e) => setCustomPricing({ ...customPricing, "ims": parseInt(e.target.value, 10) || 0 })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedWorkspace(null)}
                    className="flex-1 bg-slate-950 border border-slate-800 hover:bg-slate-900 rounded-xl py-2 text-xs font-semibold text-slate-400 text-center transition"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={handleApprove}
                    disabled={saving}
                    className="flex-grow flex-1 bg-success hover:bg-success/95 text-slate-950 font-bold rounded-xl py-2 text-xs text-center transition tracking-wide uppercase disabled:opacity-50"
                  >
                    {saving ? "Deploying..." : "Approve & Save"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-850 p-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-500 mb-4 animate-bounce">
                  <Building2 className="h-5 w-5" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Idle Reviewer</h3>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                  Select a company register card on the left to begin assessing and config credit pricing parameters.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="text-center text-[10px] text-slate-600 font-medium select-none pt-10 mt-10 border-t border-slate-900/40">
        © 2026 OAK Global International. All rights reserved.
      </footer>
    </div>
  );
}
