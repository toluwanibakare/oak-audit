<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class AuditModel extends Model
{
    use HasUuids;

    protected $table = 'audits';

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'started_at' => 'datetime',
        'closed_at' => 'datetime',
    ];

    protected $fillable = [
        'org_id',
        'title',
        'standard',
        'status',
        'scope',
        'criteria',
        'object',
        'conclusion',
        'start_date',
        'end_date',
        'started_at',
        'closed_at',
        'owner',
        'auditee_name',
        'auditee_email',
        'created_by',
        'lead_auditor_id',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class, 'org_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function leadAuditor()
    {
        return $this->belongsTo(Auditor::class, 'lead_auditor_id');
    }

    public function findings()
    {
        return $this->hasMany(Finding::class, 'audit_id');
    }

    public function answers()
    {
        return $this->hasMany(AuditAnswer::class, 'audit_id');
    }

    public function processes()
    {
        return $this->hasMany(AuditProcess::class, 'audit_id');
    }
}
