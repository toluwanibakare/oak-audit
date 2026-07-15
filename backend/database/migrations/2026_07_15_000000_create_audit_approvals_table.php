<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_approvals', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('audit_id');
            $table->string('stage'); // MR, Lead Auditor, Auditee/Process Owner
            $table->string('approver_name')->nullable();
            $table->string('approver_email')->nullable();
            $table->boolean('is_required')->default(true);
            $table->integer('sort_order')->default(0);
            $table->string('status', 50)->default('pending'); // pending, notified, in_review, approved, rejected
            $table->text('comment')->nullable();
            $table->timestamp('notified_at')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->timestamps();

            $table->foreign('audit_id')->references('id')->on('audits')->cascadeOnDelete();
            $table->index('audit_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_approvals');
    }
};
