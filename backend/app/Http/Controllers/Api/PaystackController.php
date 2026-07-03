<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\TicketSubmittedMail;
use App\Models\AuditLicense;
use App\Models\AuditModel;
use App\Models\PaystackTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;

class PaystackController extends Controller
{
    protected string $secretKey;

    public function __construct()
    {
        $this->secretKey = config('services.paystack.secret_key');
    }

    public function initiate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'org_id' => 'required|string|exists:organizations,id',
            'pack' => 'required|string',
            'user_count' => 'nullable|integer|min:1',
            'email' => 'required|email',
            'audit_title' => 'required|string|max:255',
            'audit_criteria' => 'nullable|string',
            'audit_scope' => 'nullable|string',
            'audit_object' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'audit_owner' => 'nullable|string|max:255',
            'auditee_name' => 'required|string|max:255',
            'auditee_email' => 'required|email',
            'lead_auditor_id' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Compute price (same matrix as frontend)
        $price = $this->computePrice($request->pack, $request->user_count ?? 1);

        // Generate unique reference
        $reference = 'oak_audit_' . $request->pack . '_' . time() . '_' . bin2hex(random_bytes(4));

        // Create pending transaction
        $transaction = PaystackTransaction::create([
            'org_id' => $request->org_id,
            'user_id' => auth('api')->id(),
            'reference' => $reference,
            'amount_ngn' => $price,
            'pack' => $request->pack,
            'status' => 'pending',
            'raw_payload' => $request->all(),
        ]);

        // Call Paystack initialize API
        try {
            $response = Http::withToken($this->secretKey)->post('https://api.paystack.co/transaction/initialize', [
                'email' => $request->email,
                'amount' => $price * 100, // convert to kobo
                'currency' => 'NGN',
                'reference' => $reference,
                'callback_url' => config('services.paystack.callback_url'),
                'metadata' => [
                    'org_id' => $request->org_id,
                    'pack' => $request->pack,
                    'user_count' => $request->user_count,
                    'audit_title' => $request->audit_title,
                    'audit_criteria' => $request->audit_criteria,
                    'audit_scope' => $request->audit_scope,
                    'audit_object' => $request->audit_object,
                    'start_date' => $request->start_date,
                    'end_date' => $request->end_date,
                    'audit_owner' => $request->audit_owner,
                    'auditee_name' => $request->auditee_name,
                    'auditee_email' => $request->auditee_email,
                    'lead_auditor_id' => $request->lead_auditor_id,
                ],
            ]);

            $body = $response->json();

            if (!$response->successful() || !($body['status'] ?? false)) {
                $transaction->update(['status' => 'failed']);
                return response()->json(['error' => $body['message'] ?? 'Paystack initialization failed'], 400);
            }

            return response()->json([
                'authorization_url' => $body['data']['authorization_url'],
                'reference' => $reference,
            ]);
        } catch (\Exception $e) {
            $transaction->update(['status' => 'failed']);
            return response()->json(['error' => 'Could not connect to Paystack'], 500);
        }
    }

    public function verify(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'reference' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Look up transaction
        $transaction = PaystackTransaction::where('reference', $request->reference)->first();

        if (!$transaction) {
            return response()->json(['error' => 'Transaction not found'], 404);
        }

        // Idempotency: already successful
        if ($transaction->status === 'success') {
            return response()->json(['ok' => true, 'message' => 'Already verified']);
        }

        // Verify with Paystack
        try {
            $response = Http::withToken($this->secretKey)
                ->get("https://api.paystack.co/transaction/verify/{$request->reference}");

            $body = $response->json();

            if (!$response->successful() || !($body['status'] ?? false)) {
                $transaction->update(['status' => 'failed']);
                return response()->json(['ok' => false, 'error' => 'Payment verification failed'], 400);
            }

            $ps = $body['data'];
            if ($ps['status'] !== 'success') {
                $transaction->update(['status' => 'failed']);
                return response()->json(['ok' => false, 'error' => 'Payment not successful'], 400);
            }

            // Extract metadata
            $metadata = $ps['metadata'] ?? [];
            $orgId = $metadata['org_id'] ?? $transaction->org_id;

            // Create audit
            $audit = AuditModel::create([
                'org_id' => $orgId,
                'title' => $metadata['audit_title'] ?? ($transaction->pack . ' Audit'),
                'standard' => $transaction->pack,
                'status' => 'draft',
                'scope' => $metadata['audit_scope'] ?? null,
                'criteria' => $metadata['audit_criteria'] ?? null,
                'object' => $metadata['audit_object'] ?? null,
                'start_date' => $metadata['start_date'] ?? null,
                'end_date' => $metadata['end_date'] ?? null,
                'owner' => $metadata['audit_owner'] ?? null,
                'auditee_name' => $metadata['auditee_name'] ?? null,
                'auditee_email' => $metadata['auditee_email'] ?? null,
                'lead_auditor_id' => $metadata['lead_auditor_id'] ?? null,
                'created_by' => auth('api')->id(),
            ]);

            // Create license (expires in 7 days)
            $license = AuditLicense::create([
                'org_id' => $orgId,
                'pack' => $transaction->pack,
                'paid_amount_ngn' => $transaction->amount_ngn,
                'paystack_ref' => $request->reference,
                'active' => true,
                'purchased_at' => now(),
                'expires_at' => now()->addDays(7),
            ]);

            // Update transaction
            $transaction->update([
                'status' => 'success',
                'raw_payload' => array_merge($transaction->raw_payload ?? [], ['paystack_response' => $ps]),
            ]);

            return response()->json([
                'ok' => true,
                'audit_id' => $audit->id,
            ]);
        } catch (\Exception $e) {
            return response()->json(['ok' => false, 'error' => 'Verification request failed'], 500);
        }
    }

    protected function computePrice(string $pack, int $userCount): int
    {
        // Mirroring src/lib/pricing.ts PACK_TIER_PRICES
        $prices = [
            '9001' => [1 => 500000, 5 => 500000, 15 => 1000000, 999 => 1500000],
            '14001' => [1 => 500000, 5 => 500000, 15 => 1000000, 999 => 1500000],
            '45001' => [1 => 500000, 5 => 500000, 15 => 1000000, 999 => 1500000],
            '27001' => [1 => 500000, 5 => 500000, 15 => 1000000, 999 => 1500000],
            'hse' => [1 => 1000000, 5 => 1000000, 15 => 1500000, 999 => 2000000],
            'ims' => [1 => 1500000, 5 => 1500000, 15 => 2000000, 999 => 2500000],
        ];

        $tiers = $prices[$pack] ?? $prices['9001'];

        if ($userCount <= 5) return $tiers[1];
        if ($userCount <= 15) return $tiers[15];
        return $tiers[999];
    }
}
