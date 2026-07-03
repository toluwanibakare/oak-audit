<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audits', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('org_id');
            $table->string('title');
            $table->string('standard', 100);
            $table->string('status', 50)->default('draft');
            $table->text('scope')->nullable();
            $table->text('criteria')->nullable();
            $table->text('object')->nullable();
            $table->text('conclusion')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->string('owner')->nullable();
            $table->string('auditee_name')->nullable();
            $table->string('auditee_email')->nullable();
            $table->uuid('created_by');
            $table->uuid('lead_auditor_id')->nullable();
            $table->timestamps();
            $table->foreign('org_id')->references('id')->on('organizations')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('lead_auditor_id')->references('id')->on('auditors')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audits');
    }
};
