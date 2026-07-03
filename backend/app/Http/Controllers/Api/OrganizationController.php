<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class OrganizationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $orgs = Organization::where('created_by', auth('api')->id())->get();
        return response()->json($orgs);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'type' => 'sometimes|string|in:individual,organization',
            'industry' => 'nullable|string|max:255',
            'address' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $org = Organization::create([
            ...$request->only(['name', 'type', 'industry', 'address']),
            'created_by' => auth('api')->id(),
        ]);

        return response()->json($org, 201);
    }

    public function show(string $id): JsonResponse
    {
        $org = Organization::with(['creator', 'wallet'])
            ->where('created_by', auth('api')->id())
            ->findOrFail($id);
        return response()->json($org);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $org = Organization::where('created_by', auth('api')->id())
            ->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'industry' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'logo_url' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $org->update($request->only(['name', 'industry', 'address', 'logo_url']));
        return response()->json($org);
    }

    public function uploadLogo(Request $request, string $id): JsonResponse
    {
        $org = Organization::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'logo' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $path = $request->file('logo')->store('logos', 'public');
        $url = asset('storage/' . $path);

        $org->update(['logo_url' => $url]);

        return response()->json([
            'logo_url' => $url,
            'organization' => $org,
        ]);
    }
}
