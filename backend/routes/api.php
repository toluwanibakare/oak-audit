<?php

use App\Http\Controllers\Api\AuditAnswerController;
use App\Http\Controllers\Api\AuditController;
use App\Http\Controllers\Api\AuditProcessController;
use App\Http\Controllers\Api\AuditorController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EntityDataController;
use App\Http\Controllers\Api\EvidenceController;
use App\Http\Controllers\Api\FindingController;
use App\Http\Controllers\Api\InvitationController;
use App\Http\Controllers\Api\MemberController;
use App\Http\Controllers\Api\NotificationController as NotificationApiController;
use App\Http\Controllers\Api\OrganizationController;
use App\Http\Controllers\Api\ProcessAssignmentController;
use App\Http\Controllers\Api\ProcessController;
use App\Http\Controllers\Api\QuestionController;
use App\Http\Controllers\Api\NewsletterController;
use App\Http\Controllers\Api\SupportTicketController;
use App\Http\Controllers\Api\WalletController;
use App\Models\IsoClause;
use Illuminate\Support\Facades\Route;

// Public auth routes
Route::post('auth/register', [AuthController::class, 'register']);
Route::post('auth/login', [AuthController::class, 'login']);
Route::post('auth/refresh', [AuthController::class, 'refresh']);
Route::post('auth/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('auth/reset-password', [AuthController::class, 'resetPassword']);
Route::post('team-members/accept-invite/{token}', [\App\Http\Controllers\Api\TeamMemberController::class, 'acceptInvite']);

// Public data
Route::get('iso-clauses', fn() => response()->json(IsoClause::all()));
Route::get('iso-clauses/{standard}', fn(string $s) => response()->json(IsoClause::where('standard', $s)->get()));

// Public support ticket submission
Route::post('support-tickets', [SupportTicketController::class, 'store']);

// Newsletter subscription (public)
Route::post('newsletter/subscribe', [NewsletterController::class, 'subscribe']);

// Public finding view & CAR submission (CAR portal - no auth required)
Route::get('findings/{id}', [FindingController::class, 'show']);
Route::post('findings/{id}/car', [FindingController::class, 'submitCar']);
Route::post('findings/{id}/evidence', [FindingController::class, 'uploadEvidence']);

// Paystack (initiate requires auth, verify also needs auth to create audit)
Route::middleware('auth:api')->group(function () {
    Route::post('paystack/initiate', [\App\Http\Controllers\Api\PaystackController::class, 'initiate']);
    Route::post('paystack/verify', [\App\Http\Controllers\Api\PaystackController::class, 'verify']);
});

// Protected routes
Route::middleware('auth:api')->group(function () {
    // Auth
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('auth/me', [AuthController::class, 'me']);
    Route::post('auth/send-password-otp', [AuthController::class, 'sendPasswordOtp']);
    Route::post('auth/change-password', [AuthController::class, 'changePassword']);
    Route::post('auth/send-change-email-otp', [AuthController::class, 'sendChangeEmailOtp']);
    Route::post('auth/send-new-email-otp', [AuthController::class, 'sendNewEmailOtp']);
    Route::post('auth/verify-change-email', [AuthController::class, 'verifyChangeEmail']);
    Route::put('auth/name', [AuthController::class, 'updateName']);

    // Organizations
    Route::get('organizations', [OrganizationController::class, 'index']);
    Route::post('organizations', [OrganizationController::class, 'store']);
    Route::get('organizations/{id}', [OrganizationController::class, 'show']);
    Route::put('organizations/{id}', [OrganizationController::class, 'update']);
    Route::get('organizations/{id}/settings', [OrganizationController::class, 'getSettings']);
    Route::put('organizations/{id}/settings', [OrganizationController::class, 'updateSettings']);
    Route::post('organizations/{id}/logo', [OrganizationController::class, 'uploadLogo']);

    // Organization scoped routes
    Route::prefix('organizations/{org}')->group(function () {
        // Members & Roles
        Route::get('members', [MemberController::class, 'index']);
        Route::post('members', [MemberController::class, 'store']);
        Route::delete('members/{member}', [MemberController::class, 'destroy']);
        Route::get('roles', [MemberController::class, 'roles']);

        // Auditors
        Route::get('auditors', [AuditorController::class, 'index']);
        Route::post('auditors', [AuditorController::class, 'store']);
        Route::put('auditors/{auditor}', [AuditorController::class, 'update']);
        Route::delete('auditors/{auditor}', [AuditorController::class, 'destroy']);

        // Processes
        Route::get('processes', [ProcessController::class, 'index']);
        Route::post('processes', [ProcessController::class, 'store']);
        Route::delete('processes/{process}', [ProcessController::class, 'destroy']);

        // Audits
        Route::get('audits', [AuditController::class, 'index']);
        Route::post('audits', [AuditController::class, 'store']);
        Route::get('audits/{audit}', [AuditController::class, 'show']);
        Route::put('audits/{audit}', [AuditController::class, 'update']);

        // Findings
        Route::get('findings', [FindingController::class, 'index']);
        Route::post('findings', [FindingController::class, 'store']);

        // Questions
        Route::get('questions', [QuestionController::class, 'index']);
        Route::post('questions', [QuestionController::class, 'store']);

        // Wallet
        Route::get('wallet', [WalletController::class, 'wallet']);
        Route::get('transactions', [WalletController::class, 'transactions']);
        Route::get('licenses', [WalletController::class, 'licenses']);

        // Dashboard
        Route::get('dashboard', [DashboardController::class, 'index']);

        // Team members
        Route::get('team-members', [\App\Http\Controllers\Api\TeamMemberController::class, 'index']);
        Route::post('team-members', [\App\Http\Controllers\Api\TeamMemberController::class, 'store']);
        Route::put('team-members/{userId}', [\App\Http\Controllers\Api\TeamMemberController::class, 'update']);
        Route::delete('team-members/{userId}', [\App\Http\Controllers\Api\TeamMemberController::class, 'destroy']);

        // Invitations
        Route::get('invitations', [InvitationController::class, 'index']);
        Route::post('invitations', [InvitationController::class, 'store']);
        Route::delete('invitations/{invitation}', [InvitationController::class, 'destroy']);

        // Entity data (generic CRUD for departments, locations, assets, teams, etc.)
        Route::get('entities/{entityType}', [EntityDataController::class, 'index']);
        Route::post('entities/{entityType}', [EntityDataController::class, 'store']);
        Route::put('entities/{entityType}/{id}', [EntityDataController::class, 'update']);
        Route::delete('entities/{entityType}/{id}', [EntityDataController::class, 'destroy']);
        Route::post('entities/seed', [EntityDataController::class, 'seed']);
    });

    // Audit processes
    Route::get('audits/{audit}/processes', [AuditProcessController::class, 'index']);
    Route::post('audits/{audit}/processes', [AuditProcessController::class, 'store']);
    Route::put('audits/{audit}/processes/{process}', [AuditProcessController::class, 'update']);

    // Evidence upload
    Route::post('audits/{audit}/evidence', [EvidenceController::class, 'upload']);

    // Audit answers
    Route::get('audits/{audit}/answers', [AuditAnswerController::class, 'index']);
    Route::post('audits/{audit}/answers', [AuditAnswerController::class, 'store']);
    Route::put('audits/{audit}/answers/{answer}', [AuditAnswerController::class, 'update']);

    // Findings (non-scoped)
    Route::put('findings/{id}', [FindingController::class, 'update']);
    Route::delete('findings/{id}', [FindingController::class, 'destroy']);

    // Questions (non-scoped)
    Route::put('questions/{id}', [QuestionController::class, 'update']);
    Route::delete('questions/{id}', [QuestionController::class, 'destroy']);

    // Process assignments
    Route::get('organizations/{org}/process-assignments', [ProcessAssignmentController::class, 'index']);

    // Notifications
    Route::get('notifications', [NotificationApiController::class, 'index']);
    Route::get('notifications/unread-count', [NotificationApiController::class, 'unreadCount']);
    Route::get('notifications/{id}', [NotificationApiController::class, 'show']);
    Route::post('notifications/{id}/read', [NotificationApiController::class, 'markAsRead']);
    Route::post('notifications/read-all', [NotificationApiController::class, 'markAllAsRead']);
    Route::delete('notifications/{id}', [NotificationApiController::class, 'destroy']);

    // Email notifications
    Route::post('notifications/send-email', [NotificationApiController::class, 'sendEmail']);

    // Support tickets (authenticated listing)
    Route::get('support-tickets', [SupportTicketController::class, 'index']);

    // Invitation acceptance (auth required but not org-scoped)
    Route::post('invitations/accept', [InvitationController::class, 'accept']);
});
