<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class NotificationController extends Controller
{
    public function sendEmail(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'to' => 'required|email',
            'subject' => 'required|string|max:255',
            'html' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Only allow sending to auditee emails of audits the user has access to
        $userId = auth('api')->id();
        $validRecipient = AuditModel::whereHas('organization', function ($q) use ($userId) {
            $q->where('created_by', $userId);
        })->where('auditee_email', $request->to)->exists();

        if (!$validRecipient) {
            return response()->json(['error' => 'Recipient not authorized'], 403);
        }

        try {
            Mail::html($request->html, function ($message) use ($request) {
                $message->to($request->to)
                    ->subject($request->subject);
            });

            return response()->json(['message' => 'Email sent successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to send email: ' . $e->getMessage()], 500);
        }
    }
}
