<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\UserRole;
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
            $adminOrgIds = DB::table('user_roles')
                ->where('user_id', $userId)
                ->whereIn('role', ['admin', 'owner', 'Management Representative'])
                ->select('org_id');
            $ids = $createdIds->union($memberIds)->union($adminOrgIds)->pluck('id');
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

        // Seed default roles
        $defaultRoles = ['Management Representative', 'Admin', 'Lead Auditor', 'Auditor', 'Viewer', 'Auditee'];
        foreach ($defaultRoles as $roleName) {
            $exists = \App\Models\EntityData::where('org_id', $org->id)
                ->where('entity_type', 'roles')
                ->where('data->name', $roleName)
                ->exists();
            if (!$exists) {
                \App\Models\EntityData::create([
                    'org_id' => $org->id,
                    'entity_type' => 'roles',
                    'data' => [
                        'name' => $roleName,
                        'scope' => 'Global',
                        'members' => 0,
                        'description' => '',
                        'status' => 'Active',
                    ],
                ]);
            }
        }

        // Seed default permissions for each role
        $modules = ['Audits', 'Findings', 'Corrective Actions', 'Risk', 'Reports', 'Organization', 'Users', 'Settings'];
        $adminRoles = ['Management Representative', 'Admin'];
        $fullRoles = ['Lead Auditor', 'Auditor'];
        foreach ($defaultRoles as $roleName) {
            foreach ($modules as $module) {
                $level = in_array($roleName, $adminRoles) ? 3 : (in_array($roleName, $fullRoles) ? 2 : 0);
                $exists = \App\Models\EntityData::where('org_id', $org->id)
                    ->where('entity_type', 'permissions')
                    ->where('data->role', $roleName)
                    ->where('data->module', $module)
                    ->exists();
                if (!$exists) {
                    \App\Models\EntityData::create([
                        'org_id' => $org->id,
                        'entity_type' => 'permissions',
                        'data' => [
                            'role' => $roleName,
                            'module' => $module,
                            'level' => $level,
                        ],
                    ]);
                }
            }
        }

        // Assign Management Representative role to the org creator
        \App\Models\UserRole::create([
            'org_id' => $org->id,
            'user_id' => $userId,
            'role' => 'Management Representative',
        ]);

        Cache::forget("user_orgs:{$userId}");

        return response()->json($org, 201);
    }

    public function show(string $id): JsonResponse
    {
        $userId = auth('api')->id();
        $isCreator = Organization::where('id', $id)->where('created_by', $userId)->exists();
        $isMember = OrganizationMember::where('org_id', $id)->where('user_id', $userId)->exists();
        $isAdmin = UserRole::where('org_id', $id)
            ->where('user_id', $userId)
            ->whereIn('role', ['admin', 'owner', 'Management Representative'])
            ->exists();
        if (!$isCreator && !$isMember && !$isAdmin) {
            abort(404);
        }
        $org = Organization::with(['creator', 'wallet'])->findOrFail($id);
        return response()->json($org);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $userId = auth('api')->id();
        $org = Organization::findOrFail($id);

        // Authorization: creator, admin/MR, or current manager can update org settings
        $isCreator = $org->created_by === $userId;
        $isAdmin = UserRole::where('org_id', $id)
            ->where('user_id', $userId)
            ->whereIn('role', ['admin', 'owner', 'Management Representative'])
            ->exists();
        $isManager = $org->manager_id === $userId;

        if (!$isCreator && !$isAdmin && !$isManager) {
            abort(403, 'You do not have permission to update this organization.');
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'industry' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'logo_url' => 'nullable|string|max:500',
            'settings' => 'nullable|array',
            'manager_id' => 'nullable|uuid|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->has('manager_id')) {
            if ($request->manager_id) {
                // Only one manager per user — clear any other org that had this user as manager
                Organization::where('manager_id', $request->manager_id)
                    ->where('id', '!=', $id)
                    ->update(['manager_id' => null]);
            }
        }

        $org->update($request->only(['name', 'industry', 'address', 'logo_url', 'settings', 'manager_id']));

        Cache::forget("user_orgs:{$userId}");

        return response()->json($org->load('manager'));
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
