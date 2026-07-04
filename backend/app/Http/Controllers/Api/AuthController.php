<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\SendOtpMail;
use App\Models\Organization;
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
        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255',
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()->symbols()],
            'account_type' => 'sometimes|string|in:individual,organization,auditor',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Check if email already exists
        $existingUser = User::where('email', $request->email)->first();

        if ($existingUser) {
            // For auditor invites: if email already exists, auto-verify and return the user
            // so the org admin can add them as a member immediately without re-registering
            if ($request->account_type === 'auditor') {
                $existingUser->email_verified_at = now();
                $existingUser->account_type = 'auditor';
                $existingUser->save();

                return response()->json([
                    'message' => 'Auditor account already exists and has been activated.',
                    'needs_verification' => false,
                    'user' => $existingUser,
                ], 200);
            }

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
            'account_type' => $request->account_type ?? 'individual',
        ]);

        // Auto-verify and skip OTP for auditor accounts (invited by org admin)
        if ($user->account_type === 'auditor') {
            $user->email_verified_at = now();
            $user->save();
        } else {
            $this->generateAndSendOtp($user->email, 'signup');
        }

        // Auto-create a personal organization for individual accounts
        if ($user->account_type === 'individual') {
            Organization::create([
                'name' => $user->full_name,
                'type' => 'individual',
                'created_by' => $user->id,
            ]);
        }

        return response()->json([
            'message' => $user->account_type === 'auditor'
                ? 'Auditor account created successfully.'
                : 'User registered successfully. Please verify your email with the OTP sent.',
            'needs_verification' => $user->account_type !== 'auditor',
            'user' => $user,
        ], 201);
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
        return response()->json(auth('api')->user());
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

        Mail::to($email)->send(new SendOtpMail($otp, $type));
    }
}
