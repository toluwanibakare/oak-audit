# OakAudix Enterprise Workflow Engine — Build Plan

## Scope

This is a large feature. To ship something fully functional (not a mock), I will build a **client-side workflow engine** persisted to `localStorage` — no backend required. Everything the spec asks for is modelled as data + rules in a typed engine, so a Lovable Cloud backend can be swapped in later without redesigning the UI.

If you want persistence across devices, sign-in, real emails/SMS/Teams, or true multi-user RBAC, say the word and I'll enable Lovable Cloud and migrate the store — the engine interface stays the same.

## What ships in this build

### 1. Workflow engine (`src/lib/workflow/`)
- **Types**: `AuditType`, `Standard`, `StageId` (9 stages), `StageStatus` (Draft, Pending Approval, Approved, Rejected, Completed, Cancelled, Locked, Scheduled, In Progress), `Role`, `Finding`, `CAPA`, `AuditProgramme`, `StageState`, `AuditTrailEntry`, `Notification`.
- **Config-driven stage registry**: array of stage definitions (id, label, entry criteria fn, validation fn, allowed transitions, required approvals, notification triggers). Adding/removing/reordering stages = editing this array. This is the "no redevelopment" requirement.
- **Transition function**: `transition(audit, stageId, action, actor)` → validates entry criteria + role permission, writes audit trail, emits notifications, advances to next stage on approval.
- **RBAC matrix**: role → {view, create, edit, approve, close, delete, export} per stage.
- **Store**: Zustand + `localStorage` persistence. Selectors for dashboard widgets.
- **Notification bus**: in-app notifications written to store; adapters stubbed for email/SMS/Teams/Slack (channel + payload logged, ready to wire).
- **Audit trail**: append-only log capturing who/what/when/old/new/reason. UI shows it read-only.

### 2. Workflow UI (`src/routes/workflow.tsx` + stage drawers)
- **Programme list** with filters (type, standard, status, site, department).
- **New Programme wizard** covering all Stage 1 fields (type, standard, site, department, objectives, scope, criteria, lead auditor, team, risk priority, target date, duration, approvers).
- **Stage board**: 9 clickable cards in the exact order shown, each displaying status, % complete, responsible person, due date, dependencies, approval status, activity timeline, comments, evidence count, notification status. Locked stages show why (entry criteria not met).
- **Stage drawers** — one per stage — with the fields, question types, business rules, and validations from the spec:
  - Scheduling: calendar/month/week list views, conflict detection, reminders.
  - Checklists: library reuse + clause mapping (integrates with existing `checklists.tsx`).
  - Mobile inspection: form supporting all question types (Yes/No, Pass/Fail, Rating, Dropdown, Text, Photo, Video, GPS, Barcode, QR, Date, Number, File), offline flag (stored locally, "sync" button), timestamp, GPS capture, signature pad.
  - Findings: full finding schema, categories, risk (severity × probability), evidence uploads (stored as data URLs in localStorage with size cap + warning).
  - CAPA: auto-generated from findings, owner, dates, status board, overdue detection, colour-coded priorities.
  - Verification: enforces verifier ≠ CAPA owner; effectiveness checklist.
  - Closure: blocks close if outstanding Major NC / pending CAPA / missing approval; generates report (HTML + print-to-PDF, JSON export).
  - History & Analytics: trends, recurring findings, department/site/auditor ranking, CAPA closure rate, compliance score, risk heat map. Export to JSON/CSV (PDF via print; PowerPoint/Word/Excel are out of scope for a browser-only build — I'll note this in the UI).

### 3. Role switcher (top bar)
Since there's no auth yet, a role selector lets you act as Administrator, Audit Manager, Lead Auditor, Auditor, Reviewer, Department Head, CAPA Owner, Executive, or Read-Only. Permissions in the engine react immediately — this proves RBAC works and is the seam where real auth plugs in.

### 4. Dashboard widgets (`src/routes/index.tsx` lifecycle section stays; new `/dashboard` route)
Open Audits, Completed Audits, Audit Progress, Open Findings, CAPA Status, Overdue Actions, Compliance Score, Risk Heat Map, Upcoming Audits, Department / Site / Auditor Performance. All computed live from the store.

### 5. Admin panel (`/admin/workflow`)
Edit stage config: reorder stages, toggle required approvals, edit notification rules per stage, edit RBAC matrix. Changes persist to localStorage and take effect immediately — this is the "configurable through an administration panel" requirement.

### 6. AI-readiness seams
Each stage exposes hook points: `onProgrammeCreated`, `onChecklistNeeded`, `onFindingCreated`, `onCAPADrafted`, `onClosureSummaryNeeded`. Empty implementations today; wiring Lovable AI Gateway later is a per-hook change, no engine rewrite.

## Explicit non-goals for this build
- Real email / SMS / Teams / Slack delivery (adapters stubbed, notifications visible in-app).
- Cross-device persistence / multi-user (localStorage only).
- Native mobile app (responsive web, offline flag simulated).
- PowerPoint / Word / Excel export (JSON + printable HTML report + CSV instead).
- Real digital signatures with certificates (drawn signature captured as image).

## Technical notes
- All new code TypeScript, in `src/lib/workflow/` and `src/routes/`.
- No new npm deps beyond what's already installed (uses existing shadcn, lucide, tanstack router/query, zustand if not present I'll add it).
- `checklists.tsx` and `process-audits.tsx` stay; the new `/workflow` route is the engine and links out to them for library reuse.
- Nav updated so Workflow, Dashboard, Checklists, Process Audits, Admin are all reachable.

Approve and I'll build it.
