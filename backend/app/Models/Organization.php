<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Organization extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'type',
        'industry',
        'address',
        'logo_url',
        'settings',
        'created_by',
        'manager_id',
    ];

    protected $appends = ['manager_name', 'manager_email'];

    protected function casts(): array
    {
        return [
            'settings' => 'array',
        ];
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    public function getManagerNameAttribute()
    {
        return $this->manager ? $this->manager->full_name : null;
    }

    public function getManagerEmailAttribute()
    {
        return $this->manager ? $this->manager->email : null;
    }

    public function members()
    {
        return $this->hasMany(OrganizationMember::class, 'org_id');
    }

    public function roles()
    {
        return $this->hasMany(UserRole::class, 'org_id');
    }

    public function auditors()
    {
        return $this->hasMany(Auditor::class, 'org_id');
    }

    public function processes()
    {
        return $this->hasMany(OrgProcess::class, 'org_id');
    }

    public function audits()
    {
        return $this->hasMany(AuditModel::class, 'org_id');
    }

    public function findings()
    {
        return $this->hasMany(Finding::class, 'org_id');
    }

    public function wallet()
    {
        return $this->hasOne(CreditWallet::class, 'org_id');
    }
}
