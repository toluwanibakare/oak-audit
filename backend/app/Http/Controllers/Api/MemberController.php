<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrganizationMember;
use App\Models\UserRole;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MemberController extends Controller
{
    private function authorizeMemberAccess(string $orgId): void
    {
        $userId = auth('api')->id();
        if (!UserRole::where('org_id', $orgId)
            ->where('user_id', $userId)
            ->exists()) {
            abort(403, 'You do not have permission to access this organization.');
        }
    }

    public function index(string $orgId): JsonResponse
    {
        $this->authorizeMemberAccess($orgId);
        $members = OrganizationMember::where('org_id', $orgId)->get();
        return response()->json($members);
    }

    public function store(Request $request, string $orgId): JsonResponse
    {
        $this->authorizeMemberAccess($orgId);

        $validator = Validator::make($request->all(), [
            'user_id' => 'nullable|string|exists:users,id',
            'invited_email' => 'nullable|string|email',
            'status' => 'sometimes|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $member = OrganizationMember::create([
            'org_id' => $orgId,
            ...$request->only(['user_id', 'invited_email', 'status']),
        ]);

        if ($request->filled('user_id')) {
            UserRole::firstOrCreate([
                'org_id' => $orgId,
                'user_id' => $request->user_id,
            ], ['role' => 'viewer']);
        }

        return response()->json($member, 201);
    }

    public function destroy(string $orgId, string $id): JsonResponse
    {
        $this->authorizeMemberAccess($orgId);
        $member = OrganizationMember::where('org_id', $orgId)->findOrFail($id);
        if ($member->user_id) {
            UserRole::where('org_id', $orgId)
                ->where('user_id', $member->user_id)
                ->delete();
        }
        $member->delete();
        return response()->json(['message' => 'Member removed']);
    }

    public function roles(string $orgId): JsonResponse
    {
        $roles = UserRole::where('org_id', $orgId)->get();
        return response()->json($roles);
    }
}
