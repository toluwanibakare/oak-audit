<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\AuditSubmittedMail;
use App\Models\AuditModel;
use App\Models\AuditProcess;
use App\Models\Notification;
use App\Models\Organization;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class AuditController extends Controller
{
    public function index(Request $request, string $orgId): JsonResponse
    {
        $query = AuditModel::where('org_id', $orgId);

        if ($request->has('auditor_id')) {
            $auditorId = $request->query('auditor_id');
            $query->where(function ($q) use ($auditorId) {
                $q->where('lead_auditor_id', $auditorId)
                  ->orWhereHas('processes', function ($q) use ($auditorId) {
                      $q->where('auditor_id', $auditorId);
                  });
            });
        }

        $audits = $query->with(['findings', 'answers', 'processes', 'leadAuditor'])
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($audits);
    }

    public function store(Request $request, string $orgId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'nullable|string|max:255',
            'standard' => 'nullable|string|max:100',
            'status' => 'sometimes|string|max:50',
            'wizard_state' => 'nullable|array',
            'scope' => 'nullable|string',
            'criteria' => 'nullable|string',
            'object' => 'nullable|string',
            'conclusion' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'auditee_name' => 'nullable|string|max:255',
            'auditee_email' => 'nullable|string|email',
            'owner' => 'nullable|string|max:255',
            'lead_auditor_id' => 'nullable|string|exists:auditors,id',
            'process_ids' => 'sometimes|array',
            'process_ids.*' => 'string|exists:org_processes,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $audit = AuditModel::create([
            'org_id' => $orgId,
            'created_by' => auth('api')->id(),
            ...$request->only([
                'title', 'standard', 'status', 'scope', 'criteria', 'object',
                'conclusion', 'start_date', 'end_date', 'auditee_name',
                'auditee_email', 'owner', 'lead_auditor_id', 'wizard_state',
            ]),
        ]);

        if ($request->has('process_ids')) {
            foreach ($request->process_ids as $pid) {
                AuditProcess::create([
                    'audit_id' => $audit->id,
                    'process_id' => $pid,
                ]);
            }
        }

        return response()->json($audit->load(['findings', 'answers', 'processes']), 201);
    }

    public function show(string $orgId, string $id): JsonResponse
    {
        $audit = AuditModel::with(['findings', 'answers', 'processes', 'organization', 'creator'])
            ->where('org_id', $orgId)
            ->findOrFail($id);
        return response()->json($audit);
    }

    public function update(Request $request, string $orgId, string $id): JsonResponse
    {
        $audit = AuditModel::where('org_id', $orgId)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'status' => 'sometimes|string|max:50',
            'scope' => 'nullable|string',
            'criteria' => 'nullable|string',
            'object' => 'nullable|string',
            'conclusion' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'started_at' => 'nullable|date',
            'closed_at' => 'nullable|date',
            'auditee_name' => 'nullable|string|max:255',
            'auditee_email' => 'nullable|string|email',
            'owner' => 'nullable|string|max:255',
            'lead_auditor_id' => 'nullable|string|exists:auditors,id',
            'wizard_state' => 'nullable|array',
            'process_ids' => 'sometimes|array',
            'process_ids.*' => 'string|exists:org_processes,id',
            'process_assignments' => 'sometimes|array',
            'process_assignments.*.process_id' => 'required|string|exists:org_processes,id',
            'process_assignments.*.auditor_id' => 'nullable|string|exists:auditors,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $audit->update($request->only([
            'title', 'status', 'scope', 'criteria', 'object',
            'conclusion', 'start_date', 'end_date', 'started_at',
            'closed_at', 'auditee_name', 'auditee_email', 'owner',
            'lead_auditor_id', 'wizard_state',
        ]));

        if ($request->has('process_ids')) {
            $audit->processes()->delete();
            foreach ($request->process_ids as $pid) {
                AuditProcess::create([
                    'audit_id' => $audit->id,
                    'process_id' => $pid,
                ]);
            }
        }

        if ($request->has('process_assignments')) {
            $audit->processes()->delete();
            foreach ($request->process_assignments as $assignment) {
                AuditProcess::create([
                    'audit_id' => $audit->id,
                    'process_id' => $assignment['process_id'],
                    'auditor_id' => $assignment['auditor_id'] ?? null,
                ]);
            }
        }

        return response()->json($audit->fresh()->load(['findings', 'answers', 'processes']));
    }

    public function destroy(string $orgId, string $id): JsonResponse
    {
        $audit = AuditModel::where('org_id', $orgId)->findOrFail($id);
        $audit->delete();
        return response()->json(['message' => 'Audit deleted.']);
    }

    public function take(string $orgId, string $id): JsonResponse
    {
        $audit = AuditModel::where('org_id', $orgId)->findOrFail($id);
        $userId = auth('api')->id();

        // Must be assigned as lead auditor or process auditor
        $isLead = $audit->lead_auditor_id === $userId;
        $isAssigned = $audit->processes()->where('auditor_id', $userId)->exists();

        if (!$isLead && !$isAssigned) {
            abort(403, 'You are not assigned to this audit.');
        }

        if ($audit->status !== 'approved') {
            abort(400, 'Audit must be approved before it can be started.');
        }

        $audit->update(['status' => 'in_progress', 'started_at' => now()]);

        return response()->json($audit->fresh()->load(['findings', 'answers', 'processes', 'leadAuditor']));
    }

    public function submitForReview(Request $request, string $orgId, string $id): JsonResponse
    {
        $audit = AuditModel::where('org_id', $orgId)->findOrFail($id);
        $userId = auth('api')->id();

        // Must be assigned as lead auditor or process auditor
        $isLead = $audit->lead_auditor_id === $userId;
        $isAssigned = $audit->processes()->where('auditor_id', $userId)->exists();

        if (!$isLead && !$isAssigned) {
            abort(403, 'You are not assigned to this audit.');
        }

        if ($audit->status !== 'in_progress') {
            abort(400, 'Audit must be in progress before submitting for review.');
        }

        $audit->update(['status' => 'under_review']);

        // Notify the lead auditor
        if ($audit->lead_auditor_id) {
            $leadAuditor = User::find($audit->lead_auditor_id);
            $submittedBy = $request->user();
            $org = Organization::find($orgId);

            if ($leadAuditor) {
                // Create in-app notification
                Notification::create([
                    'user_id' => $leadAuditor->id,
                    'type' => 'audit_submitted',
                    'title' => 'Audit Submitted for Review',
                    'body' => "{$submittedBy->full_name} has submitted \"{$audit->title}\" for your review.",
                ]);

                // Send email notification
                try {
                    $frontendUrl = config('app.frontend_url', 'http://localhost:5173');
                    $reviewUrl = "{$frontendUrl}/audits/{$orgId}/{$audit->id}";
                    Mail::to($leadAuditor->email)->send(new AuditSubmittedMail(
                        audit: $audit,
                        orgName: $org->name,
                        submittedBy: $submittedBy->full_name,
                        reviewUrl: $reviewUrl,
                    ));
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error('Audit submitted email failed: ' . $e->getMessage());
                }
            }
        }

        return response()->json($audit->fresh()->load(['findings', 'answers', 'processes', 'leadAuditor']));
    }

    public function finalSubmit(Request $request, string $orgId, string $id): JsonResponse
    {
        $audit = AuditModel::where('org_id', $orgId)->findOrFail($id);
        $userId = auth('api')->id();

        // Only the lead auditor can final submit
        if ($audit->lead_auditor_id !== $userId) {
            abort(403, 'Only the lead auditor can submit the final audit.');
        }

        if ($audit->status !== 'under_review') {
            abort(400, 'Audit must be under review before final submission.');
        }

        $audit->update(['status' => 'completed', 'closed_at' => now()]);

        return response()->json($audit->fresh()->load(['findings', 'answers', 'processes', 'leadAuditor']));
    }
}
