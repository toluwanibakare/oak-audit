<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditProcess;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AuditProcessController extends Controller
{
    public function index(string $auditId): JsonResponse
    {
        $processes = AuditProcess::with(['process:id,key,name', 'auditor:id,name'])
            ->where('audit_id', $auditId)
            ->get();

        return response()->json($processes);
    }

    public function store(Request $request, string $auditId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'process_id' => 'required|string|exists:org_processes,id',
            'auditor_id' => 'nullable|string|exists:auditors,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $record = AuditProcess::create([
            'audit_id' => $auditId,
            'process_id' => $request->process_id,
            'auditor_id' => $request->auditor_id,
        ]);

        return response()->json($record, 201);
    }

    public function update(Request $request, string $auditId, string $processId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'auditor_id' => 'nullable|string|exists:auditors,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $record = AuditProcess::where('audit_id', $auditId)
            ->where('process_id', $processId)
            ->firstOrFail();

        $record->update($request->only(['auditor_id']));

        return response()->json($record);
    }
}
