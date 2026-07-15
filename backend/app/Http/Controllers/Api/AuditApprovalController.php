<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditModel;
use App\Models\AuditApproval;
use App\Models\Auditor;
use App\Models\Notification;
use App\Models\Organization;
use App\Models\User;
use App\Mail\AuditApprovalMail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class AuditApprovalController extends Controller
{
    public function index(string $orgId, string $auditId): JsonResponse
    {
        $audit = AuditModel::where('org_id', $orgId)->findOrFail($auditId);
        $stages = AuditApproval::where('audit_id', $audit->id)
            ->orderBy('sort_order')
            ->get();
        return response()->json([
            'audit' => $audit->load(['organization', 'creator']),
            'stages' => $stages,
        ]);
    }

    public function submit(Request $request, string $orgId, string $auditId): JsonResponse
    {
        $audit = AuditModel::where('org_id', $orgId)->findOrFail($auditId);
        $org = Organization::findOrFail($orgId);

        $validator = Validator::make($request->all(), [
            'allow_auditee' => 'boolean',
            'auditee_name' => 'nullable|string|max:255',
            'auditee_email' => 'nullable|email',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if (!$org->manager_id) {
            return response()->json(['error' => 'No manager assigned to this organization. Please set a manager first.'], 422);
        }

        $manager = $org->manager;
        if (!$manager) {
            return response()->json(['error' => 'Manager account not found.'], 422);
        }

        $leadName = null;
        $leadEmail = null;
        if ($audit->leadAuditor) {
            $leadName = $audit->leadAuditor->name;
            $leadEmail = $audit->leadAuditor->email;
        } else {
            $ws = $audit->wizard_state ?? [];
            $leadNameFromWs = $ws['leadId'] ?? null;
            if ($leadNameFromWs) {
                $auditor = Auditor::where('org_id', $orgId)->where('name', $leadNameFromWs)->first();
                if ($auditor) {
                    $leadName = $auditor->name;
                    $leadEmail = $auditor->email;
                } else {
                    $leadName = $leadNameFromWs;
                }
            }
        }

        AuditApproval::where('audit_id', $audit->id)->delete();

        $stages = [];
        $sortOrder = 0;

        // Stage 1: Manager (required)
        $stages[] = AuditApproval::create([
            'audit_id' => $audit->id,
            'stage' => 'Manager',
            'approver_name' => $manager->full_name,
            'approver_email' => $manager->email,
            'is_required' => true,
            'sort_order' => $sortOrder++,
            'status' => 'pending',
        ]);

        // Stage 2: Lead Auditor (required)
        if ($leadEmail) {
            $stages[] = AuditApproval::create([
                'audit_id' => $audit->id,
                'stage' => 'Lead Auditor',
                'approver_name' => $leadName ?? 'Lead Auditor',
                'approver_email' => $leadEmail,
                'is_required' => true,
                'sort_order' => $sortOrder++,
                'status' => 'pending',
            ]);
        }

        // Stage 3: Auditee/Process Owner (optional)
        if ($request->allow_auditee) {
            $auditeeName = $request->auditee_name;
            $auditeeEmail = $request->auditee_email;
            // If not provided via request, try to auto-lookup from entity_data processes
            if (!$auditeeName || !$auditeeEmail) {
                $ws = $audit->wizard_state ?? [];
                $depts = $ws['departments'] ?? [];
                if (!empty($depts)) {
                    $entityProcess = \App\Models\EntityData::where('org_id', $orgId)
                        ->where('entity_type', 'processes')
                        ->get()
                        ->first(function ($ep) use ($depts) {
                            $data = $ep->data;
                            $dept = $data['department'] ?? '';
                            return in_array($dept, $depts) && !empty($data['owner_email']);
                        });
                    if ($entityProcess) {
                        $auditeeName = $entityProcess->data['owner'] ?? null;
                        $auditeeEmail = $entityProcess->data['owner_email'] ?? null;
                    }
                }
            }
            if ($auditeeName && $auditeeEmail) {
                $stages[] = AuditApproval::create([
                    'audit_id' => $audit->id,
                    'stage' => 'Auditee/Process Owner',
                    'approver_name' => $auditeeName,
                    'approver_email' => $auditeeEmail,
                    'is_required' => true,
                    'sort_order' => $sortOrder++,
                    'status' => 'pending',
                ]);
                $audit->update([
                    'auditee_name' => $auditeeName,
                    'auditee_email' => $auditeeEmail,
                ]);
            }
        }

        $audit->update(['status' => 'pending_approval']);

        if (!empty($stages)) {
            $this->notifyStage($stages[0], $audit, $orgId);
        }

        return response()->json([
            'message' => 'Audit submitted for approval.',
            'stages' => AuditApproval::where('audit_id', $audit->id)->orderBy('sort_order')->get(),
        ]);
    }

    public function approve(Request $request, string $orgId, string $auditId, string $stageId): JsonResponse
    {
        $audit = AuditModel::where('org_id', $orgId)->findOrFail($auditId);
        $stage = AuditApproval::where('audit_id', $audit->id)->findOrFail($stageId);

        if ($stage->status !== 'notified' && $stage->status !== 'in_review') {
            return response()->json(['error' => 'Stage is not awaiting approval.'], 422);
        }

        $stage->update([
            'status' => 'approved',
            'comment' => $request->comment,
            'responded_at' => now(),
        ]);

        $this->createNotification($audit, "{$stage->stage} approved", "{$stage->stage} has approved \"{$audit->title}\".");

        $allRequiredApproved = AuditApproval::where('audit_id', $audit->id)
            ->where('is_required', true)
            ->where('status', '!=', 'approved')
            ->doesntExist();

        if ($allRequiredApproved) {
            $audit->update(['status' => 'approved', 'started_at' => now()]);
            $this->createNotification($audit, 'Audit Approved', "All required approvals received. \"{$audit->title}\" can now start.");
        } else {
            $next = AuditApproval::where('audit_id', $audit->id)
                ->where('status', 'pending')
                ->orderBy('sort_order')
                ->first();
            if ($next) {
                $this->notifyStage($next, $audit, $orgId);
            }
        }

        return response()->json([
            'message' => 'Stage approved.',
            'audit_status' => $audit->fresh()->status,
            'stages' => AuditApproval::where('audit_id', $audit->id)->orderBy('sort_order')->get(),
        ]);
    }

    public function reject(Request $request, string $orgId, string $auditId, string $stageId): JsonResponse
    {
        $audit = AuditModel::where('org_id', $orgId)->findOrFail($auditId);
        $stage = AuditApproval::where('audit_id', $audit->id)->findOrFail($stageId);

        if ($stage->status !== 'notified' && $stage->status !== 'in_review') {
            return response()->json(['error' => 'Stage is not awaiting approval.'], 422);
        }

        $validator = Validator::make($request->all(), [
            'comment' => 'required|string|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $stage->update([
            'status' => 'rejected',
            'comment' => $request->comment,
            'responded_at' => now(),
        ]);

        $audit->update(['status' => 'rejected']);

        $this->createNotification($audit, "{$stage->stage} rejected", "{$stage->stage} rejected \"{$audit->title}\". Reason: {$request->comment}");

        return response()->json([
            'message' => 'Stage rejected.',
            'audit_status' => $audit->fresh()->status,
            'stages' => AuditApproval::where('audit_id', $audit->id)->orderBy('sort_order')->get(),
        ]);
    }

    private function notifyStage(AuditApproval $stage, AuditModel $audit, string $orgId): void
    {
        $org = Organization::find($orgId);
        $orgName = $org ? $org->name : 'Your Organization';
        $approvalUrl = config('app.frontend_url') . "/audits/{$audit->id}/approval?token={$audit->id}";

        $stage->update(['status' => 'notified', 'notified_at' => now()]);

        try {
            Mail::to($stage->approver_email)->send(new AuditApprovalMail($audit, $stage, $approvalUrl, $orgName));
        } catch (\Exception $e) {
            \Log::error("Failed to send approval email to {$stage->approver_email}: {$e->getMessage()}");
        }

        $this->createNotification($audit, "Approval needed: {$stage->stage}", "{$stage->stage} — Please review and approve \"{$audit->title}\".");
    }

    private function createNotification(AuditModel $audit, string $title, string $body): void
    {
        try {
            $user = User::where('email', $audit->creator->email ?? '')->first();
            if ($user) {
                Notification::create([
                    'user_id' => $user->id,
                    'type' => 'audit_approval',
                    'title' => $title,
                    'body' => $body,
                    'data' => ['audit_id' => $audit->id],
                ]);
            }
        } catch (\Exception $e) {
            \Log::error("Failed to create notification: {$e->getMessage()}");
        }
    }
}
