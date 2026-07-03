import { AppShell } from "@/components/app/AppShell";
import { Header } from "./Team";

export default function AdminDashboard() {
  return (
    <AppShell>
      <Header title="Admin Dashboard" subtitle="Platform management is being migrated." />
      <div className="mt-6 rounded-2xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
        Admin features will be re-implemented on the Laravel backend. Check back later.
      </div>
    </AppShell>
  );
}
