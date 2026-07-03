<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class CreditTransaction extends Model
{
    use HasUuids;

    protected $fillable = [
        'org_id',
        'kind',
        'credits',
        'naira_amount',
        'pack',
        'reference',
        'audit_license_id',
        'created_by',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class, 'org_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
