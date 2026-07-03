<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Auditor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AuditorController extends Controller
{
    public function index(string $orgId): JsonResponse
    {
        $auditors = Auditor::where('org_id', $orgId)->get();
        return response()->json($auditors);
    }

    public function store(Request $request, string $orgId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'nullable|string|email',
            'user_id' => 'nullable|string|exists:users,id',
            'role' => 'nullable|string|max:100',
            'certifications' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $auditor = Auditor::create([
            'org_id' => $orgId,
            ...$request->only(['name', 'email', 'user_id', 'role', 'certifications']),
        ]);

        return response()->json($auditor, 201);
    }

    public function update(Request $request, string $orgId, string $id): JsonResponse
    {
        $auditor = Auditor::where('org_id', $orgId)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'nullable|string|email',
            'role' => 'nullable|string|max:100',
            'certifications' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $auditor->update($request->only(['name', 'email', 'role', 'certifications']));

        return response()->json($auditor);
    }

    public function destroy(string $orgId, string $id): JsonResponse
    {
        $auditor = Auditor::where('org_id', $orgId)->findOrFail($id);
        $auditor->delete();
        return response()->json(['message' => 'Auditor removed']);
    }
}
