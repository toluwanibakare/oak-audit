<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class OrganizationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $userId = auth('api')->id();
        $orgs = Cache::remember("user_orgs:{$userId}", 300, function () use ($userId) {
            $createdIds = DB::table('organizations')
                ->where('created_by', $userId)
                ->select('id');
            $memberIds = DB::table('organization_members')
                ->where('user_id', $userId)
                ->select('org_id');
            $ids = $createdIds->union($memberIds)->pluck('id');
            return Organization::whereIn('id', $ids)->get();
        });
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

        $userId = auth('api')->id();
        $org = Organization::create([
            ...$request->only(['name', 'type', 'industry', 'address']),
            'created_by' => $userId,
        ]);

        \App\Models\OrganizationMember::create([
            'org_id' => $org->id,
            'user_id' => $userId,
            'status' => 'Active',
        ]);

        $roleName = 'Management Representative';
        $roleExists = \App\Models\EntityData::where('org_id', $org->id)
            ->where('entity_type', 'roles')
            ->where('data->name', $roleName)
            ->exists();

        \App\Models\UserRole::create([
            'org_id' => $org->id,
            'user_id' => $userId,
            'role' => $roleExists ? $roleName : 'admin',
        ]);

        Cache::forget("user_orgs:{$userId}");

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
        $userId = auth('api')->id();
        $org = Organization::where('created_by', $userId)
            ->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'industry' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'logo_url' => 'nullable|string|max:500',
            'settings' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $org->update($request->only(['name', 'industry', 'address', 'logo_url', 'settings']));

        Cache::forget("user_orgs:{$userId}");

        return response()->json($org);
    }

    public function getSettings(string $id): JsonResponse
    {
        $org = Organization::where('created_by', auth('api')->id())
            ->findOrFail($id);
        return response()->json($org->settings ?? []);
    }

    public function updateSettings(Request $request, string $id): JsonResponse
    {
        $userId = auth('api')->id();
        $org = Organization::where('created_by', $userId)
            ->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'settings' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $org->update(['settings' => $request->settings]);

        Cache::forget("user_orgs:{$userId}");

        return response()->json(['message' => 'Settings saved', 'settings' => $org->settings]);
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

        $file = $request->file('logo');
        $ext = $file->getClientOriginalExtension();
        $filename = time() . '_' . bin2hex(random_bytes(8)) . '.' . $ext;
        $uploadPath = public_path('uploads/logos');

        if (!file_exists($uploadPath)) {
            mkdir($uploadPath, 0755, true);
        }

        $file->move($uploadPath, $filename);
        $url = $request->getSchemeAndHttpHost() . '/uploads/logos/' . $filename;

        $org->update(['logo_url' => $url]);

        return response()->json([
            'logo_url' => $url,
            'organization' => $org,
        ]);
    }
}
