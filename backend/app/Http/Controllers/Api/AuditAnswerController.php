<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditAnswer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AuditAnswerController extends Controller
{
    public function index(string $auditId): JsonResponse
    {
        $answers = AuditAnswer::where('audit_id', $auditId)->get();
        return response()->json($answers);
    }

    public function store(Request $request, string $auditId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'process_id' => 'required|string|exists:org_processes,id',
            'clause' => 'required|string|max:100',
            'kind' => 'sometimes|string|max:50',
            'q_ref' => 'nullable|string|max:100',
            'question_text' => 'nullable|string',
            'status' => 'sometimes|string|max:50',
            'severity' => 'nullable|string|max:50',
            'note' => 'nullable|string',
            'auditee_name' => 'nullable|string|max:255',
            'auditor_name' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $answer = AuditAnswer::updateOrCreate(
            [
                'audit_id' => $auditId,
                'process_id' => $request->process_id,
                'clause' => $request->clause,
                'kind' => $request->kind ?? 'default',
                'q_ref' => $request->q_ref,
            ],
            $request->only([
                'question_text', 'status', 'severity', 'note',
                'auditee_name', 'auditor_name',
            ])
        );

        return response()->json($answer, 201);
    }

    public function update(Request $request, string $auditId, string $id): JsonResponse
    {
        $answer = AuditAnswer::where('audit_id', $auditId)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'status' => 'sometimes|string|max:50',
            'severity' => 'nullable|string|max:50',
            'note' => 'nullable|string',
            'auditee_name' => 'nullable|string|max:255',
            'auditor_name' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $answer->update($request->only([
            'status', 'severity', 'note', 'auditee_name', 'auditor_name',
        ]));

        return response()->json($answer);
    }
}
