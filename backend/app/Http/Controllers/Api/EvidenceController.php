<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class EvidenceController extends Controller
{
    public function uploadOrg(Request $request, string $orgId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|max:102400',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $file = $request->file('file');
        $storedPath = $file->store("evidence/org/{$orgId}", 'public');
        $url = Storage::url($storedPath);

        return response()->json([
            'path' => $storedPath,
            'url' => $url,
            'name' => $file->getClientOriginalName(),
            'size' => $file->getSize(),
            'mime' => $file->getMimeType(),
        ], 201);
    }

    public function upload(Request $request, string $auditId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|max:102400',
            'path' => 'sometimes|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $file = $request->file('file');
        $extraPath = $request->input('path', '');

        $storedPath = $file->store("evidence/{$auditId}/{$extraPath}", 'public');

        $url = Storage::url($storedPath);

        return response()->json([
            'path' => $storedPath,
            'url' => $url,
            'name' => $file->getClientOriginalName(),
            'size' => $file->getSize(),
            'mime' => $file->getMimeType(),
        ], 201);
    }
}
