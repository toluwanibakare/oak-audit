<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('org_processes', function (Blueprint $table) {
            $table->string('process_owner_email')->nullable()->after('process_owner');
        });
    }

    public function down(): void
    {
        Schema::table('org_processes', function (Blueprint $table) {
            $table->dropColumn('process_owner_email');
        });
    }
};
