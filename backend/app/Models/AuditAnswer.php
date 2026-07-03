<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class AuditAnswer extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'audit_id',
        'process_id',
        'clause',
        'kind',
        'q_ref',
        'question_text',
        'status',
        'severity',
        'note',
        'auditee_name',
        'auditor_name',
    ];

    public function audit()
    {
        return $this->belongsTo(AuditModel::class, 'audit_id');
    }

    public function process()
    {
        return $this->belongsTo(OrgProcess::class, 'process_id');
    }
}
