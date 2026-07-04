<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class OrgProcess extends Model
{
    use HasUuids;

    protected $table = 'org_processes';

    protected $fillable = [
        'org_id',
        'name',
        'key',
        'scope',
        'is_custom',
        'process_owner',
        'process_owner_email',
    ];

    protected function casts(): array
    {
        return [
            'is_custom' => 'boolean',
        ];
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class, 'org_id');
    }
}
