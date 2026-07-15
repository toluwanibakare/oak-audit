import { createFileRoute, Link } from "@tanstack/react-router";
import { ModulePage } from "@/components/module-page";
import { WCard, WBadge } from "@/components/wire";
import { requireAuth } from "@/lib/require-auth";
import { useState, useEffect } from "react";
import { orgsApi } from "@/lib/api/orgs";
import apiClient from "@/lib/api/client";

export const Route = createFileRoute("/audits/calendar")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Audit Calendar — OakAudix" }, { name: "description", content: "Audit Calendar" }] }),
  component: Page,
});

type View = "month" | "week" | "day";

const YEAR = 2026;
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

interface CalendarAudit {
  id: string;
  name: string;
  standard: string;
  dept: string;
  date: string;
  status: string;
}

function Page() {
  const [view, setView] = useState<View>("month");
  const [monthOffset, setMonthOffset] = useState(0);
  const [audits, setAudits] = useState<CalendarAudit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const orgs = await orgsApi.list();
        if (orgs.length > 0) {
          const res = await apiClient.get<{ id: string; title: string; standard: string; scope: string; start_date: string; status: string; leadAuditor?: { name: string } }[]>(
            `/organizations/${orgs[0].id}/audits`
          );
          const mapped: CalendarAudit[] = res.data.map((a) => ({
            id: a.id.substring(0, 12),
            name: a.title ?? "",
            standard: a.standard ?? "",
            dept: a.scope ?? a.standard ?? "",
            date: a.start_date,
            status: a.status ?? "",
          }));
          setAudits(mapped);
        }
      } catch {
        // Fallback: empty
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const now = new Date();
  const baseMonth = now.getFullYear() === YEAR ? now.getMonth() : 6;
  const m = (baseMonth + monthOffset + 12) % 12;
  const y = YEAR + Math.floor((baseMonth + monthOffset) / 12);
  const monthLabel = `${MONTH_NAMES[m]} ${y}`;

  const byDay = new Map<number, CalendarAudit[]>();
  for (const a of audits) {
    const d = a.date ? new Date(a.date) : null;
    if (!d || d.getMonth() !== m || d.getFullYear() !== y) continue;
    const arr = byDay.get(d.getDate()) ?? [];
    arr.push(a);
    byDay.set(d.getDate(), arr);
  }

  const firstDay = new Date(y, m, 1);
  const lastDay = new Date(y, m + 1, 0);
  const startDow = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const totalCells = Math.ceil((startDow + daysInMonth) / 7) * 7;

  const today = new Date();

  return (
    <ModulePage title="Audit Calendar">
      <WCard
        title={`Audit Calendar — ${monthLabel}`}
        actions={
          <div className="flex items-center gap-2">
            <WBadge tone="outline">{audits.length} total</WBadge>
            <div className="flex gap-1">
              {(["month", "week", "day"] as View[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide transition-all cursor-pointer ${
                    view === v
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        }
      >
        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">Loading calendar...</div>
        ) : (
          <>
            {view === "month" && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <button onClick={() => setMonthOffset((o) => o - 1)} className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    ← Previous
                  </button>
                  <button onClick={() => setMonthOffset(0)} className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    Today
                  </button>
                  <button onClick={() => setMonthOffset((o) => o + 1)} className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    Next →
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-px bg-border rounded-md overflow-hidden">
                  {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
                    <div key={d} className="bg-muted/40 p-2 annotation text-center">{d}</div>
                  ))}
                  {Array.from({ length: totalCells }).map((_, i) => {
                    const dayNum = i - startDow + 1;
                    const inMonth = dayNum >= 1 && dayNum <= daysInMonth;
                    const dayAudits = inMonth ? byDay.get(dayNum) ?? [] : [];
                    const isToday = inMonth && dayNum === today.getDate() && m === today.getMonth() && y === today.getFullYear();
                    return (
                      <div
                        key={i}
                        className={`min-h-[96px] p-2 text-xs ${inMonth ? "bg-card" : "bg-muted/20 text-muted-foreground"} ${isToday ? "ring-1 ring-primary ring-inset" : ""}`}
                      >
                        <div className={`annotation mb-1 ${isToday ? "bg-primary text-primary-foreground rounded-full w-5 h-5 grid place-items-center" : ""}`}>
                          {inMonth ? dayNum : ""}
                        </div>
                        {dayAudits.map((a) => (
                          <div
                            key={a.id}
                            className="mt-1 rounded border border-border text-[10px] px-1 py-0.5 truncate bg-card hover:bg-muted transition-colors cursor-default"
                            title={`${a.id} · ${a.name} · ${a.status}`}
                          >
                            {a.standard.split(":")[0]} · {a.dept}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {view === "week" && (
              <WeekView m={m} y={y} audits={audits} />
            )}

            {view === "day" && (
              <DayView m={m} y={y} audits={audits} />
            )}

            <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-6 rounded border border-border bg-card" />
                <span>Scheduled audit</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-6 rounded bg-primary" />
                <span>Today</span>
              </div>
            </div>
          </>
        )}
      </WCard>
    </ModulePage>
  );
}

function WeekView({ m, y, audits }: { m: number; y: number; audits: CalendarAudit[] }) {
  const today = new Date();
  const startOfWeek = new Date(y, m, today.getDate() - today.getDay());
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return d;
  });
  const byDay = new Map<string, CalendarAudit[]>();
  for (const a of audits) {
    if (!a.date) continue;
    const key = new Date(a.date).toDateString();
    const arr = byDay.get(key) ?? [];
    arr.push(a);
    byDay.set(key, arr);
  }
  return (
    <div className="grid grid-cols-7 gap-px bg-border rounded-md overflow-hidden">
      {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
        <div key={d} className="bg-muted/40 p-2 annotation text-center">{d}</div>
      ))}
      {days.map((d) => {
        const isToday = d.toDateString() === today.toDateString();
        const dayAudits = byDay.get(d.toDateString()) ?? [];
        return (
          <div key={d.toDateString()} className={`min-h-[120px] p-2 text-xs bg-card ${isToday ? "ring-1 ring-primary ring-inset" : ""}`}>
            <div className={`annotation mb-1 ${isToday ? "bg-primary text-primary-foreground rounded-full w-5 h-5 grid place-items-center" : ""}`}>
              {d.getDate()}
            </div>
            {dayAudits.map((a) => (
              <div key={a.id} className="mt-1 rounded border border-border text-[10px] px-1 py-0.5 truncate hover:bg-muted transition-colors cursor-default">
                {a.standard.split(":")[0]} · {a.dept}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function DayView({ m, y, audits }: { m: number; y: number; audits: CalendarAudit[] }) {
  const today = new Date();
  const dayAudits = audits.filter((a) => {
    if (!a.date) return false;
    const d = new Date(a.date);
    return d.getDate() === today.getDate() && d.getMonth() === m && d.getFullYear() === y;
  });
  return (
    <div className="text-center py-8">
      <div className="text-lg font-semibold">{today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</div>
      {dayAudits.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">No audits scheduled for today.</p>
      ) : (
        <ul className="mt-4 space-y-2 max-w-md mx-auto text-left">
          {dayAudits.map((a) => (
            <li key={a.id} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
              <div>
                <div className="font-medium">{a.name}</div>
                <div className="text-xs text-muted-foreground">{a.standard} · {a.dept}</div>
              </div>
              <WBadge tone="outline">{a.status}</WBadge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
