import { createFileRoute } from "@tanstack/react-router";
import { ModulePage, FilterBar, WTable, Kanban, WCard, WPlaceholder, WBadge, Annotation } from "@/components/module-page";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/library/forms")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Forms — AuditOS" }, { name: "description", content: "Forms module of the AuditOS ISO management platform." }] }),
  component: Page,
});

function Page() {
  return (
    <ModulePage annotation="09 · LIBRARY" title="Forms">
      <FilterBar filters={["Type","Standard","Date"]} />
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
        {Array.from({length:18}).map((_,i)=>(
          <div key={i} className="wire-card rounded-lg p-2">
            <WPlaceholder height={110} label={["DOC","IMG","PDF","XLS","IMG","AUDIO"][i%6]} />
            <div className="text-xs mt-2 truncate">file-{1000+i}.{ ["pdf","jpg","docx","xlsx"][i%4]}</div>
            <Annotation>2.{i%9} MB</Annotation>
          </div>
        ))}
      </div>
    </ModulePage>
  );
}
