<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLicense;
use App\Models\CreditTransaction;
use App\Models\CreditWallet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    public function wallet(string $orgId): JsonResponse
    {
        $wallet = CreditWallet::firstOrCreate(['org_id' => $orgId]);
        return response()->json($wallet);
    }

    public function transactions(string $orgId): JsonResponse
    {
        $txns = CreditTransaction::where('org_id', $orgId)
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();
        return response()->json($txns);
    }

    public function licenses(string $orgId): JsonResponse
    {
        $licenses = AuditLicense::where('org_id', $orgId)->get();
        return response()->json($licenses);
    }

}
