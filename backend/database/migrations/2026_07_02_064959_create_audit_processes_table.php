<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_processes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('audit_id');
            $table->uuid('process_id');
            $table->uuid('auditor_id')->nullable();
            $table->timestamps();
            $table->foreign('audit_id')->references('id')->on('audits')->onDelete('cascade');
            $table->foreign('process_id')->references('id')->on('org_processes')->onDelete('cascade');
            $table->foreign('auditor_id')->references('id')->on('auditors')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_processes');
    }
};
