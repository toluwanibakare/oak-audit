<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Auditor extends Model
{
    use HasUuids;

    protected $fillable = [
        'org_id',
        'name',
        'email',
        'user_id',
        'role',
        'certifications',
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
