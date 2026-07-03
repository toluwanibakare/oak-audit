<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class CreditWallet extends Model
{
    protected $primaryKey = 'org_id';
    public $incrementing = false;

    protected $fillable = [
        'org_id',
        'balance',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class, 'org_id');
    }
}
