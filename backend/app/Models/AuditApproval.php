<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class AuditApproval extends Model
{
    use HasUuids;

    protected $table = 'audit_approvals';

    protected $fillable = [
        'audit_id',
        'stage',
        'approver_name',
        'approver_email',
        'is_required',
        'sort_order',
        'status',
        'comment',
        'notified_at',
        'responded_at',
    ];

    protected function casts(): array
    {
        return [
            'is_required' => 'boolean',
            'notified_at' => 'datetime',
            'responded_at' => 'datetime',
        ];
    }

    public function audit()
    {
        return $this->belongsTo(AuditModel::class, 'audit_id');
    }
}
