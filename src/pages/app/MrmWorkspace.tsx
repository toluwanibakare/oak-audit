import { AppShell } from "@/components/app/AppShell";
import { Download, FileText, CheckCircle2, Award, Info } from "lucide-react";
import { Header } from "./Team";

export default function MrmWorkspace() {
  const templates = [
    {
      title: "ISO 9001 Management Review Minutes (MoM) Template",
      fileName: "ISO9001_Management_Review_MoM_Template.pdf",
      downloadPath: "/ISO9001_Management_Review_MoM_Template.pdf",
      description: "A comprehensive executive-level document designed to guide top management reviews of your Quality Management System (QMS). Complete with attendee tables, gap analysis forms, and action tracking logs.",
      highlights: [
        "Fully aligned with ISO 9001:2015 Clause 9.3 standards",
        "Pre-formatted sections for QMS objectives review",
        "Action tracker for prior MRM follow-ups",
        "Strategic decision log and formal approval sign-off blocks"
      ],
      usageHint: "Conduct this quality review meeting after completing your internal audits to ensure QMS adequacy and strategic alignment."
    },
    {
      title: "IMS Management Review Minutes (MoM) Template",
      fileName: "IMS_Management_Review_MoM_Template.pdf",
      downloadPath: "/IMS_Management_Review_MoM_Template.pdf",
      description: "A premium integrated template for organizations operating complex systems covering ISO 9001 (Quality), 14001 (Environment), and 45001 (Occupational Health & Safety).",
      highlights: [
        "Covers three key international ISO standards in one unified flow",
        "Contains environmental aspect matrices & energy metrics",
        "Dedicated OH&S safety performance & incident logs",
        "Worker participation and legal compliance evaluation checklists"
      ],
      usageHint: "Use this integrated template to run high-impact executive meetings reviewing your consolidated safety, quality, and environmental metrics."
    }
  ];

  return (
    <AppShell>
      <Header 
        title="Management Review" 
        subtitle="Access and download certified executive templates to guide your post-audit reviews." 
      />

      <div className="mt-8 rounded-[30px] border border-border bg-card p-8 shadow-card max-w-5xl">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center border-b border-border pb-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">Exclusive Workspace Benefits</h2>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
              As an exclusive benefit of using the OAK Global International GRC Platform, you get direct access to our premium, audit-proven management guides. Use these industry-standard minutes (MoM) templates to run high-yield reviews with top management and regulatory panels.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {templates.map((tpl) => (
            <div 
              key={tpl.fileName} 
              className="group relative flex flex-col justify-between rounded-3xl border border-border bg-background/40 p-6 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Certified Document Template</span>
                </div>

                <h3 className="font-display text-lg font-bold text-foreground leading-snug group-hover:text-primary transition duration-200">
                  {tpl.title}
                </h3>
                
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {tpl.description}
                </p>

                <div className="rounded-2xl bg-secondary/40 p-4 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">Key Document Inclusions:</span>
                  <ul className="space-y-1.5">
                    {tpl.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-border/60">
                <div className="flex items-start gap-2.5 text-xs text-muted-foreground mb-4">
                  <Info className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                  <span className="leading-normal">{tpl.usageHint}</span>
                </div>

                <a 
                  href={tpl.downloadPath} 
                  download={tpl.fileName} 
                  className="pill-cta w-full flex items-center justify-center gap-2 group/btn animate-none"
                >
                  <Download className="h-4 w-4 transition group-hover/btn:-translate-y-0.5" />
                  <span>Download MoM Template</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
