import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
              {/* Legacy local-only audit pages */}
              <Route path="/workspace" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/processes-legacy" element={<ProtectedRoute><ProcessAudit /></ProtectedRoute>} />
              <Route path="/gap" element={<ProtectedRoute><PortGapAssessment /></ProtectedRoute>} />
              <Route path="/legal" element={<ProtectedRoute><LegalCompliance /></ProtectedRoute>} />
              <Route path="/kpi" element={<ProtectedRoute><KpiMonitoring /></ProtectedRoute>} />
              <Route path="/risk-opportunity" element={<ProtectedRoute><RiskOpportunity /></ProtectedRoute>} />
              <Route path="/iso27001" element={<ProtectedRoute><Iso27001Audit /></ProtectedRoute>} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </OrgProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
