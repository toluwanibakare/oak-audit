<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    use HasUuids;

    protected $fillable = [
        'id',
        'full_name',
        'avatar_url',
        'job_title',
        'phone',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'id');
    }
}
