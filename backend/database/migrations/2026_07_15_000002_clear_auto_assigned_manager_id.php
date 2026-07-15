<?php

use App\Models\Organization;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        // Clear auto-assigned manager_id that was set to the org creator (MR)
        // Manager must be explicitly assigned — different from MR
        Organization::whereNotNull('manager_id')
            ->whereColumn('manager_id', 'created_by')
            ->update(['manager_id' => null]);
    }

    public function down(): void
    {
        // Can't restore — no-op
    }
};
