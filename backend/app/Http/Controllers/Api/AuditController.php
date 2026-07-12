<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditModel;
use App\Models\AuditProcess;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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
            'title' => 'required|string|max:255',
            'standard' => 'required|string|max:100',
            'status' => 'sometimes|string|max:50',
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
                'auditee_email', 'owner', 'lead_auditor_id',
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
            'closed_at', 'auditee_name', 'auditee_email', 'owner', 'lead_auditor_id',
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
}
