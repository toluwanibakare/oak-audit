<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class SupportTicket extends Model
{
    use HasUuids;

    protected $fillable = [
        'org_id',
        'user_id',
        'name',
        'email',
        'subject',
        'message',
        'category',
        'status',
        'response',
        'responded_at',
        'responded_by',
    ];

    protected function casts(): array
    {
        return [
            'responded_at' => 'datetime',
        ];
    }
}
