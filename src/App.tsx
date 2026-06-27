import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import Landing from "./pages/Landing.tsx";
import Auth from "./pages/Auth.tsx";
import AuthCallback from "./pages/AuthCallback.tsx";
import AppDashboard from "./pages/AppDashboard.tsx";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import ProcessAudit from "./pages/ProcessAudit.tsx";
import PortGapAssessment from "./pages/PortGapAssessment.tsx";
import LegalCompliance from "./pages/LegalCompliance.tsx";
import KpiMonitoring from "./pages/KpiMonitoring.tsx";
import RiskOpportunity from "./pages/RiskOpportunity.tsx";
import Iso27001Audit from "./pages/Iso27001Audit.tsx";
import { AuthProvider } from "./hooks/useAuth";
import { OrgProvider } from "./hooks/useOrg";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Onboarding from "./pages/app/Onboarding";
import Team from "./pages/app/Team";
import Processes from "./pages/app/Processes";
import Licenses from "./pages/app/Licenses";
import Wallet from "./pages/app/Wallet";
import Audits from "./pages/app/Audits";
import NewAudit from "./pages/app/NewAudit";
import RunAudit from "./pages/app/RunAudit";
import AuditReport from "./pages/app/AuditReport";
import Findings from "./pages/app/Findings";
import QuestionBank from "./pages/app/QuestionBank";
import Settings from "./pages/app/Settings";
import MrmWorkspace from "./pages/app/MrmWorkspace";
import AdminDashboard from "./pages/app/AdminDashboard";
import AuditeeCar from "./pages/app/AuditeeCar";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false
    }
  }
});

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => {
  useEffect(() => {
    // 1. Disable Right-Click Context Menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    document.addEventListener("contextmenu", handleContextMenu);

    // 2. Disable DevTools Keyboard Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12 key
      if (e.key === "F12") {
        e.preventDefault();
      }
      // Ctrl+Shift+I (DevTools)
      if (e.ctrlKey && e.shiftKey && e.key === "I") {
        e.preventDefault();
      }
      // Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === "J") {
        e.preventDefault();
      }
      // Ctrl+U (View Source)
      if (e.ctrlKey && e.key === "u") {
        e.preventDefault();
      }
      // Ctrl+S (Save Page)
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    // 3. Print Strict Security Warning Once on Mount
    const warningStyle = "color: #ff3333; font-family: sans-serif; font-size: 2.2em; font-weight: bold; text-shadow: 1px 1px black;";
    const infoStyle = "color: white; background: #0f172a; font-family: monospace; font-size: 1.1em; padding: 6px 12px; border-radius: 6px; border: 1px solid #334155;";
    
    console.log("%cSTOP! Proprietary Software Notice", warningStyle);
    console.log(
      "%cThis platform and all its source files, database schemas, question checklists, and design systems are the highly confidential, proprietary intellectual property of OakAudix.\n\nUnauthorized inspection, duplication, decompilation, scraping, or usage is strictly prohibited under international copyright law and subject to immediate civil and criminal prosecution.",
      "font-size: 1.1em; color: #cbd5e1; line-height: 1.4; margin-bottom: 12px; font-weight: 500;"
    );
    console.log("%cFor licensing inquiries: o.kolawole@oak-global.com.ng", infoStyle);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <AuthProvider>
            <OrgProvider>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/app" element={<ProtectedRoute><AppDashboard /></ProtectedRoute>} />
              <Route path="/app/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
              <Route path="/app/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
              <Route path="/app/processes" element={<ProtectedRoute><Processes /></ProtectedRoute>} />
              <Route path="/app/licenses" element={<ProtectedRoute><Licenses /></ProtectedRoute>} />
              <Route path="/app/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
              <Route path="/app/billing" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
              <Route path="/app/audits" element={<ProtectedRoute><Audits /></ProtectedRoute>} />
              <Route path="/app/audits/new" element={<ProtectedRoute><NewAudit /></ProtectedRoute>} />
              <Route path="/app/audits/:id" element={<ProtectedRoute><RunAudit /></ProtectedRoute>} />
              <Route path="/app/audits/:id/report" element={<ProtectedRoute><AuditReport /></ProtectedRoute>} />
              <Route path="/app/mrm" element={<ProtectedRoute><MrmWorkspace /></ProtectedRoute>} />
              <Route path="/app/findings" element={<ProtectedRoute><Findings /></ProtectedRoute>} />
              <Route path="/app/question-bank" element={<ProtectedRoute><QuestionBank /></ProtectedRoute>} />
              <Route path="/app/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/auditee/car/:findingId" element={<AuditeeCar />} />
              {/* Legacy local-only audit pages */}
              <Route path="/workspace" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/processes-legacy" element={<ProtectedRoute><ProcessAudit /></ProtectedRoute>} />
              <Route path="/gap" element={<ProtectedRoute><PortGapAssessment /></ProtectedRoute>} />
              <Route path="/legal" element={<ProtectedRoute><LegalCompliance /></ProtectedRoute>} />
              <Route path="/kpi" element={<ProtectedRoute><KpiMonitoring /></ProtectedRoute>} />
              <Route path="/risk-opportunity" element={<ProtectedRoute><RiskOpportunity /></ProtectedRoute>} />
              <Route path="/iso27001" element={<ProtectedRoute><Iso27001Audit /></ProtectedRoute>} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </OrgProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
  );
};

export default App;
