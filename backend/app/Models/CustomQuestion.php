<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class CustomQuestion extends Model
{
    use HasUuids;

    protected $fillable = [
        'org_id',
        'standard',
        'clause',
        'text',
        'kind',
        'process_key',
        'reference',
        'evidence',
        'active',
        'created_by',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class, 'org_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
