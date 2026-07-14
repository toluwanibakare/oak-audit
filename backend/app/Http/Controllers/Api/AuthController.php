<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\SendOtpMail;
use App\Mail\WelcomeMail;
use App\Models\NewsletterSubscription;
use App\Models\Notification;
use App\Models\User;
use App\Models\VerificationOtp;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'full_name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255',
                'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()->symbols()],
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            // Check if email already exists
            $existingUser = User::where('email', $request->email)->first();

            if ($existingUser) {
                if ($existingUser->email_verified_at) {
                    // Account exists and is verified — try to log in with the provided password
                    if (Hash::check($request->password, $existingUser->password)) {
                        $token = JWTAuth::fromUser($existingUser);
                        return $this->respondWithToken($token);
                    }

                    return response()->json([
                        'errors' => ['email' => ['This email is already registered. Sign in instead.']],
                    ], 422);
                }

                if ($request->boolean('newsletter')) {
                    try {
                        $this->subscribeToNewsletter($existingUser->email, 'signup', $existingUser->id);
                    } catch (\Exception $e) {
                        // fail silently
                    }
                }

                // Email exists but not verified — resend OTP
                $this->generateAndSendOtp($existingUser->email, 'signup');

                return response()->json([
                    'message' => 'Email already registered but not verified. A new OTP has been sent.',
                    'needs_verification' => true,
                    'email' => $existingUser->email,
                ], 200);
            }

            $user = User::create([
                'full_name' => $request->full_name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            $this->generateAndSendOtp($user->email, 'signup');

            // Subscribe to newsletter if requested
            if ($request->boolean('newsletter')) {
                try {
                    $this->subscribeToNewsletter($user->email, 'signup', $user->id);
                } catch (\Exception $e) {
                    // fail silently
                }
            }

            return response()->json([
                'message' => 'User registered successfully. Please verify your email with the OTP sent.',
                'needs_verification' => true,
                'user' => $user,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Registration failed',
                'detail' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ], 500);
        }
    }

    public function verifyOtp(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'otp' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $otpRecord = VerificationOtp::valid($request->email, $request->otp, 'signup')->first();

        if (!$otpRecord) {
            return response()->json(['error' => 'Invalid or expired OTP'], 400);
        }

        $otpRecord->update(['used_at' => now()]);

        $user = User::where('email', $request->email)->first();
        $user->update(['email_verified_at' => now()]);

        $existing = Notification::where('user_id', $user->id)->where('type', 'welcome')->exists();
        if (!$existing) {
            $this->sendWelcomeNotification($user);
        }

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'message' => 'Email verified successfully',
            'token' => $token,
        ]);
    }

    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $credentials = $request->only('email', 'password');

        if (!$token = JWTAuth::attempt($credentials)) {
            return response()->json(['error' => 'Invalid email or password'], 401);
        }

        $user = User::where('email', $request->email)->first();

        if ($user && !$user->email_verified_at) {
            $user->update(['email_verified_at' => now()]);
        }

        return $this->respondWithToken($token);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $this->generateAndSendOtp($request->email, 'reset');

        return response()->json(['message' => 'OTP sent to your email']);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email|exists:users,email',
            'otp' => 'required|string|size:6',
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()->symbols()],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $otpRecord = VerificationOtp::valid($request->email, $request->otp, 'reset')->first();

        if (!$otpRecord) {
            return response()->json(['error' => 'Invalid or expired OTP'], 400);
        }

        $otpRecord->update(['used_at' => now()]);

        User::where('email', $request->email)->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json(['message' => 'Password reset successful']);
    }

    public function sendPasswordOtp(Request $request): JsonResponse
    {
        $user = auth('api')->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $this->generateAndSendOtp($user->email, 'password_change');

        return response()->json(['message' => 'OTP sent to your email']);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $user = auth('api')->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $validator = Validator::make($request->all(), [
            'otp' => 'required|string|size:6',
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()->symbols()],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $otpRecord = VerificationOtp::valid($user->email, $request->otp, 'password_change')->first();

        if (!$otpRecord) {
            return response()->json(['error' => 'Invalid or expired OTP'], 400);
        }

        $otpRecord->update(['used_at' => now()]);

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json(['message' => 'Password changed successfully']);
    }

    public function sendChangeEmailOtp(Request $request): JsonResponse
    {
        $user = auth('api')->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $validator = Validator::make($request->all(), [
            'new_email' => 'required|string|email|max:255|unique:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $this->generateAndSendOtp($user->email, 'email_change_old');

        return response()->json(['message' => 'OTP sent to your current email']);
    }

    public function sendNewEmailOtp(Request $request): JsonResponse
    {
        $user = auth('api')->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $validator = Validator::make($request->all(), [
            'new_email' => 'required|string|email|max:255|unique:users,email',
            'otp' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $otpRecord = VerificationOtp::valid($user->email, $request->otp, 'email_change_old')->first();

        if (!$otpRecord) {
            return response()->json(['error' => 'Invalid or expired OTP for current email'], 400);
        }

        $otpRecord->update(['used_at' => now()]);

        $this->generateAndSendOtp($request->new_email, 'email_change_new');

        return response()->json(['message' => 'OTP sent to your new email']);
    }

    public function verifyChangeEmail(Request $request): JsonResponse
    {
        $user = auth('api')->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $validator = Validator::make($request->all(), [
            'new_email' => 'required|string|email|max:255|unique:users,email',
            'otp' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $otpRecord = VerificationOtp::valid($request->new_email, $request->otp, 'email_change_new')->first();

        if (!$otpRecord) {
            return response()->json(['error' => 'Invalid or expired OTP for new email'], 400);
        }

        $otpRecord->update(['used_at' => now()]);

        $oldEmail = $user->email;
        $user->update(['email' => $request->new_email]);

        return response()->json(['message' => 'Email changed successfully', 'old_email' => $oldEmail, 'new_email' => $request->new_email]);
    }

    public function updateName(Request $request): JsonResponse
    {
        $user = auth('api')->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user->update(['full_name' => $request->full_name]);

        return response()->json(['message' => 'Name updated successfully', 'full_name' => $user->full_name]);
    }

    public function me(): JsonResponse
    {
        $user = auth('api')->user();

        $role = null;
        if ($user) {
            $orgId = null;
            $member = \App\Models\OrganizationMember::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->first();
            if ($member) {
                $orgId = $member->org_id;
            } else {
                $org = \App\Models\Organization::where('created_by', $user->id)
                    ->orderBy('created_at', 'desc')
                    ->first();
                $orgId = $org?->id;
            }
            if ($orgId) {
                $ur = \App\Models\UserRole::where('org_id', $orgId)
                    ->where('user_id', $user->id)
                    ->first();
                $role = $ur?->role;
            }
        }

        return response()->json([
            'id' => $user->id,
            'email' => $user->email,
            'full_name' => $user->full_name,
            'current_role' => $role,
        ]);
    }

    public function logout(): JsonResponse
    {
        auth('api')->logout();
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function refresh(): JsonResponse
    {
        try {
            $token = auth('api')->refresh();
            return $this->respondWithToken($token);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Unable to refresh token'], 401);
        }
    }

    protected function respondWithToken(string $token): JsonResponse
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60,
        ]);
    }

    protected function sendWelcomeNotification(User $user): void
    {
        Notification::create([
            'user_id' => $user->id,
            'type' => 'welcome',
            'title' => 'Welcome to OakAudix!',
            'body' => "Welcome to OakAudix! Get started by exploring your dashboard and completing your organization profile.",
            'is_read' => false,
        ]);

        try {
            Mail::to($user->email)->send(new WelcomeMail($user->full_name, $user->email));
        } catch (\Exception $e) {
            // fail silently
        }
    }

    protected function subscribeToNewsletter(string $email, string $source, ?string $userId = null): void
    {
        NewsletterSubscription::firstOrCreate(
            ['email' => $email],
            [
                'subscribed' => true,
                'source' => $source,
                'user_id' => $userId,
                'subscribed_at' => now(),
            ]
        );
    }

    protected function generateAndSendOtp(string $email, string $type): void
    {
        // Invalidate previous unused OTPs
        VerificationOtp::where('email', $email)
            ->where('type', $type)
            ->whereNull('used_at')
            ->update(['used_at' => now()]);

        $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        VerificationOtp::create([
            'email' => $email,
            'otp' => $otp,
            'type' => $type,
            'expires_at' => now()->addMinutes(10),
        ]);

        try {
            Mail::to($email)->send(new SendOtpMail($otp, $type));
        } catch (\Exception $e) {
            // fail silently — OTP is still stored in the DB for verification
        }
    }
}
