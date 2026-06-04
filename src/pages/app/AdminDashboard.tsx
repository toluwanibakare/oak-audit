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
  DollarSign,
  MessageSquare
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
  const getSurnameWorkspace = (name: string) => {
    const base = name.replace(/'s workspace$/i, "").trim();
    return `${base.split(" ")[0]}'s workspace`;
  };
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [loading, setLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [search, setSearch] = useState("");
  
  // Review configuration state
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [customPricing, setCustomPricing] = useState<Record<string, number | "">>({
    "9001": 1,
    "14001": 1,
    "45001": 1,
    "27001": 1,
    "hse": 2,
    "ims": 3
  });
  const [saving, setSaving] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  // Support Tickets State
  const [activeTab, setActiveTab] = useState<"workspaces" | "tickets">("workspaces");
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [adminResponse, setAdminResponse] = useState("");
  const [sendingResponse, setSendingResponse] = useState(false);
  const [ticketSearch, setTicketSearch] = useState("");
  const [ticketFilter, setTicketFilter] = useState<"all" | "open" | "resolved">("all");

  // Authenticate Admin locally
  useEffect(() => {
    const adminToken = sessionStorage.getItem("oak_admin_token");
    if (adminToken === "authenticated_oak_admin_2026") {
      setIsLoggedIn(true);
    }
  }, []);

  // Fetch all workspaces via custom RPC bypassing RLS
  const loadWorkspaces = async () => {
    try {
      const { data, error } = await supabase.rpc("admin_get_all_workspaces");
      if (error) throw error;
      setWorkspaces((data ?? []) as Workspace[]);
    } catch (err: any) {
      toast({ title: "Failed to load workspaces", description: err.message, variant: "destructive" });
    }
  };

  // Fetch all support tickets via custom RPC bypassing RLS
  const loadTickets = async () => {
    try {
      const { data, error } = await supabase.rpc("admin_get_all_tickets");
      if (error) throw error;
      setTickets(data ?? []);
    } catch (err: any) {
      toast({ title: "Failed to load tickets", description: err.message, variant: "destructive" });
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([loadWorkspaces(), loadTickets()]);
    setLoading(false);
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadAllData();
    }
  }, [isLoggedIn]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === "administrator" && password === "oak-admin-2026") {
      sessionStorage.setItem("oak_admin_token", "authenticated_oak_admin_2026");
      setIsLoggedIn(true);
      setLoginError("");
      toast({ title: "Welcome back, Administrator", description: "OAK Global ISO portal successfully unlocked." });
    } else {
      setLoginError("Invalid administrator credentials. Access Denied.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("oak_admin_token");
    setIsLoggedIn(false);
    toast({ title: "Logged out", description: "Admin session closed." });
  };


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
      const emailMatch = (w.created_by_email || "").toLowerCase().includes(search.toLowerCase());
      const nameMatch = (w.name || "").toLowerCase().includes(search.toLowerCase());
      const industryMatch = (w.industry || "").toLowerCase().includes(search.toLowerCase());
      return nameMatch || emailMatch || industryMatch;
    });
  }, [workspaces, search]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const emailMatch = (t.email || "").toLowerCase().includes(ticketSearch.toLowerCase());
      const nameMatch = (t.name || "").toLowerCase().includes(ticketSearch.toLowerCase());
      const subjectMatch = (t.subject || "").toLowerCase().includes(ticketSearch.toLowerCase());
      const messageMatch = (t.message || "").toLowerCase().includes(ticketSearch.toLowerCase());
      const textMatch = nameMatch || emailMatch || subjectMatch || messageMatch;
      if (!textMatch) return false;

      if (ticketFilter === "open") return t.status === "open";
      if (ticketFilter === "resolved") return t.status === "resolved";
      return true;
    });
  }, [tickets, ticketSearch, ticketFilter]);

  // Summarize workspaces details
  const stats = useMemo(() => {
    let awaiting = 0;
    let approved = 0;
    let individuals = 0;

    workspaces.forEach((w) => {
      if (w.type === "individual") {
        individuals++;
      }
      
      const addrData = parseAddressData(w.address);
      if (addrData?.reviewStatus === "approved") {
        approved++;
      } else {
        awaiting++;
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
      const cleanPricing: Record<string, number> = {};
      Object.keys(customPricing).forEach((key) => {
        cleanPricing[key] = customPricing[key] === "" ? 0 : Number(customPricing[key]);
      });

      const updatedAddress = JSON.stringify({
        ...addrData,
        reviewStatus: "approved",
        customPricing: cleanPricing
      });

      const { error } = await supabase.rpc("admin_update_workspace_review", {
        _org_id: selectedWorkspace.id,
        _address: updatedAddress
      });

      if (error) throw error;

      toast({ title: "Workspace approved!", description: `${selectedWorkspace.name} custom rates successfully deployed.` });
      setSelectedWorkspace(null);
      setShowVerifyModal(false);
      loadWorkspaces();
    } catch (err: any) {
      toast({ title: "Could not approve", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleRespondTicket = async () => {
    if (!selectedTicket || !adminResponse.trim()) return;
    setSendingResponse(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const adminUserId = userData?.user?.id || null;

      const { error } = await supabase.rpc("admin_respond_to_ticket", {
        _ticket_id: selectedTicket.id,
        _response: adminResponse.trim(),
        _admin_user_id: adminUserId,
      });

      if (error) throw error;

      toast({
        title: "Ticket Resolved!",
        description: `Response submitted for ticket Ref TKT-${selectedTicket.id.slice(0, 8).toUpperCase()}.`,
      });

      setAdminResponse("");
      setSelectedTicket(null);
      loadTickets();
    } catch (err: any) {
      toast({ title: "Failed to respond", description: err.message, variant: "destructive" });
    } finally {
      setSendingResponse(false);
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
              ISO Administration Console
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
              Awaiting ISO Review
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

        {/* Tab Selection Bar */}
        <div className="flex border-b border-slate-900 pb-2 mb-6">
          <button
            onClick={() => {
              setActiveTab("workspaces");
              setSelectedWorkspace(null);
            }}
            className={`px-4 py-2 font-display text-sm font-bold border-b-2 transition ${
              activeTab === "workspaces"
                ? "border-primary text-primary"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Workspace Registers
          </button>
          <button
            onClick={() => {
              setActiveTab("tickets");
              setSelectedTicket(null);
            }}
            className={`px-4 py-2 font-display text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === "tickets"
                ? "border-primary text-primary"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Support Tickets
            {tickets.filter((t) => t.status === "open").length > 0 && (
              <span className="rounded-full bg-warning px-2 py-0.5 text-[10px] font-bold text-slate-950 animate-pulse">
                {tickets.filter((t) => t.status === "open").length}
              </span>
            )}
          </button>
        </div>

        {activeTab === "workspaces" ? (
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
                    const isApproved = addrData?.reviewStatus === "approved";

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
                          
                          <h3 className="font-display font-bold text-base truncate">
                            {w.type === "individual" ? getSurnameWorkspace(w.name) : w.name}
                          </h3>
                          
                          <div className="text-xs text-slate-400 space-y-1">
                            <p>Creator Email: <strong className="text-slate-300">{w.created_by_email || "no creator email"}</strong></p>
                            {!isCompany ? (
                              <p>Sector/Expertise: <span className="text-slate-300 font-medium">{w.industry || "Not mapped"}</span> · Experience: <span className="text-slate-300 font-medium">{addrData?.size ? `${addrData.size} years` : "Not mapped"}</span></p>
                            ) : (
                              <p>Sector: <span className="text-slate-300 font-medium">{w.industry || "Not mapped"}</span> · Size: <span className="text-slate-300 font-medium">{addrData?.size || "Not mapped"}</span></p>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleOpenReview(w)}
                          className={`pill-cta text-xs px-3.5 py-2 shrink-0 ${
                            isApproved 
                              ? "bg-slate-800 border border-slate-700 hover:bg-slate-750 text-slate-300"
                              : "bg-warning hover:bg-warning/90 text-slate-950 font-bold"
                          }`}
                        >
                          {isApproved ? "Adjust Pricing" : "ISO Review & Approve →"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Setup review sidebar panels */}
            <div className="bg-slate-900 border border-slate-900 rounded-3xl p-6 shadow-card space-y-6 lg:sticky lg:top-8">
              <div>
                <h2 className="font-display text-lg font-bold">ISO Review Board</h2>
                <p className="text-xs text-slate-400 mt-1">Select any awaiting company from the register to configure.</p>
              </div>

              {selectedWorkspace ? (() => {
                const addrData = parseAddressData(selectedWorkspace.address);
                const isCompany = selectedWorkspace.type === "organization";
                const isApproved = addrData?.reviewStatus === "approved";
                const cleanIndividualName = !isCompany ? selectedWorkspace.name.replace(/'s workspace$/, "") : selectedWorkspace.name;
                
                return (
                  <div className="space-y-5">
                    <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 space-y-3.5">
                      <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                        <span className="text-xs font-bold text-slate-400">Target Workspace</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          isApproved ? "bg-success/20 text-success" : "bg-warning/20 text-warning"
                        }`}>
                          {isApproved ? "Approved" : "Awaiting Review"}
                        </span>
                      </div>

                      <div className="text-xs space-y-2 leading-relaxed">
                        <p><span className="text-slate-500 block">{isCompany ? "Workspace Name:" : "Workspace Name:"}</span> <strong className="text-slate-100 text-sm">{isCompany ? selectedWorkspace.name : getSurnameWorkspace(selectedWorkspace.name)}</strong></p>
                        {!isCompany && (
                          <p><span className="text-slate-500 block">Auditor Name:</span> <strong className="text-slate-100">{cleanIndividualName}</strong></p>
                        )}
                        <p><span className="text-slate-500 block">{isCompany ? "Industry Sector:" : "Field of Expertise:"}</span> <strong className="text-slate-100">{selectedWorkspace.industry || "Not provided"}</strong></p>
                        <p><span className="text-slate-500 block">{isCompany ? "Corporate Website:" : "Professional Website / Portfolio:"}</span> <strong className="text-slate-100">{addrData?.website || "Not provided"}</strong></p>
                        <p><span className="text-slate-500 block">{isCompany ? "Company Strength / Employees:" : "Years of Experience / Level:"}</span> <strong className="text-slate-100">{addrData?.size ? (isCompany ? addrData.size : `${addrData.size} years`) : "Not provided"}</strong></p>
                        <p><span className="text-slate-500 block">{isCompany ? "Location Address:" : "Contact Address:"}</span> <strong className="text-slate-100">{addrData?.address || "Not provided"}</strong></p>
                        <p><span className="text-slate-500 block">{isCompany ? "Corporate Overview / Scope:" : "Professional Bio / Scope:"}</span> <strong className="text-slate-100 block mt-0.5 text-slate-300 italic">{addrData?.description || "Not provided"}</strong></p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between gap-2 pb-1 border-b border-slate-800/40">
                        <span className="flex items-center gap-1.5 shrink-0">
                          <DollarSign className="h-4 w-4 text-primary" />
                          Custom Pricing
                        </span>
                        <span className="text-[10px] text-white font-extrabold bg-primary border border-primary/30 px-2.5 py-0.5 rounded-full select-none whitespace-nowrap shadow-sm">
                          1 Credit = ₦10,000
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">ISO 9001 Cost</label>
                          <input
                            type="number"
                            min="0"
                            className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none transition"
                            value={customPricing["9001"]}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCustomPricing({ ...customPricing, "9001": val === "" ? "" : (parseInt(val, 10) || 0) });
                            }}
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">ISO 14001 Cost</label>
                          <input
                            type="number"
                            min="0"
                            className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none transition"
                            value={customPricing["14001"]}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCustomPricing({ ...customPricing, "14001": val === "" ? "" : (parseInt(val, 10) || 0) });
                            }}
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">ISO 45001 Cost</label>
                          <input
                            type="number"
                            min="0"
                            className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none transition"
                            value={customPricing["45001"]}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCustomPricing({ ...customPricing, "45001": val === "" ? "" : (parseInt(val, 10) || 0) });
                            }}
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">ISO 27001 Cost</label>
                          <input
                            type="number"
                            min="0"
                            className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none transition"
                            value={customPricing["27001"]}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCustomPricing({ ...customPricing, "27001": val === "" ? "" : (parseInt(val, 10) || 0) });
                            }}
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">HSE Cost</label>
                          <input
                            type="number"
                            min="0"
                            className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none transition"
                            value={customPricing["hse"]}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCustomPricing({ ...customPricing, "hse": val === "" ? "" : (parseInt(val, 10) || 0) });
                            }}
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">IMS Cost</label>
                          <input
                            type="number"
                            min="0"
                            className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none transition"
                            value={customPricing["ims"]}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCustomPricing({ ...customPricing, "ims": val === "" ? "" : (parseInt(val, 10) || 0) });
                            }}
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
                        onClick={() => setShowVerifyModal(true)}
                        disabled={saving}
                        className="flex-grow flex-1 bg-success hover:bg-success/95 text-slate-950 font-bold rounded-xl py-2 text-xs text-center transition tracking-wide uppercase disabled:opacity-50"
                      >
                        Approve & Save
                      </button>
                    </div>
                  </div>
                ); })() : (
                <div className="rounded-2xl border border-dashed border-slate-850 p-10 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-500 mb-4 animate-bounce">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Idle Reviewer</h3>
                  <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                    Select a company register card on the left to begin assessing and configuring credit pricing parameters.
                  </p>
                </div>
              )}
            </div>
          </section>
        ) : (
          <section className="grid gap-6 lg:grid-cols-[1fr_400px] items-start animate-fade-in-up">
            {/* Support Tickets list */}
            <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 shadow-card space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="font-display text-lg font-bold">Support Tickets</h2>
                
                <div className="relative w-64 max-w-full">
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-primary/50 text-slate-100 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none transition"
                    placeholder="Search tickets..."
                    value={ticketSearch}
                    onChange={(e) => setTicketSearch(e.target.value)}
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800/80 rounded-xl p-1 w-fit">
                {(["all", "open", "resolved"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setTicketFilter(f)}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize transition ${
                      ticketFilter === f
                        ? "bg-primary text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="py-16 text-center text-sm text-slate-500">Querying tickets in secure database...</div>
              ) : filteredTickets.length === 0 ? (
                <div className="py-16 text-center text-sm text-slate-500">No support tickets match your search.</div>
              ) : (
                <div className="space-y-3">
                  {filteredTickets.map((t) => {
                    const isOpen = t.status === "open";
                    return (
                      <div 
                        key={t.id} 
                        className={`rounded-2xl border p-4 flex flex-wrap items-center justify-between gap-4 transition cursor-pointer ${
                          selectedTicket?.id === t.id 
                            ? "border-primary bg-primary/5 shadow-elevated" 
                            : "border-slate-900 bg-slate-900/30 hover:border-slate-800 hover:-translate-y-0.5 hover:shadow-card"
                        }`}
                        onClick={() => {
                          setSelectedTicket(t);
                          setAdminResponse(t.response || "");
                        }}
                      >
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                              isOpen ? "bg-warning/20 text-warning animate-pulse" : "bg-success/20 text-success"
                            }`}>
                              {isOpen ? "Open" : "Resolved"}
                            </span>
                            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[9px] font-bold uppercase text-slate-400">
                              {t.category}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {new Date(t.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <h3 className="font-display font-bold text-base truncate">
                            {t.subject}
                          </h3>
                          
                          <div className="text-xs text-slate-400 space-y-0.5">
                            <p>From: <strong className="text-slate-300">{t.name}</strong> ({t.email})</p>
                            {t.org_name && <p>Workspace: <span className="text-slate-300 font-medium">{t.org_name}</span></p>}
                          </div>
                        </div>

                        <button
                          className={`pill-cta text-xs px-3.5 py-2 shrink-0 ${
                            !isOpen 
                              ? "bg-slate-850 border border-slate-700 hover:bg-slate-800 text-slate-300"
                              : "bg-primary hover:bg-primary/90 text-white font-bold"
                          }`}
                        >
                          {isOpen ? "Respond" : "View"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Support Ticket Board sidebar */}
            <div className="bg-slate-900 border border-slate-900 rounded-3xl p-6 shadow-card space-y-6 lg:sticky lg:top-8">
              <div>
                <h2 className="font-display text-lg font-bold">Support Ticket Board</h2>
                <p className="text-xs text-slate-400 mt-1">Select a ticket from the register to resolve or review.</p>
              </div>

              {selectedTicket ? (
                <div className="space-y-5">
                  <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                      <span className="text-xs font-bold text-slate-400">TKT-{(selectedTicket.id || "").slice(0, 8).toUpperCase()}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        selectedTicket.status === "open" ? "bg-warning/20 text-warning" : "bg-success/20 text-success"
                      }`}>
                        {selectedTicket.status === "open" ? "Open" : "Resolved"}
                      </span>
                    </div>

                    <div className="text-xs space-y-2 leading-relaxed">
                      <p><span className="text-slate-500 block">From Client:</span> <strong className="text-slate-100 text-sm">{selectedTicket.name}</strong> ({selectedTicket.email})</p>
                      {selectedTicket.org_name && (
                        <p><span className="text-slate-500 block">Workspace:</span> <strong className="text-slate-100">{selectedTicket.org_name}</strong></p>
                      )}
                      <p><span className="text-slate-500 block">Topic / Subject:</span> <strong className="text-slate-100">{selectedTicket.subject}</strong></p>
                      <p><span className="text-slate-500 block">Issue Description:</span> <strong className="text-slate-100 block mt-0.5 text-slate-300 italic">{selectedTicket.message}</strong></p>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Administrator Resolution Response</label>
                    <textarea
                      className="w-full min-h-[120px] bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-2.5 text-xs font-sans leading-relaxed focus:outline-none transition"
                      value={adminResponse}
                      onChange={(e) => setAdminResponse(e.target.value)}
                      placeholder="Type the resolution or assistance response to resolve this ticket..."
                      disabled={selectedTicket.status !== "open"}
                    />
                  </div>

                  {selectedTicket.status === "open" ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedTicket(null)}
                        className="flex-1 bg-slate-950 border border-slate-800 hover:bg-slate-900 rounded-xl py-2 text-xs font-semibold text-slate-400 text-center transition"
                      >
                        Cancel
                      </button>
                      
                      <button
                        onClick={handleRespondTicket}
                        disabled={sendingResponse || !adminResponse.trim()}
                        className="flex-grow flex-1 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl py-2 text-xs text-center transition tracking-wide uppercase disabled:opacity-50"
                      >
                        {sendingResponse ? "Submitting..." : "Submit Response"}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="rounded-xl bg-success/5 border border-success/15 p-3 text-[11px] text-success leading-relaxed">
                        ✓ <strong>Resolved ticket:</strong> This ticket is resolved. The administrator response is saved in the compliance log registry.
                      </div>
                      <button
                        onClick={() => setSelectedTicket(null)}
                        className="w-full bg-slate-950 border border-slate-800 hover:bg-slate-900 rounded-xl py-2 text-xs font-semibold text-slate-400 text-center transition"
                      >
                        Close Detail View
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-850 p-10 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-500 mb-4 animate-bounce">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Idle Reviewer</h3>
                  <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                    Select a support ticket card on the left to begin reviewing or drafting a response.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center text-[10px] text-slate-600 font-medium select-none pt-10 mt-10 border-t border-slate-900/40">
        © 2026 OAK Global International. All rights reserved.
      </footer>
      {showVerifyModal && selectedWorkspace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-[32px] border border-slate-800 bg-slate-900 p-8 shadow-2xl animate-scale-up space-y-6 relative overflow-hidden">
            {/* Subtle glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-warning/10 border border-warning/20 text-warning mb-4">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-extrabold text-slate-100">Confirm Custom Credit Pricing</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                You are about to approve and deploy custom credit pricing parameters for <strong>{selectedWorkspace.name}</strong>.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-950/80 border border-slate-850 p-4 relative z-10 space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-850 pb-2 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                <span>Standard Pack</span>
                <span>Custom Pricing (Credits & Value)</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">ISO 9001 — Quality:</span>
                  <span className="font-semibold text-slate-200">{customPricing["9001"]} credit(s) <span className="text-slate-500 text-[10px] ml-1">(₦{(customPricing["9001"] * 10000).toLocaleString()})</span></span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">ISO 14001 — Environment:</span>
                  <span className="font-semibold text-slate-200">{customPricing["14001"]} credit(s) <span className="text-slate-500 text-[10px] ml-1">(₦{(customPricing["14001"] * 10000).toLocaleString()})</span></span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">ISO 45001 — OH&S:</span>
                  <span className="font-semibold text-slate-200">{customPricing["45001"]} credit(s) <span className="text-slate-500 text-[10px] ml-1">(₦{(customPricing["45001"] * 10000).toLocaleString()})</span></span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">ISO 27001 — InfoSec:</span>
                  <span className="font-semibold text-slate-200">{customPricing["27001"]} credit(s) <span className="text-slate-500 text-[10px] ml-1">(₦{(customPricing["27001"] * 10000).toLocaleString()})</span></span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">HSE — Site Inspection:</span>
                  <span className="font-semibold text-slate-200">{customPricing["hse"]} credit(s) <span className="text-slate-500 text-[10px] ml-1">(₦{(customPricing["hse"] * 10000).toLocaleString()})</span></span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-850 pt-2.5">
                  <span className="text-slate-400">IMS — Integrated Bundle:</span>
                  <span className="font-semibold text-slate-200">{customPricing["ims"]} credit(s) <span className="text-slate-500 text-[10px] ml-1">(₦{(customPricing["ims"] * 10000).toLocaleString()})</span></span>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-slate-950 border border-slate-850 p-3.5 text-[10px] text-slate-400 leading-normal relative z-10">
              <strong>Rate Conversion Basis:</strong> 1 Credit = ₦10,000. These values will be locked inside the organization's storefront registry.
            </div>

            <div className="flex gap-3 relative z-10">
              <button
                onClick={() => setShowVerifyModal(false)}
                className="flex-1 bg-slate-950 border border-slate-800 hover:bg-slate-900 rounded-xl py-2.5 text-xs font-semibold text-slate-400 text-center transition"
              >
                Cancel & Change
              </button>
              <button
                onClick={handleApprove}
                disabled={saving}
                className="flex-grow flex-1 bg-success hover:bg-success/95 text-slate-950 font-extrabold rounded-xl py-2.5 text-xs text-center transition tracking-wide uppercase disabled:opacity-50"
              >
                {saving ? "Deploying..." : "Confirm & Deploy →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
