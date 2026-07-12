<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\InvitationMail;
use App\Models\Invitation;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\UserRole;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class InvitationController extends Controller
{
    public function index(string $orgId): JsonResponse
    {
        $org = Organization::findOrFail($orgId);
        $this->authorizeAccess($org);

        $invitations = Invitation::where('org_id', $orgId)
            ->with('inviter')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($invitations);
    }

    public function store(Request $request, string $orgId): JsonResponse
    {
        $org = Organization::findOrFail($orgId);
        $this->authorizeAccess($org);

        $validated = $request->validate([
            'email' => 'required|email|max:255',
            'role' => 'sometimes|string|max:50',
        ]);

        $email = $validated['email'];
        $role = $validated['role'] ?? 'member';

        // Check if user is already a member
        $existingUser = User::where('email', $email)->first();
        if ($existingUser) {
            $alreadyMember = OrganizationMember::where('org_id', $orgId)
                ->where('user_id', $existingUser->id)
                ->exists();
            if ($alreadyMember) {
                return response()->json(['message' => 'User is already a member of this organization.'], 409);
            }
        }

        // Check for pending invitation to the same email
        $pending = Invitation::where('org_id', $orgId)
            ->where('email', $email)
            ->pending()
            ->exists();
        if ($pending) {
            return response()->json(['message' => 'A pending invitation already exists for this email.'], 409);
        }

        $token = Str::random(64);
        $invitation = Invitation::create([
            'org_id' => $orgId,
            'email' => $email,
            'role' => $role,
            'token' => $token,
            'expires_at' => now()->addDays(7),
            'invited_by' => $request->user()->id,
        ]);

        $acceptUrl = config('app.frontend_url', 'http://localhost:5173')
            . '/accept-invitation?token=' . $token;

        Mail::to($email)->send(new InvitationMail(
            $invitation,
            $org->name,
            $request->user()->full_name,
            $acceptUrl,
        ));

        return response()->json($invitation->load('inviter'), 201);
    }

    public function accept(Request $request): JsonResponse
    {
        $request->validate(['token' => 'required|string']);

        $invitation = Invitation::where('token', $request->token)->pending()->first();

        if (!$invitation) {
            return response()->json(['message' => 'Invalid or expired invitation token.'], 404);
        }

        if ($invitation->isExpired()) {
            return response()->json(['message' => 'This invitation has expired.'], 410);
        }

        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'You must be logged in to accept an invitation.'], 401);
        }

        // Verify email matches
        if ($user->email !== $invitation->email) {
            return response()->json([
                'message' => 'This invitation was sent to a different email address. Please log in with the invited email.'
            ], 403);
        }

        // Create organization member record
        OrganizationMember::firstOrCreate([
            'org_id' => $invitation->org_id,
            'invited_email' => $invitation->email,
        ], [
            'user_id' => $user->id,
            'status' => 'accepted',
        ]);

        // Create user role
        UserRole::firstOrCreate([
            'org_id' => $invitation->org_id,
            'user_id' => $user->id,
        ], [
            'role' => $invitation->role,
        ]);

        $invitation->update(['accepted_at' => now()]);

        return response()->json([
            'message' => 'Invitation accepted successfully.',
            'organization_id' => $invitation->org_id,
        ]);
    }

    public function destroy(string $orgId, string $id): JsonResponse
    {
        $org = Organization::findOrFail($orgId);
        $this->authorizeAccess($org);

        $invitation = Invitation::where('org_id', $orgId)->findOrFail($id);
        $invitation->delete();

        return response()->json(['message' => 'Invitation cancelled.']);
    }

    private function authorizeAccess(Organization $org): void
    {
        $user = request()->user();
        $isCreator = $org->created_by === $user->id;
        $isAdmin = UserRole::where('org_id', $org->id)
            ->where('user_id', $user->id)
            ->whereIn('role', ['admin', 'owner'])
            ->exists();

        if (!$isCreator && !$isAdmin) {
            abort(403, 'You do not have permission to manage invitations.');
        }
    }
}
