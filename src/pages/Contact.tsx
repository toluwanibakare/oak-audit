import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useOrg } from "@/hooks/useOrg";
import { useToast } from "@/hooks/use-toast";
import { AppShell } from "@/components/app/AppShell";
import { 
  Mail, 
  MessageSquare, 
  CheckCircle2, 
  ArrowLeft, 
  ShieldCheck, 
  Clock, 
  Send,
  HelpCircle,
  AlertCircle,
  Phone,
  Ticket
} from "lucide-react";
import logo from "@/assets/logo.png";

export default function Contact() {
  const { user } = useAuth();
  const { currentOrg } = useOrg();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Navigation Panel Tab State
  const [activePanel, setActivePanel] = useState<"submit" | "tickets">("submit");

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("technical");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<{ id: string; ref: string } | null>(null);

  // Tickets List State
  const [userTickets, setUserTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  // Load user data if authenticated
  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.full_name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const fetchUserTickets = async () => {
    if (!user) return;
    setLoadingTickets(true);
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setUserTickets(data ?? []);
    } catch (err: any) {
      console.error("Error fetching tickets:", err.message);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserTickets();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const ticketData = {
        org_id: currentOrg?.id || null,
        user_id: user?.id || null,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        category,
        message: message.trim(),
        status: "open",
      };

      const { data, error } = await supabase
        .from("support_tickets")
        .insert(ticketData)
        .select("id")
        .single();

      if (error) throw error;

      // Generate a short professional reference from the ID
      const shortRef = `TKT-${(data?.id || "").slice(0, 8).toUpperCase()}`;
      setSubmittedTicket({ id: data?.id, ref: shortRef });
      
      toast({
        title: "Ticket Submitted Successfully!",
        description: `Your support ticket reference is ${shortRef}.`,
      });

      // Clear form except user info
      setSubject("");
      setMessage("");

      // Refresh tickets history list
      if (user) {
        await fetchUserTickets();
      }
    } catch (err: any) {
      toast({
        title: "Error Submitting Ticket",
        description: err.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "technical": return "Technical Support";
      case "billing": return "Billing & Credits";
      case "compliance": return "Compliance & ISO";
      default: return "General Inquiry";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved": 
        return <span className="inline-flex items-center text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">Resolved</span>;
      case "in_progress": 
        return <span className="inline-flex items-center text-[10px] font-bold text-info bg-info/10 px-2 py-0.5 rounded-full">In Progress</span>;
      case "closed": 
        return <span className="inline-flex items-center text-[10px] font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">Closed</span>;
      default: 
        return <span className="inline-flex items-center text-[10px] font-bold text-warning bg-warning/10 px-2 py-0.5 rounded-full">Open</span>;
    }
  };

  const formView = (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Submit a Support Ticket</h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Need technical assistance, billing review, or clarification on ISO standards? File a ticket and our compliance administrators will respond within 24 hours.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 pl-1">Your Name</label>
            <input
              type="text"
              className="input w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              disabled={!!user}
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 pl-1">Email Address</label>
            <input
              type="email"
              className="input w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. johndoe@company.com"
              disabled={!!user}
              required
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 pl-1">Ticket Category</label>
            <select
              className="input w-full font-sans text-sm font-semibold"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="technical">Technical Support (System issues/bugs)</option>
              <option value="billing">Billing & Credits (Top-up/wallet questions)</option>
              <option value="compliance">Compliance & ISO Checks (Audit structure)</option>
              <option value="general">General Inquiry</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 pl-1">Subject</label>
            <input
              type="text"
              className="input w-full"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Credit top-up delay"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 pl-1">Message / Detail</label>
          <textarea
            className="input w-full min-h-[140px] py-3 resize-y font-sans text-sm leading-relaxed"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Please provide comprehensive details about your issue, including ISO clauses or transaction references if applicable..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="pill-cta w-full justify-center py-3 text-sm font-bold disabled:opacity-50 transition gap-2"
        >
          <Send className="h-4 w-4" />
          {submitting ? "Submitting Ticket..." : "Submit Support Ticket"}
        </button>
      </form>
    </div>
  );

  const ticketsListView = (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Support Ticket History</h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Track active support resolutions and chat logs with OAK Global Compliance Administrators.
        </p>
      </div>

      {!user ? (
        <div className="py-10 text-center space-y-4 bg-secondary/20 border border-border border-dashed rounded-3xl p-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Ticket className="h-6 w-6" />
          </div>
          <div className="space-y-2 max-w-sm mx-auto">
            <h3 className="font-display text-base font-bold text-foreground">Log In To Track Tickets</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Active ticket history registers are reserved for registered users. Log in to your secure workspace to view and track your resolutions.
            </p>
          </div>
          <Link to="/auth" className="pill-cta text-xs font-bold inline-flex px-5 py-2.5">
            Access Dashboard Account
          </Link>
        </div>
      ) : loadingTickets ? (
        <div className="space-y-4">
          <div className="h-32 rounded-2xl border border-border animate-pulse bg-secondary/50" />
          <div className="h-32 rounded-2xl border border-border animate-pulse bg-secondary/50" />
        </div>
      ) : userTickets.length === 0 ? (
        <div className="py-12 text-center space-y-3 bg-secondary/15 rounded-3xl border border-border p-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display text-base font-bold text-foreground">No Support Tickets Found</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
              You haven't submitted any ISO helpdesk tickets yet. If you have any inquiries, file a ticket in the submit panel.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
          {userTickets.map((t) => (
            <div key={t.id} className="border border-border bg-background/60 rounded-2xl p-4 sm:p-5 transition hover:border-muted shadow-sm space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold bg-secondary border border-border px-2 py-0.5 rounded-md text-muted-foreground">
                    TKT-{(t.id || "").slice(0, 8).toUpperCase()}
                  </span>
                  <h4 className="font-display text-base font-bold text-foreground mt-1.5">{t.subject}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                    {getCategoryLabel(t.category)}
                  </span>
                  {getStatusBadge(t.status)}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed font-sans">{t.message}</p>
                <div className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Filed on {new Date(t.created_at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}
                </div>
              </div>

              {t.response && (
                <div className="mt-4 border-t border-border pt-4 space-y-2 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-success" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-success">Administrator Response</span>
                  </div>
                  <div className="bg-secondary/40 border border-border p-4 rounded-xl text-sm leading-relaxed text-foreground font-sans">
                    {t.response}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const successView = (
    <div className="py-8 text-center space-y-6 animate-scale-up">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      
      <div className="space-y-2">
        <h3 className="font-display text-2xl font-bold text-foreground">Support Ticket Submitted!</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
          Your ticket has been received and securely queued. OAK Global administrators will review the details and post a resolution shortly.
        </p>
      </div>

      <div className="bg-secondary/60 border border-border p-4 rounded-2xl max-w-sm mx-auto font-mono text-sm space-y-2 shadow-sm">
        <div className="flex justify-between text-xs text-muted-foreground border-b border-border pb-1.5">
          <span>Ticket Ref</span>
          <span>Status</span>
        </div>
        <div className="flex justify-between font-bold">
          <span className="text-foreground">{submittedTicket?.ref}</span>
          <span className="text-warning">Open (Awaiting review)</span>
        </div>
      </div>

      <div className="flex justify-center gap-3 pt-2">
        <button
          onClick={() => {
            setSubmittedTicket(null);
            setActivePanel("tickets");
          }}
          className="pill-secondary"
        >
          View My Tickets
        </button>
        <button
          onClick={() => setSubmittedTicket(null)}
          className="pill-secondary"
        >
          Submit Another
        </button>
        {user ? (
          <Link to="/app" className="pill-cta">Go To Dashboard</Link>
        ) : (
          <Link to="/" className="pill-cta">Back To Home</Link>
        )}
      </div>
    </div>
  );

  // Tabs layout
  const panelTabs = (
    <div className="flex border-b border-border pb-px mb-6">
      <button
        type="button"
        onClick={() => {
          setSubmittedTicket(null);
          setActivePanel("submit");
        }}
        className={`pb-3 font-display text-sm font-bold tracking-tight border-b-2 px-4 transition-all ${
          activePanel === "submit" && !submittedTicket
            ? "border-primary text-foreground"
            : "border-transparent text-muted-foreground hover:text-foreground"
        }`}
      >
        Submit a Ticket
      </button>
      <button
        type="button"
        onClick={() => {
          setSubmittedTicket(null);
          setActivePanel("tickets");
        }}
        className={`pb-3 font-display text-sm font-bold tracking-tight border-b-2 px-4 transition-all ${
          activePanel === "tickets"
            ? "border-primary text-foreground"
            : "border-transparent text-muted-foreground hover:text-foreground"
        }`}
      >
        My Tickets {userTickets.length > 0 && `(${userTickets.length})`}
      </button>
    </div>
  );

  // Contact Details column
  const contactDetailsPanel = (
    <div className="space-y-6">
      {/* ISO Channels card */}
      <div className="bg-card border border-border rounded-[28px] p-6 shadow-card space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />
        
        <div>
          <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            ISO Compliance Board
          </h3>
          <p className="text-xs text-muted-foreground mt-1">Direct corporate resolution channels.</p>
        </div>

        <div className="space-y-4">
          <a href="mailto:o.kolawole@oak-global.com.ng" className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-background/50 hover:bg-secondary/40 transition group">
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition">
              <Mail className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Corporate Affairs & Legal</span>
              <span className="text-[10px] sm:text-xs font-semibold text-foreground group-hover:text-primary transition block whitespace-nowrap">
                o.kolawole@oak-global.com.ng
              </span>
            </div>
          </a>

          <a href="mailto:info@oak-global.com.ng" className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-background/50 hover:bg-secondary/40 transition group">
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition">
              <Mail className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">General Inquiries</span>
              <span className="text-sm font-semibold text-foreground group-hover:text-primary transition break-all block">
                info@oak-global.com.ng
              </span>
            </div>
          </a>

          <a href="tel:+2348023644148" className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-background/50 hover:bg-secondary/40 transition group">
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Support Board Phone</span>
              <span className="text-sm font-semibold text-foreground group-hover:text-primary transition">
                +234 802 364 4148
              </span>
            </div>
          </a>
        </div>
      </div>

      {/* Support SLA card */}
      <div className="bg-card border border-border rounded-[28px] p-6 shadow-card space-y-4">
        <h4 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
          <Clock className="h-4.5 w-4.5 text-primary" />
          Support Desk SLA
        </h4>
        <div className="text-xs text-muted-foreground space-y-2.5">
          <div className="flex justify-between items-center py-1 border-b border-border/50">
            <span>Operating Hours</span>
            <span className="font-bold text-foreground">9:00 AM - 5:00 PM</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-border/50">
            <span>Business Days</span>
            <span className="font-bold text-foreground">Monday - Friday (WAT)</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span>Resolution Target</span>
            <span className="font-bold text-success flex items-center gap-1">Under 24 Hours</span>
          </div>
        </div>
      </div>
    </div>
  );

  // If the user is logged in, wrap inside the Application Shell
  if (user) {
    return (
      <AppShell>
        <div className="max-w-6xl mx-auto mt-4 px-4 pb-12 animate-fade-in-up">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Panel: Ticket forms and lists */}
            <div className="lg:col-span-2 bg-card border border-border rounded-[28px] p-6 sm:p-8 shadow-card flex flex-col justify-between">
              <div>
                {panelTabs}
                {submittedTicket ? successView : (activePanel === "submit" ? formView : ticketsListView)}
              </div>
            </div>

            {/* Right Panel: Official Contact Details */}
            {contactDetailsPanel}
          </div>
        </div>
      </AppShell>
    );
  }

  // Guest layout for anonymous landing-page visitors
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between overflow-x-hidden relative">
      {/* Decorative meshes */}
      <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-primary/10 blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-accent/10 blur-[100px] -z-10" />

      {/* Guest top navigation bar */}
      <header className="border-b border-border bg-card/85 backdrop-blur py-4 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 min-w-0">
            <img src={logo} alt="Logo" className="h-8 w-auto shrink-0 object-contain" />
            <div className="flex flex-col min-w-0">
              <span className="font-display text-[12px] sm:text-[13px] font-extrabold text-foreground leading-none truncate uppercase">
                OakAudix
              </span>
              <span className="font-display text-[8.5px] sm:text-[9.5px] text-muted-foreground font-normal leading-none mt-0.5 tracking-wide block">
                Powered By OakAudix
              </span>
            </div>
          </Link>
          <Link to="/" className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
        </div>
      </header>

      {/* Guest content */}
      <main className="flex-1 max-w-6xl w-full mx-auto py-12 px-4 relative z-10">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Panel: Ticket forms and lists */}
          <div className="lg:col-span-2 bg-card border border-border rounded-[32px] p-6 sm:p-8 shadow-card premium-glass-card">
            {panelTabs}
            {submittedTicket ? successView : (activePanel === "submit" ? formView : ticketsListView)}
          </div>

          {/* Right Panel: Official Contact Details */}
          {contactDetailsPanel}
        </div>
      </main>

      {/* Guest footer */}
      <footer className="border-t border-border bg-card/80 py-5 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} OakAudix. All rights reserved.</span>
          <span>
            Built by{" "}
            <a 
              href="http://tmb.it.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="font-bold text-primary hover:underline transition"
            >
              TMB
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
