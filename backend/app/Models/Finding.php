<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Finding extends Model
{
    use HasUuids;

    protected $fillable = [
        'org_id',
        'audit_id',
        'type',
        'clause',
        'description',
        'capa',
        'owner',
        'status',
        'due_date',
        'root_cause',
        'auditor_comment',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class, 'org_id');
    }

    public function audit()
    {
        return $this->belongsTo(AuditModel::class, 'audit_id');
    }
}
