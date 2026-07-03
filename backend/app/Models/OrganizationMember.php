<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class OrganizationMember extends Model
{
    use HasUuids;

    protected $fillable = [
        'org_id',
        'user_id',
        'invited_email',
        'status',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class, 'org_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
