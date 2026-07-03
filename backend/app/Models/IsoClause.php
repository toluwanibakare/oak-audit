<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class IsoClause extends Model
{
    use HasUuids;

    protected $fillable = [
        'standard',
        'clause',
        'title',
        'requirement',
    ];
}
