<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Finding;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FindingController extends Controller
{
    public function index(Request $request, string $orgId): JsonResponse
    {
        $query = Finding::with('audit')->where('org_id', $orgId);

        if ($request->has('audit_id')) {
            $query->where('audit_id', $request->audit_id);
        }

        $findings = $query->orderBy('created_at', 'desc')->get();
        return response()->json($findings);
    }

    public function store(Request $request, string $orgId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'audit_id' => 'required|string|exists:audits,id',
            'type' => 'sometimes|string|max:50',
            'clause' => 'nullable|string|max:100',
            'description' => 'required|string',
            'capa' => 'nullable|string',
            'owner' => 'nullable|string|max:255',
            'status' => 'sometimes|string|max:50',
            'due_date' => 'nullable|date',
            'root_cause' => 'nullable|string',
            'auditor_comment' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $finding = Finding::create([
            'org_id' => $orgId,
            ...$request->only([
                'audit_id', 'type', 'clause', 'description', 'capa',
                'owner', 'status', 'due_date', 'root_cause', 'auditor_comment',
            ]),
        ]);

        return response()->json($finding->load('audit'), 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $finding = Finding::whereHas('organization', function ($q) {
            $q->where('created_by', auth('api')->id());
        })->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'type' => 'sometimes|string|max:50',
            'clause' => 'nullable|string|max:100',
            'description' => 'sometimes|string',
            'capa' => 'nullable|string',
            'owner' => 'nullable|string|max:255',
            'status' => 'sometimes|string|max:50',
            'due_date' => 'nullable|date',
            'root_cause' => 'nullable|string',
            'auditor_comment' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $finding->update($request->only([
            'type', 'clause', 'description', 'capa', 'owner',
            'status', 'due_date', 'root_cause', 'auditor_comment',
        ]));

        return response()->json($finding->load('audit'));
    }

    public function show(string $id): JsonResponse
    {
        $finding = Finding::with('audit.organization')->findOrFail($id);
        return response()->json($finding);
    }

    public function uploadEvidence(Request $request, string $id): JsonResponse
    {
        $finding = Finding::with('audit')->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'file' => 'required|file|max:102400',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $file = $request->file('file');
        $storedPath = $file->store("evidence/{$finding->audit_id}/car/{$id}", 'public');
        $url = \Illuminate\Support\Facades\Storage::url($storedPath);

        return response()->json([
            'path' => $storedPath,
            'url' => $url,
            'name' => $file->getClientOriginalName(),
            'size' => $file->getSize(),
            'mime' => $file->getMimeType(),
        ], 201);
    }

    public function submitCar(Request $request, string $id): JsonResponse
    {
        $finding = Finding::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'correction' => 'required|string',
            'root_cause_text' => 'required|string',
            'capa' => 'required|string',
            'evidence' => 'sometimes|array',
            'evidence.*' => 'string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $meta = null;
        if ($finding->root_cause && str_starts_with($finding->root_cause, 'AUTO_META:')) {
            $meta = json_decode(substr($finding->root_cause, strlen('AUTO_META:')), true);
        }

        $updatedMeta = array_merge($meta ?? [], [
            'correction' => $request->correction,
            'rootCauseText' => $request->root_cause_text,
            'evidence' => $request->input('evidence', []),
        ]);

        $finding->update([
            'capa' => $request->capa,
            'root_cause' => 'AUTO_META:' . json_encode($updatedMeta),
            'status' => 'under_review',
            'auditor_comment' => null,
        ]);

        return response()->json($finding->load('audit.organization'));
    }

    public function destroy(string $id): JsonResponse
    {
        $finding = Finding::whereHas('organization', function ($q) {
            $q->where('created_by', auth('api')->id());
        })->findOrFail($id);
        $finding->delete();
        return response()->json(['message' => 'Finding deleted']);
    }
}
