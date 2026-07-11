import { createFileRoute } from "@tanstack/react-router";
import { ModulePage, FilterBar, WTable, Kanban, WCard, WPlaceholder, WBadge, Annotation } from "@/components/module-page";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/risk/register")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Risk Register — AuditOS" }, { name: "description", content: "Risk Register module of the AuditOS ISO management platform." }] }),
  component: Page,
});

function Page() {
  return (
    <ModulePage annotation="06 · RISK" title="Risk Register">
      <div className="grid grid-cols-12 gap-4">
        <WCard className="col-span-12 md:col-span-4" title="Risk Matrix"><WPlaceholder label="5×5 HEAT MAP" height={200} /></WCard>
        <WCard className="col-span-12 md:col-span-4" title="Top Risks">
          {[["R-072","Supply chain disruption","High"],["R-058","Data breach","High"],["R-041","Equipment failure","Medium"],["R-090","Regulatory change","Medium"]].map(([id,t,sev])=>(
            <div key={id} className="flex items-center gap-2 py-2 border-b border-dashed border-border text-xs">
              <span className="font-mono text-[11px] text-muted-foreground">{id}</span>
              <span className="flex-1 truncate">{t}</span>
              <WBadge tone={sev==="High"?"strong":"outline"}>{sev}</WBadge>
            </div>
          ))}
        </WCard>
        <WCard className="col-span-12 md:col-span-4" title="Risk Trends"><WPlaceholder label="LINE CHART · 12M" height={200} /></WCard>
      </div>
      <FilterBar filters={["Likelihood","Impact","Owner","Status"]} />
      <WTable columns={[{key:"Risk ID"},{key:"Description"},{key:"Likelihood"},{key:"Impact"},{key:"Rating"},{key:"Treatment"},{key:"Owner"},{key:"Status"}]}
        rows={Array.from({length:8}).map((_,i)=>[
          <span className="font-mono text-[11px]">R-{50+i}</span>,
          "Sample risk scenario " + (i+1),
          ["L","M","H","M"][i%4], ["M","H","H","L"][i%4],
          <WBadge tone={i%3===0?"strong":"outline"}>{["High","Medium","Low"][i%3]}</WBadge>,
          ["Mitigate","Transfer","Accept","Avoid"][i%4],
          ["M. Chen","R. Patel"][i%2],
          <WBadge>{["Open","Treated","Monitoring"][i%3]}</WBadge>,
        ])}
      />
    </ModulePage>
  );
}
