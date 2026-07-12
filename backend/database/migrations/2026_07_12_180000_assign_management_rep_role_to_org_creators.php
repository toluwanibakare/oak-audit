<?php

use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\UserRole;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        $orgs = Organization::all();

        foreach ($orgs as $org) {
            if (!$org->created_by) continue;

            // Add as organization member if not already
            $isMember = OrganizationMember::where('org_id', $org->id)
                ->where('user_id', $org->created_by)
                ->exists();

            if (!$isMember) {
                OrganizationMember::create([
                    'id' => (string) Str::uuid(),
                    'org_id' => $org->id,
                    'user_id' => $org->created_by,
                    'status' => 'Active',
                ]);
            }

            // Assign Management Representative role if not already
            $hasRole = UserRole::where('org_id', $org->id)
                ->where('user_id', $org->created_by)
                ->exists();

            if (!$hasRole) {
                UserRole::create([
                    'org_id' => $org->id,
                    'user_id' => $org->created_by,
                    'role' => 'Management Representative',
                ]);
            }
        }
    }

    public function down(): void
    {
        $orgs = Organization::all();

        foreach ($orgs as $org) {
            OrganizationMember::where('org_id', $org->id)
                ->where('user_id', $org->created_by)
                ->delete();

            UserRole::where('org_id', $org->id)
                ->where('user_id', $org->created_by)
                ->where('role', 'Management Representative')
                ->delete();
        }
    }
};
