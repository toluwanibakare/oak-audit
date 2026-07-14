<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\SendOtpMail;
use App\Mail\TeamMemberInvitationMail;
use App\Models\Notification;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\User;
use App\Models\UserRole;
use App\Models\VerificationOtp;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class TeamMemberController extends Controller
{
    public function store(Request $request, string $orgId): JsonResponse
    {
        $org = Organization::findOrFail($orgId);
        $admin = $request->user();

        // Only org creator or admin role can add members
        $isCreator = $org->created_by === $admin->id;
        $isAdmin = UserRole::where('org_id', $orgId)
            ->where('user_id', $admin->id)
            ->whereIn('role', ['admin', 'owner', 'Management Representative'])
            ->exists();
        if (!$isCreator && !$isAdmin) {
            abort(403, 'You do not have permission to add team members.');
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'required|string|max:50',
            'department' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Generate invite token
        $inviteToken = Str::random(64);

        // Create user
        $user = User::create([
            'full_name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
            'invite_token' => $inviteToken,
        ]);

        // Create organization member
        OrganizationMember::create([
            'org_id' => $orgId,
            'user_id' => $user->id,
            'status' => 'Active',
            'department' => $request->department,
        ]);

        // Create user role
        UserRole::create([
            'org_id' => $orgId,
            'user_id' => $user->id,
            'role' => $request->role,
        ]);

        // Generate and send OTP for first-time verification
        VerificationOtp::where('email', $user->email)
            ->where('type', 'signup')
            ->whereNull('used_at')
            ->update(['used_at' => now()]);
        $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        VerificationOtp::create([
            'email' => $user->email,
            'otp' => $otp,
            'type' => 'signup',
            'expires_at' => now()->addMinutes(10),
        ]);

        try {
            Mail::to($user->email)->send(new SendOtpMail($otp, 'signup'));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Invite OTP email failed: ' . $e->getMessage());
        }

        // Send notification email
        $frontendUrl = config('app.frontend_url', 'http://localhost:5173');
        $acceptUrl = $frontendUrl . '/accept-invite/' . $inviteToken;
        $emailSent = true;
        try {
            Mail::to($user->email)->send(new TeamMemberInvitationMail(
                userName: $user->full_name,
                userEmail: $user->email,
                orgName: $org->name,
                adminName: $admin->full_name,
                loginUrl: $acceptUrl,
            ));
        } catch (\Exception $e) {
            $emailSent = false;
            \Illuminate\Support\Facades\Log::error('Team member invitation email failed: ' . $e->getMessage());
        }

        // Notification for the new user
        Notification::create([
            'user_id' => $user->id,
            'type' => 'team_invite',
            'title' => 'Welcome to ' . $org->name,
            'body' => 'Your account was created by ' . $admin->full_name . '. Sign in to get started.',
            'is_read' => false,
        ]);

        // Notification for the admin (appears in recent activity)
        Notification::create([
            'user_id' => $admin->id,
            'type' => 'member_added',
            'title' => 'Added ' . $user->full_name,
            'body' => 'Added ' . $user->full_name . ' as ' . $request->role . ' to ' . $org->name,
            'is_read' => false,
        ]);

        return response()->json([
            'id' => $user->id,
            'name' => $user->full_name,
            'email' => $user->email,
            'role' => $request->role,
            'department' => $request->department,
            'status' => 'Active',
            'email_sent' => $emailSent,
        ], 201);
    }

    public function update(Request $request, string $orgId, string $userId): JsonResponse
    {
        $org = Organization::findOrFail($orgId);
        $admin = $request->user();

        $isCreator = $org->created_by === $admin->id;
        $isAdmin = UserRole::where('org_id', $orgId)
            ->where('user_id', $admin->id)
            ->whereIn('role', ['admin', 'owner', 'Management Representative'])
            ->exists();
        if (!$isCreator && !$isAdmin) {
            abort(403, 'You do not have permission to edit team members.');
        }

        $user = User::findOrFail($userId);
        $member = OrganizationMember::where('org_id', $orgId)->where('user_id', $userId)->firstOrFail();

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255|unique:users,email,' . $userId,
            'role' => 'sometimes|string|max:50',
            'department' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->has('name')) {
            $user->full_name = $request->name;
        }
        if ($request->has('email')) {
            $user->email = $request->email;
        }
        $user->save();

        if ($request->has('role')) {
            UserRole::updateOrCreate(
                ['org_id' => $orgId, 'user_id' => $userId],
                ['role' => $request->role]
            );
        }

        if ($request->has('department')) {
            $member->department = $request->department;
            $member->save();
        }

        $role = $request->role;
        if (!$role) {
            $ur = UserRole::where('org_id', $orgId)->where('user_id', $userId)->first();
            $role = $ur?->role ?? '—';
        }

        return response()->json([
            'id' => $user->id,
            'name' => $user->full_name,
            'email' => $user->email,
            'role' => $role,
            'department' => $member->department ?? '—',
            'status' => $member->status,
        ]);
    }

    public function destroy(Request $request, string $orgId, string $userId): JsonResponse
    {
        $org = Organization::findOrFail($orgId);
        $admin = $request->user();

        $isCreator = $org->created_by === $admin->id;
        $isAdmin = UserRole::where('org_id', $orgId)
            ->where('user_id', $admin->id)
            ->whereIn('role', ['admin', 'owner', 'Management Representative'])
            ->exists();
        if (!$isCreator && !$isAdmin) {
            abort(403, 'You do not have permission to remove team members.');
        }

        if ((int) $userId === (int) $admin->id) {
            abort(400, 'You cannot remove yourself from the organization.');
        }

        OrganizationMember::where('org_id', $orgId)->where('user_id', $userId)->delete();
        UserRole::where('org_id', $orgId)->where('user_id', $userId)->delete();

        return response()->json(['message' => 'Team member removed.']);
    }

    public function index(Request $request, string $orgId): JsonResponse
    {
        $org = Organization::findOrFail($orgId);
        $admin = $request->user();

        $isMember = $org->created_by === $admin->id
            || UserRole::where('org_id', $orgId)->where('user_id', $admin->id)->exists();
        if (!$isMember) {
            abort(403);
        }

        $members = OrganizationMember::where('org_id', $orgId)
            ->whereNotNull('user_id')
            ->with('user')
            ->get()
            ->map(function ($m) {
                $ur = UserRole::where('org_id', $m->org_id)
                    ->where('user_id', $m->user_id)
                    ->first();
                return [
                    'id' => $m->user_id,
                    'name' => $m->user?->full_name ?? 'Unknown',
                    'email' => $m->user?->email ?? '—',
                    'role' => $ur?->role ?? '—',
                    'department' => $m->department ?? '—',
                    'status' => $m->status,
                    'updated' => $m->updated_at->toISOString(),
                ];
            });

        return response()->json($members);
    }

    public function acceptInvite(Request $request, string $token): JsonResponse
    {
        $user = User::where('invite_token', $token)->first();

        if (!$user) {
            return response()->json(['message' => 'Invalid or expired invitation link.'], 404);
        }

        // Verify OTP
        $otp = $request->input('otp');
        if (!$otp) {
            return response()->json(['message' => 'OTP is required.', 'needs_otp' => true], 422);
        }

        $otpRecord = VerificationOtp::valid($user->email, $otp, 'signup')->first();
        if (!$otpRecord) {
            return response()->json(['message' => 'Invalid or expired OTP.'], 422);
        }
        $otpRecord->update(['used_at' => now()]);

        DB::transaction(function () use ($user) {
            $user->update([
                'email_verified_at' => $user->email_verified_at ?? now(),
                'invite_token' => null,
            ]);

            // Notify the org creator/admin that the invite was accepted
            $memberships = OrganizationMember::where('user_id', $user->id)->get();
            foreach ($memberships as $member) {
                $org = Organization::find($member->org_id);
                if (!$org) continue;

                $adminIds = [$org->created_by];
                $adminRoles = UserRole::where('org_id', $org->id)
                    ->whereIn('role', ['Management Representative', 'admin', 'owner'])
                    ->pluck('user_id')
                    ->toArray();
                $adminIds = array_unique(array_merge($adminIds, $adminRoles));

                foreach ($adminIds as $adminId) {
                    if ((string) $adminId === (string) $user->id) continue;
                    Notification::create([
                        'user_id' => $adminId,
                        'type' => 'invite_accepted',
                        'title' => $user->full_name . ' accepted invite',
                        'body' => $user->full_name . ' has accepted the invitation to ' . $org->name,
                        'is_read' => false,
                    ]);
                }
            }
        });

        return response()->json(['message' => 'Invitation accepted. You can now sign in.']);
    }
}
