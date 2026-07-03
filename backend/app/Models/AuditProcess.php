<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class AuditProcess extends Model
{
    use HasUuids;

    protected $fillable = [
        'audit_id',
        'process_id',
        'auditor_id',
    ];

    public function audit()
    {
        return $this->belongsTo(AuditModel::class, 'audit_id');
    }

    public function process()
    {
        return $this->belongsTo(OrgProcess::class, 'process_id');
    }

    public function auditor()
    {
        return $this->belongsTo(Auditor::class, 'auditor_id');
    }
}
