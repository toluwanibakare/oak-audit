<?php

use App\Models\EntityData;
use App\Models\Organization;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Str;

return new class extends Migration
{
    private array $defaultRoles = [
        [
            'name' => 'Management Representative',
            'scope' => 'Global',
            'description' => 'Full platform administration and configuration access.',
            'status' => 'Active',
            'members' => 0,
        ],
        [
            'name' => 'Lead Auditor',
            'scope' => 'Global',
            'description' => 'Plan and lead audits, review findings, approve CAPAs.',
            'status' => 'Active',
            'members' => 0,
        ],
        [
            'name' => 'Auditor',
            'scope' => 'Audits',
            'description' => 'Execute audits, log findings, submit evidence.',
            'status' => 'Active',
            'members' => 0,
        ],
        [
            'name' => 'Viewer',
            'scope' => 'Read-only',
            'description' => 'Read-only access to dashboards, reports, and records.',
            'status' => 'Active',
            'members' => 0,
        ],
    ];

    private array $defaultPermissions = [
        'Management Representative' => [
            'Audits' => 3, 'Findings' => 3, 'Corrective Actions' => 3,
            'Risk' => 3, 'Reports' => 3, 'Organization' => 3, 'Users' => 3, 'Settings' => 3,
        ],
        'Lead Auditor' => [
            'Audits' => 3, 'Findings' => 3, 'Corrective Actions' => 2,
            'Risk' => 1, 'Reports' => 1, 'Organization' => 1, 'Users' => 0, 'Settings' => 0,
        ],
        'Auditor' => [
            'Audits' => 2, 'Findings' => 2, 'Corrective Actions' => 1,
            'Risk' => 1, 'Reports' => 1, 'Organization' => 0, 'Users' => 0, 'Settings' => 0,
        ],
        'Viewer' => [
            'Audits' => 1, 'Findings' => 1, 'Corrective Actions' => 1,
            'Risk' => 1, 'Reports' => 1, 'Organization' => 1, 'Users' => 0, 'Settings' => 0,
        ],
    ];

    public function up(): void
    {
        $orgs = Organization::all();

        foreach ($orgs as $org) {
            foreach ($this->defaultRoles as $role) {
                $exists = EntityData::where('org_id', $org->id)
                    ->where('entity_type', 'roles')
                    ->where('data->name', $role['name'])
                    ->exists();

                if (!$exists) {
                    EntityData::create([
                        'id' => (string) Str::uuid(),
                        'org_id' => $org->id,
                        'entity_type' => 'roles',
                        'data' => $role,
                    ]);
                }
            }

            foreach ($this->defaultPermissions as $roleName => $modules) {
                $roleData = EntityData::where('org_id', $org->id)
                    ->where('entity_type', 'roles')
                    ->where('data->name', $roleName)
                    ->first();

                if (!$roleData) continue;

                foreach ($modules as $module => $level) {
                    $permId = "{$roleName}__{$module}";
                    $exists = EntityData::where('org_id', $org->id)
                        ->where('entity_type', 'permissions')
                        ->where('data->role', $roleName)
                        ->where('data->module', $module)
                        ->exists();

                    if (!$exists) {
                        EntityData::create([
                            'id' => (string) Str::uuid(),
                            'org_id' => $org->id,
                            'entity_type' => 'permissions',
                            'data' => [
                                'id' => $permId,
                                'role' => $roleName,
                                'module' => $module,
                                'level' => $level,
                            ],
                        ]);
                    }
                }
            }
        }
    }

    public function down(): void
    {
        $orgs = Organization::all();
        $roleNames = array_column($this->defaultRoles, 'name');

        foreach ($orgs as $org) {
            EntityData::where('org_id', $org->id)
                ->where('entity_type', 'roles')
                ->whereIn('data->name', $roleNames)
                ->delete();

            EntityData::where('org_id', $org->id)
                ->where('entity_type', 'permissions')
                ->whereIn('data->role', $roleNames)
                ->delete();
        }
    }
};
