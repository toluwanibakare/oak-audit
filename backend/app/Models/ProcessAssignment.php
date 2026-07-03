<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ProcessAssignment extends Model
{
    use HasUuids;

    protected $fillable = [
        'org_id',
        'process_id',
        'auditor_id',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class, 'org_id');
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
