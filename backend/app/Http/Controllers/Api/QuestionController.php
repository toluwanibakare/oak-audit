<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CustomQuestion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class QuestionController extends Controller
{
    public function index(Request $request, string $orgId): JsonResponse
    {
        $query = CustomQuestion::where('org_id', $orgId);

        if ($request->has('process_key')) {
            $query->where('process_key', $request->process_key);
        }
        if ($request->has('standard')) {
            $query->where('standard', $request->standard);
        }
        if ($request->has('active')) {
            $query->where('active', filter_var($request->active, FILTER_VALIDATE_BOOLEAN));
        }

        $questions = $query->orderBy('created_at', 'desc')->get();
        return response()->json($questions);
    }

    public function store(Request $request, string $orgId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'standard' => 'required|string|max:100',
            'clause' => 'required|string',
            'text' => 'required|string',
            'kind' => 'sometimes|string|max:50',
            'process_key' => 'required|string',
            'reference' => 'nullable|string|max:500',
            'evidence' => 'nullable|string',
            'active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $question = CustomQuestion::create([
            'org_id' => $orgId,
            'created_by' => auth('api')->id(),
            ...$request->only([
                'standard', 'clause', 'text', 'kind',
                'process_key', 'reference', 'evidence', 'active',
            ]),
        ]);

        return response()->json($question, 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $question = CustomQuestion::whereHas('organization', function ($q) {
            $q->where('created_by', auth('api')->id());
        })->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'text' => 'sometimes|string',
            'evidence' => 'nullable|string',
            'reference' => 'nullable|string|max:500',
            'active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $question->update($request->only(['text', 'evidence', 'reference', 'active']));

        return response()->json($question);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $question = CustomQuestion::whereHas('organization', function ($q) {
            $q->where('created_by', auth('api')->id());
        })->findOrFail($id);
        $soft = $request->boolean('soft', true);
        if ($soft) {
            $question->update(['active' => false]);
        } else {
            $question->delete();
        }
        return response()->json(['message' => 'Question deleted']);
    }
}
