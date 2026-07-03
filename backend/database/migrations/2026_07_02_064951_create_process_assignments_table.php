<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('process_assignments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('org_id');
            $table->uuid('process_id');
            $table->uuid('auditor_id');
            $table->timestamps();
            $table->foreign('org_id')->references('id')->on('organizations')->onDelete('cascade');
            $table->foreign('process_id')->references('id')->on('org_processes')->onDelete('cascade');
            $table->foreign('auditor_id')->references('id')->on('auditors')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('process_assignments');
    }
};
