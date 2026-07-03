<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VerificationOtp extends Model
{
    protected $fillable = [
        'email',
        'otp',
        'type',
        'expires_at',
        'used_at',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'used_at' => 'datetime',
        ];
    }

    public function scopeValid($query, string $email, string $otp, string $type)
    {
        return $query
            ->where('email', $email)
            ->where('otp', $otp)
            ->where('type', $type)
            ->whereNull('used_at')
            ->where('expires_at', '>', now());
    }
}
