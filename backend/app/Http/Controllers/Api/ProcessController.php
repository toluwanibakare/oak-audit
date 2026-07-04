<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrgProcess;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProcessController extends Controller
{
    public function index(string $orgId): JsonResponse
    {
        $processes = OrgProcess::where('org_id', $orgId)->orderBy('name')->get();
        return response()->json($processes);
    }

    public function store(Request $request, string $orgId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'key' => 'required|string|max:255',
            'scope' => 'nullable|string|max:500',
            'process_owner' => 'nullable|string|max:255',
            'process_owner_email' => 'nullable|string|email|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Auto-determine is_custom from key: standard processes don't have a "custom_" prefix
        $isCustom = str_starts_with($request->key, 'custom_');

        $process = OrgProcess::create([
            'org_id' => $orgId,
            'name' => $request->name,
            'key' => $request->key,
            'scope' => $request->scope,
            'is_custom' => $isCustom,
            'process_owner' => $request->process_owner,
            'process_owner_email' => $request->process_owner_email,
        ]);

        return response()->json($process, 201);
    }

    public function destroy(string $orgId, string $id): JsonResponse
    {
        $process = OrgProcess::where('org_id', $orgId)->findOrFail($id);
        $process->delete();
        return response()->json(['message' => 'Process removed']);
    }
}
