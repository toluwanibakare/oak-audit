<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class AuditLicense extends Model
{
    use HasUuids;

    protected $fillable = [
        'org_id',
        'pack',
        'paid_amount_ngn',
        'paystack_ref',
        'active',
        'purchased_at',
        'expires_at',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class, 'org_id');
    }
}
