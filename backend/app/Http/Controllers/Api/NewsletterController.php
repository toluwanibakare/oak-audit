<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NewsletterSubscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NewsletterController extends Controller
{
    public function subscribe(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email|max:255',
            'source' => 'sometimes|string|in:signup,landing',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $subscription = NewsletterSubscription::firstOrCreate(
            ['email' => $request->email],
            [
                'subscribed' => true,
                'source' => $request->source ?? 'landing',
                'subscribed_at' => now(),
            ]
        );

        if (!$subscription->subscribed) {
            $subscription->update([
                'subscribed' => true,
                'subscribed_at' => now(),
                'unsubscribed_at' => null,
            ]);
        }

        return response()->json([
            'message' => 'Successfully subscribed to newsletter.',
        ], 201);
    }

    public function unsubscribe(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email|max:255|exists:newsletter_subscriptions,email',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $subscription = NewsletterSubscription::where('email', $request->email)->first();
        $subscription->update([
            'subscribed' => false,
            'unsubscribed_at' => now(),
        ]);

        return response()->json(['message' => 'Successfully unsubscribed.']);
    }
}
