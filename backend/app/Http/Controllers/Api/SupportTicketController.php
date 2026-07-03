<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\TicketSubmittedMail;
use App\Models\SupportTicket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class SupportTicketController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'category' => 'sometimes|string|in:technical,billing,compliance,general',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $userId = auth('api')->id();
        $orgId = $userId ? \App\Models\Organization::where('created_by', $userId)->value('id') : null;

        $ticket = SupportTicket::create([
            'org_id' => $orgId,
            'user_id' => $userId,
            'name' => $request->name,
            'email' => $request->email,
            'subject' => $request->subject,
            'message' => $request->message,
            'category' => $request->category ?? 'general',
            'status' => 'open',
        ]);

        // Notify support team
        try {
            Mail::to('info@oakaudix.app')->send(new TicketSubmittedMail($ticket));
        } catch (\Exception $e) {
            // Log but don't fail
        }

        return response()->json([
            'message' => 'Ticket submitted successfully',
            'id' => $ticket->id,
        ], 201);
    }

    public function index(Request $request): JsonResponse
    {
        $query = SupportTicket::query();

        // If authenticated, show user's tickets
        if ($user = auth('api')->user()) {
            $query->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhere('email', $user->email);
            });
        } else {
            return response()->json(['data' => []]);
        }

        return response()->json($query->orderBy('created_at', 'desc')->get());
    }
}
